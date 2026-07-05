import SwiftUI

// Web `StepBundle` — step 3 of the post wizard: pick one of the three fixed
// templates (`EventBundle.catalog`) or Custom with a venue-entered price.
struct WizardStepBundle: View {
    @Binding var draft: EventDraft
    let onNext: () -> Void
    let onBack: () -> Void

    @State private var customPriceText: String = ""

    private var isCustom: Bool { draft.bundle?.name == "Custom" }
    private var canNext: Bool {
        guard let bundle = draft.bundle else { return false }
        if bundle.name == "Custom" { return bundle.price > 0 }
        return true
    }

    var body: some View {
        WizardStepScaffold(step: 3, title: "Bundle", subtitle: "Choose your package", leading: "Back", onLeading: onBack) {
            VStack(spacing: Theme.Space.m) {
                ForEach(EventBundle.catalog) { bundle in templateCard(bundle) }
                customCard
                VStack(alignment: .leading, spacing: Theme.Space.xs) {
                    Text("Settle after the night · Whish / OMT / USD cash")
                    Text("We handle all guest comms.")
                }
                .font(Typography.body(11, weight: .regular))
                .foregroundStyle(Theme.inkMute)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.top, Theme.Space.xs)
            }
        } footer: {
            WizardNextButton(enabled: canNext, action: onNext)
        }
        .onAppear {
            if isCustom, let price = draft.bundle?.price, price > 0 { customPriceText = "\(price)" }
        }
    }

    private func templateCard(_ bundle: EventBundle) -> some View {
        let selected = draft.bundle?.name == bundle.name
        return Button {
            draft.bundle = bundle
            draft.seats = bundle.seats
        } label: {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(bundle.name).font(Typography.body(15, weight: .semibold)).foregroundStyle(Theme.ink)
                    Text("\(bundle.seats) seats").font(Typography.body(10, weight: .medium)).foregroundStyle(Theme.inkMute)
                }
                Spacer()
                Text("$\(bundle.price)")
                    .font(Typography.number(18))
                    .foregroundStyle(selected ? Theme.ice : Theme.ink2)
            }
            .padding(Theme.Space.l)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .buttonStyle(PressButtonStyle())
        .cardGlass(radius: Theme.Radius.tile)
        .overlay {
            if selected {
                RoundedRectangle(cornerRadius: Theme.Radius.tile, style: .continuous)
                    .strokeBorder(Theme.ice, lineWidth: 1.5)
            }
        }
    }

    // NOTE: the web nests the price `<input>` inside the card's own `<button>`
    // (technically invalid HTML the browser tolerates). SwiftUI `Button`s
    // capture every tap in their label, so a `TextField` inside one can never
    // gain focus — the "select Custom" tap target is kept to the header row
    // only; the price field is a sibling underneath it.
    @ViewBuilder
    private var customCard: some View {
        VStack(alignment: .leading, spacing: Theme.Space.m) {
            Button {
                draft.bundle = EventBundle(name: "Custom", seats: draft.totalSeats, price: Int(customPriceText) ?? 0)
            } label: {
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Custom").font(Typography.body(15, weight: .semibold)).foregroundStyle(Theme.ink)
                        Text("Current seats: \(draft.totalSeats)")
                            .font(Typography.body(10, weight: .medium)).foregroundStyle(Theme.inkMute)
                    }
                    Spacer()
                    if isCustom {
                        Text(customPriceText.isEmpty ? "—" : "$\(customPriceText)")
                            .font(Typography.number(18)).foregroundStyle(Theme.ice)
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            .buttonStyle(PressButtonStyle())

            if isCustom {
                VStack(alignment: .leading, spacing: Theme.Space.xs) {
                    Text("Price ($)").font(Typography.body(10, weight: .medium)).foregroundStyle(Theme.inkMute)
                    TextField("", text: Binding(
                        get: { customPriceText },
                        set: { newValue in
                            let digitsOnly = newValue.filter(\.isNumber)
                            customPriceText = digitsOnly
                            draft.bundle = EventBundle(name: "Custom", seats: draft.totalSeats, price: Int(digitsOnly) ?? 0)
                        }
                    ), prompt: Text("e.g. 500").foregroundStyle(Theme.inkMute))
                    .keyboardType(.numberPad)
                    .font(Typography.body(14, weight: .regular))
                    .foregroundStyle(Theme.ink)
                    .padding(.horizontal, Theme.Space.m)
                    .frame(height: 40)
                    .background(RoundedRectangle(cornerRadius: 10, style: .continuous).fill(Theme.elev2))
                    .overlay(RoundedRectangle(cornerRadius: 10, style: .continuous).strokeBorder(Theme.line2, lineWidth: 1))
                }
            }
        }
        .padding(Theme.Space.l)
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardGlass(radius: Theme.Radius.tile)
        .overlay {
            if isCustom {
                RoundedRectangle(cornerRadius: Theme.Radius.tile, style: .continuous)
                    .strokeBorder(Theme.ice, lineWidth: 1.5)
            }
        }
    }
}

#Preview("Dark") {
    WizardStepBundle(draft: .constant(EventDraft(newId: "evt-preview", venueHeroImageName: "beachClub")), onNext: {}, onBack: {})
        .appGround()
        .preferredColorScheme(.dark)
}
