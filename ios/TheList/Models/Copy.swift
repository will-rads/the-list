import Foundation

/// Cross-cutting member-facing / venue-facing copy that isn't owned by a
/// single enum's `memberLabel`/`venueLabel` (those live on the enum itself —
/// see `ApplicationState`, `StoryStatus`, `EventStage`). Strings here are
/// transcribed verbatim from `web/v3/index.html` and `web/v2/venue.html` so
/// screens (wave 2 / wave 3) never have to re-author copy.
///
/// Sentence case everywhere, no emoji in the copy itself (the web's toast
/// "Verified ✓ · reason" appends the glyph at the call site, not in the
/// stored string).
public enum Copy {
    // Member — Pass / Brief (web `BriefBlock`, `ScreenPass`)
    public static let conciergeLine = "Plans change? The List handles it."
    public static let showAtDoor = "Show this at the door"
    public static let checkedInPrefix = "Checked in \u{2713}"

    // Member — Event Detail CTA states (web `ScreenEventDetail` sticky CTA)
    public static let applyFree = "Apply · free"
    public static let applyReviewing = "Reviewing"
    public static let applyApplied = "Applied"
    public static let listClosedCTA = "The list is closed"
    public static let confirmYourSeat = "Confirm your seat"
    public static let viewPass = "View pass"

    // Member — Story upload sheet (web `StorySheet`)
    public static let storyExchangeLine = "The exchange: 1 Story + venue tag, posted during the event. Upload a screenshot of it here."
    public static let storyUnderReviewLine = "Under review · we check within a few hours"

    // Member — Standing block (Profile, wave 2 per spec but strike math is wave-1 testable)
    public static let goodStandingZero = "Good standing · 0 strikes"
    public static let strikePolicyLine = "A no-show is a strike. Three pause your account."

    // Venue — post wizard (web `StepBundle` / `StepBrief`)
    public static let venueConciergeLine = "We handle all guest comms"
    public static let settleLine = "Settle via Whish / OMT / USD cash"
    public static let settleContactLine = "The List will contact you to settle."

    // Venue — confirm dialogs (web `askConfirm` bodies, verbatim)
    public static let closeApplicationsBody = "No new applications. Members get notified. Picks must confirm within 24h — the waitlist stays available for replacements."
    public static let cancelEventBody = "Everyone gets notified. No charge, no strikes."
    public static let closeNightBody = "Unchecked guests become no-shows. The recap and invoice get built."
}
