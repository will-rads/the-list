import SwiftUI

// Theme-aware bottom fade behind a docked CTA (web .dock-fade). Transparent at
// the top, ramping to the page colour at the bottom so a scrolling list dissolves
// under a pinned action bar (EventDetail "View pass", wizard footers). Theme.fade
// is black in dark / near-white in light, so this never bleeds the wrong colour
// into the other theme (web bug 2026-07-04). Place it in a bottom-aligned ZStack,
// behind the CTA; it ignores touches.
struct DockFade: View {
    var height: CGFloat = 140

    var body: some View {
        LinearGradient(
            stops: [
                .init(color: Theme.fade.opacity(0.0),  location: 0.0),
                .init(color: Theme.fade.opacity(0.85), location: 0.45),
                .init(color: Theme.fade.opacity(0.96), location: 0.85),
                .init(color: Theme.fade.opacity(0.96), location: 1.0),
            ],
            startPoint: .top,
            endPoint: .bottom
        )
        .frame(height: height)
        .frame(maxWidth: .infinity)
        .allowsHitTesting(false)
    }
}

#Preview("Dark") { DockFadePreview().preferredColorScheme(.dark) }
#Preview("Light") { DockFadePreview().preferredColorScheme(.light) }

private struct DockFadePreview: View {
    var body: some View {
        ZStack(alignment: .bottom) {
            // stand-in scrolling content the fade dissolves
            VStack(spacing: Theme.Space.m) {
                ForEach(0..<8, id: \.self) { _ in
                    GlassCard { Text("A room").foregroundStyle(Theme.ink) }
                }
            }
            .padding(Theme.Space.l)

            ZStack(alignment: .bottom) {
                DockFade()
                PillButton(title: "View pass", trailingArrow: true) {}
                    .padding(Theme.Space.l)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .appGround()
    }
}
