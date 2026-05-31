# Memory — decisions & current state

Running log. Newest entry on top. Date format: `YYYY-MM-DD`.

---

## Current state (one line)

Prototype `web/index.html` complete + all 10 UI audit items done. **Type/color system overhauled (Will's call): single font Plus Jakarta Sans, headers bolder, zero grey text, ice accent kept.** Tailwind `.font-mono` override fixed; Pool Day image optimized to `./assets/pool-day.jpg` (committed `f2610a6`, local only). Locked docs (`DESIGN.md`/`PRODUCT.md`/`AGENTS.md`) synced to the new system. `web/index.html` uncommitted, not pushed. **Phase: user/founder review of the prototype, before push/deploy.** Next: review → push + deploy (Vercel) **only on Will's explicit OK, branch first** → SwiftUI planning.

---

## 2026-05-31 — Follow-up fixes: Tailwind `.font-mono` override, grey round-2, Pool Day image

Iterated on the same-day font change below. Final state of `web/index.html`:

- **Tailwind `.font-mono` collision fixed.** cdn.tailwindcss.com ships its own `.font-mono` utility (system monospace stack) that overrode our custom `.font-mono` at equal specificity (0,1,0, Tailwind wins on source order) → numbers were literally rendering in **system monospace**. Fixed with a doubled selector **`.font-mono.font-mono`** (0,2,0). Also dropped `tabular-nums` + forced weight so numbers read like body. Logged in `errors.md`.
- **No-grey cleanup, round 2.** The earlier token swap missed hardcoded `rgba(245,241,234,.5/.6)` text greys on the Home featured card (the `·` separator + "seats · applied") — flattened to `var(--ink)`. Remaining alpha-greys on Profile "member since" + the Picked reveal screen left intentionally (pending Will's call — they may be intended peak-moment hierarchy).
- **Pool Day image.** `./assets/pool-day.png` was a 2.6 MB file that painted black/slow and caused screenshot timeouts. Re-encoded with Pillow → **`./assets/pool-day.jpg`** (800×1000, 159 KB), repointed `IMG.beachClub`. Staged + committed (`f2610a6` on `main`, local only, not pushed). Original png still tracked.

Verified in preview :5555: body + display + numbers all resolve to Plus Jakarta Sans (`document.fonts` loaded), numbers no longer monospace, jpg loads complete. Screenshot still times out (page width, not the image) — verified via computed styles.

---

## 2026-05-31 — Font system replaced + greys killed (Will's call, overrides locked DESIGN.md)

Will overruled the locked two-family system and the grey hierarchy. `web/index.html` only — visual/CSS, not pushed. (Also reverted an undocumented Inter typography test a prior session had left in the working copy, before applying this.)

- **One font: Plus Jakarta Sans** across the whole app — body, labels, numbers/timers (`.font-mono` keeps `tabular-nums`), tabs, status bar, section labels, theme toggle. Dropped Satoshi + Host Grotesk and both font links; loaded Jakarta 400–800. Headers go bolder (display 800, `.font-mono` 700, body 400). Jakarta tops out at 800, so the Tailwind `font-black` utility's 900 clamps to the 800 face — harmless, looks identical.
- **No grey text.** `--ink-2` and `--ink-mute` both repointed to `--ink` (bone `#F5F1EA` in dark / black `#0A0A0A` in light) in both themes — kills every token grey in one move, 50 call sites untouched. Removed 4 opacity-dimmed text spots (lead time, "seats" unit, venue label, onboarding helper) that still read grey. Hierarchy now carried by size + weight only.
- **Ice kept** (`#9FD8E8` dark / `#26768F` light) on key numbers + primary buttons. Will confirmed "only black and white" meant text, not the accent.
- Non-text greys now inherit ink (fine): bottom-sheet drag-handle (ink@.4), audience male-split bar (now bone vs ice female), disabled-CTA label.

Verified in browser (preview :5555): `document.fonts` = loaded, check 400/800 true, body+display+stamp resolve to Plus Jakarta Sans, no leftover Satoshi/Host links, `--ink-2`/`--ink-mute` = bone. Screenshot tool timed out (known big-page issue) — verified via computed styles instead.

**Open for Will:** (1) dark-mode "white" kept as warm bone `#F5F1EA`, not pure `#FFFFFF` (the old Warm-White rule) — say if you want pure white. (2) `DESIGN.md` / `PRODUCT.md` / `AGENTS.md` still document the two-family + grey system and now contradict the prototype — update them on your OK.

---

## 2026-05-31 — UI audit fixes #5/#6/#7/#9/#10 (remaining items, Will's call to do all)

Closed out the last 5 audit items in `web/index.html`. Visual/CSS/markup only — no flow/data/provider/onboarding/routing/iOS change. Dark primary. Not pushed. Will audits next, then asks to push.

- **#5 Unify floating-control glass:** the Event Detail header buttons (back/bookmark/share) had a one-off inline glass (`rgba(10,10,10,.45)`/`blur(8px)`/border .25) different from everything else. Added a canonical **`.glass-over-image`** class (dark + light) — the single recipe for a control floating over a *photo*, distinct from `.glass` (floats over the app bg). Routed all three buttons through it; `.profile-glass` now shares the same base (keeps its own text-color contract). One over-image glass, not three.
- **#6 Home masthead:** Home had no display header while Index/Invites/Profile do. Gave it the one-word header **"Tonight"** (`font-display-l` 40px, matches Index) under the `The List · No. 048` eyebrow, with the date baseline-aligned right and search kept. Matches the One-Word Header rule (which already names "Tonight" for Home) and the Home tab label.
- **#7 Light-theme refinement:** light `.card` edge firmed (border `.06 → .12`, fill `.62 → .78`, tighter shadow) so cards read as objects on white, not flat panels. Active/press glows in light now key off the deep ice **`#26768F`** (`rgba(38,118,143,…)`) as a tight ring, not the bright dark-theme halo (`.glow-ice`, `.glow-primary`, card-hover border). Dark theme untouched.
- **#9 Editorial spacing rhythm:** broke the near-uniform section cadence on the most-stacked screens — Event Detail "The exchange" `pt-7 → pt-8`; Profile "Audience" `pt-6 → pt-7` and "Recent" `pt-6 → pt-9` (ascending air toward the final block). Generous between sections, tight within; 20px gutter (`px-5`) untouched.
- **#10 Numeric/timer polish:** new **`Countdown`** component renders timers with tighter, dimmed colons (opacity .4) so the tabular digits carry the weight — wired into Event Detail "Closes in" and Picked "Confirm within" (was `04 : 56 : 12` spaced). Encoded the **ice text-vs-fill rule** in a comment + demoted the Exchange ordinals `01/02` from ice to ink-mute (ordinals/labels are never ice; ice = the one *value* number). Net: less ice, tighter to the ≤10% budget.

Static-checked: all edited regions re-read + balanced, `Countdown`/`.glass-over-image` resolve, grep confirms no leftover spaced timers or bespoke button glass. **Not visually verified from agent env** (no browser render). Served at `http://127.0.0.1:5555/` for Will to eyeball. DESIGN.md updated with `.glass-over-image` + the ice text/fill rule.

---

## 2026-05-31 — UI audit fix #3 (Explore rhythm)

Killed the "identical card grid" tell on Explore (`ScreenExplore`). No flow/data/sort/provider/routing/iOS change — visual restructure only, reusing existing card vocabularies. Dark primary. Not pushed.

- **Before:** 5 identical 200px full-bleed image cards in `space-y-4` → reads as a template grid.
- **After:** `[lead, ...rest] = list`. **Lead** = first room as one tall 300px full-bleed editorial card (34px `font-display-l` title, badge + type chips, ice date/seats rail). **Index** = the rest as denser horizontal rows (reuses the Home "Also tonight" row: 14×16 thumb + type stamp + title + venue·area, right rail = ice seats + time).
- **Rhythm:** generous `pt-6` gap after the lead, tight `space-y-2` between rows (tight-within / generous-between, per the layout ref). Lead appears instantly; rows keep the `stagger`.
- **Ice rationed:** rows show ice on seats only (the scarcity number), date/time stay muted — keeps ice ≤10% and "one number worth reading."
- Added a quiet empty state (`list.length === 0`) for future filters; current chips all match ≥1 so it won't fire in demo.

Meta rail above ("{n} rooms · Sorted · closes soonest") unchanged — now reads as the index masthead over the lead. List order untouched (lead = `list[0]`, same first item as before), so no sort-logic change.

Static-checked: JSX balanced, `lead`/`rest`/`e.*` all resolve, all classes (`card`/`grain`/`font-display-l`/`stamp`/`font-mono`/`press`) pre-exist — no new CSS. **Not visually verified from agent env** (no browser render). Served at `http://127.0.0.1:5555/` for Will to eyeball.

---

## 2026-05-31 — UI audit fixes 1/4/2/8 (premium-editorial pass)

Executed 4 of the 10 ranked audit fixes in `web/index.html`. No flow/data/provider/onboarding/routing/iOS changes. Dark stays primary. Not pushed.

- **#1 Flat-At-Rest:** removed `backdrop-filter: blur(6px)` from resting `.card` (was glassmorphism-on-everything, violating our own Glass-Is-For-Floating rule). Bumped fill to `rgba(26,26,26,.66)` so cards still read elevated without blur. Floating glass (top controls, tab bar) keeps its blur.
- **#4 Eyebrow reduction:** added a calmer `.section-label` style (Satoshi 700, 14px, sentence-case) and converted the 4 recurring section dividers (Also tonight, The exchange, Audience, Recent) from tracked-uppercase `.stamp`. Removed the redundant "Personal" eyebrow above the Invites header. `.stamp` kept for true value labels (When/Doors/Seats, form labels, statuses).
- **#2 Profile stat strip:** replaced the 3 equal metric columns (hero-metric SaaS cliché) with an asymmetric editorial block — Reputation `9.4` as a 64px ice hero, Followers + Engagement as a smaller muted right-aligned pair. Same data + verified/estimated logic untouched.
- **#8 Tab bar:** removed the active ice dot + its CSS; active state now ice icon + glow + bone label only (one signal, "status without shouting"). Theme-toggle dot (separate) untouched.

Verified: script brackets balanced, all states present. Preview served at `http://127.0.0.1:5555/` (python, web/). Fixes 3,5,6,7,9,10 from the audit still open.

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
