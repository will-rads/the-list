import SwiftUI

// Web `NotificationsSheet` — the Activity feed off the Home bell. Every row deep-
// links (resolved live against current state, web `notifTarget`); unread rows carry
// an ice dot; closing the sheet marks everything read so the badge never goes stale.
struct NotificationsSheet: View {
    @Environment(DemoWorld.self) private var world
    @Environment(MemberRouter.self) private var router

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: Theme.Space.l) {
                SheetHeader(title: "Activity") { router.dismissSheet() }
                VStack(spacing: Theme.Space.s) {
                    ForEach(world.notifications) { notification in
                        row(notification)
                    }
                }
            }
            .padding(.horizontal, Theme.Space.xl)
            .padding(.top, Theme.Space.l)
            .padding(.bottom, Theme.Space.xxl)
        }
        .onDisappear { router.markAllNotificationsRead(world.notifications) }
    }

    private func row(_ notification: AppNotification) -> some View {
        let read = router.isRead(notification)
        return Button { handleTap(notification) } label: {
            HStack(spacing: Theme.Space.m) {
                ZStack {
                    Circle().strokeBorder(Theme.line2, lineWidth: 1)
                    if notification.kind == .pass {
                        Circle().fill(Theme.ice).frame(width: 8, height: 8)
                    } else {
                        icon(for: notification.kind).symbol
                            .font(.system(size: 14, weight: .medium))
                            .foregroundStyle(Theme.ink)
                    }
                }
                .frame(width: 32, height: 32)
                .opacity(read ? 0.55 : 1)

                Text(notification.text)
                    .font(Typography.body(13, weight: .regular))
                    .foregroundStyle(Theme.ink)
                    .opacity(read ? 0.65 : 1)
                    .frame(maxWidth: .infinity, alignment: .leading)

                if !read {
                    Circle().fill(Theme.ice).frame(width: 6, height: 6)
                }
            }
            .padding(Theme.Space.m)
            .frame(maxWidth: .infinity, alignment: .leading)
            .cardGlass(radius: Theme.Radius.control)
        }
        .buttonStyle(PressButtonStyle())
    }

    private func icon(for kind: NotificationKind) -> AppIcon {
        switch kind {
        case .pass:      return .check
        case .story:     return .instagram
        case .drop:      return .bell
        case .picked:    return .sparkles
        case .expiring:  return .calendar
        case .cancelled: return .close
        default:         return .bell
        }
    }

    private func handleTap(_ notification: AppNotification) {
        let target = AppNotification.resolveMemberTarget(
            for: notification,
            myEvents: world.myEvents,
            eventExists: { id in world.events.contains { $0.id == id } }
        )
        router.markAllNotificationsRead(world.notifications)
        router.dismissSheet()
        router.route(to: target)
    }
}

#Preview("Dark") {
    let world = DemoWorld()
    Color.clear
        .sheet(isPresented: .constant(true)) {
            NotificationsSheet().memberSheetChrome()
        }
        .environment(world)
        .environment(MemberServices(world: world))
        .environment(MemberRouter())
        .preferredColorScheme(.dark)
}
