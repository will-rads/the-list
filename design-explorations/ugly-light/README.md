# The List: whole-app Mobbin-informed mockup

## Current direction (2026-10-10)

White + true black + a light-to-deeper pink gradient. Light/Dark mode button in the app's top bar. One font: Plus Jakarta Sans (Tanker and Satoshi dropped 2026-10-15). White pill-round cards (28px) with thin black lines (white lines in dark), pill buttons and chips, no grey anywhere, glass only on the tab bar. Black = main action, pink = hype/status, always outlined. Rules live in `DESIGN.md` here (draft, not yet in the repo root). Rejected: Beirut map ground, frosted cards, squared cards, eggshell, Tanker.

## Current preview

Run `node design-explorations/ugly-light/preview.mjs` from the repo root, then open **http://127.0.0.1:5180/**. The root now opens the complete mockup. Previous Home study: `/home`. Earlier ornamental version: `/before`. Original font screenshots and all earlier HTML remain preserved locally.

Use **Preview side** and **Screen** to jump anywhere, or click through the app normally. Desktop also exposes the font choices, empty/error states and reset. Mobile fills the available viewport with fixed navigation and internally scrolling content.

| Side | Screens and working mock interactions |
| --- | --- |
| Member (21) | Home, Explore/search/category/date filters, event detail, apply/withdraw, Applied/Confirmed/Saved/Past invites, picked/confirm/decline, sample pass, arrival brief, local Story file selection/submission, profile/score/audience/content, edit/settings/activity, welcome/apply/code/pending, connection handoff preview |
| Venue (15) | Home, upcoming/past/draft events, management/detail, create/edit/review/publish/draft, pick/pass/undo, applicant record, guest list, door/search/check-in/no-show/close night, recap/rating/bill, venue profile/edit/activity/login |
| Public (1) | Shared event detail leading to membership application |
| Founder (5) | Desk, member approval/decline, proof review/verify/correction, venue-invitation preview, settlement ledger |

### Try the full loop

1. Member: Explore → Sunset Pool Day → Apply.
2. Venue: Pick guests → Pick Sara.
3. Member: Invites → respond → Confirm → sample pass.
4. Venue: Door → check Sara in.
5. Member: Story proof → choose a PNG/JPEG → submit locally.
6. Founder: Story review → verify or request correction.

Guest decisions and proof are scoped to their event. The initial 9.4/10 Sara score is one shared sample baseline, not a newly calculated production record. Activity entries, creator analytics and historical metrics are fixtures. Only the most recently submitted proof is exposed in the founder review preview. Sign-in, email, provider connections, account deletion, venue invitations and payments are explicitly simulated. No app/backend imports, credentials, live uploads, messages or storage writes. Photos/fonts load from the existing external sources; selected proof stays in a browser object URL until reset/close.

## Research actually used

The user explicitly chose visible Mobbin previews after the newly available plugin returned **“Mobbin MCP requires a paid plan.”** No paid access was bypassed, no full restricted flows were claimed as inspected.

| Reference inspected | Applied to this mockup |
| --- | --- |
| [Luma event list](https://mobbin.com/screens/4e0f5ef3-de35-450a-b8b8-f8e7ac192e6a) and [event detail](https://mobbin.com/screens/9af424b7-5e7f-4619-af62-25a763624cee) | Thumbnail lists with explicit attendance status, date/location metadata, a clear primary event action |
| [Partiful visible Home/event previews](https://mobbin.com/apps/partiful-ios-8d86fde9-d2bf-43ad-9a45-62818f75d1aa/cf9efc2a-4499-484b-861e-bbe8d79873a8/screens) | Event image/title identity, invitation grouping and separation of host tasks from attendee actions; not its gradients |
| [DICE entry preview](https://mobbin.com/screens/fa3b8a86-aff6-4075-8a8a-b2cd9e7b1165) | Photo-led welcome with account access and an explicit browse/demo path |
| [OpenTable Home/filter preview](https://mobbin.com/screens/13b96c8e-dbc6-463a-82f1-eef1a8735d0f) | Compact search/date/category controls and neutral content hierarchy |

The venue operations and founder flows were mapped from existing `web/v3/member.jsx`, `web/v3/venue.jsx` and `web/admin.html`; their deeper equivalents were not accessible in Mobbin. This is an adaptation of relevant references to The List's actual product rules, not a copy of another app.

## Design and checks

Paper #F2F2F2, white surfaces, black ink, pink #FA00FF as the sole UI accent. Pink is used for primary actions and tiny status marks. Status also has text. Three existing display-font choices remain reviewable, all with Satoshi body text. Glass stays on the dock. No decorative orbs, gradients, extra accent colors or new dependencies.

Files: `full-app.html`, `full-app.css`, `full-app.js`; local allowlisted server `preview.mjs`; runnable browser check `check-full.mjs`. Earlier `index.html` and `check.mjs` are the Home study, not the complete mockup.

Run `node design-explorations/ugly-light/check-full.mjs`. Tests cover all 42 screens at 1100x1000, 390x844 and 320x568, the full apply-to-proof loop, event publishing, onboarding/approval, event-specific sample state, filters, fonts, error/empty states and no network writes. Native iOS and production behavior are outside this mockup. No files in `web/`, `supabase/` or iOS were edited.

---

## Earlier exploration records

# Paper + pink (redesign exploration, 2026-10-10)

Throwaway HTML mockup. The real app (`web/`) is untouched.

## Continue in a new chat

Will asked on 2026-10-10 to continue this UGLYCASH-inspired direction. Read the root `HANDOFF.md`, then this file, inspect `index.html` and all three screenshots, and continue here. Do not start a new direction or alter the real app/backend yet. The folder is local and untracked, not present in a fresh clone. No font option has been approved.

- `index.html`: member Home + venue Home, light only, with a font-combo switch (a = Tanker + Marker, b = Clash + Brush, c = Panchang + Gochi).
- `font-a/b/c.png`: screenshots of each combo.
- Look: Refero "UGLYCASH" base (canvas #F2F2F2, white cards, 1px black borders, no shadows, 16px / 38px radii) minus its cyan and lime. Black banners, hot pink #FA00FF only on small spots, iOS glass only on the bottom tab bar.
- Breaks two V3 rules on purpose (glass everywhere, one font family). Nothing is locked yet. Will still has to pick a font combo.

View it: from `the-list/`, run `python -m http.server 5178`, then open `http://localhost:5178/design-explorations/ugly-light/index.html`.

## Continuation pass - 2026-10-10

- Same Paper + pink direction and three font choices. Original `font-a/b/c.png` references are preserved; they show the previous pass.
- Desktop compares both Home screens. On phones, Preview switches Member/Venue in a viewport-filling layout with an anchored glass dock.
- Tap **Your score** or **Your track record** for the member score sheet; tap venue **Review requests** for the matching sample applicant. Both show Sara at 9.4 / 10, with 17/18 attendance, 16/17 verified Stories and a 9.2 venue rating, matching the app's existing demo record. These are static fixtures, not live data.
- Replaced the unsupported referral-ranking promise with the existing one-Story requirement. Improved text contrast, keyboard focus and icon tap targets; aligned the sample event date and seats.
- Other Home controls are still visual placeholders. Font selection and porting to the app need approval.

Check: from the repo root, `node design-explorations/ugly-light/check.mjs` (uses the existing app Playwright dependency and installed Chrome). Passed desktop 1000x1100 and phones 390x844 / 320x568, all font options, both sides, score dialogs, dock positioning, overflow and page-error checks. Fonts/photos need internet access.

## Mobbin simplicity pass - 2026-10-10

Will requested Mobbin references, a restrained accent and simplicity. The named plugin exposed no callable tools in this session; research used his signed-in Mobbin browser. Inspected visible Waymo and Copilot highlights without bypassing plan restrictions.

- Primary reference: [Waymo Home](https://mobbin.com/screens/3b1c8c23-8497-41c7-bf4d-709caa97b3c3) and [booking sheet](https://mobbin.com/screens/41e92a4e-ba6c-4fa4-9137-4984f4469436): clear main action, quiet labels and grouped supporting information. These informed hierarchy, not a replacement visual identity.
- Also inspected [Copilot highlights](https://mobbin.com/apps/copilot-ios-166bc40a-0fb1-47c5-bdd5-6cc642c56f2a/91c57122-173b-52b5-9a0b-6df845b6d1c1/screens); its busier dashboard/color treatment was not carried over.
- Preserved the prior mockup as `before-mobbin.html`. Original font screenshots remain untouched.
- Removed decorative spheres, the tilted poster and promotional banner. Kept the paper/black base, thin borders, display-font options and glass dock. Pink now emphasizes one action per side, plus small status dots. Grouped venue metrics/tasks and made New event secondary.
- View event now opens a native sample detail dialog. The two score previews remain 9.4/10. Other existing placeholder controls remain unwired.
- Preview: `node design-explorations/ugly-light/preview.mjs`, then `http://127.0.0.1:5180/`; prior pass at `/before`. This Node server rereads the files on refresh. The earlier Python server listened but was unreachable; the earlier Node server on 5179 cached its HTML.
- Validation: existing checks pass for all three sizes/fonts and both sides; the new event dialog was also opened and closed in the actual in-app browser. App/backend untouched.
