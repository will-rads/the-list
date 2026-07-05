import Foundation

/// One applicant's row inside `EventItem.guests` — the venue's per-guest
/// tracking record (`web/v2/venue.html` `makeGuest`/guest objects).
/// `applicantId` joins to `ApplicantCard.id`.
public struct GuestRow: Codable, Identifiable, Hashable, Sendable {
    public var applicantId: String
    public var state: ApplicationState
    public var story: StoryStatus?
    public var code: String?
    public var rating: Double?
    /// Door check-in time display, e.g. "22:41" (web `inAt`).
    public var inAt: String?
    public var verdict: StoryVerdict?

    public var id: String { applicantId }

    public init(
        applicantId: String,
        state: ApplicationState,
        story: StoryStatus? = nil,
        code: String? = nil,
        rating: Double? = nil,
        inAt: String? = nil,
        verdict: StoryVerdict? = nil
    ) {
        self.applicantId = applicantId
        self.state = state
        self.story = story
        self.code = code
        self.rating = rating
        self.inAt = inAt
        self.verdict = verdict
    }

    /// The narrower Door-tab view of this guest's arrival. Only `checkedIn`
    /// and `noShow` have a dedicated case; every other state (including
    /// `confirmed`, which is "expected but not yet at the door") resolves to
    /// `.pending` — callers gate on `state` first since the Door tab only
    /// ever lists confirmed/checkedIn/noShow rows to begin with.
    public var arrival: GuestArrival {
        switch state {
        case .checkedIn: return .checkedIn
        case .noShow:    return .noShow
        default:         return .pending
        }
    }
}
