import Foundation

/// A posting package (venue post wizard step 3, `web/v2/venue.html`
/// `BUNDLES`). `name` doubles as the identity — there is no separate numeric
/// id in the web source and the name is already a stable, unique key ("The
/// ten" / "The twenty" / "The forty" / "Custom").
public struct EventBundle: Codable, Hashable, Sendable {
    public var name: String
    public var seats: Int
    public var price: Int

    public init(name: String, seats: Int, price: Int) {
        self.name = name
        self.seats = seats
        self.price = price
    }
}

extension EventBundle: Identifiable {
    public var id: String { name }
}

extension EventBundle {
    /// The three fixed templates offered in the post wizard. "Custom" is
    /// constructed ad hoc by the wizard (a later wave's screen) with a
    /// venue-entered price, so it has no catalog entry here.
    public static let ten    = EventBundle(name: "The ten",    seats: 10, price: 400)
    public static let twenty = EventBundle(name: "The twenty", seats: 20, price: 700)
    public static let forty  = EventBundle(name: "The forty",  seats: 40, price: 1200)
    public static let catalog: [EventBundle] = [ten, twenty, forty]
}
