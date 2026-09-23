# Venue side: simple UX rebuild

Date: 2026-09-23 (revised the same day with Will's corrections). Owner: Will. Branch: `venue-ux-simple`.

## Why

The venue app is too complicated. Lebanese venue managers want something chill and obvious. This is an MVP Will can demo to an investor as a rival to The Secret Society, starting in Beirut.

## Who uses it

- **The manager** posts events and picks people.
- **The door person** checks people in on a second phone logged into the same venue account. A shared login is an MVP shortcut, not staff permissions.

## The rule

A venue does three things: **post an event, pick who comes, let them in.** Every screen serves one of these. Each screen has one main button.

## Scope

- **In:** every venue screen after login, the words used, spacing, touch targets and labels.
- **Out:** the visual redesign (next round, venue and member together), the member app, backend changes, separate staff logins, payments.
- **Kept:** the React/Vite/Capacitor setup, the glass look, every Supabase workflow and the existing failure handling.

## What the backend really does

Read from the live database on 2026-09-23. The UI must never claim more than this.

- **Picked and awaiting confirmation are one server state** (`picked`, with a 24 hour `pick_expires_at`). Only the member's own confirm makes a guest `confirmed`.
- **Nothing can be undone on the server.** No unpick, un-check-in or un-no-show exists. A pick notifies the member at once.
- **A pass saves nothing.** `skip_applicant` is a no-op, so passed people stay `applied` and come back next time the deck opens.
- **Closing requests** (`close_applications`) moves everyone unreviewed to the waitlist. It does not mean the event is full. Replacements come from that waitlist.
- **Closing the event** (`close_event`) needs requests closed and the start time passed. Confirmed guests who never checked in become no-shows. Unreviewed people become not selected. Picks still awaiting confirmation are left alone.
- **Ratings** (`rate_guest`, 0 to 10) work any time for checked-in or no-show guests, including after the night is closed.
- **Realtime** only broadcasts notifications. A check-in on one phone does not reach the other phone.
- **Same-day events:** the server does not validate close times. A close time already in the past gets the event auto-closed within 10 minutes. The 24 hour confirm window can run past the start time.

## Words

| Old | New |
| --- | --- |
| Room, drop, night (as a noun for the listing) | Event |
| Applicants, to review | People who want in, waiting |
| Locked | Requests closed |
| Close applications | Close requests |
| Picked (unconfirmed) | Awaiting confirmation |
| Confirmed | Confirmed. "Coming" counts confirmed plus checked in only |
| Checked in | Inside |
| No-show | Didn't come |
| Recap | Summary |
| Bundle | Price |
| Verified reach (a follower total) | Followers of verified posters |
| The desk, stat tiles | Removed |

Three counts stay distinct everywhere: **Picked** (every active pick), **Awaiting confirmation** (picked, not yet confirmed), **Confirmed**.

## Navigation

Three tabs: **Home, Events, Venue.** The door list, picking deck, event page, post form and summary open full screen on top, each with a Back button.

## Screens

### Home

A to-do list, most urgent first. Each card has one line and one button. The bell stays in the header and opens Activity, so important updates stay reachable.

| Situation | Card text | Button |
| --- | --- | --- |
| An event is on today | Pool Day is today. 18 coming. | Open door list |
| An event started but was never closed | Pool Day is over. Close it to get the summary. | Open door list |
| Picks dropped out | 2 can't make it to Pool Day. | Pick a replacement |
| Picks not yet confirmed | 3 picks haven't confirmed Pool Day. | See event |
| People want in | 12 people want in to Late Lounge. | Start picking |
| Draft not posted | Rooftop Session isn't posted yet. | Finish posting |
| Event done, Stories or bill open | Sound Bath is done. 14 of 18 Stories verified. | See summary |
| Nothing to do | Nothing to do right now. | New event |

A "New event" button sits under the header.

### Events

One list. Upcoming first, soonest on top, then past and cancelled. Each row: photo, name, date and time, one status: Draft, Taking requests, Requests closed, Today, Done, Cancelled, plus one count ("12 waiting", "7 confirmed of 20"). A pinned "New event" button. Tap opens the event page.

### Event page

Photo, name, type, date and time, status. Three count tiles: Picked, Awaiting confirmation, Confirmed. One main button:

| Status | Main button |
| --- | --- |
| Draft | Finish posting |
| Taking requests with people waiting | Pick people |
| Someone can't make it | Pick a replacement |
| Today, or started and not closed | Open door list |
| Done | See summary |

Below: guest groups (Confirmed, Awaiting confirmation with hours left, Can't make it, with a waitlist count), then the event details (price, requests close, arrival, Story rule). Small actions: Edit (draft or taking requests), Close requests, Cancel event, Delete draft. This replaces the old event cards and guest list sheet.

### New event: one screen

1. **Photo.** Defaults to the venue photo. "Change photo" opens the cropper.
2. **Event name** and **type.**
3. **Date and time.**
4. **How many people:** 10 for $400, 20 for $700, 40 for $1,200, or Custom with a seat count and price.
5. **Girls and guys:** off means any mix. On shows a girls count; guys fill the rest.
6. **Requests close:** 1 day before, 2 hours before, or Pick a time. The real close time is always shown. A time already passed shows a warning and blocks posting. This fixes same-day events.
7. **More** (a native collapsible): arrival window, dress code, meeting point, house rules, Story window.
8. **Check before posting:** price and how it's paid, when requests close, arrival details, the Story rule, and the 24 hour confirm window (with a warning when it runs past the start).

Buttons: **Post event** and **Save for later.** Live mode also blocks a start time in the past.

### Picking

- **Real swiping.** Drag right to pick, left to pass. The card tilts and shows PICK or PASS. Past the line it decides; short of it, it snaps back.
- **Buttons as backup:** Pass and Pick under the card, and arrow keys on a keyboard.
- **Safe dragging.** A drag never opens the profile or follows a link. Vertical scrolling still works (`touch-action: pan-y`). One decision at a time: buttons lock while saving, so nothing submits twice.
- **Failed saves** snap the card back and keep the person in the deck, with a clear message.
- **Undo is honest.** It only appears after a pass, where it simply goes back one card, since a pass saved nothing. Picks cannot be undone because the member was already notified.
- **Passes are remembered on this phone**, so the same people don't come back every time, and Home's count clears. At the end: "Look again at the N you passed on".
- The top shows people waiting, "Picked 8 of 20 · 5 confirmed" and, with a mix, girls and guys against the target.
- Tap the card for the full profile, as today.
- Replacement mode uses the waitlist after requests close.

### Door list

- One tap from Home or the event page, full screen, built for a person at the door.
- A search box, then everyone confirmed A to Z with photo, name and pass code, and one big **Here** button each.
- The top shows "12 of 20 inside" and how many picks are still awaiting confirmation.
- Inside and Didn't come groups below. Tapping a confirmed guest offers "Mark as didn't come", with a confirm.
- **Two phones stay in step:** the list refreshes every 5 seconds and when the phone wakes. If the other phone already checked someone in, the app says so and refreshes.
- **Close the event** first closes requests if needed. Its confirm states exactly how many confirmed guests will be marked as didn't come, and that picks awaiting confirmation stay as they are. It is disabled before the start time.
- No rating queue. Ratings move to the summary and are optional.

### Summary

Attendance (confirmed, came, didn't come), Stories (verified, under review, due, not posted), and billing (price, status Pending, Invoiced or Paid, how to settle) together. "Followers of verified posters" is labelled as a follower count, not reach. **Optional ratings:** each guest has Great, Fine or Problem (saved as 9, 6 or 3), any time after the night. No one has to step through a queue.

### Venue tab

Venue photo and name, Edit venue (now with a Back button), Dark mode switch, Switch to member, Log out. Demo controls in demo mode only.

### Removed

Stat tiles, "The desk", the Events filters, the Door tab, the rating queue, the unreachable group onboarding screen, the guest list sheet, and unused helpers.

## Quality bar for this round

- Every tap target at least 44px. Every icon button has a label. Form fields have real labels. Toggles use `role="switch"`, choice chips use `aria-pressed`.
- Confirm dialogs wait for the save to finish and show progress, and they don't close on failure.
- Demo mode (`/venue?demo=1`) behaves like live: same passes, same undo rules, same counts. It is the investor demo.

## Build notes

- Use the ponytail skill: the simplest code that works, no new dependencies.
- **Ponytail decision:** stay in one file, `web/v3/venue.jsx`. Splitting it would need a shared module and checker rewrites for no user benefit. Old screens get deleted, not left behind. Shared pieces (card button, big button, sheet, labelled field) sit near the top so the redesign changes them once.
- Swipe uses plain pointer events. No gesture library.

## Known gaps (backend, not fixed this round)

1. No server undo for pick, check-in or didn't come.
2. A pass is not stored on the server; this phone remembers it, other phones don't.
3. No realtime for door actions; the door list polls every 5 seconds instead.
4. Shared login only; no separate door staff accounts or permissions.
5. The confirm window is a fixed 24 hours, even for same-day events.
6. `close_event` leaves picks awaiting confirmation untouched, so they can expire after the night and send a stale "seat back in your deck" notice.
7. `close_event` tells unpicked people "This one filled up", even when seats were left.
8. There is no reach data anywhere; only follower counts and provider estimates.
9. A member cancelling looks the same as an event cancellation in the data.
10. "Today" notices on the server compare dates in UTC.

## Testing

- **Demo path:** update the venue part of `web/check-mobile.mjs`: tabs Home, Events, Venue; post an event; swipe to pick and pass; undo a pass; check someone in; close the event; rate one guest; no page overflow at 390x844 and 320x568.
- **Live path:** a new `web/check-venue-live.mjs` runs the real live code against a fake Supabase in the browser (no production writes). It covers double taps, a failed pick keeping the person, no live undo after a pick, two phones syncing the door list, the no-show count before closing, optional ratings after closing, same-day posting, a held arrow key, and a tap on the card while a save runs.
- Update `web/v3/check-v3.mjs` and `web/check-venue-actions.mjs` to the new screens and names.
- `npm run build` passes. Screenshots of each screen go to Will. Nothing gets pushed without Will's say-so.
