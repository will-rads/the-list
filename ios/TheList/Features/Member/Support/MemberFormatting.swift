import Foundation

// Display formatting shared across member screens, transcribed from the web
// prototype's inline helpers (`parseDate`, the Profile follower/engagement math).
// Kept out of the frozen Models so the pure-Swift contract stays presentation-free.
enum MemberFormatting {

    struct DateParts {
        var weekday: String
        var day: String
        var month: String
    }

    /// Web `parseDate("Sun · 25 May")` → weekday "Sun", day "25", month "May".
    static func parseDate(_ string: String) -> DateParts {
        let halves = string.split(separator: "·", maxSplits: 1).map {
            $0.trimmingCharacters(in: .whitespaces)
        }
        let weekday = halves.first ?? ""
        let rest = halves.count > 1 ? halves[1] : ""
        let pieces = rest.split(separator: " ").map(String.init)
        let day = pieces.first ?? ""
        let month = pieces.count > 1 ? pieces.dropFirst().joined(separator: " ") : ""
        return DateParts(weekday: weekday, day: day, month: month)
    }

    /// The weekday half of a "Sun · 25 May" string (web `date.split('·')[0]`).
    static func weekdayPart(_ string: String) -> String {
        parseDate(string).weekday
    }

    /// The "25 May" half of a "Sun · 25 May" string (web `date.split('·')[1]`).
    static func dayMonthPart(_ string: String) -> String {
        let parts = parseDate(string)
        return [parts.day, parts.month].filter { !$0.isEmpty }.joined(separator: " ")
    }

    /// Web follower shorthand: `>=1000` → thousands with a "k" ("28k", "5.8k"),
    /// dropping the decimal once past 10k.
    static func followers(_ count: Int) -> String {
        guard count >= 1000 else { return "\(count)" }
        let thousands = Double(count) / 1000
        let digits = count >= 10000 ? 0 : 1
        return trimmed(thousands, digits: digits) + "k"
    }

    /// Engagement rate 0…1 → "5.8%" (web `(rate*100).toFixed(1)`).
    static func engagementPercent(_ rate: Double) -> String {
        trimmed(rate * 100, digits: 1) + "%"
    }

    /// Audience fraction 0…1 → rounded whole percent, e.g. 0.71 → "71%".
    static func wholePercent(_ fraction: Double) -> Int {
        Int((fraction * 100).rounded())
    }

    /// Reputation 9.4 → "9.4" (one decimal), matching the web stat tile.
    static func oneDecimal(_ value: Double) -> String {
        trimmed(value, digits: 1)
    }

    private static func trimmed(_ value: Double, digits: Int) -> String {
        let s = String(format: "%.\(digits)f", value)
        return s
    }
}
