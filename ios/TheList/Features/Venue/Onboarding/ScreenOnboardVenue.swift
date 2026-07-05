import SwiftUI

// Web `ScreenOnboardVenue` — register the venue's name/type/area/description
// and its hero + 4-photo gallery. Cosmetic like `ScreenOnboardGroup`: there is
// no frozen mutator on `VenueProfile`, so "Save venue" just completes
// onboarding — the Venue tab always shows `DemoWorld.venueProfile` (Cyan Beach
// Club), the same convention the member side already set for onboarding's
// phone/handle. See the wave return note.
struct ScreenOnboardVenue: View {
    @Environment(VenueRouter.self) private var router

    @State private var name = ""
    @State private var type = VenueCatalog.venueTypes.first!
    @State private var area = VenueCatalog.beirutAreas.last! // "Jiyeh" — matches the demo venue
    @State private var description = ""
    @State private var heroKey: String?
    @State private var galleryKeys: [String?] = [nil, nil, nil, nil]
    @State private var editingSlot: EditingSlot?

    private enum EditingSlot: Hashable { case hero, gallery(Int) }

    private var canSave: Bool { name.count >= 2 && heroKey != nil }

    var body: some View {
        ZStack {
            Theme.bg.ignoresSafeArea()
            if let editingSlot {
                cropperHost(editingSlot)
            } else {
                form
            }
        }
    }

    // MARK: Form

    private var form: some View {
        VStack(alignment: .leading, spacing: 0) {
            header

            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: Theme.Space.xl) {
                    field("Venue name") {
                        TextField("", text: $name, prompt: Text("e.g. Skybar").foregroundStyle(Theme.inkMute))
                            .font(Typography.body(15, weight: .regular))
                            .foregroundStyle(Theme.ink)
                            .padding(.horizontal, Theme.Space.m)
                            .frame(height: 48)
                            .background(RoundedRectangle(cornerRadius: 12, style: .continuous).fill(Theme.elev))
                            .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).strokeBorder(Theme.line2, lineWidth: 1))
                    }

                    field("Type") {
                        PillFlow(items: VenueCatalog.venueTypes, isSelected: { $0 == type }) { type = $0 }
                    }

                    field("Area") {
                        PillFlow(items: VenueCatalog.beirutAreas, isSelected: { $0 == area }) { area = $0 }
                    }

                    field("Description") {
                        TextEditor(text: $description)
                            .font(Typography.body(15, weight: .regular))
                            .foregroundStyle(Theme.ink)
                            .scrollContentBackground(.hidden)
                            .frame(height: 84)
                            .padding(Theme.Space.s)
                            .background(RoundedRectangle(cornerRadius: 12, style: .continuous).fill(Theme.elev))
                            .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).strokeBorder(Theme.line2, lineWidth: 1))
                            .overlay(alignment: .topLeading) {
                                if description.isEmpty {
                                    Text("Tell influencers what makes this venue worth posting.")
                                        .font(Typography.body(13, weight: .regular))
                                        .foregroundStyle(Theme.inkMute)
                                        .padding(.horizontal, Theme.Space.m + 4)
                                        .padding(.top, Theme.Space.m)
                                        .allowsHitTesting(false)
                                }
                            }
                    }

                    field("Hero image") { heroField }

                    VStack(alignment: .leading, spacing: Theme.Space.xs) {
                        stamp("Venue photos")
                        Text("Four photos influencers swipe through.")
                            .font(Typography.body(12, weight: .regular))
                            .foregroundStyle(Theme.inkMute)
                        galleryGrid.padding(.top, Theme.Space.s)
                    }
                }
                .padding(.top, Theme.Space.l)
                .padding(.bottom, Theme.Space.l)
            }

            Button {
                guard canSave else { return }
                router.completeOnboarding()
            } label: {
                HStack(spacing: Theme.Space.s) {
                    Text("Save venue").font(Typography.body(14, weight: .semibold))
                    AppIcon.arrowRight.symbol.font(.system(size: 16, weight: .semibold))
                }
                .foregroundStyle(canSave ? Theme.iceInk : Theme.inkMute)
                .frame(maxWidth: .infinity)
                .frame(height: 52)
                .background(Capsule().fill(canSave ? Theme.ice : Theme.elev2))
            }
            .buttonStyle(PressButtonStyle())
            .disabled(!canSave)
            .padding(.bottom, 40)
        }
        .padding(.horizontal, Theme.Space.xl)
        .padding(.top, 60)
    }

    private var header: some View {
        HStack(spacing: Theme.Space.m) {
            Text("Venue")
                .font(Typography.display(44))
                .tracking(44 * Typography.displayTracking)
                .foregroundStyle(Theme.ink)
            if let group = router.venueGroup {
                Text("Under \(group.name)")
                    .font(Typography.body(10, weight: .medium))
                    .foregroundStyle(Theme.inkMute)
                    .padding(.horizontal, Theme.Space.m)
                    .padding(.vertical, 4)
                    .overlay(Capsule().strokeBorder(Theme.line2, lineWidth: 1))
            }
        }
    }

    // MARK: Hero + gallery

    @ViewBuilder
    private var heroField: some View {
        if let heroKey {
            VStack(alignment: .leading, spacing: Theme.Space.s) {
                VenuePhoto(key: heroKey)
                    .aspectRatio(4.0 / 5.0, contentMode: .fill)
                    .frame(maxWidth: .infinity)
                    .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.control, style: .continuous))
                Button { editingSlot = .hero } label: {
                    Text("Replace").font(Typography.body(12, weight: .medium)).foregroundStyle(Theme.ice)
                }
                .buttonStyle(.plain)
            }
        } else {
            Button { editingSlot = .hero } label: {
                Text("+ Add hero")
                    .font(Typography.body(10, weight: .medium))
                    .foregroundStyle(Theme.inkMute)
                    .frame(maxWidth: .infinity)
                    .aspectRatio(4.0 / 5.0, contentMode: .fit)
                    .overlay(
                        RoundedRectangle(cornerRadius: Theme.Radius.control, style: .continuous)
                            .strokeBorder(style: StrokeStyle(lineWidth: 1, dash: [4, 4]))
                            .foregroundStyle(Theme.line2)
                    )
            }
            .buttonStyle(PressButtonStyle())
        }
    }

    private var galleryGrid: some View {
        LazyVGrid(columns: [GridItem(.flexible(), spacing: Theme.Space.m), GridItem(.flexible())], spacing: Theme.Space.m) {
            ForEach(0..<galleryKeys.count, id: \.self) { index in
                Button { editingSlot = .gallery(index) } label: {
                    if let key = galleryKeys[index] {
                        VenuePhoto(key: key)
                            .aspectRatio(4.0 / 5.0, contentMode: .fill)
                            .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.control, style: .continuous))
                    } else {
                        Text("+")
                            .font(Typography.body(16, weight: .medium))
                            .foregroundStyle(Theme.inkMute)
                            .frame(maxWidth: .infinity)
                            .aspectRatio(4.0 / 5.0, contentMode: .fit)
                            .overlay(
                                RoundedRectangle(cornerRadius: Theme.Radius.control, style: .continuous)
                                    .strokeBorder(style: StrokeStyle(lineWidth: 1, dash: [4, 4]))
                                    .foregroundStyle(Theme.line2)
                            )
                    }
                }
                .buttonStyle(PressButtonStyle())
            }
        }
    }

    private func cropperHost(_ slot: EditingSlot) -> some View {
        VStack(alignment: .leading, spacing: Theme.Space.l) {
            Text(slot == .hero ? "Venue hero" : "Venue photo")
                .font(Typography.body(10, weight: .medium))
                .foregroundStyle(Theme.inkMute)
            ScrollView(showsIndicators: false) {
                PresetImagePicker(selectedKey: currentKey(slot)) { key in
                    apply(key, to: slot)
                    editingSlot = nil
                }
            }
            Button { editingSlot = nil } label: {
                Text("Cancel")
                    .font(Typography.body(12, weight: .medium))
                    .foregroundStyle(Theme.ink)
                    .frame(maxWidth: .infinity)
                    .frame(height: 48)
                    .overlay(Capsule().strokeBorder(Theme.line2, lineWidth: 1))
            }
            .buttonStyle(PressButtonStyle())
        }
        .padding(.horizontal, Theme.Space.xl)
        .padding(.top, 70)
        .padding(.bottom, 24)
    }

    private func currentKey(_ slot: EditingSlot) -> String? {
        switch slot {
        case .hero: return heroKey
        case .gallery(let i): return galleryKeys[i]
        }
    }

    private func apply(_ key: String, to slot: EditingSlot) {
        switch slot {
        case .hero: heroKey = key
        case .gallery(let i): galleryKeys[i] = key
        }
    }

    // MARK: Small builders

    private func field<Content: View>(_ label: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: Theme.Space.s) {
            stamp(label)
            content()
        }
    }

    private func stamp(_ text: String) -> some View {
        Text(text)
            .font(Typography.body(10, weight: .medium))
            .foregroundStyle(Theme.inkMute)
    }
}

#Preview("Dark") {
    ScreenOnboardVenue()
        .appGround()
        .environment(VenueRouter())
        .preferredColorScheme(.dark)
}
