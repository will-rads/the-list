import SwiftUI

// Web member `StatTile` — a glass tile with a big monospaced number over a small
// "stamp" label. Optionally ice-coloured (the one value worth reading) and
// optionally tappable (My Events jumps to a segment). Distinct from the
// DesignSystem `StatTile` (which is centred, non-tappable, single-weight), so it
// lives here as a Member component.
struct MemberStatTile: View {
    let value: String
    let label: String
    var ice: Bool = false
    var action: (() -> Void)? = nil

    var body: some View {
        if let action {
            Button(action: action) { tile }
                .buttonStyle(PressButtonStyle())
        } else {
            tile
        }
    }

    private var tile: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(value)
                .font(Typography.number(26))
                .foregroundStyle(ice ? Theme.ice : Theme.ink)
            Text(label)
                .font(Typography.body(10, weight: .medium))
                .foregroundStyle(Theme.inkMute)
                .shadow(color: Theme.textShadow, radius: 8, y: 1)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(Theme.Space.l)
        .cardGlass(radius: Theme.Radius.tile)
    }
}

#Preview("Dark") {
    HStack(spacing: Theme.Space.m) {
        MemberStatTile(value: "3", label: "Applied")
        MemberStatTile(value: "1", label: "Confirmed", ice: true)
        MemberStatTile(value: "4", label: "Past")
    }
    .padding(Theme.Space.xl)
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .appGround()
    .preferredColorScheme(.dark)
}
