// web/v2/check-v2.mjs — structure + required-token checker for the v2 prototypes.
// Usage: node web/v2/check-v2.mjs            (checks both files)
//        node web/v2/check-v2.mjs venue      (one file)
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
  ],
  "venue.html": [
    "function ScreenVenueIntro", "function ScreenVenueLogin", "function ScreenOnboardGroup",
    "function ScreenOnboardVenue", "function ScreenDesk", "function ScreenDoor",
    "function ScreenEvents", "function ScreenReview", "function ScreenVenueProfile",
    "function ScreenPostEvent",
    "const STAGE = {", "const GS = {", "const SS = {", "function makeGuest",
    "LST-4F", "LST-9Q", "stage:", "guests:", "bundle:", "brief:",
    "function GuestListSheet", "function ConfirmDialog", "Cancel event", "Cancelled",
    "const BUNDLES = [", "function StepBundle", "function StepBrief", "Applications close",
    "function ApplicantSheet", "Undo last", "Keep open", "Close applications",
    "Needs attention", "Pick a replacement", "function venueNotifs", "const TODAY = ",
    "Close the night", "No room tonight",
    "function ScreenRecap", "Verified reach", "Invoice",
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
  for (const banned of ["#9FD8E8", "Instrument Serif", "font-family: Inter", "'Inter'", '"Inter"',
                        "“", "”", "‘", "’"]) {
    if (src.includes(banned)) problems.push(`banned token present: ${JSON.stringify(banned)}`);
  }
  // Parse gate: hand the babel script block to esbuild as JSX. Catches what token checks can't
  // (smart quotes, truncated JSX, mismatched tags). Skips gracefully if esbuild is unavailable.
  const scriptMatch = src.match(/<script type="text\/babel"[^>]*>([\s\S]*?)<\/script>/);
  if (!scriptMatch) problems.push("no text/babel script block found");
  else {
    try {
      execSync("npx -y esbuild --loader=jsx --log-level=error", {
        input: scriptMatch[1], stdio: ["pipe", "ignore", "pipe"],
        env: { ...process.env, NODE_OPTIONS: "--use-system-ca" },
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
