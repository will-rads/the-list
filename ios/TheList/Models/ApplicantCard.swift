import Foundation

/// A venue's view of one applicant — the swipe-deck card + Applicant sheet
/// (`web/v2/venue.html` `APPLICANTS`). `id` joins to `GuestRow.applicantId`.
public struct ApplicantCard: Codable, Identifiable, Hashable, Sendable {
    public var id: String
    public var name: String
    /// Free-text, not a closed enum — the mock only ever reasons about two
    /// values ("female"/"male") for mix-fill math; modeling it as an enum
    /// would over-commit a demographic axis the product doesn't otherwise
    /// gate on.
    public var gender: String
    public var photoName: String
    /// 0...1 fake-follower-check score (web `quality_score`); display via
    /// `(qualityScore * 10)` rounded to one decimal, e.g. `0.94` → "9.4".
    public var qualityScore: Double
    public var instagramFollowers: Int
    public var tiktokFollowers: Int
    public var instagramURL: String?
    public var tiktokURL: String?
    public var otherURL: String?
    public var reputationScore: Double
    public var nights: Int
    public var shows: Int
    public var noShows: Int
    public var strikes: Int
    /// Nights this applicant has attended alongside the current member (web
    /// `withYou`) — shown only when greater than zero.
    public var withYou: Int
    public var audienceFemalePct: Double
    public var audienceCountries: [AudienceCountry]

    public init(
        id: String,
        name: String,
        gender: String,
        photoName: String,
        qualityScore: Double,
        instagramFollowers: Int,
        tiktokFollowers: Int,
        instagramURL: String? = nil,
        tiktokURL: String? = nil,
        otherURL: String? = nil,
        reputationScore: Double,
        nights: Int,
        shows: Int,
        noShows: Int,
        strikes: Int,
        withYou: Int,
        audienceFemalePct: Double,
        audienceCountries: [AudienceCountry]
    ) {
        self.id = id
        self.name = name
        self.gender = gender
        self.photoName = photoName
        self.qualityScore = qualityScore
        self.instagramFollowers = instagramFollowers
        self.tiktokFollowers = tiktokFollowers
        self.instagramURL = instagramURL
        self.tiktokURL = tiktokURL
        self.otherURL = otherURL
        self.reputationScore = reputationScore
        self.nights = nights
        self.shows = shows
        self.noShows = noShows
        self.strikes = strikes
        self.withYou = withYou
        self.audienceFemalePct = audienceFemalePct
        self.audienceCountries = audienceCountries
    }
}
