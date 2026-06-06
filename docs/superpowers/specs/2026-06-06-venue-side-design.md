# The List — Venue Side (design spec)

Date: 2026-06-06
Status: approved (brainstorm), pre-plan
Surface: HTML prototype, new file `web/venue.html` (member side stays `web/index.html`)

---

## 1. Goal

Build the second side of the marketplace: the **venue/business** experience. A venue registers, posts a time-boxed event with seats + a gender mix, influencers apply, and the venue swipes Tinder-style through applicants (yes/no), seeing each applicant's quality rating, IG + TikTok followers, and social links.

Built as a mocked, tap-through HTML prototype — same pattern as the influencer side. Carbon black + ice blue + Plus Jakarta Sans, 100% design-system reuse. SwiftUI port unifies both sides later.

## 2. Decisions locked (brainstorm)

| Fork | Decision |
| --- | --- |
| Target surface | HTML prototype first (match member side); SwiftUI later |
| File layout | New `web/venue.html`; shared role-select on the intro; member build basically untouched |
| Gender mix | **Soft target + live counter** (fills, never blocks) |
| Image upload | **Real local file pick + crop-to-frame** (FileReader, no server) |
| Quality rating | **Single 0–10** number on the swipe card |
| Auth | **Mocked role login** (real auth = Supabase phase) |
| Nav model | **Bottom tab bar**, 3 tabs (consistent with member side) |

## 3. Entry + role split

- `web/index.html` intro gains a **role chooser**: **Member** | **Business**.
  - Member → existing influencer flow (Apply for access / I have an invite). Unchanged.
  - Business → routes to `web/venue.html`.
- `web/venue.html` mirrors the grainy splash in a business voice:
  - **List your venue** (ice, primary) → onboarding/signup
  - **Business login** (ghost) → mocked login; any input enters → Events dashboard
- A "I'm a member" link on `venue.html` routes back to `index.html`.

Flow: `intro → [Member | Business] → Business → venue.html → login/signup`

## 4. Business onboarding

```
login / signup
  → Group step (SKIPPABLE)
       [Create group: name + logo]   or   [I'm independent · skip]
  → Venue assets
       name · type (Club/Restaurant/Beach/Lounge/Gym) · area · short description
       hero image (crop to 4:5)
       4 venue images (crop to 4:5) — swipeable gallery on the member side
  → Done → Events dashboard
```

- Group is one optional screen. Independent venues skip straight to venue assets.
- A group can hold multiple venues; the **Venue** tab has a venue switcher when >1 exists.
- "One brand → many establishments" (from `context.md`) is honored by the Group → Venue hierarchy.

## 5. App shell — 3 tabs

Bottom tab bar, same component/treatment as the member side (frosted glass, ice active icon, no dot).

| Tab | Holds |
| --- | --- |
| **Events** | The venue's drops grouped Draft / Live / Past, plus a prominent **Post an event** CTA |
| **Applicants** | Live events, each with an applicant count → tap → swipe deck for that event |
| **Venue** | Group/venue assets + images, profile, settings, venue switcher |

Applicant review is **per-event** (you review applicants for a specific drop), reached from the Applicants tab or from a Live event in Events.

## 6. Post-event flow

Full-screen, launched from the Events tab CTA.

```
Basics      → title · type · date · time
Seats + mix → Girls [15] + Guys [5] = 20 seats   (auto-sum)
              or "No preference" → split hidden, ask total seats only
Hero image  → pick + crop to 4:5  (reuse venue hero or upload a new one)
Exchange    → "1 Story + tag" (locked default copy, editable)
Review      → Publish → event goes Live, appears on the member side
```

- Seats total auto-sums from the gender split. "No preference" collapses the split to a single total.
- Story requirement defaults to **1 Story + tag** (the locked product rule — never 4).

## 7. Applicant swipe (Tinder)

- **Card content:** photo · name · **quality rating 0–10** (◈) · **IG followers · TikTok followers** · tappable links (Instagram / TikTok / other).
- **Actions:** swipe ✗ / ✓ plus on-screen buttons. Yes → adds to **Picked**.
- **Live counter** pinned above the deck: `Girls 12/15 · Guys 3/5`. Soft — it fills as you pick, and never blocks a swipe even past the target.
- **Empty state:** deck exhausted → review the Picked list.
- Picked list is reviewable (who's in), with the gender counter as the running tally.

## 8. Image component (shared)

One reusable cropper used by both onboarding and post-event.

- Local **file pick** (`<input type=file>`) → image rendered in a **fixed frame**.
- **Drag + pinch/scroll-zoom** to position inside the frame → **Use this**.
- Output kept as a data URL in app state (FileReader only — **no upload, no server**).
- **Hero frame: 4:5 portrait** (matches the member-side event cards). Venue gallery = 4 images, same 4:5, swipeable on the member side when an event is opened.

## 9. Data model additions (vendor-neutral, mocked)

Mocked the same way as `mockCreatorDataFetch()` / `SEED_PROFILE` on the member side — shaped like a normalized provider response so it's swappable later.

- **Applicant shape gains:**
  - `gender` — the influencer's own gender ("female" | "male"), needed to drive the mix counter.
  - `tiktok_followers` — number.
  - `socials: { instagram, tiktok, other }` — URLs for the tappable links.
  - reuse existing `quality_score` (0–1) → displayed as a 0–10 rating.
- **New entities:**
  - `Group { id, name, logo }`
  - `Venue { id, groupId|null, name, type, area, description, heroImage, images[4] }`
  - `VenueEvent { id, venueId, title, type, date, time, seats, mix:{girls,guys}|null, heroImage, exchange, status }`
- A seed set of fake applicants (mixed gender, varied ratings/followers) feeds the swipe deck.

TikTok followers can also surface on the **member-side** profile later — small follow-on in `index.html`, **not in this scope** unless requested.

## 10. Design system

100% reuse of the locked system (`DESIGN.md`, `PRODUCT.md`): carbon black `#0A0A0A`, ice `#9FD8E8`, bone `#F5F1EA`, Plus Jakarta Sans one-family. Existing vocabulary reused: pills, cards, bottom sheets, `StatusPill`, `Segmented`, `DateChip`, `SectionHead`, `Toast`, `Toggle`, the cropper frame styled as an input surface.

**One genuinely new component:** the **applicant swipe card**. Everything else is restyled existing vocabulary.

Hard rules carried over: no purple/pink, no second accent, ice ≤10%, no emoji, no Inter, no Instrument Serif, flat-at-rest, glass-only-for-floating.

## 11. Mocked / out of scope (Supabase phase)

- Real auth, sessions, RLS/"secure" — mocked role login only.
- Real image storage/upload — FileReader/data-URL only.
- Real creator-data provider (IG/TikTok numbers) — mocked normalized shape.
- Payments, push/APNs, Story-proof verification.
- SwiftUI — the prototype is the deliverable; native port unifies both sides later.

## 12. Build sequence

```
1  Entry role-split        index.html role chooser + venue.html splash/login shell
2  Onboarding              group-optional → venue assets + image cropper
3  Events + Post           Events dashboard (Draft/Live/Past) + post-event flow
4  Applicant swipe         deck + card + ✗/✓ + soft gender counter + Picked
5  Member-side wire        event open → 4-image gallery + TikTok on applicant data
```

## 13. Success criteria

- A venue can: register (with or without a group) → post an event with seats + gender mix → see applicants → swipe yes/no → see a Picked list, end to end, tap-through.
- The swipe card shows quality rating, IG + TikTok followers, and working social links.
- Hero + 4 venue images are picked from a local file, cropped to frame, and the 4 gallery images are swipeable on the member side.
- Entry lets a user choose Member or Business.
- Zero design-system violations; the venue side reads as the same product as the member side.
