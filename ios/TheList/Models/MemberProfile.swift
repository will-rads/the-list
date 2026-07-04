import Foundation

/// The member's own profile — merges the vendor-neutral creator-data shape
/// (`web/v3/index.html` `mockCreatorDataFetch`/`SEED_PROFILE`) with the
/// Profile screen's Standing block and attendance mini-stats (spec §3
/// "Profile"). `reputationScore` is the Profile hero stat tile's hardcoded
/// 9.4 — NOT the same number as her own `ApplicantCard.reputationScore` (9.1)
/// in the venue's applicant pool. The two web files disagree on this one
/// number; both are kept verbatim to their own source (see the wave's return
/// note for the call).
public struct MemberProfile: Codable, Identifiable, Hashable, Sendable {
    public var id: String
    public var fullName: String
    public var handle: String
    public var photoName: String
    public var followersCount: Int
    public var tiktokFollowers: Int
    /// 0...1, e.g. `0.058` renders as "5.8%".
    public var engagementRate: Double
    /// `false` = "Self-reported" (estimated), `true` = "Verified" (web
    /// `data_status`). Flips true after the Verify-with-Instagram flow.
    public var isVerified: Bool
    public var genderFemalePct: Double
    public var audienceCountries: [AudienceCountry]
    public var tier: Tier
    public var reputationScore: Double
    public var strikes: Int
    public var nightsAttended: Int
    public var showsAttended: Int
    public var storiesVerified: Int

    public init(
        id: String,
        fullName: String,
        handle: String,
        photoName: String,
        followersCount: Int,
        tiktokFollowers: Int,
        engagementRate: Double,
        isVerified: Bool = false,
        genderFemalePct: Double,
        audienceCountries: [AudienceCountry],
        tier: Tier,
        reputationScore: Double,
        strikes: Int = 0,
        nightsAttended: Int,
        showsAttended: Int,
        storiesVerified: Int
    ) {
        self.id = id
        self.fullName = fullName
        self.handle = handle
        self.photoName = photoName
        self.followersCount = followersCount
        self.tiktokFollowers = tiktokFollowers
        self.engagementRate = engagementRate
        self.isVerified = isVerified
        self.genderFemalePct = genderFemalePct
        self.audienceCountries = audienceCountries
        self.tier = tier
        self.reputationScore = reputationScore
        self.strikes = strikes
        self.nightsAttended = nightsAttended
        self.showsAttended = showsAttended
        self.storiesVerified = storiesVerified
    }

    /// "Good standing · 0 strikes" (web-verbatim only at zero — the web demo
    /// never shows a nonzero count, so anything above zero below is this
    /// wave's own sentence-case extrapolation, not a transcribed string).
    public var standingLabel: String {
        guard strikes > 0 else { return Copy.goodStandingZero }
        return "\(strikes) strike\(strikes == 1 ? "" : "s") · under review"
    }

    /// Three strikes pause the account (spec §4 enforcement loop).
    public var isPaused: Bool { strikes >= 3 }
}
