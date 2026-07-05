import Foundation

/// The recap's settle block (`web/v2/venue.html` `ScreenRecap` invoice card).
/// Manual settle only in v1 — no in-app payment (spec "Money in venue UI").
public struct Invoice: Codable, Hashable, Sendable {
    public enum Status: String, Codable, Hashable, Sendable {
        case due
        case paid
    }

    public var bundleName: String
    public var price: Int
    public var status: Status

    public init(bundleName: String, price: Int, status: Status) {
        self.bundleName = bundleName
        self.price = price
        self.status = status
    }
}
