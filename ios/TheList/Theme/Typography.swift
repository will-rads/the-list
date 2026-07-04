import SwiftUI

// One family: bundled Plus Jakarta Sans variable TTF (Resources/Fonts/, registered
// via UIAppFonts). Registered family name is "Plus Jakarta Sans". Weight is applied
// through the variable font's wght axis via .weight(); Inter/Instrument Serif/
// Cormorant/Space Grotesk are banned (web ruling 2026-07-04).
enum Typography {

    static let family = "Plus Jakarta Sans"

    // Display voice: weight 700, tracking -0.02em (applied at call site via
    // .displayStyle, since a Font carries no tracking). em is proportional to size.
    static let displayTracking: CGFloat = -0.02

    static func display(_ size: CGFloat) -> Font {
        .custom(family, size: size).weight(.bold)
    }

    // Body: weights 400 / 500 / 600 / 700.
    static func body(_ size: CGFloat, weight: Font.Weight = .regular) -> Font {
        .custom(family, size: size).weight(weight)
    }

    // Numbers / timers: 600 + monospaced digits so tabular figures don't jitter.
    static func number(_ size: CGFloat) -> Font {
        .custom(family, size: size).weight(.semibold).monospacedDigit()
    }
}

extension View {
    // Display type + proportional negative tracking in one call.
    func displayStyle(_ size: CGFloat) -> some View {
        font(Typography.display(size)).tracking(size * Typography.displayTracking)
    }
}
