# v3 reskin — Ultraviolet (design spec)

**Date:** 2026-07-04 · **Source:** Claude Design direction 1c ("Ultraviolet"), file
`design-explorations/redesign-directions/redesign-directions.dc.html`, amended by Will (5 rulings,
memory 2026-07-04). **Scope:** aesthetics only — `web/v2/index.html` + `web/v2/venue.html`. No flow,
copy-meaning, or data changes except the two ruled tab renames and the Home header removal.

## Direction

After-hours signal. One sans everywhere, purple accent that *glows*, dotted rules, floating glass
pill dock, soft 20–24px radii, purple radial washes over a pitch-black ground. Dark stays primary.

## Will's amendments over stock 1c

1. **Plus Jakarta Sans everywhere** — Space Grotesk not adopted; Cormorant Garamond retired.
2. **Glass UI throughout** — existing `.glass` / `.glass-over-image` system re-tinted and extended
   (dock becomes floating glass pill). Translates to Liquid Glass in SwiftUI.
3. **Icons stay centralized** (HICONS map + `Icon` component already the only SVG source) —
   family swap remains a one-map edit. No new inline SVGs.
4. **Tabs: Tonight→Home, Index→Explore.** Invites, Profile unchanged. Venue tabs unchanged.
5. **Home header identity strip removed** ("Hi, Sara · The List · No. 048") — bell/search stay.

## Token table (var names keep — call sites don't churn)

| Var | Dark (was → now) | Light (was → now) |
| --- | --- | --- |
| --bg / --page | #000000 → #000000 (ruling holds) | #F7F6F3 / #F2F0EB → unchanged |
| --bg-elev | #1B1C1F → **#16131D** | #FFFFFF → unchanged |
| --bg-elev2 | #232428 → **#1E1A29** | #ECEAE3 → unchanged |
| --ink | #F7F6F3 → **#EEEBF6** | #1E1E1E → unchanged |
| --ink-2 | #EDECE6 → **#B4ACC9** | #454B52 → unchanged |
| --ink-mute | #D8D4C7 → **#7E7793** | #6A737D → unchanged |
| --line | cream 10% → **rgba(163,116,255,.16)** | ink 8% → **rgba(106,63,216,.14)** |
| --line-2 | cream 18% → **rgba(163,116,255,.32)** | ink 15% → **rgba(106,63,216,.26)** |
| --ice | #F7F6F3 → **#A374FF** | #2A2D31 → **#6A3FD8** |
| --ice-dim | #D8D4C7 → **#C0A7F5** | #454B52 → **#8560D6** |
| --ice-ink | #000000 → **#14092B** | #FFFFFF → unchanged |

## Type

- All display classes (`.font-black.font-black`, `.font-display`, `.font-display-l`, `.wordmark`)
  → Plus Jakarta Sans **700**, letter-spacing **-0.02em** (1c's display voice).
- `.font-mono` unchanged (Jakarta 600 tabular).
- Cormorant Google-Fonts link removed from both files. Checker bans the family name.

## Signatures

| Signature | Implementation |
| --- | --- |
| Dotted rules | `.hr`/`.hr-2` → `height:0; border-top:1px dotted var(--line-2)` (strong: `--line-2` at .45) |
| Glow readouts | dark-mode only: `.font-display-l` text-shadow `0 0 34px rgba(163,116,255,.35)`; `.chip-ice` box-shadow `0 0 18px rgba(163,116,255,.45)`; pulse anim re-tinted purple |
| Floating pill dock | `.tabbar` → floating (`left/right:16px; bottom:12px`), `border-radius:999px`, glass fill, no full-width gradient; light variant matches |
| Purple washes | `.page-bg` radials → rgba(163,116,255,.10/.06) dark, rgba(106,63,216,.05/.03) light |
| Radii | cards keep Tailwind classes; `.card` gets `border-radius` floor via existing classes — no global override (risk of clipping); new surfaces use 20–24px |
| Glass | `.glass` → rgba(22,19,29,.55) + blur(20px) + purple hairline; `.glass-over-image` border → purple-tint; `.card` fill #16131D (dark) with purple hairline via --line |

## Hard rules (unchanged unless listed)

Pitch black ground · sentence case · no Inter, no Instrument Serif, **now also no Cormorant, no
Space Grotesk** · tabular numbers on timers · statusbar exempt · demo data untouched.

## Verification

1. `node web/v2/check-v2.mjs` passes both files (checker extended: required `#A374FF`; banned
   `Cormorant`, `Space Grotesk`; all previous bans keep).
2. Playwright: member Home (no identity strip, dock reads Home/Explore/Invites/Profile), Event
   detail, Pass, venue Desk — dark + light, 393×852.
3. Eyeball vs `redesign-directions.dc.html` §1c.
