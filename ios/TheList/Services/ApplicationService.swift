import Foundation

/// The member's relationship to events — apply/confirm/decline/withdraw plus
/// the Pass. Pick simulation (apply → picked ~10s later) is not a method
/// here: it fires automatically inside `DemoWorld` after `apply(to:)`,
/// mirroring the web's `pickTimersRef` (see `DemoWorld+Application.swift`).
/// Manual control lives on `DemoSwitchboard`.
@MainActor
public protocol ApplicationService {
    func myEvents() async -> [MyEventRow]
    func apply(to eventId: String) async
    func confirmPick(eventId: String) async
    func declinePick(eventId: String) async
    func withdraw(from eventId: String) async
    func pass(for eventId: String) async -> PassInfo?
}

@MainActor
public struct MockApplicationService: ApplicationService {
    private let world: DemoWorld

    public init(world: DemoWorld) {
        self.world = world
    }

    public func myEvents() async -> [MyEventRow] {
        world.myEvents
    }

    public func apply(to eventId: String) async {
        world.apply(to: eventId)
    }

    public func confirmPick(eventId: String) async {
        world.confirmPick(eventId: eventId)
    }

    public func declinePick(eventId: String) async {
        world.declineMyPick(eventId: eventId)
    }

    public func withdraw(from eventId: String) async {
        world.withdraw(from: eventId)
    }

    public func pass(for eventId: String) async -> PassInfo? {
        world.passInfo(for: eventId)
    }
}
