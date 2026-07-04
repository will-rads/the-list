import SwiftUI

// The bg-3 ground: one full-bleed photo + theme scrim behind EVERY screen, both
// themes (web .iphone-screen::before). Overlay/full-screen screens re-apply this
// so a screen still mounted beneath does not bleed through (web bug 2026-07-04).
struct AppGround: ViewModifier {
    func body(content: Content) -> some View {
        ZStack {
            GroundLayer()
            content
        }
    }
}

private struct GroundLayer: View {
    var body: some View {
        ZStack {
            Theme.bg
            // GeometryReader gives exact screen size so scaledToFill + clipped is a
            // true full-bleed with no layout overflow.
            GeometryReader { geo in
                Image("bg-3")
                    .resizable()
                    .scaledToFill()
                    .frame(width: geo.size.width, height: geo.size.height)
                    .clipped()
                    .overlay(Theme.scrim)
            }
        }
        .ignoresSafeArea()
    }
}

extension View {
    func appGround() -> some View { modifier(AppGround()) }
}
