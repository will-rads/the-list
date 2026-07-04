import SwiftUI

// Web `ShareSheet` — a preview of what's being shared (event card) plus four
// actions (Copy link / To Story / Message / More), each firing its toast and
// closing. No real share pipeline in the prototype.
struct ShareSheet: View {
    @Environment(DemoWorld.self) private var world
    @Environment(MemberRouter.self) private var router

    let eventId: String

    private var event: EventItem? { world.events.first { $0.id == eventId } }

    private struct Action: Identifiable {
        let id: String
        let label: String
        let icon: AppIcon
        let toast: String
    }
    private let actions: [Action] = [
        .init(id: "copy", label: "Copy link", icon: .link, toast: "Link copied"),
        .init(id: "story", label: "To Story", icon: .instagram, toast: "Opening Instagram"),
        .init(id: "dm", label: "Message", icon: .message, toast: "Opening Messages"),
        .init(id: "more", label: "More", icon: .share, toast: "More share options"),
    ]

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Space.l) {
            SheetHeader(title: "Share") { router.dismissSheet() }

            if let event {
                HStack(spacing: Theme.Space.m) {
                    VenuePhoto(key: event.imageName)
                        .frame(width: 56, height: 64)
                        .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                    VStack(alignment: .leading, spacing: 2) {
                        Text(event.type)
                            .font(Typography.body(10, weight: .medium)).foregroundStyle(Theme.inkMute)
                        Text(event.title)
                            .font(Typography.display(17)).tracking(17 * Typography.displayTracking)
                            .foregroundStyle(Theme.ink)
                        Text("\(event.venueName) · \(event.date)")
                            .font(Typography.body(11, weight: .regular)).foregroundStyle(Theme.inkMute)
                    }
                    Spacer(minLength: Theme.Space.s)
                }
                .padding(Theme.Space.m)
                .frame(maxWidth: .infinity, alignment: .leading)
                .cardGlass(radius: Theme.Radius.control)
            }

            HStack(spacing: Theme.Space.s) {
                ForEach(actions) { action in
                    Button { fire(action) } label: {
                        VStack(spacing: Theme.Space.s) {
                            action.icon.symbol
                                .font(.system(size: 20, weight: .medium)).foregroundStyle(Theme.ink)
                            Text(action.label)
                                .font(Typography.body(10, weight: .regular)).foregroundStyle(Theme.ink)
                        }
                        .frame(maxWidth: .infinity).padding(.vertical, Theme.Space.m)
                        .background(RoundedRectangle(cornerRadius: Theme.Radius.control, style: .continuous).fill(Theme.elev))
                        .overlay(RoundedRectangle(cornerRadius: Theme.Radius.control, style: .continuous).strokeBorder(Theme.line, lineWidth: 1))
                    }
                    .buttonStyle(PressButtonStyle())
                }
            }
        }
        .padding(.horizontal, Theme.Space.xl)
        .padding(.top, Theme.Space.l)
        .padding(.bottom, Theme.Space.xxl)
    }

    private func fire(_ action: Action) {
        router.toast(action.toast)
        router.dismissSheet()
    }
}

#Preview("Dark") {
    let world = DemoWorld()
    Color.clear
        .sheet(isPresented: .constant(true)) {
            ShareSheet(eventId: "sunset").memberSheetChrome(detents: [.medium])
        }
        .environment(world)
        .environment(MemberServices(world: world))
        .environment(MemberRouter())
        .preferredColorScheme(.dark)
}
