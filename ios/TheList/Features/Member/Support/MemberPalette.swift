import SwiftUI

// Theme-independent colours for content that sits ON a photograph or on an
// opaque takeover ground — the one place the app is NOT theme-adaptive. The web
// hardcodes `#F7F6F3` (light cream) text over its dark photo scrims and over the
// black Picked / Onboarding takeovers in BOTH themes, because those grounds stay
// dark regardless of theme. Theme.ink can't express that (it flips to dark ink in
// light mode), so these live here — centralised, never inline in a View, and
// clearly distinct from Theme's app-surface tokens. This is the documented gap
// this wave fills; see the wave return note.
enum MemberPalette {
    /// Web `#F7F6F3` — light text/marks over photos and dark takeovers.
    static let onPhoto = Color(red: 0.969, green: 0.965, blue: 0.953)
    /// Opaque takeover ground (web Picked / Onboarding `background:#000000`).
    static let takeover = Color.black
    /// Ink for text/marks on a cream (`onPhoto`) fill inside a takeover —
    /// theme-independent black, matching the web's `color:#000000` on its cream
    /// buttons/rings (Picked "You're in", Onboarding CTAs).
    static let onCreamInk = Color.black

    // MARK: Photo scrims — bottom-weighted gradients that keep title/meta legible
    // over a venue photo. Black-alpha stops transcribed from the web card scrims;
    // theme-independent because the photo underneath is dark in both themes.

    /// Home featured card — web `rgba(0,0,0,.25) 0%, 0 35%, .9 100%`.
    static let featuredScrim = LinearGradient(
        stops: [
            .init(color: .black.opacity(0.25), location: 0.0),
            .init(color: .black.opacity(0.0),  location: 0.35),
            .init(color: .black.opacity(0.9),  location: 1.0),
        ], startPoint: .top, endPoint: .bottom)

    /// Explore lead card — web `.3 0%, 0 38%, .92 100%`.
    static let leadScrim = LinearGradient(
        stops: [
            .init(color: .black.opacity(0.3),  location: 0.0),
            .init(color: .black.opacity(0.0),  location: 0.38),
            .init(color: .black.opacity(0.92), location: 1.0),
        ], startPoint: .top, endPoint: .bottom)

    /// Event Detail hero — web `.45 0%, 0 25%, 0 55%, .95 100%`.
    static let heroScrim = LinearGradient(
        stops: [
            .init(color: .black.opacity(0.45), location: 0.0),
            .init(color: .black.opacity(0.0),  location: 0.25),
            .init(color: .black.opacity(0.0),  location: 0.55),
            .init(color: .black.opacity(0.95), location: 1.0),
        ], startPoint: .top, endPoint: .bottom)

    /// My Events confirmed card — web `rgba(27,28,31,0) 30%, .95 100%`.
    static let confirmedScrim = LinearGradient(
        stops: [
            .init(color: .black.opacity(0.0),  location: 0.3),
            .init(color: .black.opacity(0.95), location: 1.0),
        ], startPoint: .top, endPoint: .bottom)

    /// Profile hero top scrim for the floating controls — web `.3 0%, 0 40%`.
    static let profileTopScrim = LinearGradient(
        stops: [
            .init(color: .black.opacity(0.3), location: 0.0),
            .init(color: .black.opacity(0.0), location: 0.4),
        ], startPoint: .top, endPoint: .bottom)

    /// Onboarding intro montage scrim — top for status area, bottom for CTAs.
    static let introScrim = LinearGradient(
        stops: [
            .init(color: .black.opacity(0.72), location: 0.0),
            .init(color: .black.opacity(0.0),  location: 0.24),
            .init(color: .black.opacity(0.0),  location: 0.46),
            .init(color: .black.opacity(0.92), location: 1.0),
        ], startPoint: .top, endPoint: .bottom)
}
