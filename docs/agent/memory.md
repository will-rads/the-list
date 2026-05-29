# Memory — decisions & current state

Running log. Newest entry on top. Date format: `YYYY-MM-DD`.

---

## Current state (one line)

Prototype live at `the-list-omega.vercel.app`. Onboarding now mocks the real Phyllo Identity API response shape. Profile screen reads dynamically from that response. Tap-through flow works (Home → Detail → Apply → Picked → My List).

---

## 2026-05-30 — Phyllo locked as creator-data provider

Decision: use **Phyllo** for IG audience data. Two modes from the same vendor:

| Mode | Used for | UX |
| --- | --- | --- |
| **Phyllo Identity API** | v1 onboarding | User types handle → backend calls Identity → 28k followers + estimated 62% F / 38% M / country split returned in ~2s. No user OAuth. |
| **Phyllo Connect SDK** | Tier-upgrade later | User taps "Verify with Instagram" → Phyllo handles IG Graph API OAuth → estimated data replaced with real Meta numbers. Profile badge flips from "Self-reported" to "Verified". |

Rejected alternatives:

- **Direct IG scraping**: violates IG ToS, Meta DMCAs apps, App Store pulls. Hard no.
- **Modash**: $99/mo flat — more expensive than Phyllo at our beta volume (~30-300 users). Phyllo's per-lookup model wins until ~3k active.
- **Manual review by Dima**: rejected. User wants production-ready, zero manual.

Pricing reality:

| Stage | Users | Phyllo monthly |
| --- | --- | --- |
| Demo / pre-launch | 30 testers | $0 (free tier) |
| Beta with Dima's list | 300 | ~$15-30 |
| Public launch | 3,000 active | ~$150-300 |

Prototype changes shipped:

- New `mockPhylloFetch(handle)` function returns Phyllo-shaped response after 2.4s simulated network call. Drop-in replaceable with real `fetch()` once backend Edge function exists.
- `ScreenProfile` now reads from `profile` prop instead of hardcoded values. Falls back to Sara seed if no profile (handles Skip-onboarding demo path).
- "Verify with Instagram" upgrade strip shown on Profile when `data_status === "estimated"`. Disappears when verified.
- Profile badge shows "Self-reported · Tier 1" until OAuth, then "Verified · Tier 1".
- `.env.example` gains `PHYLLO_CLIENT_ID`, `PHYLLO_CLIENT_SECRET`, `PHYLLO_ENV`.

Backend integration still to build (Supabase Edge function calling Phyllo) — not in prototype scope.

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
