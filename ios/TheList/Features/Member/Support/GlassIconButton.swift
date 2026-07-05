import SwiftUI

// A circular glass control floating over the photo ground — the web `.glass`
// icon buttons in screen headers (bell, search, calendar, filters, back). Uses the
// DesignSystem over-image glass recipe. An optional ice badge (unread count) sits
// on the top-right, matching the Home bell.
struct GlassIconButton: View {
    let icon: AppIcon
    var size: CGFloat = 40
    var iconSize: CGFloat = 16
    var badge: Int? = nil
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            icon.symbol
                .font(.system(size: iconSize, weight: .medium))
                .foregroundStyle(Theme.ink)
                .frame(width: size, height: size)
                .overImageGlass(radius: size / 2)
                .overlay(alignment: .topTrailing) { badgeView }
                .contentShape(Circle())
        }
        .buttonStyle(PressButtonStyle())
    }

    @ViewBuilder
    private var badgeView: some View {
        if let badge, badge > 0 {
            Text("\(badge)")
                .font(Typography.number(10))
                .foregroundStyle(Theme.iceInk)
                .frame(width: 16, height: 16)
                .background(Circle().fill(Theme.ice))
                .offset(x: 2, y: -2)
        }
    }
}

#Preview("Dark") {
    HStack(spacing: Theme.Space.m) {
        GlassIconButton(icon: .bell, badge: 3) {}
        GlassIconButton(icon: .search) {}
        GlassIconButton(icon: .calendar) {}
    }
    .padding(Theme.Space.xl)
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .appGround()
    .preferredColorScheme(.dark)
}
