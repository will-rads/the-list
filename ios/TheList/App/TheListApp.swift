import SwiftUI

// @main entry. Holds the single AppState in @State (an @Observable reference type
// survives view refreshes here) and injects it into the environment so any view
// reads it with @Environment(AppState.self). The theme is applied once at the
// root (RootView) so every screen inherits it.
@main
struct TheListApp: App {

    @State private var appState = AppState()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(appState)
        }
    }
}
