import Foundation

/// The demo venue login — mirrors `web/v2/venue.html` `DEMO_VENUE` exactly
/// (reached in the web prototype via the intro screen's "Preview the desk").
extension DemoWorldSeed {
    public static func venueProfile() -> VenueProfile {
        VenueProfile(
            id: "cyan-beach-club", name: "Cyan Beach Club", type: "Beach", area: "Jiyeh",
            description: "Daybeds, shallow pool, golden-hour sets. Jiyeh's calmest room.",
            heroImageName: "beachClub", galleryImageNames: ["pool", "cocktail", "lounge", "rooftop"],
            groupName: nil
        )
    }
}
