// web/v2/check-v2.mjs — structure + required-token checker for the v2 prototypes.
// Usage: node web/v2/check-v2.mjs            (checks both files)
//        node web/v2/check-v2.mjs venue      (one file)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));

// Required tokens per file. Tasks APPEND to these arrays — never remove.
const REQUIRED = {
  "index.html": [
    "function ScreenHome", "function ScreenExplore", "function ScreenEventDetail",
    "function ScreenMyEvents", "function ScreenProfile", "function ScreenPicked",
    "function ScreenOnboard",
  ],
  "venue.html": [
    "function ScreenVenueIntro", "function ScreenVenueLogin", "function ScreenOnboardGroup",
    "function ScreenOnboardVenue", "function ScreenDesk", "function ScreenDoor",
    "function ScreenEvents", "function ScreenReview", "function ScreenVenueProfile",
    "function ScreenPostEvent",
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
  for (const banned of ["#9FD8E8", "Instrument Serif", "font-family: Inter", "'Inter'"]) {
    if (src.includes(banned)) problems.push(`banned token present: ${banned}`);
  }
  if (problems.length) { failed = true; console.error(`FAIL ${file}\n  ` + problems.join("\n  ")); }
  else console.log(`OK   ${file} (${src.split("\n").length} lines)`);
}
process.exit(failed ? 1 : 0);
