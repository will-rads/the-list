import SwiftUI

// Web `ScreenPicked` — the opaque-black takeover the member lands on when a venue
// picks her. A blurred event still behind, the "You're in" ring, and a live 24h
// confirm countdown (monospaced digits, ticking every second via TimelineView).
// Confirm issues the door code and lands on Invites; Decline releases the seat.
struct PickedView: View {
    @Environment(DemoWorld.self) private var world
    @Environment(MemberServices.self) private var services
    @Environment(MemberRouter.self) private var router

    let eventId: String

    @State private var pulse = false

    private var event: EventItem? { world.events.first { $0.id == eventId } }
    private var pickedAt: Date? {
        world.myEvents.first { $0.eventId == eventId }?.pickedAt
    }

    var body: some View {
        ZStack {
            MemberPalette.takeover.ignoresSafeArea()
            if let event {
                VenuePhoto(key: event.imageName)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .clipped()
                    .blur(radius: 40)
                    .opacity(0.3)
                    .ignoresSafeArea()

                content(event)
            }
        }
        .ignoresSafeArea()
        .onAppear { pulse = true }
    }

    private func content(_ event: EventItem) -> some View {
        VStack(spacing: 0) {
            Text("The List · invitation")
                .font(Typography.body(13, weight: .bold))
                .foregroundStyle(MemberPalette.onPhoto.opacity(0.7))
                .shadow(color: .black.opacity(0.5), radius: 8, y: 1)
                .frame(maxWidth: .infinity, alignment: .leading)

            Spacer()

            ZStack {
                Circle()
                    .fill(MemberPalette.onPhoto)
                    .frame(width: 180, height: 180)
                    .overlay {
                        Circle()
                            .stroke(MemberPalette.onPhoto.opacity(pulse ? 0 : 0.35), lineWidth: 14)
                            .scaleEffect(pulse ? 1.35 : 1)
                            .animation(.easeOut(duration: 1.8).repeatForever(autoreverses: false), value: pulse)
                    }
                Text("You're\nin")
                    .font(Typography.body(48, weight: .bold))
                    .tracking(48 * Typography.displayTracking)
                    .multilineTextAlignment(.center)
                    .lineSpacing(-8)
                    .foregroundStyle(MemberPalette.onCreamInk)
            }

            Text(event.title)
                .font(Typography.display(34))
                .tracking(34 * Typography.displayTracking)
                .foregroundStyle(MemberPalette.onPhoto)
                .padding(.top, 40)
            Text("\(event.venueName) · \(event.date) · \(event.time)")
                .font(Typography.body(13, weight: .regular))
                .foregroundStyle(MemberPalette.onPhoto.opacity(0.75))
                .padding(.top, Theme.Space.s)

            countdownBox

            Spacer()

            VStack(spacing: Theme.Space.m) {
                Button(action: confirm) {
                    HStack(spacing: Theme.Space.s) {
                        Text("Confirm my seat").font(Typography.body(15, weight: .semibold))
                        AppIcon.arrowRight.symbol.font(.system(size: 16, weight: .semibold))
                    }
                    .foregroundStyle(MemberPalette.onCreamInk)
                    .frame(maxWidth: .infinity).frame(height: 58)
                    .background(Capsule().fill(MemberPalette.onPhoto))
                }
                .buttonStyle(PressButtonStyle())
                Button(action: decline) {
                    Text("Decline")
                        .font(Typography.body(13, weight: .medium))
                        .foregroundStyle(MemberPalette.onPhoto.opacity(0.7))
                        .frame(maxWidth: .infinity).frame(height: 58)
                        .overlay(Capsule().strokeBorder(MemberPalette.onPhoto.opacity(0.2), lineWidth: 1))
                }
                .buttonStyle(PressButtonStyle())
            }
        }
        .padding(.horizontal, 28)
        .padding(.top, 100)
        .padding(.bottom, 40)
    }

    private var countdownBox: some View {
        TimelineView(.periodic(from: .now, by: 1)) { context in
            VStack(spacing: 2) {
                Text("Confirm within")
                    .font(Typography.body(10, weight: .medium))
                    .foregroundStyle(MemberPalette.onPhoto.opacity(0.65))
                    .shadow(color: .black.opacity(0.5), radius: 8, y: 1)
                CountdownText(value: remaining(at: context.date), size: 28)
                    .foregroundStyle(MemberPalette.onPhoto)
            }
            .padding(.horizontal, Theme.Space.l)
            .padding(.vertical, Theme.Space.m)
            .background {
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .fill(MemberPalette.onPhoto.opacity(0.08))
                    .overlay(
                        RoundedRectangle(cornerRadius: 12, style: .continuous)
                            .strokeBorder(MemberPalette.onPhoto.opacity(0.15), lineWidth: 1)
                    )
            }
            .padding(.top, Theme.Space.xl)
        }
    }

    // Web `computeRemaining` — HH:MM:SS to a 24h deadline from pickedAt, floored at 0.
    private func remaining(at now: Date) -> String {
        guard let pickedAt else { return "23:59:59" }
        let deadline = pickedAt.addingTimeInterval(24 * 3600)
        let diff = max(0, Int(deadline.timeIntervalSince(now)))
        return String(format: "%02d:%02d:%02d", diff / 3600, (diff % 3600) / 60, diff % 60)
    }

    private func confirm() {
        Task {
            await services.applications.confirmPick(eventId: eventId)
            router.closeOverlay()
            router.selectTab(.invites)
        }
    }

    private func decline() {
        Task {
            await services.applications.declinePick(eventId: eventId)
            router.closeOverlay()
        }
    }
}

#Preview("Dark") {
    let world = DemoWorld()
    PickedView(eventId: "lounge")
        .environment(world)
        .environment(MemberServices(world: world))
        .environment(MemberRouter())
        .preferredColorScheme(.dark)
}
