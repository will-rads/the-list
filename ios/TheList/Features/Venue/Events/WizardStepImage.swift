import SwiftUI

// Web `StepImage` — step 5 of the post wizard: the event photo. Picking a
// preset both sets it and advances to Review in one tap (web `onChange`
// auto-advances; there is no separate "Next" here). See `PresetImagePicker`'s
// doc comment for why this is a preset gallery rather than a free crop tool.
struct WizardStepImage: View {
    @Binding var draft: EventDraft
    let onPicked: () -> Void
    let onBack: () -> Void

    var body: some View {
        WizardStepScaffold(step: 5, title: "Image", subtitle: "The event photo", leading: "Back", onLeading: onBack) {
            VStack(alignment: .leading, spacing: Theme.Space.l) {
                Text("Reuse your venue hero, or choose a new one.")
                    .font(Typography.body(12, weight: .regular))
                    .foregroundStyle(Theme.inkMute)
                PresetImagePicker(selectedKey: draft.imageName) { key in
                    draft.imageName = key
                    onPicked()
                }
            }
        } footer: {
            EmptyView()
        }
    }
}

#Preview("Dark") {
    WizardStepImage(draft: .constant(EventDraft(newId: "evt-preview", venueHeroImageName: "beachClub")), onPicked: {}, onBack: {})
        .appGround()
        .preferredColorScheme(.dark)
}
