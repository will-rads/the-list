# v3 reskin — Frosted glass (design spec)

**Date:** 2026-07-04 · **Source:** Will's ruling same day — Ultraviolet (858813a) not convincing;
strip the purple hue, go frosted glassmorphism over a photo ground. Reference for component
language only: `research/inspo-2.jpeg` (frosted panels, pill shapes, hairline borders — NOT its
pink palette). **Scope:** aesthetics only — `web/v3/index.html` (member, forked from the
Ultraviolet v2 member file). Venue follows after Will approves. No flow, copy, or data changes.

## Direction

Monochrome frosted glass. Every surface is translucent glass (blur + saturate) floating over one
full-bleed photo ground. No hue anywhere — accent is pure white. The photo is a PLACEHOLDER:
Will supplies the final image; swapping it must be a one-line edit.

## Photo ground (the one new mechanic)

- `:root` gets `--bg-photo: url("https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=900&auto=format&fit=crop");`
  (existing in-app venue shot, dark bar — placeholder ONLY, marked `/* PLACEHOLDER — Will swaps */`).
- Inside `.iphone-screen`: one fixed photo layer (replaces `.page-bg` purple radials) — image
  `var(--bg-photo)` cover-centered + scrim. Dark scrim `rgba(0,0,0,.62)`; light theme scrim
  `rgba(247,246,243,.55)`. All screens sit over it; `--bg`/`--page` stay `#000000` as fallback.

## Token table (var names keep — call sites don't churn)

| Var | Dark (ultraviolet → glass) | Light (ultraviolet → glass) |
| --- | --- | --- |
| --bg / --page | #000000 (holds) | #F7F6F3 / #F2F0EB (hold) |
| --bg-elev | #16131D → **rgba(255,255,255,.07)** | #FFFFFF → **rgba(255,255,255,.62)** |
| --bg-elev2 | #1E1A29 → **rgba(255,255,255,.12)** | #ECEAE3 → **rgba(255,255,255,.45)** |
| --ink | #EEEBF6 → **#F4F4F6** | #1E1E1E (holds) |
| --ink-2 | #B4ACC9 → **#C2C3CC** | #454B52 (holds) |
| --ink-mute | #7E7793 → **#8B8C97** | #6A737D (holds) |
| --line | rgba(163,116,255,.16) → **rgba(255,255,255,.14)** | violet 14% → **rgba(30,30,30,.12)** |
| --line-2 | rgba(163,116,255,.32) → **rgba(255,255,255,.28)** | violet 26% → **rgba(30,30,30,.24)** |
| --ice | #A374FF → **#FFFFFF** | #6A3FD8 → **#1E1E1E** |
| --ice-dim | #C0A7F5 → **#D8D9DF** | #8560D6 → **#454B52** |
| --ice-ink | #14092B → **#000000** | #FFFFFF (holds) |

Elevated surfaces (`--bg-elev`/`--bg-elev2` call sites, `.card`, sheets, tab bar, chips) must
carry `backdrop-filter: blur(22px) saturate(1.4)` (+ `-webkit-` twin) — glass, not paint. Where a
class already exists (`.glass`, `.glass-over-image`, dock), re-tint neutral; keep radii 20–24px.

## De-purpling (complete, not partial)

- Kill every `rgba(163,116,255,…)` / `rgba(106,63,216,…)` literal and `#A374FF` `#6A3FD8`
  `#C0A7F5` `#8560D6` `#14092B` `#16131D` `#1E1A29` inline occurrence file-wide.
- Glow text-shadow / chip box-shadow → white at low alpha (`rgba(255,255,255,.22)` glow) or drop.
- Purple radial washes → gone (the photo is the atmosphere).
- Pulse/selected/focus rings → white-based (`rgba(255,255,255,.35)`).

## Keeps (Will's standing rulings)

Plus Jakarta Sans everywhere (one family, 700 display / 600 mono-numbers) · sentence case ·
dotted rules · floating glass pill dock · centralized HICONS icons · tabs Home/Explore/Invites/
Profile · statusbar exempt · demo data untouched · no Inter, Instrument Serif, Cormorant,
Space Grotesk.

## Checker (`web/v3/check-v3.mjs`, forked from check-v2)

- Scope: `index.html` only (drop the venue entry until the venue pass).
- REQUIRED adds: `--bg-photo`, `backdrop-filter`.
- REQUIRED removes: `#A374FF`, `#6A3FD8` (the purple pair moves to BANNED).
- BANNED adds: `#A374FF`, `#6A3FD8`, `163,116,255`, `106,63,216`.
- All prior bans + parse gate keep.

## Verification

1. `node web/v3/check-v3.mjs` passes.
2. Playwright 393×852: Home, Event detail, Pass, My Events, sheets — dark + light. Glass panels
   visibly translucent over the photo (blur observable), text contrast holds on every screen.
3. Grep gate: zero purple literals; `backdrop-filter` present on card/dock/sheet surfaces.
