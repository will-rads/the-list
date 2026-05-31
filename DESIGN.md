---
name: The List
description: An invite-only Beirut nightlife marketplace, dressed as a fashion magazine printed for the dark.
colors:
  carbon-black: "#0A0A0A"
  page-black: "#050505"
  surface: "#141414"
  surface-2: "#1C1C1C"
  bone: "#F5F1EA"
  bone-2: "#C5C0B5"
  bone-mute: "#8A8A8A"
  hairline: "#F5F1EA1A"
  hairline-2: "#F5F1EA2E"
  ice: "#9FD8E8"
  ice-dim: "#6FB5C9"
  ice-ink: "#0A0A0A"
  ice-light: "#26768F"
typography:
  display:
    fontFamily: "Satoshi, ui-sans-serif, system-ui"
    fontSize: "3.25rem"
    fontWeight: 900
    lineHeight: 0.92
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Satoshi, ui-sans-serif, system-ui"
    fontSize: "2.5rem"
    fontWeight: 900
    lineHeight: 0.95
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Satoshi, ui-sans-serif, system-ui"
    fontSize: "1.375rem"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Host Grotesk, ui-sans-serif, system-ui"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "normal"
  label:
    fontFamily: "Host Grotesk, ui-sans-serif, system-ui"
    fontSize: "0.625rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.22em"
  numeric:
    fontFamily: "Satoshi, ui-sans-serif, system-ui"
    fontSize: "1.125rem"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "-0.01em"
rounded:
  sm: "10px"
  md: "12px"
  lg: "14px"
  xl: "18px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  gutter: "20px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.ice}"
    textColor: "{colors.ice-ink}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "58px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.bone}"
    rounded: "{rounded.pill}"
    height: "58px"
  chip-ice:
    backgroundColor: "{colors.ice}"
    textColor: "{colors.ice-ink}"
    rounded: "{rounded.pill}"
    padding: "6px 12px"
  chip-outline:
    backgroundColor: "transparent"
    textColor: "{colors.bone}"
    rounded: "{rounded.pill}"
    padding: "0 12px"
    height: "32px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.bone}"
    rounded: "{rounded.xl}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.bone}"
    rounded: "{rounded.md}"
    height: "48px"
  glass-control:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.bone}"
    rounded: "{rounded.pill}"
    size: "40px"
---

# Design System: The List

## 1. Overview

**Creative North Star: "The Midnight Editorial"**

The List is a fashion magazine printed for the dark. The page is carbon black, the type is bone-white and set with editorial confidence, and a single cold accent (ice blue) does all the pointing. It is a consumer nightlife app, so a handful of screens are emotional peaks (the "You're in" reveal, the tier reveal) and earn real choreography, while the browsing surfaces stay calm, fast, and dense. The feeling to chase is quiet status: you are holding something other people are not on.

Everything is built on standard iOS app affordances (bottom tab bar, apply buttons, a swipe model, a bottom sheet) so the app is instantly legible. The distinctiveness lives entirely in the typeface pairing, the carbon-and-bone palette, the rationing of ice blue, and the copy, never in reinvented controls. Depth is handled with restraint: surfaces are flat at rest; frosted glass appears only on floating top controls and the tab bar; ice glow appears only on active and pressed states. The light theme exists as a true daytime inversion, not a separate identity.

This system explicitly rejects The Secret Society's purple-pink gradient cosplay, dating-app energy, coupon/discount-app urgency, and generic SaaS gradient heroes. No Inter. No Instrument Serif. No emoji in the UI.

**Key Characteristics:**
- Carbon black surfaces, bone-white text, one cold accent
- Editorial display type (Satoshi 900) against a quiet humanist body (Host Grotesk)
- Ice blue rationed to actions, current selection, and state, never decoration
- Flat at rest; glass and glow only as a response to floating-ness or interaction
- A few choreographed moments; the rest is calm tooling

## 2. Colors

A nocturnal monochrome (carbon to bone) with exactly one chromatic voice: ice blue.

### Primary
- **Ice Blue** (`#9FD8E8`): The only saturated color in the system. Carries primary actions (Apply, Confirm, Enter), the current selection (active filter, selected day), state indicators (seats remaining, reputation score), and the emotional reveal rings. **Ice Ink** (`#0A0A0A`) is the text/icon color placed on top of ice fills. **Ice Dim** (`#6FB5C9`) is the muted step for secondary ice text. In the light theme the accent deepens to **Ice (Light)** (`#26768F`) so white button text and ice accent numbers clear AA on white (5.16:1).

### Neutral
- **Carbon Black** (`#0A0A0A`): The app surface (the phone screen). The default ground for everything.
- **Page Black** (`#050505`): The deep ground outside the device frame, where the ornamental texture lives.
- **Surface** (`#141414`) and **Surface 2** (`#1C1C1C`): Tonal layering for cards, inputs, sheets, and chips. In practice cards render these as a translucent black over carbon (see Elevation).
- **Bone** (`#F5F1EA`): Primary text. A warm off-white, never pure `#FFFFFF`, which is what gives the screen its editorial paper feeling.
- **Bone 2** (`#C5C0B5`): Secondary text, captions, sub-labels.
- **Bone Mute** (`#8A8A8A`): Tertiary text, metadata, inactive tab labels. On Carbon Black this measures 5.73:1 and passes AA. Its light-theme counterpart `--ink-mute` was retuned to `#696969` (5.04:1 on cards) after the audit caught the old `#7A7A7A` failing AA.
- **Hairline** (`#F5F1EA1A`, 10%) and **Hairline 2** (`#F5F1EA2E`, 18%): Dividers and 1px borders. The system separates with light hairlines, not boxes.

### Named Rules
**The One Cold Voice Rule.** Ice blue is the only chroma in the system and appears on roughly 10% or less of any screen. Its rarity is the entire point: when something is ice, it is either the one action that matters or the one number worth reading. The moment a second accent hue appears, the system is broken.

**The Warm-White Rule.** Text is Bone (`#F5F1EA`), never pure white. Pure `#FFFFFF` only ever appears as the app surface in the light theme, never as text on dark.

## 3. Typography

**Display Font:** Satoshi (with `ui-sans-serif, system-ui` fallback)
**Body Font:** Host Grotesk (with `ui-sans-serif, system-ui` fallback)
**Numeric:** Satoshi 900 with `tabular-nums` (no separate mono family)

**Character:** A geometric-grotesque display (Satoshi at 900) paired with a quieter humanist sans for reading (Host Grotesk). The contrast is on weight and role, not on two competing personalities: Satoshi shouts the editorial headlines and the numbers, Host Grotesk handles everything you actually read. Numbers reuse Satoshi 900 with tabular figures so timers and stats feel thick and intentional, keeping the family count at two.

### Hierarchy
- **Display** (Satoshi 900, ~3.25rem / 52px, line-height 0.92, -0.025em): Hero event titles, the onboarding one-word headers (Apply / Reading / Listed), the profile name.
- **Headline** (Satoshi 900, ~2.5rem / 40px, line-height 0.95, -0.015em): Screen titles (Index, Invites), featured card titles.
- **Title** (Satoshi 900, ~1.375rem / 22px, line-height 1): Meta-rail numbers, section headers, in-card titles.
- **Body** (Host Grotesk 400, ~0.875rem / 14px, line-height 1.45): Descriptions, list rows, helper copy. Cap prose at 65-75ch.
- **Label** (Host Grotesk 500, ~0.625rem / 10px, letter-spacing 0.22em, UPPERCASE): The `.stamp` eyebrow used for section markers (When, Doors, Audience), tab labels, badges. Reserve uppercase for these short labels only.
- **Numeric** (Satoshi 900, tabular-nums): Seats, timers, follower counts, reputation scores, dates.

### Named Rules
**The Two-Family Rule.** Satoshi and Host Grotesk only. A third typeface (including a serif or a true mono) is forbidden; numeric needs are met by Satoshi 900 tabular figures. Inter is banned outright; Instrument Serif is banned outright.

**The One-Word Header Rule.** Screen headers are a single editorial word (Tonight, Index, Invites, Profile, Apply, Reading, Listed, Filters), not a sentence. The supporting sentence, if any, lives in body copy below.

## 4. Elevation

The system is flat at rest and conveys depth through three deliberate materials, never through ambient drop shadows on every card. Carbon black is the ground; layering is primarily tonal (Surface / Surface 2 over Carbon). On top of that sit three responses: frosted glass for things that float, a soft shadow for cards, and ice glow strictly for interaction state.

### Shadow Vocabulary
- **Card lift** (`box-shadow: 0 16px 36px -24px rgba(0,0,0,.9)`): A soft, low, directional shadow under cards. Paired with a 1px glass hairline border and a translucent black fill (`rgba(22,22,22,.5)` + `backdrop-filter: blur(6px)`), it reads as elevation without a hard edge.
- **Frosted glass** (`backdrop-filter: blur(16px) saturate(1.3)`, translucent fill + 1px bone border at ~12%): Floating top controls (search, calendar, the Filters pill) and the bottom tab bar (`blur(22px)`). Glass means "this is floating over content," never decoration.
- **Ice glow active** (`box-shadow: 0 0 0 1px rgba(159,216,232,.4), 0 0 20px -4px rgba(159,216,232,.5)`): The interaction signal. Applied to active pills, the selected day, active filter chips, and (as a hover/press flare) primary ice buttons. The tab bar's active icon also carries a `text-shadow` ice glow.

### Named Rules
**The Flat-At-Rest Rule.** Surfaces are flat until something is true about them. A card gets its soft shadow because it is a tappable object; a control gets glass because it floats; an element gets ice glow only because it is active or being pressed. A glow on a resting, unselected element is always a bug.

**The Glass-Is-For-Floating Rule.** Frosted glass is reserved for elements that genuinely float over scrolling content (top controls, tab bar). It is never a decorative card treatment. Glassmorphism-as-default is prohibited.

## 5. Components

### Buttons
- **Shape:** Full pill (`border-radius: 999px`). Primary CTAs are tall (58px); inline actions are shorter (32-40px).
- **Primary:** Ice fill (`#9FD8E8`) with Ice Ink text (`#0A0A0A`), uppercase tracked label (`letter-spacing: 0.18-0.2em`), `font-weight: 500`. Used for the one action that matters per screen (Apply, Confirm my seat, Enter The List, Show rooms).
- **Hover / Focus / Press:** Press scales to 0.97 with a slight opacity drop; primary buttons flare the ice glow on hover/active. Disabled primaries fall back to Surface 2 fill with Bone Mute text and drop the glow.
- **Ghost:** Transparent fill, 1px Hairline-2 border, Bone text. Secondary actions (Decline, Reset).

### Chips
- **Style:** Pill. Two families: **chip-ice** (ice fill, ice-ink text) for affirmative state, and **chip-outline** (transparent, 1px Hairline-2 border, Bone text) for filters at rest.
- **State:** Selected filters invert to a Bone or Ice fill and gain the ice glow ring. The day-strip selector uses an ice fill + glow for the active day.

### Cards / Containers
- **Corner Style:** 18px for event/feature cards, 14px for list rows, 12px for tiles and inputs, 10px for thumbnails.
- **Background:** Translucent black (`rgba(22,22,22,.5)`) over Carbon, with `backdrop-filter: blur(6px)`. Image cards lay a bottom-up black gradient scrim over the photo so Bone text stays legible.
- **Shadow Strategy:** Card lift shadow (see Elevation). Never a hard 2014-era drop shadow.
- **Border:** 1px glass hairline (`rgba(245,241,234,.08)`). On hover the border tints toward ice (~35%).
- **Internal Padding:** 12-16px. **Nested cards are forbidden.**

### Inputs / Fields
- **Style:** Surface fill (`#141414`), 1px Hairline-2 border, 12px radius, 48px tall, Bone text.
- **Focus:** Border shifts toward ice; no heavy glow on inputs (glow is reserved for actions and selection).
- **Composed fields:** The Instagram handle field prefixes a muted `@` inside the same rounded container.

### Navigation
- **Style:** Bottom tab bar, 4 items, frosted glass (`blur(22px)`) with a subtle ice top-glow line. Labels are uppercase 9px tracked.
- **States:** Inactive = Bone Mute icon + label. Active = Bone label, **ice icon with a drop-shadow glow**, and an ice dot beneath. The icon set is Heroicons (outline), inlined as SVG at 1.5 stroke (no filled or chunky icons); the SwiftUI build will move to SF Symbols.

### Signature: The Reveal Ring
The "You're in" / "Tier One" moment renders a 180px ice-filled circle with Ice Ink display type, a `ringPop` scale-in, and a slow `pulseIce` ring animation. This is the system's one permitted piece of theatre. It appears only at genuine peaks (getting picked, getting listed) and nowhere else.

## 6. Do's and Don'ts

### Do:
- **Do** keep ice blue (`#9FD8E8`) to roughly 10% of any screen: actions, current selection, and state only.
- **Do** set text in Bone (`#F5F1EA`), never pure white, on dark surfaces.
- **Do** keep surfaces flat at rest; add glass only to floating controls and the tab bar, and ice glow only to active/pressed states.
- **Do** use single editorial words for screen headers; push sentences into body copy.
- **Do** hold the type system to Satoshi (display + numbers) and Host Grotesk (body) only.
- **Do** honor `prefers-reduced-motion`: the stagger, ring-pop, and reveal animations all need a crossfade/instant fallback (the prototype already guards these).
- **Do** pair ice with a text or icon cue for state, never color alone, so it survives color-blindness and the light/dark switch.

### Don't:
- **Don't** use purple or pink gradients anywhere. This is The Secret Society's single biggest visual weakness and the thing we are defined against.
- **Don't** let the app read as a dating app (despite the swipe model) or a coupon/discount app. No "% off," no urgency-coupon energy.
- **Don't** reach for generic SaaS gradient heroes or glowing startup clichés.
- **Don't** use Inter. Anywhere. Don't use Instrument Serif (an AI-design tell as of 2026).
- **Don't** put emoji in the UI.
- **Don't** apply ice glow to resting, unselected elements, or use frosted glass as a decorative card treatment (glassmorphism-as-default is prohibited).
- **Don't** nest cards, add a colored side-stripe border, or set body copy in ALL CAPS.
- **Don't** add a third typeface or a separate mono family; Satoshi 900 tabular figures cover numbers.
