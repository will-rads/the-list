import Foundation

/// The second axis of guest state — only meaningful once a guest is
/// `checkedIn` (see `ApplicationState`). Mirrors web `SS` plus the two extra
/// cases the frozen contract adds for states the web leaves implicit
/// (`notDue` before check-in, `underReview` renamed from web's `review`).
///
/// Frozen contract: `StoryStatus { notDue, due, underReview, verified,
/// needsReview, rejected, missed }` — matched exactly, 7 cases.
public enum StoryStatus: String, Codable, Hashable, Sendable {
    case notDue
    case due
    case underReview
    case verified
    case needsReview
    case rejected
    case missed

    /// Member-facing sentence-case copy (web `SS_COPY`). The web appends a
    /// checkmark glyph only in toasts ("Verified ✓ · reason") — the stored
    /// label itself stays plain per `SS_COPY.verified === "Verified"`.
    public var memberLabel: String {
        switch self {
        case .notDue:      return ""
        case .due:         return "Story due"
        case .underReview: return "Under review"
        case .verified:    return "Verified"
        case .needsReview: return "Needs review"
        case .rejected:    return "Rejected — try another screenshot"
        case .missed:      return "Missed"
        }
    }

    /// Venue-facing recap wall copy (`ScreenRecap`'s `StoryRow`). `notDue` and
    /// `missed` never render a pill on the recap wall in the web source, so
    /// they resolve to `nil` here — callers fall back to no pill.
    public var venueRecapLabel: String? {
        switch self {
        case .verified:    return "Verified"
        case .underReview: return "Under review"
        case .needsReview: return "Needs review"
        case .due:         return "Story due"
        case .missed:      return "Missed"
        case .notDue, .rejected:
            return nil
        }
    }
}
