# The List

A Lebanese clone of *The Secret Society* (Dubai). An invite-only nightlife marketplace where models / influencers / DJs apply to time-boxed events at clubs, restaurants, beach clubs and gyms. Venues swipe through applicants and pick who they want. Limited spots. Heavily discounted or free access in exchange for posting Instagram Stories.

iPhone-first. The live member + venue web app runs on Supabase; the SwiftUI app is scaffolded and CI-compiled, with Supabase binding queued for Mac day.

## How to use this folder

| If you want to… | Read |
| --- | --- |
| understand the product + business + history | [`docs/agent/context.md`](docs/agent/context.md) |
| know the design register, brand, principles | [`PRODUCT.md`](PRODUCT.md) |
| know the visual system (colors, type, components, rules) | [`DESIGN.md`](DESIGN.md) |
| see the roadmap + current phase | [`docs/agent/plan.md`](docs/agent/plan.md) |
| catch up on what was decided when | [`docs/agent/memory.md`](docs/agent/memory.md) |
| avoid known pitfalls | [`docs/agent/errors.md`](docs/agent/errors.md) |
| know how Claude & Codex should behave here | [`AGENTS.md`](AGENTS.md) |
| start a fresh chat with an agent | [`prompts/`](prompts/) |

## Subfolders

- [`web/`](web/) — Live HTML/React app: member + venue in `v3/`, plus founder ops in `admin.html`.
- [`ios/`](ios/) — SwiftUI app (mock-first, CI green; Supabase binding pending Mac day).
- [`docs/agent/`](docs/agent/) — agent working context: product context, plan, memory, and errors.
- [`docs/`](docs/) — research and source material (TSS research, transcripts of Radwan's voice notes, plan-breakdown).
- [`research/`](research/) — raw inputs (TSS app screenshots, voice notes, reference images).
- [`prompts/`](prompts/) — starter prompts to paste into a fresh Claude or Codex chat.
- [`.agent/`](.agent/) — shared agent config, launch settings, worktrees, and project skills.

## Founders

- **Radwan Ali** — PR / DJ / image / venue relationships
- **Dima Bareface** — model database + sales channel (250-300 contacts)
- **Will Radiyeh** — product / tech / AI

33.33 / 33.33 / 33.33. Decisions need 2-of-3.

## Repo

https://github.com/will-rads/the-list
