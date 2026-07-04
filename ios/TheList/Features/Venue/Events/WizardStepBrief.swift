import SwiftUI

// Web `StepBrief` — step 4 of the post wizard: arrival window, dress code,
// meeting point, house rules. All optional.
struct WizardStepBrief: View {
    @Binding var draft: EventDraft
    let onNext: () -> Void
    let onBack: () -> Void

    var body: some View {
        WizardStepScaffold(step: 4, title: "Brief", subtitle: "Guest instructions · all optional", leading: "Back", onLeading: onBack) {
            VStack(alignment: .leading, spacing: Theme.Space.l) {
                WizardField(label: "Arrival window") {
                    WizardTextField(text: $draft.brief.arrivalWindow, placeholder: "21:30 – 22:30")
                }
                WizardField(label: "Dress code") {
                    WizardTextField(text: $draft.brief.dressCode, placeholder: "Smart dark")
                }
                WizardField(label: "Meeting point") {
                    WizardTextField(text: $draft.brief.meetingPoint, placeholder: "Door host")
                }
                WizardField(label: "House rules") {
                    WizardTextField(text: $draft.brief.houseRules, placeholder: "1 Story + venue tag during the event")
                }
                Text("We handle all guest comms.")
                    .font(Typography.body(11, weight: .regular))
                    .foregroundStyle(Theme.inkMute)
                    .padding(.top, Theme.Space.xs)
            }
        } footer: {
            WizardNextButton(enabled: true, action: onNext)
        }
    }
}

#Preview("Dark") {
    WizardStepBrief(draft: .constant(EventDraft(newId: "evt-preview", venueHeroImageName: "beachClub")), onNext: {}, onBack: {})
        .appGround()
        .preferredColorScheme(.dark)
}
