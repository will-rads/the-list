import SwiftUI

// Web `ScreenVenueProfile` — the venue's own identity: hero, name/type/area/
// description, the 4-photo gallery, its group state, a settings list, and the
// hidden Demo switchboard at the bottom. Always reads `DemoWorld.venueProfile`
// (Cyan Beach Club) — see the wave return note on why onboarding's entered
// fields never override it.
struct VenueProfileView: View {
    @Environment(DemoWorld.self) private var world
    @Environment(VenueRouter.self) private var router
    @Environment(AppState.self) private var appState

    private var venue: VenueProfile { world.venueProfile }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 0) {
                Text("Venue")
                    .font(Typography.display(40))
                    .tracking(40 * Typography.displayTracking)
                    .foregroundStyle(Theme.ink)
                    .padding(.horizontal, MemberLayout.hInset)
                    .padding(.top, 60)

                HairlineDivider(color: Theme.line2)
                    .padding(.horizontal, MemberLayout.hInset)
                    .padding(.top, Theme.Space.m)

                VenuePhoto(key: venue.heroImageName)
                    .aspectRatio(4.0 / 5.0, contentMode: .fill)
                    .frame(maxWidth: .infinity)
                    .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.tile, style: .continuous))
                    .padding(.horizontal, MemberLayout.hInset)
                    .padding(.top, Theme.Space.l)

                VStack(alignment: .leading, spacing: Theme.Space.xs) {
                    Text(venue.name.isEmpty ? "Unnamed venue" : venue.name)
                        .font(Typography.body(24, weight: .bold))
                        .foregroundStyle(venue.name.isEmpty ? Theme.inkMute : Theme.ink)
                    Text("\(venue.type) · \(venue.area)")
                        .font(Typography.body(13, weight: .regular))
                        .foregroundStyle(Theme.inkMute)
                    if !venue.description.isEmpty {
                        Text(venue.description)
                            .font(Typography.body(14, weight: .regular))
                            .foregroundStyle(Theme.ink2)
                            .padding(.top, Theme.Space.xs)
                    }
                }
                .padding(.horizontal, MemberLayout.hInset)
                .padding(.top, Theme.Space.l)

                VStack(alignment: .leading, spacing: Theme.Space.s) {
                    Text("Photos").font(Typography.body(10, weight: .medium)).foregroundStyle(Theme.inkMute)
                    LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: Theme.Space.s), count: 4), spacing: Theme.Space.s) {
                        ForEach(venue.galleryImageNames, id: \.self) { key in
                            VenuePhoto(key: key)
                                .aspectRatio(4.0 / 5.0, contentMode: .fill)
                                .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                        }
                    }
                }
                .padding(.horizontal, MemberLayout.hInset)
                .padding(.top, 28)

                groupSection.padding(.horizontal, MemberLayout.hInset).padding(.top, 28)

                settingsSection.padding(.horizontal, MemberLayout.hInset).padding(.top, Theme.Space.l)

                DemoSwitchboardPanel().padding(.horizontal, MemberLayout.hInset).padding(.top, Theme.Space.l)

                Color.clear.frame(height: MemberLayout.dockClearance)
            }
        }
    }

    @ViewBuilder
    private var groupSection: some View {
        if let group = router.venueGroup {
            VStack(alignment: .leading, spacing: Theme.Space.m) {
                Text("Group · \(group.name)")
                    .font(Typography.body(10, weight: .medium))
                    .foregroundStyle(Theme.inkMute)
                    .padding(.horizontal, Theme.Space.m)
                    .padding(.vertical, 6)
                    .overlay(Capsule().strokeBorder(Theme.line2, lineWidth: 1))
                HStack {
                    Text("Switch venue")
                        .font(Typography.body(15, weight: .regular))
                        .foregroundStyle(Theme.inkMute.opacity(0.5))
                    Spacer()
                    Text("Soon")
                        .font(Typography.body(10, weight: .medium))
                        .foregroundStyle(Theme.inkMute.opacity(0.5))
                        .padding(.horizontal, Theme.Space.m)
                        .padding(.vertical, 4)
                        .overlay(Capsule().strokeBorder(Theme.line.opacity(0.5), lineWidth: 1))
                }
            }
        } else {
            Text("Independent venue")
                .font(Typography.body(10, weight: .medium))
                .foregroundStyle(Theme.inkMute)
        }
    }

    private var settingsSection: some View {
        VStack(alignment: .leading, spacing: Theme.Space.xs) {
            Text("Settings").font(Typography.body(10, weight: .medium)).foregroundStyle(Theme.inkMute)
            VStack(spacing: 0) {
                settingsRow("Edit venue") { router.onboarding = .venueSetup }
                HairlineDivider(color: Theme.line)
                settingsRow("Switch to member") { router.switchToMember(appState) }
                HairlineDivider(color: Theme.line)
                settingsRow("Log out") { router.logOut(appState) }
            }
            .overlay(alignment: .top) { HairlineDivider(color: Theme.line) }
        }
    }

    private func settingsRow(_ label: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack {
                Text(label).font(Typography.body(15, weight: .regular)).foregroundStyle(Theme.ink)
                Spacer()
                AppIcon.arrowRight.symbol.font(.system(size: 15, weight: .medium)).foregroundStyle(Theme.inkMute)
            }
            .padding(.vertical, Theme.Space.l)
        }
        .buttonStyle(.plain)
    }
}

#Preview("Dark") {
    let world = DemoWorld()
    VenueProfileView()
        .appGround()
        .environment(world)
        .environment(VenueServices(world: world))
        .environment(VenueRouter())
        .environment(AppState())
        .preferredColorScheme(.dark)
}
