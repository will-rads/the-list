import Foundation

// Display formatting local to the venue side (web `fmtReach`/`quality10`),
// kept out of the frozen Models for the same reason as `MemberFormatting`.
enum VenueFormatting {
    private static let reachFormatter: NumberFormatter = {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.usesGroupingSeparator = true
        formatter.groupingSeparator = ","
        formatter.groupingSize = 3
        return formatter
    }()

    /// Web `n.toLocaleString("en-US")` — the Recap's "Verified reach" number.
    static func reach(_ n: Int) -> String {
        reachFormatter.string(from: NSNumber(value: n)) ?? "\(n)"
    }
}
