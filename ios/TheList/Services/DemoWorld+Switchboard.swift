import Foundation

/// The hidden demo rig's mutations that have no other home in the "real"
/// product services — `pickNow`/`expirePick`/`checkMeIn` are member-side
/// shortcuts (web Settings › Demo), `newApplicants`/`declinePick` are
/// venue-side shortcuts (web Venue tab › Demo). `forceVerdict` and
/// `advanceToTonight` just forward to the real methods on
/// `DemoWorld+Story.swift`/`DemoWorld+Venue.swift`, since those two actions
/// are both "real" product behavior AND switchboard demo triggers.
extension DemoWorld: DemoSwitchboard {
    /// Web: hardcoded to "Late Lounge" (`demoActions.pickNow`).
    public func pickNow() {
        simulatePick("lounge")
        showToast("Picked · check the bell")
    }

    public func expirePick() {
        guard let row = myEvents.first(where: { $0.state == .picked }) else {
            showToast("No pick to expire — apply first")
            return
        }
        let idx = myEventIndex(for: row.eventId, defaultState: .expired)
        myEvents[idx].state = .expired
        myEvents[idx].pickedAt = nil
        let title = events.first { $0.id == row.eventId }?.title ?? ""
        notifications = [
            AppNotification(
                id: "expired-\(row.eventId)-\(Date().timeIntervalSince1970)", kind: .expiring,
                text: "Pick expired · \(title)", eventId: row.eventId
            ),
        ] + notifications
    }

    /// Web: hardcoded to "Pool Day" (`demoActions.checkIn`). Also syncs the
    /// venue's own guest row for Sara (`a1`) so both sides of this unified
    /// world agree — the two separate web prototypes can't do this across
    /// files, but one shared `DemoWorld` can and should.
    public func checkMeIn() {
        guard let idx = myEvents.firstIndex(where: { $0.eventId == "pool" && $0.state == .confirmed }) else {
            return
        }
        myEvents[idx].state = .checkedIn
        myEvents[idx].inAt = "22:41"
        if let eventIdx = eventIndex(id: "pool"),
           let guestIdx = events[eventIdx].guests.firstIndex(where: { $0.applicantId == "a1" }) {
            events[eventIdx].guests[guestIdx].state = .checkedIn
            events[eventIdx].guests[guestIdx].inAt = "22:41"
        }
        showToast("Checked in · Pool Day")
    }

    /// Web: hardcoded to "Sound Bath" (`demoActions.verdict`).
    public func forceVerdict(_ status: StoryStatus) {
        forceVerdict(eventId: "bath", status: status)
    }

    /// Adds up to 6 fresh applicants to the first Open event; once the pool
    /// is exhausted, recycles `notSelected` applicants as new applications
    /// (web `demoActions.newApplicants`).
    public func newApplicants() {
        guard let idx = events.firstIndex(where: { $0.stage == .open }) else {
            showToast("No open event — publish one first")
            return
        }
        let present = Set(events[idx].guests.map(\.applicantId))
        let fresh = applicants.filter { !present.contains($0.id) }.prefix(6).map {
            GuestRow(applicantId: $0.id, state: .applied)
        }
        var added = fresh.count
        if added < 6 {
            for gIdx in events[idx].guests.indices {
                guard added < 6, events[idx].guests[gIdx].state == .notSelected else { continue }
                events[idx].guests[gIdx].state = .applied
                added += 1
            }
        }
        guard added > 0 else { return }
        events[idx].guests.append(contentsOf: fresh)
        events[idx].appliedTotal += added
        showToast("New applicants · check the deck")
    }

    /// A confirmed guest on "Pool Day" — never Sara (`LST-4F`) — declines,
    /// freeing a seat for a replacement pick (web `demoActions.pickDeclines`).
    public func declinePick() {
        guard let idx = eventIndex(id: "pool"),
              let guestIdx = events[idx].guests.firstIndex(where: {
                  $0.state == .confirmed && $0.code != "LST-4F"
              })
        else {
            showToast("No confirmed guest left to decline")
            return
        }
        let applicantId = events[idx].guests[guestIdx].applicantId
        events[idx].guests[guestIdx].state = .declined
        events[idx].guests[guestIdx].code = nil
        let name = applicant(id: applicantId)?.name ?? "A pick"
        showToast("\(name) declined — pick a replacement")
    }

    /// Restores the entire shared world to its seed state (web: both sides'
    /// `demoActions.reset`).
    public func reset() {
        cancelAllTimers()
        undoEntries.removeAll()
        events = DemoWorldSeed.events()
        myEvents = DemoWorldSeed.myEvents()
        notifications = DemoWorldSeed.notifications()
        venueProfile = DemoWorldSeed.venueProfile()
        memberProfile = DemoWorldSeed.memberProfile()
        applicants = DemoWorldSeed.applicants()
        showToast("Demo reset")
    }
}
