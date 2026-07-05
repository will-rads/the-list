import Foundation

/// Member tier — gates a small set of Explore rooms (wave 2 per spec §6, not
/// yet built) and is echoed on the Profile hero chip ("Verified · Tier 1").
/// Web seeds only ever show Tier 1 (`tier_suggestion: 1`); the scale exists so
/// the type is ready when the gating feature lands.
public enum Tier: Int, Codable, Hashable, CaseIterable, Sendable {
    case one = 1
    case two = 2
    case three = 3

    /// Sentence-case display label, e.g. "Tier 1".
    public var label: String { "Tier \(rawValue)" }
}
