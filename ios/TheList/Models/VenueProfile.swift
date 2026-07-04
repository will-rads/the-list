import Foundation

/// The demo venue's own profile (`web/v2/venue.html` `DEMO_VENUE`) — Cyan
/// Beach Club, the single venue login this prototype models operationally.
public struct VenueProfile: Codable, Identifiable, Hashable, Sendable {
    public var id: String
    public var name: String
    public var type: String
    public var area: String
    public var description: String
    public var heroImageName: String
    public var galleryImageNames: [String]
    /// `nil` = independent venue (the demo's case). Group/multi-venue stays
    /// dormant per the plan's cut list.
    public var groupName: String?

    public init(
        id: String,
        name: String,
        type: String,
        area: String,
        description: String,
        heroImageName: String,
        galleryImageNames: [String],
        groupName: String? = nil
    ) {
        self.id = id
        self.name = name
        self.type = type
        self.area = area
        self.description = description
        self.heroImageName = heroImageName
        self.galleryImageNames = galleryImageNames
        self.groupName = groupName
    }
}
