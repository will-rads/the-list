import SwiftUI

// Bottom mask fade for a hero image (web .profile-hero-img): the image is fully
// opaque to 58% of its height, then melts to transparent by 97% so it dissolves
// into the photo ground with no hard cut (Will 2026-07-04). This is a pure alpha
// mask — the black/clear stops are luminance for the mask, not themed colours, so
// it reads identically in both themes. Apply to the Image, not its container.
struct HeroMelt: ViewModifier {
    func body(content: Content) -> some View {
        content.mask {
            LinearGradient(
                stops: [
                    .init(color: .black, location: 0.0),
                    .init(color: .black, location: 0.58),
                    .init(color: .clear, location: 0.97),
                ],
                startPoint: .top,
                endPoint: .bottom
            )
        }
    }
}

extension View {
    func heroMelt() -> some View { modifier(HeroMelt()) }
}

#Preview("Dark") { HeroMeltPreview().preferredColorScheme(.dark) }
#Preview("Light") { HeroMeltPreview().preferredColorScheme(.light) }

private struct HeroMeltPreview: View {
    var body: some View {
        VStack(spacing: 0) {
            // A stand-in hero block (no bundled portrait) shows the melt shape.
            LinearGradient(
                colors: [Theme.elev2, Theme.ice.opacity(0.35)],
                startPoint: .topLeading, endPoint: .bottomTrailing
            )
            .frame(height: 360)
            .overlay(alignment: .top) {
                Text("Hero image")
                    .font(Typography.body(13, weight: .medium))
                    .foregroundStyle(Theme.ink)
                    .padding(Theme.Space.xl)
            }
            .heroMelt()

            Text("Melts into the ground below")
                .font(Typography.body(13, weight: .medium))
                .foregroundStyle(Theme.ink2)
                .padding(.top, Theme.Space.xl)

            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .appGround()
    }
}
