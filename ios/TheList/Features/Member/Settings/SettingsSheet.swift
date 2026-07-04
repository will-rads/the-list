import SwiftUI

// Web `SettingsSheet` — profile fields, notification toggles, the theme toggle, a
// privacy note, account actions, and the hidden Demo switchboard at the bottom
// (drives the shared DemoWorld directly: pick now / expire a pick / check me in /
// story verdict ×3 / reset).
struct SettingsSheet: View {
    @Environment(DemoWorld.self) private var world
    @Environment(MemberRouter.self) private var router
    @Environment(AppState.self) private var appState

    @State private var name: String = ""
    @State private var handle: String = ""
    @State private var phone: String = "+961 71 000 000"
    @State private var notifyPicks = true
    @State private var notifyDrops = true

    private var verified: Bool { world.memberProfile.isVerified || router.instagramVerified }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: Theme.Space.l) {
                SheetHeader(title: "Settings") { router.dismissSheet() }

                stamp("Display name")
                SettingsField(text: $name)

                stamp("Instagram handle")
                HStack(spacing: 0) {
                    Text("@").font(Typography.body(15, weight: .regular)).foregroundStyle(Theme.inkMute)
                        .padding(.horizontal, Theme.Space.m)
                    TextField("", text: $handle)
                        .font(Typography.body(15, weight: .regular)).foregroundStyle(Theme.ink)
                    if verified {
                        StatusPill(label: "Verified", tone: .ice).padding(.trailing, Theme.Space.s)
                    }
                }
                .frame(height: 48)
                .background(RoundedRectangle(cornerRadius: 12, style: .continuous).fill(Theme.elev))
                .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).strokeBorder(Theme.line2, lineWidth: 1))

                stamp("Phone")
                SettingsField(text: $phone)

                stamp("Notifications")
                VStack(spacing: 0) {
                    settingsToggle("When a venue picks you", "The moment that matters", isOn: $notifyPicks)
                    HairlineDivider(color: Theme.line)
                    settingsToggle("New drops in Beirut", "Tonight's rooms as they open", isOn: $notifyDrops)
                }
                .padding(.horizontal, Theme.Space.l)
                .cardGlass(radius: Theme.Radius.control)

                stamp("Appearance")
                HStack {
                    Text("Light theme").font(Typography.body(14, weight: .regular)).foregroundStyle(Theme.ink)
                    Spacer()
                    Toggle("", isOn: Binding(
                        get: { appState.theme == .light },
                        set: { appState.theme = $0 ? .light : .dark }
                    ))
                    .labelsHidden().tint(Theme.ice)
                }
                .padding(.horizontal, Theme.Space.l).frame(height: 52)
                .cardGlass(radius: Theme.Radius.control)

                Text("Your reach and audience data are read from Instagram through a licensed provider. The List never sees your password and never posts on your behalf.")
                    .font(Typography.body(11, weight: .regular)).foregroundStyle(Theme.inkMute)
                    .padding(Theme.Space.m)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(RoundedRectangle(cornerRadius: 12, style: .continuous).fill(Theme.elev))
                    .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).strokeBorder(Theme.line, lineWidth: 1))

                Button { router.toast("Settings saved"); router.dismissSheet() } label: {
                    Text("Save changes").font(Typography.body(13, weight: .semibold))
                        .foregroundStyle(Theme.iceInk)
                        .frame(maxWidth: .infinity).frame(height: 48)
                        .background(Capsule().fill(Theme.ice))
                }
                .buttonStyle(PressButtonStyle())

                HStack(spacing: Theme.Space.s) {
                    ghost("Log out", muted: false) { router.toast("Logged out (prototype)") }
                    ghost("Delete account", muted: true) { router.toast("Account deletion requested (prototype)") }
                }

                DemoPanel()
            }
            .padding(.horizontal, Theme.Space.xl)
            .padding(.top, Theme.Space.l)
            .padding(.bottom, Theme.Space.xxl)
        }
        .onAppear { seedFields() }
    }

    private func seedFields() {
        if name.isEmpty { name = world.memberProfile.fullName }
        if handle.isEmpty { handle = world.memberProfile.handle }
    }

    private func stamp(_ text: String) -> some View {
        Text(text).font(Typography.body(10, weight: .medium)).foregroundStyle(Theme.inkMute)
    }

    private func settingsToggle(_ title: String, _ sub: String, isOn: Binding<Bool>) -> some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(title).font(Typography.body(14, weight: .regular)).foregroundStyle(Theme.ink)
                Text(sub).font(Typography.body(11, weight: .regular)).foregroundStyle(Theme.inkMute)
            }
            Spacer(minLength: Theme.Space.m)
            Toggle("", isOn: isOn).labelsHidden().tint(Theme.ice)
        }
        .padding(.vertical, 14)
    }

    private func ghost(_ title: String, muted: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(title)
                .font(Typography.body(12, weight: .regular))
                .foregroundStyle(muted ? Theme.inkMute : Theme.ink)
                .frame(maxWidth: .infinity).frame(height: 44)
                .overlay(Capsule().strokeBorder(Theme.line2, lineWidth: 1))
        }
        .buttonStyle(PressButtonStyle())
    }
}

// MARK: - Demo switchboard (hidden rig)

private struct DemoPanel: View {
    @Environment(MemberServices.self) private var services
    @Environment(MemberRouter.self) private var router
    @State private var open = false

    var body: some View {
        VStack(spacing: 0) {
            Button { withAnimation(.easeInOut(duration: 0.2)) { open.toggle() } } label: {
                HStack {
                    Text("Demo").font(Typography.body(11, weight: .regular)).foregroundStyle(Theme.inkMute)
                    Spacer()
                    AppIcon.chevronRight.symbol
                        .font(.system(size: 12, weight: .medium)).foregroundStyle(Theme.inkMute)
                        .rotationEffect(.degrees(open ? 90 : 0))
                }
                .padding(.vertical, Theme.Space.s)
            }
            .buttonStyle(PressButtonStyle())

            if open {
                VStack(spacing: 0) {
                    demoRow("Venue picks you now") { services.switchboard.pickNow() }
                    demoRow("Expire a pick") { services.switchboard.expirePick() }
                    demoRow("Check me in") { services.switchboard.checkMeIn() }

                    VStack(alignment: .leading, spacing: Theme.Space.s) {
                        Text("Story verdict")
                            .font(Typography.body(12, weight: .regular)).foregroundStyle(Theme.ink2)
                        HStack(spacing: Theme.Space.s) {
                            verdictButton("Verified", .verified)
                            verdictButton("Needs review", .needsReview)
                            verdictButton("Rejected", .rejected)
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.vertical, 10)
                    .overlay(alignment: .top) { HairlineDivider(color: Theme.line) }

                    demoRow("Reset demo") {
                        services.switchboard.reset()
                        router.resetLocal()
                        router.dismissSheet()
                    }
                }
            }
        }
        .padding(.top, Theme.Space.m)
    }

    private func demoRow(_ label: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(label)
                .font(Typography.body(12, weight: .regular)).foregroundStyle(Theme.ink2)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.vertical, 10)
                .overlay(alignment: .top) { HairlineDivider(color: Theme.line) }
        }
        .buttonStyle(PressButtonStyle())
    }

    private func verdictButton(_ label: String, _ status: StoryStatus) -> some View {
        Button { services.switchboard.forceVerdict(status) } label: {
            Text(label)
                .font(Typography.body(11, weight: .regular)).foregroundStyle(Theme.ink)
                .padding(.horizontal, Theme.Space.m).frame(height: 32)
                .overlay(Capsule().strokeBorder(Theme.line2, lineWidth: 1))
        }
        .buttonStyle(PressButtonStyle())
    }
}

private struct SettingsField: View {
    @Binding var text: String
    var body: some View {
        TextField("", text: $text)
            .font(Typography.body(15, weight: .regular)).foregroundStyle(Theme.ink)
            .padding(.horizontal, Theme.Space.m).frame(height: 48)
            .background(RoundedRectangle(cornerRadius: 12, style: .continuous).fill(Theme.elev))
            .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).strokeBorder(Theme.line2, lineWidth: 1))
    }
}

#Preview("Dark") {
    let world = DemoWorld()
    Color.clear
        .sheet(isPresented: .constant(true)) {
            SettingsSheet().memberSheetChrome()
        }
        .environment(world)
        .environment(MemberServices(world: world))
        .environment(MemberRouter())
        .environment(AppState())
        .preferredColorScheme(.dark)
}
