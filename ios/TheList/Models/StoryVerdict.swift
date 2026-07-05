import Foundation

/// The AI-assisted review's outcome (`web/v3/index.html` `forceVerdict`
/// outcomes table + `web/v2/venue.html` guest `verdict`). Gemini is
/// first-pass, not final judge (spec §4) — founders can override, but that
/// review queue is a backend/later-wave concern, not modeled here.
public struct StoryVerdict: Codable, Hashable, Sendable {
    public var score: Int
    public var reason: String

    public init(score: Int, reason: String) {
        self.score = score
        self.reason = reason
    }
}
