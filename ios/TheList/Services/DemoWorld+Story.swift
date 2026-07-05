import Foundation

/// Story proof — submit → under review → simulated verdict, plus the
/// enforcement loop's reminder/missed/strike escalation (spec §4). Mirrors
/// `web/v3/index.html`'s `submitStory`/`forceVerdict`.
extension DemoWorld {
    /// Web: flips the row to `.underReview` immediately, shows the "under
    /// review" toast, then arms a verdict timer for `verdictDelay` later
    /// (default outcome: verified).
    public func submitStory(eventId: String) {
        guard let idx = myEvents.firstIndex(where: { $0.eventId == eventId }) else { return }
        myEvents[idx].story = .underReview
        myEvents[idx].verdict = nil
        myEvents[idx].storyDueAt = nil
        showToast(Copy.storyUnderReviewLine)

        verdictTasks[eventId]?.cancel()
        verdictTasks[eventId] = Task { [weak self] in
            guard let self else { return }
            try? await Task.sleep(for: self.verdictDelay)
            guard !Task.isCancelled else { return }
            self.verdictTasks[eventId] = nil
            self.forceVerdict(eventId: eventId, status: .verified)
        }
    }

    /// Settles a story review with an explicit outcome. Mirrors web
    /// `forceVerdict`'s fixed outcomes table exactly (score + reason per
    /// verdict). Only `verified`/`needsReview`/`rejected` are valid inputs;
    /// anything else is a no-op, matching the web's `if (!verdict) return`.
    public func forceVerdict(eventId: String, status: StoryStatus) {
        guard events.contains(where: { $0.id == eventId }) else { return }
        let verdict: StoryVerdict
        switch status {
        case .verified:
            verdict = StoryVerdict(score: 91, reason: "Tag visible, posted in window")
        case .needsReview:
            verdict = StoryVerdict(score: 64, reason: "Our team takes a second look")
        case .rejected:
            verdict = StoryVerdict(score: 32, reason: "Tag not visible — try another screenshot")
        default:
            return
        }

        let idx = myEventIndex(for: eventId, defaultState: .checkedIn)
        myEvents[idx].story = status
        myEvents[idx].verdict = verdict

        switch status {
        case .verified:
            let title = events.first { $0.id == eventId }?.title ?? ""
            notifications = [
                AppNotification(
                    id: "story-\(eventId)-\(Date().timeIntervalSince1970)", kind: .story,
                    text: "Story verified · \(title)", eventId: eventId
                ),
            ] + notifications
            showToast("Verified \u{2713} · \(verdict.reason)")
        case .needsReview:
            showToast("Needs review · \(verdict.reason)")
        default:
            showToast(StoryStatus.rejected.memberLabel)
        }
    }

    /// Applies the enforcement-loop math (`StoryEscalation`) to every
    /// checked-in row still `.due`. Not a running 24h timer — a production
    /// backend (or a periodic call from here) drives this from `now`; tests
    /// call it directly with a synthetic date. Reaching `.missed` adds one
    /// strike to `memberProfile`; three strikes pause the account
    /// (`MemberProfile.isPaused`).
    public func evaluateStoryEscalations(now: Date = Date()) {
        for idx in myEvents.indices {
            guard let dueAt = myEvents[idx].storyDueAt else { continue }
            let outcome = StoryEscalation.evaluate(dueAt: dueAt, now: now, currentStatus: myEvents[idx].story ?? .notDue)
            myEvents[idx].story = outcome.status
            if outcome.status == .missed {
                myEvents[idx].storyDueAt = nil
            }
            if outcome.strikeAdded {
                memberProfile.strikes += 1
            }
        }
    }
}
