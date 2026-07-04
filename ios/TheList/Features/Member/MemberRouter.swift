import SwiftUI
import Observation

// MARK: - Navigation vocabulary

/// The four member tabs (web `TabBar`: Home / Explore / Invites / Profile).
enum MemberTab: Hashable { case home, explore, invites, profile }

/// Full-screen layers that paint OVER the tab shell + dock. Mutually exclusive
/// (the web only ever shows one at a time), so one enum rather than three
/// booleans. Each carries the event id it renders. Overlay roots MUST call
/// `.appGround()` (web bug 2026-07-04: a transparent overlay root bleeds the
/// still-mounted tab beneath).
enum MemberOverlay: Equatable {
    case eventDetail(String)
    case pass(String)
    case picked(String)
}

/// Bottom sheets (web `.sheet` overlays). Identifiable for `.sheet(item:)`.
enum MemberSheet: Identifiable, Equatable {
    case notifications
    case settings
    case story(String)
    case share(String)

    var id: String {
        switch self {
        case .notifications: return "notifications"
        case .settings:      return "settings"
        case .story(let e):  return "story-\(e)"
        case .share(let e):  return "share-\(e)"
        }
    }
}

/// My Events segments (web `Segmented`).
enum MyEventsSegment: String, Hashable { case applied, confirmed, saved, past }

/// Onboarding step (web `ScreenOnboard` `step`). `nil` router value = onboarding
/// done, tabs are live.
enum OnboardingStep: Hashable { case intro, phone, reviewing, tierReveal, error }

/// A toast request. `id` lets the same message re-trigger the auto-dismiss.
struct MemberToast: Identifiable, Equatable {
    let id = UUID()
    let text: String
}

// MARK: - Router

/// Owns member navigation plus the UI-only overlays the frozen `DemoWorld` has no
/// field for: the saved/bookmarked set, which notifications the member has locally
/// read (so "close marks all read" needs no mutation of the frozen layer), and the
/// Verify-with-Instagram override. All mutations to the *demo world* still route
/// through the service protocols / switchboard — this class holds only presentation
/// state.
@MainActor
@Observable
final class MemberRouter {
    // Onboarding gate — starts on the intro splash (web initial `onboardStep`).
    var onboarding: OnboardingStep? = .intro

    // Tab + layered navigation.
    var tab: MemberTab = .home
    var overlay: MemberOverlay?
    var sheet: MemberSheet?

    // Deep-link hint for which My Events segment to open on (web `mylistSeg`).
    var myEventsSegment: MyEventsSegment?

    // UI-only overlays over the frozen world.
    var saved: Set<String> = []
    var locallyReadNotifIds: Set<String> = []
    var instagramVerified = false

    // Toast bus (UI-driven toasts; service toasts bridge in via DemoWorld.toast).
    var uiToast: MemberToast?

    // MARK: Onboarding

    func completeOnboarding() { onboarding = nil }
    func openVenueSide(_ appState: AppState) { appState.role = .venue }

    // MARK: Tabs

    func selectTab(_ newTab: MemberTab) {
        tab = newTab
        overlay = nil
        // Deep-link segment hint is one-shot; a normal tab tap clears it (web goTab).
        myEventsSegment = nil
    }

    // MARK: Overlays

    func openEventDetail(_ eventId: String) { overlay = .eventDetail(eventId) }
    func openPass(_ eventId: String) { overlay = .pass(eventId) }
    func openPicked(_ eventId: String) { overlay = .picked(eventId) }
    func closeOverlay() { overlay = nil }

    // MARK: Sheets

    func present(_ newSheet: MemberSheet) { sheet = newSheet }
    func dismissSheet() { sheet = nil }

    // MARK: Saved / toast

    func toggleSave(_ eventId: String) {
        if saved.contains(eventId) {
            saved.remove(eventId)
            toast("Removed from saved")
        } else {
            saved.insert(eventId)
            toast("Saved to your list")
        }
    }

    func toast(_ text: String) { uiToast = MemberToast(text: text) }

    // MARK: Notifications read-state (UI overlay, no frozen-layer mutation)

    func isRead(_ notification: AppNotification) -> Bool {
        notification.read || locallyReadNotifIds.contains(notification.id)
    }

    func unreadCount(_ notifications: [AppNotification]) -> Int {
        notifications.filter { !isRead($0) }.count
    }

    /// Closing the Activity sheet marks everything currently shown as read.
    func markAllNotificationsRead(_ notifications: [AppNotification]) {
        locallyReadNotifIds.formUnion(notifications.map(\.id))
    }

    // MARK: Deep links (web `notifTarget`)

    func route(to target: NotifTarget) {
        switch target {
        case .eventDetail(let id):    openEventDetail(id)
        case .pickedTakeover(let id): openPicked(id)
        case .pass(let id):           openPass(id)
        case .story(let id):          present(.story(id))
        case .myEventsPast:
            selectTab(.invites)
            myEventsSegment = .past
        // Venue-only targets never arise on the member side; fall back to tabs.
        case .reviewDeck, .guestList, .recap:
            selectTab(.home)
        }
    }

    // MARK: Reset (paired with switchboard.reset())

    func resetLocal() {
        saved.removeAll()
        locallyReadNotifIds.removeAll()
        instagramVerified = false
        myEventsSegment = nil
        overlay = nil
        sheet = nil
        tab = .home
    }
}
