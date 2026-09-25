# The List

A Lebanese clone of *The Secret Society* (Dubai). An invite-only nightlife marketplace where models / influencers / DJs apply to time-boxed events at clubs, restaurants, beach clubs and gyms. Venues swipe through applicants and pick who they want. Limited spots. Heavily discounted or free access in exchange for posting Instagram Stories.

iPhone-first. V3 is the only active product: React for the browser and Capacitor for iOS packaging. The existing SwiftUI scaffold is preserved and paused.

**Venue UX, 2026-09-23 (branch `venue-ux-simple`, not deployed):** the venue side was rebuilt around three jobs (post an event, pick who comes, let them in) with Home, Events and Venue tabs, a real swipe deck, a door list and a summary. Spec: [`docs/superpowers/specs/2026-09-23-venue-ux-simple-design.md`](docs/superpowers/specs/2026-09-23-venue-ux-simple-design.md).

**Build, 2026-09-20:** full-screen mobile layout, flow fixes, and the Vite production build pass checks. The Capacitor iOS project is generated and synced. Will approved publishing this build with version-free member `/` and venue `/venue` links. Deployment verification is recorded in `docs/agent/memory.md`. Native compilation and device testing remain pending.

## How to use this folder

| If you want to… | Read |
| --- | --- |
| understand the product + business + history | [`docs/agent/context.md`](docs/agent/context.md) |
| know the design register, brand, principles | [`PRODUCT.md`](PRODUCT.md) |
| know the visual system (colors, type, components, rules) | [`DESIGN.md`](DESIGN.md) |
| see the roadmap + current phase | [`docs/agent/plan.md`](docs/agent/plan.md) |
| track work needed for App Store launch | [`docs/app-store-launch-checklist.md`](docs/app-store-launch-checklist.md) |
| review the Phyllo feasibility report | [`docs/phyllo-feasibility.md`](docs/phyllo-feasibility.md) |
| catch up on what was decided when | [`docs/agent/memory.md`](docs/agent/memory.md) |
| avoid known pitfalls | [`docs/agent/errors.md`](docs/agent/errors.md) |
| know how Claude & Codex should behave here | [`AGENTS.md`](AGENTS.md) |
| start a fresh chat with an agent | [`prompts/`](prompts/) |

## Subfolders

- [`web/`](web/) – Active V3 React app and Vite build; `v3/member.jsx` + `v3/venue.jsx`, founder ops, and public teaser. Capacitor configuration lives here; its iOS wrapper belongs in `web/ios/`.
- [`archive/web/`](archive/web/) – Preserved V1/V2 prototypes and their assets. Reference only.
- [`ios/`](ios/) – Paused SwiftUI scaffold with mock services. No new port or Supabase binding work planned.
- [`docs/agent/`](docs/agent/) — agent working context: product context, plan, memory, and errors.
- [`docs/`](docs/) — research and source material (TSS research, transcripts of Radwan's voice notes, plan-breakdown).
- [`research/`](research/) — raw inputs (TSS app screenshots, voice notes, reference images).
- [`prompts/`](prompts/) — starter prompts to paste into a fresh Claude or Codex chat.
- [`.agent/`](.agent/) — shared agent config, launch settings, worktrees, and project skills.

## Local web development

From `web/`: `npm ci`, then `npm run dev`. `npm run build` checks the sources and mutation regressions, then creates `dist/`; `npm run preview` serves that build. Member and venue demos use `/?demo=1` and `/venue?demo=1`.

`npm run test:mobile` checks demo journeys at 390x844 and 320x568 against a server on port 5173 (`BASE_URL` overrides it). Add `SHOTS_DIR=<folder>` to save a screenshot of each venue screen. Install the test browser with `npx playwright install chromium`, or set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to an existing Chromium executable. The test blocks backend writes; authenticated production testing is separate.

`npm run test:venue-live` runs the logged-in venue app against a fake Supabase in the browser, with two phones on one account. It covers swiping, double taps, failed saves, failed refreshes after a save, door sync, closing the event, optional ratings, same-day posting, picking from a closed list with empty seats, and needs-review Stories after payment. Nothing reaches the real backend.

Capacitor uses the same built web assets: `npm run ios:sync`, then `npm run ios:open` on a Mac. The generated app targets iPhone / iOS 17+ and keeps the existing `co.thelist.app` ID. Its icon and splash are still the template defaults. See the [launch checklist](docs/app-store-launch-checklist.md) for signing, device, and TestFlight work.

## Founders

- **Radwan Ali** — PR / DJ / image / venue relationships
- **Dima Bareface** — model database + sales channel (250-300 contacts)
- **Will Radiyeh** — product / tech / AI

33.33 / 33.33 / 33.33. Decisions need 2-of-3.

## Repo

https://github.com/will-rads/the-list
