import SwiftUI

// Explore-local sheets (web filter/calendar overlays) — boolean toggles with no
// model, unified into one enum for `.sheet(item:)`.
enum ExploreSheet: String, Identifiable {
    case filter, calendar
    var id: String { rawValue }
}

// The advanced filter selection (web `advFilters`). Cosmetic in the prototype —
// the room list filters by the top type chips only; this drives the Filters badge.
struct AdvancedFilters: Equatable {
    var verticals: Set<String> = []
    var distance: String?
    var timing: String = "Tonight"

    var activeCount: Int {
        verticals.count + (distance == nil ? 0 : 1) + (timing == "Tonight" ? 0 : 1)
    }
}

// Web `ScreenExplore` — a date strip (23 Fri – 28 Wed), type filter chips, and the
// browseable room list (open + locked only; cancelled/past/draft never shown) with
// a lead editorial card + denser index rows, plus the "No rooms match" empty state.
struct ExploreView: View {
    @Environment(DemoWorld.self) private var world
    @Environment(MemberRouter.self) private var router

    @State private var typeFilter = "all"
    @State private var selectedDay = 25
    @State private var sheet: ExploreSheet?
    @State private var advFilters = AdvancedFilters()

    private let days: [(day: Int, weekday: String)] = [
        (23, "Fri"), (24, "Sat"), (25, "Sun"), (26, "Mon"), (27, "Tue"), (28, "Wed"),
    ]
    private let typeFilters = ["all", "beach", "club", "restaurant", "lounge"]

    private var browseable: [EventItem] {
        world.events.filter {
            $0.isVisibleToMembers && $0.stage != .cancelled && $0.stage != .past
        }
    }
    private var list: [EventItem] {
        typeFilter == "all" ? browseable : browseable.filter { $0.type.lowercased() == typeFilter }
    }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 0) {
                header
                dateStrip.padding(.top, Theme.Space.l)
                filterChips.padding(.top, Theme.Space.l)

                SectionHead(label: "\(list.count) rooms", right: "Closes soonest")
                    .padding(.top, Theme.Space.xl)
                    .padding(.bottom, Theme.Space.m)

                if list.isEmpty {
                    emptyState
                } else {
                    roomList
                }

                Color.clear.frame(height: MemberLayout.dockClearance)
            }
            .padding(.top, 60)
        }
        .sheet(item: $sheet) { which in
            switch which {
            case .filter:
                ExploreFilterSheet(filters: $advFilters) { sheet = nil }
                    .memberSheetChrome(detents: [.large])
            case .calendar:
                ExploreCalendarSheet(activeDay: selectedDay) { day in
                    selectDay(day)
                    sheet = nil
                }
                .memberSheetChrome(detents: [.medium, .large])
            }
        }
    }

    // MARK: Header

    private var header: some View {
        HStack(alignment: .bottom) {
            Text("Explore")
                .font(Typography.display(40))
                .tracking(40 * Typography.displayTracking)
                .foregroundStyle(Theme.ink)
                .shadow(color: Theme.textShadow, radius: 20)
            Spacer()
            HStack(spacing: Theme.Space.s) {
                GlassIconButton(icon: .calendar, size: 36, iconSize: 15) { sheet = .calendar }
                Button { sheet = .filter } label: {
                    HStack(spacing: 6) {
                        AppIcon.sliders.symbol.font(.system(size: 13, weight: .medium))
                        Text("Filters").font(Typography.body(11, weight: .medium))
                        if advFilters.activeCount > 0 {
                            Text("\(advFilters.activeCount)")
                                .font(Typography.number(10))
                                .foregroundStyle(Theme.iceInk)
                                .frame(width: 16, height: 16)
                                .background(Circle().fill(Theme.ice))
                        }
                    }
                    .foregroundStyle(Theme.ink)
                    .padding(.horizontal, Theme.Space.m)
                    .frame(height: 36)
                    .overImageGlass(radius: Theme.Radius.pill)
                }
                .buttonStyle(PressButtonStyle())
            }
        }
        .padding(.horizontal, MemberLayout.hInset)
    }

    // MARK: Date strip

    private var dateStrip: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: Theme.Space.s) {
                ForEach(days, id: \.day) { entry in
                    let on = entry.day == selectedDay
                    Button { selectDay(entry.day) } label: {
                        VStack(spacing: Theme.Space.xs) {
                            Text("\(entry.day)").font(Typography.number(20))
                            Text(entry.weekday)
                                .font(Typography.body(9, weight: .medium)).opacity(0.75)
                        }
                        .foregroundStyle(on ? Theme.iceInk : Theme.ink)
                        .frame(width: 58, height: 68)
                        .background {
                            RoundedRectangle(cornerRadius: 12, style: .continuous)
                                .fill(on ? Theme.ice : .clear)
                                .overlay {
                                    if !on {
                                        RoundedRectangle(cornerRadius: 12, style: .continuous)
                                            .strokeBorder(Theme.line2, lineWidth: 1)
                                    }
                                }
                        }
                        .shadow(color: on ? Theme.iceGlow : .clear, radius: 10)
                    }
                    .buttonStyle(PressButtonStyle())
                }
            }
            .padding(.horizontal, MemberLayout.hInset)
        }
    }

    // MARK: Type filter chips

    private var filterChips: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: Theme.Space.s) {
                ForEach(typeFilters, id: \.self) { key in
                    let on = typeFilter == key
                    Button { typeFilter = key } label: {
                        Text(key.prefix(1).uppercased() + String(key.dropFirst()))
                            .font(Typography.body(11, weight: .medium))
                            .foregroundStyle(on ? Theme.bg : Theme.ink)
                            .padding(.horizontal, Theme.Space.m)
                            .frame(height: 32)
                            .background {
                                if on {
                                    Capsule().fill(Theme.ink).shadow(color: Theme.iceGlow, radius: 10)
                                } else {
                                    Capsule().strokeBorder(Theme.line2, lineWidth: 1)
                                }
                            }
                    }
                    .buttonStyle(PressButtonStyle())
                }
            }
            .padding(.horizontal, MemberLayout.hInset)
        }
    }

    // MARK: Room list

    @ViewBuilder
    private var roomList: some View {
        let lead = list.first
        let rest = Array(list.dropFirst())
        VStack(alignment: .leading, spacing: 0) {
            if let lead {
                ExploreLeadCard(event: lead)
                    .padding(.horizontal, MemberLayout.hInset)
            }
            if !rest.isEmpty {
                VStack(spacing: Theme.Space.s) {
                    ForEach(rest) { event in
                        ExploreIndexRow(event: event) { router.openEventDetail(event.id) }
                    }
                }
                .padding(.horizontal, MemberLayout.hInset)
                .padding(.top, Theme.Space.xl)
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: Theme.Space.s) {
            Text("No rooms match")
                .font(Typography.body(14, weight: .bold))
                .foregroundStyle(Theme.inkMute)
            Text("Loosen a filter or widen the date.")
                .font(Typography.body(13, weight: .regular))
                .foregroundStyle(Theme.inkMute)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 80)
        .shadow(color: Theme.textShadow, radius: 8, y: 1)
    }

    // MARK: Actions

    private func selectDay(_ day: Int) {
        selectedDay = day
        router.toast("Showing \(weekday(for: day)) · \(day) May")
    }

    private func weekday(for day: Int) -> String {
        let names = ["Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Wed"]
        return names[(day - 1) % 7]
    }
}

// MARK: - Lead card

private struct ExploreLeadCard: View {
    @Environment(MemberRouter.self) private var router
    let event: EventItem

    var body: some View {
        Button { router.openEventDetail(event.id) } label: {
            ZStack(alignment: .bottom) {
                VenuePhoto(key: event.imageName)
                    .frame(height: 300)
                    .frame(maxWidth: .infinity)
                    .clipped()
                MemberPalette.leadScrim

                HStack(alignment: .bottom) {
                    VStack(alignment: .leading, spacing: 6) {
                        Text(event.title)
                            .font(Typography.display(34))
                            .tracking(34 * Typography.displayTracking)
                            .foregroundStyle(MemberPalette.onPhoto)
                        Text("\(event.venueName) · \(event.area)")
                            .font(Typography.body(12, weight: .regular))
                            .foregroundStyle(MemberPalette.onPhoto.opacity(0.8))
                            .lineLimit(1)
                    }
                    Spacer(minLength: Theme.Space.m)
                    VStack(alignment: .trailing, spacing: 2) {
                        Text(MemberFormatting.weekdayPart(event.date))
                            .font(Typography.number(11)).foregroundStyle(Theme.ice)
                        Text(event.time)
                            .font(Typography.number(11)).foregroundStyle(MemberPalette.onPhoto)
                        HStack(spacing: 3) {
                            Text("\(event.seats)").foregroundStyle(Theme.ice)
                            Text("seats").foregroundStyle(MemberPalette.onPhoto)
                        }
                        .font(Typography.number(12))
                        .padding(.top, 2)
                    }
                }
                .padding(Theme.Space.l)
            }
            .overlay(alignment: .topLeading) {
                HStack(spacing: 6) {
                    Text(event.type)
                        .font(Typography.body(10, weight: .medium))
                        .foregroundStyle(MemberPalette.onPhoto)
                        .padding(.horizontal, Theme.Space.s)
                        .padding(.vertical, 4)
                        .overImageGlass(radius: Theme.Radius.pill)
                    if !event.memberBadge.isEmpty {
                        StatusPill(label: event.memberBadge, tone: .ice)
                    }
                }
                .padding(Theme.Space.m)
            }
            .overlay(alignment: .topTrailing) {
                SaveButton(saved: router.saved.contains(event.id)) {
                    router.toggleSave(event.id)
                }
                .padding(Theme.Space.m)
            }
            .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.tile, style: .continuous))
            .cardGlass(radius: Theme.Radius.tile)
        }
        .buttonStyle(PressButtonStyle())
    }
}

// MARK: - Index row

private struct ExploreIndexRow: View {
    let event: EventItem
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: Theme.Space.m) {
                VenuePhoto(key: event.imageName)
                    .frame(width: 56, height: 64)
                    .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                VStack(alignment: .leading, spacing: 2) {
                    Text(event.type)
                        .font(Typography.body(10, weight: .medium)).foregroundStyle(Theme.inkMute)
                    Text(event.title)
                        .font(Typography.display(17))
                        .tracking(17 * Typography.displayTracking)
                        .foregroundStyle(Theme.ink)
                    Text("\(event.venueName) · \(event.area)")
                        .font(Typography.body(11, weight: .regular))
                        .foregroundStyle(Theme.inkMute).lineLimit(1)
                }
                Spacer(minLength: Theme.Space.s)
                VStack(alignment: .trailing, spacing: 2) {
                    HStack(spacing: 3) {
                        Text("\(event.seats)").foregroundStyle(Theme.ice)
                        Text("seats").foregroundStyle(Theme.inkMute)
                    }
                    .font(Typography.number(12))
                    Text(event.time)
                        .font(Typography.number(11)).foregroundStyle(Theme.inkMute)
                }
            }
            .padding(10)
            .frame(maxWidth: .infinity, alignment: .leading)
            .cardGlass(radius: Theme.Radius.control)
        }
        .buttonStyle(PressButtonStyle())
    }
}

#Preview("Dark") {
    let world = DemoWorld()
    ExploreView()
        .appGround()
        .environment(world)
        .environment(MemberServices(world: world))
        .environment(MemberRouter())
        .preferredColorScheme(.dark)
}
