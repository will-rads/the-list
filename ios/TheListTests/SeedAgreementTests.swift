import Testing
@testable import TheList

/// Locks in the numbers this wave cross-checked between `web/v3/index.html`
/// (member) and `web/v2/venue.html` (venue) — see the wave's return note for
/// the full agreement table. A regression here means the seed drifted from
/// one of the two web sources of truth.
@MainActor
@Suite("Seed cross-check: member vs venue")
struct SeedAgreementTests {
    @Test("Pool Day: 20 seats, 18 confirmed (incl. Sara LST-4F), 1 expired, 2 waitlist")
    func poolDayMix() {
        let world = DemoWorld()
        let pool = world.events.first { $0.id == "pool" }
        #expect(pool?.seats == 20)
        #expect(pool?.guests.filter { $0.state == .confirmed }.count == 18)
        #expect(pool?.guests.filter { $0.state == .expired }.count == 1)
        #expect(pool?.guests.filter { $0.state == .waitlisted }.count == 2)
        #expect(pool?.guests.first { $0.applicantId == "a1" }?.code == "LST-4F")
        #expect(world.myEvents.first { $0.eventId == "pool" }?.code == "LST-4F")
    }

    @Test("Late Lounge: 24 unswiped applicants, 137 lifetime applied, Sara among them")
    func lateLoungeApplicants() {
        let world = DemoWorld()
        let lounge = world.events.first { $0.id == "lounge" }
        #expect(lounge?.guests.count == 24)
        #expect(lounge?.appliedTotal == 137)
        #expect(lounge?.guests.contains { $0.applicantId == "a1" } == true)
        #expect(world.myEvents.first { $0.eventId == "lounge" }?.state == .applied)
    }

    @Test("Sound Bath recap: 20 confirmed, 18 showed, 2 no-shows, avg rating 8.6, invoice due")
    func soundBathRecap() {
        let world = DemoWorld()
        let bath = world.events.first { $0.id == "bath" }
        #expect(bath?.recap?.confirmed == 20)
        #expect(bath?.recap?.showed == 18)
        #expect(bath?.recap?.noShows == 2)
        #expect(bath?.recap?.avgRating == 8.6)
        #expect(bath?.invoice?.status == .due)
        #expect(world.myEvents.first { $0.eventId == "bath" }?.story == .due)
    }

    @Test("Vinyl Night: Sara verified with the seeded verdict, invoice paid")
    func vinylNightVerdict() {
        let world = DemoWorld()
        let vinyl = world.events.first { $0.id == "vinyl" }
        #expect(vinyl?.invoice?.status == .paid)
        let saraGuest = vinyl?.guests.first { $0.applicantId == "a1" }
        #expect(saraGuest?.story == .verified)
        #expect(saraGuest?.verdict?.score == 92)
        #expect(world.myEvents.first { $0.eventId == "vinyl" }?.verdict?.score == 92)
    }

    @Test("Bundle catalog matches the post wizard: The ten/twenty/forty")
    func bundleCatalog() {
        #expect(EventBundle.catalog.map(\.price) == [400, 700, 1200])
        #expect(EventBundle.catalog.map(\.seats) == [10, 20, 40])
    }

    @Test("Documented disagreement: Sara's own Profile reputation (9.4) differs from her ApplicantCard record (9.1)")
    func reputationScoreDisagreementIsIntentional() {
        let world = DemoWorld()
        #expect(world.memberProfile.reputationScore == 9.4)
        #expect(world.applicant(id: "a1")?.reputationScore == 9.1)
    }

    @Test("Harbor Club Night: member-facing venue name differs from the operating demo venue (documented disagreement)")
    func harborVenueNameDisagreement() {
        let world = DemoWorld()
        let harbor = world.events.first { $0.id == "harbor" }
        #expect(harbor?.venueName == "Harbor Club")
        #expect(world.venueProfile.name == "Cyan Beach Club")
        // Yet the single demo venue login still operationally owns this
        // event's guest list and cancellation state.
        #expect(DemoWorld.venueManagedEventIds.contains("harbor"))
    }
}
