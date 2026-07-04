import Foundation

// Web `VENUE_TYPES` / `BEIRUT_AREAS` — the fixed pill catalogs shared by venue
// onboarding and the post wizard's Basics step. `EventItem.type`/`VenueProfile.type`
// are free-text strings in the frozen contract (not an enum), so these stay a
// plain constant list here rather than a Models addition.
enum VenueCatalog {
    static let venueTypes = ["Club", "Restaurant", "Beach", "Lounge", "Gym"]
    static let beirutAreas = ["Mar Mikhael", "Gemmayze", "Achrafieh", "Hamra", "Badaro", "Saifi", "Manara", "Jiyeh", "Batroun"]
}
