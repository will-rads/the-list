import SwiftUI

// Web `ScreenOnboard` — the by-invitation entry flow: intro splash → apply form
// (also the "I have an invite" path) → reviewing animation → tier reveal, with an
// error branch when the handle can't be read. Copy/states transcribed verbatim.
// Drives the shared step through `MemberRouter.onboarding`; local `phone`/`handle`
// persist across steps because this one view stays mounted for the whole flow.
struct OnboardingView: View {
    @Environment(MemberRouter.self) private var router
    @Environment(AppState.self) private var appState

    @State private var phone = ""
    @State private var handle = ""

    private var canSubmit: Bool { phone.count >= 6 && handle.count >= 2 }
    private var handleDisplay: String { handle.isEmpty ? "your-handle" : handle }

    var body: some View {
        content
            .ignoresSafeArea()
            .animation(.easeInOut(duration: 0.3), value: router.onboarding)
            .task(id: router.onboarding) { await runReviewingIfNeeded() }
    }

    @ViewBuilder
    private var content: some View {
        // `nil` never renders here (MemberRootView only mounts this while
        // onboarding != nil); default to the tier reveal for exhaustiveness.
        switch router.onboarding ?? .tierReveal {
        case .intro:      introStep
        case .phone:      phoneStep
        case .reviewing:  reviewingStep
        case .error:      errorStep
        case .tierReveal: tierRevealStep
        }
    }

    // MARK: Intro splash

    private var introStep: some View {
        ZStack {
            IntroBackground()
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
                    Text("By invitation only")
                        .font(Typography.body(13, weight: .regular))
                        .foregroundStyle(MemberPalette.onPhoto.opacity(0.82))
                        .padding(.top, 18)
                }
                Spacer()

                VStack(spacing: Theme.Space.m) {
                    TakeoverButton(title: "Apply for access", trailingArrow: true) {
                        router.onboarding = .phone
                    }
                    TakeoverButton(title: "I have an invite", filled: false) {
                        router.onboarding = .phone
                    }

                    HStack(spacing: Theme.Space.m) {
                        Rectangle().fill(MemberPalette.onPhoto.opacity(0.16)).frame(height: 1)
                        Text("or")
                            .font(Typography.body(11, weight: .medium))
                            .foregroundStyle(MemberPalette.onPhoto.opacity(0.6))
                        Rectangle().fill(MemberPalette.onPhoto.opacity(0.16)).frame(height: 1)
                    }
                    .padding(.top, Theme.Space.xs)

                    TakeoverButton(title: "List your venue · Business", filled: false, height: 52) {
                        router.openVenueSide(appState)
                    }
                }
            }
            .padding(.horizontal, 28)
            .padding(.top, 120)
            .padding(.bottom, 40)
        }
    }

    // MARK: Apply form

    private var phoneStep: some View {
        ZStack {
            Theme.bg.ignoresSafeArea()
            VStack(alignment: .leading, spacing: 0) {
                Text("The List · No. 048")
                    .font(Typography.body(13, weight: .bold))
                    .foregroundStyle(Theme.ink)
                StepIndicator(current: 1)
                    .padding(.top, Theme.Space.l)
                Text("Apply")
                    .font(Typography.display(44))
                    .tracking(44 * Typography.displayTracking)
                    .foregroundStyle(Theme.ink)
                    .padding(.top, Theme.Space.m)
                Text("By invitation only. We review every profile manually. Approval typically takes 24 hours.")
                    .font(Typography.body(13, weight: .regular))
                    .foregroundStyle(Theme.ink2)
                    .frame(maxWidth: 280, alignment: .leading)
                    .padding(.top, Theme.Space.m)

                VStack(alignment: .leading, spacing: Theme.Space.xl) {
                    FieldLabelled(label: "Phone") {
                        OnboardingField(text: $phone, placeholder: "+961 71 000 000")
                    }
                    FieldLabelled(label: "Instagram handle") {
                        HandleField(handle: $handle, placeholder: "capriottisara")
                    }
                }
                .padding(.top, 40)

                Spacer(minLength: Theme.Space.xl)

                Button(action: submit) {
                    HStack(spacing: Theme.Space.s) {
                        Text("Apply for access")
                            .font(Typography.body(15, weight: .semibold))
                        AppIcon.arrowRight.symbol.font(.system(size: 16, weight: .semibold))
                    }
                    .frame(maxWidth: .infinity)
                    .frame(height: 58)
                    .foregroundStyle(canSubmit ? Theme.iceInk : Theme.inkMute)
                    .background(Capsule().fill(canSubmit ? Theme.ice : Theme.elev2))
                }
                .buttonStyle(PressButtonStyle())
                .disabled(!canSubmit)

                Text("No password. We verify through your Instagram.")
                    .font(Typography.body(11, weight: .regular))
                    .foregroundStyle(Theme.inkMute)
                    .frame(maxWidth: .infinity)
                    .padding(.top, Theme.Space.m)
            }
            .padding(.horizontal, 28)
            .padding(.top, 110)
            .padding(.bottom, 40)
        }
    }

    // MARK: Reviewing

    private var reviewingStep: some View {
        TakeoverGround {
            VStack {
                StepIndicator(current: 2, dark: true).padding(.top, 110)
                Spacer()
                ZStack {
                    Circle()
                        .strokeBorder(MemberPalette.onPhoto.opacity(0.2), lineWidth: 2)
                        .frame(width: 160, height: 160)
                    SpinnerArc()
                        .frame(width: 120, height: 120)
                }
                Text("Reading")
                    .font(Typography.display(28))
                    .tracking(28 * Typography.displayTracking)
                    .foregroundStyle(MemberPalette.onPhoto)
                    .padding(.top, 40)
                Text("Pulling @\(handleDisplay)'s reach, demographics, and engagement.")
                    .font(Typography.body(13, weight: .regular))
                    .foregroundStyle(MemberPalette.onPhoto)
                    .multilineTextAlignment(.center)
                    .frame(maxWidth: 260)
                    .padding(.top, Theme.Space.m)
                Spacer()
                Spacer()
            }
            .frame(maxWidth: .infinity)
            .padding(.horizontal, 28)
        }
    }

    // MARK: Error

    private var errorStep: some View {
        TakeoverGround {
            VStack(alignment: .leading, spacing: 0) {
                Text("The List · No. 048")
                    .font(Typography.body(13, weight: .bold))
                    .foregroundStyle(MemberPalette.onPhoto.opacity(0.7))
                    .shadow(color: .black.opacity(0.5), radius: 8, y: 1)
                Spacer()
                VStack(spacing: 0) {
                    Circle()
                        .strokeBorder(MemberPalette.onPhoto.opacity(0.25), lineWidth: 2)
                        .frame(width: 120, height: 120)
                        .overlay {
                            AppIcon.close.symbol
                                .font(.system(size: 40, weight: .light))
                                .foregroundStyle(MemberPalette.onPhoto.opacity(0.85))
                        }
                    Text("Couldn't\nread that")
                        .font(Typography.display(30))
                        .tracking(30 * Typography.displayTracking)
                        .multilineTextAlignment(.center)
                        .foregroundStyle(MemberPalette.onPhoto)
                        .padding(.top, 40)
                    Text("We couldn't pull @\(handleDisplay) from Instagram. Check the spelling, or try another handle.")
                        .font(Typography.body(13, weight: .regular))
                        .foregroundStyle(MemberPalette.onPhoto.opacity(0.75))
                        .multilineTextAlignment(.center)
                        .frame(maxWidth: 280)
                        .padding(.top, Theme.Space.m)
                }
                .frame(maxWidth: .infinity)
                Spacer()
                TakeoverButton(title: "Try another handle") {
                    router.onboarding = .phone
                }
            }
            .padding(.horizontal, 28)
            .padding(.top, 110)
            .padding(.bottom, 40)
        }
    }

    // MARK: Tier reveal

    private var tierRevealStep: some View {
        TakeoverGround {
            VStack(alignment: .leading, spacing: 0) {
                Text("The List · invitation")
                    .font(Typography.body(13, weight: .bold))
                    .foregroundStyle(MemberPalette.onPhoto.opacity(0.7))
                    .shadow(color: .black.opacity(0.5), radius: 8, y: 1)
                StepIndicator(current: 3, dark: true).padding(.top, Theme.Space.l)

                Spacer()
                VStack(spacing: 0) {
                    Circle()
                        .strokeBorder(MemberPalette.onPhoto, lineWidth: 2)
                        .frame(width: 180, height: 180)
                        .overlay {
                            Text("Tier\nOne")
                                .font(Typography.body(36, weight: .bold))
                                .tracking(36 * Typography.displayTracking)
                                .multilineTextAlignment(.center)
                                .foregroundStyle(MemberPalette.onPhoto)
                        }
                    Text("Listed")
                        .font(Typography.display(34))
                        .tracking(34 * Typography.displayTracking)
                        .foregroundStyle(MemberPalette.onPhoto)
                        .padding(.top, 40)
                    Text("Your audience fits the rooms. Tier reviews happen quarterly.")
                        .font(Typography.body(13, weight: .regular))
                        .foregroundStyle(MemberPalette.onPhoto.opacity(0.8))
                        .multilineTextAlignment(.center)
                        .frame(maxWidth: 280)
                        .padding(.top, Theme.Space.m)
                }
                .frame(maxWidth: .infinity)
                Spacer()

                TakeoverButton(title: "Enter The List", trailingArrow: true) {
                    router.completeOnboarding()
                }
            }
            .padding(.horizontal, 28)
            .padding(.top, 110)
            .padding(.bottom, 40)
        }
    }

    // MARK: Actions

    private func submit() {
        guard canSubmit else { return }
        router.onboarding = .reviewing
    }

    // Web `mockCreatorDataFetch` — a 2.4s "network" pause, then reject for the
    // demo failure handles ("fail"/"notfound"/"error"), else success → tier reveal.
    private func runReviewingIfNeeded() async {
        guard router.onboarding == .reviewing else { return }
        try? await Task.sleep(for: .seconds(2.4))
        guard !Task.isCancelled, router.onboarding == .reviewing else { return }
        let normalized = handle.replacingOccurrences(of: "@", with: "").lowercased()
        if ["fail", "notfound", "error"].contains(normalized) {
            router.onboarding = .error
        } else {
            router.onboarding = .tierReveal
        }
    }
}

// MARK: - Takeover building blocks (cream-on-black, both themes)

/// The opaque black takeover ground shared by Reviewing / Error / Tier reveal.
private struct TakeoverGround<Content: View>: View {
    @ViewBuilder var content: Content
    var body: some View {
        ZStack {
            MemberPalette.takeover.ignoresSafeArea()
            content
        }
    }
}

/// A takeover-screen pill button — cream fill (primary) or cream outline (ghost),
/// forced to the on-photo palette so it reads over the black ground in both themes.
private struct TakeoverButton: View {
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

/// A stamp label above a field (web `.stamp`).
private struct FieldLabelled<Content: View>: View {
    let label: String
    @ViewBuilder var content: Content
    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Space.s) {
            Text(label)
                .font(Typography.body(10, weight: .medium))
                .foregroundStyle(Theme.inkMute)
            content
        }
    }
}

private struct OnboardingField: View {
    @Binding var text: String
    let placeholder: String
    var body: some View {
        TextField("", text: $text, prompt: Text(placeholder).foregroundStyle(Theme.inkMute))
            .font(Typography.body(15, weight: .regular))
            .foregroundStyle(Theme.ink)
            .padding(.horizontal, Theme.Space.m)
            .frame(height: 48)
            .background(RoundedRectangle(cornerRadius: 12, style: .continuous).fill(Theme.elev))
            .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).strokeBorder(Theme.line2, lineWidth: 1))
    }
}

private struct HandleField: View {
    @Binding var handle: String
    let placeholder: String
    var body: some View {
        HStack(spacing: 0) {
            Text("@")
                .font(Typography.body(15, weight: .regular))
                .foregroundStyle(Theme.inkMute)
                .padding(.horizontal, Theme.Space.m)
            TextField("", text: $handle, prompt: Text(placeholder).foregroundStyle(Theme.inkMute))
                .font(Typography.body(15, weight: .regular))
                .foregroundStyle(Theme.ink)
                .padding(.trailing, Theme.Space.m)
        }
        .frame(height: 48)
        .background(RoundedRectangle(cornerRadius: 12, style: .continuous).fill(Theme.elev))
        .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).strokeBorder(Theme.line2, lineWidth: 1))
    }
}

/// A continuously spinning ring arc — the reviewing animation (web `.spin`).
private struct SpinnerArc: View {
    @State private var spinning = false
    var body: some View {
        Circle()
            .trim(from: 0, to: 0.75)
            .stroke(MemberPalette.onPhoto, style: StrokeStyle(lineWidth: 2, lineCap: .round))
            .rotationEffect(.degrees(spinning ? 360 : 0))
            .animation(.linear(duration: 0.9).repeatForever(autoreverses: false), value: spinning)
            .onAppear { spinning = true }
    }
}

#Preview("Dark") {
    OnboardingView()
        .environment(MemberRouter())
        .environment(AppState())
        .preferredColorScheme(.dark)
}
