import Foundation

/// Member-side mutations — apply, the simulated pick, confirm/decline, and
/// withdraw. Mirrors `web/v3/index.html`'s `onApply`/`simulatePick`/
/// `onConfirmPick`/`onDeclinePick` timers and state transitions.
extension DemoWorld {
    /// Web: a 1.4s "submitting" pause, then an upserted `applied` row, then a
    /// pick auto-armed for `pickDelay` later. Re-applying to the same event
    /// cancels any stale pick timer first (web comment, verbatim rule).
    public func apply(to eventId: String) {
        guard events.contains(where: { $0.id == eventId }) else { return }
        applyTask?.cancel()
        pickTasks[eventId]?.cancel()
        pickTasks[eventId] = nil

        applyTask = Task { [weak self] in
            guard let self else { return }
            try? await Task.sleep(for: self.applySubmitDelay)
            guard !Task.isCancelled else { return }
            let idx = self.myEventIndex(for: eventId, defaultState: .applied)
            self.myEvents[idx].state = .applied
            self.showToast("Application sent")
            self.armPickTimer(for: eventId)
        }
    }

    func armPickTimer(for eventId: String) {
        pickTasks[eventId] = Task { [weak self] in
            guard let self else { return }
            try? await Task.sleep(for: self.pickDelay)
            guard !Task.isCancelled else { return }
            self.pickTasks[eventId] = nil
            self.simulatePick(eventId)
        }
    }

    /// Flips an `applied` row to `picked` and prepends the two web
    /// notifications ("2h left" expiring teaser, then "picked"). Only an
    /// `applied` row can be picked — never resurrects a declined/confirmed
    /// row (web comment, verbatim rule).
    func simulatePick(_ eventId: String) {
        guard let event = events.first(where: { $0.id == eventId }) else { return }
        if let existing = myEvents.first(where: { $0.eventId == eventId }), existing.state != .applied {
            return
        }
        let now = Date()
        let idx = myEventIndex(for: eventId, defaultState: .picked)
        myEvents[idx].state = .picked
        myEvents[idx].pickedAt = now

        let stamp = now.timeIntervalSince1970
        notifications = [
            AppNotification(
                id: "expire-\(eventId)-\(stamp)", kind: .expiring,
                text: "Confirm your seat — 2h left · \(event.title)", eventId: eventId
            ),
            AppNotification(
                id: "pick-\(eventId)-\(stamp)", kind: .picked,
                text: "\(venueProfile.name) picked you · \(event.title)", eventId: eventId
            ),
        ] + notifications
    }

    /// Confirms a `picked` row: issues a door code, moves to `confirmed`.
    public func confirmPick(eventId: String) {
        guard let row = myEvents.first(where: { $0.eventId == eventId }), row.state == .picked else { return }
        let code = generateMemberCode()
        let idx = myEventIndex(for: eventId, defaultState: .confirmed)
        myEvents[idx].state = .confirmed
        myEvents[idx].code = code
        myEvents[idx].pickedAt = nil
        showToast("You're in — pass ready")
    }

    /// Declines a `picked` row (the member's own decision — not the venue
    /// switchboard's `declinePick`, which simulates a *different* confirmed
    /// guest declining).
    public func declineMyPick(eventId: String) {
        guard let row = myEvents.first(where: { $0.eventId == eventId }), row.state == .picked else { return }
        let idx = myEventIndex(for: eventId, defaultState: .declined)
        myEvents[idx].state = .declined
        myEvents[idx].pickedAt = nil
        showToast("Seat released")
    }

    /// Withdraw is only meaningful before a pick lands (spec §3: the
    /// `Withdrawn` *status* is wave-1 vocabulary; the UI affordance to
    /// trigger it is a later wave's screen).
    public func withdraw(from eventId: String) {
        guard let row = myEvents.first(where: { $0.eventId == eventId }),
              row.state == .applied || row.state == .waitlisted else { return }
        pickTasks[eventId]?.cancel()
        pickTasks[eventId] = nil
        let idx = myEventIndex(for: eventId, defaultState: .withdrawn)
        myEvents[idx].state = .withdrawn
    }

    /// `LST-XX` where XX is two uppercase alphanumerics, no collision against
    /// any code already issued anywhere in the world (web `genCode`).
    func generateMemberCode() -> String {
        var taken = Set(myEvents.compactMap(\.code))
        for event in events {
            taken.formUnion(event.guests.compactMap(\.code))
        }
        let chars = Array("ABCDEFGHJKLMNPQRSTUVWXYZ23456789")
        var code = ""
        repeat {
            let a = chars.randomElement() ?? "2"
            let b = chars.randomElement() ?? "3"
            code = "LST-\(a)\(b)"
        } while taken.contains(code)
        return code
    }

    /// Assembles the Pass for a confirmed/checked-in event — `nil` when the
    /// event has no relationship, no brief, or no issued code yet (mirrors
    /// web `openPass`'s guard).
    public func passInfo(for eventId: String) -> PassInfo? {
        guard let event = events.first(where: { $0.id == eventId }),
              let row = myEvents.first(where: { $0.eventId == eventId }),
              row.state == .confirmed || row.state == .checkedIn,
              let brief = event.brief,
              let code = row.code
        else { return nil }

        return PassInfo(
            eventId: eventId, code: code, brief: brief, eventTitle: event.title,
            venueName: event.venueName, area: event.area, date: event.date, doors: event.doors,
            memberFullName: memberProfile.fullName, memberPhotoName: memberProfile.photoName,
            memberHandle: memberProfile.handle, isCheckedIn: row.state == .checkedIn,
            checkedInAt: row.inAt
        )
    }
}
