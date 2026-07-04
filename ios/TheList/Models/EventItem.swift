import Foundation

/// The event card / detail source of truth — one shape shared by member
/// Explore (`web/v3/index.html` `EVENTS`) and venue Desk/Events/Door/Recap
/// (`web/v2/venue.html` `SEED_EVENTS`). `venueName` is a display string, not a
/// foreign key to `VenueProfile` — the demo world only fully *operates* one
/// venue (Cyan Beach Club); `guests`/`bundle`/`recap`/`invoice` are populated
/// only for the events that venue manages. See `DemoWorldSeed` for the
/// documented "harbor" venue-name disagreement between the two web files.
public struct EventItem: Codable, Identifiable, Hashable, Sendable {
    /// Nested so the frozen top-level model list stays exactly the contract's
    /// names. Mirrors web `mix:{girls,guys}`; `nil` on the event itself means
    /// no gender preference (web comment: "null === no gender preference").
    public struct Mix: Codable, Hashable, Sendable {
        public var girls: Int
        public var guys: Int

        public init(girls: Int, guys: Int) {
            self.girls = girls
            self.guys = guys
        }
    }

    public var id: String
    public var title: String
    public var venueName: String
    public var area: String
    public var type: String
    /// Display date string, e.g. "Sun · 25 May" — the demo world has no real
    /// calendar math; both web files treat "today" as a fixed label
    /// (`DemoWorld.today`).
    public var date: String
    public var time: String
    public var doors: String
    public var stage: EventStage
    public var seats: Int
    public var mix: Mix?
    public var appliedTotal: Int
    public var closesAt: String?
    public var closingSoon: Bool
    public var brief: EventBrief?
    public var bundle: EventBundle?
    public var imageName: String
    public var galleryImageNames: [String]
    public var guests: [GuestRow]
    public var recap: RecapStats?
    public var invoice: Invoice?
    /// Monotonic close ordinal (web `endedAt`) — lets the Desk's "last recap
    /// teaser" find the most recently closed night without real timestamps.
    public var endedAt: Int?

    public init(
        id: String,
        title: String,
        venueName: String,
        area: String,
        type: String,
        date: String,
        time: String,
        doors: String,
        stage: EventStage,
        seats: Int,
        mix: Mix? = nil,
        appliedTotal: Int = 0,
        closesAt: String? = nil,
        closingSoon: Bool = false,
        brief: EventBrief? = nil,
        bundle: EventBundle? = nil,
        imageName: String,
        galleryImageNames: [String] = [],
        guests: [GuestRow] = [],
        recap: RecapStats? = nil,
        invoice: Invoice? = nil,
        endedAt: Int? = nil
    ) {
        self.id = id
        self.title = title
        self.venueName = venueName
        self.area = area
        self.type = type
        self.date = date
        self.time = time
        self.doors = doors
        self.stage = stage
        self.seats = seats
        self.mix = mix
        self.appliedTotal = appliedTotal
        self.closesAt = closesAt
        self.closingSoon = closingSoon
        self.brief = brief
        self.bundle = bundle
        self.imageName = imageName
        self.galleryImageNames = galleryImageNames
        self.guests = guests
        self.recap = recap
        self.invoice = invoice
        self.endedAt = endedAt
    }

    /// Drafts are never shown to members (spec §1 Draft row: "Members never
    /// see it").
    public var isVisibleToMembers: Bool { stage != .draft }

    /// Member-facing stage badge — "Closing soon" overrides the plain stage
    /// label while `closingSoon` is set on an Open event (web `badge` field).
    public var memberBadge: String {
        if stage == .open && closingSoon { return "Closing soon" }
        return stage.memberLabel
    }
}
