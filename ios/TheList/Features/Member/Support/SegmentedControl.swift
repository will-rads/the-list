import SwiftUI

// Web `Segmented` — a pill-track segmented control on a glass track. The selected
// segment fills with ink (inverted: bg-coloured label); others read ink-mute. Each
// item carries an optional trailing count. Generic over the segment identifier so
// a screen defines its own segment enum.
struct SegmentedControl<ID: Hashable>: View {
    struct Item: Identifiable {
        let id: ID
        let label: String
        var count: Int?
    }

    let items: [Item]
    @Binding var selection: ID

    var body: some View {
        HStack(spacing: Theme.Space.xs) {
            ForEach(items) { item in
                segment(item)
            }
        }
        .padding(Theme.Space.xs)
        .background {
            Capsule()
                .fill(Theme.elev)
                .overlay(Capsule().strokeBorder(Theme.line, lineWidth: Theme.Stroke.hairline))
        }
    }

    @ViewBuilder
    private func segment(_ item: Item) -> some View {
        let on = item.id == selection
        Button {
            selection = item.id
        } label: {
            HStack(spacing: Theme.Space.xs) {
                Text(item.label)
                if let count = item.count {
                    Text("\(count)").opacity(0.65)
                }
            }
            .font(Typography.body(11, weight: .medium))
            .frame(maxWidth: .infinity)
            .frame(height: 36)
            .foregroundStyle(on ? Theme.bg : Theme.inkMute)
            .background {
                if on { Capsule().fill(Theme.ink) }
            }
            .contentShape(Capsule())
        }
        .buttonStyle(PressButtonStyle())
    }
}

#Preview("Dark") {
    SegmentedPreview().preferredColorScheme(.dark)
}

private struct SegmentedPreview: View {
    @State private var seg = "confirmed"
    var body: some View {
        SegmentedControl(
            items: [
                .init(id: "applied", label: "Applied", count: 3),
                .init(id: "confirmed", label: "Confirmed", count: 1),
                .init(id: "saved", label: "Saved", count: 0),
                .init(id: "past", label: "Past", count: 4),
            ],
            selection: $seg
        )
        .padding(Theme.Space.xl)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .appGround()
    }
}
