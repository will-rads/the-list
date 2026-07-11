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
  ],
};

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
      else console.warn(`note: parse gate skipped for ${file} (esbuild unavailable)`);
    }
  }
  if (problems.length) { failed = true; console.error(`FAIL ${file}\n  ` + problems.join("\n  ")); }
  else console.log(`OK   ${file} (${src.split(/\r?\n/).length} lines)`);
}
if (only && !Object.keys(REQUIRED).some(f => f.startsWith(only))) {
  console.error(`No file matches filter "${only}"`);
  failed = true;
}
process.exit(failed ? 1 : 0);
