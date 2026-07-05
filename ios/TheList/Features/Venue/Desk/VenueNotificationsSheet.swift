import SwiftUI

// Web `NotifSheet` — the venue's Activity feed, off the Desk bell. Rows are
// recomputed fresh from event state every time (`DemoWorld.venueNotifications()`,
// a pure function — never stored), each carrying a fixed deep-link target.
struct VenueNotificationsSheet: View {
    @Environment(DemoWorld.self) private var world
    @Environment(VenueRouter.self) private var router

    private var rows: [AppNotification] { world.venueNotifications() }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: Theme.Space.l) {
                SheetHeader(title: "Activity") { router.dismissSheet() }

                if rows.isEmpty {
                    Text("All clear")
                        .font(Typography.body(13, weight: .regular))
                        .foregroundStyle(Theme.inkMute)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, Theme.Space.xxl)
                        .cardGlass(radius: Theme.Radius.control)
                } else {
                    VStack(spacing: Theme.Space.s) {
                        ForEach(rows) { row in notifRow(row) }
                    }
                }
            }
            .padding(.horizontal, Theme.Space.xl)
            .padding(.top, Theme.Space.l)
            .padding(.bottom, Theme.Space.xxl)
        }
    }

    private func notifRow(_ notification: AppNotification) -> some View {
        Button { handleTap(notification) } label: {
            HStack(spacing: Theme.Space.m) {
                Circle()
                    .fill(dotColor(for: notification.kind))
                    .frame(width: 6, height: 6)
                Text(notification.text)
                    .font(Typography.body(13, weight: .regular))
                    .foregroundStyle(Theme.ink)
                    .frame(maxWidth: .infinity, alignment: .leading)
                AppIcon.arrowRight.symbol
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(Theme.ink)
            }
            .padding(Theme.Space.m)
            .frame(maxWidth: .infinity, alignment: .leading)
            .cardGlass(radius: Theme.Radius.control)
        }
        .buttonStyle(PressButtonStyle())
    }

    private func dotColor(for kind: NotificationKind) -> Color {
        (kind == .applicants || kind == .confirmed) ? Theme.ice : Theme.line2
    }

    private func handleTap(_ notification: AppNotification) {
        router.dismissSheet()
        switch notification.target {
        case .reviewDeck(let id):  router.openReviewDeck(id)
        case .guestList(let id):   router.present(.guestList(id))
        case .recap(let id):       router.openRecap(id)
        default: break
        }
    }
}

#Preview("Dark") {
    let world = DemoWorld()
    Color.clear
        .sheet(isPresented: .constant(true)) {
            VenueNotificationsSheet().memberSheetChrome()
        }
        .environment(world)
        .environment(VenueServices(world: world))
        .environment(VenueRouter())
        .preferredColorScheme(.dark)
}
