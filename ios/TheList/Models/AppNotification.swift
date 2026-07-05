import Foundation

/// One row in an Activity feed — shared shape for the member's stored,
/// mutable feed (`web/v3/index.html` `SEED_NOTIFS` + `simulatePick`/
/// `forceVerdict` pushes) and the venue's feed, which is recomputed fresh
/// from event state on every read (`web/v2/venue.html` `venueNotifs`, a pure
/// function — see `VenueService.notifications()`). `target` is only ever
/// populated on venue-derived rows, where the destination is fixed at
/// creation time; member rows resolve their destination live against current
/// state via `resolveMemberTarget` because the same notif can point
/// somewhere different depending on whether the member has already acted
/// (web `notifTarget(n)`).
public struct AppNotification: Codable, Identifiable, Hashable, Sendable {
    public var id: String
    public var kind: NotificationKind
    public var text: String
    public var eventId: String?
    public var read: Bool
    public var target: NotifTarget?

    public init(
        id: String,
        kind: NotificationKind,
        text: String,
        eventId: String? = nil,
        read: Bool = false,
        target: NotifTarget? = nil
    ) {
        self.id = id
        self.kind = kind
        self.text = text
        self.eventId = eventId
        self.read = read
        self.target = target
    }

    /// Mirrors web `notifTarget(n)` — resolved live, not baked in at creation
    /// time, since a `picked`/`expiring` row's destination depends on whether
    /// the seat is still awaiting confirmation by the time she taps it.
    public static func resolveMemberTarget(
        for notification: AppNotification,
        myEvents: [MyEventRow],
        eventExists: (String) -> Bool
    ) -> NotifTarget {
        let row = notification.eventId.flatMap { id in myEvents.first { $0.eventId == id } }
        switch notification.kind {
        case .picked, .expiring:
            if let row, row.state == .picked, let id = notification.eventId {
                return .pickedTakeover(eventId: id)
            }
        case .pass:
            if let row, row.state == .confirmed || row.state == .checkedIn,
               let id = notification.eventId {
                return .pass(eventId: id)
            }
        case .story:
            if let row, row.story == .due || row.story == .rejected,
               let id = notification.eventId {
                return .story(eventId: id)
            }
            return .myEventsPast
        case .cancelled:
            return .myEventsPast
        default:
            break
        }
        if let id = notification.eventId, eventExists(id) {
            return .eventDetail(eventId: id)
        }
        return .myEventsPast
    }
}

/// Every kind of Activity row across both sides. Member kinds mirror
/// `web/v3/index.html`'s literal `kind` strings; venue kinds mirror
/// `web/v2/venue.html`'s `venueNotifs` kinds.
public enum NotificationKind: String, Codable, Hashable, Sendable {
    // Member
    case picked
    case expiring
    case pass
    case story
    case drop
    case cancelled
    // Venue
    case applicants
    case confirmed
    case expired
    case declined
    case stories
    case invoice
}

/// Deep-link destination for a notification row. One enum for both sides —
/// member cases resolve dynamically (see `AppNotification.resolveMemberTarget`);
/// venue cases are set directly when a venue row is derived
/// (`VenueService.notifications`).
public enum NotifTarget: Codable, Hashable, Sendable {
    case eventDetail(eventId: String)
    case pickedTakeover(eventId: String)
    case pass(eventId: String)
    case story(eventId: String)
    case myEventsPast
    case reviewDeck(eventId: String)
    case guestList(eventId: String)
    case recap(eventId: String)
}
