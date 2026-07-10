# Backend v1 — Supabase + web wiring (2026-07-10)

Will approved every ruling below (grill session 2026-07-10). Fable orchestrates + QAs; Codex
(gpt-5.6-sol, medium) implements waves W1-W3. Ponytail rules: shortest diff, no unrequested
abstractions, stdlib/native first.

## Goal contract (the loop)

**Objective:** The List runs end-to-end on live Supabase — member web v3, venue web v3 (new),
teaser + admin pages — deployed on Vercel production.
**Read first:** this file, `docs/agent/memory.md` (top), `web/v3/index.html`, `web/v2/venue.html`.
**Constraints:** don't touch `ios/` (stays mock, CI green), don't touch `/`, `/v2`; v3 glass rules
hold (no gray text, Jakarta only, sentence case, 6-layer glass); no new deps beyond supabase-js CDN;
keep the applying flow UI as built.
**Validate:** `node web/v3/check-v3.mjs` + browser click-through of the full loop per wave.
**Document:** update `docs/agent/memory.md` (newest-on-top entry) when done; no new ADRs.
**Stop when:** a member can sign up → get approved → apply → get picked → confirm → be checked in →
story turns due, AND a venue can log in → post event → swipe → see report, all against production
Vercel + live Supabase — OR a change needs a product call from Will.
Do not weaken checkers or skip QA to reach the stop condition.

## Decisions (locked)

| Branch | Ruling |
| --- | --- |
| Login | Supabase OTP. Email OTP for the test harness (works with zero config); phone OTP is a one-line swap once an SMS provider is added. IG handle mandatory at signup. Never IG login. |
| IG data | Handle lookup via `creator-data` edge stub (mock shape until provider key). OAuth verify = post-Meta-review, built dark. |
| Member gate | Apply → approval queue (founder approves in admin). Invite codes skip the queue. |
| Venue gate | Founder-created accounts only (admin page). |
| Notifications | 18 kinds (12 member / 6 venue) — see catalog. In-app feed from `notifications` table + realtime. Push = later (APNs on Swift side). |
| Share | Copy link → public teaser `/v3/e?id=`. "Message" → WhatsApp icon → `wa.me/?text=` direct. IG branded share-card = post-v1. |
| Stories | Graph API + Gemini only, no manual uploads/review queue. Binary ≥70 verified / <70 rejected. Founder override in admin. `GEMINI_API_KEY` + Meta creds empty → verdict stays `pending`. |
| Billing | `bookings` row per closed event, cut 20% computed column, `invoice_status` manual. No payment processing. |
| Scope | Backend + web only. Swift untouched. |

## Supabase (project `zrbakomzpuesifasuamb`, empty at start)

Tables: `profiles` (role member/venue/founder, status pending/approved/rejected, ig_handle,
creator_data jsonb, reputation), `invite_codes`, `venues`, `events` (seats, bundle_price,
story_window_hours, status), `applications` (status: applied/waitlist/picked/confirmed/declined/
expired/not_selected/checked_in/no_show/cancelled, pick_expires_at, pass_code), `saves`,
`notifications` (kind/title/body/event_id/read), `stories` (application_id unique, score, verdict
pending/verified/rejected, breakdown), `bookings` (bundle_price, cut_pct 20, cut_amount generated).

- Profiles row auto-created by trigger on `auth.users` insert.
- RLS: members see published events + own rows; venue owners see their venue/events/applications;
  founders see all; anon sees published events (teaser). Writes only through RPCs.
- RPCs (security definer, notifications inserted inside them): `redeem_invite`, `apply_to_event`
  (full → waitlist), `cancel_application`, `pick_applicant` (24h expiry + pass code, notif 1),
  `confirm_pick` (notif 14, filled → 16), `decline_pick`, `check_in` (creates story row due_at,
  notif 7), `close_event` (applied → not_selected notif 4, creates booking), admin:
  `approve_member`/`reject_member`, `create_invite_codes`, `create_venue`, `override_story`,
  `toggle_save`.
- Time-based via pg_cron `tick()` every 10 min: notifs 2 (6h confirm reminder), 3+15 (pick expired
  → seat back), 5 (waitlist promote), 6 (pass ready morning-of), 8 (story 3h deadline), 10 (story
  missed → rejected), 13 (venue daily digest), 17 (tonight lineup), 18 (post-event report when all
  story windows close).
- Insert/update triggers: 11 (new published event → all approved members), 12 (event
  changed/cancelled → applicants + savers).
- Edge stubs (dark): `creator-data` (returns SEED_PROFILE-shaped mock unless provider key),
  `score-story` (returns pending unless GEMINI_API_KEY). Rubric prompt lives in the function:
  gates = venue tag present / in window / genuinely from event; score = tag visibility 25 +
  quality 25 + venue showcase 25 + presence 15 + extras 10; ≥70 verified else rejected.

## Notification catalog (kind → recipient)

Member: 1 picked, 2 confirm_reminder, 3 pick_expired, 4 not_selected, 5 waitlist_promoted,
6 pass_ready, 7 story_due, 8 story_deadline, 9 story_verified, 10 story_missed, 11 new_drop,
12 event_changed. Venue: 13 applications_digest, 14 pick_confirmed, 15 pick_expired_venue,
16 event_filled, 17 tonight_lineup, 18 post_event_report.

## Waves

- **W0 (Fable):** this doc; migrations + RLS + RPCs + cron + triggers + seeds; edge stubs; SQL
  smoke test. Fetch project URL + publishable key for the clients.
- **W1 (Codex):** wire `web/v3/index.html`: supabase-js CDN, email-OTP auth in existing onboarding
  (keep flow as built, add invite-code path), live queries replace SEED_* (events, saves,
  applications, notifications + realtime), buttons → RPCs, share sheet Message → WhatsApp,
  Copy link → teaser URL. check-v3 stays green.
- **W2 (Codex):** `web/v3/venue.html` = fork `web/v2/venue.html` + v3 glass + wire: venue login,
  post event, swipe deck over applicants (pick/skip → RPCs), check-in, post-event report.
  Add venue entry to check-v3.
- **W3 (Codex):** `web/v3/e.html` teaser (anon read, apply CTA); `web/admin.html` founder page:
  approval queue, invite codes, create venue, story overrides, bookings.
- **W4 (Fable):** checkers, full-loop browser demo, push → Vercel production, verify URLs, update
  memory.md.

## Environment notes for agents

Vercel root = `web/`, cleanUrls → `/v3/venue`, `/v3/e`, `/admin`. Production domain
`the-list-omega.vercel.app` (only public URL). Git-Bash curl has no TLS here — verify HTTP via
PowerShell or Vercel MCP. http-server caches — use `?v=N`. Anon key in client files is public by
design.
