import SwiftUI

// A single readout on a glass tile: a monospaced-digit value over a muted label
// (web stat blocks — "20/18/2", "137 applied", "8.6"). Numbers use the tabular
// figure recipe so counts and timers don't jitter. Sits on cardGlass.
struct StatTile: View {
    let value: String
    let label: String
    var alignment: HorizontalAlignment = .leading

    var body: some View {
        VStack(alignment: alignment, spacing: Theme.Space.xs) {
            Text(value)
                .font(Typography.number(24))
                .foregroundStyle(Theme.ink)
            Text(label)
                .font(Typography.body(11, weight: .medium))
                .foregroundStyle(Theme.inkMute)
        }
        .frame(maxWidth: .infinity, alignment: frameAlignment)
        .padding(Theme.Space.l)
        .cardGlass(radius: Theme.Radius.tile)
    }

    private var frameAlignment: Alignment {
        if alignment == .leading  { return .leading }
        if alignment == .trailing { return .trailing }
        return .center
    }
}

#Preview("Dark") { StatTilePreview().preferredColorScheme(.dark) }
#Preview("Light") { StatTilePreview().preferredColorScheme(.light) }

private struct StatTilePreview: View {
    var body: some View {
        VStack(spacing: Theme.Space.m) {
            HStack(spacing: Theme.Space.m) {
                StatTile(value: "20/18/2", label: "Seats · in · out")
                StatTile(value: "137", label: "Applied")
            }
            HStack(spacing: Theme.Space.m) {
                StatTile(value: "8.6", label: "Room score", alignment: .center)
                StatTile(value: "LST-4F", label: "Pass code", alignment: .center)
            }
        }
        .padding(Theme.Space.xl)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .appGround()
    }
}
