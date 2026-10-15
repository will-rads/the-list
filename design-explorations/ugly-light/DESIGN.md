# The List: design rules (draft, 2026-10-10)

Draft. Lives here until Will locks it, then moves to the repo root and replaces the legacy `DESIGN.md`.

## Brand

Exclusive, playful, local. A members' list with a wink. Clean, never retro.

## Color

Three colors: true black (`#000`), white, pink. Nothing else. No grey, no eggshell, no graphite. Light and dark mode, switched in the app's top bar.

| Token | Light | Dark | Job |
| --- | --- | --- | --- |
| `--ground` | `#FFFFFF` | `#000000` | Screen background |
| `--card` | `#FFFFFF` | `#000000` | Cards, inputs, chips (same as ground) |
| `--edge` | `#000000` | `#FFFFFF` | 1px line around cards, inputs, chips, dividers |
| `--fg` | `#000000` | `#FFFFFF` | All text and icons |
| `--do` | `#000000` | `#FFFFFF` | Main action fill |
| `--pink` | `#FFD3EA` → `#FF7FBF` | same | Hype and status only (135° gradient, light to deeper pink, no purple) |

- Black (white in dark mode) = do. One filled main button per screen.
- Pink = hype: saves, picked, spots left, stickers, notification dots. Never a button, never text color.
- Pink always has a 1px black outline and black text. Measured: black on pink 11:1, pink on white only 1.78:1, so the outline is what makes it visible.
- Hierarchy comes from size and weight, not grey.

## Shape

- Cards 28px radius. Dialogs 32px. Photos 22px, small thumbnails 14px.
- Buttons, chips, inputs, search, badges, toasts: full pill (999px).
- Avatars are circles.
- Cards match the background. A thin 1px black line (white in dark mode) is the edge.

## Material

- Flat. No shadows, no frosted cards.
- Glass only on the bottom tab bar: card color at 70% with blur.

## Type

- One family: Plus Jakarta Sans. Titles 800, body 400, labels 500/700. Matches the AGENTS.md One-Family Rule.
- Titles: line-height 1.1, tracking -0.02em. Body: 1.45 to 1.5, tracking 0.
- Inputs 16px on phones so iOS does not zoom.
- Changing numbers (seats, counts, scores) use tabular figures.

## Motion

- Press feedback on touch-down: scale 0.98.
- Sheets and screens use springs with no bounce. Bounce only after a flick.
- Reduced motion: fades instead of slides.

## Reference

Corner (Mobbin screenshots from Will): took the black pills, light pink stickers and pill shapes. Dropped its blurred map and frosted sheets.
