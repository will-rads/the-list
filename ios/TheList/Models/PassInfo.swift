import Foundation

/// The full-screen ticket (`web/v3/index.html` `ScreenPass`) — assembled by
/// `ApplicationService` from an `EventItem` + `MemberProfile` + `MyEventRow`,
/// not stored directly in the demo world. There is nothing here that isn't
/// already derivable from those three; this struct exists so a screen has one
/// flat shape to render instead of three lookups.
public struct PassInfo: Identifiable, Hashable, Sendable {
    public var eventId: String
    public var code: String
    public var brief: EventBrief
    public var eventTitle: String
    public var venueName: String
    public var area: String
    public var date: String
    public var doors: String
    public var memberFullName: String
    public var memberPhotoName: String
    public var memberHandle: String
    public var isCheckedIn: Bool
    public var checkedInAt: String?

    public var id: String { eventId }

    public init(
        eventId: String,
        code: String,
        brief: EventBrief,
        eventTitle: String,
        venueName: String,
        area: String,
        date: String,
        doors: String,
        memberFullName: String,
        memberPhotoName: String,
        memberHandle: String,
        isCheckedIn: Bool,
        checkedInAt: String? = nil
    ) {
        self.eventId = eventId
        self.code = code
        self.brief = brief
        self.eventTitle = eventTitle
        self.venueName = venueName
        self.area = area
        self.date = date
        self.doors = doors
        self.memberFullName = memberFullName
        self.memberPhotoName = memberPhotoName
        self.memberHandle = memberHandle
        self.isCheckedIn = isCheckedIn
        self.checkedInAt = checkedInAt
    }
}
