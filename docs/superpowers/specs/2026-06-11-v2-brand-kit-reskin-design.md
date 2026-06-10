# v2 brand-kit reskin — design spec

Date: 2026-06-11. Approved by Will in chat. Source of truth: `Brand Kit Proposal/The List - Kit V.2 (Low Res.).pdf` (page renders in `Brand Kit Proposal/_pages/`).

## Scope

- `v2/index.html` + `v2/venue.html` — byte-copies of `web/*`, **functionality untouched**, aesthetics swapped to Kit V.2.
- `web/` stays as-is (v1, live on Vercel). v2 is local-only for now.
- Asset paths in v2 point to `../web/assets/...` (no asset duplication).

## Will's rulings (override the kit where they conflict)

| Topic | Ruling |
| --- | --- |
| Body/UI font | **Plus Jakarta Sans stays.** Kit says Inter; Inter remains banned everywhere. |
| Grey text | **Kit's grey hierarchy approved** ("try it"): secondary + tertiary greys return. |
| All-caps | **Never.** Sentence case everywhere (kit's own tracked-caps labels get sentence-cased). |
| Accent | Kit wins: ice blue dies in v2. Monochrome anthracite/cream. The 2026-06-10 gradient exploration is archived (`design-explorations/accent-direction.html`). |
| Icons | Keep inlined Heroicons outline (= kit family 06.0 minimal line). 06.1 "trendy" optional later. |
| Primary theme | Dark stays primary (nightlife; kit cover is dark). Light is a true sibling. |

## Tokens (replace existing `:root` / `html.light` values)

Dark = "Warm Cream Scale" (primary):

| Var | Value | Note |
| --- | --- | --- |
| `--bg` | `#121315` | kit dark bg |
| `--bg-elev` | `#1B1C1F` | derived surface |
| `--bg-elev2` | `#232428` | derived surface 2 |
| `--ink` | `#F7F6F3` | primary text |
| `--ink-2` | `#EDECE6` | secondary (kit CTA tone) |
| `--ink-mute` | `#D8D4C7` | tertiary (kit highlight) |
| `--line` | `rgba(247,246,243,0.10)` | hairline |
| `--line-2` | `rgba(247,246,243,0.18)` | hairline 2 |
| `--ice` | `#F7F6F3` | accent = warm cream (var name kept so call sites don't churn) |
| `--ice-dim` | `#D8D4C7` | |
| `--ice-ink` | `#121315` | text on accent fills |
| `--page` | `#0D0E10` | page behind phone |

Light = "Anthracite Scale":

| Var | Value |
| --- | --- |
| `--bg` | `#F7F6F3` |
| `--bg-elev` | `#FFFFFF` |
| `--bg-elev2` | `#ECEAE3` |
| `--ink` | `#1E1E1E` |
| `--ink-2` | `#454B52` |
| `--ink-mute` | `#6A737D` |
| `--line` | `rgba(30,30,30,0.08)` |
| `--line-2` | `rgba(30,30,30,0.15)` |
| `--ice` | `#2A2D31` (brand anthracite; CTA hover family `#454B52`) |
| `--ice-dim` | `#454B52` |
| `--ice-ink` | `#FFFFFF` |
| `--page` | `#F2F0EB` |

All ice-blue rgba literals (`rgba(159,216,232,…)`, `rgba(38,118,143,…)`, `rgba(111,181,201,…)`, `#9FD8E8`, `#26768F`, `#6FB5C9`, `#4DE3FF` etc.) must be replaced: glows become quiet neutral shadows (`rgba(0,0,0,…)` dark / `rgba(30,30,30,…)` light) or soft cream/anthracite rings (`rgba(247,246,243,.18)` dark / `rgba(42,45,49,.22)` light). No neon. Editorial restraint.

## Typography

- Add Google Fonts link: `Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600` (keep the Plus Jakarta Sans link).
- **Serif (Cormorant Garamond 600)**: `.font-display-l`, `.font-display`, `.font-black` → `font-family:'Cormorant Garamond', Georgia, serif; font-weight:600; letter-spacing:-0.01em`. Screen titles, hero/event/venue names, the reveal moments, big numbers on stat tiles optional (see below).
- **Sans (Plus Jakarta Sans)**: body, labels, buttons, tabs, captions, `.stamp`, `.section-label`, inputs. Unchanged family; weights per kit roles (body 400, caption/label 500, emphasis 600-700).
- **Numbers** (`.font-mono`): Plus Jakarta Sans 600, `tabular-nums` allowed again for timers. Stat-tile big numbers may go Cormorant 600 for editorial flavor — builder's eye, consistent per file pair.
- Kit scale guide: display ~64, heading ~40, title ~28, body 16, caption 14, micro 12. Existing sizes are close; nudge only where cheap.

## Sentence case (hard rule)

Remove every `uppercase` utility class and `text-transform:uppercase`, and the wide `tracking-[.18-.22em]` that goes with them. Labels become sentence case at the same size, `letter-spacing: normal` (max 0.02em). This includes: `.stamp`, `.smallcaps`, buttons, tab bar labels, status pills, badges, chips, statusbar is exempt (it's the OS clock). Copy itself: first word capitalized, rest lowercase ("Request access", "Open for swipe", "No show").

## Components (kit page 04/05)

- **Primary buttons**: pill, accent fill (`--ice`/`--ice-ink`), sentence case, weight 600, **trailing arrow** (`arrow-right` icon) on main CTAs (Apply, Request access, Start swiping, Post room, Confirm). Secondary/ghost: 1px `--line-2` border, no arrow.
- **Cards**: light mode = solid `#FFFFFF` fill, `--line` border, soft shadow `0 10px 30px -18px rgba(30,30,30,.25)`; dark = `#1B1C1F` fill (solid, not translucent), border `--line`, shadow `0 16px 36px -24px rgba(0,0,0,.8)`. Venue/event names inside cards go Cormorant 600.
- **Badges/tags**: kit style "• Popular" — leading dot + sentence case, pill, `--bg-elev2` fill.
- **Progress/steps**: numbered filled circles (1-2-3-4) joined by a hairline, current = accent fill. Apply to the venue post-event wizard step indicator and influencer onboarding steps.
- **Notification badge**: accent-fill circle with number (already close).
- **Wordmark**: eyebrow brand marks ("The List · No. 048", intro wordmark) set in Cormorant Garamond 600, sentence case is exempt for the brand name ("The List"). Intro hero wordmark large serif; "T:L" monogram may appear as small brand mark (styled text, not image — the PDF is too low-res to crop).
- **Glass**: keep frosted glass ONLY on floating controls + tab bar (existing rule); tint it to the new palette (cream-tinted dark glass / warm white glass). No new glassmorphism.

## Out of scope

Functionality, flows, copy meaning, data, icon swaps beyond restyling, web/ (v1), deployment.

## Verification

Static: zero `9FD8E8|26768F|6FB5C9|Satoshi|Host Grotesk|Inter[^ T]|uppercase` (except statusbar/OS chrome), fonts links present, JSX balanced. Visual: Will eyeballs from disk (`v2/index.html`, `v2/venue.html`); browser tooling currently unavailable in agent env.
