import SwiftUI

// Web `ScreenHome` — greeting header (bell + search), a pinned "your night" row,
// the featured Pool Day card, and the "Also tonight" list of open rooms. Reads the
// live DemoWorld so a picked/confirmed change reflows the pinned row instantly.
struct HomeView: View {
    @Environment(DemoWorld.self) private var world
    @Environment(MemberServices.self) private var services
    @Environment(MemberRouter.self) private var router

    private var featured: EventItem? { world.events.first { $0.id == "pool" } }
    private var confirmedRow: MyEventRow? { world.myEvents.first { $0.state == .confirmed } }
    private var confirmedEvent: EventItem? {
        confirmedRow.flatMap { row in world.events.first { $0.id == row.eventId } }
    }
    private var nextEvent: EventItem? {
        confirmedEvent ?? world.events.first { $0.id == "lounge" }
    }
    private var tonight: [EventItem] {
        world.events.filter {
            $0.stage == .open && $0.id != featured?.id && $0.id != nextEvent?.id
        }
    }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 0) {
                header
                HairlineDivider(dotted: true, color: Theme.line2)
                    .padding(.horizontal, MemberLayout.hInset)
                    .padding(.bottom, Theme.Space.xl)

                SectionHead(label: "Your night")
                    .padding(.bottom, Theme.Space.m)
                pinnedRow.padding(.horizontal, MemberLayout.hInset)

                if let featured {
                    FeaturedCard(event: featured)
                        .padding(.horizontal, MemberLayout.hInset)
                        .padding(.top, Theme.Space.xl)
                }

                SectionHead(label: "Also tonight", right: "\(tonight.count) open")
                    .padding(.top, 28)
                    .padding(.bottom, Theme.Space.m)
                VStack(spacing: Theme.Space.m) {
                    ForEach(tonight) { event in
                        TonightRow(event: event) { router.openEventDetail(event.id) }
                    }
                }
                .padding(.horizontal, MemberLayout.hInset)

                Color.clear.frame(height: MemberLayout.dockClearance)
            }
            .padding(.top, 60)
        }
    }

    // MARK: Header

    private var header: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(spacing: Theme.Space.s) {
                Spacer()
                GlassIconButton(icon: .bell, badge: router.unreadCount(world.notifications)) {
                    router.present(.notifications)
                }
                GlassIconButton(icon: .search) { router.selectTab(.explore) }
            }
            HStack(alignment: .bottom) {
                Text("Home")
                    .font(Typography.display(40))
                    .tracking(40 * Typography.displayTracking)
                    .foregroundStyle(Theme.ink)
                    .shadow(color: Theme.textShadow, radius: 20)
                Spacer()
                Text("Sunday · 25.05")
                    .font(Typography.body(14, weight: .medium))
                    .foregroundStyle(Theme.ink2)
                    .padding(.bottom, 2)
            }
            .padding(.top, Theme.Space.m)
        }
        .padding(.horizontal, MemberLayout.hInset)
        .padding(.bottom, Theme.Space.m)
    }

    // MARK: Pinned "your night" row

    private var pinnedRow: some View {
        Button {
            if let confirmedEvent { router.openPass(confirmedEvent.id) }
            else { router.selectTab(.invites) }
        } label: {
            HStack(spacing: Theme.Space.m) {
                let parts = MemberFormatting.parseDate(nextEvent?.date ?? DemoWorld.today)
                DateChip(day: parts.day, month: parts.month, ice: true)
                VStack(alignment: .leading, spacing: 2) {
                    Text(nextEvent?.title ?? "")
                        .font(Typography.display(17))
                        .tracking(17 * Typography.displayTracking)
                        .foregroundStyle(Theme.ink)
                    Text(pinnedSubtitle)
                        .font(Typography.body(11, weight: .regular))
                        .foregroundStyle(Theme.ink)
                }
                Spacer(minLength: Theme.Space.s)
                AppIcon.arrowRight.symbol
                    .font(.system(size: 16, weight: .medium))
                    .foregroundStyle(Theme.ink.opacity(0.5))
            }
            .padding(Theme.Space.m)
            .frame(maxWidth: .infinity, alignment: .leading)
            .cardGlass(radius: Theme.Radius.control)
        }
        .buttonStyle(PressButtonStyle())
    }

    private var pinnedSubtitle: String {
        guard let nextEvent else { return "" }
        if confirmedEvent != nil {
            return "Doors \(nextEvent.doors.isEmpty ? nextEvent.time : nextEvent.doors) · View pass"
        }
        return "Confirmed · \(nextEvent.time)"
    }
}

// MARK: - Featured card

private struct FeaturedCard: View {
    @Environment(DemoWorld.self) private var world
    @Environment(MemberRouter.self) private var router
    let event: EventItem

    private var statusLabel: String {
        if let row = world.myEvents.first(where: { $0.eventId == event.id }), row.state != .none {
            return row.state.memberLabel
        }
        return event.memberBadge
    }

    var body: some View {
        Button { router.openEventDetail(event.id) } label: {
            ZStack(alignment: .bottomLeading) {
                VenuePhoto(key: event.imageName)
                    .frame(height: 380)
                    .frame(maxWidth: .infinity)
                    .clipped()
                MemberPalette.featuredScrim

                VStack(alignment: .leading, spacing: 0) {
                    Text(event.title)
                        .font(Typography.display(40))
                        .tracking(40 * Typography.displayTracking)
                        .lineSpacing(-4)
                        .foregroundStyle(MemberPalette.onPhoto)
                    HStack(spacing: Theme.Space.s) {
                        Text(event.venueName).font(Typography.body(12, weight: .regular))
                        Text("·").opacity(0.7)
                        Text(event.date).font(Typography.number(12))
                    }
                    .foregroundStyle(MemberPalette.onPhoto)
                    .padding(.top, Theme.Space.m)
                    HStack(alignment: .bottom) {
                        HStack(spacing: Theme.Space.xs) {
                            Text("\(event.seats)")
                                .font(Typography.number(18))
                                .foregroundStyle(MemberPalette.onPhoto)
                            Text("seats · \(event.appliedTotal) applied")
                                .font(Typography.body(11, weight: .regular))
                                .foregroundStyle(MemberPalette.onPhoto)
                        }
                        Spacer()
                        Text("Tap to view")
                            .font(Typography.body(10, weight: .medium))
                            .foregroundStyle(Theme.iceInk)
                            .padding(.horizontal, Theme.Space.m)
                            .padding(.vertical, 6)
                            .background(Capsule().fill(Theme.ice))
                            .shadow(color: Theme.iceGlow, radius: 9)
                    }
                    .padding(.top, Theme.Space.l)
                }
                .padding(Theme.Space.l)
            }
            .overlay(alignment: .topLeading) {
                StatusPill(label: statusLabel, tone: .ice)
                    .padding(Theme.Space.m)
            }
            .overlay(alignment: .topTrailing) {
                SaveButton(saved: router.saved.contains(event.id)) {
                    router.toggleSave(event.id)
                }
                .padding(Theme.Space.m)
            }
            .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.tile, style: .continuous))
            .cardGlass(radius: Theme.Radius.tile)
        }
        .buttonStyle(PressButtonStyle())
    }
}

// MARK: - Also-tonight row

private struct TonightRow: View {
    let event: EventItem
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: Theme.Space.m) {
                VenuePhoto(key: event.imageName)
                    .frame(width: 64, height: 80)
                    .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                VStack(alignment: .leading, spacing: 2) {
                    Text(event.type)
                        .font(Typography.body(10, weight: .medium))
                        .foregroundStyle(Theme.inkMute)
                    Text(event.title)
                        .font(Typography.display(17))
                        .tracking(17 * Typography.displayTracking)
                        .foregroundStyle(Theme.ink)
                    Text("\(event.venueName) · \(event.area)")
                        .font(Typography.body(11, weight: .regular))
                        .foregroundStyle(Theme.inkMute)
                    HStack(spacing: Theme.Space.s) {
                        Text("\(event.seats) seats")
                            .font(Typography.number(11)).foregroundStyle(Theme.ice)
                        Text("·").foregroundStyle(Theme.inkMute)
                        Text("\(event.appliedTotal) applied")
                            .font(Typography.number(11)).foregroundStyle(Theme.inkMute)
                    }
                    .padding(.top, 2)
                }
                Spacer(minLength: Theme.Space.s)
                AppIcon.arrowRight.symbol
                    .font(.system(size: 16, weight: .medium))
                    .foregroundStyle(Theme.ink.opacity(0.5))
            }
            .padding(Theme.Space.m)
            .frame(maxWidth: .infinity, alignment: .leading)
            .cardGlass(radius: Theme.Radius.control)
        }
        .buttonStyle(PressButtonStyle())
    }
}

#Preview("Dark") {
    let world = DemoWorld()
    HomeView()
        .appGround()
        .environment(world)
        .environment(MemberServices(world: world))
        .environment(MemberRouter())
        .preferredColorScheme(.dark)
}
