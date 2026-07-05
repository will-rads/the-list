import SwiftUI

// Web `Steps` — numbered circles joined by hairlines; the current step fills with
// the accent. `dark` forces the cream-on-black palette for the takeover screens
// (Reviewing / Tier reveal / Error) so it reads over the opaque black ground;
// otherwise it uses the theme accent (the Apply form sits on the theme bg).
struct StepIndicator: View {
    let current: Int
    var total: Int = 3
    var dark: Bool = false

    private var accent: Color { dark ? MemberPalette.onPhoto : Theme.ice }
    private var accentInk: Color { dark ? .black : Theme.iceInk }
    private var line: Color { dark ? MemberPalette.onPhoto.opacity(0.22) : Theme.line2 }
    private var mute: Color { dark ? MemberPalette.onPhoto.opacity(0.55) : Theme.inkMute }

    var body: some View {
        HStack(spacing: 0) {
            ForEach(1...total, id: \.self) { n in
                if n > 1 {
                    Rectangle()
                        .fill(line)
                        .frame(width: 24, height: 1)
                }
                circle(n)
            }
        }
    }

    @ViewBuilder
    private func circle(_ n: Int) -> some View {
        let isCurrent = n == current
        Text("\(n)")
            .font(Typography.number(11))
            .foregroundStyle(isCurrent ? accentInk : mute)
            .frame(width: 24, height: 24)
            .background {
                if isCurrent {
                    Circle().fill(accent)
                } else {
                    Circle().strokeBorder(line, lineWidth: 1)
                }
            }
    }
}

#Preview("Dark") {
    VStack(spacing: Theme.Space.xxl) {
        StepIndicator(current: 1)
        StepIndicator(current: 2, dark: true)
        StepIndicator(current: 3, dark: true)
    }
    .padding(Theme.Space.xl)
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .background(MemberPalette.takeover)
    .preferredColorScheme(.dark)
}
