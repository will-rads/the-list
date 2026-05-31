# Shared Agent Skills

These skills are stored here as a repo-local shared library for Claude Code, Codex, and any other agent working on The List.

This folder is intentionally named `.agent`, not `.claude`, because the guidance is tool-neutral. If an agent does not auto-discover this folder, invoke the skill by name and tell it to read:

```text
.agent/skills/<skill-name>/SKILL.md
```

## Installed iOS Skills

| Skill | Source | Use |
| --- | --- | --- |
| `swiftui-ui-patterns` | `Dimillian/Skills` | Build SwiftUI screens, navigation, sheets, app wiring, reusable components. |
| `swiftui-view-refactor` | `Dimillian/Skills` | Split large SwiftUI views, clean data flow, reduce view-body complexity. |
| `swift-concurrency-expert` | `Dimillian/Skills` | Fix async/await, actor isolation, `Sendable`, `@MainActor`, data-race issues. |
| `ios-debugger-agent` | `Dimillian/Skills` | Run, debug, inspect, screenshot, and log the iOS app in Simulator. |
| `swiftui-performance-audit` | `Dimillian/Skills` | Review SwiftUI performance: invalidation, identity, scrolling, image/loading cost. |
| `swiftui-liquid-glass` | `Dimillian/Skills` | Apply or review iOS 26+ Liquid Glass usage. |
| `swift-architecture-skill` | `efremidze/swift-architecture-skill` | Choose MVVM, MVI, TCA, Clean Architecture, Coordinator, or other boundaries. |
| `swift-testing-expert` | `AvdLee/swift-testing-agent-skill` | Write Swift Testing tests, migrate from XCTest, improve flaky async tests. |

## Recommended Order For The List

1. Use `swift-architecture-skill` before creating the native iOS app structure.
2. Use `swiftui-ui-patterns` when porting the current `web/index.html` flow into SwiftUI.
3. Use `swift-concurrency-expert` when adding Supabase, creator-data fetches, image loading, and apply/confirm flows.
4. Use `swift-testing-expert` when behavior starts moving out of mock data.
5. Use `ios-debugger-agent` whenever simulator verification is needed.
6. Use `swiftui-view-refactor` after the first screens work.
7. Use `swiftui-performance-audit` before TestFlight.
8. Use `swiftui-liquid-glass` only if we intentionally target the newer iOS visual system.

## Safety

These are third-party skill files copied from public GitHub repositories. Read a skill before using it for the first time, especially if it references scripts, external tools, or simulator/debugger integrations.
