# Codex prompt — audit The List's SwiftUI build

Paste this into Codex after a Claude build wave finishes. Replace <BRANCH> if not on the
default working branch.

---

You are auditing a SwiftUI build, not restyling it. Another agent (Claude) ported a web
prototype to native iOS. Your job: find what's wrong, fix what's clearly broken, flag what's
debatable. You do NOT redesign, rename, re-architect, or "improve" working code.

Repo: `C:\Users\user\Documents\Me\the-list\` (branch <BRANCH>). App code: `ios/`.

## Ground truth — read before judging anything

1. `web/v2/index.html` + `web/v2/venue.html` — the reference implementation. The SwiftUI app
   must match these screens' look, states, copy, and numbers exactly. Live copy:
   the-list-omega.vercel.app/v2 and /v2/venue (393×852 viewport).
2. `docs/superpowers/specs/2026-06-11-v1-feature-complete-design.md` — behavior spec
   (lifecycle, picks/waitlist, pass, story verification, demo world numbers).
3. `docs/agent/memory.md` (newest on top) — standing rulings.
4. `docs/agent/errors.md` — known pitfalls already hit.

## Non-negotiable rules the build must satisfy — audit each explicitly

| Check | Pass condition |
| --- | --- |
| Pitch black | Dark mode ground/scrims are `#000000` (not `#121315`, not `.black` opacity tricks over grey). Card lifts `#1B1C1F`/`#232428` intact. |
| Fonts | Cormorant Garamond 600 for display, Plus Jakarta Sans for body — bundled, loading on device (not silently falling back to SF). Zero occurrences of Inter or Instrument Serif anywhere (grep the repo). |
| Numbers | Tabular figures on every timer/counter — verify a running countdown doesn't jitter horizontally. |
| Sentence case | No all-caps UI text (iOS status bar exempt). |
| Tokens | No raw hex/magic spacing in Views — everything routes through the Theme namespace. |
| Fidelity | Demo world numbers match the web prototype: pass codes LST-4F/LST-9Q, seat counts, scores (8.6, 91), event names, invoice states. |
| Scope | No features beyond the prototype. No backend calls (mock phase). No new dependencies that weren't flagged. |

## Method — do all of it, in this order

1. **Build:** clean build from scratch, treat warnings as findings. Note Xcode/SDK version.
2. **Static pass:** retain cycles (closures capturing stores), `@Observable`/state misuse
   causing over-rendering, force-unwraps, main-thread violations, dead code, previews that
   don't compile.
3. **Behavioral pass:** run the full night loop in the simulator using the hidden demo
   switchboards (member: bottom of Settings; venue: Venue tab): apply → pick → confirm
   countdown → pass + door code → check-in → story due → upload → verdicts (verified /
   needs review / rejected) → strikes; venue: wizard → applicant deck + undo + waitlist →
   desk → door → recap + invoice → advance-to-tonight. Any divergence from the web
   prototype's behavior at the same step is a finding.
4. **Visual pass:** screenshot member Home, Event detail, Pass, My Events (all states), and
   venue Desk/Door/Recap in BOTH light and dark; compare side-by-side against the live web
   `/v2` at 393×852. Layout drift, wrong lift colors, font fallbacks, misaligned hairlines —
   all findings.
5. **State-machine pass:** diff the lifecycle logic (Draft→Open→Locked→Past + Cancelled;
   applied→picked→confirmed/expired→waitlist) against the spec table-by-table. Run the unit
   tests; missing coverage on a transition is a finding.

## Output contract

1. Findings table, severity-ranked: `P0 crash/data-loss · P1 wrong behavior/rule violation ·
   P2 fidelity drift · P3 code health`. Each row: file:line, what, why it's wrong (cite the
   reference — spec section, memory ruling, or web/v2 behavior), fix.
2. **Fix P0 + P1 directly** (minimal diffs, matching the existing code's style and token
   system). Commit per fix with message `audit: <what>`. Do not push.
3. P2/P3: propose only — list, don't touch.
4. Append a dated entry to `docs/agent/errors.md` for any pitfall future sessions must know.
5. End with: build status, test count passed/failed, findings count by severity, and the one
   thing you'd fix next if you had another hour.

Do not modify anything under `web/` — the web prototype is the reference, never the patient.
