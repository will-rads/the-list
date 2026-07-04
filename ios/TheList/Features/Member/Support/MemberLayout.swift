import Foundation
import CoreGraphics

// Screen-level layout constants, matching the web member prototype so gutters and
// dock clearance read identically. The web's standard side gutter is `px-5` (20pt)
// and content clears the floating dock with `paddingBottom: 88`.
enum MemberLayout {
    /// Standard side gutter (web `px-5`).
    static let hInset: CGFloat = 20
    /// Bottom content inset so a scroll view clears the floating GlassDock
    /// (web tab-bar clearance `paddingBottom: 88`).
    static let dockClearance: CGFloat = 96
    /// Top inset below the status bar / Dynamic Island (web `pt-[60px]`).
    static let topInset: CGFloat = 12
}
