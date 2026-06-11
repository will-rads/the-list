# v1 Feature-Complete Prototype — Design Spec

Date: 2026-06-11
Status: approved by Will in brainstorm (5 sections + tweaks), pending spec review
Files touched: `web/v2/index.html` (member), `web/v2/venue.html` (venue) — **v2 is now the product base**
Out of scope here: backend build (Supabase decision deferred to its own session), SwiftUI port

## Goal

Make the prototype the **complete v1 experience** — every flow on both sides thought out and tappable — before any SwiftUI work. Venue side is the priority for intuitiveness. All data stays mocked in-file; the two files share one consistent fictional world via static seeds (no live cross-file sync).

## Decisions locked in this brainstorm

| Decision | Call |
| --- | --- |
| Base | **v2 (Kit V.2)** is adopted as the product. All feature work in `web/v2/`. v1 files frozen as archive. |
| Data layer | Mocked in-file, simulated transitions. DB/Supabase discussion deferred — but mock shapes must stay normalized/vendor-neutral. |
| Comms | **Concierge (TSS-style).** No chat anywhere in v1. App speaks in statuses + the event Brief. Exceptions go through The List (founders' WhatsApp). |
| Door check-in | **Member Pass screen** (photo + name + short code) eyeballed against the venue's Door list. No QR, no camera. |
| Story proof | **AI-assisted review v1.** In-app screenshot upload → Gemini first-pass against rubric → verified / needs review / rejected + score + one-line reason. Founders override. Prototype simulates the verdict. |
| Money in venue UI | Transparent: bundle price shown at posting, invoice in recap. **Manual settle v1** (Whish / OMT / USD cash outside the app). Due / Paid only. |
| Build order | One spec (this), **two build waves**: Wave 1 = the complete night loop; Wave 2 = money + meta. Will reviews live between waves. |

## 1. Event lifecycle (the spine)

### Venue stages

```text
Draft ──publish──► Open ──close applications──► Locked ──close the night──► Past
                     │                        │
                     └────────cancel──────────┴──► Cancelled (shown in Past segment)
```

| Stage | What's true | The one next action shown |
| --- | --- | --- |
| Draft | Building. Members never see it. Fully editable. | Publish |
| Open | Members apply. Venue swipes as applications arrive. Mix counter fills. | Review applicants (badge: N new) |
| Locked | **Applications** closed (venue action "Close applications" or auto at apply deadline). Picks NOT final: venue keeps swiping the waitlist for replacements until the night starts. **Pass + Brief are issued per guest when she confirms — never at close.** Editable: time + brief only. | Door (night-of) / Guest list |
| Past | Night closed from Door. Recap + invoice ready. | Recap |
| Cancelled | Venue cancelled from an Open/Locked event card. Confirm dialog: "Everyone gets notified. No charge." All guests/applicants notified, statuses flip to Cancelled, no strikes. | — (badge in Past segment) |

Stage flips: publish, close applications, cancel, close-the-night are venue actions. Open→Locked also auto-fires at the applications-close time (default 24h before doors). "Locked" is internal/venue vocabulary only — the action is always worded "Close applications" because it closes applications, not final picks.

### Per-guest state machine (one vocabulary, no synonyms)

```text
Applied ──venue ✓──► Picked ──confirm──► Confirmed ──door──► Checked in ──event ends──► Story due ──upload──► Under review ──► Verified
   │                   │  │                                      └──► No show                                  ├──► Needs review (founder check)
   │                   │  └─ no confirm in 24h ──► Expired (seat returns to venue → replacement pick)          └──► Rejected (reason + re-upload)
   │                   └─ member declines ──► Declined (seat returns to venue)
   ├── venue ✗ ──► Not selected
   ├── list locks while un-swiped ──► Waitlist (still eligible as replacement) ──► Picked  OR  Not selected (at night start or explicit venue ✗)
   ├── member withdraws while Open ──► Withdrawn
   └── event cancelled ──► Cancelled (no strike)
```

### Member-facing copy map (internal word → what she reads)

| Internal | Member-facing |
| --- | --- |
| Open | "Open" / "Closing soon" (badge) + "Applications close Fri 20:00" (detail) |
| Locked | **"List closed"** (never "Locked") |
| Applied | "Applied · under review" |
| Waitlist | **"Still under review"** |
| Picked | "You're picked · confirm within 14h" (live countdown) |
| Expired | "Pick expired" (quiet) |
| Story flow | "Story due" → "Under review" → "Verified ✓" / "Needs review" / "Rejected — try another screenshot" |

Key flow fix: today Apply instantly fires the "You're in" takeover. New: Apply → "Applied · under review" → simulated venue pick lands ~10s later as a notification → tapping it opens the Picked takeover with the 24h countdown. **Applying is not getting in. Getting picked is the moment.**

## 2. Venue side — screen by screen

| Screen | Spec |
| --- | --- |
| **Desk (Tonight tab)** | Stage-driven dashboard, top to bottom: (1) Tonight card — tonight's Locked event, guest count (confirmed/expected), one button → Door. (2) "Needs attention" stack — Open events with new-applicant badges → Review deck; expired/declined seats → "Pick a replacement" → deck over remaining pool + waitlist. (3) Drafts — tap = edit (resume wizard). (4) Last recap teaser (showed x/y, stories verified) → Recap. Stat tiles stay, wired to real stage data. Activity bell → venue notification model (below). |
| **Post wizard** | 6 steps, progress dots: **Basics** (title, type, date, time, + applications-close picker, default 24h before doors) → **Seats & mix** (existing steppers) → **Bundle** (3 templates: The Ten / The Twenty / The Forty + Custom; placeholder prices; line: "Settle after the night · Whish / OMT / USD cash"; concierge line: "We handle all guest comms") → **Brief** (arrival window, dress code, meeting point, house rules — optional fields, concierge promise repeated) → **Image** (existing cropper) → **Review** (now shows bundle + brief + deadline) → Publish. |
| **Review deck (swipe)** | Tap card → **Applicant sheet**: photo large, reputation score + attendance history (nights, shows, no-shows, strikes), IG + TikTok counts, audience split (gender + top countries), past nights at this venue. ✗/✓ unchanged. **Undo chip** appears after each decision (reverses last swipe). Deck end → **"Close applications"** CTA (confirm dialog: "No new applications. Members get notified. Picks must confirm within 24h — the waitlist stays available for replacements.") or "Keep open". On close, every un-swiped applicant flips to Waitlist; while Locked, the deck serves the **waitlist** for replacement picks. Counter: mix fill or picked x/seats. |
| **Door tab** | Existing check-in / no-show / rate kept. Each row adds the guest's **pass code** (e.g. LST-4F) to eyeball against her Pass screen. New footer action: **"Close the night"** → rating queue for any checked-in-but-unrated guests → event flips Past → toast "Recap ready". |
| **Recap (new screen)** | Reached from Past event card or Desk teaser. (1) Tiles: Confirmed / Showed (x/y) / No-shows / Avg rating given. (2) Story wall: per-guest status — Verified ✓ (screenshot thumbnail + score + reason), In review, Needs review, Due, Missed. (3) **Total verified reach** (sum of verified guests' followers) — the ROI number, biggest number on screen. (4) Invoice block: bundle name + price, status Due / Paid, settle line (Whish / OMT / USD cash), concierge line "The List will contact you to settle." (5) "Run it again" → prefilled draft (wave 2). |
| **Events tab** | Segments: **Open / Locked / Drafts / Past** (replaces Live/Draft/Past). Cards state stage + one action. Draft tap = edit. Open/Locked cards expose **Cancel** (confirm dialog) → Cancelled badge in Past segment. Locked cards → **Guest list** (a sheet over the Events tab: confirmed rows with pass codes + waitlist rows, statuses live — same row treatment as Door's Expected list). |
| **Venue tab** | Adds: **Billing** row → invoice list (event, bundle, price, Due/Paid) — wave 2. **Insights** mini-tiles (nights run, avg show-up rate, total verified reach) — wave 2. Group/multi-venue stays dormant ("Soon"). Demo switchboard lives here (below). |
| **Activity bell (venue)** | Rows: new applicants (count), pick confirmed, pick declined, **pick expired → "pick a replacement"**, story verified, invoice due. Every row deep-links. |

## 3. Member side — screen by screen

| Screen | Spec |
| --- | --- |
| **Event Detail** | Apply → button flips "Applied · under review" + toast; event joins My Events:Applied. **Withdraw** (quiet text action while event Open — wave 2; the Withdrawn *status* is part of the vocabulary from wave 1). Locked + never applied → CTA disabled, "List closed". Detail adds: applications-close countdown, the exchange (1 Story + venue tag), gender mix if set. |
| **Picked takeover** | Triggered by notification (simulated pick ~10s after apply, or switchboard). Real countdown from pick time ("Confirm within 23:41:02"). **Confirm** → Confirmed, pass issued, toast. **Decline** (ghost) → "Seat released" (venue side gets replacement slot in its own simulation). No response → Expired (exists as seeded example; timers don't actually expire picks mid-demo). |
| **Pass (new screen)** | Full-screen from: confirmed card, My Events, Home pinned night, notification. Contents: her photo, name, event title, venue + area, date + doors time, big short code (LST-4F), Brief summary, "Show this at the door". Status flips to **Checked in ✓** (via switchboard "Check me in" — no cross-file sync). Designed as a ticket/artifact per Kit V.2 — the status moment. |
| **Brief (new block)** | On every Confirmed card + the Pass: arrival window, dress code, meeting point, house rules. Concierge line: "Plans change? The List handles it." |
| **My Events** | Segments Applied / Confirmed / Past. Cards carry the full status vocabulary: Under review · Still under review · Confirm within Xh (countdown chip) · Confirmed (pass button) · Checked in · **Story due (upload CTA — loudest card in Past)** · Story under review · Needs review · Verified ✓ · and the quiet ones: No show, Not selected, Cancelled, Expired, Withdrawn, Declined, Rejected (story). |
| **Story upload (new sheet)** | From Story-due card: pick screenshot (FileReader, existing image pipeline, no crop needed — full-bleed preview) → submit → "Under review · we check within a few hours" → simulated verdict ~8s: **Verified ✓ (score + one-line reason)** by default; switchboard can force Needs review / Rejected (reason + re-upload path). Reputation tick copy on verify. |
| **Profile** | Adds **Standing** block: "Good standing · 0 strikes" + one line ("A no-show is a strike. Three pause your account."). Attendance mini-stats: nights, shows, stories verified. **Your invites · 2** (codes, status active/used, share via existing ShareSheet) — wave 2. Tier badge stays; one seeded tier-gated event on Explore (lock + "Tier 1") — wave 2. |
| **Home** | Pinned night card becomes pass shortcut night-of ("Doors 22:00 · View pass"). Bell model: picked (→ takeover), confirm expiring, brief posted, story due reminder, story verified, new drop, not selected (quiet), event cancelled. Every row deep-links. |
| **Explore** | Stage badges on cards: Open · Closing soon · List closed. Detail shows deadline. |

## 4. Story proof — production architecture note (recorded, not built now)

Prototype simulates all of this; the SwiftUI/backend build implements it:

- Upload → **Supabase Storage** (private bucket). Gemini API key lives **backend-only** (Edge Function); the client never holds it.
- Edge Function sends screenshot + event context to Gemini with the rubric: (1) venue tag visible, (2) looks like a real IG Story frame, (3) correct venue/event, (4) posted within the event's time window, (5) no obvious fake/crop/recycle, (6) content quality.
- Gemini returns `{ verdict: verified | needs_review | rejected, score: 0-100, reason: "one line" }`.
- **Gemini is first-pass, not final judge.** Founders see a review queue (needs_review + spot-checks) and can override any verdict. Member status only says "Under review" until a final state.

## 5. The demo world (shared seeds + switchboard)

Both files seed the **same fictional world** — same events, same states, same pass codes, same story proofs, same recap numbers. Canonical today: **Sunday 25 May**. Mirroring is static-seed agreement, not live sync; actions in one file never move the other file.

| Event | Venue side state | Member (Sara) side state |
| --- | --- | --- |
| **Pool Day** (tonight) | Locked: 20 seats, 18 confirmed, 1 pick expiring (→ replacement demo), 2 waitlist. Door list ready, codes incl. "Sara Capriotti · LST-4F". | Confirmed tonight → **Pass LST-4F** + Brief. Pinned on Home. |
| **Late Lounge** (Fri) | Open: 137 applied, 24 to review, mix 9/15 girls · 3/5 guys. Closes Fri 20:00. | Applied · under review. (Switchboard/timer → Picked → takeover demo.) |
| **Rooftop Session** | Draft (edit demo). | Not visible (drafts are invisible to members). |
| **Sound Bath** (last week) | Past: recap — 20 confirmed, 18 showed, 2 no-shows, avg rating 8.6, stories 14 verified + 1 in review + 3 due/missed, reach 412k, invoice The Twenty · Due. | Past: Checked in → **Story due** (upload demo → verdict path). |
| **Vinyl Night** (two weeks ago) | Past: settled invoice (Paid). | Past: Verified ✓. |
| **Sunset Tasting** | — | Past: Not selected (quiet). |
| **Harbor Club night** | Cancelled (in Past segment). | Cancelled (quiet, no strike note). |
| One Explore event | — | Tier-gated example (wave 2). |

**Switchboard:** hidden demo panel — inside Settings sheet (member) and Venue tab (venue), visually tucked away (small "Demo" disclosure at the bottom, plain rows, clearly not product UI). Actions: *Venue picks you now · Expire a pick · Check me in · Force story verdict (verified / needs review / rejected) · Reset demo.* Venue-side equivalents: *New applicants arrive · A pick declines · Advance to tonight · Reset demo.* Default timers still run (apply → picked ~10s; upload → verdict ~8s) so hands-off flow works.

## 6. Build waves

**Wave 1 — the complete night.** Lifecycle states both sides · apply fix + Picked-via-notification · post wizard (+ Bundle + Brief + deadline) · applicant sheet + undo · Close applications · waitlist + replacements · Pass + door codes · Close the night → Recap (incl. invoice block) · story upload → AI verdict path · Cancel event · seed world + switchboard.

**Wave 2 — money + meta.** Billing list + Insights tiles · member invite codes · tier-gated events · Standing/strikes block · Withdraw + Decline polish · full notification models · edit-Open (time/brief) · "Run it again" rebook.

Will reviews the live prototype between waves.

## 7. Cut from v1 (do not build, do not re-ask)

Chat (any form) · QR / camera scanning · FCFS waitlist queues · in-app payments · auto-IG verification · multi-venue switching · DJ marketplace · Android · web member app.

## 8. Constraints

- **Design system: Kit V.2** — anthracite/cream monochrome, Cormorant Garamond display + Plus Jakarta Sans body, sentence case everywhere, no all-caps (statusbar exempt), arrows on CTAs, no ice blue, dark primary. Grey hierarchy allowed (v2 ruling). No Inter, no Instrument Serif, no emojis.
- Existing v2 gotcha: Tailwind CDN fights custom classes — keep the doubled selectors (`.font-black.font-black`, `.font-mono.font-mono`).
- Mock shapes stay normalized/vendor-neutral (same posture as `mockCreatorDataFetch` / venue objects) so the backend swap is clean.
- Self-contained files, React + Babel CDN, no build step, no new dependencies.
- Every visible control responds (sheet, state change, or toast). No dead taps.
- Verification: static checker (`web/check-venue.mjs` pattern) per task + browser eyeball by Will. No test framework (standing prototype rule).

## 9. Open questions for founders (not blockers)

- Real bundle prices (placeholders: The Ten $400 / The Twenty $700 / The Forty $1,200 — Radwan/Dima set real ones).
- Strike policy ratification (3 strikes = pause — working default).
- Confirm window length (24h working default; events posted <24h out need a shorter window — prototype uses 24h or "by doors time", whichever is sooner).
