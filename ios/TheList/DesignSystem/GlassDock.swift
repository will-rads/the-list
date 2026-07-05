import SwiftUI

// The v3 signature: a floating glass pill tab bar (web .tabbar) — 4 columns, each
// an icon over a 10pt label. Active = ink label + ice icon; inactive = ink-mute.
// The dock is generic over the tab identifier so features define their own tab
// enum; it renders on dockGlass, which carries the full glass quality bar and, in
// light theme, stays see-through (web light .tabbar lesson 2026-07-04).
struct GlassDock<Tab: Hashable>: View {

    struct Item: Identifiable {
        let tab: Tab
        let icon: AppIcon
        let label: String
        var id: Tab { tab }

        init(_ tab: Tab, icon: AppIcon, label: String) {
            self.tab = tab
            self.icon = icon
            self.label = label
        }
    }

    let items: [Item]
    @Binding var selection: Tab

    var body: some View {
        HStack(spacing: Theme.Space.xs) {
            ForEach(items) { item in
                dockButton(item)
            }
        }
        .padding(.horizontal, 10)
        .padding(.vertical, Theme.Space.s)
        .frame(height: 64)
        .dockGlass()
        .padding(.horizontal, Theme.Space.l)
    }

    @ViewBuilder
    private func dockButton(_ item: Item) -> some View {
        let active = item.tab == selection
        Button {
            selection = item.tab
        } label: {
            VStack(spacing: 5) {
                item.icon.symbol
                    .font(.system(size: 18, weight: .medium))
                    .foregroundStyle(active ? Theme.ice : Theme.navIdle)
                Text(item.label)
                    .font(Typography.body(10, weight: .medium))
                    .foregroundStyle(active ? Theme.ink : Theme.navIdle)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, Theme.Space.xs)
            .contentShape(Rectangle())
        }
        .buttonStyle(PressButtonStyle())
    }
}

#Preview("Dark") { GlassDockPreview().preferredColorScheme(.dark) }
#Preview("Light") { GlassDockPreview().preferredColorScheme(.light) }

// The member dock (web tabs: Home / Explore / Invites / Profile) driven by local
// @State so the preview is interactive.
private struct GlassDockPreview: View {
    private enum DemoTab: Hashable { case home, explore, invites, profile }
    @State private var tab: DemoTab = .home

    var body: some View {
        VStack {
            Spacer()
            GlassDock(
                items: [
                    .init(.home,    icon: .home,     label: "Home"),
                    .init(.explore, icon: .explore,  label: "Explore"),
                    .init(.invites, icon: .bookmark, label: "Invites"),
                    .init(.profile, icon: .user,     label: "Profile"),
                ],
                selection: $tab
            )
            .padding(.bottom, Theme.Space.m)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .appGround()
    }
}
