import SwiftUI

// Web `ScreenEvents` — the events dashboard: a segmented control over stage
// (Open / Locked / Drafts / Past, Past folding in Cancelled), a card per event
// with a stage-specific action, and a pinned "Post an event" CTA.
struct EventsListView: View {
    @Environment(DemoWorld.self) private var world
    @Environment(VenueServices.self) private var services
    @Environment(VenueRouter.self) private var router

    private enum Segment: String, Hashable { case open, locked, draft, past }

    @State private var segment: Segment = .open

    private var events: [EventItem] { world.venueManagedEvents() }

    private func count(_ segment: Segment) -> Int {
        events.filter { matches($0, segment) }.count
    }

    private func matches(_ event: EventItem, _ segment: Segment) -> Bool {
        switch segment {
        case .open:   return event.stage == .open
        case .locked: return event.stage == .locked
        case .draft:  return event.stage == .draft
        case .past:   return event.stage == .past || event.stage == .cancelled
        }
    }

    private var visible: [EventItem] { events.filter { matches($0, segment) } }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Text("Events")
                .font(Typography.display(40))
                .tracking(40 * Typography.displayTracking)
                .foregroundStyle(Theme.ink)
                .padding(.horizontal, MemberLayout.hInset)
                .padding(.top, 60)
                .padding(.bottom, Theme.Space.m)

            HairlineDivider(dotted: true, color: Theme.line2)
                .padding(.horizontal, MemberLayout.hInset)
                .padding(.bottom, Theme.Space.l)

            SegmentedControl(
                items: [
                    .init(id: Segment.open, label: "Open", count: count(.open)),
                    .init(id: Segment.locked, label: "Locked", count: count(.locked)),
                    .init(id: Segment.draft, label: "Drafts", count: count(.draft)),
                    .init(id: Segment.past, label: "Past", count: count(.past)),
                ],
                selection: $segment
            )
            .padding(.horizontal, MemberLayout.hInset)
            .padding(.bottom, Theme.Space.l)

            ScrollView(showsIndicators: false) {
                if visible.isEmpty {
                    Text(emptyText)
                        .font(Typography.body(13, weight: .medium))
                        .foregroundStyle(Theme.inkMute)
                        .frame(maxWidth: .infinity)
                        .padding(.top, 100)
                } else {
                    VStack(spacing: Theme.Space.m) {
                        ForEach(visible) { event in row(event) }
                    }
                    .padding(.horizontal, MemberLayout.hInset)
                }
                Color.clear.frame(height: MemberLayout.dockClearance)
            }

            postCTA
                .padding(.horizontal, MemberLayout.hInset)
                .padding(.bottom, Theme.Space.l)
                .padding(.top, Theme.Space.s)
        }
    }

    private var emptyText: String {
        switch segment {
        case .open:   return "No open events"
        case .locked: return "No locked events"
        case .draft:  return "No drafts"
        case .past:   return "No past events"
        }
    }

    // MARK: Event row

    private func row(_ event: EventItem) -> some View {
        VStack(spacing: 0) {
            HStack(alignment: .top, spacing: Theme.Space.m) {
                VenuePhoto(key: event.imageName)
                    .aspectRatio(4.0 / 5.0, contentMode: .fill)
                    .frame(width: 56)
                    .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))

                VStack(alignment: .leading, spacing: 2) {
                    Text(event.title.isEmpty ? "Untitled" : event.title)
                        .font(Typography.body(18, weight: .bold))
                        .foregroundStyle(Theme.ink)
                        .lineLimit(1)
                    Text("\(event.type) · \(event.date) · \(event.time)")
                        .font(Typography.body(11, weight: .regular))
                        .foregroundStyle(Theme.inkMute)
                        .lineLimit(1)
                    if event.stage == .open, let closesAt = event.closesAt {
                        Text("Closes \(closesAt)")
                            .font(Typography.body(11, weight: .regular))
                            .foregroundStyle(Theme.inkMute)
                    }
                    if event.stage == .open {
                        Text("\(event.appliedTotal) applied")
                            .font(Typography.number(11))
                            .foregroundStyle(Theme.inkMute)
                    }
                    if let mix = event.mix {
                        Text("Girls \(mix.girls) · Guys \(mix.guys)")
                            .font(Typography.body(10, weight: .regular))
                            .foregroundStyle(Theme.inkMute)
                    } else {
                        Text("\(event.seats) seats")
                            .font(Typography.body(10, weight: .regular))
                            .foregroundStyle(Theme.inkMute)
                    }
                }
                Spacer(minLength: Theme.Space.s)
                stagePill(event.stage)
            }
            .padding(Theme.Space.m)

            HStack {
                actionButton(event)
                Spacer()
                if event.stage == .open || event.stage == .locked {
                    Button { cancel(event) } label: {
                        Text("Cancel event")
                            .font(Typography.body(11, weight: .regular))
                            .foregroundStyle(Theme.inkMute)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal, Theme.Space.m)
            .padding(.bottom, Theme.Space.m)
        }
        .background(RoundedRectangle(cornerRadius: Theme.Radius.control, style: .continuous).fill(Theme.elev))
        .overlay(RoundedRectangle(cornerRadius: Theme.Radius.control, style: .continuous).strokeBorder(Theme.line, lineWidth: 1))
        .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.control, style: .continuous))
    }

    @ViewBuilder
    private func actionButton(_ event: EventItem) -> some View {
        switch event.stage {
        case .open:
            rowAction("Review applicants") { router.openReviewDeck(event.id) }
        case .locked:
            rowAction("Guest list") { router.present(.guestList(event.id)) }
        case .draft:
            rowAction("Edit") { router.openPostWizard(editing: event.id) }
        case .past:
            rowAction("Recap") { router.openRecap(event.id) }
        case .cancelled:
            Text("Cancelled").font(Typography.body(11, weight: .regular)).foregroundStyle(Theme.inkMute)
        }
    }

    private func rowAction(_ title: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 4) {
                Text(title).font(Typography.body(12, weight: .semibold))
                AppIcon.arrowRight.symbol.font(.system(size: 13, weight: .semibold))
            }
            .foregroundStyle(Theme.ice)
        }
        .buttonStyle(.plain)
    }

    private func stagePill(_ stage: EventStage) -> some View {
        switch stage {
        case .open:      return StatusPill(label: stage.venueLabel, tone: .ice, showDot: true)
        case .locked:    return StatusPill(label: stage.venueLabel, tone: .outline, showDot: false)
        case .draft:     return StatusPill(label: stage.venueLabel, tone: .outline, showDot: false)
        case .cancelled: return StatusPill(label: stage.venueLabel, tone: .neutral, showDot: false)
        case .past:      return StatusPill(label: stage.venueLabel, tone: .neutral, showDot: false)
        }
    }

    // MARK: Post CTA

    private var postCTA: some View {
        Button { router.openPostWizard() } label: {
            HStack(spacing: Theme.Space.s) {
                Text("Post an event").font(Typography.body(14, weight: .semibold))
                AppIcon.arrowRight.symbol.font(.system(size: 16, weight: .semibold))
            }
            .foregroundStyle(Theme.iceInk)
            .frame(maxWidth: .infinity)
            .frame(height: 52)
            .background(Capsule().fill(Theme.ice))
            .shadow(color: Theme.iceGlow, radius: 12)
        }
        .buttonStyle(PressButtonStyle())
    }

    // MARK: Actions

    private func cancel(_ event: EventItem) {
        router.confirm(title: "Cancel this event?", body: Copy.cancelEventBody, confirmLabel: "Cancel event") {
            Task { await services.venue.cancelEvent(eventId: event.id) }
        }
    }
}

#Preview("Dark") {
    let world = DemoWorld()
    EventsListView()
        .appGround()
        .environment(world)
        .environment(VenueServices(world: world))
        .environment(VenueRouter())
        .preferredColorScheme(.dark)
}
