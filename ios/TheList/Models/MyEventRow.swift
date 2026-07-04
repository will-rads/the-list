import Foundation

/// The member's join row between herself and one `EventItem` — mirrors
/// `web/v3/index.html` `MY_EVENTS` entries. `storyDueAt` has no web
/// equivalent (the prototype has no real clock-driven story escalation): it
/// anchors `StoryEscalation`'s pure reminder/missed/strike math for the
/// enforcement loop described in spec §4.
public struct MyEventRow: Codable, Identifiable, Hashable, Sendable {
    public var eventId: String
    public var state: ApplicationState
    public var code: String?
    public var story: StoryStatus?
    public var verdict: StoryVerdict?
    /// When the venue picked her — the anchor for the 24h confirm countdown
    /// (web `pickedAt`). `nil` once confirmed/declined/expired.
    public var pickedAt: Date?
    /// Door check-in time display, e.g. "22:41" (web `inAt`).
    public var inAt: String?
    /// When her story became due (event end) — anchor for `StoryEscalation`.
    /// `nil` unless `story == .due` (or has escalated from it).
    public var storyDueAt: Date?

    public var id: String { eventId }

    public init(
        eventId: String,
        state: ApplicationState,
        code: String? = nil,
        story: StoryStatus? = nil,
        verdict: StoryVerdict? = nil,
        pickedAt: Date? = nil,
        inAt: String? = nil,
        storyDueAt: Date? = nil
    ) {
        self.eventId = eventId
        self.state = state
        self.code = code
        self.story = story
        self.verdict = verdict
        self.pickedAt = pickedAt
        self.inAt = inAt
        self.storyDueAt = storyDueAt
    }

    /// Member-facing status pill text. Overrides `state.memberLabel` with a
    /// live "Confirm within Xh" chip while `picked` (mirrors the `hoursLeft`
    /// math in web `ScreenMyEvents`'s Applied segment) — every other state
    /// just reads the enum's own copy.
    public func statusLabel(now: Date = Date()) -> String {
        if state == .picked, let hours = hoursLeftToConfirm(now: now) {
            return "Confirm within \(hours)h"
        }
        return state.memberLabel
    }

    /// Hours left on the 24h confirm window, floored at 1 (web:
    /// `Math.max(1, Math.ceil(...))`, falling back to "now" as the anchor
    /// when `pickedAt` is missing, same as web's `r.pickedAt || Date.now()`).
    /// `nil` when not currently `picked`.
    public func hoursLeftToConfirm(now: Date = Date()) -> Int? {
        guard state == .picked else { return nil }
        let anchor = pickedAt ?? now
        let deadline = anchor.addingTimeInterval(24 * 3600)
        let remainingHours = deadline.timeIntervalSince(now) / 3600
        return max(1, Int(remainingHours.rounded(.up)))
    }
}
