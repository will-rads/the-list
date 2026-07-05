import SwiftUI

// Web `FilterSheet` — vertical / distance / when selectors. Cosmetic in the
// prototype (the room list filters by the top chips), but ported for fidelity:
// verticals multi-select, distance single-select, when single-select, plus Reset
// and "Show rooms".
struct ExploreFilterSheet: View {
    @Binding var filters: AdvancedFilters
    let onClose: () -> Void

    private let verticals = ["Beach", "Club", "Restaurant", "Lounge", "Gym", "Rooftop"]
    private let distances = ["< 5 km", "5 – 15 km", "15 – 30 km", "Beirut + Mount"]
    private let timings = ["Tonight", "This week", "Anytime"]

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: Theme.Space.l) {
                SheetHeader(title: "Filters", onClose: onClose)

                stamp("Vertical")
                WrapChips(items: verticals, isOn: { filters.verticals.contains($0) }, tone: .ink) { v in
                    if filters.verticals.contains(v) { filters.verticals.remove(v) }
                    else { filters.verticals.insert(v) }
                }

                stamp("Distance")
                WrapChips(items: distances, isOn: { filters.distance == $0 }, tone: .ice) { d in
                    filters.distance = filters.distance == d ? nil : d
                }

                stamp("When")
                HStack(spacing: Theme.Space.s) {
                    ForEach(timings, id: \.self) { t in
                        let on = filters.timing == t
                        Button { filters.timing = t } label: {
                            Text(t)
                                .font(Typography.body(12, weight: .medium))
                                .foregroundStyle(on ? Theme.bg : Theme.ink)
                                .frame(maxWidth: .infinity)
                                .frame(height: 40)
                                .background {
                                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                                        .fill(on ? Theme.ink : .clear)
                                        .overlay {
                                            if !on {
                                                RoundedRectangle(cornerRadius: 12, style: .continuous)
                                                    .strokeBorder(Theme.line2, lineWidth: 1)
                                            }
                                        }
                                }
                        }
                        .buttonStyle(PressButtonStyle())
                    }
                }

                HStack(spacing: Theme.Space.s) {
                    Button { filters = AdvancedFilters() } label: {
                        Text("Reset")
                            .font(Typography.body(12, weight: .medium))
                            .foregroundStyle(Theme.ink)
                            .frame(maxWidth: .infinity).frame(height: 48)
                            .overlay(Capsule().strokeBorder(Theme.line2, lineWidth: 1))
                    }
                    .buttonStyle(PressButtonStyle())
                    Button(action: onClose) {
                        Text("Show rooms")
                            .font(Typography.body(13, weight: .semibold))
                            .foregroundStyle(Theme.iceInk)
                            .frame(maxWidth: .infinity).frame(height: 48)
                            .background(Capsule().fill(Theme.ice))
                    }
                    .buttonStyle(PressButtonStyle())
                    .frame(maxWidth: .infinity)
                }
                .padding(.top, Theme.Space.s)
            }
            .padding(.horizontal, Theme.Space.xl)
            .padding(.top, Theme.Space.l)
            .padding(.bottom, Theme.Space.xxl)
        }
    }

    private func stamp(_ text: String) -> some View {
        Text(text)
            .font(Typography.body(10, weight: .medium))
            .foregroundStyle(Theme.inkMute)
    }
}

// A flow of pill chips wrapping to multiple lines.
private struct WrapChips: View {
    enum Tone { case ink, ice }
    let items: [String]
    let isOn: (String) -> Bool
    var tone: Tone = .ink
    let onTap: (String) -> Void

    // A simple two-column-friendly flow using a fixed-width flexible wrap.
    private let columns = [GridItem(.adaptive(minimum: 90), spacing: Theme.Space.s, alignment: .leading)]

    var body: some View {
        LazyVGrid(columns: columns, alignment: .leading, spacing: Theme.Space.s) {
            ForEach(items, id: \.self) { item in
                let on = isOn(item)
                Button { onTap(item) } label: {
                    Text(item)
                        .font(Typography.body(12, weight: .medium))
                        .foregroundStyle(chipInk(on: on))
                        .frame(maxWidth: .infinity)
                        .frame(height: 32)
                        .background {
                            if on {
                                Capsule().fill(tone == .ice ? Theme.ice : Theme.ink)
                                    .shadow(color: Theme.iceGlow, radius: 8)
                            } else {
                                Capsule().strokeBorder(Theme.line2, lineWidth: 1)
                            }
                        }
                }
                .buttonStyle(PressButtonStyle())
            }
        }
    }

    private func chipInk(on: Bool) -> Color {
        guard on else { return Theme.ink }
        return tone == .ice ? Theme.iceInk : Theme.bg
    }
}

// Web `CalendarSheet` — full month of May, event days [24, 25, 30, 31] tappable,
// 3 leading blanks (May starts Thursday, Mon-first grid).
struct ExploreCalendarSheet: View {
    let activeDay: Int
    let onPick: (Int) -> Void

    private let eventDays: Set<Int> = [24, 25, 30, 31]
    private let blanks = 3
    private let weekdayHeads = ["M", "T", "W", "T", "F", "S", "S"]
    private let columns = Array(repeating: GridItem(.flexible()), count: 7)

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Space.l) {
            SheetHeader(title: "May", onClose: { onPick(activeDay) })

            LazyVGrid(columns: columns, spacing: Theme.Space.s) {
                ForEach(Array(weekdayHeads.enumerated()), id: \.offset) { _, w in
                    Text(w)
                        .font(Typography.body(10, weight: .medium))
                        .foregroundStyle(Theme.inkMute)
                        .frame(maxWidth: .infinity)
                }
                ForEach(0..<blanks, id: \.self) { _ in
                    Color.clear.frame(width: 36, height: 36)
                }
                ForEach(1...31, id: \.self) { day in
                    dayCell(day)
                }
            }
        }
        .padding(.horizontal, Theme.Space.xl)
        .padding(.top, Theme.Space.l)
        .padding(.bottom, Theme.Space.xxl)
    }

    @ViewBuilder
    private func dayCell(_ day: Int) -> some View {
        let has = eventDays.contains(day)
        let selected = day == activeDay
        Button {
            if has { onPick(day) }
        } label: {
            VStack(spacing: 3) {
                Text("\(day)")
                    .font(Typography.number(13))
                    .foregroundStyle(selected ? Theme.iceInk : Theme.ink)
                if has {
                    Circle()
                        .fill(selected ? Theme.iceInk : Theme.ice)
                        .frame(width: 4, height: 4)
                }
            }
            .frame(width: 36, height: 36)
            .background(Circle().fill(selected ? Theme.ice : .clear))
        }
        .buttonStyle(PressButtonStyle())
        .disabled(!has)
    }
}
