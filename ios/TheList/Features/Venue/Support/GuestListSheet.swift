import SwiftUI

// Web `GuestListSheet` — a locked event's guest roster: Confirmed, Awaiting
// confirm (picked or expired), Waitlist. Reads the live `DemoWorld` so a
// replacement pick's auto-confirm timer moves a row between groups live.
struct GuestListSheet: View {
    @Environment(DemoWorld.self) private var world
    @Environment(VenueRouter.self) private var router

    let eventId: String

    private var event: EventItem? { world.events.first { $0.id == eventId } }

    var body: some View {
        ScrollView(showsIndicators: false) {
            if let event {
                VStack(alignment: .leading, spacing: Theme.Space.l) {
                    header(event)

                    let confirmed = event.guests.filter { $0.state == .confirmed }
                    let awaiting = event.guests.filter { $0.state == .picked || $0.state == .expired }
                    let waitlist = event.guests.filter { $0.state == .waitlisted }

                    if confirmed.isEmpty && awaiting.isEmpty && waitlist.isEmpty {
                        Text("No guests yet")
                            .font(Typography.body(11, weight: .medium))
                            .foregroundStyle(Theme.inkMute)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, Theme.Space.xxl)
                    } else {
                        if !confirmed.isEmpty {
                            group("Confirmed", count: confirmed.count) {
                                ForEach(confirmed) { guest in row(guest, statusText: nil) }
                            }
                        }
                        if !awaiting.isEmpty {
                            group("Awaiting confirm", count: awaiting.count) {
                                ForEach(awaiting) { guest in
                                    row(guest, statusText: guest.state == .expired ? "Pick expired" : "Awaiting confirm")
                                }
                            }
                        }
                        if !waitlist.isEmpty {
                            group("Waitlist", count: waitlist.count) {
                                ForEach(waitlist) { guest in row(guest, statusText: "Still under review") }
                            }
                        }
                    }
                }
                .padding(.horizontal, Theme.Space.xl)
                .padding(.top, Theme.Space.l)
                .padding(.bottom, Theme.Space.xxl)
            }
        }
    }

    private func header(_ event: EventItem) -> some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(event.title)
                    .font(Typography.display(22))
                    .tracking(22 * Typography.displayTracking)
                    .foregroundStyle(Theme.ink)
                HStack(spacing: 0) {
                    Text("\(event.guests.filter { $0.state == .confirmed }.count)")
                        .font(Typography.number(12))
                    Text(" confirmed of ")
                        .font(Typography.body(12, weight: .regular))
                    Text("\(event.seats)")
                        .font(Typography.number(12))
                }
                .foregroundStyle(Theme.inkMute)
            }
            Spacer()
            Button { router.dismissSheet() } label: {
                AppIcon.close.symbol
                    .font(.system(size: 14, weight: .medium))
                    .foregroundStyle(Theme.ink)
                    .frame(width: 32, height: 32)
                    .background(Circle().fill(Theme.elev))
            }
            .buttonStyle(PressButtonStyle())
        }
    }

    private func group<Content: View>(_ label: String, count: Int, @ViewBuilder rows: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack {
                Text(label)
                    .font(Typography.body(10, weight: .medium))
                Spacer()
                Text("\(count)")
                    .font(Typography.number(10))
            }
            .foregroundStyle(Theme.inkMute)
            .padding(.bottom, Theme.Space.xs)

            VStack(spacing: 0) {
                rows()
            }
            .overlay(alignment: .top) { HairlineDivider(color: Theme.line) }
        }
    }

    private func row(_ guest: GuestRow, statusText: String?) -> some View {
        let applicant = world.applicant(id: guest.applicantId)
        return HStack(spacing: Theme.Space.m) {
            VenuePhoto(key: applicant?.photoName ?? "")
                .frame(width: 40, height: 40)
                .clipShape(Circle())

            VStack(alignment: .leading, spacing: 2) {
                Text(applicant?.name ?? "—")
                    .font(Typography.body(14, weight: .medium))
                    .foregroundStyle(Theme.ink)
                if let statusText {
                    Text(statusText)
                        .font(Typography.body(11, weight: .regular))
                        .foregroundStyle(Theme.inkMute)
                }
            }
            Spacer(minLength: Theme.Space.s)
            VStack(alignment: .trailing, spacing: 2) {
                if let code = guest.code {
                    Text(code)
                        .font(Typography.number(11))
                        .foregroundStyle(Theme.ice)
                }
                if let applicant {
                    Text(MemberFormatting.oneDecimal(applicant.qualityScore * 10))
                        .font(Typography.body(10, weight: .regular))
                        .foregroundStyle(Theme.inkMute)
                }
            }
        }
        .padding(.vertical, 10)
    }
}

#Preview("Dark") {
    let world = DemoWorld()
    Color.clear
        .sheet(isPresented: .constant(true)) {
            GuestListSheet(eventId: "pool").memberSheetChrome()
        }
        .environment(world)
        .environment(VenueServices(world: world))
        .environment(VenueRouter())
        .preferredColorScheme(.dark)
}
