import SwiftUI

// Web `BriefBlock` — the Brief: arrival window, dress code, meeting point, house
// rules in a glass card under a "The brief" stamp, with the concierge reassurance
// line beneath. Shared by the Pass and the My Events confirmed card.
struct BriefBlock: View {
    let brief: EventBrief

    private var rows: [(String, String)] {
        [
            ("Arrival window", brief.arrivalWindow),
            ("Dress code", brief.dressCode),
            ("Meeting point", brief.meetingPoint),
            ("House rules", brief.houseRules),
        ].filter { !$0.1.isEmpty }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Space.s) {
            Text("The brief")
                .font(Typography.body(10, weight: .medium))
                .foregroundStyle(Theme.inkMute)
                .shadow(color: Theme.textShadow, radius: 8, y: 1)

            VStack(spacing: 0) {
                ForEach(Array(rows.enumerated()), id: \.offset) { index, row in
                    if index > 0 {
                        HairlineDivider(color: Theme.line)
                    }
                    HStack(alignment: .top, spacing: Theme.Space.l) {
                        Text(row.0)
                            .font(Typography.body(11, weight: .regular))
                            .foregroundStyle(Theme.inkMute)
                        Spacer(minLength: Theme.Space.m)
                        Text(row.1)
                            .font(Typography.body(13, weight: .regular))
                            .foregroundStyle(Theme.ink)
                            .multilineTextAlignment(.trailing)
                    }
                    .padding(.vertical, Theme.Space.m)
                }
            }
            .padding(.horizontal, Theme.Space.l)
            .cardGlass(radius: Theme.Radius.control)

            Text(brief.conciergeLine)
                .font(Typography.body(11, weight: .regular))
                .foregroundStyle(Theme.inkMute)
                .padding(.top, 2)
        }
    }
}

#Preview("Dark") {
    BriefBlock(brief: EventBrief(
        arrivalWindow: "14:00 – 15:00", dressCode: "Beach chic",
        meetingPoint: "Host stand — ask for Rami",
        houseRules: "1 Story + venue tag during the event"
    ))
    .padding(Theme.Space.xl)
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .appGround()
    .preferredColorScheme(.dark)
}
