import SwiftUI

// Frosted panel floating over the photo ground — the base surface for most
// content (web .card). Wraps arbitrary content with padding + cardGlass.
struct GlassCard<Content: View>: View {
    private let padding: CGFloat
    private let radius: CGFloat
    private let content: Content

    init(padding: CGFloat = Theme.Space.l,
         radius: CGFloat = Theme.Radius.card,
         @ViewBuilder content: () -> Content) {
        self.padding = padding
        self.radius = radius
        self.content = content()
    }

    var body: some View {
        content
            .padding(padding)
            .frame(maxWidth: .infinity, alignment: .leading)
            .cardGlass(radius: radius)
    }
}

#Preview("Dark") { GlassCardPreview().preferredColorScheme(.dark) }
#Preview("Light") { GlassCardPreview().preferredColorScheme(.light) }

private struct GlassCardPreview: View {
    var body: some View {
        VStack {
            GlassCard {
                VStack(alignment: .leading, spacing: Theme.Space.s) {
                    Text("Rooftop opening").displayStyle(20).foregroundStyle(Theme.ink)
                    Text("Tonight, doors at nine.")
                        .font(Typography.body(14, weight: .medium))
                        .foregroundStyle(Theme.ink2)
                }
            }
        }
        .padding(Theme.Space.xl)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .appGround()
    }
}
