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
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui"
    fontSize: "3.25rem"
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui"
    fontSize: "2.5rem"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui"
    fontSize: "1.375rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "normal"
  label:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui"
    fontSize: "0.625rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.22em"
  numeric:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui"
    fontSize: "1.125rem"
    fontWeight: 800
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

Everything is built on standard iOS app affordances (bottom tab bar, apply buttons, a swipe model, a bottom sheet) so the app is instantly legible. The distinctiveness lives entirely in the typeface, the carbon-and-bone palette, the rationing of ice blue, and the copy, never in reinvented controls. Depth is handled with restraint: surfaces are flat at rest; frosted glass appears only on floating top controls and the tab bar; ice glow appears only on active and pressed states. The light theme exists as a true daytime inversion, not a separate identity.

This system explicitly rejects The Secret Society's purple-pink gradient cosplay, dating-app energy, coupon/discount-app urgency, and generic SaaS gradient heroes. No Inter. No Instrument Serif. No emoji in the UI.

**Key Characteristics:**
- Carbon black surfaces, bone-white text, one cold accent
- Editorial display type (Plus Jakarta Sans 800) against a quiet body in the same family (Plus Jakarta Sans 400)
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
- **Bone** (`#F5F1EA`): All text. A warm off-white, never pure `#FFFFFF`, which is what gives the screen its editorial paper feeling. Every piece of text on dark is this one full-contrast ink — there is no grey text in the system.
- **No grey text.** The former tonal text greys `--ink-2` (`#C5C0B5` dark / `#3A3A3A` light) and `--ink-mute` (`#8A8A8A` dark / `#696969` light) are collapsed into `--ink` (Bone `#F5F1EA` on dark, Black `#0A0A0A` on light). Text hierarchy comes from size and weight only, never from a drop in contrast. Captions, metadata, and inactive tab labels are full-contrast ink set smaller or lighter in weight, not grey.
- **Hairline** (`#F5F1EA1A`, 10%) and **Hairline 2** (`#F5F1EA2E`, 18%): 1px borders and the deliberate full-width masthead rule under a screen title. The system separates with light hairlines, not boxes. **Section breaks are the exception** — they use the `SectionHead` treatment (ice tick + label + optional outline meta pill), not a thin trailing half-hairline beside the label (see §5 and the Finished-Edge Rule).

### Named Rules
**The One Cold Voice Rule.** Ice blue is the only chroma in the system and appears on roughly 10% or less of any screen. Its rarity is the entire point: when something is ice, it is either the one action that matters or the one number worth reading. The moment a second accent hue appears, the system is broken.

**The Ice Fill-vs-Text Rule.** Ice as a *fill* marks the one action or affirmative state (primary buttons, `chip-ice`, the selected day/filter, the reveal ring). Ice as *text* marks the one *value* number worth reading (seats left, reputation, venue score, the countdown). Ordinals, list markers, and plain labels are never ice — they read in Bone. Added 2026-05-31 (audit #10) after the Event Detail exchange step numbers leaked ice onto ordinals.

**The Warm-White Rule.** Text is Bone (`#F5F1EA`), never pure white. Pure `#FFFFFF` only ever appears as the app surface in the light theme, never as text on dark.

## 3. Typography

**Typeface:** Plus Jakarta Sans (with `ui-sans-serif, system-ui` fallback) — one family across the entire app, weights 400–800 loaded from Google Fonts.
**Headers:** Plus Jakarta Sans 800 (the family's max weight).
**Body:** Plus Jakarta Sans 400.
**Numeric:** Plus Jakarta Sans, inheriting the family — proportional figures, **no monospace and no `tabular-nums`**.

**Character:** A single typeface, Plus Jakarta Sans, carries the whole app: display headers, body, labels, numbers, tabs, and the status bar. The contrast is on weight and role, not on two competing personalities — headers shout at 800, body reads at 400, and the same family threads through everything. Numbers simply inherit the family at their place in the hierarchy; there is no separate mono or tabular treatment, so timers and stats read as part of the same editorial voice rather than a bolted-on data font.

### Hierarchy
- **Display** (Plus Jakarta Sans 800, ~3.25rem / 52px, line-height 0.92, -0.025em): Hero event titles, the onboarding one-word headers (Apply / Reading / Listed), the profile name.
- **Headline** (Plus Jakarta Sans 800, ~2.5rem / 40px, line-height 0.95, -0.015em): Screen titles (Index, Invites), featured card titles.
- **Title** (Plus Jakarta Sans 800, ~1.375rem / 22px, line-height 1): Meta-rail numbers, section headers, in-card titles.
- **Body** (Plus Jakarta Sans 400, ~0.875rem / 14px, line-height 1.45): Descriptions, list rows, helper copy. Cap prose at 65-75ch.
- **Label** (Plus Jakarta Sans 500, ~0.625rem / 10px, letter-spacing 0.22em, UPPERCASE): The `.stamp` — reserved for **true value labels** (When, Doors, Seats, Followers, Reputation, statuses, form-field labels) and badges. Reserve uppercase for these short labels only.
- **Section label** (`.section-label`, Plus Jakarta Sans 700, ~0.875rem / 14px, sentence case, normal tracking): the calmer marker for **section headers** (Also tonight, The exchange, Audience, Recent). It rides inside the `SectionHead` treatment (a short ice tick precedes it; an optional outline meta pill sits at the right). It replaced the uniform uppercase-tracked eyebrow on 2026-05-31, and the thin trailing half-hairline beside it was retired on 2026-05-31. Do not use a `.stamp` eyebrow above every section.
- **Numeric** (Plus Jakarta Sans, proportional figures, weight to match its place in the hierarchy): Seats, timers, follower counts, reputation scores, dates.

### Named Rules
**The One-Family Rule.** One typeface app-wide: Plus Jakarta Sans, and nothing else. This retires the former **Two-Family Rule** (Satoshi display + Host Grotesk body), removed 2026-05-31. A second family — including a serif or a true mono — is forbidden; numeric needs are met by the same family's proportional figures, not a tabular or mono font. Headers differ from body by weight (800 vs 400), never by family. Inter is banned outright; Instrument Serif is banned outright.

**The One-Word Header Rule.** Screen headers are a single editorial word (Tonight, Index, Invites, Profile, Apply, Reading, Listed, Filters), not a sentence. The supporting sentence, if any, lives in body copy below.

## 4. Elevation

The system is flat at rest and conveys depth through three deliberate materials, never through ambient drop shadows on every card. Carbon black is the ground; layering is primarily tonal (Surface / Surface 2 over Carbon). On top of that sit three responses: frosted glass for things that float, a soft shadow for cards, and ice glow strictly for interaction state.

### Shadow Vocabulary
- **Card lift** (`box-shadow: 0 16px 36px -24px rgba(0,0,0,.9)`): A soft, low, directional shadow under cards. Paired with a 1px hairline border and a translucent black fill (`rgba(26,26,26,.66)`), it reads as elevation without a hard edge. **Resting cards carry no `backdrop-filter`** — they are flat, not glass (see the Flat-At-Rest and Glass-Is-For-Floating rules). Blur was removed in the 2026-05-31 pass.
- **Frosted glass** (`backdrop-filter: blur(16px) saturate(1.3)`, translucent fill + 1px bone border at ~12%): Floating top controls (search, calendar, the Filters pill) and the bottom tab bar (`blur(22px)`). Glass means "this is floating over content," never decoration. Two tuned recipes, one rule: **`.glass`** floats over the app background (lighter fill); **`.glass-over-image`** floats over a photograph (darker scrim so bone icons stay legible) and is shared by the Event Detail header controls and the Profile hero controls. Same intent, tuned to the surface beneath. (`.glass-over-image` consolidated 2026-05-31, audit #5, replacing a one-off inline recipe.)
- **Ice glow active** (`box-shadow: 0 0 0 1px rgba(159,216,232,.4), 0 0 20px -4px rgba(159,216,232,.5)`): The interaction signal. Applied to active pills, the selected day, active filter chips, and (as a hover/press flare) primary ice buttons. The tab bar's active icon also carries a `text-shadow` ice glow. In the light theme this becomes a tighter ring keyed off the deep ice `#26768F` (`rgba(38,118,143,…)`) rather than the bright halo, so active states don't read as alien on white (audit #7, 2026-05-31).

### Named Rules
**The Flat-At-Rest Rule.** Surfaces are flat until something is true about them. A card gets its soft shadow because it is a tappable object; a control gets glass because it floats; an element gets ice glow only because it is active or being pressed. A glow on a resting, unselected element is always a bug.

**The Glass-Is-For-Floating Rule.** Frosted glass is reserved for elements that genuinely float over scrolling content (top controls, tab bar). It is never a decorative card treatment. Glassmorphism-as-default is prohibited.

## 5. Components

### Buttons
- **Shape:** Full pill (`border-radius: 999px`). Primary CTAs are tall (58px); inline actions are shorter (32-40px).
- **Primary:** Ice fill (`#9FD8E8`) with Ice Ink text (`#0A0A0A`), uppercase tracked label (`letter-spacing: 0.18-0.2em`), `font-weight: 500`. Used for the one action that matters per screen (Apply, Confirm my seat, Enter The List, Show rooms).
- **Hover / Focus / Press:** Press scales to 0.97 with a slight opacity drop; primary buttons flare the ice glow on hover/active. Disabled primaries fall back to Surface 2 fill with Bone text at reduced opacity and drop the glow.
- **Ghost:** Transparent fill, 1px Hairline-2 border, Bone text. Secondary actions (Decline, Reset).

### Chips
- **Style:** Pill. Two families: **chip-ice** (ice fill, ice-ink text) for affirmative state, and **chip-outline** (transparent, 1px Hairline-2 border, Bone text) for filters at rest.
- **State:** Selected filters invert to a Bone or Ice fill and gain the ice glow ring. The day-strip selector uses an ice fill + glow for the active day.

### Cards / Containers
- **Corner Style:** 18px for event/feature cards, 14px for list rows, 12px for tiles and inputs, 10px for thumbnails.
- **Background:** Translucent black (`rgba(26,26,26,.66)`) over Carbon, **no blur** (resting cards are flat, not glass). Image cards lay a bottom-up black gradient scrim over the photo so Bone text stays legible.
- **Shadow Strategy:** Card lift shadow (see Elevation). Never a hard 2014-era drop shadow.
- **Border:** 1px glass hairline (`rgba(245,241,234,.08)`). On hover the border tints toward ice (~35%).
- **Internal Padding:** 12-16px. **Nested cards are forbidden.**

### Inputs / Fields
- **Style:** Surface fill (`#141414`), 1px Hairline-2 border, 12px radius, 48px tall, Bone text.
- **Focus:** Border shifts toward ice; no heavy glow on inputs (glow is reserved for actions and selection).
- **Composed fields:** The Instagram handle field prefixes a muted `@` inside the same rounded container.

### Navigation
- **Style:** Bottom tab bar, 4 items, frosted glass (`blur(22px)`) with a subtle ice top-glow line. Labels are uppercase 9px tracked.
- **States:** Inactive = Bone icon + label at reduced opacity. Active = full-contrast Bone label + **ice icon with a drop-shadow glow** — one signal, no dot (the redundant ice dot was removed in the 2026-05-31 pass; "status without shouting"). The icon set is Heroicons (outline), inlined as SVG at 1.5 stroke (no filled or chunky icons); the SwiftUI build will move to SF Symbols.

### Section header, status, dates, segmented (added 2026-05-31)
Structure borrowed from The Secret Society's app, redrawn in Carbon + Ice. These give the browsing surfaces a finished edge and replace ad-hoc treatments.
- **Section header (`SectionHead`)**: a short ice tick (3×15px) + the section label, with an optional right-aligned **outline meta pill** (count or state, e.g. "3 open", "Closes soonest", "Live / Estimated"). This is the one section-break treatment. It replaced the "label + thin trailing hairline" pattern, which read unfinished. Full-width hairline rules survive only as the deliberate masthead rule under a screen title.
- **Status pill (`StatusPill`)**: one rounded uppercase badge vocabulary in three tones — **ice** (open / affirmative: Open, 24h left, Confirmed — Confirmed adds an ice-ink dot), **neutral** (muted fill), **outline** (Under review, Not selected). Replaces the earlier mix of bespoke ice chips and bare `.stamp` status text. TSS uses coloured status pills (OPEN FOR SWIPE / UNDER REVIEW); we keep the shape, drop the second hue.
- **Date chip (`DateChip`)**: a rounded day-block (big day number + month), **ice** on confirmed peaks (the check-in block), **neutral** elsewhere. From TSS's date blocks on cards and the featured banner.
- **Segmented control (`Segmented`)**: a pill-track with a single Bone-filled active segment and an inline count, used for the Invites tabs (Applied / Confirmed / Saved / Past). Replaces the old underline-tab row. Mirrors TSS's segmented toggles (CHECKED IN / OUT / NO SHOW), in our palette.
- **Save control (`SaveButton`)**: a round bookmark toggle — `glass-over-image` at rest, **ice-filled with a filled bookmark glyph when saved**. Lives on image cards (featured, Explore lead) and the Event Detail header; saving fills the Saved tab. TSS's save-heart, restyled to our bookmark and ice.
- **Toggle (`Toggle`)**: iOS switch, ice when on. Used in Settings (notifications, light theme).
- **Toast (`Toast`)**: a transient `glass-over-image` pill above the tab bar, ≤2.2s, with an ice dot. Gives minor controls (Map, Calendar, View pass, Log out) a visible reply instead of a dead tap.

### Sheets: Share & Settings (added 2026-05-31)
Both are bottom sheets sharing the Filter-sheet chrome (drag handle, `sheetIn` slide, dimmed `blur(4px)` backdrop, rounded-top 24px), scoped to the phone frame.
- **Share sheet**: shows *what* is being shared (an event preview card) and a 4-up action grid (Copy link, To Story, Message, More); each action fires a toast and closes.
- **Settings sheet**: editable Display name / Instagram handle (with `@` prefix and a Verified pill once connected) / Phone; a Notifications group (two `Toggle`s); an Appearance `Toggle` (light theme); a vendor-neutral privacy note; and Save / Log out / Delete account (the last two are prototype placeholders that toast).

### Entry / Intro screen (added 2026-05-31)
The first thing a new user sees — a TSS-style cinematic splash, restyled to Carbon + Ice. Structure copied from The Secret Society's intro (full-bleed grainy montage, centered wordmark + tagline, ghost + solid buttons, top/bottom scrims); the look is ours.
- **Background (`IntroVideoBG`)**: 3 grainy Beirut nightlife clips (5s each) that **cross-dissolve** (1.1s) and loop — Raouché dusk, Batroun coast, Beirut rooftop night. Muted + `autoPlay` + `playsInline` so it runs as a silent hero. `prefers-reduced-motion` holds the first clip (no auto-advance). Over the video: reinforced film **grain**, a heavy **vignette**, and a top+bottom **scrim** so the status bar, wordmark, and buttons stay legible. Clips are AI-generated (Nano Banana Pro stills → Veo 3.1 image-to-video), grainy/retro grade baked into the still prompt so the motion keeps the look; `.mp4` + first-frame `.jpg` poster live in `web/assets/intro-{1,2,3}.{mp4,jpg}`.
- **Lockup**: tracked eyebrow ("Est. MMXXVI · Beirut"), stacked **THE / LIST** wordmark (Plus Jakarta Sans 800, ~66px, wide tracking — a logotype, the one place all-caps display is allowed), tagline "By invitation only". Bone text, soft shadow, gentle fade/slide-in.
- **Actions**: primary **Apply for access** (ice fill) + ghost **I have an invite**; both enter the phone step. This is `onboardStep: "intro"`, the new first step, so the core flow is unchanged (intro → phone → reviewing → tier-reveal → home).

### Signature: The Reveal Ring
The "You're in" / "Tier One" moment renders a 180px ice-filled circle with Ice Ink display type, a `ringPop` scale-in, and a slow `pulseIce` ring animation. This is the system's one permitted piece of theatre. It appears only at genuine peaks (getting picked, getting listed) and nowhere else.

## 6. Do's and Don'ts

### Do:
- **Do** keep ice blue (`#9FD8E8`) to roughly 10% of any screen: actions, current selection, and state only.
- **Do** set text in Bone (`#F5F1EA`), never pure white, on dark surfaces. There is no grey text — all text is full-contrast ink, and hierarchy comes from size and weight, not from dropping contrast.
- **Do** keep surfaces flat at rest; add glass only to floating controls and the tab bar, and ice glow only to active/pressed states.
- **Do** use single editorial words for screen headers; push sentences into body copy.
- **Do** hold the type system to the single Plus Jakarta Sans family (headers at 800, body at 400, numbers inheriting the family); hierarchy is weight and size, never a second typeface.
- **Do** honor `prefers-reduced-motion`: the stagger, ring-pop, and reveal animations all need a crossfade/instant fallback (the prototype already guards these).
- **Do** pair ice with a text or icon cue for state, never color alone, so it survives color-blindness and the light/dark switch.
- **Do** lead the Profile with one hero metric (Reputation, 64px ice) and let Followers + Engagement support it asymmetrically. The old equal 3-column metric grid was removed 2026-05-31.
- **Do** mark sections with the `SectionHead` tick-and-label (plus an optional outline meta pill); reserve full-width hairlines for the masthead rule under a screen title. **(The Finished-Edge Rule.)**
- **Do** give every visible control a response — a sheet, a state change, or at least a `Toast`. A tap that does nothing reads as broken in a prototype.

### Don't:
- **Don't** use purple or pink gradients anywhere. This is The Secret Society's single biggest visual weakness and the thing we are defined against.
- **Don't** let the app read as a dating app (despite the swipe model) or a coupon/discount app. No "% off," no urgency-coupon energy.
- **Don't** reach for generic SaaS gradient heroes or glowing startup clichés.
- **Don't** use Inter. Anywhere. Don't use Instrument Serif (an AI-design tell as of 2026).
- **Don't** put emoji in the UI.
- **Don't** apply ice glow to resting, unselected elements, or use frosted glass as a decorative card treatment (glassmorphism-as-default is prohibited).
- **Don't** nest cards, add a colored side-stripe border, or set body copy in ALL CAPS.
- **Don't** reintroduce the thin trailing half-hairline beside a section label — use the `SectionHead` treatment. (Full-width masthead rules are fine.)
- **Don't** add a second status colour. `StatusPill` tones are ice / neutral / outline only; danger states (e.g. Delete account) stay neutral ink, never red.
- **Don't** put decorative punctuation on display text — names, screen headers, event titles, status labels, tab labels, short UI titles. Keep it in real sentences, helper copy, handles, dates, times, ratios, and data.
- **Don't** add a second typeface or a separate mono family; Plus Jakarta Sans covers everything, numbers included, with proportional figures.
