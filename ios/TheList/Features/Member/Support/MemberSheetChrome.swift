import SwiftUI

// Shared bottom-sheet chrome (web `.sheet`): a frosted, theme-tinted presentation
// background (Material + Theme.Glass.sheet tint — the glass quality bar), a visible
// grabber, and the web's 28pt top corner radius. Every member sheet applies this so
// they read identically. Content supplies its own header/close row + padding.
struct MemberSheetChrome: ViewModifier {
    var detents: Set<PresentationDetent> = [.large]

    func body(content: Content) -> some View {
        content
            .presentationDetents(detents)
            .presentationDragIndicator(.visible)
            .presentationCornerRadius(Theme.Radius.sheet)
            .presentationBackground {
                Theme.Glass.sheet.background(.ultraThinMaterial)
            }
    }
}

extension View {
    func memberSheetChrome(detents: Set<PresentationDetent> = [.large]) -> some View {
        modifier(MemberSheetChrome(detents: detents))
    }
}

// The header row every sheet opens with: a display title + a glass close button.
struct SheetHeader: View {
    let title: String
    let onClose: () -> Void

    var body: some View {
        HStack {
            Text(title)
                .font(Typography.body(22, weight: .bold))
                .tracking(22 * Typography.displayTracking)
                .foregroundStyle(Theme.ink)
            Spacer()
            Button(action: onClose) {
                AppIcon.close.symbol
                    .font(.system(size: 14, weight: .medium))
                    .foregroundStyle(Theme.ink)
                    .frame(width: 32, height: 32)
                    .background(Circle().fill(Theme.elev))
            }
            .buttonStyle(PressButtonStyle())
        }
    }
}
