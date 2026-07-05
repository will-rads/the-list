import SwiftUI

// Glass recipes as View modifiers. Each layers the plan's "glass quality bar":
//   (1) system Material base (the real blur)          — dark/light frosted read
//   (2) Theme tint on top at the web alphas           — never opaque paint (web
//       lesson 2026-07-04: high-alpha light glass read as plain white)
//   (3) 1px hairline stroke (Theme.line / lineOverImage)
//   (4) top-edge specular highlight, dark only (Theme.specular fades to clear)
//   (5) soft, wide, low-alpha drop shadow (optional per surface)
//   (6) continuous corner radii
// On iOS 26+ the base swaps to native Liquid Glass (.glassEffect) — see
// glassBackground(...). That branch is compiled only under the Xcode 26 / Swift
// 6.2 toolchain (#if compiler(>=6.2)); on Xcode 16 / iOS 17 SDK it is excluded
// entirely, so the Material recipe is the sole path and the build stays clean.

private struct GlassSurface: ViewModifier {
    var material: Material
    var tint: Color
    var stroke: Color
    var radius: CGFloat
    var shadow: Color?
    var shadowRadius: CGFloat = 0
    var shadowY: CGFloat = 0
    var specular: Bool = true

    func body(content: Content) -> some View {
        let shape = RoundedRectangle(cornerRadius: radius, style: .continuous)
        content
            .glassBackground(shape: shape, material: material, tint: tint)
            .overlay(shape.strokeBorder(stroke, lineWidth: Theme.Stroke.hairline))
            .overlay {
                // Top-edge specular: bright at the top, gone by the middle. Theme
                // .specular is alpha 0 in light, so light mode draws nothing.
                if specular {
                    shape.strokeBorder(
                        LinearGradient(
                            colors: [Theme.specular, .clear],
                            startPoint: .top, endPoint: .bottom),
                        lineWidth: Theme.Stroke.hairline)
                }
            }
            .clipShape(shape)
            .shadow(
                color: shadow ?? .clear,
                radius: shadow == nil ? 0 : shadowRadius,
                x: 0,
                y: shadow == nil ? 0 : shadowY
            )
    }
}

private extension View {
    // The frosted base. iOS 26+ uses native Liquid Glass with the Theme tint kept
    // in front for the monochrome cast; earlier SDKs use Material + tint. The
    // compiler guard keeps `glassEffect` out of the iOS 17 SDK compile.
    @ViewBuilder
    func glassBackground(shape: RoundedRectangle, material: Material, tint: Color) -> some View {
        #if compiler(>=6.2)
        if #available(iOS 26, *) {
            self
                .background { shape.fill(tint) }
                .glassEffect(.regular, in: shape)
        } else {
            self.background {
                shape.fill(material).overlay(shape.fill(tint))
            }
        }
        #else
        self.background {
            shape.fill(material).overlay(shape.fill(tint))
        }
        #endif
    }
}

extension View {
    // Frosted panel floating over the photo ground (web .card).
    func cardGlass(radius: CGFloat = Theme.Radius.card) -> some View {
        modifier(GlassSurface(
            material: .ultraThinMaterial, tint: Theme.Glass.card, stroke: Theme.line,
            radius: radius, shadow: Theme.Shadow.card, shadowRadius: 22, shadowY: 14))
    }

    // Floating pill dock / tab bar (web .tabbar).
    func dockGlass(radius: CGFloat = Theme.Radius.dock) -> some View {
        modifier(GlassSurface(
            material: .ultraThinMaterial, tint: Theme.Glass.dock, stroke: Theme.line,
            radius: radius, shadow: Theme.Shadow.dock, shadowRadius: 24, shadowY: 14))
    }

    // Bottom sheet panel (web .sheet) — deeper tint, no drop shadow.
    func sheetGlass(radius: CGFloat = Theme.Radius.sheet) -> some View {
        modifier(GlassSurface(
            material: .ultraThinMaterial, tint: Theme.Glass.sheet, stroke: Theme.line,
            radius: radius, shadow: nil))
    }

    // Control floating directly over a photo (web .glass-over-image / .profile-glass)
    // — less blur, stronger tint, brighter hairline than app-bg glass.
    func overImageGlass(radius: CGFloat = Theme.Radius.control) -> some View {
        modifier(GlassSurface(
            material: .thinMaterial, tint: Theme.Glass.overImage, stroke: Theme.lineOverImage,
            radius: radius, shadow: nil))
    }
}
