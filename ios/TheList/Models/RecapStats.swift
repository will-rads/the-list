import Foundation

/// The Recap screen's four stat tiles (`web/v2/venue.html` `ScreenRecap`,
/// `event.recap`). Deliberately does NOT store total verified reach — the web
/// source computes it fresh from the guest list every render (web comment:
/// "reach is DERIVED on the recap screen ... never stored"); see
/// `VenueService.verifiedReach(eventId:)` for the equivalent here.
public struct RecapStats: Codable, Hashable, Sendable {
    public var confirmed: Int
    public var showed: Int
    public var noShows: Int
    /// `nil` before any guest has been rated at the door.
    public var avgRating: Double?

    public init(confirmed: Int, showed: Int, noShows: Int, avgRating: Double? = nil) {
        self.confirmed = confirmed
        self.showed = showed
        self.noShows = noShows
        self.avgRating = avgRating
    }
}
