import SwiftUI

// Web `StatusPill` — a rounded status badge with a leading dot + sentence-case
// label. Three tones: ice (the one affirmative/open status), neutral (muted fill),
// outline (hairline over the scrim). Distinct from DesignSystem `Chip` (which has
// no dot and no neutral fill), so it lives here as a Member component. Sentence
// case at the call site.
struct StatusPill: View {
    enum Tone { case ice, neutral, outline }

    let label: String
    var tone: Tone = .neutral
    var showDot: Bool = true

    var body: some View {
        HStack(spacing: 6) {
            if showDot {
                Circle()
                    .fill(tone == .ice ? Theme.iceInk : Theme.ice)
                    .frame(width: 6, height: 6)
            }
            Text(label)
                .font(Typography.body(10, weight: .medium))
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 4)
        .foregroundStyle(tone == .neutral ? Theme.ink : (tone == .ice ? Theme.iceInk : Theme.ink))
        .background {
            switch tone {
            case .ice:     Capsule().fill(Theme.ice)
            case .neutral: Capsule().fill(Theme.elev2)
            case .outline: Capsule().strokeBorder(Theme.line2, lineWidth: Theme.Stroke.hairline)
            }
        }
        .shadow(color: tone == .ice ? Theme.iceGlow : .clear, radius: 8)
    }
}

#Preview("Dark") { StatusPillPreview().preferredColorScheme(.dark) }
#Preview("Light") { StatusPillPreview().preferredColorScheme(.light) }

private struct StatusPillPreview: View {
    var body: some View {
        VStack(spacing: Theme.Space.l) {
            StatusPill(label: "Confirmed", tone: .ice)
            StatusPill(label: "Applied · under review", tone: .neutral)
            StatusPill(label: "Not selected", tone: .outline, showDot: false)
        }
        .padding(Theme.Space.xl)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .appGround()
    }
}
