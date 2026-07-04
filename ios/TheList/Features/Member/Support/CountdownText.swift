import SwiftUI

// Web `Countdown` — renders a "HH:MM:SS" (or "MM:SS") value with the colons
// dimmed and tightened so the tabular digits carry the weight. Digits are
// monospaced (Typography.number) so a ticking timer never jitters. The caller
// sets font size + colour; this only handles the colon treatment + mono figures.
struct CountdownText: View {
    let value: String
    var size: CGFloat = 22

    var body: some View {
        let parts = value.split(separator: ":").map(String.init)
        HStack(spacing: 0) {
            ForEach(Array(parts.enumerated()), id: \.offset) { index, part in
                if index > 0 {
                    Text(":")
                        .opacity(0.4)
                        .padding(.horizontal, size * 0.06)
                }
                Text(part)
            }
        }
        .font(Typography.number(size))
    }
}

#Preview("Dark") {
    VStack(spacing: Theme.Space.l) {
        CountdownText(value: "23:59:59", size: 28).foregroundStyle(Theme.ice)
        CountdownText(value: "04:56:12", size: 22).foregroundStyle(Theme.ice)
    }
    .padding(Theme.Space.xl)
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .appGround()
    .preferredColorScheme(.dark)
}
