import Foundation

/// Static seed data for `DemoWorld`, transcribed from both web prototypes so
/// the mock world matches each exactly (spec §5 "The demo world"). Split
/// across `DemoWorldSeed+Applicants.swift`, `DemoWorldSeed+Events.swift`,
/// `DemoWorldSeed+Member.swift`, and `DemoWorldSeed+Venue.swift` — this file
/// only declares the namespace.
///
/// Canonical today: **Sunday 25 May** (`DemoWorld.today`). Image names are
/// the web `IMG.*` dictionary's *keys* (e.g. `"beachClub"`), not the Unsplash
/// URLs behind them — a later wave maps these to bundled or remote assets;
/// Models/Services stay agnostic of that choice.
public enum DemoWorldSeed {}
