import SwiftUI

// Web `ScreenVenueIntro` — the business splash: a static dark ground (no
// montage — the web source explicitly notes "no video assets needed", unlike
// the member intro's cross-dissolving stills), the wordmark, and three exits:
// "List your venue" / "Business login" (both → the mocked login), "I'm a
// member" (back to the role chooser), and the zero-typing "Preview the desk"
// demo path that skips straight to the tab shell.
struct ScreenVenueIntro: View {
    @Environment(VenueRouter.self) private var router
    @Environment(AppState.self) private var appState

    var body: some View {
        ZStack {
            background

            VStack(spacing: 0) {
                Spacer()
                VStack(spacing: 0) {
                    Text("Est. MMXXVI · Beirut")
                        .font(Typography.body(11, weight: .medium))
                        .foregroundStyle(MemberPalette.onPhoto.opacity(0.78))
                    Text("The\nList")
                        .font(Typography.display(66))
                        .tracking(66 * Typography.displayTracking)
                        .multilineTextAlignment(.center)
                        .lineSpacing(-6)
                        .foregroundStyle(MemberPalette.onPhoto)
                        .padding(.top, 14)
                        .shadow(color: .black.opacity(0.6), radius: 20, y: 2)
                    Text("For the rooms that matter")
                        .font(Typography.body(12, weight: .regular))
                        .foregroundStyle(MemberPalette.onPhoto.opacity(0.82))
                        .padding(.top, 18)
                }
                Spacer()

                VStack(spacing: Theme.Space.m) {
                    IntroButton(title: "List your venue", trailingArrow: true) {
                        router.enterLogin()
                    }
                    IntroButton(title: "Business login", filled: false) {
                        router.enterLogin()
                    }

                    VStack(spacing: Theme.Space.s) {
                        Button { router.switchToMember(appState) } label: {
                            Text("I'm a member")
                                .font(Typography.body(12, weight: .regular))
                                .foregroundStyle(MemberPalette.onPhoto.opacity(0.5))
                        }
                        .buttonStyle(.plain)

                        Button { router.enterDemo() } label: {
                            Text("Preview the desk · demo data")
                                .font(Typography.body(12, weight: .regular))
                                .foregroundStyle(Theme.ice)
                        }
                        .buttonStyle(.plain)
                    }
                    .padding(.top, Theme.Space.xs)
                }
            }
            .padding(.horizontal, 28)
            .padding(.top, 120)
            .padding(.bottom, 40)
        }
        .ignoresSafeArea()
    }

    private var background: some View {
        ZStack {
            MemberPalette.takeover
            RadialGradient(
                colors: [.clear, .black.opacity(0.82)],
                center: .center, startRadius: 120, endRadius: 460
            )
            MemberPalette.introScrim
        }
    }
}

/// An intro-screen pill button forced to the on-photo palette (matches the
/// Member intro's `TakeoverButton`, kept venue-local since that one is
/// `private` to `OnboardingView.swift`).
struct IntroButton: View {
    let title: String
    var filled: Bool = true
    var trailingArrow: Bool = false
    var height: CGFloat = 58
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: Theme.Space.s) {
                Text(title)
                    .font(Typography.body(filled ? 15 : 13, weight: filled ? .semibold : .medium))
                if trailingArrow {
                    AppIcon.arrowRight.symbol.font(.system(size: 16, weight: .semibold))
                }
            }
            .frame(maxWidth: .infinity)
            .frame(height: height)
            .foregroundStyle(filled ? MemberPalette.onCreamInk : MemberPalette.onPhoto)
            .background {
                if filled {
                    Capsule().fill(MemberPalette.onPhoto)
                } else {
                    Capsule().strokeBorder(MemberPalette.onPhoto.opacity(0.32), lineWidth: 1)
                }
            }
        }
        .buttonStyle(PressButtonStyle())
    }
}

#Preview("Dark") {
    ScreenVenueIntro()
        .environment(VenueRouter())
        .environment(AppState())
        .preferredColorScheme(.dark)
}
