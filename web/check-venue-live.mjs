// Live venue checks: the REAL venue app (web/v3/venue.jsx), logged in, against an in-memory fake Supabase.
//
//   node web/check-venue-live.mjs      (from the repo root)      node check-venue-live.mjs      (from web/)
//
// Needs the Vite dev server (npm run dev) at BASE_URL, default http://127.0.0.1:5173.
// Env: BASE_URL, ONLY=2,6 (run some scenarios), HEADED=1, DEBUG=1, PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH.
//
// Nothing reaches the real Supabase project. Every *.supabase.co HTTP request is answered with route.fulfill
// (never continue), the realtime socket is fully mocked, and Chromium resolves *.supabase.co to nothing, so a
// request the routes somehow miss fails instead of reaching production. Each scenario gets a fresh seeded
// database. Two phones in one scenario share that database. Failure screenshots go to <tmp>/check-venue-live/.
import assert from "node:assert/strict";
import { randomUUID, randomBytes } from "node:crypto";
import { existsSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://127.0.0.1:5173";
const VIEWPORT = { width: 390, height: 844 };
const STORAGE_KEY = "sb-zrbakomzpuesifasuamb-auth-token";
const CHROME = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
  || "C:/Users/user/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe";
const SHOTS = join(tmpdir(), "check-venue-live");
const MIN = 60e3, H = 60 * MIN, D = 24 * H;
const escapeRe = text => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* =====================================================================================================
 * UI CONTRACT. Every selector the scenarios use lives here. Adjust names here when the UI changes.
 * ===================================================================================================== */
const UI = {
  nav: page => page.getByRole("navigation", { name: "Venue navigation", exact: true }),
  tab: (page, name) => UI.nav(page).getByRole("button", { name, exact: true }),
  tabs: { home: "Home", events: "Events", venue: "Venue" },
  button: (scope, name) => scope.getByRole("button", { name, exact: true }),
  // Home task buttons: accessible name is the verb, optionally followed by ", <event title>".
  task: (page, label, title) => page.getByRole("button", { name: new RegExp(`^${escapeRe(label)}(, ${escapeRe(title)})?$`) }),
  // Toasts render in role="status". Empty live regions are ignored.
  toast: page => page.getByRole("status").filter({ hasText: /\S/ }),
  home: {
    openDoorList: "Open door list", pickReplacement: "Pick a replacement", startPicking: "Start picking",
    seeEvent: "See event", seeSummary: "See summary", finishPosting: "Finish posting",
    activity: "Activity", newEvent: "New event",
  },
  event: {
    back: "Back", pickPeople: "Pick people", pickReplacement: "Pick a replacement", openDoorList: "Open door list",
    seeSummary: "See summary", closeRequests: "Close requests", cancelEvent: "Cancel event", editEvent: "Edit event",
  },
  deck: {
    // The draggable card: role group, accessible name starts with the applicant name.
    card: page => page.getByRole("group", { name: /drag right to pick/i }),
    cardOf: (page, name) => page.getByRole("group", { name: new RegExp(`^${name}\\b.*drag right to pick`, "i") }),
    pick: name => `Pick ${name}`,
    pass: name => `Pass on ${name}`,
    view: name => `View ${name}`,
    undoPass: page => page.getByRole("button", { name: /^Undo pass/ }),
    anyUndo: page => page.getByRole("button", { name: /^Undo/ }),
    end: "You've seen everyone.",
    done: "Done",
  },
  door: {
    title: page => page.getByText("Door list", { exact: true }).first(),
    search: page => page.getByRole("textbox", { name: "Search guests" }),
    checkIn: name => `Here, check in ${name}`,
    counter: page => page.getByText(/\d+ of \d+ inside/).first(),
    counterPattern: /(\d+) of (\d+) inside/,
    closeNight: "Close the event",          // the door list button AND the confirm button inside the dialog
    dialog: page => page.getByRole("dialog"),
    notCheckedIn: /(\d+) confirmed guests? (?:hasn't|haven't) checked in/,
    everyoneInside: "No confirmed guests are left to check in",
    notNow: "Not now",
  },
  summary: {
    optional: page => page.getByText("Rate guests (optional)", { exact: true }),
    great: name => `Great for ${name}`,     // saved as 9
    fine: name => `Fine for ${name}`,       // saved as 6
    problem: name => `Problem for ${name}`, // saved as 3
  },
  form: {
    name: page => page.getByLabel("Event name", { exact: true }),
    date: page => page.getByLabel("Date", { exact: true }),
    startTime: page => page.getByLabel("Start time", { exact: true }),
    closeTime: page => page.getByLabel("Pick a close time", { exact: true }),
    dayBefore: "1 day before",
    pickTime: "Pick a time",
    passed: page => page.getByText(/already passed/).first(),
    post: "Post event",
  },
};

/* =====================================================================================================
 * SEED. Times are relative to now. Names are unique, so tests look people up by first name.
 * ===================================================================================================== */
const UID = "0a000000-0000-4000-8000-000000000001";
const VID = "0b000000-0000-4000-8000-000000000001";
const E1 = "0e000000-0000-4000-8000-000000000001"; // Late Lounge: published, 5 applied
const E2 = "0e000000-0000-4000-8000-000000000002"; // Pool Day: locked, started 1 hour ago
const E3 = "0e000000-0000-4000-8000-000000000003"; // Sound Bath: closed 3 days ago
const iso = ms => new Date(ms).toISOString();
const DECK_E1 = ["Ana", "Bea", "Cara", "Dana", "Eli"];
const MEDIA_URL = "https://zrbakomzpuesifasuamb.supabase.co/storage/v1/object/public/media/stories/nour.jpg";

function seedDb(now = Date.now()) {
  const db = {
    profiles: [{ id: UID, role: "venue", full_name: "Door Test", ig_handle: null, avatar_url: null, creator_data: null, reputation: null }],
    venues: [{ id: VID, owner_id: UID, name: "Test Room", kind: "Lounge", area: "Mar Mikhael",
      description: "A room for live checks.", image_url: null, gallery: [], ig_handle: "testroom" }],
    events: [], applications: [], stories: [], bookings: [], notifications: [],
  };
  const event = (id, title, status, startsAt, extra) => db.events.push({
    id, venue_id: VID, title, kind: "Lounge", description: `${title} test night.`, image_url: null,
    starts_at: iso(startsAt), ends_at: iso(startsAt + 4 * H), closes_at: iso(startsAt - D), seats: 6,
    bundle_price: 700, bundle: "The twenty", story_window_hours: 24, mix_girls: null, mix_guys: null,
    brief: null, status, created_at: iso(now - 10 * D), ...extra,
  });
  let n = 0;
  const guest = (eventId, name, gender, status, extra = {}) => {
    n++;
    const tail = String(n).padStart(12, "0");
    const user = `0c000000-0000-4000-8000-${tail}`, app = `0d000000-0000-4000-8000-${tail}`;
    db.profiles.push({ id: user, role: "member", full_name: name, ig_handle: `${name.toLowerCase()}.test`, avatar_url: null,
      creator_data: { followers_count: 4000 + n * 1370, gender, quality_score: 60 + n }, reputation: null });
    db.applications.push({ id: app, event_id: eventId, user_id: user, status, pass_code: null, pick_expires_at: null,
      checked_in_at: null, rating: null, created_at: iso(now - 5 * D + n * MIN), ...extra });
    return app;
  };
  const code = () => `LST-${(0xA000 + n + 1).toString(16).toUpperCase()}`;

  event(E1, "Late Lounge", "published", now + 3 * D, { closes_at: iso(now + 2 * D), seats: 4, bundle: "The twenty", bundle_price: 700 });
  for (const [name, gender] of [["Ana", "female"], ["Bea", "female"], ["Cara", "female"], ["Dana", "female"], ["Eli", "male"]]) {
    guest(E1, name, gender, "applied");
  }

  event(E2, "Pool Day", "locked", now - H, { closes_at: iso(now - D), seats: 6 });
  for (const name of ["Farah", "Gia", "Hana", "Iman"]) guest(E2, name, "female", "confirmed", { pass_code: code() });
  guest(E2, "Jad", "male", "picked", { pass_code: code(), pick_expires_at: iso(now + 20 * H) });
  guest(E2, "Kim", "female", "expired");
  guest(E2, "Lea", "female", "waitlist");
  guest(E2, "Mia", "female", "waitlist");

  const e3Start = now - 3 * D;
  event(E3, "Sound Bath", "closed", e3Start, { seats: 3, bundle: "The ten", bundle_price: 400 });
  const nour = guest(E3, "Nour", "female", "checked_in", { pass_code: code(), checked_in_at: iso(e3Start + H) });
  const omar = guest(E3, "Omar", "male", "checked_in", { pass_code: code(), checked_in_at: iso(e3Start + H + 10 * MIN) });
  guest(E3, "Pia", "female", "no_show", { pass_code: code() });
  db.stories.push(
    { id: randomUUID(), application_id: nour, verdict: "verified", media_url: MEDIA_URL, due_at: iso(e3Start + 25 * H), score: 9, reason: null, created_at: iso(e3Start + 5 * H) },
    { id: randomUUID(), application_id: omar, verdict: "pending", media_url: null, due_at: iso(e3Start + 25 * H), score: null, reason: null, created_at: iso(e3Start + H) },
  );
  db.bookings.push({ id: randomUUID(), event_id: E3, venue_id: VID, bundle_price: 400, invoice_status: "pending", created_at: iso(e3Start + 5 * H) });
  db.notifications.push(
    { id: randomUUID(), user_id: UID, kind: "story_submitted", title: "Nour posted her Story", body: "Sound Bath", event_id: E3, read: false, created_at: iso(now - 2 * D) },
    { id: randomUUID(), user_id: UID, kind: "pick_confirmed", title: "Farah confirmed", body: "Pool Day", event_id: E2, read: true, created_at: iso(now - 4 * D) },
  );
  return db;
}

/* =====================================================================================================
 * FAKE SUPABASE: PostgREST reads and writes, RPCs with the live backend's rules, storage, auth, realtime.
 * ===================================================================================================== */
class RpcError extends Error {}
const fail = message => { throw new RpcError(message); };
const EVENT_ARGS = {
  p_title: "title", p_kind: "kind", p_description: "description", p_image: "image_url", p_starts: "starts_at",
  p_ends: "ends_at", p_seats: "seats", p_price: "bundle_price", p_story_hours: "story_window_hours",
  p_closes_at: "closes_at", p_mix_girls: "mix_girls", p_mix_guys: "mix_guys", p_brief: "brief", p_bundle: "bundle",
};
const eventFields = args => Object.fromEntries(Object.entries(EVENT_ARGS).filter(([arg]) => arg in args).map(([arg, column]) => [column, args[arg]]));

// Mirrors the live database functions: statuses, guards and exact error messages.
const RPCS = {
  post_event(fake, a) {
    const venue = fake.db.venues.find(v => v.owner_id === UID);
    const row = { ...Object.fromEntries(Object.values(EVENT_ARGS).map(column => [column, null])), ...eventFields(a),
      id: randomUUID(), venue_id: venue.id, status: a.p_draft ? "draft" : "published", created_at: iso(Date.now()) };
    fake.db.events.push(row);
    return row.id;
  },
  update_event(fake, a) {
    const event = fake.event(a.p_event);
    if (!event || !["draft", "published"].includes(event.status)) fail("not editable");
    Object.assign(event, eventFields(a));
    if (a.p_publish && event.status === "draft") event.status = "published";
  },
  delete_event(fake, a) {
    const event = fake.event(a.p_event);
    if (!event || event.status !== "draft") fail("only drafts can be deleted");
    fake.db.events = fake.db.events.filter(row => row !== event);
  },
  cancel_event(fake, a) {
    const event = fake.event(a.p_event);
    if (!event || !["draft", "published", "locked"].includes(event.status)) fail("not cancellable");
    event.status = "cancelled";
    for (const app of fake.appsOf(event.id)) if (["applied", "waitlist", "picked", "confirmed"].includes(app.status)) app.status = "cancelled";
  },
  pick_applicant(fake, a) {
    const app = fake.application(a.p_app);
    if (!app || !["applied", "waitlist"].includes(app.status)) fail("not pickable");
    Object.assign(app, { status: "picked", pick_expires_at: iso(Date.now() + D), pass_code: `LST-${randomBytes(2).toString("hex").toUpperCase()}` });
  },
  skip_applicant() { return null; },
  close_applications(fake, a) {
    const event = fake.event(a.p_event);
    if (event?.status !== "published") return;
    event.status = "locked";
    for (const app of fake.appsOf(event.id)) if (app.status === "applied") app.status = "waitlist";
  },
  check_in(fake, a) {
    const app = fake.application(a.p_app);
    if (!app || app.status !== "confirmed") fail("not checkable");
    const now = Date.now();
    Object.assign(app, { status: "checked_in", checked_in_at: iso(now) });
    const hours = Number(fake.event(app.event_id)?.story_window_hours || 24);
    fake.db.stories.push({ id: randomUUID(), application_id: app.id, verdict: "pending", media_url: null,
      due_at: iso(now + hours * H), score: null, reason: null, created_at: iso(now) });
  },
  mark_no_show(fake, a) {
    const app = fake.application(a.p_app);
    if (!app || app.status !== "confirmed") fail("not markable");
    app.status = "no_show";
  },
  rate_guest(fake, a) {
    const rating = a.p_rating;
    if (rating == null || typeof rating !== "number" || rating < 0 || rating > 10) fail("rating 0-10");
    const app = fake.application(a.p_app);
    if (!app || !["checked_in", "no_show"].includes(app.status)) fail("not rateable");
    app.rating = rating;
  },
  close_event(fake, a) {
    const event = fake.event(a.p_event);
    if (!event || event.status !== "locked") fail("lock applications before closing the night");
    if (Date.parse(event.starts_at) > Date.now()) fail("the night has not started");
    event.status = "closed";
    for (const app of fake.appsOf(event.id)) {
      if (["applied", "waitlist"].includes(app.status)) app.status = "not_selected";
      else if (app.status === "confirmed") app.status = "no_show";
    }
    fake.db.bookings.push({ id: randomUUID(), event_id: event.id, venue_id: event.venue_id, bundle_price: event.bundle_price,
      invoice_status: "pending", created_at: iso(Date.now()) });
  },
};

// Embeds the app may request: table -> embed -> [one|many, key, target table].
const RELATIONS = {
  applications: { profiles: ["one", "user_id", "profiles"], events: ["one", "event_id", "events"], stories: ["many", "application_id", "stories"] },
  events: { venues: ["one", "venue_id", "venues"], applications: ["many", "event_id", "applications"], bookings: ["many", "event_id", "bookings"] },
  stories: { applications: ["one", "application_id", "applications"] },
  bookings: { events: ["one", "event_id", "events"], venues: ["one", "venue_id", "venues"] },
  venues: { events: ["many", "venue_id", "events"], profiles: ["one", "owner_id", "profiles"] },
  notifications: { events: ["one", "event_id", "events"] },
};
const RESERVED_PARAMS = new Set(["select", "order", "limit", "offset", "on_conflict", "columns"]);
const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "GET,HEAD,POST,PATCH,PUT,DELETE,OPTIONS",
  "access-control-expose-headers": "content-range, content-profile, x-supabase-api-version",
};
const PNG_1PX = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");
const isSupabase = url => /(^|\.)supabase\.co$/i.test(url.hostname);
const pgError = (status, code, message, details = null) => ({ status, json: { code, message, details, hint: null } });

function parseSelect(text) {
  const parts = [];
  let depth = 0, current = "";
  for (const ch of text) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) { parts.push(current); current = ""; } else current += ch;
  }
  parts.push(current);
  return parts.map(part => part.trim()).filter(Boolean).map(part => {
    if (part === "*") return { star: true };
    const match = part.match(/^(?:(\w+):)?(\w+)(?:!\w+)*(?:\(([\s\S]*)\))?(?:::\w+)?$/);
    if (!match) throw new Error(`fake cannot parse select item "${part}"`);
    const [, alias, name, inner] = match;
    return inner !== undefined ? { embed: name, alias: alias || name, fields: parseSelect(inner) } : { column: name, alias: alias || name };
  });
}

function compare(a, b) {
  if (typeof a === "number" && !Number.isNaN(Number(b))) return a - Number(b);
  if (/^\d{4}-\d{2}-\d{2}/.test(String(a)) && !Number.isNaN(Date.parse(b))) return Date.parse(a) - Date.parse(b);
  return String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0;
}

function matches(value, expression) {
  let negate = false, expr = expression;
  if (expr.startsWith("not.")) { negate = true; expr = expr.slice(4); }
  const dot = expr.indexOf(".");
  const op = expr.slice(0, dot), arg = expr.slice(dot + 1);
  let ok;
  switch (op) {
    case "eq": ok = value != null && String(value) === arg; break;
    case "neq": ok = value != null && String(value) !== arg; break;
    case "is": ok = arg === "null" ? value == null : String(value) === arg; break;
    case "in": {
      const list = arg.replace(/^\(|\)$/g, "").split(",").map(item => item.trim().replace(/^"(.*)"$/, "$1")).filter(Boolean);
      ok = value != null && list.includes(String(value)); break;
    }
    case "gt": case "gte": case "lt": case "lte": {
      if (value == null) { ok = false; break; }
      const c = compare(value, arg);
      ok = op === "gt" ? c > 0 : op === "gte" ? c >= 0 : op === "lt" ? c < 0 : c <= 0; break;
    }
    case "like": case "ilike": {
      const pattern = arg.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/[*%]/g, ".*");
      ok = value != null && new RegExp(`^${pattern}$`, op === "ilike" ? "i" : "").test(String(value)); break;
    }
    default: throw new Error(`fake does not support filter operator "${op}"`);
  }
  return negate ? !ok : ok;
}

function orderRows(rows, spec) {
  if (!spec) return rows;
  const keys = spec.split(",").map(part => {
    const [column, ...mods] = part.split(".");
    const desc = mods.includes("desc");
    return { column, desc, nullsFirst: mods.includes("nullsfirst") || (desc && !mods.includes("nullslast")) };
  });
  return [...rows].sort((a, b) => {
    for (const { column, desc, nullsFirst } of keys) {
      const x = a[column], y = b[column];
      if (x == null && y == null) continue;
      if (x == null) return nullsFirst ? -1 : 1;
      if (y == null) return nullsFirst ? 1 : -1;
      const c = compare(x, y);
      if (c) return desc ? -c : c;
    }
    return 0;
  });
}

class FakeSupabase {
  constructor(db) {
    this.db = db;
    this.calls = [];          // RPC calls made by the app: {name, args, phone, at, error, done}
    this.requests = [];       // every served HTTP request: {phone, method, path, search}
    this.failures = new Map(); // rpc name -> queued error messages (failNext)
    this.delays = new Map();   // rpc name -> ms
    this.holds = new Map();    // phone -> {promise, release}: REST reads from that phone wait
    this.sockets = new Set();
    this.nextBinding = 1;
    this.unhandled = [];       // endpoints the fake does not implement
    this.harnessErrors = [];
    this.seen = [];            // every *.supabase.co request the browser made
    this.handled = new Set();  // requests the fake answered
  }

  // ---- lookups and controls for tests ----
  event(id) { return this.db.events.find(row => row.id === id); }
  application(id) { return this.db.applications.find(row => row.id === id); }
  appsOf(eventId) { return this.db.applications.filter(row => row.event_id === eventId); }
  app(name) {
    const profile = this.db.profiles.find(row => row.full_name === name);
    const app = profile && this.db.applications.find(row => row.user_id === profile.id);
    assert(app, `seed has no application for ${name}`);
    return app;
  }
  nameOf(appId) { return this.db.profiles.find(row => row.id === this.application(appId)?.user_id)?.full_name; }
  count(name) { return this.calls.filter(call => call.name === name).length; }
  callsOf(name) { return this.calls.filter(call => call.name === name); }
  last(name) { return this.callsOf(name).at(-1); }
  reads(table) { return this.requests.filter(r => r.method === "GET" && r.path === `/rest/v1/${table}`).length; }
  failNext(name, message) { this.failures.set(name, [...(this.failures.get(name) || []), message]); }
  delay(name, ms) { this.delays.set(name, ms); }
  holdReads(phone) {
    if (this.holds.has(phone)) return;
    let release;
    const promise = new Promise(resolve => { release = resolve; });
    this.holds.set(phone, { promise, release });
  }
  releaseReads(phone) { this.holds.get(phone)?.release(); this.holds.delete(phone); }
  releaseAll() { for (const phone of [...this.holds.keys()]) this.releaseReads(phone); }
  // Runs a database function as the server would, without counting it as an app call.
  server(name, args) { return RPCS[name](this, args); }
  // A member confirms their pick: the venue owner gets a pick_confirmed notification over realtime.
  memberConfirms(name) {
    const app = this.app(name);
    assert.equal(app.status, "picked", `${name} must be picked to confirm`);
    app.status = "confirmed";
    return this.notify({ kind: "pick_confirmed", title: `${name} confirmed`, body: this.event(app.event_id).title, event_id: app.event_id });
  }
  notify(fields) {
    const row = { id: randomUUID(), user_id: UID, kind: "pick_confirmed", title: null, body: null, event_id: null, read: false, created_at: iso(Date.now()), ...fields };
    this.db.notifications.push(row);
    return this.pushInsert("notifications", row);
  }
  subscriptions(table) {
    let total = 0;
    for (const socket of this.sockets) for (const { bindings } of socket.topics.values()) total += bindings.filter(b => b.table === table).length;
    return total;
  }
  escaped() { return this.seen.filter(({ request }) => !this.handled.has(request)).map(({ phone, request }) => `${phone} ${request.method()} ${request.url()}`); }
  problems() {
    return [
      ...this.harnessErrors.map(text => `fake error: ${text}`),
      ...this.unhandled.map(text => `not faked (add it to the fake): ${text}`),
      ...this.escaped().map(text => `escaped the fake: ${text}`),
    ];
  }

  // ---- wiring ----
  async attach(context, phone) {
    context.on("request", request => { if (isSupabase(new URL(request.url()))) this.seen.push({ phone, request }); });
    await context.route(isSupabase, route => this.onRoute(route, phone));
    await context.routeWebSocket(isSupabase, ws => this.onSocket(ws, phone));
  }

  async onRoute(route, phone) {
    const request = route.request();
    this.handled.add(request);
    let response;
    try {
      response = await this.respond(request, phone);
    } catch (error) {
      this.harnessErrors.push(`${phone} ${request.method()} ${request.url()}: ${error.message}`);
      response = pgError(500, "FAKE", `fake supabase: ${error.message}`);
    }
    const headers = { ...CORS, ...(response.headers || {}) };
    let body = response.body;
    if (response.json !== undefined) { body = JSON.stringify(response.json); headers["content-type"] = "application/json; charset=utf-8"; }
    await route.fulfill({ status: response.status, headers, body }).catch(error => {
      if (!/closed|destroyed|disposed/i.test(error.message)) this.harnessErrors.push(`fulfill failed: ${error.message}`);
    });
  }

  async respond(request, phone) {
    const url = new URL(request.url());
    const method = request.method();
    if (method === "OPTIONS") return { status: 204 };
    const path = url.pathname;
    const isRead = method === "GET" || method === "HEAD";
    if (isRead && path.startsWith("/rest/v1/")) {
      while (this.holds.has(phone)) await this.holds.get(phone).promise;
    }
    this.requests.push({ phone, method, path, search: url.search });
    const headers = await request.allHeaders();
    if (path.startsWith("/rest/v1/rpc/")) return this.rpc(path.slice("/rest/v1/rpc/".length), request.postDataJSON() || {}, phone);
    if (path.startsWith("/rest/v1/")) return this.rest(method, path.slice("/rest/v1/".length), url, request, headers);
    if (path.startsWith("/storage/v1/")) return this.storage(method, path, phone);
    if (path.startsWith("/auth/v1/")) return this.auth(method, path);
    this.unhandled.push(`${method} ${path}`);
    return pgError(404, "FAKE404", `fake supabase has no ${method} ${path}`);
  }

  async rpc(name, args, phone) {
    const call = { name, args, phone, at: Date.now(), error: null, done: false };
    this.calls.push(call);
    const queued = this.failures.get(name);
    const failure = queued?.length ? queued.shift() : null;
    const delay = this.delays.get(name) || 0;
    if (delay) await sleep(delay);
    try {
      if (failure) fail(failure);
      if (!RPCS[name]) {
        this.unhandled.push(`rpc ${name}`);
        call.error = "not faked";
        return pgError(404, "PGRST202", `Could not find the function public.${name} in the schema cache`);
      }
      const result = RPCS[name](this, args);
      return result == null ? { status: 204 } : { status: 200, json: result };
    } catch (error) {
      if (!(error instanceof RpcError)) throw error;
      call.error = error.message;
      return pgError(400, "P0001", error.message);
    } finally {
      call.done = true;
    }
  }

  rest(method, table, url, request, headers) {
    if (!this.db[table]) {
      this.unhandled.push(`${method} /rest/v1/${table}`);
      return pgError(404, "PGRST205", `Could not find the table 'public.${table}' in the schema cache`);
    }
    const params = url.searchParams;
    const tests = [];
    for (const [key, value] of params) {
      if (RESERVED_PARAMS.has(key)) continue;
      if (["or", "and", "not"].includes(key) || key.includes(".")) throw new Error(`fake does not support filter ${key}=${value}`);
      tests.push(row => matches(row[key], value));
    }
    const where = row => tests.every(test => test(row));
    const accept = headers.accept || "";
    const prefer = headers.prefer || "";
    const wantsObject = accept.includes("vnd.pgrst.object+json");
    const representation = prefer.includes("return=representation");
    const fields = parseSelect(params.get("select") || "*");
    const shape = rows => rows.map(row => this.project(table, row, fields));
    const result = (rows, status = 200, range = null) => {
      if (wantsObject) {
        if (rows.length !== 1) return pgError(406, "PGRST116", "JSON object requested, multiple (or no) rows returned", `The result contains ${rows.length} rows`);
        return { status, json: rows[0] };
      }
      const extra = range ? { "content-range": `${rows.length ? `${range.offset}-${range.offset + rows.length - 1}` : "*"}/${range.total}` } : {};
      return { status, json: method === "HEAD" ? undefined : rows, headers: extra };
    };
    if (method === "GET" || method === "HEAD") {
      let rows = orderRows(this.db[table].filter(where), params.get("order"));
      const total = rows.length, offset = Number(params.get("offset") || 0);
      rows = rows.slice(offset);
      if (params.has("limit")) rows = rows.slice(0, Number(params.get("limit")));
      return result(shape(rows), 200, prefer.includes("count=") ? { offset, total } : null);
    }
    const body = request.postDataJSON();
    if (method === "PATCH") {
      const hits = this.db[table].filter(where);
      for (const row of hits) Object.assign(row, body);
      return representation ? result(shape(hits)) : { status: 204 };
    }
    if (method === "POST") {
      const inserted = (Array.isArray(body) ? body : [body]).map(row => ({ id: randomUUID(), created_at: iso(Date.now()), ...row }));
      this.db[table].push(...inserted);
      if (table === "notifications") for (const row of inserted) this.pushInsert(table, row);
      return representation ? result(shape(inserted), 201) : { status: 201 };
    }
    if (method === "DELETE") {
      const hits = this.db[table].filter(where);
      this.db[table] = this.db[table].filter(row => !hits.includes(row));
      return representation ? result(shape(hits)) : { status: 204 };
    }
    this.unhandled.push(`${method} /rest/v1/${table}`);
    return pgError(405, "FAKE405", `fake supabase has no ${method} on ${table}`);
  }

  project(table, row, fields) {
    const out = {};
    for (const field of fields) {
      if (field.star) Object.assign(out, structuredClone(row));
      else if (field.column) out[field.alias] = row[field.column] === undefined ? null : structuredClone(row[field.column]);
      else {
        const relation = RELATIONS[table]?.[field.embed];
        if (!relation) throw new Error(`fake has no relation ${table} -> ${field.embed}; add it to RELATIONS`);
        const [kind, key, target] = relation;
        if (kind === "one") {
          const hit = this.db[target].find(other => other.id === row[key]);
          out[field.alias] = hit ? this.project(target, hit, field.fields) : null;
        } else {
          out[field.alias] = this.db[target].filter(other => other[key] === row.id).map(other => this.project(target, other, field.fields));
        }
      }
    }
    return out;
  }

  storage(method, path, phone) {
    const upload = path.match(/^\/storage\/v1\/object\/(?!public\/|sign\/|authenticated\/)([^/]+)\/(.+)$/);
    if (upload && ["POST", "PUT"].includes(method)) {
      this.uploads = [...(this.uploads || []), { phone, bucket: upload[1], path: upload[2] }];
      return { status: 200, json: { Key: `${upload[1]}/${upload[2]}`, Id: randomUUID() } };
    }
    if (method === "GET" && /^\/storage\/v1\/(object|render\/image)\/(public|authenticated|sign)\//.test(path)) {
      return { status: 200, headers: { "content-type": "image/png" }, body: PNG_1PX };
    }
    this.unhandled.push(`${method} ${path}`);
    return { status: 404, json: { statusCode: "404", error: "not_found", message: `fake storage has no ${method} ${path}` } };
  }

  auth(method, path) {
    if (method === "GET" && path === "/auth/v1/user") return { status: 200, json: session().user };
    if (method === "POST" && path === "/auth/v1/token") return { status: 200, json: session() };
    if (method === "POST" && path === "/auth/v1/logout") return { status: 204 };
    this.unhandled.push(`${method} ${path}`);
    return { status: 404, json: { code: 404, error_code: "not_found", msg: `fake auth has no ${method} ${path}` } };
  }

  // Realtime: phoenix protocol vsn 2.0.0 frames are JSON arrays [join_ref, ref, topic, event, payload].
  onSocket(ws, phone) {
    const socket = { ws, phone, topics: new Map() };
    this.sockets.add(socket);
    ws.onMessage(message => {
      try { this.onSocketMessage(socket, message); }
      catch (error) { this.harnessErrors.push(`realtime ${phone}: ${error.message}`); }
    });
    ws.onClose(() => this.sockets.delete(socket));
  }

  onSocketMessage(socket, message) {
    if (typeof message !== "string") return; // binary broadcast pushes are not used by the venue app
    const [joinRef, ref, topic, event, payload] = JSON.parse(message);
    const reply = (response = {}) => this.send(socket, [joinRef, ref, topic, "phx_reply", { status: "ok", response }]);
    if (topic === "phoenix" && event === "heartbeat") return reply();
    if (event === "phx_join") {
      // Echo each requested postgres_changes filter back with a server id, as Supabase realtime does.
      const bindings = (payload?.config?.postgres_changes || []).map(filter => ({ id: this.nextBinding++, event: filter.event, schema: filter.schema,
        table: filter.table, ...(filter.filter ? { filter: filter.filter } : {}) }));
      socket.topics.set(topic, { joinRef, bindings });
      return reply({ postgres_changes: bindings });
    }
    if (event === "phx_leave") { socket.topics.delete(topic); return reply(); }
    if (event === "access_token") return;
    if (ref) reply();
  }

  send(socket, frame) {
    try { socket.ws.send(JSON.stringify(frame)); } catch (error) { this.harnessErrors.push(`realtime send: ${error.message}`); }
  }

  pushInsert(table, record) {
    let delivered = 0;
    for (const socket of this.sockets) {
      for (const [topic, { bindings }] of socket.topics) {
        const ids = bindings.filter(b => b.table === table && ["public", "*"].includes(b.schema) && ["INSERT", "*"].includes(b.event)
          && (!b.filter || (([column, ...rest]) => matches(record[column], rest.join("=")))(b.filter.split("=")))).map(b => b.id);
        if (!ids.length) continue;
        this.send(socket, [null, null, topic, "postgres_changes", { ids, data: { type: "INSERT", schema: "public", table, record,
          columns: [], commit_timestamp: iso(Date.now()), errors: null } }]);
        delivered++;
      }
    }
    return delivered;
  }
}

/* =====================================================================================================
 * BROWSER HELPERS
 * ===================================================================================================== */
const session = () => ({
  access_token: "x", refresh_token: "y", token_type: "bearer", expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 86400,
  user: { id: UID, aud: "authenticated", role: "authenticated", email: "venue@test" },
});
const consoleErrors = new Set();

// Polls fn until it returns a truthy value. Errors thrown by fn count as "not yet".
async function until(fn, message, timeout = 5000) {
  const end = Date.now() + timeout;
  let last;
  while (true) {
    try { const value = await fn(); if (value) return value; last = null; } catch (error) { last = error; }
    if (Date.now() > end) throw new Error(`${message} (waited ${timeout}ms)${last ? `: ${last.message.split("\n")[0]}` : ""}`);
    await sleep(50);
  }
}

// Labels a failure with the step it happened in.
async function step(label, fn) {
  try { return await fn(); } catch (error) { error.message = `${label}: ${error.message}`; throw error; }
}

// Same rule as check-mobile.mjs: the app is one viewport-sized surface with no page scroll.
async function fit(page, label) {
  const size = await page.evaluate(() => ({
    width: innerWidth, height: innerHeight, x: scrollX, y: scrollY,
    rootWidth: document.documentElement.scrollWidth, rootHeight: document.documentElement.scrollHeight,
    bodyWidth: document.body.scrollWidth, bodyHeight: document.body.scrollHeight,
  }));
  assert(size.rootWidth <= size.width + 1 && size.bodyWidth <= size.width + 1, `${label}: horizontal page overflow ${JSON.stringify(size)}`);
  assert(size.rootHeight <= size.height + 1 && size.bodyHeight <= size.height + 1, `${label}: vertical page overflow ${JSON.stringify(size)}`);
  assert.equal(size.x, 0, `${label}: document scrolled horizontally`);
  assert.equal(size.y, 0, `${label}: document scrolled vertically`);
}

const pad = value => String(value).padStart(2, "0");
const localDate = date => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const localTime = date => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

// Fills a native date, time or datetime-local input from a Date.
async function fillNative(locator, date) {
  const type = await locator.getAttribute("type");
  const value = type === "date" ? localDate(date) : type === "time" ? localTime(date)
    : type === "datetime-local" ? `${localDate(date)}T${localTime(date)}` : null;
  assert(value, `expected a native date/time input, got type="${type}"`);
  await locator.fill(value);
}

// Chooses an option shown as a chip, radio, tab or <select> option.
async function choose(page, label) {
  const control = page.getByRole("button", { name: label, exact: true })
    .or(page.getByRole("radio", { name: label, exact: true }))
    .or(page.getByRole("tab", { name: label, exact: true }));
  if (await control.count()) return control.first().click();
  const select = page.locator("select").filter({ has: page.locator("option", { hasText: label }) });
  if (await select.count()) return select.first().selectOption({ label });
  throw new Error(`no control named "${label}"`);
}

// Name of the single draggable picking card on screen (skipping `not`).
async function topCard(page, names, not = null) {
  return until(async () => {
    const shown = [];
    for (const name of names) {
      if (name !== not && await UI.deck.cardOf(page, name).filter({ visible: true }).count()) shown.push(name);
    }
    if (shown.length > 1) throw new Error(`expected one draggable card, saw ${shown.join(", ")}`);
    return shown[0];
  }, `a draggable card (role group, name "<applicant>, ... drag right to pick ...")${not ? ` other than ${not}` : ""}`, 8000);
}

// A real pointer drag: press, move in small steps, release.
async function dragCard(page, dx, dy) {
  const card = UI.deck.card(page).filter({ visible: true }).first();
  const box = await card.boundingBox();
  assert(box, "the card has no bounding box");
  const x = box.x + box.width * (dx > 0 ? 0.3 : dx < 0 ? 0.7 : 0.5);
  const y = box.y + Math.min(box.height * 0.4, 260);
  await page.mouse.move(x, y);
  await page.mouse.down();
  for (let i = 1; i <= 12; i++) {
    await page.mouse.move(x + (dx * i) / 12, y + (dy * i) / 12);
    await sleep(16);
  }
  await page.mouse.up();
}

async function openDeckFromHome(page) {
  await UI.task(page, UI.home.startPicking, "Late Lounge").click();
  return topCard(page, DECK_E1);
}

async function openDoorFromHome(page) {
  await UI.task(page, UI.home.openDoorList, "Pool Day").click();
  await UI.door.title(page).waitFor();
}

async function insideCount(page) {
  const text = await UI.door.counter(page).innerText();
  return Number(text.match(UI.door.counterPattern)[1]);
}

async function closeNightViaUI(page) {
  await UI.button(page, UI.door.closeNight).click();
  const dialog = UI.door.dialog(page);
  await dialog.waitFor();
  await UI.button(dialog, UI.door.closeNight).click();
}

/* =====================================================================================================
 * SCENARIOS
 * ===================================================================================================== */
const scenarios = [];
const scenario = (id, title, run) => scenarios.push({ id, title, run });

scenario(1, "Boot: live Home hydrates from the fake, realtime INSERT refetches, nothing reaches Supabase", async ({ fake, phone }) => {
  const { page } = await phone("A");
  await step("hydrate reads every table", () => until(
    () => ["profiles", "venues", "notifications", "events", "applications", "stories", "bookings"].every(table => fake.reads(table) > 0),
    `expected reads of every table, got ${JSON.stringify(Object.fromEntries(["profiles", "venues", "notifications", "events", "applications", "stories", "bookings"].map(t => [t, fake.reads(t)])))}`, 8000));
  await step("one active tab", async () => {
    const active = await UI.nav(page).locator('button[aria-current="page"]').count();
    assert.equal(active, 1, "exactly one Venue navigation button has aria-current=page");
  });
  await step("Home fits the screen", () => fit(page, "Home"));
  await step("realtime subscribed to notifications", () => until(() => fake.subscriptions("notifications") > 0, "a postgres_changes binding on notifications", 10000));
  await step("realtime INSERT triggers a refetch", async () => {
    const before = fake.reads("notifications");
    assert.equal(fake.memberConfirms("Jad"), 1, "the pick_confirmed INSERT reached one subscribed socket");
    await until(() => fake.reads("notifications") > before, "the app refetched notifications after the realtime INSERT", 5000);
  });
});

scenario(2, "Swipe: drag right picks once, drag left passes, Undo pass restores the card with no RPC", async ({ fake, phone }) => {
  const { page } = await phone("A");
  await step("Home is the active tab", async () => assert.equal(await UI.tab(page, UI.tabs.home).getAttribute("aria-current"), "page"));
  const first = await step("open the E1 deck from Home", () => openDeckFromHome(page));
  await step("deck fits the screen", () => fit(page, "Picking deck"));
  await step(`drag ${first} right`, async () => {
    await dragCard(page, 200, 8);
    await until(() => fake.count("pick_applicant") === 1, "one pick_applicant call");
    await sleep(600);
    assert.equal(fake.count("pick_applicant"), 1, "pick_applicant calls");
    assert.equal(fake.count("skip_applicant"), 0, "skip_applicant calls");
    assert.equal(fake.last("pick_applicant").args.p_app, fake.app(first).id, "picked the dragged applicant");
    assert.equal(fake.app(first).status, "picked");
  });
  await step("no Undo after a pick", async () => {
    assert.equal(await UI.deck.anyUndo(page).filter({ visible: true }).count(), 0, "an Undo button is visible right after a pick");
  });
  const second = await step("next card shows", () => topCard(page, DECK_E1, first));
  await step(`drag ${second} left`, async () => {
    await dragCard(page, -200, 8);
    await until(() => fake.count("skip_applicant") === 1, "one skip_applicant call");
    assert.equal(fake.last("skip_applicant").args.p_app, fake.app(second).id, "passed on the dragged applicant");
    await UI.deck.undoPass(page).waitFor();
  });
  await step("Undo pass brings the same card back with no RPC", async () => {
    const before = fake.calls.length;
    await UI.deck.undoPass(page).click();
    await UI.deck.cardOf(page, second).waitFor();
    await sleep(600);
    assert.equal(fake.calls.length, before, `Undo pass made RPC calls: ${fake.calls.slice(before).map(c => c.name)}`);
    assert.equal(fake.app(second).status, "applied");
  });
});

scenario(3, "Double tap: two quick taps on Pick make exactly one pick_applicant call", async ({ fake, phone }) => {
  const { page } = await phone("A");
  fake.delay("pick_applicant", 400);
  const name = await step("open the E1 deck from Home", () => openDeckFromHome(page));
  await step(`double tap Pick ${name}`, async () => {
    const box = await UI.button(page, UI.deck.pick(name)).boundingBox();
    assert(box, `no Pick ${name} button`);
    const x = box.x + box.width / 2, y = box.y + box.height / 2;
    await page.mouse.click(x, y);
    await sleep(60);
    await page.mouse.click(x, y);
    await until(() => fake.callsOf("pick_applicant").some(call => call.done), "the pick to finish", 3000);
    await sleep(1200);
    assert.equal(fake.count("pick_applicant"), 1, `pick_applicant calls: ${fake.callsOf("pick_applicant").map(c => fake.nameOf(c.args.p_app))}`);
    assert.equal(fake.app(name).status, "picked");
    assert.deepEqual(DECK_E1.filter(other => other !== name && fake.app(other).status !== "applied"), [], "no one else was picked");
  });
});

scenario(4, "Failed save: a failed pick keeps the same card, shows a toast, and changes nothing", async ({ fake, phone }) => {
  const { page } = await phone("A");
  fake.failNext("pick_applicant", "connection lost");
  const name = await step("open the E1 deck from Home", () => openDeckFromHome(page));
  await step(`press Pick ${name}`, async () => {
    await UI.button(page, UI.deck.pick(name)).click();
    await until(() => fake.callsOf("pick_applicant").some(call => call.done), "the failed pick_applicant call");
  });
  await step("a toast explains it", () => UI.toast(page).first().waitFor({ timeout: 3000 }));
  await step("the same card stays", async () => {
    await UI.deck.cardOf(page, name).filter({ visible: true }).first().waitFor({ timeout: 3000 });
    assert.equal(await topCard(page, DECK_E1), name);
    assert.equal(fake.app(name).status, "applied");
    assert.equal(fake.count("pick_applicant"), 1);
  });
});

scenario(5, "Vertical drag: a mostly vertical drag on the card makes no decision", async ({ fake, phone }) => {
  const { page } = await phone("A");
  const name = await step("open the E1 deck from Home", () => openDeckFromHome(page));
  await step("drag down", async () => {
    const before = fake.calls.length;
    await dragCard(page, 24, 200);
    await sleep(800);
    assert.equal(fake.calls.length, before, `vertical drag made RPC calls: ${fake.calls.slice(before).map(c => c.name)}`);
    assert.equal(await topCard(page, DECK_E1), name, "the same card is still on top");
    assert.equal(fake.app(name).status, "applied");
  });
});

scenario(6, "Two phones: a check-in on A reaches B within 8s; a stale check-in on B is handled", async ({ fake, phone }) => {
  const A = await phone("A");
  const B = await phone("B");
  await step("both phones open the E2 door list", async () => {
    await openDoorFromHome(A.page);
    await openDoorFromHome(B.page);
    await fit(A.page, "Door list");
    await UI.button(B.page, UI.door.checkIn("Farah")).waitFor();
  });
  await step("A checks in Farah", async () => {
    await UI.button(A.page, UI.door.checkIn("Farah")).click();
    await until(() => fake.app("Farah").status === "checked_in", "Farah checked in on the server");
    assert.equal(fake.count("check_in"), 1);
    await UI.button(A.page, UI.door.checkIn("Farah")).waitFor({ state: "hidden", timeout: 3000 });
    await until(async () => (await insideCount(A.page)) === 1, "A's counter shows 1 inside", 3000);
  });
  await step("B drops Farah within 8 seconds without a tap", async () => {
    const started = Date.now();
    await UI.button(B.page, UI.door.checkIn("Farah")).waitFor({ state: "hidden", timeout: 8000 });
    console.log(`     B synced in ${((Date.now() - started) / 1000).toFixed(1)}s`);
  });
  await step("B, stale, checks in Gia after A already did", async () => {
    fake.holdReads("B"); // B cannot refresh, so it still shows Gia as expected
    await UI.button(A.page, UI.door.checkIn("Gia")).click();
    await until(() => fake.app("Gia").status === "checked_in", "Gia checked in by A");
    await UI.button(B.page, UI.door.checkIn("Gia")).click();
    await until(() => fake.count("check_in") === 3 && fake.last("check_in").done, "B's check_in call");
    assert.equal(fake.last("check_in").phone, "B");
    assert.equal(fake.last("check_in").error, "not checkable");
    await UI.toast(B.page).first().waitFor({ timeout: 3000 });
  });
  await step("B recovers and stays on the door list", async () => {
    fake.releaseReads("B");
    await UI.button(B.page, UI.door.checkIn("Gia")).waitFor({ state: "hidden", timeout: 8000 });
    await UI.door.title(B.page).waitFor();
    assert.equal(fake.db.stories.filter(story => story.application_id === fake.app("Gia").id).length, 1, "one Story row for Gia");
  });
});

scenario(7, "Close the night: the confirm counts 3 not checked in; closing marks them no-show, Jad stays picked", async ({ fake, phone }) => {
  fake.server("check_in", { p_app: fake.app("Farah").id });
  const { page } = await phone("A");
  await step("open the E2 door list", () => openDoorFromHome(page));
  await step("Not now keeps the night open", async () => {
    await UI.button(page, UI.door.closeNight).click();
    const dialog = UI.door.dialog(page);
    await dialog.waitFor();
    const text = await until(async () => { const t = await dialog.innerText(); return UI.door.notCheckedIn.test(t) && t; },
      `dialog text matching ${UI.door.notCheckedIn}`, 3000);
    assert.equal(Number(text.match(UI.door.notCheckedIn)[1]), 3, `dialog says: ${text}`);
    await UI.button(dialog, UI.door.notNow).click();
    await dialog.waitFor({ state: "hidden" });
    assert.equal(fake.count("close_event"), 0);
  });
  await step("confirm closes the night once", async () => {
    await closeNightViaUI(page);
    await until(() => fake.count("close_event") === 1 && fake.last("close_event").done, "one close_event call");
    await sleep(600);
    assert.equal(fake.count("close_event"), 1);
    assert.equal(fake.last("close_event").args.p_event, E2);
    assert.equal(fake.last("close_event").error, null);
  });
  await step("Summary shows", async () => {
    await UI.summary.optional(page).waitFor({ timeout: 10000 });
    await fit(page, "Summary");
  });
  await step("database after closing", () => {
    const status = name => fake.app(name).status;
    assert.deepEqual(["Farah", "Gia", "Hana", "Iman"].map(status), ["checked_in", "no_show", "no_show", "no_show"]);
    assert.equal(status("Jad"), "picked");
    assert.equal(status("Kim"), "expired");
    assert.deepEqual(["Lea", "Mia"].map(status), ["not_selected", "not_selected"]);
    assert.equal(fake.event(E2).status, "closed");
    assert.equal(fake.db.bookings.filter(b => b.event_id === E2).length, 1, "one booking for E2");
  });
});

scenario(8, "Optional ratings: none required to close; Great for Farah saves 9 after closing", async ({ fake, phone }) => {
  fake.server("check_in", { p_app: fake.app("Farah").id });
  const { page } = await phone("A");
  await step("close the E2 night", async () => {
    await openDoorFromHome(page);
    await closeNightViaUI(page);
    await until(() => fake.count("close_event") === 1 && fake.last("close_event").done, "one close_event call");
    await UI.summary.optional(page).waitFor({ timeout: 10000 });
  });
  await step("no rating before this point", () => assert.equal(fake.count("rate_guest"), 0, "rate_guest calls before any rating tap"));
  await step("Great for Farah", async () => {
    const great = UI.button(page, UI.summary.great("Farah"));
    await great.click();
    await until(() => fake.count("rate_guest") === 1 && fake.last("rate_guest").done, "one rate_guest call");
    const call = fake.last("rate_guest");
    assert.deepEqual({ app: call.args.p_app, rating: call.args.p_rating, error: call.error }, { app: fake.app("Farah").id, rating: 9, error: null });
    await until(async () => (await great.getAttribute("aria-pressed")) === "true", "Great for Farah has aria-pressed=true", 3000);
    assert.equal(await UI.button(page, UI.summary.fine("Farah")).getAttribute("aria-pressed"), "false");
    assert.equal(fake.app("Farah").rating, 9);
    await sleep(400);
    assert.equal(fake.count("rate_guest"), 1);
  });
});

scenario(9, "Same-day posting: a passed close time blocks Post event; a picked close time posts once", async ({ fake, phone }) => {
  const { page } = await phone("A");
  // Start 2 hours from now. Its date is today unless that crosses midnight.
  const start = new Date(Date.now() + 2 * H);
  await step("open New event", async () => {
    await UI.button(page, UI.home.newEvent).click();
    await UI.form.name(page).fill("Rooftop Check");
    await fillNative(UI.form.date(page), start);
    await fillNative(UI.form.startTime(page), start);
    await fit(page, "New event form");
  });
  await step("1 day before has already passed", async () => {
    await UI.button(page, UI.form.dayBefore).or(page.getByRole("radio", { name: UI.form.dayBefore, exact: true })).first().waitFor();
    await UI.form.passed(page).waitFor({ timeout: 3000 });
    assert(await UI.button(page, UI.form.post).isDisabled(), "Post event is enabled with a passed close time");
  });
  await step("Pick a time 30 minutes from now", async () => {
    await choose(page, UI.form.pickTime);
    await fillNative(UI.form.closeTime(page), new Date(Date.now() + 30 * MIN));
    await until(async () => !(await UI.button(page, UI.form.post).isDisabled()), "Post event enabled", 3000);
  });
  await step("post once", async () => {
    await UI.button(page, UI.form.post).click();
    await until(() => fake.count("post_event") === 1 && fake.last("post_event").done, "one post_event call");
    await sleep(600);
    assert.equal(fake.count("post_event"), 1);
    const { args, error } = fake.last("post_event");
    assert.equal(error, null);
    assert.equal(args.p_title, "Rooftop Check");
    assert.equal(args.p_draft, false);
    const closes = Date.parse(args.p_closes_at), starts = Date.parse(args.p_starts);
    assert(closes > Date.now(), `p_closes_at ${args.p_closes_at} is not in the future`);
    assert(closes < starts, `p_closes_at ${args.p_closes_at} is not before p_starts ${args.p_starts}`);
    assert(Math.abs(starts - start.getTime()) < 2 * MIN, `p_starts ${args.p_starts} is not the chosen start`);
    assert.equal(fake.db.events.find(e => e.title === "Rooftop Check")?.status, "published");
  });
});

scenario(10, "Held arrow key: holding ArrowRight picks one person at most; Alt+Arrow picks no one", async ({ fake, phone }) => {
  const { page } = await phone("A");
  const name = await step("open the E1 deck from Home", () => openDeckFromHome(page));
  await step("hold ArrowRight (one press plus key repeats)", async () => {
    await page.keyboard.down("ArrowRight");
    for (let i = 0; i < 6; i++) { await sleep(40); await page.keyboard.down("ArrowRight"); }
    await page.keyboard.up("ArrowRight");
    await until(() => fake.count("pick_applicant") >= 1 && fake.callsOf("pick_applicant").every(call => call.done), "the first pick", 4000);
    await sleep(800);
    assert.equal(fake.count("pick_applicant"), 1, "a held key picked more than one person");
    assert.equal(fake.app(name).status, "picked");
  });
  await step("Alt+ArrowRight (browser Forward) picks no one", async () => {
    await page.keyboard.press("Alt+ArrowRight");
    await sleep(600);
    assert.equal(fake.count("pick_applicant"), 1, "Alt+ArrowRight picked someone");
  });
});

scenario(11, "Mid-save tap: the card can't open a profile while a pass saves, so the sheet never acts on the next person", async ({ fake, phone }) => {
  const { page } = await phone("A");
  fake.delay("skip_applicant", 1200);
  const name = await step("open the E1 deck from Home", () => openDeckFromHome(page));
  await step(`pass on ${name}, then tap the card while it saves`, async () => {
    await UI.button(page, UI.deck.pass(name)).click();
    await sleep(150);
    await page.getByRole("button", { name: UI.deck.view(name), exact: true }).click({ force: true });
    await until(() => fake.callsOf("skip_applicant").some(call => call.done), "the pass to finish", 4000);
    await sleep(400);
    assert.equal(await page.getByRole("dialog").count(), 0, "a profile opened while the pass was saving");
    assert.equal(fake.count("pick_applicant"), 0, "someone was picked");
  });
});

/* =====================================================================================================
 * RUNNER
 * ===================================================================================================== */
const only = (process.env.ONLY || "").split(",").map(s => s.trim()).filter(Boolean).map(Number);
const selected = only.length ? scenarios.filter(s => only.includes(s.id)) : scenarios;
mkdirSync(SHOTS, { recursive: true });

const browser = await chromium.launch({
  headless: !process.env.HEADED,
  ...(existsSync(CHROME) ? { executablePath: CHROME } : {}),
  // A request the routes miss fails DNS instead of reaching the real project.
  args: ["--host-resolver-rules=MAP *.supabase.co ~NOTFOUND"],
});

let failed = 0;
try {
  for (const s of selected) {
    const fake = new FakeSupabase(seedDb());
    const phones = [];
    const phone = async name => {
      const context = await browser.newContext({ viewport: VIEWPORT, isMobile: true, hasTouch: true, reducedMotion: "reduce", serviceWorkers: "block" });
      await context.addInitScript(([key, value]) => { try { localStorage.setItem(key, value); } catch {} }, [STORAGE_KEY, JSON.stringify(session())]);
      await fake.attach(context, name);
      const page = await context.newPage();
      page.setDefaultTimeout(8000);
      const entry = { name, context, page, errors: [] };
      phones.push(entry);
      page.on("pageerror", error => entry.errors.push(error.message));
      page.on("console", message => {
        // 400s are the fake's deliberate RPC errors (failNext, stale check-in); anything else is worth seeing.
        if (message.type() === "error" && !/status of 400/.test(message.text())) consoleErrors.add(`[${name}] ${message.text()}`);
      });
      await step(`phone ${name} boots`, async () => {
        await page.goto(new URL("/venue", BASE).href, { waitUntil: "domcontentloaded" });
        await UI.nav(page).waitFor({ state: "visible", timeout: 20000 });
      });
      return entry;
    };
    const stopTimer = new AbortController();
    try {
      const timeout = sleep(120000, null, { signal: stopTimer.signal }).then(() => { throw new Error("scenario timed out after 120s"); });
      const running = s.run({ fake, phone });
      timeout.catch(() => {});
      running.catch(() => {});
      await Promise.race([running, timeout]);
      stopTimer.abort();
      for (const p of phones) assert.deepEqual(p.errors, [], `phone ${p.name}: uncaught page errors`);
      await until(() => fake.problems().length === 0, "the fake answered every request", 3000)
        .catch(() => assert.fail(fake.problems().join("\n")));
      console.log(`PASS ${s.id}. ${s.title}`);
      if (process.env.DEBUG) console.log(`     supabase requests seen ${fake.seen.length}, answered ${fake.handled.size}, sockets ${fake.sockets.size}, RPCs ${fake.calls.map(c => c.name).join(",") || "none"}`);
    } catch (error) {
      failed++;
      console.log(`FAIL ${s.id}. ${s.title}`);
      console.log(`     ${error.message.split("\n").filter(Boolean).slice(0, 6).join("\n     ")}`);
      for (const p of phones) if (p.errors.length) console.log(`     phone ${p.name} page errors: ${p.errors.join(" | ")}`);
      for (const problem of fake.problems()) console.log(`     ${problem}`);
      if (fake.calls.length) console.log(`     RPC calls: ${fake.calls.map(c => `${c.phone}:${c.name}${c.error ? `(${c.error})` : ""}`).join(", ")}`);
      for (const p of phones) {
        const file = join(SHOTS, `${s.id}-${p.name}.png`);
        if (await p.page.screenshot({ path: file }).then(() => true, () => false)) console.log(`     screenshot: ${file}`);
      }
    } finally {
      stopTimer.abort();
      fake.releaseAll();
      for (const p of phones) await p.context.close().catch(() => {});
    }
  }
} finally {
  await browser.close();
}

if (consoleErrors.size) console.warn(`Browser console errors (${consoleErrors.size} distinct):\n  ${[...consoleErrors].join("\n  ")}`);
console.log(`${selected.length - failed} of ${selected.length} scenarios passed at ${VIEWPORT.width}x${VIEWPORT.height}.`);
process.exitCode = failed ? 1 : 0;
