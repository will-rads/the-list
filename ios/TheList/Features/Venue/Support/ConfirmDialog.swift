import SwiftUI

// Web `ConfirmDialog` — the generic bottom-sheet confirm reused by Cancel
// event / Close applications / Close the night. No member-side equivalent
// exists (the member flows never ask a yes/no before mutating), so this is a
// venue-only shared component. Presented via `VenueRouter.confirm(...)` →
// `VenueSheet.confirm`.
struct ConfirmDialog: View {
    @Environment(VenueRouter.self) private var router
    let spec: ConfirmSpec

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Space.xl) {
            Text(spec.title)
                .font(Typography.display(26))
                .tracking(26 * Typography.displayTracking)
                .foregroundStyle(Theme.ink)
            Text(spec.body)
                .font(Typography.body(13, weight: .regular))
                .foregroundStyle(Theme.ink2)
                .fixedSize(horizontal: false, vertical: true)

            HStack(spacing: Theme.Space.m) {
                PillButton(title: "Keep it", style: .ghost) {
                    router.dismissSheet()
                }
                PillButton(title: spec.confirmLabel) {
                    spec.onConfirm()
                    router.dismissSheet()
                }
            }
        }
        .padding(.horizontal, Theme.Space.xl)
        .padding(.top, Theme.Space.l)
        .padding(.bottom, Theme.Space.xl)
    }
}

#Preview("Dark") {
    let router = VenueRouter()
    Color.clear
        .sheet(isPresented: .constant(true)) {
            ConfirmDialog(spec: ConfirmSpec(
                title: "Cancel this event?",
                body: Copy.cancelEventBody,
                confirmLabel: "Cancel event",
                onConfirm: {}
            ))
            .memberSheetChrome(detents: [.medium])
        }
        .environment(router)
        .preferredColorScheme(.dark)
}
