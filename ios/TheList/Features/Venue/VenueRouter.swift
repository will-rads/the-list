import SwiftUI
import Observation

// MARK: - Navigation vocabulary

/// Pre-tab-shell gate: splash → mocked login → optional group → venue setup.
/// `nil` = onboarding done, the tab shell is live (web `step` values
/// `intro | login | onboard-group | onboard-venue | done`). The "Preview the
/// desk" demo path jumps straight from `.intro` to `nil` — `DemoWorld.venueProfile`
/// is already seeded to Cyan Beach Club, so there is nothing else to set up.
enum VenueOnboardingStep: Hashable {
    case intro
    case login
    case group
    case venueSetup
}

/// Full-screen layers that paint OVER the tab shell + dock (web `step` values
/// `post | review-deck | recap`). Overlay roots MUST call `.appGround()` (the
/// stacked-screen bleed bug, errors.md).
enum VenueOverlay: Equatable {
    case postWizard(editingEventId: String?)
    case reviewDeck(eventId: String)
    case recap(eventId: String)
}

/// A generic confirm ask (web `askConfirm`/`ConfirmDialog`) — reused across
/// Cancel event / Close applications / Close the night. Carries its own action
/// so call sites don't have to round-trip through the router for the result.
struct ConfirmSpec: Identifiable {
    let id = UUID()
    let title: String
    let body: String
    let confirmLabel: String
    let onConfirm: () -> Void
}

/// Bottom sheets (web `.sheet`-style overlays reached from more than one
/// screen). Identifiable for `.sheet(item:)`.
enum VenueSheet: Identifiable {
    case notifications
    case guestList(String)
    case confirm(ConfirmSpec)

    var id: String {
        switch self {
        case .notifications:       return "notifications"
        case .guestList(let id):   return "guestList-\(id)"
        case .confirm(let spec):   return "confirm-\(spec.id)"
        }
    }
}

/// A toast request (mirrors `MemberToast`).
struct VenueToast: Identifiable, Equatable {
    let id = UUID()
    let text: String

    static func == (lhs: VenueToast, rhs: VenueToast) -> Bool { lhs.id == rhs.id }
}

/// The venue onboarding's "group" pick — UI-only, never persisted to the
/// frozen `VenueProfile` (there is no mutator for it; see the wave return
/// note). Mirrors the web `group` state's one consumer, the Venue tab's
/// "Group · {name}" pill.
struct VenueGroupDraft: Identifiable, Equatable {
    let id = UUID()
    var name: String
    var logoImageName: String?
}

// MARK: - Router

/// Owns venue navigation: the onboarding gate, the four-tab shell, full-screen
/// overlays, sheets, and the UI-only overlays the frozen `DemoWorld` has no
/// field for (which group was picked at onboarding). All mutations to the demo
/// world route through `VenueService` — this class holds only presentation
/// state, same split as `MemberRouter`.
@MainActor
@Observable
final class VenueRouter {
    // Onboarding gate — starts on the intro splash.
    var onboarding: VenueOnboardingStep? = .intro

    // Tab + layered navigation.
    var tab: VenueTab = .desk
    var overlay: VenueOverlay?
    var sheet: VenueSheet?

    // UI-only onboarding result (see `VenueGroupDraft` doc comment).
    var venueGroup: VenueGroupDraft?

    // Toast bus (mirrors `world.toast` service pushes via VenueRootView).
    var uiToast: VenueToast?

    // MARK: Onboarding

    func enterLogin() { onboarding = .login }
    func completeLogin() { onboarding = .group }

    /// "Preview the desk · demo data" — skips login/onboarding entirely.
    func enterDemo() {
        venueGroup = nil
        onboarding = nil
    }

    func completeGroup(_ group: VenueGroupDraft?) {
        venueGroup = group
        onboarding = .venueSetup
    }

    func completeOnboarding() { onboarding = nil }

    func switchToMember(_ appState: AppState) { appState.role = .member }
    func logOut(_ appState: AppState) {
        onboarding = .intro
        appState.role = nil
    }

    // MARK: Tabs

    func selectTab(_ newTab: VenueTab) {
        tab = newTab
        overlay = nil
    }

    // MARK: Overlays

    func openPostWizard(editing eventId: String? = nil) { overlay = .postWizard(editingEventId: eventId) }
    func openReviewDeck(_ eventId: String) { overlay = .reviewDeck(eventId: eventId) }
    func openRecap(_ eventId: String) { overlay = .recap(eventId: eventId) }
    func closeOverlay() { overlay = nil }

    // MARK: Sheets

    func present(_ newSheet: VenueSheet) { sheet = newSheet }
    func dismissSheet() { sheet = nil }

    func confirm(title: String, body: String, confirmLabel: String, onConfirm: @escaping () -> Void) {
        sheet = .confirm(ConfirmSpec(title: title, body: body, confirmLabel: confirmLabel, onConfirm: onConfirm))
    }

    // MARK: Toast

    func toast(_ text: String) { uiToast = VenueToast(text: text) }

    // MARK: Reset (paired with switchboard.reset()) — web venue `reset()`
    // stays on the tab shell (does not return to onboarding).

    func resetLocal() {
        tab = .desk
        overlay = nil
        sheet = nil
    }
}
