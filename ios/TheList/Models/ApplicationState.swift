import Foundation

/// The member's relationship to one event — one axis, no synonyms (see spec §1
/// "Per-guest state machine"). Mirrors web `GS` (`GS = { applied, waitlist,
/// picked, confirmed, declined, expired, withdrawn, checked_in, no_show,
/// not_selected, cancelled }`) in both `web/v3/index.html` and `web/v2/venue.html`.
///
/// Contract note: the plan's frozen list names exactly
/// `{ none, applied, picked, confirmed, expired, declined, waitlisted }`. Those
/// seven case names are kept verbatim. The five additional cases below
/// (`withdrawn`, `checkedIn`, `noShow`, `notSelected`, `cancelled`) are required
/// by the feature spec's own lifecycle (Door check-in, My Events "Past" segment,
/// event cancellation with "no charge, no strikes") and by the web seeds this
/// wave must reproduce exactly — omitting them would make those flows
/// unrepresentable. See the wave's return note for this call.
public enum ApplicationState: String, Codable, Hashable, Sendable {
    case none          // no relationship yet — browse-only
    case applied
    case waitlisted
    case picked
    case confirmed
    case declined
    case expired
    case withdrawn
    case checkedIn
    case noShow
    case notSelected
    case cancelled

    /// Member-facing sentence-case copy (web `GS_COPY`). The base label for a
    /// `picked` row; `MyEventRow.statusLabel(now:)` overrides it with a live
    /// "Confirm within Xh" chip, matching `ScreenMyEvents`'s Applied segment.
    public var memberLabel: String {
        switch self {
        case .none:        return ""
        case .applied:     return "Applied · under review"
        case .waitlisted:  return "Still under review"
        case .picked:      return "Confirm your seat"
        case .confirmed:   return "Confirmed"
        case .declined:    return "Declined"
        case .expired:     return "Pick expired"
        case .withdrawn:   return "Withdrawn"
        case .checkedIn:   return "Checked in"
        case .noShow:      return "No show"
        case .notSelected: return "Not selected"
        case .cancelled:   return "Event cancelled"
        }
    }

    /// Extra quiet note shown alongside the pill for a couple of terminal
    /// states (My Events → Past). `nil` when there is nothing more to say.
    public var memberDetailNote: String? {
        switch self {
        case .cancelled: return "Event cancelled · no strike"
        default:         return nil
        }
    }

    /// True for the "quiet" terminal states — the ones that end the
    /// relationship without a night out (My Events → Past dims these).
    public var isQuiet: Bool {
        switch self {
        case .notSelected, .cancelled, .expired, .declined, .withdrawn, .noShow:
            return true
        default:
            return false
        }
    }

    /// States that belong in the My Events "Applied" segment (applied,
    /// waitlisted, picked — still-live outcomes of an application).
    public var isInAppliedSegment: Bool {
        self == .applied || self == .waitlisted || self == .picked
    }

    /// States that belong in the My Events "Past" segment.
    public var isInPastSegment: Bool {
        switch self {
        case .checkedIn, .noShow, .notSelected, .cancelled, .expired, .declined, .withdrawn:
            return true
        default:
            return false
        }
    }
}
