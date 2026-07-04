import Foundation

/// Venue-side lifecycle stage of an event (the spine of the whole product —
/// see docs/superpowers/specs/2026-06-11-v1-feature-complete-design.md §1).
///
/// Draft ──publish──► Open ──close applications──► Locked ──close the night──► Past
///                      │                        │
///                      └────────cancel──────────┴──► Cancelled
///
/// "Locked" is internal/venue vocabulary only. The member never sees the word
/// "Locked" — see `memberLabel`.
public enum EventStage: String, Codable, Hashable, CaseIterable, Sendable {
    case draft
    case open
    case locked
    case past
    case cancelled

    /// Member-facing sentence-case label. Members never see "Locked" or "Draft"
    /// (drafts are never shown to members at all — see `EventItem.isVisibleToMembers`).
    public var memberLabel: String {
        switch self {
        case .draft:     return ""
        case .open:      return "Open"
        case .locked:    return "List closed"
        case .past:      return "Past"
        case .cancelled: return "Cancelled"
        }
    }

    /// Venue-facing sentence-case label (the Events tab segments + stage pills).
    public var venueLabel: String {
        switch self {
        case .draft:     return "Draft"
        case .open:      return "Open"
        case .locked:    return "Locked"
        case .past:      return "Past"
        case .cancelled: return "Cancelled"
        }
    }
}
