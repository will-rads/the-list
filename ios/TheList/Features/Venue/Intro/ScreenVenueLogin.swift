import SwiftUI

// Web `ScreenVenueLogin` — a mocked login form (any email/password ≥ 3 chars
// enables Sign in). No password recovery, no real auth — this wave is
// mock-first throughout.
struct ScreenVenueLogin: View {
    @Environment(VenueRouter.self) private var router

    @State private var email = ""
    @State private var password = ""

    private var canSubmit: Bool { email.count >= 3 && password.count >= 3 }

    var body: some View {
        ZStack {
            Theme.bg.ignoresSafeArea()
            VStack(alignment: .leading, spacing: 0) {
                Text("Sign in")
                    .font(Typography.display(44))
                    .tracking(44 * Typography.displayTracking)
                    .foregroundStyle(Theme.ink)
                Text("Manage your venue and its drops.")
                    .font(Typography.body(13, weight: .regular))
                    .foregroundStyle(Theme.ink2)
                    .padding(.top, Theme.Space.m)

                VStack(alignment: .leading, spacing: Theme.Space.xl) {
                    LoginField(label: "Work email", text: $email, placeholder: "you@yourvenue.com")
                    LoginField(label: "Password", text: $password, placeholder: "••••••••", secure: true)
                }
                .padding(.top, 40)

                Spacer(minLength: Theme.Space.xl)

                Button(action: submit) {
                    HStack(spacing: Theme.Space.s) {
                        Text("Sign in").font(Typography.body(14, weight: .semibold))
                        AppIcon.arrowRight.symbol.font(.system(size: 16, weight: .semibold))
                    }
                    .frame(maxWidth: .infinity)
                    .frame(height: 58)
                    .foregroundStyle(canSubmit ? Theme.iceInk : Theme.inkMute)
                    .background(Capsule().fill(canSubmit ? Theme.ice : Theme.elev2))
                }
                .buttonStyle(PressButtonStyle())
                .disabled(!canSubmit)

                Text("New venue? Signing in sets you up.")
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

    private func submit() {
        guard canSubmit else { return }
        router.completeLogin()
    }
}

private struct LoginField: View {
    let label: String
    @Binding var text: String
    let placeholder: String
    var secure: Bool = false

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Space.s) {
            Text(label)
                .font(Typography.body(10, weight: .medium))
                .foregroundStyle(Theme.inkMute)
            Group {
                if secure {
                    SecureField("", text: $text, prompt: Text(placeholder).foregroundStyle(Theme.inkMute))
                } else {
                    TextField("", text: $text, prompt: Text(placeholder).foregroundStyle(Theme.inkMute))
                        .keyboardType(.emailAddress)
                        .textInputAutocapitalization(.never)
                }
            }
            .font(Typography.body(15, weight: .regular))
            .foregroundStyle(Theme.ink)
            .padding(.horizontal, Theme.Space.m)
            .frame(height: 48)
            .background(RoundedRectangle(cornerRadius: 12, style: .continuous).fill(Theme.elev))
            .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).strokeBorder(Theme.line2, lineWidth: 1))
        }
    }
}

#Preview("Dark") {
    ScreenVenueLogin()
        .appGround()
        .environment(VenueRouter())
        .preferredColorScheme(.dark)
}
