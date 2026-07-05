import SwiftUI

// Web `SaveButton` — the bookmark toggle that floats over a photo. Ice-filled when
// saved, over-image glass when not. Used on Home / Explore / Event Detail cards.
struct SaveButton: View {
    let saved: Bool
    var size: CGFloat = 36
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            (saved ? AppIcon.bookmarkFill : AppIcon.bookmark).symbol
                .font(.system(size: size * 0.42, weight: .medium))
                .foregroundStyle(saved ? Theme.iceInk : Theme.ink)
                .frame(width: size, height: size)
                .background {
                    if saved { Circle().fill(Theme.ice) }
                }
                .modifier(SaveGlass(saved: saved, size: size))
                .contentShape(Circle())
        }
        .buttonStyle(PressButtonStyle())
    }
}

// The unsaved state carries the over-image glass; the saved state is a plain ice
// fill (applied above). Kept as a modifier so the glass recipe stays in one place.
private struct SaveGlass: ViewModifier {
    let saved: Bool
    let size: CGFloat

    func body(content: Content) -> some View {
        if saved {
            content
        } else {
            content.overImageGlass(radius: size / 2)
        }
    }
}
