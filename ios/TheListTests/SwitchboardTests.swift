import Testing
@testable import TheList

/// The 8-action `DemoSwitchboard` contract: `pickNow`, `expirePick`,
/// `checkMeIn`, `forceVerdict`, `newApplicants`, `declinePick`,
/// `advanceToTonight`, `reset`.
@MainActor
@Suite("Demo switchboard")
struct SwitchboardTests {
    @Test("advanceToTonight locks Late Lounge: applied -> waitlisted, picked -> confirmed with a code")
    func advanceToTonightFlips() {
        let world = DemoWorld()
        // Give the venue's own deck a "yes" while still Open — no auto-confirm
        // timer arms until the event is Locked.
        world.decide(eventId: "lounge", applicantId: "a2", pick: true)
        let beforeAdvance = world.events.first { $0.id == "lounge" }?.guests.first { $0.applicantId == "a2" }
        #expect(beforeAdvance?.state == .picked)

        world.advanceToTonight()

        let lounge = world.events.first { $0.id == "lounge" }
        #expect(lounge?.stage == .locked)
        #expect(lounge?.date == DemoWorld.today)
        let a2 = lounge?.guests.first { $0.applicantId == "a2" }
        #expect(a2?.state == .confirmed)
        #expect(a2?.code != nil)
        let everyoneElse = lounge?.guests.filter { $0.applicantId != "a2" } ?? []
        #expect(everyoneElse.allSatisfy { $0.state == .waitlisted })
    }

    @Test("pickNow immediately picks Late Lounge; checkMeIn checks Sara in on both sides")
    func pickNowAndCheckMeIn() {
        let world = DemoWorld()
        world.pickNow()
        #expect(world.myEvents.first { $0.eventId == "lounge" }?.state == .picked)

        world.checkMeIn()
        #expect(world.myEvents.first { $0.eventId == "pool" }?.state == .checkedIn)
        let saraGuestRow = world.events.first { $0.id == "pool" }?.guests.first { $0.applicantId == "a1" }
        #expect(saraGuestRow?.state == .checkedIn)
    }

    @Test("declinePick frees a confirmed Pool Day seat that is never Sara's")
    func declinePickFreesASeat() {
        let world = DemoWorld()
        world.declinePick()
        let pool = world.events.first { $0.id == "pool" }
        #expect(pool?.guests.first { $0.applicantId == "a1" }?.state == .confirmed)
        #expect(pool?.guests.contains { $0.state == .declined } == true)
    }

    @Test("newApplicants adds fresh guests to the first open event")
    func newApplicantsAddsGuests() {
        let world = DemoWorld()
        let before = world.events.first { $0.stage == .open }?.guests.count ?? 0
        world.newApplicants()
        let after = world.events.first { $0.stage == .open }?.guests.count ?? 0
        #expect(after > before)
    }

    @Test("reset restores mutated state back to the seed")
    func resetRestoresSeed() {
        let world = DemoWorld()
        world.cancelEvent(eventId: "pool")
        world.decide(eventId: "lounge", applicantId: "a2", pick: true)

        world.reset()

        #expect(world.events.count == 9)
        #expect(world.myEvents.count == DemoWorldSeed.myEvents().count)
        #expect(world.events.first { $0.id == "pool" }?.stage == .locked)
        #expect(
            world.events.first { $0.id == "pool" }?.guests.first { $0.applicantId == "a1" }?.code == "LST-4F"
        )
        #expect(world.myEvents.first { $0.eventId == "pool" }?.state == .confirmed)
        let lounge = world.events.first { $0.id == "lounge" }
        #expect(lounge?.guests.first { $0.applicantId == "a2" }?.state == .applied)
    }
}
