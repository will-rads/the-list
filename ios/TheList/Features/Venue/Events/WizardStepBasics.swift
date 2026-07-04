import SwiftUI

// Web `StepBasics` — step 1 of the post wizard: title, type, date, time, and
// when applications close.
struct WizardStepBasics: View {
    @Binding var draft: EventDraft
    let onNext: () -> Void
    let onCancel: () -> Void

    private let closesChips = ["24h before doors", "48h before doors", "Custom"]
    private let presetCloses = ["24h before doors", "48h before doors"]

    /// True whenever `closesAt` isn't one of the two fixed presets — covers
    /// both "just switched to Custom, box still empty" and an already-typed
    /// custom string (web `customMode` state).
    private var customMode: Bool { !presetCloses.contains(draft.closesAt) }

    var body: some View {
        WizardStepScaffold(step: 1, title: "Post", subtitle: "The basics", leading: "Cancel", onLeading: onCancel) {
            VStack(alignment: .leading, spacing: Theme.Space.l) {
                WizardField(label: "Title") {
                    WizardTextField(text: $draft.title, placeholder: "e.g. Pool Day")
                }
                WizardField(label: "Type") {
                    PillFlow(items: VenueCatalog.venueTypes, isSelected: { $0 == draft.type }) { draft.type = $0 }
                }
                WizardField(label: "Date") {
                    WizardTextField(text: $draft.date, placeholder: "Sun · 25 May")
                }
                WizardField(label: "Time") {
                    WizardTextField(text: $draft.time, placeholder: "22:00")
                }
                WizardField(label: "Applications close") {
                    VStack(alignment: .leading, spacing: Theme.Space.s) {
                        PillFlow(items: closesChips, isSelected: isChipSelected) { pick($0) }
                        if customMode {
                            WizardTextField(text: $draft.closesAt, placeholder: "Fri · 30 May · 20:00")
                        }
                    }
                }
            }
        } footer: {
            WizardNextButton(enabled: draft.basicsValid, action: onNext)
        }
    }

    private func isChipSelected(_ chip: String) -> Bool {
        chip == "Custom" ? customMode : (!customMode && draft.closesAt == chip)
    }

    private func pick(_ chip: String) {
        if chip == "Custom" {
            draft.closesAt = ""
        } else {
            draft.closesAt = chip
        }
    }
}

// MARK: - Shared wizard chrome

/// Every wizard step: a top leading link ("Back"/"Cancel"), the display
/// title, the numbered step indicator, a subtitle, scrollable content, and a
/// pinned footer.
struct WizardStepScaffold<Content: View, Footer: View>: View {
    let step: Int
    let title: String
    var subtitle: String? = nil
    let leading: String
    let onLeading: () -> Void
    @ViewBuilder var content: Content
    @ViewBuilder var footer: Footer

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Button(action: onLeading) {
                Text(leading)
                    .font(Typography.body(10, weight: .medium))
                    .foregroundStyle(Theme.inkMute)
            }
            .buttonStyle(.plain)
            .padding(.bottom, Theme.Space.s)

            Text(title)
                .font(Typography.display(40))
                .tracking(40 * Typography.displayTracking)
                .foregroundStyle(Theme.ink)

            StepIndicator(current: step, total: 6)
                .padding(.top, Theme.Space.m)

            if let subtitle {
                Text(subtitle)
                    .font(Typography.body(13, weight: .regular))
                    .foregroundStyle(Theme.ink2)
                    .padding(.top, Theme.Space.s)
            }

            ScrollView(showsIndicators: false) {
                content.padding(.vertical, Theme.Space.l)
            }

            footer
        }
        .padding(.horizontal, Theme.Space.xl)
        .padding(.top, 64)
        .padding(.bottom, Theme.Space.xl)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
        .background(Theme.bg)
    }
}

struct WizardField<Content: View>: View {
    let label: String
    @ViewBuilder var content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Space.s) {
            Text(label)
                .font(Typography.body(10, weight: .medium))
                .foregroundStyle(Theme.inkMute)
            content
        }
    }
}

struct WizardTextField: View {
    @Binding var text: String
    let placeholder: String
    var keyboard: UIKeyboardType = .default

    var body: some View {
        TextField("", text: $text, prompt: Text(placeholder).foregroundStyle(Theme.inkMute))
            .keyboardType(keyboard)
            .font(Typography.body(15, weight: .regular))
            .foregroundStyle(Theme.ink)
            .padding(.horizontal, Theme.Space.m)
            .frame(height: 44)
            .background(RoundedRectangle(cornerRadius: 12, style: .continuous).fill(Theme.elev))
            .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).strokeBorder(Theme.line2, lineWidth: 1))
    }
}

struct WizardNextButton: View {
    var title: String = "Next"
    let enabled: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(Typography.body(14, weight: .semibold))
                .foregroundStyle(enabled ? Theme.iceInk : Theme.inkMute)
                .frame(maxWidth: .infinity)
                .frame(height: 58)
                .background(Capsule().fill(enabled ? Theme.ice : Theme.elev2))
        }
        .buttonStyle(PressButtonStyle())
        .disabled(!enabled)
    }
}

#Preview("Dark") {
    WizardStepBasics(draft: .constant(EventDraft(newId: "evt-preview", venueHeroImageName: "beachClub")), onNext: {}, onCancel: {})
        .appGround()
        .preferredColorScheme(.dark)
}
