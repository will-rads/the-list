import SwiftUI
import Observation

// The only app-wide state W0 owns: which side of the product is showing (member
// vs venue) and the in-app theme. Deliberately NO contract types (EventItem,
// ApplicationState, DemoWorld …) — those belong to feature state in W2/W3. Dark
// is the in-app default (web ruling 2026-07-04); the chooser is shown until a
// role is picked.
@Observable
final class AppState {

    enum Role { case member, venue }

    // nil = role chooser is on screen; set to enter a side.
    var role: Role?

    // In-app theme; drives .preferredColorScheme at the root. Dark by default.
    var theme: ColorScheme = .dark

    func toggleTheme() {
        theme = (theme == .dark) ? .light : .dark
    }
}
