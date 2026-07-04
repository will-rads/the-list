import SwiftUI

// Web `DateChip` — a small rounded date block: big monospaced day over a muted
// month. Ice-filled for the one pinned/confirmed night, neutral otherwise.
struct DateChip: View {
    let day: String
    let month: String
    var ice: Bool = false

    var body: some View {
        VStack(spacing: 2) {
            Text(day)
                .font(Typography.number(20))
            Text(month)
                .font(Typography.body(9, weight: .medium))
                .opacity(0.8)
        }
        .foregroundStyle(ice ? Theme.iceInk : Theme.ink)
        .frame(width: 48, height: 54)
        .background(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .fill(ice ? Theme.ice : Theme.elev2)
        )
    }
}

#Preview("Dark") {
    HStack(spacing: Theme.Space.m) {
        DateChip(day: "25", month: "May", ice: true)
        DateChip(day: "30", month: "May")
    }
    .padding(Theme.Space.xl)
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .appGround()
    .preferredColorScheme(.dark)
}
