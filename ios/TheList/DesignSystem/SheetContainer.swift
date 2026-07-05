import SwiftUI

// The frosted panel a bottom sheet's content sits in (web .sheet): a grabber, an
// optional title, then content, all on sheetGlass (deeper tint, glass quality
// bar). The presentation itself — .sheet / detents / backdrop dim — is the
// caller's job in W2/W3; this is only the surface so every sheet reads the same.
struct SheetContainer<Content: View>: View {
    let title: String?
    let content: Content

    init(title: String? = nil, @ViewBuilder content: () -> Content) {
        self.title = title
        self.content = content()
    }

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Space.l) {
            Capsule()
                .fill(Theme.line2)
                .frame(width: 40, height: 4)
                .frame(maxWidth: .infinity)
                .padding(.top, Theme.Space.m)

            if let title {
                Text(title)
                    .displayStyle(20)
                    .foregroundStyle(Theme.ink)
            }

            content
        }
        .padding(.horizontal, Theme.Space.xl)
        .padding(.bottom, Theme.Space.xl)
        .frame(maxWidth: .infinity, alignment: .leading)
        .sheetGlass(radius: Theme.Radius.sheet)
    }
}

#Preview("Dark") { SheetContainerPreview().preferredColorScheme(.dark) }
#Preview("Light") { SheetContainerPreview().preferredColorScheme(.light) }

private struct SheetContainerPreview: View {
    var body: some View {
        VStack {
            Spacer()
            SheetContainer(title: "Filter tonight") {
                VStack(alignment: .leading, spacing: Theme.Space.m) {
                    Text("Narrow the rooms by mood and hour.")
                        .font(Typography.body(14, weight: .medium))
                        .foregroundStyle(Theme.ink2)
                    HairlineDivider(dotted: true)
                    PillButton(title: "Show 12 rooms", trailingArrow: true) {}
                }
            }
            .padding(Theme.Space.m)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .appGround()
    }
}
