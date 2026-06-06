// Static check for web/venue.html — brackets balanced, one createRoot, required tokens present.
// Usage: node web/check-venue.mjs <token> <token> ...
import { readFileSync } from "node:fs";
const file = "web/venue.html";
const src = readFileSync(file, "utf8");
const tokens = process.argv.slice(2);
const problems = [];

for (const [open, close] of [["{","}"],["(",")"],["[","]"]]) {
  const o = (src.match(new RegExp("\\" + open, "g")) || []).length;
  const c = (src.match(new RegExp("\\" + close, "g")) || []).length;
  if (o !== c) problems.push(`unbalanced ${open}${close}: ${o} vs ${c}`);
}
const roots = (src.match(/createRoot/g) || []).length;
if (roots !== 1) problems.push(`expected 1 createRoot, found ${roots}`);
for (const t of tokens) if (!src.includes(t)) problems.push(`missing token: ${t}`);

if (problems.length) { console.error("FAIL\n- " + problems.join("\n- ")); process.exit(1); }
console.log(`OK — ${src.split("\n").length} lines, brackets balanced, 1 createRoot, ${tokens.length} tokens present`);
