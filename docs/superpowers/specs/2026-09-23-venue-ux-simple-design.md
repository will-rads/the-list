# Venue side: simple UX rebuild

Date: 2026-09-23. Owner: Will. Branch: `venue-ux-simple`.

## Why

The venue app is too complicated. Lebanese venue managers want something chill and obvious. This is an MVP Will can demo to an investor as a rival to The Secret Society, starting in Beirut.

## Who uses it

- **The manager** posts nights and picks people.
- **The door person** checks people in, on a second phone logged into the same venue account.

## The rule

A venue does three things: **post a night, pick who comes, let them in.** Every screen serves one of these. Each screen has one main button.

## Scope

- **In:** every venue screen after login, plus the words used.
- **Out:** the visual redesign (next round, venue and member together), the member app, backend changes, a separate door login, payments.
- **Kept:** every backend action that exists today. Same Supabase calls, same data.

## Words

| Old | New |
| --- | --- |
| Room, event, drop | Night |
| Applicants | People who want in |
| Locked | Full |
| Confirmed | Coming |
| Checked in | Inside |
| No-show | Didn't come |
| Recap | Stories |
| Bundle | Price |
| The desk, Needs attention, stat tiles | Removed |

## Navigation

Three tabs: **Home, Nights, Venue.** The Door tab goes away; the door list lives inside tonight's night.

## Screens

### Home: a to-do list

One card per thing to do, most urgent first. Each card has one line of text and one button.

| Situation | Card text | Button |
| --- | --- | --- |
| A night is tonight | Sunset Session is tonight. 18 coming. | Open door list |
| Someone can't come | Maya can't make it to Pool Day. | Pick someone else |
| People want in | 12 people want in to Pool Day. | Start picking |
| Draft not posted | Pool Day isn't posted yet. | Finish posting |
| Night is over | Pool Day is done. 9 of 12 posted. | See stories |
| Nothing to do | Nothing to do. Post your next night. | New night |

A "New night" button sits at the top. The bell and activity sheet go away: Home is the inbox. Live notifications still refresh the data and get marked read when Home opens.

### Nights: one list

Upcoming nights on top, soonest first. Past nights below. No filters. Each row shows photo, name, date, and one status: Draft, Picking (12 waiting), Full (20 coming), Tonight, Done, Cancelled. A pinned "New night" button sits at the bottom. Tapping a row opens the night.

### Night page (new)

Photo, name, date and time, status, then one main button that depends on the status:

| Status | Main button |
| --- | --- |
| Draft | Finish posting |
| Picking | Pick people |
| Full | See who's coming |
| Tonight | Open door list |
| Done | See stories |

Below: the list of people coming. Small links for the rest: Edit (drafts and open nights), Stop taking requests (open nights), Cancel night, Delete draft. Done nights show the bill status. This page replaces the event cards' action rows and the guest list sheet.

### New night: one screen

One scrolling form instead of six steps.

1. **Photo.** Defaults to the venue photo. Tap to change.
2. **Name.**
3. **Date and time.**
4. **How many people.** Chips: 10 for $400, 20 for $700, 40 for $1,200, Custom. Custom shows a seat count and a price box. This merges today's Seats and Bundle steps, which fight each other.
5. **Mix.** "Any mix" by default. Turn it off to split the total into girls and guys.
6. **More** (collapsed, smart defaults): type (defaults to venue type), requests close (24 hours before), story window (24 hours), arrival window, dress code, meeting point, house rules.

Buttons: **Post night** and **Save for later.** Name, date and time are required.

### Picking: Tinder style

- Drag the card right for yes, left for no. The card tilts and shows YES or NO as it moves. Letting go past the line decides; letting go early snaps back.
- Yes and No buttons stay under the card for people who don't swipe and for keyboards. Arrow keys work on desktop.
- The top shows "8 of 20 picked" and, with a mix, "Girls 5 of 15 · Guys 3 of 5".
- Tap the card for the full profile, as today. Undo stays.
- When the deck is empty: "You've seen everyone," with Stop taking requests and Done.
- Replacement picking uses the same deck with the waitlist, as today.

### Door list

Opened from Home or the night page. Built for a person standing at the door.

- A big search box on top, then everyone coming, A to Z, with photo, name and code.
- One big **Here** button per person. The person moves to the Inside group, with a short undo.
- The counter on top shows "12 of 20 inside".
- Tapping a row opens a small sheet with "Mark didn't come".
- **Close the night** at the bottom. It first walks through the people inside with three buttons: **Great, Fine, Problem**, or Skip. These save as scores 9, 6 and 3. Anyone not checked in is marked as didn't come, as today.

### Stories

After a night: who came, who posted, who is pending, total reach, and bill status. Same data as today's recap, plainer words.

### Venue tab

Venue photo and name, Edit venue, Appearance, Switch to member, Log out. Demo controls show in demo mode only.

### Removed

Stat tiles, "The desk", the activity bell sheet, the Events filters, the Door tab, the single-guest 1 to 10 rating, and the group onboarding screen, which nothing links to.

## Build notes

- Use the ponytail skill: the simplest code that works, no new dependencies.
- Keep `App`, data loading and write handlers in `web/v3/venue.jsx`. New screens go in small files under `web/v3/venue/`. Old screens get deleted, not left behind.
- Keep the current glass look. No visual polish this round. New screens share a few pieces (card, big button, row, sheet) so the later redesign changes them in one place.
- Swipe uses plain pointer events. No gesture library.
- Demo mode (`/venue?demo=1`) must walk the whole loop cleanly, since that is the investor demo.

## Testing

- Update `web/v3/check-v3.mjs`, `web/check-venue-actions.mjs` and the venue part of `web/check-mobile.mjs` to the new screens and names.
- The mobile check walks: tabs Home, Nights and Venue; post a night; swipe yes and no; check someone in; close the night.
- `npm run build` and `npm run test:mobile` pass at 390x844 and 320x568.
- Screenshots of each screen in demo mode go to Will.
- Nothing gets pushed without Will's say-so.
