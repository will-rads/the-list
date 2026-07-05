import SwiftUI

// Small pill label. Two web recipes: .chip-ice (solid ice fill + soft halo, for
// the single emphasised status) and .chip-outline (hairline outline over the
// scrim). Optional leading icon. Sentence case at the call site.
struct Chip: View {
    enum Style { case ice, outline }

    let text: String
    var style: Style = .outline
    var icon: AppIcon? = nil

    var body: some View {
        HStack(spacing: Theme.Space.xs) {
            if let icon {
                icon.symbol.font(.system(size: 11, weight: .semibold))
            }
            Text(text)
                .font(Typography.body(11, weight: .medium))
        }
        .padding(.horizontal, Theme.Space.m)
        .padding(.vertical, 6)
        .foregroundStyle(style == .ice ? Theme.iceInk : Theme.ink)
        .background {
            switch style {
            case .ice:
                Capsule().fill(Theme.ice)
            case .outline:
                Capsule().strokeBorder(Theme.line2, lineWidth: Theme.Stroke.hairline)
            }
        }
        // web .chip-ice halo — ice only; outline chips cast nothing.
        .shadow(color: style == .ice ? Theme.iceGlow : .clear, radius: 9)
    }
}

#Preview("Dark") { ChipPreview().preferredColorScheme(.dark) }
#Preview("Light") { ChipPreview().preferredColorScheme(.light) }

private struct ChipPreview: View {
    var body: some View {
        VStack(spacing: Theme.Space.l) {
            Chip(text: "Applications open", style: .ice)
            Chip(text: "Closing soon", style: .ice, icon: .check)
            Chip(text: "Members only", style: .outline)
            Chip(text: "Doors 21:00", style: .outline, icon: .calendar)
        }
        .padding(Theme.Space.xl)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .appGround()
    }
}
