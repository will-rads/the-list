# iOS — SwiftUI app (placeholder)

Empty for now. We scaffold the Xcode project from the approved live prototype: `web/index.html` v0.4.

## Planned structure

```
ios/
├── TheList.xcodeproj
└── Sources/
    ├── App/
    │   ├── TheListApp.swift          @main entry
    │   └── RootView.swift            tab switcher
    ├── Screens/
    │   ├── HomeView.swift            01 — featured tonight
    │   ├── ExploreView.swift         02 — event list
    │   ├── EventDetailView.swift     03 — apply screen
    │   ├── MyEventsView.swift        04 — invited / confirmed / past
    │   ├── ProfileView.swift         05 — audience / reputation
    │   └── PickedView.swift          06 — full-screen "you're in"
    ├── Components/
    │   ├── EventCard.swift
    │   ├── CountdownLabel.swift
    │   ├── ApplyButton.swift
    │   └── TabBar.swift
    ├── Models/
    │   ├── Event.swift
    │   ├── Venue.swift
    │   ├── Influencer.swift
    │   └── Application.swift
    ├── Services/
    │   ├── SupabaseClient.swift
    │   ├── ApplicationService.swift
    │   └── PushService.swift
    └── Resources/
        ├── Assets.xcassets
        ├── Fonts/                    PlusJakartaSans.ttf
        └── Info.plist
```

## Targets

- iOS 16+ (SwiftUI maturity)
- iPhone only (no iPad v1)
- Light + Dark mode
- English only v1

## Next when we get here

1. Open Xcode → New Project → SwiftUI app
2. Bundle ID: `com.thelist.app`
3. Wire Supabase Swift SDK
4. Port `web/index.html` screen by screen
