import Foundation

/// The narrower, door-only view of a guest's arrival — the three segments of
/// `ScreenDoor` in `web/v2/venue.html` (Expected / In / No show). Derived from
/// `ApplicationState` via `GuestRow.arrival`; not every `ApplicationState`
/// maps to one (e.g. `applied`, `waitlisted` never reach the door).
public enum GuestArrival: String, Codable, Hashable, CaseIterable, Sendable {
    case pending
    case checkedIn
    case noShow

    /// Venue-facing segment label (Door tab `Segmented` control).
    public var label: String {
        switch self {
        case .pending:   return "Expected"
        case .checkedIn: return "In"
        case .noShow:    return "No show"
        }
    }
}
