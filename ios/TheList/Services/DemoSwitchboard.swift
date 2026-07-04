import Foundation

/// The hidden demo rig — Settings › Demo (member) and Venue tab › Demo
/// (venue) in the web prototypes, unified into one 8-action contract here
/// since `DemoWorld` is the single shared state both sides mutate. Method
/// names are FROZEN by the wave plan:
///
/// - `pickNow` / `expirePick` / `checkMeIn` / `forceVerdict` mirror
///   `web/v3/index.html`'s member `demoActions`.
/// - `newApplicants` / `declinePick` (web `pickDeclines`) / `advanceToTonight`
///   mirror `web/v2/venue.html`'s venue `demoActions`.
/// - `reset` exists on both sides; here it is one action that restores the
///   whole shared world.
@MainActor
public protocol DemoSwitchboard: AnyObject {
    /// Immediately picks the member for "Late Lounge" (web: hardcoded to the
    /// `lounge` event, same as `demoActions.pickNow`).
    func pickNow()
    /// Expires whichever event currently has a `picked` row.
    func expirePick()
    /// Checks the member in to tonight's confirmed event ("Pool Day").
    func checkMeIn()
    /// Forces a story verdict for the member's current "Story due" event
    /// (web: hardcoded to `bath`/Sound Bath).
    func forceVerdict(_ status: StoryStatus)
    /// Venue side: a batch of fresh applicants lands on the first Open event.
    func newApplicants()
    /// Venue side: a confirmed guest (never the member) declines their pick
    /// on "Pool Day", freeing a seat for a replacement.
    func declinePick()
    /// Venue side: flips "Late Lounge" from Open to Locked as tonight's
    /// second room — applied → waitlist, picked → confirmed with a generated
    /// door code.
    func advanceToTonight()
    /// Restores the entire shared world to its seed state.
    func reset()
}
