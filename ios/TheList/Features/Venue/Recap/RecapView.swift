import SwiftUI

// Web `ScreenRecap` — the post-event summary: four stat tiles, the story
// wall (checked-in guests only), the verified-reach headline number, and the
// invoice settle block.
struct RecapView: View {
    @Environment(DemoWorld.self) private var world
    @Environment(VenueRouter.self) private var router

    let eventId: String

    private var event: EventItem? { world.events.first { $0.id == eventId } }
    private var wallGuests: [GuestRow] { event?.guests.filter { $0.state == .checkedIn } ?? [] }

    /// Mirrors `VenueService.verifiedReach(eventId:)` — sum of `instagramFollowers`
    /// for guests with a verified story, computed fresh (never stored).
    private var verifiedReach: Int {
        wallGuests
            .filter { $0.story == .verified }
            .reduce(0) { $0 + (world.applicant(id: $1.applicantId)?.instagramFollowers ?? 0) }
    }

    var body: some View {
        Group {
            if let event { content(event) }
        }
        .appGround()
    }

    private func content(_ event: EventItem) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            Button { router.closeOverlay() } label: {
                HStack(spacing: 4) {
                    AppIcon.arrowLeft.symbol.font(.system(size: 12, weight: .bold))
                    Text("Back").font(Typography.body(10, weight: .medium))
                }
                .foregroundStyle(Theme.inkMute)
            }
            .buttonStyle(.plain)
            .padding(.horizontal, MemberLayout.hInset)
            .padding(.top, 60)

            VStack(alignment: .leading, spacing: 2) {
                Text(event.title)
                    .font(Typography.display(34))
                    .tracking(34 * Typography.displayTracking)
                    .foregroundStyle(Theme.ink)
                Text([event.date, event.time].filter { !$0.isEmpty }.joined(separator: " · "))
                    .font(Typography.body(10, weight: .medium))
                    .foregroundStyle(Theme.inkMute)
            }
            .padding(.horizontal, MemberLayout.hInset)
            .padding(.top, Theme.Space.m)

            HairlineDivider(color: Theme.line2)
                .padding(.horizontal, MemberLayout.hInset)
                .padding(.top, Theme.Space.l)

            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 0) {
                    statTiles(event).padding(.top, Theme.Space.l)

                    if !wallGuests.isEmpty {
                        SectionHead(label: "Stories").padding(.top, Theme.Space.xl).padding(.bottom, Theme.Space.xs)
                        VStack(spacing: 0) {
                            ForEach(wallGuests) { guest in storyRow(guest) }
                        }
                        .padding(.horizontal, MemberLayout.hInset)
                        HairlineDivider(color: Theme.line).padding(.horizontal, MemberLayout.hInset).padding(.top, Theme.Space.xs)
                    }

                    reachBlock.padding(.horizontal, MemberLayout.hInset).padding(.top, Theme.Space.xl)

                    if let invoice = event.invoice {
                        invoiceBlock(invoice).padding(.horizontal, MemberLayout.hInset).padding(.top, Theme.Space.xl)
                    }

                    Color.clear.frame(height: MemberLayout.dockClearance)
                }
            }
        }
    }

    // MARK: Stat tiles

    private func statTiles(_ event: EventItem) -> some View {
        let recap = event.recap
        return VStack(spacing: Theme.Space.s) {
            HStack(spacing: Theme.Space.s) {
                MemberStatTile(value: recap.map { "\($0.confirmed)" } ?? "—", label: "Confirmed")
                MemberStatTile(
                    value: recap.map { "\($0.showed) of \($0.confirmed)" } ?? "—",
                    label: "Showed", ice: true
                )
            }
            HStack(spacing: Theme.Space.s) {
                MemberStatTile(value: recap.map { "\($0.noShows)" } ?? "—", label: "No-shows")
                MemberStatTile(value: recap?.avgRating.map { MemberFormatting.oneDecimal($0) } ?? "—", label: "Avg rating")
            }
        }
        .padding(.horizontal, MemberLayout.hInset)
    }

    // MARK: Story wall

    private func storyRow(_ guest: GuestRow) -> some View {
        let applicant = world.applicant(id: guest.applicantId)
        return VStack(alignment: .leading, spacing: 0) {
            HStack(spacing: Theme.Space.m) {
                VenuePhoto(key: applicant?.photoName ?? "")
                    .frame(width: 40, height: 40)
                    .clipShape(Circle())
                VStack(alignment: .leading, spacing: Theme.Space.xs) {
                    HStack(spacing: Theme.Space.s) {
                        Text(applicant?.name ?? "—")
                            .font(Typography.body(14, weight: .medium))
                            .foregroundStyle(Theme.ink)
                        if let story = guest.story, let label = story.venueRecapLabel {
                            StatusPill(label: label, tone: pillTone(story), showDot: false)
                        }
                    }
                    if guest.story == .verified {
                        HStack(alignment: .top, spacing: Theme.Space.s) {
                            VenuePhoto(key: applicant?.photoName ?? "")
                                .frame(width: 48, height: 48)
                                .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                                .overlay(RoundedRectangle(cornerRadius: 10, style: .continuous).strokeBorder(Theme.line, lineWidth: 1))
                            if let verdict = guest.verdict {
                                HStack(spacing: 4) {
                                    Text("\(verdict.score)").font(Typography.number(11))
                                    Text("· \(verdict.reason)").font(Typography.body(11, weight: .regular))
                                }
                                .foregroundStyle(Theme.inkMute)
                            }
                        }
                        .padding(.top, Theme.Space.xs)
                    }
                }
            }
            .padding(.vertical, Theme.Space.s)
        }
    }

    private func pillTone(_ story: StoryStatus) -> StatusPill.Tone {
        switch story {
        case .verified: return .ice
        case .due: return .outline
        default: return .neutral
        }
    }

    // MARK: Verified reach

    private var reachBlock: some View {
        VStack(alignment: .leading, spacing: Theme.Space.s) {
            Text("Verified reach")
                .font(Typography.body(10, weight: .medium))
                .foregroundStyle(Theme.inkMute)
            if verifiedReach > 0 {
                Text(VenueFormatting.reach(verifiedReach))
                    .font(Typography.display(52))
                    .tracking(52 * Typography.displayTracking)
                    .foregroundStyle(Theme.ice)
            } else {
                Text("No verified stories yet")
                    .font(Typography.body(15, weight: .regular))
                    .foregroundStyle(Theme.inkMute)
            }
        }
    }

    // MARK: Invoice

    private func invoiceBlock(_ invoice: Invoice) -> some View {
        VStack(alignment: .leading, spacing: Theme.Space.m) {
            Text("Invoice").font(Typography.body(10, weight: .medium)).foregroundStyle(Theme.inkMute)
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(invoice.bundleName).font(Typography.body(18, weight: .bold)).foregroundStyle(Theme.ink)
                    Text("$\(invoice.price)").font(Typography.number(22)).foregroundStyle(Theme.ink)
                }
                Spacer()
                StatusPill(
                    label: invoice.status == .paid ? "Paid" : "Due",
                    tone: invoice.status == .paid ? .neutral : .outline,
                    showDot: false
                )
            }
            if invoice.status != .paid {
                HairlineDivider(color: Theme.line)
                Text(Copy.settleLine).font(Typography.body(12, weight: .regular)).foregroundStyle(Theme.ink2)
                Text(Copy.settleContactLine).font(Typography.body(12, weight: .regular)).foregroundStyle(Theme.inkMute)
            }
        }
        .padding(Theme.Space.l)
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardGlass(radius: Theme.Radius.control)
    }
}

#Preview("Dark") {
    let world = DemoWorld()
    RecapView(eventId: "bath")
        .environment(world)
        .environment(VenueServices(world: world))
        .environment(VenueRouter())
        .preferredColorScheme(.dark)
}
