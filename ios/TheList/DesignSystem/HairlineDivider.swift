import SwiftUI

// Horizontal rule. The v3 signature is dotted (web .hr / .hr-2), so this ships a
// dotted variant alongside the solid one. Colour defaults to line-2 (the brighter
// hairline); pass Theme.line for a quieter rule.
struct HairlineDivider: View {
    var dotted: Bool = false
    var color: Color = Theme.line2

    var body: some View {
        RuleShape()
            .stroke(
                color,
                style: StrokeStyle(
                    lineWidth: Theme.Stroke.hairline,
                    lineCap: .round,
                    dash: dotted ? [1.5, 3.5] : []
                )
            )
            .frame(height: Theme.Stroke.hairline)
    }
}

// A single centred horizontal line, drawn edge to edge.
private struct RuleShape: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        path.move(to: CGPoint(x: 0, y: rect.midY))
        path.addLine(to: CGPoint(x: rect.maxX, y: rect.midY))
        return path
    }
}

#Preview("Dark") { HairlineDividerPreview().preferredColorScheme(.dark) }
#Preview("Light") { HairlineDividerPreview().preferredColorScheme(.light) }

private struct HairlineDividerPreview: View {
    var body: some View {
        VStack(spacing: Theme.Space.xl) {
            Text("Solid").font(Typography.body(12, weight: .medium)).foregroundStyle(Theme.inkMute)
            HairlineDivider()
            Text("Dotted").font(Typography.body(12, weight: .medium)).foregroundStyle(Theme.inkMute)
            HairlineDivider(dotted: true)
            Text("Dotted, quiet").font(Typography.body(12, weight: .medium)).foregroundStyle(Theme.inkMute)
            HairlineDivider(dotted: true, color: Theme.line)
        }
        .padding(Theme.Space.xl)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .appGround()
    }
}
