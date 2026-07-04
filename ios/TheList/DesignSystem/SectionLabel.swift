import SwiftUI

// Section divider label (web .section-label): a short leading accent bar + a
// sentence-case label in ink-2. Sits directly on the photo scrim, so it carries
// the same readability text-shadow as web .section-label. No tracking, no caps.
struct SectionLabel: View {
    let text: String

    var body: some View {
        HStack(spacing: Theme.Space.s) {
            Capsule()
                .fill(Theme.ice)
                .frame(width: 3, height: 14)
            Text(text)
                .font(Typography.body(14, weight: .bold))
                .foregroundStyle(Theme.ink2)
        }
        .shadow(color: Theme.textShadow, radius: 8, y: 1)
    }
}

#Preview("Dark") { SectionLabelPreview().preferredColorScheme(.dark) }
#Preview("Light") { SectionLabelPreview().preferredColorScheme(.light) }

private struct SectionLabelPreview: View {
    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Space.xl) {
            SectionLabel(text: "Your night")
            SectionLabel(text: "Tonight in the city")
            SectionLabel(text: "Saved for later")
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(Theme.Space.xl)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .appGround()
    }
}
