import SwiftUI

// Root of the app. Before a role is chosen it shows the member/venue chooser;
// after, it shows a placeholder for that side — W2 (member) and W3 (venue) swap
// those Text placeholders for their real entry screens. The photo ground and the
// in-app theme are applied here, once, for the whole app.
struct RootView: View {
    @Environment(AppState.self) private var appState

    var body: some View {
        content
            .appGround()
            .preferredColorScheme(appState.theme)
    }

    @ViewBuilder
    private var content: some View {
        switch appState.role {
        case nil:
            RoleChooser()
        case .member?:
            // The member tab shell (W2). Owns its own DemoWorld / services / router.
            MemberRootView()
        case .venue?:
            // Replaced by the venue desk in W3.
            RolePlaceholder(text: "Venue — arriving in W3")
        }
    }
}

// MARK: - Role chooser

private struct RoleChooser: View {
    @Environment(AppState.self) private var appState

    var body: some View {
        VStack(spacing: Theme.Space.xxl) {
            Spacer(minLength: 0)

            VStack(spacing: Theme.Space.s) {
                Text("The List")
                    .displayStyle(38)
                    .foregroundStyle(Theme.ink)
                Text("Choose how you're entering tonight.")
                    .font(Typography.body(15, weight: .medium))
                    .foregroundStyle(Theme.ink2)
                    .multilineTextAlignment(.center)
            }

            VStack(spacing: Theme.Space.m) {
                RoleEntry(
                    title: "I'm a member",
                    subtitle: "Apply for tonight's rooms.",
                    icon: .user
                ) { appState.role = .member }

                RoleEntry(
                    title: "I run a venue",
                    subtitle: "Open a room and work the door.",
                    icon: .ticket
                ) { appState.role = .venue }
            }

            Button {
                appState.toggleTheme()
            } label: {
                Text(appState.theme == .dark ? "Switch to light" : "Switch to dark")
                    .font(Typography.body(12, weight: .medium))
                    .foregroundStyle(Theme.inkMute)
            }
            .buttonStyle(.plain)

            Spacer(minLength: 0)
        }
        .padding(Theme.Space.xl)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

private struct RoleEntry: View {
    let title: String
    let subtitle: String
    let icon: AppIcon
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: Theme.Space.l) {
                icon.symbol
                    .font(.system(size: 20, weight: .medium))
                    .foregroundStyle(Theme.ice)
                    .frame(width: 24)
                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(Typography.body(16, weight: .semibold))
                        .foregroundStyle(Theme.ink)
                    Text(subtitle)
                        .font(Typography.body(12, weight: .medium))
                        .foregroundStyle(Theme.ink2)
                }
                Spacer(minLength: 0)
                AppIcon.arrowRight.symbol
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(Theme.inkMute)
            }
            .padding(Theme.Space.l)
            .frame(maxWidth: .infinity, alignment: .leading)
            .cardGlass()
        }
        .buttonStyle(PressButtonStyle())
    }
}

// MARK: - Placeholder for a not-yet-built side

private struct RolePlaceholder: View {
    let text: String

    var body: some View {
        Text(text)
            .font(Typography.body(15, weight: .medium))
            .foregroundStyle(Theme.ink2)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

// RootView applies its own preferredColorScheme from AppState, so the previews
// drive the theme through AppState (an outer .preferredColorScheme would lose).
#Preview("Dark") { RootPreview(theme: .dark) }
#Preview("Light") { RootPreview(theme: .light) }

private struct RootPreview: View {
    let theme: ColorScheme

    private var state: AppState {
        let s = AppState()
        s.theme = theme
        return s
    }

    var body: some View {
        RootView().environment(state)
    }
}
