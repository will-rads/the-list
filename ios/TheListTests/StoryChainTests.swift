import Foundation
import Testing
@testable import TheList

/// The Story enforcement loop (spec §4): due → reminder at +12h → missed at
/// 24h → strike, three strikes pause the account. `StoryEscalation` is pure
/// math driven by an explicit `now`, so these tests never wait real hours.
@Suite("Story escalation chain")
struct StoryChainTests {
    @Test("within the first 12 hours: stays due, no reminder yet")
    func withinFirstWindow() {
        let dueAt = Date().addingTimeInterval(-3600) // 1h ago
        let outcome = StoryEscalation.evaluate(dueAt: dueAt, now: Date(), currentStatus: .due)
        #expect(outcome.status == .due)
        #expect(outcome.shouldSendReminder == false)
        #expect(outcome.strikeAdded == false)
    }

    @Test("past 12 hours: still due, but the reminder fires")
    func reminderWindow() {
        let dueAt = Date().addingTimeInterval(-13 * 3600)
        let outcome = StoryEscalation.evaluate(dueAt: dueAt, now: Date(), currentStatus: .due)
        #expect(outcome.status == .due)
        #expect(outcome.shouldSendReminder == true)
        #expect(outcome.strikeAdded == false)
    }

    @Test("past 24 hours: missed, and a strike is added")
    func missedWindow() {
        let dueAt = Date().addingTimeInterval(-25 * 3600)
        let outcome = StoryEscalation.evaluate(dueAt: dueAt, now: Date(), currentStatus: .due)
        #expect(outcome.status == .missed)
        #expect(outcome.shouldSendReminder == false)
        #expect(outcome.strikeAdded == true)
    }

    @Test("a status other than due passes through untouched")
    func nonDuePassesThrough() {
        let outcome = StoryEscalation.evaluate(
            dueAt: Date().addingTimeInterval(-100_000), now: Date(), currentStatus: .verified
        )
        #expect(outcome.status == .verified)
        #expect(outcome.strikeAdded == false)
    }

    @MainActor
    @Test("DemoWorld escalates a missed story into a strike, and three strikes pause the account")
    func demoWorldEscalation() {
        let world = DemoWorld()
        #expect(world.memberProfile.strikes == 0)
        #expect(world.memberProfile.isPaused == false)

        // Seeded "bath" row is due; push evaluation 25h past its due time.
        let farFuture = Date().addingTimeInterval(25 * 3600)
        world.evaluateStoryEscalations(now: farFuture)
        let bathRow = world.myEvents.first { $0.eventId == "bath" }
        #expect(bathRow?.story == .missed)
        #expect(world.memberProfile.strikes == 1)

        // Already missed (storyDueAt cleared) — a second pass is a no-op.
        world.evaluateStoryEscalations(now: farFuture)
        #expect(world.memberProfile.strikes == 1)

        world.memberProfile.strikes = 3
        #expect(world.memberProfile.isPaused == true)
    }
}
