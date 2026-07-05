import SwiftUI

// Web `ScreenPostEvent` — the 6-step post wizard container: Basics → Seats →
// Bundle → Brief → Image → Review. `editingEventId` non-nil prefills from an
// existing draft-stage event (web `initialDraft`/`draftId`) and swaps the
// final CTA to "Save & publish".
struct PostWizardView: View {
    @Environment(DemoWorld.self) private var world
    @Environment(VenueServices.self) private var services
    @Environment(VenueRouter.self) private var router

    let editingEventId: String?

    private enum Sub: Hashable { case basics, seats, bundle, brief, image, review }

    @State private var sub: Sub = .basics
    @State private var draft: EventDraft?

    var body: some View {
        ZStack {
            if let bound = Binding($draft) {
                stepContent(bound)
            }
        }
        .appGround()
        .task { seedIfNeeded() }
    }

    @ViewBuilder
    private func stepContent(_ draft: Binding<EventDraft>) -> some View {
        switch sub {
        case .basics:
            WizardStepBasics(draft: draft, onNext: { sub = .seats }, onCancel: cancel)
        case .seats:
            WizardStepSeats(draft: draft, onNext: { sub = .bundle }, onBack: { sub = .basics })
        case .bundle:
            WizardStepBundle(draft: draft, onNext: { sub = .brief }, onBack: { sub = .seats })
        case .brief:
            WizardStepBrief(draft: draft, onNext: { sub = .image }, onBack: { sub = .bundle })
        case .image:
            WizardStepImage(draft: draft, onPicked: { sub = .review }, onBack: { sub = .brief })
        case .review:
            WizardStepReview(
                draft: draft.wrappedValue, isEdit: editingEventId != nil,
                onBack: { sub = .image }, onPublish: publish
            )
        }
    }

    private func seedIfNeeded() {
        guard draft == nil else { return }
        if let id = editingEventId, let event = world.events.first(where: { $0.id == id }) {
            draft = EventDraft(prefilling: event)
        } else {
            draft = EventDraft(newId: newDraftId(), venueHeroImageName: world.venueProfile.heroImageName)
        }
    }

    private func newDraftId() -> String {
        var candidate = ""
        repeat {
            candidate = "evt-" + UUID().uuidString.prefix(6).lowercased()
        } while world.events.contains { $0.id == candidate }
        return candidate
    }

    private func cancel() {
        if editingEventId != nil { router.toast("Draft unchanged") }
        router.closeOverlay()
    }

    private func publish() {
        guard let draft else { return }
        let item = draft.makeEventItem(venue: world.venueProfile)
        Task {
            await services.venue.publish(item)
            router.closeOverlay()
            router.selectTab(.events)
        }
    }
}

#Preview("Dark") {
    let world = DemoWorld()
    PostWizardView(editingEventId: nil)
        .environment(world)
        .environment(VenueServices(world: world))
        .environment(VenueRouter())
        .preferredColorScheme(.dark)
}
