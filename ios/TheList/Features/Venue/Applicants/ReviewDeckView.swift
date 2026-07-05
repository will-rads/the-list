import SwiftUI

// Web `ScreenReview` — the swipe deck: an Open event reviews its `applied`
// pool; a Locked event (replacement mode) reviews its `waitlisted` pool. The
// deck's membership + order is a snapshot taken once at mount (web
// `useMemo(..., [])`); guest-state writes still show up live everywhere else
// (mix counters, Close applications / Cancel).
struct ReviewDeckView: View {
    @Environment(DemoWorld.self) private var world
    @Environment(VenueServices.self) private var services
    @Environment(VenueRouter.self) private var router

    let eventId: String

    @State private var deckPool: [String] = []
    @State private var seeded = false
    @State private var idx = 0
    @State private var canUndo = false
    @State private var sheetTarget: SheetTarget?

    private struct SheetTarget: Identifiable { let id: String }

    private var event: EventItem? { world.events.first { $0.id == eventId } }
    private var isLocked: Bool { event?.stage == .locked }
    private var done: Bool { idx >= deckPool.count }
    private var currentApplicantId: String? { done ? nil : deckPool[idx] }
    private var currentApplicant: ApplicantCard? { currentApplicantId.flatMap { world.applicant(id: $0) } }

    private var pickedOrConfirmed: [GuestRow] {
        event?.guests.filter { $0.state == .picked || $0.state == .confirmed } ?? []
    }
    private var mixGirls: Int { pickedOrConfirmed.filter { world.applicant(id: $0.applicantId)?.gender == "female" }.count }
    private var mixGuys: Int { pickedOrConfirmed.filter { world.applicant(id: $0.applicantId)?.gender == "male" }.count }

    var body: some View {
        Group {
            if let event {
                content(event)
            }
        }
        .appGround()
        .task { seedDeckIfNeeded() }
        .sheet(item: $sheetTarget) { target in
            if let applicant = world.applicant(id: target.id) {
                ApplicantSheet(applicant: applicant) { yes in
                    sheetTarget = nil
                    decide(yes)
                }
                .memberSheetChrome(detents: [.large])
            }
        }
    }

    private func content(_ event: EventItem) -> some View {
        VStack(spacing: 0) {
            headerRow(event)
            Text(subHeaderText(event))
                .font(Typography.body(10, weight: .medium))
                .foregroundStyle(Theme.inkMute)
                .padding(.top, Theme.Space.xs)

            mixCounter(event).padding(.top, Theme.Space.m)

            if canUndo && !done {
                undoChip.padding(.top, Theme.Space.s)
            }

            if done {
                doneState(event).frame(maxWidth: .infinity, maxHeight: .infinity)
            } else {
                deckContent.frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .padding(.horizontal, MemberLayout.hInset)
        .padding(.top, 64)
        .padding(.bottom, Theme.Space.l)
    }

    // MARK: Header

    private func headerRow(_ event: EventItem) -> some View {
        HStack {
            Button { router.closeOverlay() } label: {
                Text("Close").font(Typography.body(10, weight: .medium)).foregroundStyle(Theme.inkMute)
            }
            .buttonStyle(.plain)
            Spacer()
            Text(isLocked ? "Pick replacements" : event.title)
                .font(Typography.body(10, weight: .medium))
                .foregroundStyle(Theme.inkMute)
            Spacer()
            if isLocked {
                Color.clear.frame(width: 64, height: 1)
            } else {
                Button(action: closeApplications) {
                    HStack(spacing: 4) {
                        Text("Close applications").font(Typography.body(11, weight: .semibold))
                        AppIcon.arrowRight.symbol.font(.system(size: 12, weight: .bold))
                    }
                    .foregroundStyle(Theme.iceInk)
                    .padding(.horizontal, Theme.Space.m)
                    .frame(height: 32)
                    .background(Capsule().fill(Theme.ice))
                }
                .buttonStyle(PressButtonStyle())
            }
        }
    }

    private func subHeaderText(_ event: EventItem) -> String {
        isLocked
            ? "\(deckPool.count) on the waitlist"
            : "\(event.appliedTotal) applied · \(deckPool.count) to review"
    }

    // MARK: Mix counter

    @ViewBuilder
    private func mixCounter(_ event: EventItem) -> some View {
        if let mix = event.mix {
            HStack(spacing: Theme.Space.m) {
                mixTile("Girls", value: mixGirls, target: mix.girls)
                mixTile("Guys", value: mixGuys, target: mix.guys)
            }
        } else {
            HStack(spacing: 4) {
                Text("Picked").font(Typography.body(12, weight: .regular))
                Text("\(pickedOrConfirmed.count)").font(Typography.number(12)).foregroundStyle(Theme.ice)
                Text("/ \(event.seats)").font(Typography.body(12, weight: .regular))
            }
            .foregroundStyle(Theme.ink)
            .padding(.horizontal, Theme.Space.m)
            .frame(height: 36)
            .background(RoundedRectangle(cornerRadius: 12, style: .continuous).fill(Theme.elev))
        }
    }

    private func mixTile(_ label: String, value: Int, target: Int) -> some View {
        HStack(spacing: 4) {
            Text(label).font(Typography.body(12, weight: .regular))
            Text("\(value)").font(Typography.number(12)).foregroundStyle(Theme.ice)
            Text("/ \(target)").font(Typography.body(12, weight: .regular))
        }
        .foregroundStyle(Theme.ink)
        .frame(maxWidth: .infinity)
        .frame(height: 36)
        .background(RoundedRectangle(cornerRadius: 12, style: .continuous).fill(Theme.elev))
    }

    // MARK: Undo

    private var undoChip: some View {
        HStack {
            Spacer()
            Button(action: undo) {
                HStack(spacing: 6) {
                    AppIcon.arrowLeft.symbol.font(.system(size: 12, weight: .bold))
                    Text("Undo last").font(Typography.body(11, weight: .medium))
                }
                .foregroundStyle(Theme.ink)
                .padding(.horizontal, Theme.Space.m)
                .padding(.vertical, 6)
                .overlay(Capsule().strokeBorder(Theme.line2, lineWidth: 1))
            }
            .buttonStyle(PressButtonStyle())
            Spacer()
        }
    }

    // MARK: Deck

    private var deckContent: some View {
        VStack(spacing: Theme.Space.l) {
            if let currentApplicant {
                // A transparent tap target over everything except the bottom
                // ~88pt social-pill row (web `CARD_LINK_ZONE`), so those links
                // stay tappable while the rest of the card opens the sheet.
                SwipeCard(applicant: currentApplicant)
                    .overlay(alignment: .top) {
                        GeometryReader { proxy in
                            Button {
                                sheetTarget = SheetTarget(id: currentApplicant.id)
                            } label: {
                                Color.clear
                            }
                            .buttonStyle(.plain)
                            .frame(height: max(0, proxy.size.height - 88))
                        }
                    }
            }
            HStack(spacing: Theme.Space.xxl) {
                Button { decide(false) } label: {
                    AppIcon.close.symbol
                        .font(.system(size: 24, weight: .medium))
                        .foregroundStyle(Theme.ink)
                        .frame(width: 64, height: 64)
                        .overlay(Circle().strokeBorder(Theme.line2, lineWidth: 1))
                }
                .buttonStyle(PressButtonStyle())
                Button { decide(true) } label: {
                    AppIcon.check.symbol
                        .font(.system(size: 24, weight: .medium))
                        .foregroundStyle(Theme.iceInk)
                        .frame(width: 64, height: 64)
                        .background(Circle().fill(Theme.ice))
                        .shadow(color: Theme.iceGlow, radius: 14)
                }
                .buttonStyle(PressButtonStyle())
            }
        }
    }

    // MARK: Done state

    @ViewBuilder
    private func doneState(_ event: EventItem) -> some View {
        VStack(spacing: Theme.Space.l) {
            if isLocked {
                Text("No one left on the waitlist.")
                    .font(Typography.display(26))
                    .tracking(26 * Typography.displayTracking)
                    .multilineTextAlignment(.center)
                    .foregroundStyle(Theme.ink)
                Button { router.closeOverlay() } label: {
                    Text("Close").font(Typography.body(13, weight: .medium)).foregroundStyle(Theme.ice)
                }
                .buttonStyle(.plain)
            } else {
                Text("All reviewed")
                    .font(Typography.display(26))
                    .tracking(26 * Typography.displayTracking)
                    .foregroundStyle(Theme.ink)
                Text(event.mix != nil
                     ? "Girls \(mixGirls)/\(event.mix!.girls) · Guys \(mixGuys)/\(event.mix!.guys)"
                     : "Picked \(pickedOrConfirmed.count) of \(event.seats)")
                    .font(Typography.body(13, weight: .regular))
                    .foregroundStyle(Theme.ink2)

                VStack(spacing: Theme.Space.s) {
                    Button(action: closeApplications) {
                        HStack(spacing: 6) {
                            Text("Close applications").font(Typography.body(13, weight: .semibold))
                            AppIcon.arrowRight.symbol.font(.system(size: 14, weight: .semibold))
                        }
                        .foregroundStyle(Theme.iceInk)
                        .frame(maxWidth: .infinity)
                        .frame(height: 52)
                        .background(Capsule().fill(Theme.ice))
                    }
                    .buttonStyle(PressButtonStyle())
                    Button { router.closeOverlay() } label: {
                        Text("Keep open")
                            .font(Typography.body(13, weight: .medium))
                            .foregroundStyle(Theme.ink)
                            .frame(maxWidth: .infinity)
                            .frame(height: 48)
                            .overlay(Capsule().strokeBorder(Theme.line2, lineWidth: 1))
                    }
                    .buttonStyle(PressButtonStyle())
                }
                .frame(maxWidth: .infinity)
                .padding(.top, Theme.Space.s)
            }
        }
        .multilineTextAlignment(.center)
        .padding(.horizontal, Theme.Space.l)
    }

    // MARK: Actions

    private func seedDeckIfNeeded() {
        guard !seeded, let event else { return }
        seeded = true
        let targetState: ApplicationState = isLocked ? .waitlisted : .applied
        deckPool = event.guests.filter { $0.state == targetState }.map(\.applicantId)
    }

    private func decide(_ yes: Bool) {
        guard let applicantId = currentApplicantId else { return }
        Task {
            await services.venue.decide(eventId: eventId, applicantId: applicantId, pick: yes)
            canUndo = true
            idx += 1
        }
    }

    private func undo() {
        Task {
            await services.venue.undoLastDecision(eventId: eventId)
            canUndo = false
            idx = max(0, idx - 1)
        }
    }

    private func closeApplications() {
        router.confirm(title: "Close applications?", body: Copy.closeApplicationsBody, confirmLabel: "Close applications") {
            Task { await services.venue.closeApplications(eventId: eventId) }
            router.toast("Applications closed")
            router.closeOverlay()
        }
    }
}

#Preview("Dark") {
    let world = DemoWorld()
    ReviewDeckView(eventId: "lounge")
        .environment(world)
        .environment(VenueServices(world: world))
        .environment(VenueRouter())
        .preferredColorScheme(.dark)
}
