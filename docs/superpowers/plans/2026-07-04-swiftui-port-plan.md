# SwiftUI port — plan (2026-07-04)

**Decisions (Will, this session):** scaffold-only (NO Mac yet — nothing compiles until one exists;
first Mac open = `brew install xcodegen && xcodegen` in `ios/`, then a fix pass). Port BOTH sides
now: member = `web/v3/index.html` (glass) exactly; venue = `web/v2/venue.html` flows/copy/data with
the v3 glass skin. Mock-first — Supabase is phase 2 (ref `zrbakomzpuesifasuamb`, do NOT wire).
iOS 17 min, iPhone only, portrait only, dark primary. Supersedes `prompts/swiftui-goal.md` where
they conflict (that doc predates v3 glass); its hard rules otherwise stand.

## Hard rules (violating any = failed task)

- Ground: `bg-3` image (in `Resources/`) behind EVERY screen, both themes; scrim black 62% dark /
  white 50% light. Overlay screens paint their own ground (web bug 2026-07-04, errors.md).
- Glass surfaces: `.ultraThinMaterial`-based + tint, never opaque paint. Light glass stays
  see-through (web lesson: white .34, dock .38, sheet .55).
- Fonts: bundled Plus Jakarta Sans variable TTFs (already in `Resources/Fonts/`). ONE family.
  Display = weight 700, tracking -0.02em. Numbers/timers = 600 + `.monospacedDigit()`.
  Inter, Instrument Serif, Cormorant, Space Grotesk banned.
- Accent: white on dark / `#1E1E1E` on light (token `ice`). No hue accents. No purple.
- Icons: ONE `AppIcon` enum → SF Symbols map. Family swap = one file. No inline symbol names in views.
- Sentence case everywhere. No emojis in UI. Demo world numbers match the web files exactly
  (LST-4F, LST-9Q, 20/18/2, 137 applied, 8.6, invoices…).
- No hex literal / magic number in a View — everything through `Theme`.
- Cut list stands: no chat, QR, payments, auto-IG, multi-venue, Android.

## Layout (contract — do not deviate)

```text
ios/
  project.yml                      ← XcodeGen; targets TheList (iOS 17.0) + TheListTests
  TheList/
    App/                           ← @main, RootView (role switch member/venue), AppState
    Theme/                         ← Theme.swift (tokens), Typography, Ground, Materials
    DesignSystem/                  ← GlassCard, GlassDock, Chip, PillButton, SectionLabel,
                                     StatTile, Sheet, AppIcon, HairlineDivider, ...
    Models/                        ← value types + enums (below)
    Services/                      ← protocols + Mock* implementations + DemoWorld seed
    Features/
      Member/                      ← one folder per screen (Home, Explore, EventDetail, Pass,
                                     MyEvents, Picked, StorySheet, Notifications, Profile,
                                     Settings+Switchboard, Onboarding)
      Venue/                       ← Intro/Login, Onboarding, Desk, Events+Wizard, Applicants,
                                     Door, Recap, Profile, Switchboard
    Resources/                     ← Fonts/ (done), bg-3 asset, Assets.xcassets
  TheListTests/                    ← Swift Testing; state logic only
```

## Model/service contract (Sonnet owns files; names are FROZEN — Opus + screens import these)

Enums: `EventStage { draft, open, locked, past, cancelled }` ·
`ApplicationState { none, applied, picked, confirmed, expired, declined, waitlisted }` ·
`StoryStatus { notDue, due, underReview, verified, needsReview, rejected, missed }` ·
`Tier`, `GuestArrival { pending, checkedIn, noShow }`.

Structs: `EventItem`, `VenueProfile`, `MemberProfile`, `MyEventRow`, `PassInfo` (code, brief),
`EventBrief` (arrivalWindow, dressCode, meetingPoint, houseRules, conciergeLine),
`AppNotification` (+ `NotifTarget` deep-link enum), `ApplicantCard`, `GuestRow`,
`EventBundle` (the Ten/Twenty/Forty), `Invoice { due, paid }`, `RecapStats`, `StoryVerdict
(score, reason)`.

Service protocols (async where a backend would be; Mock returns instantly or on timers):
`EventService`, `ApplicationService` (apply/confirm/decline/withdraw + pick simulation),
`StoryService` (submit → verdict), `VenueService` (wizard, deck swipes, door check-in, recap,
advance-to-tonight). `MockServices` own ONE shared `DemoWorld` (@Observable) seeded identically
to the web demo world; switchboard actions mutate it (pickNow, expirePick, checkMeIn,
forceVerdict ×3, newApplicants, declinePick, advanceToTonight, reset).

## Waves

| Wave | Owner | Scope | Gate |
| --- | --- | --- | --- |
| W0 | Opus | project.yml, App/, Theme/, DesignSystem/, Resources (bg-3, font registration, Info.plist keys) | Fable reads every file |
| W1 | Sonnet (parallel with W0) | Models/, Services/ (contract above), DemoWorld seed from BOTH web files, TheListTests/ | Fable reads; tests reviewed for logic |
| W2 | Opus | Member screens (source: web/v3/index.html — every screen, state, copy string) | Fable QA vs web |
| W3 | Sonnet | Venue screens (source: web/v2/venue.html flows + v3 skin via DesignSystem) | Fable QA vs web |
| W4 | Fable | Full-project read: hard-rules audit, cross-wave consistency, dead code, Mac-day checklist (`ios/README.md` rewrite) | Will reviews |

W0/W1 run in parallel — disjoint dirs, frozen contract. W2 needs both. W3 after W2 (reuses
member components).

## Codex-verifiable core (Will 2026-07-04)

No SwiftUI compiler exists off-Mac (Codex included — it drives toolchains, it isn't one). The
verifiable slice: `ios/Package.swift` dual-homes Models/ + Services/ + TheListTests/ as SPM
package `TheListCore` — pure Swift + Observation + Foundation, NO SwiftUI/UIKit imports allowed
in those dirs (hard rule). With the Swift Windows toolchain (`winget install Swift.Toolchain`),
`swift test` compiles core + runs the whole logic suite locally — Codex or any agent can gate on
it. Views compile only on the future Mac; visual truth until then = the v3 web prototype.

## Glass quality bar (Will: "liquid glass must look sick")

Material alone reads flat. Every glass surface layers: (1) .ultraThinMaterial base, (2) theme
tint at the web alphas, (3) 1px hairline stroke (white 14-28% dark / ink 12-24% light), (4) a
top-edge specular highlight (white 35% → clear, 1px inner, dark mode), (5) soft drop shadow
(black, wide radius, low alpha), (6) continuous corner radii (.rect(cornerRadius:style:
.continuous)). Dock + sheets add saturation-boosted vibrancy. On iOS 26+, adopt native Liquid
Glass via #available (glassEffect and friends per the swiftui-liquid-glass skill) with the
Material recipe as the sub-26 fallback. W4 audits this list surface by surface.

## Verification without a Mac

Per wave: agent self-review (imports resolve against contract names, no force-unwraps in logic,
no hex in views) + Fable file-by-file QA. Honest limit: types/syntax unverified until first
`xcodegen + build` on a Mac; W4 ships a Mac-day fix checklist. Unit tests are written now, run then.
