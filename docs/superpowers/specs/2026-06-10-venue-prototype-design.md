# Venue-side demo prototype + influencer "fullness" pass — design

Date: 2026-06-10. Approved by Will in chat.

## Why

- Radwan needs a tappable venue-side demo for venue pitches (show a phone, not explain a concept).
- Will must see venue UX with zero signup — seeded demo data only.
- Will dislikes the editorial stat treatment; wants TSS-style **widget stat tiles** (rounded card, big number top, small label under) on both sides.
- Influencer app feels "not full" — add notifications, greeting, favorites, calendar.

## Decisions

| Decision | Choice |
| --- | --- |
| Where venue demo lives | **New `web/venue.html`** — standalone, same phone frame + design tokens. `/venue` on Vercel (cleanUrls). Zero risk to the live influencer demo. |
| Auth | None. Opens as seeded venue "Cyan Beach Club". |
| Style | Carbon black + ice + Plus Jakarta Sans (single family). Copy TSS structure (tiles/tasks/counters), never their purple-pink. Ice ≤10%, no grey text, stat tiles per above. |
| Stats restyle | Widget tiles replace editorial stats on BOTH sides. |

## Venue screens (`web/venue.html`)

```
Dashboard ──► Create event ──► Swipe applicants ──► Night-of check-in
```

1. **Dashboard** — "Cyan Beach Club" greeting + bell (badge 3); urgent task card: "Pool Day — open for swipe · 137 applied · closes 04:56" + Start swiping CTA; stat tiles 2×2 (137 Applied / 89 To review / 14 Confirmed / 1 Tonight); upcoming events list; + New event.
2. **Create event** — one form: name, type chips, date, time window, spots stepper, what creators get; fixed exchange line "1 Story + tag"; Post → done state.
3. **Swipe** — full-screen applicant card: photo, name, @handle, followers, engagement, reputation + Punctuality / Presentation / Joviality; X / ✓; counter "3 / 137"; ~6 seeded cards → end state "14 confirmed".
4. **Night-of** — tabs Expected / Checked in / No show; tap row to check in; quick-score chips (1–10) after checkout.

## Influencer additions (`web/index.html`)

- Bell + badge top of Home + notifications sheet (picked / closing soon / reminder).
- "Hi, Sara" greeting + next confirmed event pinned at top of Home.
- Widget stat tiles: My List header counts (Applied / Invited / Confirmed), Profile stats (Followers / Engagement / Reputation donut-free tiles).
- Favorites: heart on event cards + saved view/filter.
- Explore: full-month calendar sheet.

## Out of scope

Auth, backend, pricing UI (not locked), multi-venue management, Android, real swipe persistence.

## Reference

TSS venue screenshots in `research/screenshots/` (venue home "Hi Omar", swipe with 3 scores, Checked In/Out/No Show review list, establishments). Structure only — visual language stays ours per `DESIGN.md`.
