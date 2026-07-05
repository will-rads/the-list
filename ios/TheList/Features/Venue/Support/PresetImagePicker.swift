import SwiftUI

// DOCUMENTED DEVIATION from the web `ImageCropper`/`FramedImage` pair, which
// lets a venue pick an arbitrary local file and pan/zoom-crop it to a fixed
// frame. The frozen `EventItem`/`VenueProfile` models only carry a `String`
// image-name KEY (resolved through `VenuePhoto`/`MemberImage` to a bundled
// asset or an Unsplash URL) — there is no field for raw picked image data or a
// crop transform, and Models/ is frozen for this wave. A preset gallery keeps
// onboarding's hero/gallery pickers and the post wizard's Image step fully
// wired to real, renderable photos (AsyncImage + Theme-tinted placeholder, via
// `VenuePhoto`) without inventing new model fields. See the wave return note.
enum VenuePresetPhoto: String, CaseIterable, Identifiable {
    case beachClub, pool, rooftop, restaurant, club, clubRed, gym, lounge, cocktail, beirut

    var id: String { rawValue }

    /// The `MemberImage`/`VenuePhoto` key this preset resolves to.
    var imageKey: String { rawValue }

    var label: String {
        switch self {
        case .beachClub:  return "Beach club"
        case .pool:       return "Pool"
        case .rooftop:    return "Rooftop"
        case .restaurant: return "Restaurant"
        case .club:       return "Club"
        case .clubRed:    return "Club · red"
        case .gym:        return "Gym"
        case .lounge:     return "Lounge"
        case .cocktail:   return "Cocktail"
        case .beirut:     return "Beirut"
        }
    }
}

// A grid of preset photo thumbnails; tapping one calls back with its image key
// (the value stored on `EventItem.imageName` / `VenueProfile.heroImageName`).
struct PresetImagePicker: View {
    let selectedKey: String?
    let onSelect: (String) -> Void

    private let columns = [GridItem(.flexible(), spacing: Theme.Space.m), GridItem(.flexible(), spacing: Theme.Space.m)]

    var body: some View {
        LazyVGrid(columns: columns, spacing: Theme.Space.m) {
            ForEach(VenuePresetPhoto.allCases) { preset in
                tile(preset)
            }
        }
    }

    private func tile(_ preset: VenuePresetPhoto) -> some View {
        let selected = preset.imageKey == selectedKey
        return Button { onSelect(preset.imageKey) } label: {
            VStack(spacing: Theme.Space.xs) {
                VenuePhoto(key: preset.imageKey)
                    .aspectRatio(4.0 / 5.0, contentMode: .fill)
                    .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.control, style: .continuous))
                    .overlay {
                        RoundedRectangle(cornerRadius: Theme.Radius.control, style: .continuous)
                            .strokeBorder(selected ? Theme.ice : Theme.line, lineWidth: selected ? 2 : 1)
                    }
                    .overlay(alignment: .topTrailing) {
                        if selected {
                            AppIcon.check.symbol
                                .font(.system(size: 10, weight: .bold))
                                .foregroundStyle(Theme.iceInk)
                                .frame(width: 20, height: 20)
                                .background(Circle().fill(Theme.ice))
                                .padding(6)
                        }
                    }
                Text(preset.label)
                    .font(Typography.body(10, weight: .medium))
                    .foregroundStyle(selected ? Theme.ink : Theme.inkMute)
            }
        }
        .buttonStyle(PressButtonStyle())
    }
}

#Preview("Dark") {
    PresetImagePicker(selectedKey: "beachClub") { _ in }
        .padding(Theme.Space.xl)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .appGround()
        .preferredColorScheme(.dark)
}
