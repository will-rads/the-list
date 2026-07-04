import SwiftUI
import Observation

// The member side's dependency bag, injected once into the environment. Holds the
// frozen service *protocols* (screens call these for every mutation — apply,
// confirm, decline, submit story) and the demo switchboard (Settings drives it).
// Reactive READS of world state (events, myEvents, notifications, profile) go
// through the separately-injected `DemoWorld` @Observable, since only observing the
// live object propagates the timer-driven demo updates (a protocol snapshot read
// would never re-render). `@Observable` so it injects with the iOS 17 environment
// API; its stored services never change after init.
@MainActor
@Observable
final class MemberServices {
    let world: DemoWorld
    let events: any EventService
    let applications: any ApplicationService
    let stories: any StoryService
    let switchboard: any DemoSwitchboard

    init(world: DemoWorld) {
        self.world = world
        self.events = MockEventService(world: world)
        self.applications = MockApplicationService(world: world)
        self.stories = MockStoryService(world: world)
        self.switchboard = world
    }
}
