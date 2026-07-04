import Foundation

/// The venue's operations: post wizard, review-deck swipes, Door check-in,
/// Close-the-night → Recap, and the events list. Scoped to the single demo
/// venue (Cyan Beach Club) that owns "pool", "lounge", "roof", "bath",
/// "vinyl", "harbor" in `DemoWorld.events` — calling any mutation with an id
/// outside that set is a safe no-op, mirroring the web's
/// `events.find(e => e.id === id)` returning `undefined`.
@MainActor
public protocol VenueService {
    func venueProfile() async -> VenueProfile
    /// Only the events this venue manages (has a non-empty guest/bundle
    /// story) — a subset of `EventService.fetchEvents()`, which also returns
    /// other venues' events a member can browse on Explore.
    func venueEvents() async -> [EventItem]
    func applicant(id: String) async -> ApplicantCard?
    /// Swipe decision on one applicant. `pick == true` → `.picked` (locked
    /// events additionally auto-confirm after `autoConfirmDelay`); `false` →
    /// `.notSelected`.
    func decide(eventId: String, applicantId: String, pick: Bool) async
    func undoLastDecision(eventId: String) async
    func closeApplications(eventId: String) async
    func cancelEvent(eventId: String) async
    func checkIn(eventId: String, applicantId: String) async
    func markNoShow(eventId: String, applicantId: String) async
    func rate(eventId: String, applicantId: String, score: Double) async
    func closeNight(eventId: String) async
    /// Sum of `instagramFollowers` for guests with a verified story — computed
    /// fresh, never stored (see `RecapStats` doc comment).
    func verifiedReach(eventId: String) async -> Int
    func publish(_ draft: EventItem) async
    func advanceToTonight() async
    /// The venue's Activity feed — recomputed fresh from `venueEvents()` on
    /// every call (web `venueNotifs`, a pure function, not stored state).
    func notifications() async -> [AppNotification]
}

@MainActor
public struct MockVenueService: VenueService {
    private let world: DemoWorld

    public init(world: DemoWorld) {
        self.world = world
    }

    public func venueProfile() async -> VenueProfile {
        world.venueProfile
    }

    public func venueEvents() async -> [EventItem] {
        world.venueManagedEvents()
    }

    public func applicant(id: String) async -> ApplicantCard? {
        world.applicants.first { $0.id == id }
    }

    public func decide(eventId: String, applicantId: String, pick: Bool) async {
        world.decide(eventId: eventId, applicantId: applicantId, pick: pick)
    }

    public func undoLastDecision(eventId: String) async {
        world.undoLastDecision(eventId: eventId)
    }

    public func closeApplications(eventId: String) async {
        world.closeApplications(eventId: eventId)
    }

    public func cancelEvent(eventId: String) async {
        world.cancelEvent(eventId: eventId)
    }

    public func checkIn(eventId: String, applicantId: String) async {
        world.checkIn(eventId: eventId, applicantId: applicantId)
    }

    public func markNoShow(eventId: String, applicantId: String) async {
        world.markNoShow(eventId: eventId, applicantId: applicantId)
    }

    public func rate(eventId: String, applicantId: String, score: Double) async {
        world.rate(eventId: eventId, applicantId: applicantId, score: score)
    }

    public func closeNight(eventId: String) async {
        world.closeNight(eventId: eventId)
    }

    public func verifiedReach(eventId: String) async -> Int {
        world.verifiedReach(eventId: eventId)
    }

    public func publish(_ draft: EventItem) async {
        world.publish(draft)
    }

    public func advanceToTonight() async {
        world.advanceToTonight()
    }

    public func notifications() async -> [AppNotification] {
        world.venueNotifications()
    }
}
