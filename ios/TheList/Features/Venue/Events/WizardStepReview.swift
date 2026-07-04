import SwiftUI

// Web `ScreenPostEvent`'s `sub === "review"` branch — step 6: a read-only
// summary, then Publish (or "Save & publish" in edit mode).
struct WizardStepReview: View {
    let draft: EventDraft
    let isEdit: Bool
    let onBack: () -> Void
    let onPublish: () -> Void

    private var briefRows: [(String, String)] {
        [
            ("Arrival window", draft.brief.arrivalWindow),
            ("Dress code", draft.brief.dressCode),
            ("Meeting point", draft.brief.meetingPoint),
            ("House rules", draft.brief.houseRules),
        ].filter { !$0.1.isEmpty }
    }

    var body: some View {
        WizardStepScaffold(step: 6, title: "Review", leading: "Back", onLeading: onBack) {
            VStack(alignment: .leading, spacing: Theme.Space.l) {
                if let imageName = draft.imageName {
                    VenuePhoto(key: imageName)
                        .aspectRatio(4.0 / 5.0, contentMode: .fill)
                        .frame(maxWidth: .infinity)
                        .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.control, style: .continuous))
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text(draft.title)
                        .font(Typography.body(24, weight: .bold))
                        .foregroundStyle(Theme.ink)
                    Text("\(draft.type) · \(draft.date) · \(draft.time)")
                        .font(Typography.body(13, weight: .regular))
                        .foregroundStyle(Theme.inkMute)
                }

                Text(seatsLine)
                    .font(Typography.body(13, weight: .regular))
                    .foregroundStyle(Theme.inkMute)

                if !draft.closesAt.isEmpty {
                    Text("Applications close · \(draft.closesAt)")
                        .font(Typography.body(13, weight: .regular))
                        .foregroundStyle(Theme.inkMute)
                }

                if let bundle = draft.bundle {
                    reviewSection("Bundle") {
                        Text("\(bundle.name) · $\(bundle.price)")
                            .font(Typography.body(14, weight: .regular))
                            .foregroundStyle(Theme.ink)
                    }
                }

                reviewSection("The exchange") {
                    Text(draft.exchange)
                        .font(Typography.body(14, weight: .regular))
                        .foregroundStyle(Theme.ink)
                }

                if !briefRows.isEmpty {
                    reviewSection("Brief") {
                        VStack(alignment: .leading, spacing: 6) {
                            ForEach(briefRows, id: \.0) { row in
                                HStack(alignment: .top, spacing: Theme.Space.s) {
                                    Text(row.0)
                                        .font(Typography.body(13, weight: .regular))
                                        .foregroundStyle(Theme.inkMute)
                                        .frame(width: 110, alignment: .leading)
                                    Text(row.1)
                                        .font(Typography.body(13, weight: .regular))
                                        .foregroundStyle(Theme.ink)
                                }
                            }
                        }
                    }
                }
            }
        } footer: {
            Button(action: onPublish) {
                HStack(spacing: Theme.Space.s) {
                    Text(isEdit ? "Save & publish" : "Publish").font(Typography.body(14, weight: .semibold))
                    AppIcon.arrowRight.symbol.font(.system(size: 16, weight: .semibold))
                }
                .foregroundStyle(Theme.iceInk)
                .frame(maxWidth: .infinity)
                .frame(height: 58)
                .background(Capsule().fill(Theme.ice))
            }
            .buttonStyle(PressButtonStyle())
        }
    }

    private var seatsLine: String {
        if let mix = draft.mix {
            return "Girls \(mix.girls) · Guys \(mix.guys) · \(draft.totalSeats) seats"
        }
        return "\(draft.totalSeats) seats · no gender preference"
    }

    private func reviewSection<Content: View>(_ label: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: Theme.Space.s) {
            Text(label)
                .font(Typography.body(10, weight: .medium))
                .foregroundStyle(Theme.inkMute)
            content()
        }
    }
}

#Preview("Dark") {
    WizardStepReview(
        draft: EventDraft(newId: "evt-preview", venueHeroImageName: "beachClub"),
        isEdit: false, onBack: {}, onPublish: {}
    )
    .appGround()
    .preferredColorScheme(.dark)
}
