import SwiftUI
import Observation

// The venue side's dependency bag, injected once into the environment. Holds
// the frozen `VenueService` (every mutation — decide, close applications,
// cancel, check in, rate, close the night, publish, advance to tonight — goes
// through it) and the shared `DemoSwitchboard`. Reactive READS of world state
// (events, applicants, venueProfile) go through the separately-injected
// `DemoWorld` @Observable, same split as `MemberServices`.
@MainActor
@Observable
final class VenueServices {
    let world: DemoWorld
    let venue: any VenueService
    let switchboard: any DemoSwitchboard

    init(world: DemoWorld) {
        self.world = world
        self.venue = MockVenueService(world: world)
        self.switchboard = world
    }
}
