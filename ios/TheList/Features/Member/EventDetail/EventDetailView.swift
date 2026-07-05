import SwiftUI

// Web `ScreenEventDetail` — a full-screen overlay (re-applies `.appGround()`: the
// stacked-screen bleed fix, errors.md 2026-07-04). Paged hero gallery + dots,
// title/meta, When/Doors/Seats widget tiles, venue row + Map chip, The exchange,
// and the honest apply CTA state machine docked over a DockFade.
struct EventDetailView: View {
    @Environment(DemoWorld.self) private var world
    @Environment(MemberServices.self) private var services
    @Environment(MemberRouter.self) private var router

    let eventId: String

    @State private var heroIndex = 0
    @State private var applyPhase: ApplyPhase = .idle

    enum ApplyPhase { case idle, submitting }

    private var event: EventItem? { world.events.first { $0.id == eventId } }
    private var myRow: MyEventRow? {
        world.myEvents.first { $0.eventId == eventId && $0.state != .none }
    }

    var body: some View {
        ZStack(alignment: .bottom) {
            if let event {
                ScrollView(showsIndicators: false) {
                    VStack(alignment: .leading, spacing: 0) {
                        hero(event)
                        metaTiles(event).padding(.horizontal, MemberLayout.hInset).padding(.top, Theme.Space.l)
                        locationRow(event).padding(.horizontal, MemberLayout.hInset).padding(.top, Theme.Space.l)
                        if event.stage == .open, let closesAt = event.closesAt {
                            Text("Applications close · \(closesAt)")
                                .font(Typography.body(11, weight: .regular))
                                .foregroundStyle(Theme.inkMute)
                                .shadow(color: Theme.textShadow, radius: 8, y: 1)
                                .padding(.horizontal, MemberLayout.hInset)
                                .padding(.top, Theme.Space.m)
                        }
                        exchange.padding(.top, Theme.Space.xxl)
                        Color.clear.frame(height: 120)
                    }
                }
                .ignoresSafeArea(.container, edges: .top)
                footer(event)
            }
        }
        .appGround()
    }

    // MARK: Hero

    private func hero(_ event: EventItem) -> some View {
        let gallery = event.galleryImageNames.isEmpty ? [event.imageName] : event.galleryImageNames
        return ZStack(alignment: .bottom) {
            TabView(selection: $heroIndex) {
                ForEach(Array(gallery.enumerated()), id: \.offset) { index, key in
                    VenuePhoto(key: key)
                        .frame(maxWidth: .infinity)
                        .frame(height: 480)
                        .clipped()
                        .tag(index)
                }
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
            .frame(height: 480)

            MemberPalette.heroScrim.frame(height: 480).allowsHitTesting(false)

            VStack(alignment: .leading, spacing: 0) {
                HStack(spacing: Theme.Space.s) {
                    Text(event.type)
                        .font(Typography.body(10, weight: .medium))
                        .foregroundStyle(Theme.iceInk)
                        .padding(.horizontal, Theme.Space.s)
                        .padding(.vertical, 4)
                        .background(Capsule().fill(Theme.ice))
                    Text(event.venueName)
                        .font(Typography.body(10, weight: .medium))
                        .foregroundStyle(MemberPalette.onPhoto)
                }
                Text(event.title)
                    .font(Typography.display(52))
                    .tracking(52 * Typography.displayTracking)
                    .lineSpacing(-6)
                    .foregroundStyle(MemberPalette.onPhoto)
                    .padding(.top, Theme.Space.m)
                Text("Resident DJ Karim Sahli from 16:00. Mediterranean menu at sunset. Dress: swimwear and an attitude.")
                    .font(Typography.body(12, weight: .regular))
                    .foregroundStyle(MemberPalette.onPhoto.opacity(0.8))
                    .frame(maxWidth: 280, alignment: .leading)
                    .padding(.top, Theme.Space.m)
                if gallery.count > 1 {
                    HStack(spacing: 6) {
                        ForEach(0..<gallery.count, id: \.self) { i in
                            Capsule()
                                .fill(i == heroIndex ? Theme.ice : Theme.line2)
                                .frame(width: i == heroIndex ? 16 : 6, height: 6)
                                .animation(.easeOut(duration: 0.2), value: heroIndex)
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.top, Theme.Space.l)
                }
            }
            .padding(.horizontal, MemberLayout.hInset)
            .padding(.bottom, Theme.Space.xl)
        }
        .frame(height: 480)
        .overlay(alignment: .top) { heroControls(event) }
    }

    private func heroControls(_ event: EventItem) -> some View {
        HStack {
            GlassIconButton(icon: .arrowLeft, size: 40, iconSize: 18) { router.closeOverlay() }
            Spacer()
            HStack(spacing: Theme.Space.s) {
                SaveButton(saved: router.saved.contains(event.id), size: 40) {
                    router.toggleSave(event.id)
                }
                GlassIconButton(icon: .share, size: 40) { router.present(.share(event.id)) }
            }
        }
        .padding(.horizontal, MemberLayout.hInset)
        .padding(.top, 60)
    }

    // MARK: Meta tiles

    private func metaTiles(_ event: EventItem) -> some View {
        HStack(spacing: Theme.Space.s) {
            MetaTile(label: "When", sub: MemberFormatting.dayMonthPart(event.date)) {
                Text(MemberFormatting.weekdayPart(event.date))
                    .font(Typography.body(20, weight: .bold))
                    .foregroundStyle(Theme.ink)
            }
            MetaTile(label: "Doors", sub: "til 21:00") {
                Text(event.time)
                    .font(Typography.number(20))
                    .foregroundStyle(Theme.ink)
            }
            MetaTile(label: "Seats", sub: "\(event.appliedTotal) applied") {
                HStack(spacing: 0) {
                    Text("\(event.seats)").foregroundStyle(Theme.ice)
                    Text(" / \(event.seats)").foregroundStyle(Theme.inkMute)
                }
                .font(Typography.number(20))
            }
        }
    }

    // MARK: Location

    private func locationRow(_ event: EventItem) -> some View {
        HStack(alignment: .top, spacing: Theme.Space.m) {
            AppIcon.mapPin.symbol
                .font(.system(size: 14, weight: .medium))
                .foregroundStyle(Theme.ink)
                .frame(width: 36, height: 36)
                .overlay(Circle().strokeBorder(Theme.line2, lineWidth: 1))
            VStack(alignment: .leading, spacing: 2) {
                Text(event.venueName)
                    .font(Typography.display(16))
                    .tracking(16 * Typography.displayTracking)
                    .foregroundStyle(Theme.ink)
                Text("\(event.area) · 22 km south of city")
                    .font(Typography.body(12, weight: .regular))
                    .foregroundStyle(Theme.inkMute)
                    .shadow(color: Theme.textShadow, radius: 8, y: 1)
            }
            Spacer(minLength: Theme.Space.s)
            Button { router.toast("Opening in Maps") } label: {
                Text("Map")
                    .font(Typography.body(11, weight: .regular))
                    .foregroundStyle(Theme.ink)
                    .padding(.horizontal, Theme.Space.m)
                    .frame(height: 32)
                    .overlay(Capsule().strokeBorder(Theme.line2, lineWidth: 1))
            }
            .buttonStyle(PressButtonStyle())
        }
    }

    // MARK: The exchange

    private var exchange: some View {
        VStack(alignment: .leading, spacing: 0) {
            SectionHead(label: "The exchange").padding(.bottom, Theme.Space.m)
            VStack(spacing: 0) {
                exchangeRow(n: "01", title: "One Story, on the day", sub: "Posted between 14:00 - 21:00")
                exchangeRow(n: "02", title: "Tag @cyanbeachclub", sub: "And the venue handle in caption")
            }
            .padding(.horizontal, MemberLayout.hInset)
        }
    }

    private func exchangeRow(n: String, title: String, sub: String) -> some View {
        HStack(spacing: Theme.Space.l) {
            Text(n)
                .font(Typography.number(11)).foregroundStyle(Theme.inkMute)
                .shadow(color: Theme.textShadow, radius: 8, y: 1)
            VStack(alignment: .leading, spacing: 2) {
                Text(title).font(Typography.body(14, weight: .regular)).foregroundStyle(Theme.ink)
                Text(sub)
                    .font(Typography.body(11, weight: .regular)).foregroundStyle(Theme.inkMute)
                    .shadow(color: Theme.textShadow, radius: 8, y: 1)
            }
            Spacer(minLength: Theme.Space.s)
            AppIcon.check.symbol
                .font(.system(size: 14, weight: .medium))
                .foregroundStyle(Theme.ink.opacity(0.3))
        }
        .padding(.vertical, Theme.Space.m)
        .overlay(alignment: .bottom) { HairlineDivider(color: Theme.line) }
    }

    // MARK: Footer CTA

    private func footer(_ event: EventItem) -> some View {
        ZStack(alignment: .bottom) {
            DockFade(height: 160)
            EventDetailCTA(
                event: event, row: myRow, applyPhase: applyPhase,
                onApply: apply,
                onViewPass: { router.openPass(event.id) },
                onConfirmSeat: { router.openPicked(event.id) }
            )
            .padding(.horizontal, MemberLayout.hInset)
            .padding(.bottom, 28)
        }
    }

    private func apply() {
        guard applyPhase == .idle else { return }
        applyPhase = .submitting
        Task { await services.applications.apply(to: eventId) }
    }
}

// MARK: - Meta tile

private struct MetaTile<Value: View>: View {
    let label: String
    let sub: String
    @ViewBuilder var value: () -> Value

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label).font(Typography.body(10, weight: .medium)).foregroundStyle(Theme.inkMute)
            value()
            Text(sub).font(Typography.body(11, weight: .regular)).foregroundStyle(Theme.inkMute)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(14)
        .cardGlass(radius: Theme.Radius.tile)
    }
}

// MARK: - CTA state machine

private struct EventDetailCTA: View {
    let event: EventItem
    let row: MyEventRow?
    let applyPhase: EventDetailView.ApplyPhase
    let onApply: () -> Void
    let onViewPass: () -> Void
    let onConfirmSeat: () -> Void

    var body: some View {
        if let row {
            switch row.state {
            case .confirmed:
                primaryBar(title: "View pass", action: onViewPass)
            case .applied:
                pillBar { StatusPill(label: ApplicationState.applied.memberLabel, tone: .neutral) }
            case .picked:
                primaryBar(title: Copy.confirmYourSeat, action: onConfirmSeat)
            default:
                pillBar { StatusPill(label: row.state.memberLabel, tone: .outline, showDot: false) }
            }
        } else if event.stage == .locked {
            Text(Copy.listClosedCTA)
                .font(Typography.body(15, weight: .semibold))
                .foregroundStyle(Theme.inkMute)
                .frame(maxWidth: .infinity)
                .frame(height: 56)
                .background(Capsule().fill(Theme.elev2))
        } else {
            applyMachine
        }
    }

    private var applyMachine: some View {
        HStack(spacing: Theme.Space.m) {
            VStack(alignment: .leading, spacing: 2) {
                Text("Closes in")
                    .font(Typography.body(10, weight: .medium)).foregroundStyle(Theme.inkMute)
                CountdownText(value: "04:56:12", size: 22).foregroundStyle(Theme.ice)
            }
            Spacer(minLength: Theme.Space.s)
            Button(action: onApply) {
                HStack(spacing: Theme.Space.s) {
                    if applyPhase == .idle {
                        Text(Copy.applyFree).font(Typography.body(15, weight: .semibold))
                        AppIcon.arrowRight.symbol.font(.system(size: 16, weight: .semibold))
                    } else {
                        Text(Copy.applyReviewing).font(Typography.body(15, weight: .semibold))
                        MiniSpinner().frame(width: 16, height: 16)
                    }
                }
                .foregroundStyle(applyPhase == .idle ? Theme.iceInk : Theme.ink)
                .frame(minWidth: 168)
                .frame(height: 56)
                .padding(.horizontal, Theme.Space.xl)
                .background(Capsule().fill(applyPhase == .idle ? Theme.ice : Theme.elev2))
            }
            .buttonStyle(PressButtonStyle())
            .disabled(applyPhase != .idle)
        }
    }

    private func primaryBar(title: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: Theme.Space.m) {
                Text(title).font(Typography.body(15, weight: .semibold))
                AppIcon.arrowRight.symbol.font(.system(size: 16, weight: .semibold))
            }
            .foregroundStyle(Theme.iceInk)
            .frame(maxWidth: .infinity)
            .frame(height: 56)
            .background(Capsule().fill(Theme.ice))
            .shadow(color: Theme.iceGlow, radius: 12)
        }
        .buttonStyle(PressButtonStyle())
    }

    private func pillBar<Content: View>(@ViewBuilder content: () -> Content) -> some View {
        content()
            .frame(maxWidth: .infinity)
            .padding(.vertical, Theme.Space.s)
    }
}

// A small rotating arc used inside the Apply "Reviewing" state.
private struct MiniSpinner: View {
    @State private var spinning = false
    var body: some View {
        Circle()
            .trim(from: 0, to: 0.75)
            .stroke(Theme.ink, style: StrokeStyle(lineWidth: 2, lineCap: .round))
            .rotationEffect(.degrees(spinning ? 360 : 0))
            .animation(.linear(duration: 0.9).repeatForever(autoreverses: false), value: spinning)
            .onAppear { spinning = true }
    }
}

#Preview("Dark") {
    let world = DemoWorld()
    EventDetailView(eventId: "sunset")
        .environment(world)
        .environment(MemberServices(world: world))
        .environment(MemberRouter())
        .preferredColorScheme(.dark)
}
