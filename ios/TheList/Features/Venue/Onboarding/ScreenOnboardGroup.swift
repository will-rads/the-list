import SwiftUI

// Web `ScreenOnboardGroup` — optional multi-venue grouping. Purely cosmetic:
// like the member onboarding's phone/handle, there is no frozen mutator to
// persist a venue group, so the pick lives on `VenueRouter.venueGroup` (UI-only)
// and only ever resurfaces on the Venue tab's "Group · {name}" pill.
struct ScreenOnboardGroup: View {
    @Environment(VenueRouter.self) private var router

    @State private var name = ""
    @State private var logoKey: String?
    @State private var pickingLogo = false

    private var canCreate: Bool { name.count >= 2 }

    var body: some View {
        ZStack {
            Theme.bg.ignoresSafeArea()
            VStack(alignment: .leading, spacing: 0) {
                header

                ScrollView(showsIndicators: false) {
                    VStack(alignment: .leading, spacing: Theme.Space.xl) {
                        VStack(alignment: .leading, spacing: Theme.Space.s) {
                            stamp("Group name")
                            TextField("", text: $name, prompt: Text("e.g. Skyline Hospitality").foregroundStyle(Theme.inkMute))
                                .font(Typography.body(15, weight: .regular))
                                .foregroundStyle(Theme.ink)
                                .padding(.horizontal, Theme.Space.m)
                                .frame(height: 48)
                                .background(RoundedRectangle(cornerRadius: 12, style: .continuous).fill(Theme.elev))
                                .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).strokeBorder(Theme.line2, lineWidth: 1))
                        }

                        VStack(alignment: .leading, spacing: Theme.Space.s) {
                            stamp("Group logo")
                            logoField
                        }
                    }
                    .padding(.top, Theme.Space.l)
                    .padding(.bottom, Theme.Space.l)
                }

                VStack(spacing: Theme.Space.m) {
                    Button {
                        guard canCreate else { return }
                        router.completeGroup(VenueGroupDraft(name: name, logoImageName: logoKey))
                    } label: {
                        Text("Create group")
                            .font(Typography.body(14, weight: .semibold))
                            .foregroundStyle(canCreate ? Theme.iceInk : Theme.inkMute)
                            .frame(maxWidth: .infinity)
                            .frame(height: 52)
                            .background(Capsule().fill(canCreate ? Theme.ice : Theme.elev2))
                    }
                    .buttonStyle(PressButtonStyle())
                    .disabled(!canCreate)

                    Button {
                        router.completeGroup(nil)
                    } label: {
                        Text("I'm independent · skip")
                            .font(Typography.body(12, weight: .medium))
                            .foregroundStyle(Theme.ink)
                            .frame(maxWidth: .infinity)
                            .frame(height: 48)
                            .overlay(Capsule().strokeBorder(Theme.line2, lineWidth: 1))
                    }
                    .buttonStyle(PressButtonStyle())
                }
                .padding(.bottom, 40)
            }
            .padding(.horizontal, Theme.Space.xl)
            .padding(.top, 60)
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: Theme.Space.m) {
            Text("Group")
                .font(Typography.display(44))
                .tracking(44 * Typography.displayTracking)
                .foregroundStyle(Theme.ink)
            Text("Run more than one venue? Group them. Otherwise skip.")
                .font(Typography.body(13, weight: .regular))
                .foregroundStyle(Theme.ink2)
        }
    }

    @ViewBuilder
    private var logoField: some View {
        if pickingLogo {
            PresetImagePicker(selectedKey: logoKey) { key in
                logoKey = key
                pickingLogo = false
            }
        } else if let logoKey {
            HStack(spacing: Theme.Space.m) {
                VenuePhoto(key: logoKey)
                    .frame(width: 80, height: 80)
                    .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                Button { pickingLogo = true } label: {
                    Text("Replace")
                        .font(Typography.body(12, weight: .medium))
                        .foregroundStyle(Theme.ice)
                }
                .buttonStyle(.plain)
            }
        } else {
            Button { pickingLogo = true } label: {
                Text("+ Logo")
                    .font(Typography.body(10, weight: .medium))
                    .foregroundStyle(Theme.inkMute)
                    .frame(width: 80, height: 80)
                    .overlay(
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .strokeBorder(style: StrokeStyle(lineWidth: 1, dash: [4, 4]))
                            .foregroundStyle(Theme.line2)
                    )
            }
            .buttonStyle(PressButtonStyle())
        }
    }

    private func stamp(_ text: String) -> some View {
        Text(text)
            .font(Typography.body(10, weight: .medium))
            .foregroundStyle(Theme.inkMute)
    }
}

#Preview("Dark") {
    ScreenOnboardGroup()
        .appGround()
        .environment(VenueRouter())
        .preferredColorScheme(.dark)
}
