import SwiftUI

// A wrapping row of selectable pills (web `flex flex-wrap gap-2` chip groups:
// venue Type, Area, and the post wizard's "Applications close" chips). Ice
// fill when selected, hairline outline otherwise — shared so the three call
// sites don't reimplement the same flow layout.
struct PillFlow: View {
    let items: [String]
    let isSelected: (String) -> Bool
    let onTap: (String) -> Void

    private let columns = [GridItem(.adaptive(minimum: 76), spacing: Theme.Space.s, alignment: .leading)]

    var body: some View {
        LazyVGrid(columns: columns, alignment: .leading, spacing: Theme.Space.s) {
            ForEach(items, id: \.self) { item in
                let on = isSelected(item)
                Button { onTap(item) } label: {
                    Text(item)
                        .font(Typography.body(12, weight: .medium))
                        .foregroundStyle(on ? Theme.iceInk : Theme.ink)
                        .padding(.horizontal, Theme.Space.m)
                        .frame(height: 36)
                        .background {
                            if on {
                                Capsule().fill(Theme.ice)
                            } else {
                                Capsule().strokeBorder(Theme.line2, lineWidth: 1)
                            }
                        }
                }
                .buttonStyle(PressButtonStyle())
            }
        }
    }
}

#Preview("Dark") {
    PillFlow(items: VenueCatalog.venueTypes, isSelected: { $0 == "Beach" }, onTap: { _ in })
        .padding(Theme.Space.xl)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .appGround()
        .preferredColorScheme(.dark)
}
