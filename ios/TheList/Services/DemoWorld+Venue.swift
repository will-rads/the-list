import Foundation

/// Venue-side mutations — the review deck, Close applications, Cancel,
/// Door check-in/rate, Close the night → Recap, publish, and
/// advance-to-tonight. Mirrors `web/v2/venue.html`'s `ScreenReview`/
/// `ScreenDoor`/`ScreenEvents`/`ScreenRecap` logic. All of these operate on
/// `DemoWorld.venueManagedEvents()` — calling with an id outside that set is
/// a safe no-op (there is simply no matching event to mutate).
extension DemoWorld {
    /// Swipe decision. `pick == true` → `.picked`; on a Locked event this
    /// also arms a `autoConfirmDelay` auto-confirm timer that flips the
    /// guest to `.confirmed` with a generated code (web: 12s auto-confirm
    /// while reviewing a locked event's waitlist for replacements).
    /// `pick == false` → `.notSelected`. Records an undo entry either way.
    public func decide(eventId: String, applicantId: String, pick: Bool) {
        guard let eventIdx = eventIndex(id: eventId),
              let guestIdx = events[eventIdx].guests.firstIndex(where: { $0.applicantId == applicantId })
        else { return }

        let previousState = events[eventIdx].guests[guestIdx].state
        events[eventIdx].guests[guestIdx].state = pick ? .picked : .notSelected
        undoEntries[eventId] = UndoEntry(applicantId: applicantId, previousState: previousState)

        guard pick, events[eventIdx].stage == .locked else { return }
        let existingCodes = Set(events[eventIdx].guests.compactMap(\.code))
        let code = generateReplacementCode(for: applicantId, existingCodes: existingCodes)

        autoConfirmTasks[applicantId]?.cancel()
        autoConfirmTasks[applicantId] = Task { [weak self] in
            guard let self else { return }
            try? await Task.sleep(for: self.autoConfirmDelay)
            guard !Task.isCancelled else { return }
            self.autoConfirmTasks[applicantId] = nil
            guard let idx = self.eventIndex(id: eventId),
                  let gIdx = self.events[idx].guests.firstIndex(where: {
                      $0.applicantId == applicantId && $0.state == .picked
                  })
            else { return }
            self.events[idx].guests[gIdx].state = .confirmed
            self.events[idx].guests[gIdx].code = code
            let name = self.applicant(id: applicantId)?.name ?? applicantId
            self.showToast("\(name) confirmed")
        }
    }

    /// Reverses the last swipe recorded for this event (web `undoEntry` +
    /// `handleUndo`). Also cancels any auto-confirm timer that decision
    /// armed.
    public func undoLastDecision(eventId: String) {
        guard let entry = undoEntries[eventId],
              let eventIdx = eventIndex(id: eventId),
              let guestIdx = events[eventIdx].guests.firstIndex(where: { $0.applicantId == entry.applicantId })
        else { return }
        autoConfirmTasks[entry.applicantId]?.cancel()
        autoConfirmTasks[entry.applicantId] = nil
        events[eventIdx].guests[guestIdx].state = entry.previousState
        undoEntries[eventId] = nil
    }

    /// Locks the event; every still-`applied` guest becomes `.waitlisted`
    /// (web `handleCloseApplications`).
    public func closeApplications(eventId: String) {
        guard let idx = eventIndex(id: eventId) else { return }
        events[idx].stage = .locked
        for gIdx in events[idx].guests.indices where events[idx].guests[gIdx].state == .applied {
            events[idx].guests[gIdx].state = .waitlisted
        }
    }

    /// Cancels the event; every guest flips to `.cancelled` — no charge, no
    /// strikes (web `handleCancel`).
    public func cancelEvent(eventId: String) {
        guard let idx = eventIndex(id: eventId) else { return }
        events[idx].stage = .cancelled
        for gIdx in events[idx].guests.indices {
            events[idx].guests[gIdx].state = .cancelled
        }
        showToast("Event cancelled — guests notified")
    }

    /// Door check-in (web `checkIn` in `ScreenDoor`).
    public func checkIn(eventId: String, applicantId: String) {
        guard let idx = eventIndex(id: eventId),
              let gIdx = events[idx].guests.firstIndex(where: { $0.applicantId == applicantId })
        else { return }
        let time = Self.checkInTimeFormatter.string(from: Date())
        events[idx].guests[gIdx].state = .checkedIn
        events[idx].guests[gIdx].inAt = time
        let firstName = applicant(id: applicantId)?.name.split(separator: " ").first.map(String.init) ?? "Guest"
        showToast("\(firstName) checked in · \(time)")
    }

    /// Door no-show (web `markNoShow`).
    public func markNoShow(eventId: String, applicantId: String) {
        guard let idx = eventIndex(id: eventId),
              let gIdx = events[idx].guests.firstIndex(where: { $0.applicantId == applicantId })
        else { return }
        events[idx].guests[gIdx].state = .noShow
        let firstName = applicant(id: applicantId)?.name.split(separator: " ").first.map(String.init) ?? "Guest"
        showToast("\(firstName) marked no-show")
    }

    /// Door rating, 0...10 (web `submitSingleScore`/`submitQueueScore`).
    public func rate(eventId: String, applicantId: String, score: Double) {
        guard let idx = eventIndex(id: eventId),
              let gIdx = events[idx].guests.firstIndex(where: { $0.applicantId == applicantId })
        else { return }
        events[idx].guests[gIdx].rating = score
    }

    /// Close the night → build the Recap (web `doCloseNight`): remaining
    /// `confirmed` guests become `noShow`; every `checkedIn` guest's story
    /// becomes `due`; the event moves to `.past` with a fresh `recap` +
    /// `invoice` (due, unsettled) and the next `endedAt` ordinal.
    public func closeNight(eventId: String) {
        guard let idx = eventIndex(id: eventId) else { return }
        let guests = events[idx].guests
        let confirmedCount = guests.filter { $0.state == .confirmed }.count
        let checkedInCount = guests.filter { $0.state == .checkedIn }.count
        let noShowCount = guests.filter { $0.state == .noShow }.count

        for gIdx in events[idx].guests.indices {
            switch events[idx].guests[gIdx].state {
            case .confirmed: events[idx].guests[gIdx].state = .noShow
            case .checkedIn: events[idx].guests[gIdx].story = .due
            default: break
            }
        }

        let ratings = events[idx].guests
            .filter { $0.state == .checkedIn }
            .compactMap(\.rating)
        let avgRating: Double? = ratings.isEmpty
            ? nil
            : (ratings.reduce(0, +) / Double(ratings.count) * 10).rounded() / 10

        let maxEndedAt = events.map { $0.endedAt ?? 0 }.max() ?? 0
        events[idx].stage = .past
        events[idx].endedAt = maxEndedAt + 1
        events[idx].recap = RecapStats(
            confirmed: confirmedCount + checkedInCount + noShowCount,
            showed: checkedInCount,
            noShows: noShowCount + confirmedCount,
            avgRating: avgRating
        )
        events[idx].invoice = Invoice(
            bundleName: events[idx].bundle?.name ?? "Custom",
            price: events[idx].bundle?.price ?? 0,
            status: .due
        )
        showToast("Recap ready")
    }

    /// Sum of `instagramFollowers` across guests with a verified story —
    /// computed fresh every call, never stored (see `RecapStats`).
    public func verifiedReach(eventId: String) -> Int {
        guard let event = events.first(where: { $0.id == eventId }) else { return 0 }
        return event.guests
            .filter { $0.state == .checkedIn && $0.story == .verified }
            .reduce(0) { sum, guest in
                sum + (applicant(id: guest.applicantId)?.instagramFollowers ?? 0)
            }
    }

    /// Publishes a draft (or edits one already published/drafted in place),
    /// flipping it to `.open` (web `publishEvent`).
    public func publish(_ draft: EventItem) {
        var published = draft
        published.stage = .open
        if let idx = eventIndex(id: draft.id) {
            events[idx] = published
        } else {
            events.insert(published, at: 0)
        }
        showToast("Event published")
    }

    /// Flips "Late Lounge" from Open to Locked as tonight's second room:
    /// `applied` → `waitlisted`, `picked` → `confirmed` with a generated
    /// door code (web `demoActions.advanceToTonight`).
    public func advanceToTonight() {
        guard let idx = eventIndex(id: "lounge"), events[idx].stage == .open else {
            showToast("Late Lounge already advanced — reset first")
            return
        }
        var taken = Set(events.flatMap { $0.guests.compactMap(\.code) })
        events[idx].stage = .locked
        events[idx].date = Self.today
        for gIdx in events[idx].guests.indices {
            switch events[idx].guests[gIdx].state {
            case .applied:
                events[idx].guests[gIdx].state = .waitlisted
            case .picked:
                events[idx].guests[gIdx].state = .confirmed
                events[idx].guests[gIdx].code = generateDoorCode(taken: &taken)
            default:
                break
            }
        }
        showToast("Late Lounge is tonight's second room")
    }

    /// The venue's Activity feed, recomputed fresh from `venueManagedEvents()`
    /// (web `venueNotifs`, a pure function — not stored state).
    public func venueNotifications() -> [AppNotification] {
        var rows: [AppNotification] = []
        var sequence = 0
        func nextId() -> String {
            sequence += 1
            return "vnotif-\(sequence)"
        }

        for event in venueManagedEvents() {
            if event.stage == .open {
                let unswiped = event.guests.filter { $0.state == .applied }.count
                if unswiped > 0 {
                    rows.append(AppNotification(
                        id: nextId(), kind: .applicants,
                        text: "\(event.title) — \(unswiped) new applicant\(unswiped == 1 ? "" : "s")",
                        eventId: event.id, target: .reviewDeck(eventId: event.id)
                    ))
                }
            }
            if event.stage == .locked {
                let confirmedCount = event.guests.filter { $0.state == .confirmed }.count
                if confirmedCount > 0 {
                    rows.append(AppNotification(
                        id: nextId(), kind: .confirmed,
                        text: "\(event.title) — \(confirmedCount) confirmed",
                        eventId: event.id, target: .guestList(eventId: event.id)
                    ))
                }
                if event.guests.contains(where: { $0.state == .expired }) {
                    rows.append(AppNotification(
                        id: nextId(), kind: .expired,
                        text: "\(event.title) — a pick expired · pick a replacement",
                        eventId: event.id, target: .reviewDeck(eventId: event.id)
                    ))
                }
                if event.guests.contains(where: { $0.state == .declined }) {
                    rows.append(AppNotification(
                        id: nextId(), kind: .declined,
                        text: "\(event.title) — a pick declined · pick a replacement",
                        eventId: event.id, target: .reviewDeck(eventId: event.id)
                    ))
                }
            }
            if event.stage == .past, event.recap != nil {
                let inReview = event.guests.filter { $0.story == .underReview }.count
                let due = event.guests.filter { $0.story == .due }.count
                let verified = event.guests.filter { $0.story == .verified }.count
                if inReview > 0 || due > 0 {
                    rows.append(AppNotification(
                        id: nextId(), kind: .stories,
                        text: "\(event.title) — \(verified) stor\(verified == 1 ? "y" : "ies")"
                            + " verified · \(inReview + due) pending",
                        eventId: event.id, target: .recap(eventId: event.id)
                    ))
                }
                if let invoice = event.invoice, invoice.status == .due {
                    rows.append(AppNotification(
                        id: nextId(), kind: .invoice,
                        text: "\(event.title) — invoice due · $\(invoice.price)",
                        eventId: event.id, target: .recap(eventId: event.id)
                    ))
                }
            }
        }
        return rows
    }

    private static let checkInTimeFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "HH:mm"
        return formatter
    }()

    /// Replacement-pick code for a review-deck "yes" on a Locked event (web
    /// `genCode` in `ScreenReview`): `LST-` + the applicant's numeric suffix
    /// zero-padded to two digits, falling back to a lettered/timestamped
    /// suffix on collision.
    func generateReplacementCode(for applicantId: String, existingCodes: Set<String>) -> String {
        let digits = applicantId.hasPrefix("a") ? String(applicantId.dropFirst()) : applicantId
        let padded = digits.count < 2 ? String(repeating: "0", count: 2 - digits.count) + digits : digits
        let base = "LST-\(padded.uppercased())"
        if !existingCodes.contains(base) { return base }
        for letter in "ABCDEFGHJKLMNPRSTUVWXY" {
            let candidate = base + String(letter)
            if !existingCodes.contains(candidate) { return candidate }
        }
        let stamp = String(Int(Date().timeIntervalSince1970))
        return base + String(stamp.suffix(3))
    }

    /// Fresh door code for `advanceToTonight`'s picked → confirmed guests
    /// (web `genDoorCode`): `LST-` + two random alphanumerics, no collision
    /// against `taken`.
    func generateDoorCode(taken: inout Set<String>) -> String {
        let chars = Array("ABCDEFGHJKLMNPQRSTUVWXYZ23456789")
        var code = ""
        repeat {
            let a = chars.randomElement() ?? "2"
            let b = chars.randomElement() ?? "3"
            code = "LST-\(a)\(b)"
        } while taken.contains(code)
        taken.insert(code)
        return code
    }
}
