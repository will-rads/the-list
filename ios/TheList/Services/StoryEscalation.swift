import Foundation

/// Pure math for the Story enforcement loop (spec §4): event ends → Story
/// due → reminder at +12h → Missed at 24h → strike. This is deliberately NOT
/// a running 24h timer (`Task.sleep` for a full day would be absurd on
/// device); a real backend drives this from a periodic job against stored
/// timestamps, and `DemoWorld` mirrors that by calling `evaluate(dueAt:now:)`
/// with the wall clock (or, in tests, a synthetic `now`) rather than waiting.
public enum StoryEscalation {
    /// Web has no equivalent constant — these are spec §4 values.
    public static let reminderDelay: TimeInterval = 12 * 3600
    public static let missedDelay: TimeInterval = 24 * 3600

    public struct Outcome: Hashable, Sendable {
        public var status: StoryStatus
        public var shouldSendReminder: Bool
        public var strikeAdded: Bool
    }

    /// Given when a story became due and the current time, compute the
    /// resulting status plus whether a reminder notification or a strike
    /// should fire. Only ever escalates a `.due` status — every other status
    /// (already verified/needsReview/rejected/missed/notDue) passes through
    /// unchanged, since the enforcement loop only chases an unmet "due".
    public static func evaluate(
        dueAt: Date,
        now: Date,
        currentStatus: StoryStatus
    ) -> Outcome {
        guard currentStatus == .due else {
            return Outcome(status: currentStatus, shouldSendReminder: false, strikeAdded: false)
        }
        let elapsed = now.timeIntervalSince(dueAt)
        if elapsed >= missedDelay {
            return Outcome(status: .missed, shouldSendReminder: false, strikeAdded: true)
        }
        if elapsed >= reminderDelay {
            return Outcome(status: .due, shouldSendReminder: true, strikeAdded: false)
        }
        return Outcome(status: .due, shouldSendReminder: false, strikeAdded: false)
    }
}
