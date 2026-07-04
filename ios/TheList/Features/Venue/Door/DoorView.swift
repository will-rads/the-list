import SwiftUI

// Web `ScreenDoor` — tonight's locked room: Expected / In / No show segments,
// pass-code check-in, per-guest rating, and Close the night → a rating queue
// for any still-unrated checked-in guest, then the close confirm → Recap.
struct DoorView: View {
    @Environment(DemoWorld.self) private var world
    @Environment(VenueServices.self) private var services
    @Environment(VenueRouter.self) private var router

    private enum Segment: Hashable { case expected, checkedIn, noShow }
    private struct RateTarget: Identifiable { let id: String }

    @State private var segment: Segment = .expected
    @State private var rateFor: RateTarget?
    @State private var singleScore: Double = 9
    @State private var ratingQueue: [String] = []
    @State private var ratingQueueTotal = 0
    @State private var queueScore: Double = 9

    private var event: EventItem? {
        world.venueManagedEvents().first { $0.stage == .locked && $0.date == DemoWorld.today }
    }
    private var guests: [GuestRow] { event?.guests ?? [] }
    private var expectedGuests: [GuestRow] { guests.filter { $0.state == .confirmed } }
    private var checkedInGuests: [GuestRow] { guests.filter { $0.state == .checkedIn } }
    private var noShowGuests: [GuestRow] { guests.filter { $0.state == .noShow } }
    private var list: [GuestRow] {
        switch segment {
        case .expected:  return expectedGuests
        case .checkedIn: return checkedInGuests
        case .noShow:    return noShowGuests
        }
    }

    var body: some View {
        Group {
            if !ratingQueue.isEmpty {
                ratingQueueView
            } else if let event {
                mainView(event)
            } else {
                emptyView
            }
        }
        .sheet(item: $rateFor) { target in
            singleRateSheet(applicantId: target.id)
                .memberSheetChrome(detents: [.medium])
        }
    }

    // MARK: Empty

    private var emptyView: some View {
        VStack(spacing: Theme.Space.s) {
            Text("No room tonight")
                .font(Typography.display(40))
                .tracking(40 * Typography.displayTracking)
                .foregroundStyle(Theme.ink)
            Text("Door opens when a confirmed night is on.")
                .font(Typography.body(13, weight: .regular))
                .foregroundStyle(Theme.ink2)
        }
        .multilineTextAlignment(.center)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(.horizontal, Theme.Space.xxl)
    }

    // MARK: Main

    private func mainView(_ event: EventItem) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            VStack(alignment: .leading, spacing: 2) {
                Text("Door")
                    .font(Typography.display(40))
                    .tracking(40 * Typography.displayTracking)
                    .foregroundStyle(Theme.ink)
                Text("\(event.title) · \(event.date)")
                    .font(Typography.body(12, weight: .regular))
                    .foregroundStyle(Theme.ink.opacity(0.75))
            }
            .padding(.horizontal, MemberLayout.hInset)
            .padding(.top, 60)

            SegmentedControl(
                items: [
                    .init(id: Segment.expected, label: "Expected", count: expectedGuests.count),
                    .init(id: Segment.checkedIn, label: "In", count: checkedInGuests.count),
                    .init(id: Segment.noShow, label: "No show", count: noShowGuests.count),
                ],
                selection: $segment
            )
            .padding(.horizontal, MemberLayout.hInset)
            .padding(.top, Theme.Space.l)

            ScrollView(showsIndicators: false) {
                if list.isEmpty {
                    Text(emptyListText)
                        .font(Typography.body(13, weight: .regular))
                        .foregroundStyle(Theme.ink.opacity(0.7))
                        .frame(maxWidth: .infinity)
                        .padding(.top, Theme.Space.xxl)
                } else {
                    VStack(spacing: Theme.Space.s) {
                        ForEach(list) { guest in guestRow(guest) }
                    }
                    .padding(.horizontal, MemberLayout.hInset)
                    .padding(.top, Theme.Space.m)
                }
                Color.clear.frame(height: 100)
            }

            Button(action: startClose) {
                HStack(spacing: Theme.Space.s) {
                    Text("Close the night").font(Typography.body(13, weight: .semibold))
                    AppIcon.arrowRight.symbol.font(.system(size: 15, weight: .semibold))
                }
                .foregroundStyle(Theme.iceInk)
                .frame(maxWidth: .infinity)
                .frame(height: 52)
                .background(Capsule().fill(Theme.ice))
                .shadow(color: Theme.iceGlow, radius: 12)
            }
            .buttonStyle(PressButtonStyle())
            .padding(.horizontal, MemberLayout.hInset)
            .padding(.bottom, Theme.Space.xl)
            .padding(.top, Theme.Space.s)
        }
    }

    private var emptyListText: String {
        switch segment {
        case .expected:  return "Everyone's in."
        case .checkedIn: return "No one's in yet."
        case .noShow:    return "No no-shows. Good night."
        }
    }

    private func guestRow(_ guest: GuestRow) -> some View {
        let applicant = world.applicant(id: guest.applicantId)
        return HStack(spacing: Theme.Space.m) {
            VenuePhoto(key: applicant?.photoName ?? "")
                .frame(width: 44, height: 44)
                .clipShape(Circle())

            VStack(alignment: .leading, spacing: 2) {
                Text(applicant?.name ?? "—")
                    .font(Typography.body(14, weight: .medium))
                    .foregroundStyle(Theme.ink)
                HStack(spacing: 4) {
                    Text(MemberFormatting.oneDecimal((applicant?.qualityScore ?? 0) * 10))
                        .font(Typography.number(11))
                    Text("rep").font(Typography.body(11, weight: .regular))
                    if segment == .checkedIn, let inAt = guest.inAt {
                        Text("· in \(inAt)").font(Typography.number(11))
                    }
                }
                .foregroundStyle(Theme.inkMute)
            }
            Spacer(minLength: Theme.Space.s)

            if segment == .expected, let code = guest.code {
                Text(code)
                    .font(Typography.number(11))
                    .foregroundStyle(Theme.ice)
            }

            trailingControl(guest)
        }
        .padding(Theme.Space.m)
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardGlass(radius: Theme.Radius.control)
    }

    @ViewBuilder
    private func trailingControl(_ guest: GuestRow) -> some View {
        switch segment {
        case .expected:
            HStack(spacing: Theme.Space.s) {
                Button { markNoShow(guest) } label: {
                    Text("No show")
                        .font(Typography.body(10, weight: .medium))
                        .foregroundStyle(Theme.ink.opacity(0.7))
                        .padding(.horizontal, Theme.Space.m)
                        .frame(height: 32)
                        .overlay(Capsule().strokeBorder(Theme.line2, lineWidth: 1))
                }
                .buttonStyle(PressButtonStyle())
                Button { checkIn(guest) } label: {
                    Text("Check in")
                        .font(Typography.body(10, weight: .semibold))
                        .foregroundStyle(Theme.iceInk)
                        .padding(.horizontal, Theme.Space.m)
                        .frame(height: 32)
                        .background(Capsule().fill(Theme.ice))
                        .shadow(color: Theme.iceGlow, radius: 8)
                }
                .buttonStyle(PressButtonStyle())
            }
        case .checkedIn:
            if guest.rating != nil {
                StatusPill(label: "Scored", tone: .outline, showDot: false)
            } else {
                Button { rateFor = RateTarget(id: guest.applicantId) } label: {
                    Text("Rate")
                        .font(Typography.body(10, weight: .medium))
                        .foregroundStyle(Theme.ink)
                        .padding(.horizontal, Theme.Space.m)
                        .frame(height: 32)
                        .overlay(Capsule().strokeBorder(Theme.line2, lineWidth: 1))
                }
                .buttonStyle(PressButtonStyle())
            }
        case .noShow:
            StatusPill(label: "No show", tone: .neutral, showDot: false)
        }
    }

    // MARK: Rating queue (full-screen)

    private var ratingQueueView: some View {
        let currentId = ratingQueue[0]
        let applicant = world.applicant(id: currentId)
        let doneCount = ratingQueueTotal - ratingQueue.count
        return VStack(alignment: .leading, spacing: 0) {
            VStack(alignment: .leading, spacing: 2) {
                Text("Rate the night")
                    .font(Typography.display(40))
                    .tracking(40 * Typography.displayTracking)
                    .foregroundStyle(Theme.ink)
                Text("\(doneCount + 1) of \(ratingQueueTotal)")
                    .font(Typography.body(12, weight: .regular))
                    .foregroundStyle(Theme.ink.opacity(0.75))
            }
            .padding(.horizontal, MemberLayout.hInset)
            .padding(.top, 60)

            VStack(alignment: .leading, spacing: 0) {
                HStack(spacing: Theme.Space.m) {
                    VenuePhoto(key: applicant?.photoName ?? "")
                        .frame(width: 56, height: 56)
                        .clipShape(Circle())
                    VStack(alignment: .leading, spacing: 2) {
                        Text(applicant?.name ?? "—")
                            .font(Typography.display(22))
                            .tracking(22 * Typography.displayTracking)
                            .foregroundStyle(Theme.ink)
                        Text("How was the night?")
                            .font(Typography.body(11, weight: .regular))
                            .foregroundStyle(Theme.inkMute)
                    }
                }
                .padding(.bottom, Theme.Space.xl)

                scoreRow(score: $queueScore)

                Text("Feeds their reputation. Honest beats nice — it keeps the list good.")
                    .font(Typography.body(11, weight: .regular))
                    .foregroundStyle(Theme.inkMute)
                    .padding(.top, Theme.Space.m)

                Button(action: submitQueueScore) {
                    HStack(spacing: Theme.Space.s) {
                        Text("Save score").font(Typography.body(12, weight: .semibold))
                        AppIcon.arrowRight.symbol.font(.system(size: 13, weight: .semibold))
                    }
                    .foregroundStyle(Theme.iceInk)
                    .frame(maxWidth: .infinity)
                    .frame(height: 48)
                    .background(Capsule().fill(Theme.ice))
                }
                .buttonStyle(PressButtonStyle())
                .padding(.top, Theme.Space.l)

                Button(action: skipQueueGuest) {
                    Text("Skip")
                        .font(Typography.body(11, weight: .regular))
                        .foregroundStyle(Theme.inkMute)
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.plain)
                .padding(.top, Theme.Space.m)
            }
            .padding(.horizontal, MemberLayout.hInset)
            .padding(.top, Theme.Space.xxl)

            Spacer()
        }
    }

    // MARK: Single rate sheet

    private func singleRateSheet(applicantId: String) -> some View {
        let applicant = world.applicant(id: applicantId)
        return VStack(alignment: .leading, spacing: Theme.Space.l) {
            HStack(spacing: Theme.Space.m) {
                VenuePhoto(key: applicant?.photoName ?? "")
                    .frame(width: 44, height: 44)
                    .clipShape(Circle())
                VStack(alignment: .leading, spacing: 2) {
                    Text(applicant?.name ?? "—")
                        .font(Typography.display(20))
                        .tracking(20 * Typography.displayTracking)
                        .foregroundStyle(Theme.ink)
                    Text("How was the night?")
                        .font(Typography.body(11, weight: .regular))
                        .foregroundStyle(Theme.inkMute)
                }
                Spacer()
                Button { rateFor = nil } label: {
                    AppIcon.close.symbol
                        .font(.system(size: 14, weight: .medium))
                        .foregroundStyle(Theme.ink)
                        .frame(width: 32, height: 32)
                        .background(Circle().fill(Theme.elev))
                }
                .buttonStyle(PressButtonStyle())
            }

            scoreRow(score: $singleScore)

            Text("Feeds their reputation. Honest beats nice — it keeps the list good.")
                .font(Typography.body(11, weight: .regular))
                .foregroundStyle(Theme.inkMute)

            Button(action: submitSingleScore) {
                Text("Save score")
                    .font(Typography.body(12, weight: .semibold))
                    .foregroundStyle(Theme.iceInk)
                    .frame(maxWidth: .infinity)
                    .frame(height: 48)
                    .background(Capsule().fill(Theme.ice))
            }
            .buttonStyle(PressButtonStyle())
        }
        .padding(.horizontal, Theme.Space.xl)
        .padding(.top, Theme.Space.l)
        .padding(.bottom, Theme.Space.xl)
    }

    private func scoreRow(score: Binding<Double>) -> some View {
        HStack(spacing: Theme.Space.s) {
            ForEach([6, 7, 8, 9, 10], id: \.self) { n in
                let selected = Int(score.wrappedValue) == n
                Button { score.wrappedValue = Double(n) } label: {
                    Text("\(n)")
                        .font(Typography.number(18))
                        .foregroundStyle(selected ? Theme.iceInk : Theme.ink)
                        .frame(maxWidth: .infinity)
                        .frame(height: 48)
                        .background {
                            if selected {
                                RoundedRectangle(cornerRadius: 12, style: .continuous).fill(Theme.ice)
                            } else {
                                RoundedRectangle(cornerRadius: 12, style: .continuous)
                                    .fill(Theme.elev)
                                    .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).strokeBorder(Theme.line, lineWidth: 1))
                            }
                        }
                        .shadow(color: selected ? Theme.iceGlow : .clear, radius: 8)
                }
                .buttonStyle(PressButtonStyle())
            }
        }
    }

    // MARK: Actions

    private func checkIn(_ guest: GuestRow) {
        guard let event else { return }
        Task { await services.venue.checkIn(eventId: event.id, applicantId: guest.applicantId) }
    }

    private func markNoShow(_ guest: GuestRow) {
        guard let event else { return }
        Task { await services.venue.markNoShow(eventId: event.id, applicantId: guest.applicantId) }
    }

    private func submitSingleScore() {
        guard let event, let target = rateFor else { return }
        Task { await services.venue.rate(eventId: event.id, applicantId: target.id, score: singleScore) }
        rateFor = nil
        singleScore = 9
    }

    private func startClose() {
        let unrated = checkedInGuests.filter { $0.rating == nil }
        if unrated.isEmpty {
            showCloseConfirm()
        } else {
            ratingQueue = unrated.map(\.applicantId)
            ratingQueueTotal = ratingQueue.count
            queueScore = 9
        }
    }

    private func submitQueueScore() {
        guard let event, let currentId = ratingQueue.first else { return }
        Task { await services.venue.rate(eventId: event.id, applicantId: currentId, score: queueScore) }
        advanceQueue()
    }

    private func skipQueueGuest() { advanceQueue() }

    private func advanceQueue() {
        guard !ratingQueue.isEmpty else { return }
        ratingQueue.removeFirst()
        queueScore = 9
        if ratingQueue.isEmpty { showCloseConfirm() }
    }

    private func showCloseConfirm() {
        guard let event else { return }
        router.confirm(title: "Close the night?", body: Copy.closeNightBody, confirmLabel: "Close the night") {
            Task { await services.venue.closeNight(eventId: event.id) }
            router.selectTab(.desk)
        }
    }
}

#Preview("Dark") {
    let world = DemoWorld()
    DoorView()
        .appGround()
        .environment(world)
        .environment(VenueServices(world: world))
        .environment(VenueRouter())
        .preferredColorScheme(.dark)
}
