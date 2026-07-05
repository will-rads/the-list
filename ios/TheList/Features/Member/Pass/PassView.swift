import SwiftUI

// Web `ScreenPass` — the ticket artifact she shows at the door: photo, name, the
// event block, the huge door code, and the check-in band (ice "Checked in" when
// she's in, else "Show this at the door"), with the Brief beneath. Full-screen
// overlay, re-applies `.appGround()` (stacked-screen bleed fix). The PassInfo is
// assembled by the service from the event + profile + row.
struct PassView: View {
    @Environment(DemoWorld.self) private var world
    @Environment(MemberRouter.self) private var router

    let eventId: String

    private var pass: PassInfo? { world.passInfo(for: eventId) }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 0) {
                topBar
                if let pass {
                    ticket(pass).padding(.top, Theme.Space.xl)
                    BriefBlock(brief: pass.brief).padding(.top, Theme.Space.xl)
                }
                Color.clear.frame(height: MemberLayout.dockClearance)
            }
            .padding(.horizontal, MemberLayout.hInset)
            .padding(.top, 60)
        }
        .ignoresSafeArea(.container, edges: .top)
        .appGround()
    }

    private var topBar: some View {
        HStack {
            GlassIconButton(icon: .arrowLeft) { router.closeOverlay() }
            Spacer()
            Text("The List · pass")
                .font(Typography.body(13, weight: .bold))
                .foregroundStyle(Theme.ink)
            Spacer()
            Color.clear.frame(width: 40, height: 40)
        }
    }

    private func ticket(_ pass: PassInfo) -> some View {
        VStack(spacing: 0) {
            VStack(spacing: 0) {
                VenuePhoto(key: pass.memberPhotoName)
                    .frame(width: 76, height: 76)
                    .clipShape(Circle())
                    .overlay(Circle().strokeBorder(Theme.line2, lineWidth: 1))
                Text(pass.memberFullName)
                    .font(Typography.display(26))
                    .tracking(26 * Typography.displayTracking)
                    .foregroundStyle(Theme.ink)
                    .padding(.top, Theme.Space.l)
                Text("@\(pass.memberHandle)")
                    .font(Typography.body(11, weight: .regular))
                    .foregroundStyle(Theme.inkMute)
                    .padding(.top, 6)
            }
            .padding(.horizontal, 24)
            .padding(.top, 28)
            .padding(.bottom, 24)

            HairlineDivider(dotted: true, color: Theme.line2)
                .padding(.horizontal, Theme.Space.l)

            VStack(spacing: 0) {
                Text(pass.eventTitle)
                    .font(Typography.display(19))
                    .tracking(19 * Typography.displayTracking)
                    .foregroundStyle(Theme.ink)
                Text("\(pass.venueName) · \(pass.area)")
                    .font(Typography.body(12, weight: .regular))
                    .foregroundStyle(Theme.inkMute)
                    .padding(.top, Theme.Space.xs)
                Text("\(pass.date) · Doors \(pass.doors)")
                    .font(Typography.number(12))
                    .foregroundStyle(Theme.inkMute)
                    .padding(.top, 2)
                Text("Door code")
                    .font(Typography.body(10, weight: .medium))
                    .foregroundStyle(Theme.inkMute)
                    .padding(.top, Theme.Space.xl)
                Text(pass.code)
                    .font(Typography.display(56))
                    .tracking(56 * 0.08)
                    .foregroundStyle(Theme.ink)
                    .padding(.top, Theme.Space.xs)
            }
            .padding(.horizontal, 24)
            .padding(.vertical, 20)

            band(pass)
        }
        .cardGlass(radius: Theme.Radius.tile)
    }

    @ViewBuilder
    private func band(_ pass: PassInfo) -> some View {
        if pass.isCheckedIn {
            Text(Copy.checkedInPrefix + (pass.checkedInAt.map { " · \($0)" } ?? ""))
                .font(Typography.body(13, weight: .medium))
                .foregroundStyle(Theme.iceInk)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(Theme.ice)
        } else {
            Text(Copy.showAtDoor)
                .font(Typography.body(12, weight: .regular))
                .foregroundStyle(Theme.inkMute)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(Theme.elev)
                .overlay(alignment: .top) { HairlineDivider(color: Theme.line) }
        }
    }
}

#Preview("Dark") {
    let world = DemoWorld()
    PassView(eventId: "pool")
        .environment(world)
        .environment(MemberServices(world: world))
        .environment(MemberRouter())
        .preferredColorScheme(.dark)
}
