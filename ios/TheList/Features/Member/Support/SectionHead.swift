import SwiftUI

// Web `SectionHead` — a section divider: the DesignSystem `SectionLabel` (accent
// bar + sentence-case label) with an optional right-aligned meta pill ("2 open",
// "Closes soonest", "Estimated"). Composes SectionLabel rather than re-drawing it,
// so the accent-bar recipe stays owned by one place.
struct SectionHead: View {
    let label: String
    var right: String? = nil

    var body: some View {
        HStack {
            SectionLabel(text: label)
            Spacer(minLength: Theme.Space.m)
            if let right {
                Text(right)
                    .font(Typography.body(10, weight: .medium))
                    .foregroundStyle(Theme.inkMute)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 4)
                    .overlay(Capsule().strokeBorder(Theme.line2, lineWidth: Theme.Stroke.hairline))
                    .shadow(color: Theme.textShadow, radius: 8, y: 1)
            }
        }
        .padding(.horizontal, MemberLayout.hInset)
    }
}

#Preview("Dark") {
    VStack(spacing: Theme.Space.xl) {
        SectionHead(label: "Your night")
        SectionHead(label: "Also tonight", right: "2 open")
        SectionHead(label: "4 rooms", right: "Closes soonest")
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .appGround()
    .preferredColorScheme(.dark)
}
