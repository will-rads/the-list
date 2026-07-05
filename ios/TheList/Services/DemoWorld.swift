import Foundation
import Observation

/// The single shared mock backend — one `@Observable` world that every
/// `Mock*Service` reads and mutates, seeded identically to both
/// `web/v3/index.html` and `web/v2/venue.html` (see `DemoWorldSeed`).
/// `@MainActor`-isolated because every mutation (including the timer-driven
/// ones in the `DemoWorld+*` extensions) must be safe to observe from
/// SwiftUI views without extra hops.
@MainActor
@Observable
public final class DemoWorld {
    /// Canonical demo "today" — both web files agree: Sunday 25 May. Time
    /// never advances in the demo world. `nonisolated`: it's an immutable
    /// Sendable String, so the nonisolated seed factories (DemoWorldSeed+*)
    /// can read it without hopping to the main actor (Swift 6 strict
    /// concurrency — caught by CI 2026-07-05).
    public nonisolated static let today = "Sun · 25 May"

    // `internal(set)` (not `private(set)`): Swift access control is
    // file-scoped, and the mutations below live in `DemoWorld+*` extensions
    // in separate files. `public internal(set)` keeps these read-only to
    // anything outside the module (e.g. a future app target) while every
    // file inside it — including `@testable import` from `TheListTests` —
    // can mutate them.
    public internal(set) var events: [EventItem]
    public internal(set) var myEvents: [MyEventRow]
    public internal(set) var notifications: [AppNotification]
    public internal(set) var venueProfile: VenueProfile
    public internal(set) var memberProfile: MemberProfile
    public internal(set) var applicants: [ApplicantCard]
    /// Last toast message shown, if any — a thin substitute for the web's
    /// `showToast`; a screen (later wave) observes and clears it.
    public internal(set) var toast: String?

    /// The "submitting" pause before an application is recorded (web:
    /// 1.4s). Tests inject a near-zero delay so the suite never waits real
    /// seconds.
    let applySubmitDelay: Duration
    /// Delay before a simulated pick lands after `apply(to:)` — production
    /// default matches the web's 10s (`web/v3/index.html` `pickTimersRef`).
    let pickDelay: Duration
    /// Delay before a simulated story verdict lands after `submitStory`
    /// (production default matches the web's 8s).
    let verdictDelay: Duration
    /// Delay before a locked-event "yes" swipe auto-confirms (web: 12s).
    let autoConfirmDelay: Duration

    var applyTask: Task<Void, Never>?
    var pickTasks: [String: Task<Void, Never>] = [:]
    var verdictTasks: [String: Task<Void, Never>] = [:]
    var autoConfirmTasks: [String: Task<Void, Never>] = [:]

    /// Last swipe decision per event, for `undoLastDecision` (web
    /// `undoEntry`). Cleared after use or on the next decision for that
    /// event.
    var undoEntries: [String: UndoEntry] = [:]

    struct UndoEntry: Sendable {
        var applicantId: String
        var previousState: ApplicationState
    }

    public init(
        applySubmitDelay: Duration = .milliseconds(1400),
        pickDelay: Duration = .seconds(10),
        verdictDelay: Duration = .seconds(8),
        autoConfirmDelay: Duration = .seconds(12)
    ) {
        self.applySubmitDelay = applySubmitDelay
        self.pickDelay = pickDelay
        self.verdictDelay = verdictDelay
        self.autoConfirmDelay = autoConfirmDelay
        self.events = DemoWorldSeed.events()
        self.myEvents = DemoWorldSeed.myEvents()
        self.notifications = DemoWorldSeed.notifications()
        self.venueProfile = DemoWorldSeed.venueProfile()
        self.memberProfile = DemoWorldSeed.memberProfile()
        self.applicants = DemoWorldSeed.applicants()
    }

    /// Cancels every pending timer — called from `reset()`, matching the
    /// web's unmount cleanup (`useEffect` cleanup in `App()`).
    func cancelAllTimers() {
        applyTask?.cancel()
        applyTask = nil
        pickTasks.values.forEach { $0.cancel() }
        pickTasks.removeAll()
        verdictTasks.values.forEach { $0.cancel() }
        verdictTasks.removeAll()
        autoConfirmTasks.values.forEach { $0.cancel() }
        autoConfirmTasks.removeAll()
    }

    func showToast(_ message: String) {
        toast = message
    }

    /// Inserts a fresh row for `eventId` if none exists yet and returns its
    /// index — every member-side mutation reads/writes through this so no
    /// call site has to special-case "first time touching this event".
    @discardableResult
    func myEventIndex(for eventId: String, defaultState: ApplicationState) -> Int {
        if let idx = myEvents.firstIndex(where: { $0.eventId == eventId }) {
            return idx
        }
        myEvents.append(MyEventRow(eventId: eventId, state: defaultState))
        return myEvents.count - 1
    }

    /// Only the events the demo venue (Cyan Beach Club) manages — the ones
    /// seeded with a `bundle`/`guests` story in `DemoWorldSeed`. See
    /// `EventItem` doc comment for why `venueName` isn't a reliable filter
    /// (the "harbor" web disagreement).
    static let venueManagedEventIds: Set<String> = ["pool", "lounge", "roof", "bath", "vinyl", "harbor"]

    func venueManagedEvents() -> [EventItem] {
        events.filter { Self.venueManagedEventIds.contains($0.id) }
    }

    func eventIndex(id: String) -> Int? {
        events.firstIndex { $0.id == id }
    }

    func applicant(id: String) -> ApplicantCard? {
        applicants.first { $0.id == id }
    }
}
