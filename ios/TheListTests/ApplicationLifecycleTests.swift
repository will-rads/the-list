import Testing
#if canImport(TheListCore)
@testable import TheListCore
#else
@testable import TheList
#endif

/// Apply → picked → confirmed/declined, event cancellation (no charge, no
/// strikes), and the expired-pick → waitlist replacement flow. Uses
/// near-zero injected delays so the suite never waits real seconds for the
/// web's 1.4s/10s/12s timers.
@MainActor
@Suite("Application lifecycle")
struct ApplicationLifecycleTests {
    private func fastWorld() -> DemoWorld {
        DemoWorld(
            applySubmitDelay: .milliseconds(5),
            pickDelay: .milliseconds(5),
            verdictDelay: .milliseconds(5),
            autoConfirmDelay: .milliseconds(5)
        )
    }

    @Test("apply, then the simulated pick, then confirm issues a door code")
    func applyPickConfirm() async throws {
        let world = fastWorld()
        world.apply(to: "lounge")

        try await Task.sleep(for: .milliseconds(80))
        let picked = world.myEvents.first { $0.eventId == "lounge" }
        #expect(picked?.state == .picked)
        #expect(picked?.pickedAt != nil)

        world.confirmPick(eventId: "lounge")
        let confirmed = world.myEvents.first { $0.eventId == "lounge" }
        #expect(confirmed?.state == .confirmed)
        #expect(confirmed?.code != nil)
        #expect(confirmed?.pickedAt == nil)
    }

    @Test("declining a pick releases the seat and issues no code")
    func declinePick() async throws {
        let world = fastWorld()
        world.apply(to: "lounge")
        try await Task.sleep(for: .milliseconds(80))

        world.declineMyPick(eventId: "lounge")
        let row = world.myEvents.first { $0.eventId == "lounge" }
        #expect(row?.state == .declined)
        #expect(row?.code == nil)
    }

    @Test("cancelling an event flips every guest to cancelled with no strike")
    func cancelEventNoStrike() {
        let world = fastWorld()
        let strikesBefore = world.memberProfile.strikes

        world.cancelEvent(eventId: "pool")

        let event = world.events.first { $0.id == "pool" }
        #expect(event?.stage == .cancelled)
        #expect(event?.guests.allSatisfy { $0.state == .cancelled } == true)
        #expect(world.memberProfile.strikes == strikesBefore)
    }

    @Test("an expired pick on a locked event is replaced from the waitlist and auto-confirms")
    func expiredPickReplacement() async throws {
        let world = fastWorld()
        let poolBefore = world.events.first { $0.id == "pool" }
        #expect(poolBefore?.guests.first { $0.applicantId == "a10" }?.state == .expired)
        #expect(poolBefore?.guests.first { $0.applicantId == "a22" }?.state == .waitlisted)

        world.decide(eventId: "pool", applicantId: "a22", pick: true)
        let justPicked = world.events.first { $0.id == "pool" }?.guests.first { $0.applicantId == "a22" }
        #expect(justPicked?.state == .picked)

        try await Task.sleep(for: .milliseconds(80))
        let replaced = world.events.first { $0.id == "pool" }?.guests.first { $0.applicantId == "a22" }
        #expect(replaced?.state == .confirmed)
        #expect(replaced?.code != nil)
    }

    @Test("undo reverses the last swipe decision on an event")
    func undoLastDecision() {
        let world = fastWorld()
        world.decide(eventId: "pool", applicantId: "a22", pick: false)
        #expect(world.events.first { $0.id == "pool" }?.guests.first { $0.applicantId == "a22" }?.state == .notSelected)

        world.undoLastDecision(eventId: "pool")
        #expect(world.events.first { $0.id == "pool" }?.guests.first { $0.applicantId == "a22" }?.state == .waitlisted)
    }
}
