# Goal prompt — The List: SwiftUI build

Paste this into a fresh Claude session as the first message when the build starts.

---

You're building the native iOS app for **The List** — an iPhone app for the Lebanese nightlife
scene (clone of The Secret Society, Dubai). Venues post exclusive nights; vetted members apply;
venues pick; members confirm, show a door pass, attend, post an IG story as proof. Three
founders: Radwan (PR/DJ), Dima (database/sales), Will (tech — the only one in this chat).

Repo: `C:\Users\user\Documents\Me\the-list\` · remote `github.com/will-rads/the-list`.

## Preconditions — verify before anything else, stop if one fails

1. The v2 web prototype reskin is FINAL (check top of `docs/agent/memory.md` — if a redesign
   is still in flight, stop and ask Will).
2. Xcode 16+ and an iOS 17 simulator are reachable from this session (ask Will where builds
   run if unclear — this is a hard blocker, not something to work around silently).
3. Read order below completed.

## Read these, in order

1. `AGENTS.md` — how to talk and behave (caveman vocab, decisions not options, tables/arrows,
   no emojis, one ask at a time).
2. `docs/agent/context.md` — product, business model, founders.
3. `docs/agent/memory.md` — decision log, newest on top. Every standing ruling lives here.
4. `docs/agent/errors.md` — known pitfalls. Don't repeat them.
5. `web/v2/index.html` + `web/v2/venue.html` — **THE source of truth.** Every screen, state,
   copy string, number, and animation you build is defined here. The live copy is at
   the-list-omega.vercel.app/v2 and /v2/venue.
6. `docs/superpowers/specs/2026-06-11-v1-feature-complete-design.md` — the feature spec the
   prototype implements (lifecycle, picks, waitlist, pass, story verification, demo world).
7. `ios/README.md` — STALE (describes a v1 port). Keep the folder conventions if useful;
   this prompt supersedes its content.

## Mission

Port the v2 prototype to SwiftUI, **mock-first** — no backend calls in this phase. The app
must run the complete night loop offline, exactly like the prototype, including the hidden
demo switchboards (member: bottom of Settings; venue: Venue tab) so founders can pitch from
a phone. Member app first, venue app second — same project, role switch at entry.

## Hard rules — violating any of these is a failed task

| Rule | Detail |
| --- | --- |
| Pitch-black dark ground | `#000000` for bg/page/scrims in dark mode. Founder ruling. Cards keep their lift (`#1B1C1F` / `#232428`). |
| Fonts | **Plus Jakarta Sans everywhere** (Will's 2026-07-04 ruling with the 1c Ultraviolet reskin — Cormorant Garamond retired). Bundle as app resource — no system-font fallbacks in shipped UI. **Inter and Instrument Serif are permanently banned.** |
| Glass | Glass UI throughout — translucent blurred surfaces per the reskin; use native materials / Liquid Glass APIs, not faked overlays. |
| Icons | All icons route through ONE Icon component/map — family swap must be a one-file change. |
| Numbers | Plus Jakarta Sans 600 with tabular figures (`.monospacedDigit()` equivalent via font features) — timers must not jitter. |
| Sentence case | Everywhere in product UI. No all-caps labels. |
| Fidelity | Aesthetics, flows, copy, and mock data match `web/v2` exactly — same event names, pass codes (LST-4F, LST-9Q), seat counts, scores. Deviations require Will's sign-off, logged in memory.md. |
| Scope | No new features, screens, or copy. No backend. Cut list stands: no chat, QR, in-app payments, auto-IG verification, multi-venue switching. |

## Architecture — decided, don't relitigate

- iOS 17+, iPhone only, portrait only, light + dark (dark is primary).
- SwiftUI + Observation (`@Observable`), MVVM-lite: Views + observable stores, no heavyweight
  architecture. Value-type models mirroring the prototype's mock shapes (vendor-neutral).
- **Design tokens first:** one `Theme` namespace (colors, type styles, spacing, radii,
  hairlines) built from `web/v2`'s CSS `:root` tokens before any screen. No hex literal or
  magic number ever appears in a View.
- **Data behind protocols:** `EventService`, `ApplicationService`, `StoryService` etc. with
  `MockService` implementations carrying the demo world. Supabase implementations come in a
  later phase (project ref `zrbakomzpuesifasuamb`, eu-central-1 — do not wire it now).
- Demo switchboards drive the mock stores (pick now / expire / check in / story verdicts /
  advance to tonight / reset) — same actions as the prototype.

## Installed SwiftUI skills — use them

`.agent/skills/` in this repo carries: swiftui-ui-patterns, swiftui-view-refactor,
swift-concurrency-expert, ios-debugger-agent, swiftui-performance-audit,
**swiftui-liquid-glass** (use for the glass surfaces — the reskin's glass UI must map to
native materials), swift-architecture-skill, swift-testing-expert. Read the relevant skill
before its domain comes up; don't rediscover what they already encode.

## Process — mandatory

1. `superpowers:brainstorming` for anything this prompt leaves genuinely open (there should
   be little) → then `superpowers:writing-plans` → Will approves the plan → execute in waves
   with `superpowers:executing-plans`.
2. TDD (`superpowers:test-driven-development`) for all state logic: lifecycle transitions
   (Draft→Open→Locked→Past + Cancelled), application states (applied→picked→confirmed /
   expired→waitlist), countdown math, strike rules. Unit tests, not UI tests.
3. Every task ends with: project compiles, affected screens render in Preview AND simulator,
   screenshot compared against the same screen in `web/v2` (open it in a 393×852 viewport).
4. Wave gates: each wave ends demo-able on the simulator, Will eyeballs before the next.
5. Log decisions to `docs/agent/memory.md` (newest on top, dated), pitfalls to
   `docs/agent/errors.md`, as you go. Commit per task on a branch; never push without Will's
   explicit say-so.
6. After each wave, tell Will to run the Codex audit (`prompts/codex-swiftui-audit.md`)
   before the next wave starts.

## Ready check

After reading everything, reply with exactly:

```
Phase: <one line from docs/agent/plan.md>
Source of truth: <web/v2 commit hash you're porting>
Toolchain: <Xcode version + simulator you verified>
Plan: <one line — first wave scope you'll propose>
```

Then wait for Will's go.
