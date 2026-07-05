import SwiftUI

// Web `Toast` — a transient pill that floats above the dock with an ice dot + a
// single line of text on over-image glass. The host (MemberRootView) owns timing
// and placement; this is only the pill.
struct ToastView: View {
    let message: String

    var body: some View {
        HStack(spacing: Theme.Space.s) {
            Circle()
                .fill(Theme.ice)
                .frame(width: 6, height: 6)
            Text(message)
                .font(Typography.body(12, weight: .medium))
                .foregroundStyle(Theme.ink)
                .lineLimit(1)
        }
        .padding(.horizontal, Theme.Space.l)
        .padding(.vertical, 10)
        .overImageGlass(radius: Theme.Radius.pill)
        .frame(maxWidth: 300)
    }
}

#Preview("Dark") {
    ToastView(message: "Saved to your list")
        .padding(Theme.Space.xl)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .appGround()
        .preferredColorScheme(.dark)
}
