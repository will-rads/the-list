# v1 Feature-Complete Prototype — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete v1 experience (spec: `docs/superpowers/specs/2026-06-11-v1-feature-complete-design.md`) into the two v2 prototype files — Wave 1 = the complete night loop, Wave 2 = money + meta.

**Architecture:** Two self-contained React-in-HTML files (`web/v2/index.html` member, `web/v2/venue.html` venue), React + Babel + Tailwind via CDN, all state local/mocked. One shared fictional world via static seeds that agree across both files (no live cross-file sync). A node static checker verifies structure + required tokens per task (no test framework — standing prototype rule; final verification is Will's browser eyeball).

**Tech Stack:** React 18 CDN + @babel/standalone + Tailwind CDN, vanilla JS, node (checker). Design system = Kit V.2 (anthracite/cream monochrome, Cormorant Garamond display + Plus Jakarta Sans body, sentence case, arrows on CTAs, no ice blue, no all-caps, no emojis). Keep the doubled selectors `.font-black.font-black` / `.font-mono.font-mono`.

**Branch:** create `v1-complete` off `main` before Task 1. Do NOT push without Will's OK.

**Read first (every executor):** the spec file above; `docs/agent/errors.md` (Tailwind CDN collision, CDN-tags-no-SRI verdict); the target file's existing atoms before writing new ones — reuse `StatusPill`, `Segmented`, `StatTile`, `DateChip`, `SectionHead`, `Countdown`, `Toast`, `NotifSheet`, `ImageCropper`, `FramedImage`, `SwipeCard`. Match in-file Kit V.2 classes; never invent a new visual language.

**Working rules for all tasks:**
- Every visible control responds (state change, sheet, or toast). No dead taps.
- **Time never advances in the prototype.** Stage flips happen only via venue actions, member actions, the two short timers (pick 10s, verdict 8s), or the switchboard. Never build a clock that auto-closes events (the spec's deadline auto-close is production behavior — here it's display copy only).
- All copy sentence case ("Close applications", not "CLOSE APPLICATIONS"). Member never sees the word "Locked" — she sees "List closed".
- Timers: `setTimeout` stored in a ref, cleared on unmount.
- After each task: run the checker, then commit. Conventional commit messages, no Co-Authored-By needed beyond the standard footer used in this repo.

---

## Shared vocabulary (canonical — used by EVERY task, both files)

```js
// Event stages
const STAGE = { draft:"draft", open:"open", locked:"locked", past:"past", cancelled:"cancelled" };
// Guest attendance states (one axis)
const GS = { applied:"applied", waitlist:"waitlist", picked:"picked", confirmed:"confirmed",
  declined:"declined", expired:"expired", withdrawn:"withdrawn", checkedIn:"checked_in",
  noShow:"no_show", notSelected:"not_selected", cancelled:"cancelled" };
// Story states (second axis; only meaningful after checked_in + event past)
const SS = { due:"due", review:"review", needsReview:"needs_review", rejected:"rejected", verified:"verified" };
```

Member-facing copy (member file only):

```js
const STAGE_COPY = { open:"Open", locked:"List closed", past:"Past", cancelled:"Cancelled" };
const GS_COPY = {
  applied:"Applied · under review", waitlist:"Still under review", picked:"Confirm your seat",
  confirmed:"Confirmed", declined:"Declined", expired:"Pick expired", withdrawn:"Withdrawn",
  checked_in:"Checked in", no_show:"No show", not_selected:"Not selected", cancelled:"Event cancelled" };
const SS_COPY = { due:"Story due", review:"Under review", needs_review:"Needs review",
  rejected:"Rejected — try another screenshot", verified:"Verified" };
```

Quiet states (small neutral pill, never loud): declined, expired, withdrawn, no_show, not_selected, cancelled, rejected.

## The mirrored demo world (numbers are LAW — both files must agree)

Canonical today: **Sunday 25 May**.

| Event | id (both files) | Stage | Mirror facts |
| --- | --- | --- | --- |
| Pool Day | `pool` | locked (tonight) | 20 seats, mix 15/5 · 18 confirmed + 1 pick expiring (Maya Rahme, `LST-9Q`) + 2 waitlist · Sara Capriotti confirmed, code `LST-4F` · bundle The twenty $700 · brief: arrival 14:00–15:00, dress "Beach chic", meeting "Host stand — ask for Rami", rules "1 Story + venue tag during the event" |
| Late Lounge | `lounge` | open | 137 applied, 24 to review, mix 9/15 girls · 3/5 guys, closes Fri 30 May 20:00 · Sara = applied |
| Rooftop Session | `roof` | draft | venue-only (drafts invisible to members) |
| Sound Bath | `bath` | past (**last night** — Sat 24 May, so story windows are still open) | 20 confirmed, 18 showed, 2 no-shows, avg rating 8.6 · stories: 14 verified + 1 in review + 3 **due** · reach 412,000 · invoice The twenty $700 **Due** · Sara = checked_in, story **due** (her upload demo) |
| Vinyl Night | `vinyl` | past (two weeks ago) | 12 checked_in: 10 verified + 2 **missed** (window long gone) · invoice **Paid** · Sara = checked_in + story verified (score 92, "Tag visible, posted in window") |
| Sunset Tasting | `tasting` | past | Sara = not_selected (quiet) |
| Harbor Club Night | `harbor` | cancelled | both sides show Cancelled, member copy notes "No strike" |

Pass codes format: `LST-` + 2 chars. Sara is always `LST-4F`.

---

# WAVE 1 — the complete night

### Task 1: Static checker for v2 (`web/v2/check-v2.mjs`)

**Files:**
- Create: `web/v2/check-v2.mjs`

- [ ] **Step 1: Write the checker**

```js
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
```

- [ ] **Step 2: Run it — expect PASS on the untouched baseline**

Run: `node web/v2/check-v2.mjs`
Expected: `OK index.html` + `OK venue.html`, exit 0. If a baseline token is missing, fix the REQUIRED list to match reality (the screens exist — verified 2026-06-11), not the file.

- [ ] **Step 3: Commit**

```bash
git add web/v2/check-v2.mjs
git commit -m "chore(v2): static checker for both prototype files"
```

### Task 2: Venue data layer — stages, guests, mirrored seeds

**Files:**
- Modify: `web/v2/venue.html` (the script block: constants near `SEED_EVENTS` / `APPLICANTS` / `DEMO_VENUE`)
- Modify: `web/v2/check-v2.mjs` (tokens)

- [ ] **Step 1: Add checker tokens, run, expect FAIL**

Append to `REQUIRED["venue.html"]`: `"const STAGE"`, `"const GS"`, `"const SS"`, `"LST-4F"`, `"LST-9Q"`, `"stage:"`, `"guests:"`, `"bundle:"`, `"brief:"`, `"makeGuest"`.
Run: `node web/v2/check-v2.mjs venue` → Expected: FAIL with missing-token lines.

- [ ] **Step 2: Add the vocabulary constants** (the `STAGE`/`GS`/`SS` blocks from "Shared vocabulary" above, verbatim) next to the existing seed constants.

- [ ] **Step 3: Extend the applicant pool to 26**

Keep the existing 8 (`APPLICANTS`) with their photos. Add 18 more, cycling the same 8 face URLs (`FACE` map). Every applicant gains a reputation block:

```js
// shape added to EVERY applicant (old + new)
reputation: { score: 8.7, nights: 12, shows: 11, noShows: 1, strikes: 0, withYou: 2 }
// names for the 18 new: Lea Khoury, Maya Rahme, Nour Saab, Yara Chami, Tala Aoun,
// Rita Sleiman, Dana Fakhry, Lana Matar, Cyrine Nassar, Joelle Abou Jaoude,
// Karen Daou, Mira Haddad, Omar Khalil, Ziad Karam, Jad Nassif, Marc Abboud,
// Rami Saliba, Elie Tannous  (genders: first 12 female, last 6 male)
// quality_score 0.71–0.96 spread, instagram_followers 9k–88k, tiktok 0–120k
```

- [ ] **Step 4: Rebuild `SEED_EVENTS` to the demo world**

Replace the 2-event seed with the 6-event world (table above). Every event gets `stage`, `closesAt`, `bundle`, `brief`, `guests`. Guests are built with a helper:

```js
function makeGuest(applicantId, state, opts = {}) {
  return { applicantId, state, story: opts.story || null, code: opts.code || null,
           rating: opts.rating || null, inAt: opts.inAt || null };
}
// Pool Day (locked, tonight): 18 × confirmed (codes LST-2A, LST-3B, … unique; Sara
// Capriotti is one of them with code "LST-4F"), 1 × picked w/ expiring confirm
// (Maya Rahme, code "LST-9Q", pickedAt label "expires in 2h"), 2 × waitlist.
// Late Lounge (open): guests = 24 applicants in state "applied" (the to-review deck),
// plus appliedTotal: 137 on the event for the big number.
// Sound Bath (past): 20 confirmed → 18 with state checked_in (2 no_show);
// stories on the 18: 14 verified, 1 review, 3 due. Sara checked_in + story "due".
// Vinyl Night (past, two weeks ago): 12 checked_in — stories 10 verified + 2 missed. invoice status "paid".
// Sound Bath is dated "Sat · 24 May" (LAST NIGHT) so its story windows are still open.
// Harbor Club Night: stage cancelled, guests keep state cancelled.
```

Event literals (fields beyond the existing shape):

```js
{ id:"pool", title:"Pool Day", stage:STAGE.locked, seats:20, mix:{girls:15,guys:5},
  date:"Sun · 25 May", time:"14:00", closesAt:"Sat · 24 May · 20:00",
  bundle:{ name:"The twenty", price:700 },
  brief:{ arrival:"14:00 – 15:00", dress:"Beach chic", meeting:"Host stand — ask for Rami",
          rules:"1 Story + venue tag during the event" },
  appliedTotal:137, guests:[ /* per makeGuest comment above */ ] }
```

Recap numbers live ON the past events: `recap:{ confirmed:20, showed:18, noShows:2, avgRating:8.6, reach:412000 }`, `invoice:{ bundle:"The twenty", price:700, status:"due" }` (Vinyl: `status:"paid"`). Keep the legacy `status` field in sync (`"live"`→ derive from stage) ONLY if existing render code still reads it; otherwise delete the old field and update all readers in this task.

- [ ] **Step 5: Run checker + eyeball** — `node web/v2/check-v2.mjs venue` → OK. Open the file in a browser: app still boots to Desk via the demo path (screens may temporarily show odd data — fixed in Tasks 4–9; it must not crash).

- [ ] **Step 6: Commit** — `git commit -am "feat(venue): lifecycle vocabulary + mirrored demo-world seeds (guests, bundles, briefs, recaps)"`

### Task 3: Member data layer — mirrored events, my-events, notifications

**Files:**
- Modify: `web/v2/index.html` (script block: `EVENTS`, `SEED_PROFILE`, App state)
- Modify: `web/v2/check-v2.mjs` (tokens)

- [ ] **Step 1: Tokens** — append to `REQUIRED["index.html"]`: `"const STAGE"`, `"const GS"`, `"const SS"`, `"const GS_COPY"`, `"const SS_COPY"`, `"const STAGE_COPY"`, `"LST-4F"`, `"const MY_EVENTS"`, `"const SEED_NOTIFS"`. Run checker → FAIL.

- [ ] **Step 2: Add vocabulary + copy maps** (all five constant blocks from "Shared vocabulary", verbatim).

- [ ] **Step 3: Align `EVENTS` to the mirror world**

Re-id and extend the existing 5 events → 7: `pool`, `lounge`, `bath`, `vinyl`, `tasting`, `harbor` (+ keep one extra open browsing event, id `sunset`, stage open). Each gains `stage`, `closesAt`, `doors` (e.g. `"22:00"`), `brief` (same literal values as the venue file for `pool`), `mix`. Update every reference to old ids (`sound`, `loungenight`) — grep the file for them and fix all readers.

- [ ] **Step 4: Sara's relationship to the world**

```js
const MY_EVENTS = [
  { eventId:"pool",    state:GS.confirmed, code:"LST-4F" },
  { eventId:"lounge",  state:GS.applied },
  { eventId:"bath",    state:GS.checkedIn, story:SS.due },
  { eventId:"vinyl",   state:GS.checkedIn, story:SS.verified,
    verdict:{ score:92, reason:"Tag visible, posted in window" } },
  { eventId:"tasting", state:GS.notSelected },
  { eventId:"harbor",  state:GS.cancelled },
];
const SEED_NOTIFS = [
  { id:"n1", kind:"pass",    text:"Tonight · Pool Day — your pass is ready", eventId:"pool" },
  { id:"n2", kind:"story",   text:"Sound Bath — your Story is due", eventId:"bath" },
  { id:"n3", kind:"drop",    text:"New room Friday — Late Lounge", eventId:"lounge" },
];
```

App state: `myEvents` (useState(MY_EVENTS)), `notifs` (useState(SEED_NOTIFS)). Refactor the existing applied/confirmed/past logic in `ScreenMyEvents` to derive from `myEvents` (state field), keeping the current visual rows working (full status pills land in Task 13).

- [ ] **Step 5: Checker + boot check** — `node web/v2/check-v2.mjs index` → OK; browser boot to Home (skip onboarding demo path) must not crash.

- [ ] **Step 6: Commit** — `git commit -am "feat(member): lifecycle vocabulary, mirrored events, my-events + notification seeds"`

### Task 4: Venue Events tab — stage segments, cancel, guest list

**Files:**
- Modify: `web/v2/venue.html` (`ScreenEvents`, new `GuestListSheet`, new `ConfirmDialog`)

- [ ] **Step 1: Tokens** — append: `"function GuestListSheet"`, `"function ConfirmDialog"`, `"Close applications"`, `"Cancel event"`, `"Cancelled"`. Checker → FAIL.

- [ ] **Step 2: Segments + cards**

`ScreenEvents` segments become **Open / Locked / Drafts / Past** (counts from `events.filter(e => e.stage === …)`; Past includes cancelled, badge distinguishes). Every card: stage pill + ONE action button:
open → "Review applicants →" (onReview), locked → "Guest list →" (opens GuestListSheet), draft → "Edit →" (onEditDraft, wired in Task 5), past → "Recap →" (Task 9), cancelled → no action, quiet "Cancelled" pill.

- [ ] **Step 3: ConfirmDialog atom** (reused by cancel / close applications / close night)

```jsx
function ConfirmDialog({ title, body, confirmLabel, danger, onConfirm, onClose }) {
  // bottom sheet, Kit V.2 chrome (same pattern as existing sheets): serif title,
  // body sans, two pills: ghost "Keep it" + solid confirmLabel (neutral ink — never red).
}
```

- [ ] **Step 4: Cancel event** — overflow/quiet text action on open + locked cards → ConfirmDialog `title:"Cancel this event?"`, `body:"Everyone gets notified. No charge, no strikes."` → on confirm: `stage = cancelled`, toast `"Event cancelled — guests notified"`.

- [ ] **Step 5: GuestListSheet** — sheet over Events tab for locked events: confirmed rows (face, name, pass code, state pill) then a "Waitlist" section (same rows, quiet pill "Still under review" — venue may keep internal wording "Waitlist"). Row treatment copied from Door's Expected list.

- [ ] **Step 6: Checker + browser** (cards render per stage, cancel flow works, sheet opens) **+ commit** — `git commit -am "feat(venue): stage-driven events tab, cancel flow, guest list sheet"`

### Task 5: Post wizard — 6 steps (deadline, bundle, brief)

**Files:**
- Modify: `web/v2/venue.html` (`ScreenPostEvent`, Desk/Events entry points)

- [ ] **Step 1: Tokens** — `"const BUNDLES"`, `"applications close"`, `"function StepBundle"`, `"function StepBrief"`. Checker → FAIL.

- [ ] **Step 2: Bundles constant**

```js
const BUNDLES = [
  { id:"ten",    name:"The ten",    seats:10, price:400 },
  { id:"twenty", name:"The twenty", seats:20, price:700 },
  { id:"forty",  name:"The forty",  seats:40, price:1200 },
]; // + "Custom" option: venue keeps its stepper seats, price field editable
```

- [ ] **Step 3: Wizard steps** — substep order becomes `basics → seats → bundle → brief → image → review`, progress dots 1–6.
  - **Basics** adds "Applications close" picker: three chips — "24h before doors" (default) / "48h before" / "Custom time" (text input, same idiom as date/time inputs).
  - **StepBundle**: 3 bundle cards (name, seats, price) + Custom; selecting a bundle proposes seats (overridable back in seats step); footer lines: "Settle after the night · Whish / OMT / USD cash" + "We handle all guest comms."
  - **StepBrief**: 4 optional fields — Arrival window, Dress code, Meeting point, House rules — plus the concierge promise line again.
  - **Review** now lists: bundle + price, applications-close time, brief summary. Publish → `stage: STAGE.open`, toast "Event published".
  - Draft editing: `onEditDraft(event)` opens the wizard prefilled at basics (drafts from Desk + Events tap into this).

- [ ] **Step 4: Checker + browser** (walk all 6 steps, publish lands in Open segment, draft edit reopens prefilled) **+ commit** — `git commit -am "feat(venue): 6-step post wizard with deadline, bundle, brief"`

### Task 6: Review deck — applicant sheet, undo, close applications, replacements

**Files:**
- Modify: `web/v2/venue.html` (`ScreenReview`, `SwipeCard`, new `ApplicantSheet`)

- [ ] **Step 1: Tokens** — `"function ApplicantSheet"`, `"Undo"`, `"Keep open"`, `"waitlist"`. Checker → FAIL.

- [ ] **Step 2: ApplicantSheet** — tap anywhere on the SwipeCard photo/name (not the socials links) opens a full sheet:
photo large (FramedImage), name + gender + quality score, **reputation block** (score, nights, shows, no-shows, strikes, "with you × N"), IG + TikTok counts (tappable links preserved), audience split (gender bar + top-3 countries — add `audience:{ female:0.64, countries:[["Lebanon",0.7],["UAE",0.14],["KSA",0.06]] }` to applicants in the pool if Task 2 didn't), past-nights line. Footer: ✗ / ✓ pills (same `decide()` path) so the venue can decide from inside the sheet.

- [ ] **Step 3: Undo** — after every `decide()`, show a quiet chip above the deck: "Undo last" → pops the last decision (restores idx, removes from picked if it was a ✓). One level deep only (`lastDecision` state, cleared on next decide).

- [ ] **Step 4: Close applications** — deck-end state (and a header overflow action while swiping) shows two pills: **"Close applications →"** (solid) + "Keep open" (ghost). Solid → ConfirmDialog `title:"Close applications?"`, `body:"No new applications. Members get notified. Picks must confirm within 24h — the waitlist stays available for replacements."` → on confirm: `stage = locked`; every un-swiped `applied` guest → `state = waitlist`; toast "Applications closed".

- [ ] **Step 5: Replacement mode** — opening the deck on a locked event serves only `state === waitlist` guests; header reads "Pick replacements · {n} on the waitlist"; ✓ → `state = picked` (simulated confirm flips it to confirmed after 8s + toast "{name} confirmed"); ✗ → `state = not_selected`. Empty waitlist → quiet empty state "No one left on the waitlist."

- [ ] **Step 6: Checker + browser + commit** — `git commit -am "feat(venue): applicant sheet, undo, close-applications, waitlist replacements"`

### Task 7: Venue Desk — stage-driven dashboard + activity model

**Files:**
- Modify: `web/v2/venue.html` (`ScreenDesk`, `NotifSheet`)

- [ ] **Step 1: Tokens** — `"Needs attention"`, `"Pick a replacement"`, `"function venueNotifs"`. Checker → FAIL.

- [ ] **Step 2: Desk layout top→bottom**
  1. **Tonight card** — the locked event dated today: title, guests line ("18 confirmed · 2 waitlist"), one pill "Door →" (switches to door tab).
  2. **Needs attention** (SectionHead) — one row per: open event with un-swiped applicants ("Late Lounge · 24 to review →" → deck); expired/declined seat on a locked event ("Pool Day · a pick expired — pick a replacement →" → replacement deck). Seed shows both (Maya's pick row renders once her state is `expired` — flip her seed state to `expired` here so the row shows out of the box; the spec's "expiring" moment is demo'd via switchboard in Task 17).
  3. **Drafts** — existing list, rows now tap → `onEditDraft`.
  4. **Last recap teaser** — Sound Bath: "18 of 20 showed · 14 stories verified · recap →" (→ Recap, Task 9).
  Stat tiles re-wire: Applied (sum appliedTotal of open), To review (un-swiped count), Confirmed (tonight's confirmed), Rooms tonight.

- [ ] **Step 3: venueNotifs()** — derive Activity rows from state (not hardcoded): new applicants (open events), pick confirmed/declined/expired (locked events), story verified (past events), invoice due. Each row deep-links (sets tab / opens deck / opens recap). Bell badge = row count.

- [ ] **Step 4: Checker + browser + commit** — `git commit -am "feat(venue): stage-driven desk + derived activity feed"`

### Task 8: Door — pass codes, guests model, close the night

**Files:**
- Modify: `web/v2/venue.html` (`ScreenDoor`)

- [ ] **Step 1: Tokens** — `"Close the night"`, `"code"`. Checker → FAIL.

- [ ] **Step 2: Re-wire Door to the guests model** — segments Expected (`confirmed`) / In (`checked_in`) / No show (`no_show`) read tonight's locked event guests; check-in sets `state = checked_in` + `inAt:"22:41"`; rate flow writes `rating` onto the guest. Each Expected row shows the **pass code** (mono-style, e.g. `LST-4F`) right-aligned — door staff eyeballs it against the member's Pass.

- [ ] **Step 3: Close the night** — footer pill "Close the night →" → if any `checked_in` guest unrated → rating queue (existing rate sheet, sequential); then ConfirmDialog `title:"Close the night?"`, `body:"Unchecked guests become no-shows. The recap and invoice get built."` → confirm: remaining `confirmed` → `no_show`; event `stage = past`; build `recap` from guests (showed = checked_in count, noShows, avgRating from ratings) + `invoice:{...status:"due"}`; toast "Recap ready"; navigate to Recap.

- [ ] **Step 4: Checker + browser + commit** — `git commit -am "feat(venue): door codes + close-the-night → past + recap build"`

### Task 9: Recap screen (venue)

**Files:**
- Modify: `web/v2/venue.html` (new `ScreenRecap`, entries from Events past cards + Desk teaser)

- [ ] **Step 1: Tokens** — `"function ScreenRecap"`, `"Verified reach"`, `"Invoice"`. Checker → FAIL.

- [ ] **Step 2: Layout** (serif display title = event name, then):
  1. Tiles: Confirmed / Showed (e.g. "18 of 20") / No-shows / Avg rating.
  2. **Story wall** (SectionHead "Stories") — one row per checked-in guest: face, name, story state pill (Verified ✓ + screenshot thumbnail placeholder + "92 · Tag visible, posted in window" / In review / Needs review / Due / Missed). **Due vs Missed:** due = the 24h post-event window is still open (Sound Bath, last night); missed = window long gone (Vinyl Night's 2). Static seed distinction — no clock. Thumbnails: reuse the guest's face image as stand-in with a small "screenshot" frame treatment.
  3. **Verified reach** — biggest number on the screen (Cormorant display): sum of `instagram_followers` of verified-story guests → "412,000 verified reach".
  4. **Invoice block** — bundle name + price, status pill Due / Paid, "Settle via Whish / OMT / USD cash", "The List will contact you to settle."
  5. Wave 2 placeholder NOT included (Run it again lands in Task 22).

- [ ] **Step 3: Checker + browser + commit** — `git commit -am "feat(venue): recap screen — attendance, story wall, reach, invoice"`

### Task 10: Member browse — stage truth on Home / Explore / Event Detail

**Files:**
- Modify: `web/v2/index.html` (`ScreenHome`, `ScreenExplore`, `ScreenEventDetail`)

- [ ] **Step 1: Tokens** — `"List closed"`, `"Applications close"`, `"Withdraw"` is NOT yet required (wave 2). Append: `"STAGE_COPY"` usage check via `"List closed"`. Checker → FAIL.

- [ ] **Step 2: Badges + gating** — event cards (Home featured, Explore lead + rows) show stage badge from `STAGE_COPY`: Open / Closing soon (open + closesAt within 24h — add `closingSoon:true` flag on one seed) / List closed. Cancelled events don't render in browse lists.
**Event Detail**: applications-close line ("Applications close · Fri 30 May · 20:00"); the exchange block stays; locked + not mine → Apply pill disabled, label "The list is closed"; my relationship (from `myEvents`) overrides: applied → status pill instead of Apply; confirmed → "View pass →" pill (Task 12).

- [ ] **Step 3: Apply truth fix** — `onApply` now: sets `myEvents += { eventId, state: GS.applied }`, button flips to "Applied · under review", toast "Application sent". **It must NOT open ScreenPicked.** Then it arms the pick timer (Task 11).

- [ ] **Step 4: Checker + browser + commit** — `git commit -am "feat(member): stage badges, list-closed gating, honest apply"`

### Task 11: Member picked flow — notification-driven takeover

**Files:**
- Modify: `web/v2/index.html` (`ScreenPicked`, App state, `NotificationsSheet`)

- [ ] **Step 1: Tokens** — `"Confirm within"`, `"simulatePick"`, `"Decline"`. Checker → FAIL.

- [ ] **Step 2: simulatePick(eventId)** — App-level function: flips that myEvents row → `state: GS.picked, pickedAt: Date.now()`; pushes notif `{ kind:"picked", text:"Cyan Beach Club picked you · Late Lounge", eventId }`; bumps bell badge. Auto-armed 10s after apply (ref-stored timeout); also callable from the switchboard (Task 16).

- [ ] **Step 3: Takeover** — tapping the picked notification (or the My Events picked card) opens `ScreenPicked` for that event: keep the existing reveal choreography, add live countdown "Confirm within 23:41:02" (24h from pickedAt via the existing `Countdown` atom). **Confirm →** `state: GS.confirmed, code:"LST-7C"` (generated `LST-` + 2 chars), toast "You're in — pass ready", lands on My Events:Confirmed. **Decline** (ghost) → `state: GS.declined`, toast "Seat released", quiet return.

- [ ] **Step 4: Checker + browser** (apply on Late Lounge → 10s → notif → takeover → confirm → pass row appears) **+ commit** — `git commit -am "feat(member): picked-via-notification with confirm countdown + decline"`

### Task 12: Pass + Brief (member)

**Files:**
- Modify: `web/v2/index.html` (new `ScreenPass`, `ScreenMyEvents` confirmed cards, `ScreenHome` pinned night)

- [x] **Step 1: Tokens** — `"function ScreenPass"`, `"Show this at the door"`, `"function BriefBlock"`. Checker → FAIL.

- [x] **Step 2: ScreenPass** — full-screen (over tab bar, own back control), the ticket artifact:
profile photo (FramedImage circle), name (serif), event title + venue + area, date + "Doors 22:00", the code huge (`LST-4F`, Cormorant display size, letter-spaced), `BriefBlock`, footer line "Show this at the door". If guest state is `checked_in`: a quiet full-width "Checked in ✓ · 22:41" band replaces the footer. Entry points: My Events confirmed card "View pass →", Home pinned-night pill ("Doors 22:00 · View pass →"), pass notification row.

- [x] **Step 3: BriefBlock** — compact list: Arrival window / Dress code / Meeting point / House rules (only non-empty fields) + concierge line "Plans change? The List handles it." Rendered on the Pass AND inside the confirmed card's expanded detail.

- [x] **Step 4: Checker + browser + commit** — `git commit -am "feat(member): pass screen + brief block"`

### Task 13: My Events — the full status vocabulary

**Files:**
- Modify: `web/v2/index.html` (`ScreenMyEvents`)

- [x] **Step 1: Tokens** — `"Still under review"`, `"Story due"`, `"No strike"`. Checker → FAIL.

- [x] **Step 2: Cards by state** — segments stay Applied / Confirmed / Past; rows derive from `myEvents`:
Applied segment: `applied` ("Applied · under review"), `waitlist` ("Still under review"), `picked` (countdown chip "Confirm within 14h" + tap → takeover). Confirmed: `confirmed` (pass pill). Past: `checked_in` + story axis — story `due` = the **loudest card** (solid pill "Upload your Story →"), `review`/`needs_review`/`verified` pills, plus the quiet ones: `no_show`, `not_selected`, `expired`, `declined`, `withdrawn`, `cancelled` ("Event cancelled · no strike"). Every pill text from `GS_COPY`/`SS_COPY` — never hand-written strings.

- [x] **Step 3: Checker + browser** (all seeded states visible across the three segments) **+ commit** — `git commit -am "feat(member): full status vocabulary across my events"`

### Task 14: Story upload → AI verdict path (member)

**Files:**
- Modify: `web/v2/index.html` (new `StorySheet`)

- [x] **Step 1: Tokens** — `"function StorySheet"`, `"we check within a few hours"`, `"forceVerdict"`. Checker → FAIL.

- [x] **Step 2: StorySheet** — from the Story-due card: sheet with (1) the ask restated ("1 Story + venue tag — posted during the event"), (2) screenshot pick (FileReader → full-bleed preview, no crop), (3) "Submit →" → story `review`, line "Under review · we check within a few hours", sheet closes, card pill flips. 8s timer → default verdict **verified**: `verdict:{ score:91, reason:"Tag visible, posted in window" }`, notif "Story verified · Sound Bath", card pill "Verified ✓", toast with the reason. `forceVerdict(eventId, v)` App-level (switchboard): `needs_review` → pill "Needs review" + line "Our team takes a second look"; `rejected` → pill + "Rejected — try another screenshot" + the upload CTA returns.

- [x] **Step 3: Checker + browser** (upload demo on Sound Bath, all three verdicts reachable) **+ commit** — `git commit -am "feat(member): story upload with simulated AI verdict path"`

### Task 15: Member notifications — full model + deep links

**Files:**
- Modify: `web/v2/index.html` (`NotificationsSheet`)

- [x] **Step 1: Tokens** — `"function notifTarget"`. Checker → FAIL.

- [x] **Step 2: Rows + routing** — `notifs` state renders newest-first; `notifTarget(n)` maps kind → action: `picked`→ takeover, `pass`→ ScreenPass, `story`→ StorySheet (or My Events:Past if verified), `drop`→ Event Detail, `cancelled`→ My Events:Past, `expiring`→ takeover. Unread dot per row, badge = unread count, opening the sheet marks read. Seed additions: one `expiring` row text "Confirm your seat — 2h left · Late Lounge" appears only after a pick exists.

- [x] **Step 3: Checker + browser + commit** — `git commit -am "feat(member): notification model with deep links"`

### Task 16: Member switchboard

**Files:**
- Modify: `web/v2/index.html` (`SettingsSheet`)

- [x] **Step 1: Tokens** — `"function DemoPanel"`, `"Reset demo"`. Checker → FAIL.

- [x] **Step 2: DemoPanel** — at the very bottom of SettingsSheet, behind a quiet disclosure row "Demo" (chevron, collapsed by default, visually plain — deliberately not product UI). Rows (plain text buttons):
"Venue picks you now" → `simulatePick("lounge")` · "Expire a pick" → picked row → `expired` + quiet notif · "Check me in" → pool row → `checked_in` (Pass band flips) · "Story verdict: verified / needs review / rejected" (3 inline chips) → `forceVerdict("bath", …)` · "Reset demo" → restore MY_EVENTS/SEED_NOTIFS/EVENTS seeds (re-`useState` via a `resetKey` on App or explicit setters).

- [x] **Step 3: Checker + browser + commit** — `git commit -am "feat(member): hidden demo switchboard"`

### Task 17: Venue switchboard

**Files:**
- Modify: `web/v2/venue.html` (`ScreenVenueProfile`)

- [x] **Step 1: Tokens** — `"function DemoPanel"`, `"Reset demo"`. Checker → FAIL.

- [x] **Step 2: DemoPanel** (same tucked-away treatment, bottom of Venue tab): "New applicants arrive" → +6 `applied` guests onto the open event (cycle pool) + toast · "A pick declines" → one confirmed Pool Day guest → `declined` + Needs-attention row appears · "Advance to tonight" → flips Late Lounge `open → locked` (un-swiped → waitlist, any picked → confirmed with generated codes), making it tonight's second room on Desk + Door — the full stage transition, demoable in one tap · "Reset demo" → restore SEED_EVENTS.

- [x] **Step 3: Checker + browser + commit** — `git commit -am "feat(venue): hidden demo switchboard"`

### Task 18: Wave-1 mirror audit + docs

**Files:**
- Modify: `docs/agent/memory.md`, `docs/agent/plan.md`
- Verify: both v2 files

- [x] **Step 1: Mirror audit** — check the demo-world table (this plan, top) line by line against BOTH files: ids, stages, counts (137/24, 18+1+2, 20/18/2, 14+1+3), codes (`LST-4F`, `LST-9Q`), bundle prices, brief literals, reach 412,000, invoice statuses. Fix any drift (the table is law).

- [x] **Step 2: Full checker + browser pass** — `node web/v2/check-v2.mjs` → OK both. Browser: venue demo path end to end (post → review → close applications → door → close night → recap) and member end to end (apply → picked → confirm → pass → story → verified). List anything broken; fix before commit.

- [x] **Step 3: Docs** — memory.md new entry "Wave 1 shipped (complete night loop)" with one line per flow + known gaps; plan.md `[doing]` advances to wave 2. Commit: `git commit -am "feat(v2): wave 1 complete — the full night loop, both sides + docs"`

---

# WAVE 2 — money + meta (start only after Will reviews wave 1 in the browser)

### Task 19: Venue billing + insights

**Files:**
- Modify: `web/v2/venue.html` (`ScreenVenueProfile`, new `BillingSheet`)

- [ ] **Step 1: Tokens** — `"function BillingSheet"`, `"Insights"`. Checker → FAIL.
- [ ] **Step 2: BillingSheet** — Venue tab row "Billing →" opens a sheet: one row per past event with an invoice (title, date, bundle, price, Due/Paid pill), footer "Settle via Whish / OMT / USD cash — The List contacts you." **Insights** — three StatTiles on the Venue tab: Nights run (past count) / Show-up rate (avg showed/confirmed, "90%") / Verified reach (sum, "498k").
- [ ] **Step 3: Checker + browser + commit** — `git commit -am "feat(venue): billing list + insights tiles"`

### Task 20: Member invites + standing

**Files:**
- Modify: `web/v2/index.html` (`ScreenProfile`, new `InvitesSheet`)

- [ ] **Step 1: Tokens** — `"function InvitesSheet"`, `"Good standing"`, `"Your invites"`. Checker → FAIL.
- [ ] **Step 2: Standing block** on Profile: "Good standing · 0 strikes" + one line "A no-show is a strike. Three pause your account." + attendance mini-stats (Nights 12 / Shows 11 / Stories verified 9 — derive from myEvents where possible, seed the rest on SEED_PROFILE as `history:{nights:12, shows:11, verified:9}`).
**InvitesSheet**: Profile row "Your invites · 2 →" → sheet with 2 code rows (`SARA-1X` active, `SARA-2Y` active; a used example renders if state says so), share action reuses ShareSheet, copy line "Two a season. Spend them carefully."
- [ ] **Step 3: Checker + browser + commit** — `git commit -am "feat(member): invites + standing block"`

### Task 21: Tier gating + withdraw (member)

**Files:**
- Modify: `web/v2/index.html` (`ScreenExplore`, `ScreenEventDetail`)

- [ ] **Step 1: Tokens** — `"Tier 1"`, `"Withdraw application"`. Checker → FAIL.
- [ ] **Step 2: Tier gate** — SEED_PROFILE gains `tier:1`. `sunset` gains `tier:1` → quiet "Tier 1" pill on its Explore card (Sara passes, applies normally). Add ONE new seeded event `cellar` ("The Cellar", Lounge, stage open) with `tier:"founding"` → Explore card shows quiet "Founding" pill; Detail CTA disabled, label "Founding members only". **Withdraw** — on applied cards/detail while event open: quiet text action "Withdraw application" → confirm via `ConfirmDialog` (copy the atom from venue.html Task 4 into index.html — it doesn't exist there yet) → `state: GS.withdrawn`, toast "Application withdrawn".
- [ ] **Step 3: Checker + browser + commit** — `git commit -am "feat(member): tier-gated event + withdraw"`

### Task 22: Venue edit-open + run it again

**Files:**
- Modify: `web/v2/venue.html` (`ScreenEvents`, `ScreenPostEvent`, `ScreenRecap`)

- [ ] **Step 1: Tokens** — `"Run it again"`, `"Edit time & brief"`. Checker → FAIL.
- [ ] **Step 2: Edit-open/locked** — open/locked cards gain quiet action "Edit time & brief →" → wizard opens at basics with ONLY time + brief steps enabled (other steps render read-only summary rows); save → toast "Updated — guests see the new brief". **Run it again** — Recap footer pill → new draft prefilled from the past event (title + " · encore", same bundle/brief/image), lands in Drafts + wizard opens.
- [ ] **Step 3: Checker + browser + commit** — `git commit -am "feat(venue): edit time & brief on live events + run-it-again rebook"`

### Task 23: Wave-2 close-out

**Files:**
- Modify: `docs/agent/memory.md`, `docs/agent/plan.md`

- [ ] **Step 1: Full pass** — checker both files; browser walk of every wave-2 feature; mirror audit unchanged numbers still agree.
- [ ] **Step 2: Docs + commit** — memory entry "Wave 2 shipped"; plan.md advances ([doing] → DESIGN.md/PRODUCT.md Kit V.2 sync / backend session). `git commit -am "feat(v2): wave 2 complete — billing, insights, invites, tiers, withdraw, rebook + docs"`

---

## Verification doctrine (applies to every task)

1. `node web/v2/check-v2.mjs` after every implementation step — brackets, single root, required tokens, banned tokens (ice hex, Inter, Instrument Serif).
2. Browser eyeball per task (executor): boot both files via `python -m http.server 5555` from `web/v2/`, open `http://127.0.0.1:5555/index.html` and `/venue.html`. Babel/Tailwind console warnings are expected noise (errors.md).
3. Will's eyeball gates the waves: after Task 18 (wave 1) and Task 23 (wave 2).
4. No pushes without Will's explicit OK. Branch `v1-complete` until he merges.
