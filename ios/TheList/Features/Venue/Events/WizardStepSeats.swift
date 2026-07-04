import SwiftUI

// Web `ScreenPostEvent`'s `sub === "seats"` branch — step 2: an optional
// gender mix (Girls/Guys steppers) or a flat total-seats stepper.
struct WizardStepSeats: View {
    @Binding var draft: EventDraft
    let onNext: () -> Void
    let onBack: () -> Void

    private var noPref: Bool { draft.mix == nil }

    var body: some View {
        WizardStepScaffold(step: 2, title: "Seats", subtitle: "Who fills the room", leading: "Back", onLeading: onBack) {
            VStack(alignment: .leading, spacing: 0) {
                HStack {
                    Text("Set a gender mix").font(Typography.body(15, weight: .regular)).foregroundStyle(Theme.ink)
                    Spacer()
                    Button(action: toggleMix) {
                        Text(noPref ? "Off" : "On")
                            .font(Typography.body(11, weight: .medium))
                            .foregroundStyle(noPref ? Theme.ink : Theme.iceInk)
                            .padding(.horizontal, Theme.Space.m)
                            .frame(height: 32)
                            .background {
                                if noPref {
                                    Capsule().strokeBorder(Theme.line2, lineWidth: 1)
                                } else {
                                    Capsule().fill(Theme.ice)
                                }
                            }
                    }
                    .buttonStyle(PressButtonStyle())
                }
                .padding(.vertical, Theme.Space.m)
                .overlay(alignment: .bottom) { HairlineDivider(color: Theme.line) }

                if noPref {
                    stepperRow("Total seats", value: draft.seats) { draft.seats = max(1, draft.seats + $0) }
                } else if let mix = draft.mix {
                    stepperRow("Girls", value: mix.girls) { delta in
                        draft.mix?.girls = max(0, mix.girls + delta)
                    }
                    stepperRow("Guys", value: mix.guys) { delta in
                        draft.mix?.guys = max(0, mix.guys + delta)
                    }
                }

                Text("\(draft.totalSeats) seats total")
                    .font(Typography.body(10, weight: .medium))
                    .foregroundStyle(Theme.inkMute)
                    .padding(.top, Theme.Space.m)
            }
        } footer: {
            WizardNextButton(enabled: draft.totalSeats >= 1, action: onNext)
        }
    }

    private func toggleMix() {
        draft.mix = noPref ? EventItem.Mix(girls: 15, guys: 5) : nil
    }

    private func stepperRow(_ label: String, value: Int, onDelta: @escaping (Int) -> Void) -> some View {
        HStack {
            Text(label).font(Typography.body(15, weight: .regular)).foregroundStyle(Theme.ink)
            Spacer()
            HStack(spacing: Theme.Space.l) {
                stepButton("–") { onDelta(-1) }
                Text("\(value)")
                    .font(Typography.number(20))
                    .foregroundStyle(Theme.ice)
                    .frame(width: 32)
                stepButton("+") { onDelta(1) }
            }
        }
        .padding(.vertical, Theme.Space.m)
    }

    private func stepButton(_ symbol: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(symbol)
                .font(Typography.body(15, weight: .medium))
                .foregroundStyle(Theme.ink)
                .frame(width: 36, height: 36)
                .overlay(Circle().strokeBorder(Theme.line2, lineWidth: 1))
        }
        .buttonStyle(PressButtonStyle())
    }
}

#Preview("Dark") {
    WizardStepSeats(draft: .constant(EventDraft(newId: "evt-preview", venueHeroImageName: "beachClub")), onNext: {}, onBack: {})
        .appGround()
        .preferredColorScheme(.dark)
}
