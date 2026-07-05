import Foundation

/// Read-only access to the shared event catalog — both member Explore/Home
/// and venue Desk/Events pull from the same `DemoWorld.events` (spec §5:
/// "Both files seed the same fictional world").
@MainActor
public protocol EventService {
    func fetchEvents() async -> [EventItem]
    func fetchEvent(id: String) async -> EventItem?
}

/// Reads straight through to the shared `DemoWorld` — no artificial delay,
/// since there is nothing to simulate here: the catalog only changes when a
/// venue action mutates it.
@MainActor
public struct MockEventService: EventService {
    private let world: DemoWorld

    public init(world: DemoWorld) {
        self.world = world
    }

    public func fetchEvents() async -> [EventItem] {
        world.events
    }

    public func fetchEvent(id: String) async -> EventItem? {
        world.events.first { $0.id == id }
    }
}
