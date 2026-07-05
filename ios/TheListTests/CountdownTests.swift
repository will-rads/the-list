import Foundation
import Testing
#if canImport(TheListCore)
@testable import TheListCore
#else
@testable import TheList
#endif

/// The 24h confirm-window math on `MyEventRow` (web `ScreenMyEvents`'s
/// `hoursLeft` computation): `Math.max(1, Math.ceil(...))`, falling back to
/// "now" as the anchor when `pickedAt` is missing.
@Suite("Countdown math")
struct CountdownTests {
    @Test("a fresh pick shows a full 24 hours left")
    func freshPick() {
        let row = MyEventRow(eventId: "lounge", state: .picked, pickedAt: Date())
        #expect(row.hoursLeftToConfirm() == 24)
        #expect(row.statusLabel() == "Confirm within 24h")
    }

    @Test("near the 24h deadline the countdown floors at 1 hour, never 0")
    func nearDeadline() {
        let pickedAt = Date().addingTimeInterval(-(24 * 3600 - 10)) // 10s of window left
        let row = MyEventRow(eventId: "lounge", state: .picked, pickedAt: pickedAt)
        #expect(row.hoursLeftToConfirm() == 1)
    }

    @Test("a missing pickedAt still yields a full window, mirroring the web's Date.now() fallback")
    func missingPickedAt() {
        let row = MyEventRow(eventId: "lounge", state: .picked, pickedAt: nil)
        #expect(row.hoursLeftToConfirm() == 24)
    }

    @Test("non-picked rows have no countdown and fall back to the enum's own copy")
    func notPicked() {
        let row = MyEventRow(eventId: "pool", state: .confirmed, code: "LST-4F")
        #expect(row.hoursLeftToConfirm() == nil)
        #expect(row.statusLabel() == ApplicationState.confirmed.memberLabel)
    }
}
