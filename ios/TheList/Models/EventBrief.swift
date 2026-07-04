import Foundation

/// The Brief — arrival window, dress code, meeting point, house rules — shown
/// on every Confirmed card, the Pass, and the venue's post wizard. Field names
/// map 1:1 to web `brief` objects (`arrival` → `arrivalWindow`, `dress` →
/// `dressCode`, `meeting` → `meetingPoint`, `rules` → `houseRules`).
public struct EventBrief: Codable, Hashable, Sendable {
    public var arrivalWindow: String
    public var dressCode: String
    public var meetingPoint: String
    public var houseRules: String
    /// Member-facing reassurance line under the Brief block
    /// (`web/v3/index.html` `BriefBlock`: "Plans change? The List handles it.").
    public var conciergeLine: String

    public init(
        arrivalWindow: String,
        dressCode: String,
        meetingPoint: String,
        houseRules: String,
        conciergeLine: String = Copy.conciergeLine
    ) {
        self.arrivalWindow = arrivalWindow
        self.dressCode = dressCode
        self.meetingPoint = meetingPoint
        self.houseRules = houseRules
        self.conciergeLine = conciergeLine
    }
}
