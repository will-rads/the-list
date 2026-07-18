// web/v3/check-v3.mjs — structure + required-token checker for the v3 glass reskin.
// v3 scope: member + venue glass clients.
// Usage: node web/v3/check-v3.mjs
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));

// Required tokens per file. Tasks APPEND to these arrays — never remove.
const REQUIRED = {
  "index.html": [
    "function ScreenHome", "function ScreenExplore", "function ScreenEventDetail",
    "function ScreenMyEvents", "function ScreenProfile", "function ScreenPicked",
    "function ScreenOnboard",
    "const STAGE = {", "const GS = {", "const SS = {", "const STAGE_COPY = {",
    "const GS_COPY = {", "const SS_COPY = {", "const MY_EVENTS = [", "const SEED_NOTIFS = [", "LST-4F",
    "List closed", "Closing soon", "The list is closed",
    "function simulatePick", "Confirm within", "Seat released", "Confirm your seat",
    "function ScreenPass", "Show this at the door", "function BriefBlock",
    "Still under review", "Story due", "no strike",
    "function StorySheet", "we check within a few hours", "function forceVerdict",
    "function notifTarget", "Confirm your seat — 2h left",
    "function DemoPanel", "Reset demo",
    // v3 Frosted glass reskin (2026-07-04): photo ground + real glass surfaces.
    "--bg-photo", "backdrop-filter",
    // Profile analytics dashboard (2026-07-11): four tabs, truthful data modes, charts, lazy media.
    "profile-tabs", "Average Story reach", "Lebanon audience", "Top content",
    "Reliability score", "7 days", "90 days", "loading=\"lazy\"", "Not available",
    "DEMO_PREVIEW", "new URLSearchParams(window.location.search)",
    // Full-functionality wave (2026-07-18): live settings, proof, records, counts and deep links.
    'supabaseClient.rpc("submit_story"', 'supabaseClient.rpc("member_record"',
    'supabaseClient.rpc("delete_account"', 'supabaseClient.rpc("event_stats"',
    'supabaseClient.storage.from("media")', 'type:"text/calendar',
    'https://maps.google.com/?q=', 'sessionStorage.setItem("pending-event"',
    'Deactivate profile', 'Deadline unavailable',
  ],
  "venue.html": [
    "function ScreenVenueIntro", "function ScreenVenueLogin", "function ScreenDesk",
    "function ScreenEvents", "function ScreenDoor", "function ScreenReview",
    "function ScreenPostEvent", "function ScreenRecap", "function ScreenVenueProfile",
    "signInWithOtp", "verifyOtp", "type: \"email\"", "shouldCreateUser: false",
    "from(\"venues\").select(\"*\")", "from(\"events\").select(\"*\")",
    "pick_applicant", "skip_applicant", "check_in", "close_event", "post_event",
    "venue-notifications-", "--bg-photo", "backdrop-filter",
    // Applied-member analytics: fast swipe summary plus full tabbed applicant sheet.
    "applicant-tabs", "Applied to this event", "Estimated local followers",
    "Audience location", "Content metrics", "Exact active count", "loading=\"lazy\"",
    // Full-functionality wave (2026-07-18): every live venue action reaches Supabase.
    'runRpc("mark_no_show"', 'runRpc("rate_guest"', 'runRpc("close_applications"',
    'runRpc("cancel_event"', 'runRpc("delete_event"',
    'supabaseClient.rpc("update_event"', 'supabaseClient.storage.from("media")',
    '.eq("owner_id", uid)', 'demo={session ? null : demoActions}',
    'saved to their event record', 'creator.profile_picture_url || null',
  ],
};

const BANNED_STALE = [
  "Pass — next build step", "Opening in Maps", "22 km south of city",
  '<Countdown value="04:56:12"', "Live draft editing is not available",
  "Draft – editing coming soon", "creator_data:creatorData",
  "Delete account", "feeds their reputation",
];

function balance(src, open, close) {
  let d = 0;
  for (const ch of src) { if (ch === open) d++; else if (ch === close) d--; }
  return d;
}

let failed = false;
const only = process.argv[2]; // "index" | "venue" | undefined
for (const [file, tokens] of Object.entries(REQUIRED)) {
  if (only && !file.startsWith(only)) continue;
  const src = readFileSync(join(here, file), "utf8");
  const problems = [];
  for (const [o, c] of [["{", "}"], ["(", ")"], ["[", "]"]]) {
    const d = balance(src, o, c);
    if (d !== 0) problems.push(`bracket ${o}${c} delta ${d}`);
  }
  const roots = (src.match(/createRoot/g) || []).length;
  if (roots !== 1) problems.push(`createRoot count ${roots} (want 1)`);
  for (const t of tokens) if (!src.includes(t)) problems.push(`missing token: ${t}`);
  for (const stale of BANNED_STALE) if (src.includes(stale)) problems.push(`stale token present: ${JSON.stringify(stale)}`);
  // Curly/smart quotes inside JS source = Babel SyntaxError = blank app (caught live 2026-06-11, T11).
  // v3 (2026-07-04): Cormorant retired with the Ultraviolet reskin; Space Grotesk
  // (stock 1c's face) never adopted — Jakarta everywhere per Will's ruling.
  for (const banned of ["#9FD8E8", "Instrument Serif", "font-family: Inter", "'Inter'", '"Inter"',
                        "Cormorant", "Space Grotesk",
                        // v3 glass (2026-07-04): the Ultraviolet purple pair + its rgba twins are banned.
                        "#A374FF", "#6A3FD8", "163,116,255", "106,63,216",
                        "“", "”", "‘", "’"]) {
    if (src.includes(banned)) problems.push(`banned token present: ${JSON.stringify(banned)}`);
  }
  // Parse gate: hand the babel script block to esbuild as JSX. Catches what token checks can't
  // (smart quotes, truncated JSX, mismatched tags). Skips gracefully if esbuild is unavailable.
  const scriptMatch = src.match(/<script type="text\/babel"[^>]*>([\s\S]*?)<\/script>/);
  if (!scriptMatch) problems.push("no text/babel script block found");
  else {
    try {
      execSync(`${process.platform === "win32" ? "npx.cmd" : "npx"} -y esbuild --loader=jsx --log-level=error`, {
        input: scriptMatch[1], stdio: ["pipe", "ignore", "pipe"],
        env: { ...process.env, NODE_OPTIONS: "--use-system-ca" },
        timeout: 15000,
      });
    } catch (err) {
      const msg = (err.stderr || "").toString();
      if (msg.includes("ERROR")) problems.push("JSX parse failed:\n  " + msg.split(/\r?\n/).slice(0, 10).join("\n  "));
      else problems.push(`JSX parse gate unavailable: ${err.message}`);
    }
  }
  if (problems.length) { failed = true; console.error(`FAIL ${file}\n  ` + problems.join("\n  ")); }
  else console.log(`OK   ${file} (${src.split(/\r?\n/).length} lines)`);
}

// Founder ops and teaser are plain JavaScript. Keep a small syntax + contract gate
// here so all four production web surfaces are checked by one command.
const PLAIN = {
  "../admin.html": [
    "founder_promote_waitlists", "founder_run_tick", "set_invoice_status",
    "suspend_member", "data-signout", "Recent notifications", "review_story",
    ".not('media_url', 'is', null)", "row.status === 'locked'",
  ],
  "e.html": [
    "/v3/?event=", "This one is done. More drops soon.", "This event is gone.",
  ],
};
const PLAIN_BANNED = {
  "../admin.html": ["override_story"],
};
for (const [relative, tokens] of Object.entries(PLAIN)) {
  const file = relative.split("/").at(-1);
  const src = readFileSync(join(here, relative), "utf8");
  const problems = [];
  for (const token of tokens) if (!src.includes(token)) problems.push(`missing token: ${token}`);
  for (const token of PLAIN_BANNED[relative] || []) {
    if (src.includes(token)) problems.push(`banned token present: ${JSON.stringify(token)}`);
  }
  const scripts = [...src.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
    .map(match => match[1]).filter(code => code.trim());
  if (!scripts.length) problems.push("no JavaScript block found");
  for (const code of scripts) {
    try { Function(code); } catch (error) { problems.push(`JavaScript parse failed: ${error.message}`); }
  }
  if (problems.length) { failed = true; console.error(`FAIL ${file}\n  ` + problems.join("\n  ")); }
  else console.log(`OK   ${file} (${src.split(/\r?\n/).length} lines)`);
}
if (only && !Object.keys(REQUIRED).some(f => f.startsWith(only))) {
  console.error(`No file matches filter "${only}"`);
  failed = true;
}
process.exit(failed ? 1 : 0);
