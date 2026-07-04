import SwiftUI

// The one action control. Primary = ice fill (the single affirmative action);
// ghost = outline. Optional trailing arrow. Web: chip-ice fill + .press scale.
struct PillButton: View {
    enum Style { case primary, ghost }

    let title: String
    var style: Style = .primary
    var trailingArrow: Bool = false
    var expands: Bool = true
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: Theme.Space.s) {
                Text(title)
                    .font(Typography.body(15, weight: .semibold))
                if trailingArrow {
                    AppIcon.arrowRight.symbol
                        .font(.system(size: 14, weight: .semibold))
                }
            }
            .padding(.vertical, 14)
            .padding(.horizontal, Theme.Space.xl)
            .frame(maxWidth: expands ? .infinity : nil)
            .foregroundStyle(style == .primary ? Theme.iceInk : Theme.ink)
            .background {
                if style == .primary { Capsule().fill(Theme.ice) }
            }
            .overlay {
                if style == .ghost {
                    Capsule().strokeBorder(Theme.line2, lineWidth: Theme.Stroke.hairline)
                }
            }
            .contentShape(Capsule())
        }
        .buttonStyle(PressButtonStyle())
    }
}

// Shared press feel: web .press (scale .97 + slight fade on active).
struct PressButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.97 : 1)
            .opacity(configuration.isPressed ? 0.85 : 1)
            .animation(.easeOut(duration: 0.12), value: configuration.isPressed)
    }
}

#Preview("Dark") { PillButtonPreview().preferredColorScheme(.dark) }
#Preview("Light") { PillButtonPreview().preferredColorScheme(.light) }

private struct PillButtonPreview: View {
    var body: some View {
        VStack(spacing: Theme.Space.m) {
            PillButton(title: "Apply for tonight", trailingArrow: true) {}
            PillButton(title: "View pass", style: .ghost) {}
            PillButton(title: "Share", style: .ghost, expands: false) {}
        }
        .padding(Theme.Space.xl)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .appGround()
    }
}
