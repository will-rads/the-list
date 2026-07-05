# The List — iOS (SwiftUI)

Native port of the v3 glass prototype. Member side = `web/v3/index.html`, venue side =
`web/v2/venue.html` flows wearing the v3 glass skin. Mock-first: the whole night loop runs
offline from a seeded demo world (same numbers as the web files) with hidden demo switchboards
(member: bottom of Settings · venue: Venue tab). Supabase is phase 2, behind the service
protocols in `TheList/Services/` — no view changes needed to swap it in.

Plan + hard rules: `docs/superpowers/plans/2026-07-04-swiftui-port-plan.md`.

## Structure

- `project.yml` — XcodeGen spec (app + unit-test targets, iOS 17, iPhone, portrait).
- `Package.swift` — `TheListCore`: Models + Services + tests as a PORTABLE SPM package.
  Pure Swift (Foundation + Observation) — `swift test` runs on any Swift 6 toolchain,
  Windows/Linux included. This is the no-Mac verification gate.
- `TheList/` — App (root + role chooser), Theme (tokens/type/ground/glass), DesignSystem
  (kit components), Models, Services (protocols + mocks + DemoWorld), Features (Member, Venue),
  Resources (bundled Plus Jakarta Sans, bg-3 ground, intro stills).
- `TheListTests/` — Swift Testing suite for the state logic (lifecycle, countdown, story
  chain, switchboard, seed agreement). Conditional import: compiles under both the Xcode
  app module (`TheList`) and the SPM module (`TheListCore`).

## Verify on Windows (no Mac)

```powershell
# once, in an ADMIN terminal (silent install fails with msi 1603 otherwise):
winget install Swift.Toolchain --skip-dependencies
# then:
cd ios
swift test
```

## Mac day

```bash
cd ios
brew install xcodegen
xcodegen
open TheList.xcodeproj   # build & run on an iOS 17+ simulator, 393x852 (iPhone 15/16)
```

Written on Windows with no compiler in the loop — expect a first-build fix pass. Known
uncertainties collected from the build waves, check these first:

1. `Theme/Materials.swift` — iOS 26 Liquid Glass path sits behind `#if compiler(>=6.2)`;
   on Xcode 26+ verify the `glassEffect` call signature. Harmless on Xcode 16.
2. Observation wiring (`@State` AppState + `.environment(_:)` + `@Environment(AppState.self)`).
3. Member screens: absolute top paddings measured from screen top with status bar overlay
   (web-faithful) — vertical positions may need nudging; paged `TabView` hero inside a
   vertical `ScrollView` (gesture coexistence); sheet chrome uses `presentationBackground`
   / `presentationCornerRadius` (iOS 16.4+) — confirm the frost reads as glass.
4. `DemoWorld.toast` consumption relies on same-module `internal(set)` — revisit if the
   project is ever split into modules.
5. Font family must register as exactly "Plus Jakarta Sans" (see `Typography.swift`).
6. Venue: swipe-deck GeometryReader tap-exclusion zone and applicant gender bar are
   unverified pixel-wise; a few overloads (`Link(_:destination:)`, `Binding($optional)`)
   worth a first-pass compile check.
7. Negative `lineSpacing` clamps to 0 on device — display titles slightly less tight than web.

Fidelity gate after it builds: every screen side-by-side against the web prototype in a
393×852 viewport (member = local `web/v3/index.html`, venue flows = `/v2/venue`).
