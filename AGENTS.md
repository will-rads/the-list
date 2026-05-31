# Agents — rules for Claude & Codex

How Claude (Anthropic) and Codex (OpenAI / GPT-5) should behave inside this repo.

---

## How to talk

| Rule | Bad | Good |
| --- | --- | --- |
| Caveman vocab | "Leveraging a marketplace dynamic to drive demand-side conversion" | "Venue pays us. Models post Stories. Both happy." |
| Decisions, not options | "We could do A, or B, or maybe C with some tweaks…" | "Do A. Reason: cheapest. If we hate it, swap to B." |
| Tables + arrows over paragraphs | 4 paragraphs of analysis | `A → B → C` or a 3-row table |
| One ask at a time | 6 questions in a row | One question. Wait. Then next. |
| No filler | "Great question! Let me think about that…" | Just answer. |
| No emojis | 🚀💡✨ | none |

## When you start work

Always say:
1. **What changed** since last turn (1 line)
2. **What's next** in the plan (1 line)
3. Then the actual work

That's it. No preamble.

## When you finish work

Always say:
- What got done (1-2 lines)
- What's blocked or pending (1 line, if anything)
- Next decision needed from Will (if any)

## Hard rules

- Read `docs/agent/context.md`, `docs/agent/plan.md`, and `docs/agent/memory.md` at the start of every fresh chat. Never assume context.
- Write decisions into `docs/agent/memory.md` as you go. Newest entry on top. Date format `YYYY-MM-DD`.
- Write avoidable mistakes into `docs/agent/errors.md` so the next chat doesn't repeat them.
- Don't rebuild what already exists. Check `web/` and `docs/` before suggesting "let me create X."
- Don't push to GitHub without explicit confirmation.
- Don't commit secrets. Use `.env` (gitignored). Update `.env.example` instead.

## Tech choices already locked

| Layer | Choice |
| --- | --- |
| Prototype | HTML + React via CDN + Tailwind CDN |
| Mobile app | SwiftUI (iOS-first, no Android v1) |
| Backend (planned) | Supabase (auth + Postgres + storage + realtime) |
| Voice / transcription | Gemini 3 Flash |
| Design fonts | TBD (NOT Inter, NOT Instrument Serif — too AI-flavored) |
| Design accent | TBD (was acid lime, currently exploring ice blue) |

## Skills available

- Shared project skills live in `.agent/skills/<skill-name>/SKILL.md`.
- When Will asks to use one, read that skill file first, then follow its references as needed.
- `frontend-design` — distinctive HTML/Tailwind prototypes
- `gpt-taste` — opinionated motion-rich landing pages
- `ui-ux-pro-max` — mobile + web component patterns
- `superpowers:brainstorming` — before any creative build
- `superpowers:writing-plans` — before any multi-step task
- `superpowers:test-driven-development` — when SwiftUI work begins
- `swiftui-ui-patterns` — build native SwiftUI screens and components
- `swiftui-view-refactor` — split and clean SwiftUI view files
- `swift-concurrency-expert` — async/await, actors, Sendable, MainActor
- `ios-debugger-agent` — simulator build/run/debug workflow
- `swiftui-performance-audit` — janky lists, image loading, invalidation, layout cost
- `swiftui-liquid-glass` — iOS 26+ Liquid Glass UI polish
- `swift-architecture-skill` — choose architecture boundaries and playbooks
- `swift-testing-expert` — Swift Testing, XCTest migration, flaky async tests

## Who does what in the founding team

| Person | Owns |
| --- | --- |
| Radwan | venues, image, PR, brand voice |
| Dima | database, model relations, sales |
| Will | product, tech, prototype, the build |

When Will writes "Radwan said X" or "Dima said Y" — treat as primary source. He's the only one in the chat.
