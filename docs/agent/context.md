# Context

## What we are building

**The List** — an iPhone app where vetted Lebanese models, influencers, and DJs apply to attend time-boxed events at clubs, restaurants, beach clubs, gyms, and lounges in Beirut. Venues post events with limited spots (20-50). Influencers apply. The venue Tinder-swipes through applicants and picks who comes. In exchange for the spot, the influencer posts an Instagram Story tagging the venue.

Two sides of the marketplace:

```text
Influencer side                Venue side
─────────────                  ──────────
applies to events    ◄────►    posts events
gets picked                    swipes applicants
shows up                       checks them in
posts Story                    reviews them
gets reputation score          builds invite list
```

iPhone-first. SwiftUI app. v1 = Beirut only.

## Why now

- The idea has existed in Dima's WhatsApp database for 3 years.
- Radwan re-surfaced it 2026-05-19 after Will brought up "let's build an app."
- The Secret Society (Dubai, 100k+ members, 8 cities) is launching **a new city every 60 days** in 2026. Beirut is plausibly on their roadmap.
- The Lebanese model database (Dima's 250-300 names) is the cold-start advantage that took TSS's founder 3 unpaid years to build manually.
- Beirut nightlife peak season starts in **June**. Shipping in 60-90 days lands us in the window.

## Business model

**Brand pays. Influencer free.** Same as TSS, A-List, and Expin. Don't fight the model.

```text
Venue ─ pays $$ ─► The List ─ keeps cut ─► Founders
  ▲                    │
  │ Story posted       │ matches & manages comms
  └──── Influencer ◄───┘
        (gets free / discounted access)
```

| Revenue line | v1 | Later |
| --- | --- | --- |
| Cut per booking | **20%** of bundle price | revisit at booking #50 |
| Venue membership | Free (only the cut) | Tiered subscription, year 2 |
| Influencer fee | None | Premium drops gated to verified-paying tier, year 2 |
| DJ marketplace | Not in v1 | Phase 2 (Radwan's network) |

## The unfair advantage

| Asset | Provided by |
| --- | --- |
| **The 250-300 model database** with WhatsApp + Instagram | Dima, 3 years of relationships |
| **The trust** to actually get messages opened | Dima Bareface as sender |
| **The image / front of house** | Radwan, working Lebanese DJ |
| **The build** | Will |

TSS's founder Romain Fourel spent 3 years doing the WhatsApp version of Dima's job before he wrote any code. We start where he was in year 3.

## The reference

**The Secret Society** (Dubai). See `research/screenshots/` (10 screenshots) and `docs/secret-society-research.md` (full breakdown).

Their structure works. We **copy structure, throw away visual language**.

### What TSS does well (copy)

- Apply + Swipe model
- Reputation scores (Punctuality / Presentation / Joviality)
- No-show tracking with CHECKED IN / CHECKED OUT / NO SHOW status
- Event-based (not subscription), each event has its own time window
- One brand can manage many establishments (Brand → Establishments → Events)
- Concierge layer: TSS handles all pre/post creator comms for the venue

### What TSS does poorly (we exploit)

- **4-Story rule** clutters Instagram feeds → we do 1 Story + venue tag
- Generic briefings → ours are sharper, more editorial
- Hidden pricing for venues → ours self-serve transparent
- Purple-pink gradients, cheesy visual language → we go editorial dark / bone light
- English only → we do bilingual (English + Arabizi-friendly)

## Architecture (where things will live)

```text
Today (prototype phase)
═══════════════════════
web/index.html        → v0.4 live single-phone tap-through prototype, shipped on Vercel
web/gallery.html      → archived alternate/reference design
web/mockup-v1.html    → archived original carbon black + ice blue reference


Now (build phase)
══════════════════
ios/                  → SwiftUI app
├── TheList.xcodeproj
└── Sources/
    ├── Screens/      → Home, Explore, EventDetail, MyEvents, Profile, Picked
    ├── Components/
    ├── Models/
    └── Services/     → Supabase client

Backend            → Supabase (auth, Postgres, storage, realtime)
Creator data       → 3rd-party provider (TBD: Phyllo / Modash / Ensembledata)
                     wrapped behind our own normalized API
                     → OAuth "Verify with Instagram" path for verified tier
Push               → APNs via Supabase Edge Functions
Story proof        → manual review v1, auto v2
Payments           → Whish / OMT / USD cash v1, Stripe later
```

### Onboarding data flow (UX locked, vendor not yet)

```text
User taps "Apply for access"
   ↓
Phone + IG handle submitted to our backend
   ↓
Supabase Edge fn: POST /api/creator-data { handle }
   - Backend hits whichever provider we choose
   - Normalizes the response to our shape
   ↓ ~2s
Returns: followers_count, engagement_rate, audience (gender_split,
country_split, age_split), quality_score, profile_picture_url,
tier_suggestion, data_status: "estimated"
   ↓
Profile screen renders with this data
"Self-reported · Tier 1" badge until OAuth
   ↓
[Optional] User taps "Verify with Instagram"
   ↓
Provider's Connect/OAuth flow → user authorizes IG access
   ↓
Webhook updates row: data_status: "verified", numbers may shift slightly
Badge flips to "Verified · Tier 1"
```

No manual review in the happy path. Founders only touch borderline / suspicious accounts. **Vendor is swappable** because all providers feed the same normalized response shape — the client (SwiftUI / web) never sees vendor specifics.

### Profile data sourcing (vendor-neutral — provider still open)

Everything on the Profile screen is **mocked** in the prototype via `mockCreatorDataFetch()` and the shared `SEED_PROFILE`, shaped exactly like the normalized response a provider will return. Nothing is scraped from Instagram (see `errors.md`). The provider is **deliberately not locked** — candidates Phyllo / Modash / Ensembledata, chosen after a trial.

| Profile field | Mocked now (prototype) | Provider supplies (production) |
| --- | --- | --- |
| Profile photo | `SEED_PROFILE.profile_picture_url` (Unsplash stand-in) | `profile_picture_url` from the handle lookup |
| Followers | Hardcoded 28.4k | `followers_count` |
| Engagement | Hardcoded 5.8% | `engagement_rate` |
| Audience split | Hardcoded gender + country | `audience.gender_split` / `audience.country_split` |
| Verification badge | `data_status` flips `estimated → verified` on the in-app Connect tap (local state only) | `data_status` flips via the OAuth / Connect SDK webhook |

The client never sees vendor specifics, so swapping providers is one backend Edge-function change. Badge reads "Self-reported · Tier 1" until OAuth, then "Verified · Tier 1".

## The core screens (influencer side)

| # | Screen | Purpose |
| --- | --- | --- |
| 00 | Entry / Intro | TSS-style splash: full-bleed grainy Beirut nightlife video montage (3 × 5s crossfading clips, looping), centered THE LIST wordmark + "By invitation only", Apply for access (solid ice) + I have an invite (ghost). First onboarding step → phone. |
| 01 | Home | Featured events tonight, quick filters, bottom tab bar |
| 02 | Explore | Full event list, calendar strip, filter by date / type / location |
| 03 | Event Detail | Photos, time, spots remaining, post requirement, Apply button |
| 04 | My Events | Invited / Confirmed / Past tabs, Accept/Decline on invites |
| 05 | Profile | Photo, IG handle, audience donut, history, reputation |
| 06 | Picked | Full-screen takeover when venue picks you, 24h countdown |

Venue side is a separate dual UX. Out of v1 scope until influencer side ships.

## Voice & brand direction

- **Tone:** Berlin nightlife meets fashion editorial. Closer to Aesop / Bottega / Berghain than Uber Eats.
- **Not:** purple, pink, gradient-y, cute, dating-app, coupon-app.
- **Fonts (locked):** Plus Jakarta Sans — one family across the app (the One-Family Rule), headers bolder, numbers inherit. Avoiding Inter + Instrument Serif (too AI-flavored).
- **Accent (locked):** Ice blue `#9FD8E8` (light `#26768F`) on Carbon Black `#0A0A0A`, Bone `#F5F1EA` text. No grey text — text is full-contrast ink (Bone `#F5F1EA` on dark / Black `#0A0A0A` on light). Restrained to ≤10% (actions / selection / state). Acid lime and champagne gold rejected. Dark mode is primary. Full visual system in `DESIGN.md`.

## Open questions still on the table

- Working name — "The List" is the working title. Test with Dima's first 30 contacts before locking.
- Story verification mechanic — manual screenshot upload v1; Phyllo Connect's media-history API v2 once we have enough verified users to compare against.
- Venue exclusivity contracts — 6-month? 12-month? What's enforceable in Lebanon?
- Operating entity — Lebanese LLC vs offshore (Delaware / Estonia e-Residency)?
- Whish vs OMT vs USD cash payouts to venues
