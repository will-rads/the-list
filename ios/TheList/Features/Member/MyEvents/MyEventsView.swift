import SwiftUI

// Web `ScreenMyEvents` (the Invites tab) — status stat tiles + a segmented control
// over four segments: Confirmed (ticket card + Brief), Applied (still under review,
// picked rows jump to the takeover), Saved (bookmarks), and Past (the story axis —
// "Upload your Story" loud, Verified with score, quiet greys, cancelled no-strike).
struct MyEventsView: View {
    @Environment(DemoWorld.self) private var world
    @Environment(MemberServices.self) private var services
    @Environment(MemberRouter.self) private var router

    @State private var seg: MyEventsSegment

    init(initialSegment: MyEventsSegment?) {
        _seg = State(initialValue: initialSegment ?? .confirmed)
    }

    private var appliedRows: [MyEventRow] { world.myEvents.filter { $0.state.isInAppliedSegment } }
    private var confirmedRows: [MyEventRow] { world.myEvents.filter { $0.state == .confirmed } }
    private var pastRows: [MyEventRow] { world.myEvents.filter { $0.state.isInPastSegment } }
    private var savedEvents: [EventItem] { world.events.filter { router.saved.contains($0.id) } }

    private func event(_ id: String) -> EventItem? { world.events.first { $0.id == id } }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 0) {
                header
                statTiles.padding(.horizontal, MemberLayout.hInset).padding(.top, Theme.Space.l)
                segmented.padding(.horizontal, MemberLayout.hInset).padding(.top, Theme.Space.l)

                segmentContent
                    .padding(.horizontal, MemberLayout.hInset)
                    .padding(.top, Theme.Space.l)

                Color.clear.frame(height: MemberLayout.dockClearance)
            }
            .padding(.top, 60)
        }
    }

    // MARK: Header + tiles + segmented

    private var header: some View {
        HStack(alignment: .center) {
            Text("Invites")
                .font(Typography.display(36))
                .tracking(36 * Typography.displayTracking)
                .foregroundStyle(Theme.ink)
                .shadow(color: Theme.textShadow, radius: 20)
            Spacer()
            GlassIconButton(icon: .calendar) {
                router.toast("Calendar sync coming in the build")
            }
        }
        .padding(.horizontal, MemberLayout.hInset)
    }

    private var statTiles: some View {
        HStack(spacing: Theme.Space.s) {
            MemberStatTile(value: "\(appliedRows.count)", label: "Applied") { seg = .applied }
            MemberStatTile(value: "\(confirmedRows.count)", label: "Confirmed", ice: true) { seg = .confirmed }
            MemberStatTile(value: "\(pastRows.count)", label: "Past") { seg = .past }
        }
    }

    private var segmented: some View {
        SegmentedControl(
            items: [
                .init(id: .applied, label: "Applied", count: appliedRows.count),
                .init(id: .confirmed, label: "Confirmed", count: confirmedRows.count),
                .init(id: .saved, label: "Saved", count: savedEvents.count),
                .init(id: .past, label: "Past", count: pastRows.count),
            ],
            selection: $seg
        )
    }

    @ViewBuilder
    private var segmentContent: some View {
        switch seg {
        case .confirmed:
            ConfirmedSegment(row: confirmedRows.first, event: confirmedRows.first.flatMap { event($0.eventId) })
        case .applied:
            AppliedSegment(rows: appliedRows, event: { self.event($0) })
        case .saved:
            SavedSegment(events: savedEvents)
        case .past:
            PastSegment(rows: pastRows, event: { self.event($0) })
        }
    }
}

// MARK: - Confirmed

private struct ConfirmedSegment: View {
    @Environment(MemberRouter.self) private var router
    let row: MyEventRow?
    let event: EventItem?

    var body: some View {
        if let event {
            VStack(alignment: .leading, spacing: Theme.Space.l) {
                VStack(spacing: 0) {
                    ZStack(alignment: .bottomLeading) {
                        VenuePhoto(key: event.imageName)
                            .frame(height: 160).frame(maxWidth: .infinity).clipped()
                        MemberPalette.confirmedScrim
                        VStack(alignment: .leading, spacing: 2) {
                            Text(event.title)
                                .font(Typography.body(22, weight: .bold))
                                .tracking(22 * Typography.displayTracking)
                                .foregroundStyle(MemberPalette.onPhoto)
                            Text("\(event.venueName) · \(event.date)")
                                .font(Typography.body(11, weight: .regular))
                                .foregroundStyle(MemberPalette.onPhoto.opacity(0.8))
                        }
                        .padding(Theme.Space.m)
                    }
                    .overlay(alignment: .topLeading) {
                        StatusPill(label: ApplicationState.confirmed.memberLabel, tone: .ice).padding(Theme.Space.m)
                    }

                    HStack(spacing: Theme.Space.m) {
                        let parts = MemberFormatting.parseDate(event.date)
                        DateChip(day: parts.day, month: parts.month, ice: true)
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Check-in")
                                .font(Typography.body(10, weight: .medium)).foregroundStyle(Theme.inkMute)
                            Text(event.time)
                                .font(Typography.number(13)).foregroundStyle(Theme.ink)
                        }
                        Spacer(minLength: Theme.Space.s)
                        Button { router.openPass(event.id) } label: {
                            HStack(spacing: 6) {
                                Text("View pass").font(Typography.body(11, weight: .medium))
                                AppIcon.arrowRight.symbol.font(.system(size: 12, weight: .semibold))
                            }
                            .foregroundStyle(Theme.bg)
                            .padding(.horizontal, Theme.Space.m).frame(height: 36)
                            .background(Capsule().fill(Theme.ink))
                        }
                        .buttonStyle(PressButtonStyle())
                    }
                    .padding(Theme.Space.m)
                }
                .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.tile, style: .continuous))
                .cardGlass(radius: Theme.Radius.tile)

                if let brief = event.brief { BriefBlock(brief: brief) }
            }
        } else {
            EmptyNote("No confirmed seats yet. Apply to a room, then watch for the pick.")
        }
    }
}

// MARK: - Applied

private struct AppliedSegment: View {
    @Environment(MemberRouter.self) private var router
    let rows: [MyEventRow]
    let event: (String) -> EventItem?

    var body: some View {
        if rows.isEmpty {
            EmptyNote("Nothing under review.")
        } else {
            VStack(alignment: .leading, spacing: Theme.Space.l) {
                ForEach(rows) { row in
                    if let ev = event(row.eventId) {
                        Button {
                            if row.state == .picked { router.openPicked(row.eventId) }
                            else { router.openEventDetail(row.eventId) }
                        } label: {
                            HStack(spacing: Theme.Space.m) {
                                VenuePhoto(key: ev.imageName)
                                    .frame(width: 56, height: 56)
                                    .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(ev.title)
                                        .font(Typography.display(16))
                                        .tracking(16 * Typography.displayTracking)
                                        .foregroundStyle(Theme.ink)
                                    Text("\(ev.venueName) · \(ev.date)")
                                        .font(Typography.body(11, weight: .regular))
                                        .foregroundStyle(Theme.inkMute)
                                    StatusPill(
                                        label: row.statusLabel(),
                                        tone: row.state == .picked ? .ice : .outline
                                    )
                                    .padding(.top, 4)
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
                Text("Venues pick applicants up to doors. We notify you if you're in. Not every application is picked.")
                    .font(Typography.body(12, weight: .regular))
                    .foregroundStyle(Theme.inkMute)
                    .shadow(color: Theme.textShadow, radius: 8, y: 1)
            }
        }
    }
}

// MARK: - Saved

private struct SavedSegment: View {
    @Environment(MemberRouter.self) private var router
    let events: [EventItem]

    var body: some View {
        if events.isEmpty {
            VStack(spacing: Theme.Space.m) {
                AppIcon.bookmark.symbol
                    .font(.system(size: 18, weight: .regular))
                    .foregroundStyle(Theme.ink)
                    .frame(width: 48, height: 48)
                    .overlay(Circle().strokeBorder(Theme.line2, lineWidth: 1))
                Text("Nothing saved yet")
                    .font(Typography.body(14, weight: .bold)).foregroundStyle(Theme.ink)
                Text("Tap the bookmark on any room to keep it here.")
                    .font(Typography.body(13, weight: .regular)).foregroundStyle(Theme.inkMute)
                    .shadow(color: Theme.textShadow, radius: 8, y: 1)
            }
            .frame(maxWidth: .infinity).padding(.vertical, 64)
        } else {
            VStack(spacing: Theme.Space.m) {
                ForEach(events) { ev in
                    HStack(spacing: Theme.Space.m) {
                        Button { router.openEventDetail(ev.id) } label: {
                            HStack(spacing: Theme.Space.m) {
                                VenuePhoto(key: ev.imageName)
                                    .frame(width: 56, height: 64)
                                    .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(ev.type)
                                        .font(Typography.body(10, weight: .medium)).foregroundStyle(Theme.inkMute)
                                    Text(ev.title)
                                        .font(Typography.display(17))
                                        .tracking(17 * Typography.displayTracking)
                                        .foregroundStyle(Theme.ink)
                                    Text("\(ev.venueName) · \(ev.area)")
                                        .font(Typography.body(11, weight: .regular))
                                        .foregroundStyle(Theme.inkMute).lineLimit(1)
                                    HStack(spacing: 3) {
                                        Text("\(ev.seats) seats").foregroundStyle(Theme.ice)
                                        Text("· \(ev.date)").foregroundStyle(Theme.inkMute)
                                    }
                                    .font(Typography.number(11)).padding(.top, 2)
                                }
                                Spacer(minLength: Theme.Space.s)
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                        }
                        .buttonStyle(PressButtonStyle())
                        SaveButton(saved: true) { router.toggleSave(ev.id) }
                    }
                    .padding(Theme.Space.m)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .cardGlass(radius: Theme.Radius.control)
                }
            }
        }
    }
}

// MARK: - Past

private struct PastSegment: View {
    @Environment(MemberRouter.self) private var router
    let rows: [MyEventRow]
    let event: (String) -> EventItem?

    var body: some View {
        VStack(spacing: Theme.Space.m) {
            ForEach(rows) { row in
                if let ev = event(row.eventId) {
                    if isStoryDue(row) {
                        storyDueCard(row: row, event: ev)
                    } else {
                        calmRow(row: row, event: ev)
                    }
                }
            }
        }
    }

    private func isStoryDue(_ row: MyEventRow) -> Bool {
        row.state == .checkedIn && (row.story == .due || row.story == .rejected)
    }

    private func storyDueCard(row: MyEventRow, event ev: EventItem) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(spacing: Theme.Space.m) {
                VenuePhoto(key: ev.imageName)
                    .frame(width: 56, height: 56)
                    .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                VStack(alignment: .leading, spacing: 2) {
                    Text(ev.title)
                        .font(Typography.display(16))
                        .tracking(16 * Typography.displayTracking)
                        .foregroundStyle(Theme.ink)
                    Text("\(ev.venueName) · \(ev.date)")
                        .font(Typography.body(11, weight: .regular))
                        .foregroundStyle(Theme.inkMute)
                    StatusPill(
                        label: (row.story ?? .due).memberLabel,
                        tone: row.story == .rejected ? .outline : .ice
                    )
                    .padding(.top, 4)
                }
                Spacer(minLength: Theme.Space.s)
            }
            if row.story == .rejected, let reason = row.verdict?.reason {
                Text(reason)
                    .font(Typography.body(11, weight: .regular))
                    .foregroundStyle(Theme.inkMute)
                    .padding(.top, 10)
            }
            Button { router.present(.story(ev.id)) } label: {
                HStack(spacing: Theme.Space.s) {
                    Text("Upload your Story").font(Typography.body(12, weight: .semibold))
                    AppIcon.arrowRight.symbol.font(.system(size: 14, weight: .semibold))
                }
                .foregroundStyle(Theme.iceInk)
                .frame(maxWidth: .infinity).frame(height: 44)
                .background(Capsule().fill(Theme.ice))
            }
            .buttonStyle(PressButtonStyle())
            .padding(.top, Theme.Space.m)
        }
        .padding(Theme.Space.m)
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardGlass(radius: Theme.Radius.control)
        .overlay(
            RoundedRectangle(cornerRadius: Theme.Radius.control, style: .continuous)
                .strokeBorder(Theme.line2, lineWidth: 1)
        )
    }

    private func calmRow(row: MyEventRow, event ev: EventItem) -> some View {
        let quiet = row.state.isQuiet
        return HStack(spacing: Theme.Space.m) {
            VenuePhoto(key: ev.imageName)
                .frame(width: 56, height: 56)
                .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                .grayscale(quiet ? 1 : 0.25)
            VStack(alignment: .leading, spacing: 2) {
                Text(ev.title)
                    .font(Typography.display(16))
                    .tracking(16 * Typography.displayTracking)
                    .foregroundStyle(Theme.ink)
                Text("\(ev.venueName) · \(ev.date)")
                    .font(Typography.body(11, weight: .regular))
                    .foregroundStyle(Theme.inkMute)
                if let note = row.state.memberDetailNote {
                    Text(note)
                        .font(Typography.body(11, weight: .regular))
                        .foregroundStyle(Theme.inkMute)
                        .padding(.top, 2)
                }
            }
            Spacer(minLength: Theme.Space.s)
            VStack(alignment: .trailing, spacing: 4) {
                if row.state == .checkedIn, let story = row.story {
                    StatusPill(label: story.memberLabel,
                               tone: story == .verified ? .ice : .outline,
                               showDot: story == .verified)
                    if story == .verified, let score = row.verdict?.score {
                        Text(MemberFormatting.oneDecimal(Double(score) / 10))
                            .font(Typography.number(18)).foregroundStyle(Theme.ice)
                    }
                } else {
                    StatusPill(label: row.state.memberLabel, tone: quiet ? .outline : .neutral, showDot: false)
                }
            }
        }
        .padding(Theme.Space.m)
        .frame(maxWidth: .infinity, alignment: .leading)
        .opacity(quiet ? 0.6 : 1)
        .cardGlass(radius: Theme.Radius.control)
    }
}

// MARK: - Shared empty note

private struct EmptyNote: View {
    let text: String
    init(_ text: String) { self.text = text }
    var body: some View {
        Text(text)
            .font(Typography.body(13, weight: .regular))
            .foregroundStyle(Theme.inkMute)
            .shadow(color: Theme.textShadow, radius: 8, y: 1)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.top, Theme.Space.l)
    }
}

#Preview("Dark") {
    let world = DemoWorld()
    MyEventsView(initialSegment: .past)
        .appGround()
        .environment(world)
        .environment(MemberServices(world: world))
        .environment(MemberRouter())
        .preferredColorScheme(.dark)
}
