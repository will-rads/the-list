import SwiftUI
import UIKit

// Design tokens, ported verbatim from web/v3 index.html (:root + html.light,
// 2026-07-04 glass spec). Every colour is a dynamic UIColor so a single token
// adapts to light/dark automatically — no View ever threads colorScheme and no
// View ever sees a hex. Numeric recipe constants (radius/space/stroke) live here
// too so screens never carry magic numbers.
enum Theme {

    // MARK: Ink & surfaces
    static let bg      = dyn(dark: rgb(0x000000),               light: rgb(0xF7F6F3))
    static let elev    = dyn(dark: white(0.07),                 light: white(0.34))
    static let elev2   = dyn(dark: white(0.12),                 light: white(0.24))
    // Will 2026-07-05: no gray text — ink2 / inkMute collapse to ink so every
    // label/subline reads full-contrast. navIdle keeps ONE functional gray for
    // inactive dock tabs (else the active tab is invisible). Mirrors web/v3.
    static let ink     = dyn(dark: rgb(0xF4F4F6),               light: rgb(0x1E1E1E))
    static let ink2    = dyn(dark: rgb(0xF4F4F6),               light: rgb(0x1E1E1E))
    static let inkMute = dyn(dark: rgb(0xF4F4F6),               light: rgb(0x1E1E1E))
    static let navIdle = dyn(dark: rgb(0x8B8C97),               light: rgb(0x6A737D))
    static let line    = dyn(dark: white(0.14),                 light: rgb(0x1E1E1E, 0.12))
    static let line2   = dyn(dark: white(0.28),                 light: rgb(0x1E1E1E, 0.24))
    static let page    = dyn(dark: rgb(0x000000),               light: rgb(0xF2F0EB))

    // MARK: Accent (monochrome — white on dark / ink on light; no hue anywhere)
    static let ice     = dyn(dark: rgb(0xFFFFFF),               light: rgb(0x1E1E1E))
    static let iceDim  = dyn(dark: rgb(0xD8D9DF),               light: rgb(0x454B52))
    static let iceInk  = dyn(dark: rgb(0x000000),               light: rgb(0xFFFFFF))

    // MARK: Ground scrim — black 62% dark / white 50% light (web .iphone-screen::before)
    static let scrim   = dyn(dark: black(0.62),                 light: white(0.50))

    // MARK: Over-image hairline — web .glass-over-image border
    static let lineOverImage = dyn(dark: white(0.28),           light: rgb(0x1E1E1E, 0.12))

    // MARK: Glass quality bar (web glass spec 2026-07-04)
    // specular  = top-edge highlight, DARK ONLY (light alpha 0 suppresses it);
    //             used as the top stop of a stroke gradient in Materials.swift.
    // iceGlow   = halo behind ice-filled chips/pills (web .chip-ice box-shadow).
    // textShadow= readability lift for labels/stamps sitting on the photo scrim
    //             (web .stamp/.section-label/.on-photo text-shadow).
    static let specular   = dyn(dark: white(0.35),              light: white(0.0))
    static let iceGlow    = dyn(dark: white(0.28),              light: rgb(0x1E1E1E, 0.18))
    static let textShadow = dyn(dark: black(0.50),              light: rgb(0xF7F6F3, 0.60))

    // MARK: Glass fills (tints layered over a Material; see Materials.swift)
    enum Glass {
        // web recipes: .card uses --bg-elev; .tabbar/.sheet/.glass-over-image use
        // their own near-black (dark) / see-through white (light) fills. Light
        // stays low-alpha so it reads as glass, not paint (web lesson 2026-07-04).
        static let card      = dyn(dark: white(0.07),           light: white(0.34))
        static let dock      = dyn(dark: rgb(0x141418, 0.55),   light: white(0.38))
        static let sheet     = dyn(dark: rgb(0x141418, 0.72),   light: rgb(0xFAFAFA, 0.55))
        static let overImage = dyn(dark: rgb(0x0A0A0C, 0.50),   light: white(0.72))
    }

    // MARK: Shadows (neutral, no neon — web card/dock box-shadows)
    enum Shadow {
        static let card = dyn(dark: black(0.55),                light: rgb(0x1E1E1E, 0.22))
        static let dock = dyn(dark: black(0.50),                light: rgb(0x1E1E1E, 0.28))
    }

    // MARK: Dock-CTA fade base colour — web .dock-fade (theme-aware)
    static let fade = dyn(dark: rgb(0x000000),                  light: rgb(0xFAFAFA))

    // MARK: Corner radii
    enum Radius {
        static let card:    CGFloat = 22
        static let tile:    CGFloat = 18
        static let control: CGFloat = 14
        static let sheet:   CGFloat = 28
        static let pill:    CGFloat = 999   // clamped to a capsule at render
        static let dock:    CGFloat = 999
    }

    // MARK: Spacing scale
    enum Space {
        static let xs:  CGFloat = 4
        static let s:   CGFloat = 8
        static let m:   CGFloat = 12
        static let l:   CGFloat = 16
        static let xl:  CGFloat = 24
        static let xxl: CGFloat = 32
    }

    // MARK: Stroke widths
    enum Stroke {
        static let hairline: CGFloat = 1
    }
}

// MARK: - Private colour builders (kept out of every other file)

private func dyn(dark: UIColor, light: UIColor) -> Color {
    Color(uiColor: UIColor { trait in
        trait.userInterfaceStyle == .dark ? dark : light
    })
}

private func rgb(_ hex: UInt32, _ alpha: CGFloat = 1) -> UIColor {
    UIColor(
        red:   CGFloat((hex >> 16) & 0xFF) / 255,
        green: CGFloat((hex >> 8) & 0xFF) / 255,
        blue:  CGFloat(hex & 0xFF) / 255,
        alpha: alpha
    )
}

private func white(_ alpha: CGFloat) -> UIColor { UIColor(white: 1, alpha: alpha) }
private func black(_ alpha: CGFloat) -> UIColor { UIColor(white: 0, alpha: alpha) }
