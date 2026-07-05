import Foundation

/// One row of an audience's country split, e.g. `("Lebanon", 0.71)`. Shared by
/// `MemberProfile.audienceCountries` and `ApplicantCard.audienceCountries` —
/// both web files render this identical shape (`audience.country_split` /
/// `audience.countries`).
public struct AudienceCountry: Codable, Hashable, Sendable {
    public var label: String
    /// Fraction 0...1 (e.g. `0.71` renders as "71%").
    public var pct: Double

    public init(label: String, pct: Double) {
        self.label = label
        self.pct = pct
    }
}
