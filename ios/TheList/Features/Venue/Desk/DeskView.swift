import SwiftUI

// Web `ScreenDesk` — the stage-driven venue dashboard: tonight's locked room
// (if any), "Needs attention" (open rooms with unswiped applicants, locked
// rooms with an expired/declined pick), the desk stat tiles, upcoming drafts,
// and a teaser for the most recently closed night's recap.
struct DeskView: View {
    @Environment(DemoWorld.self) private var world
    @Environment(VenueRouter.self) private var router

    private var venue: VenueProfile { world.venueProfile }
    private var events: [EventItem] { world.venueManagedEvents() }

    private var tonightEvent: EventItem? {
        events.first { $0.stage == .locked && $0.date == DemoWorld.today }
    }
    private var openEvents: [EventItem] { events.filter { $0.stage == .open } }
    private var drafts: [EventItem] { events.filter { $0.stage == .draft } }
    private var recapEvent: EventItem? {
        events.filter { $0.stage == .past && $0.recap != nil }
            .sorted { ($0.endedAt ?? 0) > ($1.endedAt ?? 0) }
            .first
    }

    private var attentionRows: [AttentionRow] {
        var rows: [AttentionRow] = []
        for event in openEvents where event.guests.contains(where: { $0.state == .applied }) {
            let n = event.guests.filter { $0.state == .applied }.count
            rows.append(AttentionRow(id: "open-\(event.id)", sublabel: nil,
                                      label: "\(event.title) · \(n) to review →", eventId: event.id))
        }
        for event in events where event.stage == .locked && event.guests.contains(where: { $0.state == .expired || $0.state == .declined }) {
            let hasExpired = event.guests.contains { $0.state == .expired }
            let hasDeclined = event.guests.contains { $0.state == .declined }
            let suffix = (hasExpired && hasDeclined) ? "picks need replacing"
                : hasDeclined ? "a pick declined" : "a pick expired"
            rows.append(AttentionRow(id: "locked-\(event.id)", sublabel: "\(event.title) — \(suffix)",
                                      label: "Pick a replacement", eventId: event.id))
        }
        return rows
    }

    private var appliedTotal: Int { openEvents.reduce(0) { $0 + $1.appliedTotal } }
    private var toReview: Int { openEvents.reduce(0) { $0 + $1.guests.filter { $0.state == .applied }.count } }
    private var tonightConfirmed: Int { tonightEvent?.guests.filter { $0.state == .confirmed }.count ?? 0 }
    private var tonightWaitlist: Int { tonightEvent?.guests.filter { $0.state == .waitlisted }.count ?? 0 }
    private var roomsTonight: Int { events.filter { $0.stage == .locked && $0.date == DemoWorld.today }.count }
    private var firstOpenEvent: EventItem? { openEvents.first }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 0) {
                header

                if let tonightEvent { tonightCard(tonightEvent).padding(.horizontal, MemberLayout.hInset).padding(.top, Theme.Space.xl) }

                if !attentionRows.isEmpty {
                    SectionHead(label: "Needs attention").padding(.top, 28).padding(.bottom, Theme.Space.m)
                    VStack(spacing: Theme.Space.s) {
                        ForEach(attentionRows) { row in attentionRow(row) }
                    }
                    .padding(.horizontal, MemberLayout.hInset)
                }

                SectionHead(label: "The desk").padding(.top, 28).padding(.bottom, Theme.Space.m)
                statGrid.padding(.horizontal, MemberLayout.hInset)

                SectionHead(label: "Upcoming rooms", right: "\(drafts.count) draft").padding(.top, 32).padding(.bottom, Theme.Space.m)
                draftsSection.padding(.horizontal, MemberLayout.hInset)

                Button { router.openPostWizard() } label: {
                    HStack(spacing: Theme.Space.s) {
                        Text("+").font(Typography.body(15, weight: .semibold))
                        Text("New room").font(Typography.body(12, weight: .medium))
                    }
                    .foregroundStyle(Theme.ink)
                    .frame(maxWidth: .infinity)
                    .frame(height: 52)
                    .overlay(Capsule().strokeBorder(Theme.line2, lineWidth: 1))
                }
                .buttonStyle(PressButtonStyle())
                .padding(.horizontal, MemberLayout.hInset)
                .padding(.top, Theme.Space.l)

                if let recapEvent {
                    SectionHead(label: "Last recap").padding(.top, Theme.Space.l).padding(.bottom, Theme.Space.m)
                    recapTeaser(recapEvent).padding(.horizontal, MemberLayout.hInset)
                }

                Color.clear.frame(height: MemberLayout.dockClearance)
            }
            .padding(.top, 60)
        }
    }

    // MARK: Header

    private var header: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack {
                Text("The List · Venues")
                    .font(Typography.body(14, weight: .bold))
                    .foregroundStyle(Theme.ink)
                Spacer()
                GlassIconButton(icon: .bell, badge: world.venueNotifications().count) {
                    router.present(.notifications)
                }
            }
            HStack(alignment: .lastTextBaseline) {
                Text("Tonight")
                    .font(Typography.display(40))
                    .tracking(40 * Typography.displayTracking)
                    .foregroundStyle(Theme.ink)
                    .shadow(color: Theme.textShadow, radius: 20)
                Spacer()
                Text("Sun · 25.05")
                    .font(Typography.number(12))
                    .foregroundStyle(Theme.ink)
            }
            .padding(.top, 2)
            HStack(spacing: 6) {
                AppIcon.mapPin.symbol.font(.system(size: 12, weight: .medium))
                Text("\(venue.name) · \(venue.area)").font(Typography.body(12, weight: .regular))
            }
            .foregroundStyle(Theme.ink)
            .padding(.top, Theme.Space.xs)
        }
        .padding(.horizontal, MemberLayout.hInset)
    }

    // MARK: Tonight card

    private func tonightCard(_ event: EventItem) -> some View {
        Button { router.selectTab(.door) } label: {
            ZStack(alignment: .bottomLeading) {
                VenuePhoto(key: event.imageName).frame(height: 220).frame(maxWidth: .infinity).clipped()
                LinearGradient(colors: [.black.opacity(0.22), .black.opacity(0.85)], startPoint: .top, endPoint: .bottom)

                VStack(alignment: .leading, spacing: 0) {
                    StatusPill(label: "Tonight", tone: .ice, showDot: true)
                    Text(event.title)
                        .font(Typography.display(30))
                        .tracking(30 * Typography.displayTracking)
                        .foregroundStyle(MemberPalette.onPhoto)
                        .padding(.top, Theme.Space.l)
                    Text("\(tonightConfirmed) confirmed · \(tonightWaitlist) waitlist")
                        .font(Typography.body(12, weight: .regular))
                        .foregroundStyle(MemberPalette.onPhoto.opacity(0.85))
                        .padding(.top, Theme.Space.xs)

                    HStack(spacing: Theme.Space.s) {
                        Text("Door").font(Typography.body(12, weight: .semibold))
                        AppIcon.arrowRight.symbol.font(.system(size: 14, weight: .semibold))
                    }
                    .foregroundStyle(Theme.iceInk)
                    .frame(maxWidth: .infinity)
                    .frame(height: 48)
                    .background(Capsule().fill(Theme.ice))
                    .shadow(color: Theme.iceGlow, radius: 10)
                    .padding(.top, Theme.Space.l)
                }
                .padding(Theme.Space.l)
            }
            .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.tile, style: .continuous))
            .cardGlass(radius: Theme.Radius.tile)
        }
        .buttonStyle(PressButtonStyle())
    }

    // MARK: Needs attention

    private struct AttentionRow: Identifiable {
        let id: String
        let sublabel: String?
        let label: String
        let eventId: String
    }

    private func attentionRow(_ row: AttentionRow) -> some View {
        Button { router.openReviewDeck(row.eventId) } label: {
            HStack(spacing: Theme.Space.m) {
                Circle().fill(Theme.ice).frame(width: 6, height: 6)
                VStack(alignment: .leading, spacing: 2) {
                    if let sublabel = row.sublabel {
                        Text(sublabel).font(Typography.body(11, weight: .regular)).foregroundStyle(Theme.inkMute)
                    }
                    Text(row.label).font(Typography.body(13, weight: .medium)).foregroundStyle(Theme.ink)
                }
                Spacer(minLength: Theme.Space.s)
                AppIcon.arrowRight.symbol.font(.system(size: 14, weight: .semibold)).foregroundStyle(Theme.ink.opacity(0.6))
            }
            .padding(Theme.Space.m)
            .frame(maxWidth: .infinity, alignment: .leading)
            .cardGlass(radius: Theme.Radius.control)
        }
        .buttonStyle(PressButtonStyle())
    }

    // MARK: Stat grid

    private var statGrid: some View {
        VStack(spacing: Theme.Space.s) {
            HStack(spacing: Theme.Space.s) {
                MemberStatTile(value: "\(appliedTotal)", label: "Applied") {
                    if let firstOpenEvent { router.openReviewDeck(firstOpenEvent.id) }
                }
                MemberStatTile(value: "\(toReview)", label: "To review") {
                    if let firstOpenEvent { router.openReviewDeck(firstOpenEvent.id) }
                }
            }
            HStack(spacing: Theme.Space.s) {
                MemberStatTile(value: "\(tonightConfirmed)", label: "Confirmed", ice: true) {
                    if let tonightEvent { router.present(.guestList(tonightEvent.id)) }
                }
                MemberStatTile(value: "\(roomsTonight)", label: "Rooms tonight")
            }
        }
    }

    // MARK: Drafts

    @ViewBuilder
    private var draftsSection: some View {
        if drafts.isEmpty {
            Text("Nothing scheduled. Post a room.")
                .font(Typography.body(13, weight: .regular))
                .foregroundStyle(Theme.ink)
                .frame(maxWidth: .infinity)
                .padding(.vertical, Theme.Space.xl)
                .cardGlass(radius: Theme.Radius.control)
        } else {
            VStack(spacing: Theme.Space.s) {
                ForEach(drafts) { draft in draftRow(draft) }
            }
        }
    }

    private func draftRow(_ event: EventItem) -> some View {
        let parts = MemberFormatting.parseDate(event.date)
        return Button { router.openPostWizard(editing: event.id) } label: {
            HStack(spacing: Theme.Space.m) {
                DateChip(day: parts.day, month: parts.month)
                VStack(alignment: .leading, spacing: 2) {
                    Text(event.title)
                        .font(Typography.display(17))
                        .tracking(17 * Typography.displayTracking)
                        .foregroundStyle(Theme.ink)
                        .lineLimit(1)
                    Text("\(event.time) · \(event.seats) seats")
                        .font(Typography.body(11, weight: .regular))
                        .foregroundStyle(Theme.ink)
                }
                Spacer(minLength: Theme.Space.s)
                StatusPill(label: "Draft", tone: .outline, showDot: false)
            }
            .padding(Theme.Space.m)
            .frame(maxWidth: .infinity, alignment: .leading)
            .cardGlass(radius: Theme.Radius.control)
        }
        .buttonStyle(PressButtonStyle())
    }

    // MARK: Recap teaser

    private func recapTeaser(_ event: EventItem) -> some View {
        let recap = event.recap
        let verifiedCount = event.guests.filter { $0.story == .verified }.count
        return Button { router.openRecap(event.id) } label: {
            HStack(spacing: Theme.Space.m) {
                VStack(alignment: .leading, spacing: 2) {
                    Text(event.title)
                        .font(Typography.display(17))
                        .tracking(17 * Typography.displayTracking)
                        .foregroundStyle(Theme.ink)
                        .lineLimit(1)
                    Text("\(recap?.showed ?? 0) of \(recap?.confirmed ?? 0) showed · \(verifiedCount) stories verified")
                        .font(Typography.body(12, weight: .regular))
                        .foregroundStyle(Theme.ink)
                }
                Spacer(minLength: Theme.Space.s)
                HStack(spacing: 4) {
                    Text("Recap").font(Typography.body(12, weight: .medium))
                    AppIcon.arrowRight.symbol.font(.system(size: 13, weight: .semibold))
                }
                .foregroundStyle(Theme.ice)
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
    DeskView()
        .appGround()
        .environment(world)
        .environment(VenueServices(world: world))
        .environment(VenueRouter())
        .preferredColorScheme(.dark)
}
