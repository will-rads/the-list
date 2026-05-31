# Memory — decisions & current state

Running log. Newest entry on top. Date format: `YYYY-MM-DD`.

---

## Current state (one line)

Prototype polished: Phosphor thin icons, frosted glass + restrained ice glow, one-word headers. Flow/data untouched. Awaiting Will's local review before deploy. Live (pre-polish) still at `the-list-omega.vercel.app`.

---

## 2026-05-31 — shared iOS agent skills installed

Installed 8 repo-local iOS skills under `.agent/skills/` so Claude Code, Codex, or any other agent can use the same project skill library:

- `swiftui-ui-patterns`
- `swiftui-view-refactor`
- `swift-concurrency-expert`
- `ios-debugger-agent`
- `swiftui-performance-audit`
- `swiftui-liquid-glass`
- `swift-architecture-skill`
- `swift-testing-expert`

`AGENTS.md` now tells agents to read `.agent/skills/<skill-name>/SKILL.md` when Will invokes a skill. `.agent/skills/README.md` documents sources, use cases, recommended order, and the third-party-skill safety note.

---

## 2026-05-30 — colorize + truth-telling states + reveal split + dates + error path

Worked the audit backlog + the "what would you improve" list. All in `web/index.html`. Light theme kept (Will's call).

- **colorize (light-theme contrast, verified AA via node WCAG calc):** light `--ice` `#4FA8C5` → **`#26768F`** (white-on-ice + ice-as-text both 5.16:1), light `--ink-mute` `#7A7A7A` → **`#696969`** (5.04:1 on cards), added light `--ice-dim`. Dark theme untouched (already passed). DESIGN.md token + prose updated.
- **#2 truth-telling (apply ≠ in):** My Events first segment renamed **Invited → Applied**; added an "Under review · applied 2h ago" pending card (with "Not every application is picked" note) and a muted/grayscale **"Not selected"** row in Past (no score, "venue picked others"). Design call: rejection stays a quiet status, not a full-screen takeover — keeps Picked as the one peak.
- **#3 reveal hierarchy:** onboarding "Tier One" ring is now a quiet **outlined credential** (no pulsing halo); the Picked "You're in" ring keeps the filled + pulse celebration. Getting picked > initial acceptance.
- **#5 dates:** canonical "today" = Sunday 25 May (matches Explore active day + featured). Home header `Saturday · 24.05` → `Sunday · 25.05`; Sound Bath + Late Lounge `Fri · 23` → `Sun · 25`.
- **#4 onboarding error/retry:** `mockCreatorDataFetch` now rejects for handles `fail`/`notfound`/`error` (deterministic demo trigger); `submit()` try/catch → new `error` step ("Couldn't read that." + "Try another handle" → back to phone). **List skeletons deliberately deferred** — the lists are synchronous seed data; faking loading would be theater and flash on every nav. The only real async (creator-data fetch) already has its "Reading" loading screen. Skeletons land with the Supabase fetch.

Static-checked (balanced brackets, all onboarding states present). Not visually verified — Playwright MCP never connected, npm/curl SSL-blocked; opened in Will's browser. Demo tip: type handle `notfound` to see the error path.

---

## 2026-05-30 — impeccable audit + icon swap (Phosphor → Heroicons)

**Audit of `web/index.html`: 13/20 (Acceptable).** Damage concentrated in a11y + the light theme. Verified contrast numbers (node WCAG calc), which corrected an earlier wrong assumption:

- **Dark theme passes** — bone 17.6:1, bone-2 10.9:1, bone-mute 5.73:1, ice 12.7:1. (My earlier "bone-mute ~4.0:1" note was wrong; fixed in DESIGN.md.)
- **Light theme is the real debt (P1):** white text on `--ice` `#4FA8C5` = **2.71:1** (primary buttons + accent numbers fail); `--ink-mute` `#7A7A7A` = 3.9-4.3:1 (fails small-text AA).
- Other P1: icon-only buttons have no `aria-label`; no `:focus-visible` ring.
- P2: reduced-motion only guards `.stagger` (ringPop/pulseIce/spin/anim-fade/slideUp/sheetIn unguarded — corrects a DESIGN.md overclaim); inputs not label-associated; `.card` puts backdrop-blur on every card (violates our own Glass-Is-For-Floating rule); images not lazy-loaded.
- Recommended fixes: `/impeccable colorize` (light palette), `/impeccable harden` (a11y), `/impeccable polish` (card-blur, lazy-load, eyebrow density). NOT yet applied — audit only documents.

**Icon family swapped Phosphor → Heroicons (outline).** Will rejected Lucide then Phosphor; Heroicons chosen as the closest free stand-in for SF Symbols (the SwiftUI target). Now **inlined as SVG** (zero icon CDN dependency — removed the Phosphor `<script>`). Path data pulled from `unpkg heroicons@2.1.5/24/outline` via `node --use-system-ca` (curl/npm were SSL-cert-blocked in this sandbox). `Icon` rewritten to a `HICONS` name-map; call sites unchanged. compass→map, search→magnifying-glass, settings→cog-6-tooth, sliders→adjustments-horizontal; **instagram is a custom inline mark** (Heroicons has no brand glyphs). Added `aria-hidden` on icons (folds in an audit P3). Not visually verified from agent env — opened in Will's browser.

---

## 2026-05-30 — impeccable document: DESIGN.md + sidecar written

Ran `/impeccable document` (scan mode, tokens extracted from `web/index.html`). Created `the-list/DESIGN.md` (Stitch 6-section format + YAML token frontmatter) and `the-list/.impeccable/design.json` (sidecar: tonal ramps, shadow/motion tokens, 8 live-renderable component snippets, narrative).

Two creative calls locked with Will:

- **Creative North Star: "The Midnight Editorial"** (fashion magazine printed for the dark).
- **Depth = restrained accent** (glass on floating controls only, ice glow on active/pressed only, flat at rest). Drives the Elevation doctrine.

Captured tokens (canonical = the prototype's hex vars): carbon black `#0A0A0A` / bone `#F5F1EA` / ice `#9FD8E8`; Satoshi 900 display+numeric, Host Grotesk body. Named rules: One Cold Voice (ice <=10%), Warm-White (no pure white text), Two-Family, One-Word Header, Flat-At-Rest, Glass-Is-For-Floating. All PRODUCT.md anti-refs carried into Don'ts verbatim.

Contrast debt re-flagged in DESIGN.md: Bone Mute `#8A8A8A` on carbon ~4.0:1 (below 4.5 for small body). `/impeccable audit web/index.html` is the next obvious pass.

---

## 2026-05-30 — impeccable init: PRODUCT.md written

Ran `/impeccable init`. Created `the-list/PRODUCT.md` (strategic design context for the impeccable skill).

- **Register locked: `product`** (app UI — design serves the app; the editorial flavor doesn't make it a brand/marketing surface).
- Users / purpose / brand personality / anti-references pulled straight from existing `docs/agent/context.md` + `errors.md` (no new decisions there).
- **Accessibility default set: WCAG AA + `prefers-reduced-motion`** + ice-blue never the sole state signal. Will was unsure, so this is the working default — not founder-ratified. Revisit at SwiftUI build.
- Flagged contrast debt (muted grey + white-on-image) as the first `/impeccable audit` target.

Note: impeccable scripts live at the `Me` level; PRODUCT.md lives at the product root (`the-list/`). Future `/impeccable` commands should run with `the-list` as the working dir or the context script won't find it. DESIGN.md not yet generated.

---

## 2026-05-30 — Polish pass on `web/index.html` (no flow change)

Visual-only pass. Flow, copy (beyond headers), and creator-data/provider logic untouched.

1. **One-word headers** (sentence → word):
   - Explore "All open rooms in Beirut." → **Index** (dropped the duplicate small "Index" eyebrow)
   - My Events "My List" → **Invites**; Filter sheet "Refine the index." → **Filters**
   - Onboarding 3 states: "Apply for access." → **Apply**, "Reading your audience." → **Reading**, "You're on the list." → **Listed**
   - **Tab bar also aligned** (decision, flagged for Will): "My List" → Invites, "Me" → Profile. Tonight/Index already matched. Revert if only in-screen headers were wanted.

2. **Depth (TSS-style, no purple/pink):**
   - `.glass` frosted controls (Home search, Explore Filters pill, My Events calendar)
   - Tab bar now translucent + `blur(22px)` + subtle ice top-glow; active tab icon glows ice
   - `.card` = translucent black + 1px glass border + softer shadow; applied to list/featured/past/confirmed/verify/country-tile cards
   - `.glow-ice` on active pills/days/chips; `.glow-primary` on ice CTAs — **active + pressed only**, not resting
   - Ornamental ice dot-grid via `body::before`, radial-masked so it only shows outside the (opaque) phone
   - `.press` hover micro-interaction added

3. **Icons: Lucide → Phosphor** (web-font CDN `@phosphor-icons/web@2.1.1`). Rewrote `Icon` to emit `ph-thin/ph-light/ph` classes (weight from old `stroke` prop — thin default, no fills). `PH_NAMES` map keeps every call site's old lucide name working (search→magnifying-glass, settings→gear-six, share→share-network, calendar→calendar-blank, instagram→instagram-logo). Removed the innerHTML/`createIcons` pattern.

**Not visually verified from agent env** — Playwright MCP didn't connect, npm cert-blocked (no esbuild/headless). Static-checked all edited classNames + confirmed no Lucide remnants. Opened in Will's browser for eyeball. Not pushed.

---

## 2026-05-30 — Creator-data UX wired, provider deliberately not locked

Decision: **the prototype now shows the real UX** (type handle → 2-second fetch → profile auto-populates with followers, engagement, audience split), **but we do NOT lock the vendor yet.**

Provider candidates, ranked by current lean:

| Candidate | Why it's interesting | Why we haven't picked |
| --- | --- | --- |
| **Phyllo** | Two modes from one vendor (Identity API + Connect SDK for OAuth). Cheap at beta volume. Drop-in OAuth means we don't have to do Meta App Review ourselves. | Haven't trialed it. Pricing assumptions unverified. |
| **Modash** | Largest indexed creator DB (~250M). Fast to integrate. | Flat $99/mo even at 30 users — expensive in beta. |
| **Ensembledata** | Cheapest per-lookup ($0.01–0.05). Lightweight data. | Less rich than the others. Real-time only, no historical. |
| **HypeAuditor** | Strong fake-follower detection — useful for vetting. | Heavy pricing ($399/mo+). Overkill until volume justifies. |

Rejected outright:

- **Direct IG scraping** — violates IG ToS, Meta DMCAs apps, App Store pulls. Hard no.
- **Manual review by Dima** — rejected by user. Want production-ready, zero manual in the happy path.

Prototype changes shipped:

- New `mockCreatorDataFetch(handle)` function returns the normalized response shape after a 2.4s simulated network call. Drop-in replaceable with a real `fetch()` once backend exists.
- `ScreenProfile` reads from `profile` prop instead of hardcoded values. Falls back to Sara seed if no profile (handles Skip-onboarding demo path).
- "Verify with Instagram" upgrade strip shown on Profile when `data_status === "estimated"`. Disappears when verified.
- Profile badge shows "Self-reported · Tier 1" until OAuth, then "Verified · Tier 1".
- `.env.example` uses generic `CREATOR_DATA_PROVIDER` + `CREATOR_DATA_API_KEY` first. Vendor-specific keys (Phyllo, Modash, Ensembledata) live in a commented block below — uncomment whichever we pick.

Backend integration still to build — out of prototype scope. The client doesn't know which vendor backs the data, so swapping is one Edge-function change.

---

## 2026-05-30 — Agent docs moved out of root

Moved project working docs from root into `docs/agent/`:

- `context.md`
- `plan.md`
- `memory.md`
- `errors.md`

Root stays reserved for `README.md` and `AGENTS.md`, which are the files humans and agent tooling should find first. Updated README, AGENTS, Claude starter, and Codex starter prompts to point to the new paths.

---

## 2026-05-28 — Font system locked + scroll bug fixed

Body font swapped to **Host Grotesk** (matching the LAU MarketMind webapp at `C:\Users\user\LAU\LAU Applied AI Final Project\webapp-final`). Reasons:

- Geist Mono looked too "techy" and added a third font family
- Host Grotesk is a friendlier sans, pairs cleanly with Satoshi, used in Will's other production project so brand voice carries across

Headers: **Satoshi** (500 / 700 / 900) — kept.
Numbers / timers: **Host Grotesk with `tabular-nums`** — no separate mono family.

CSS structure:

- `body` → Host Grotesk 400
- `.font-black` / `.font-display` → Satoshi 900 letter-spacing -0.015em
- `.font-mono` aliased to Host Grotesk + tabular-nums (kept as class so JSX still works)
- `.stamp` → Host Grotesk 500 small-caps

Scroll fix: status bar, tab bar, sticky Apply CTA, and home indicator now sit as **siblings** of the scroll container, not children. Previously they were positioned `absolute bottom-0` inside an `overflow-y-auto` div — which makes them stick to the bottom of the *scrolled content*, not the visible viewport edge. New pattern wraps everything in a `<PhoneScreen>` component.

---

## 2026-05-28 — Live on Vercel

Deployed `web/` directory as the Vercel root. Live URL: `the-list-omega.vercel.app`. Root Directory setting in Vercel had to be edited post-import (wasn't set during the GitHub auto-import flow). `vercel.json` adds `cleanUrls: true` so `/gallery` and `/mockup-v1` resolve without `.html`.

---

## 2026-05-27 — Initial repo scaffold

Created the repo at `github.com/will-rads/the-list` (public). Moved all existing assets into:

- `web/gallery.html` — Claude design version (was `The List.html`)
- `web/mockup-v1.html` — original carbon black + ice blue + Satoshi
- `research/screenshots/` — 10 TSS screenshots
- `research/voice-notes/` — Radwan's WhatsApp voice notes
- `research/secretsociety.jpeg`, `research/review-full.jpeg`
- `docs/plan-breakdown.md` — synthesis of Radwan's pitch
- `docs/secret-society-research.md` — TSS public knowledge brief
- `docs/transcripts/transcripts.json` + `transcribe.py`

Wrote `README.md`, `AGENTS.md`, `context.md`, `plan.md`, `memory.md` (this file), `errors.md`. Wrote `prompts/claude-starter.md` + `prompts/codex-starter.md`. Wrote `.gitignore` + `.env.example`.

---

## 2026-05-26 — Design v1 image swap

Took the original mockup-v1 (Carbon Black + Ice Blue + Satoshi, picsum random images) and swapped 9 unique placeholder URLs for curated Unsplash venue photos from the Claude design version. Both dark and light rows now use the same curated set. Image set: `pool`, `beachClub`, `cocktail`, `restaurant`, `lounge`, `saraFull` — venue-appropriate, magazine-quality.

---

## 2026-05-26 — Light mode + density on Claude design

Took `The List.html` (the Claude-design version with acid lime + Instrument Serif). Added:

- Light mode via `html.light` CSS class
- Theme toggle pill top-right of the page
- Tab bar gradient flips with theme
- Killed § 03 "The room reads you back" applicant pile on Event Detail (redundant with "137 applied" in meta rail)
- Shortened § 01 paragraph
- Reduced § 02 exchange rules from 3 → 2

Outcome: less crowded, light + dark both viewable.

---

## 2026-05-26 — Two design directions diverged

Two reference HTMLs now exist:

- **mockup-v1.html** — Will's original brief (Carbon Black, Ice Blue, Satoshi). 12 phones, dark+light side-by-side.
- **gallery.html** (was The List.html) — Claude design's interpretation (Acid Lime, Instrument Serif italic). 6 phones, single mode (now with light toggle added).

Will prefers mockup-v1's color/font system but liked gallery.html's image selection. Image swap merged the two.

Open: font choice for v1 build. Instrument Serif feels AI-flavored. Options:

- Drop the serif entirely. Geist + Geist Mono only.
- Swap to Fraunces (free, more characterful).
- Paid display face later (Söhne, PP Editorial New, Tobias).

---

## 2026-05-26 — Apply + Swipe model confirmed

After seeing The Secret Society's actual venue-side UI (10 screenshots from Radwan once he got accepted):

- Influencers don't claim spots FCFS. They **apply**, then venue swipes Tinder-style.
- Reputation scoring exists: Punctuality / Presentation / Joviality (each ~10).
- Venue marks each attendee CHECKED IN / CHECKED OUT / NO SHOW.
- One brand can manage many establishments.

Locked: we copy this structure exactly. Wedge is in visual language + Lebanon-local + the limited-spot drop framing.

---

## 2026-05-19 — Pitch received

Radwan sent 9 WhatsApp voice notes (10:06-13:02 UTC+3) pitching the idea. Transcribed via Gemini 3 Flash, batched in a single multi-clip request for context preservation. Transcripts at `docs/transcripts/transcripts.json` (Arabizi + English).

Founding team: Radwan / Dima / Will. 33.33% × 3. Decisions need all three.

---

## Standing rules (don't break these)

- No purple or pink gradients in any UI. TSS's biggest visual weakness.
- No Inter font. Anywhere.
- No Instrument Serif unless explicitly approved (too AI-flavored as of 2026).
- iPhone-first. No Android in v1. No web app for end users in v1.
- Brand pays. Influencer free. Don't experiment with this.
- v1 is Beirut only.
- Story requirement is **1 Story + tag**, not 4. The 4-Story rule is TSS's biggest weakness.
