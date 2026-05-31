# Plan

## Where we are right now

**Phase: prototype shipped — reviewed, merged to `main`, deployed to Vercel** (`the-list-omega.vercel.app`). The single-phone tap-through prototype (`web/index.html`) is built, all 10 UI audit items done, and the type/color overhaul (single-font Plus Jakarta Sans, no grey text) is live. Design direction locked in `PRODUCT.md` + `DESIGN.md`. Next: SwiftUI planning / port → lock working name (test with Dima's top 30) → venue anchor contracts → Supabase scaffold.

```text
[done]      Voice notes transcribed + plan synthesized
[done]      The Secret Society researched (origin, scale, weaknesses)
[done]      6 reference screens designed in HTML (dark + light)
[done]      Image set curated (Unsplash, venue-appropriate)
[done]      Single-phone tap-through prototype (onboarding → home → detail → apply → picked → my list)
[done]      Fonts + accent locked (Plus Jakarta Sans — one family, ice blue)
[done]      Design system documented (PRODUCT.md, DESIGN.md, .impeccable/design.json)
[done]      UI quality passes: a11y/contrast, icons, flat cards, editorial polish
[done]      All 10 UI audit items (Explore rhythm, unified glass, Home masthead, light-theme, spacing, numerics)
[done]      Type/color overhaul: single-font Plus Jakarta Sans + no grey text
[done]      Reviewed → merged to main → deployed to Vercel (the-list-omega.vercel.app)
[doing]     SwiftUI planning / port  ◄── HERE
[next]      Lock working name (test with Dima's top 30)
[next]      Venue anchor contracts (5-10 Beirut venues)
[next]      Supabase backend scaffold
[next]      TestFlight with Dima's top 30 contacts
[next]      Public launch — Radwan DJ set at anchor venue, top 50 invited
```

## Phases

### Phase 0 — Reconnaissance & validation (done / ongoing)

- ✅ Radwan inside The Secret Society. Document every flow.
- ⏳ 3-5 venue gut-checks: "would you pay $500-1000 for a guaranteed 20-model night on a slow Saturday?"
- ⏳ Soft pre-launch ping to top 30 of Dima's database, count "yes I want in" replies.

### Phase 1 — Founder meeting decisions

Lock the v1 spec. See `context.md` in this folder for the table of defaults.

| Decision | Default | Who owns |
| --- | --- | --- |
| Cut % | 20% | All 3 |
| Bundle structure | 3 templates + custom override | All 3 |
| Spot mechanic | Apply + venue swipes (limited spots) | Confirmed |
| Story requirement | 1 Story + tag | Radwan |
| Vetting | **Auto-fetch creator data on submit** (provider TBD) → 3 founders eyeball borderline cases | Dima + Will |
| Creator data provider | TBD — candidates: Phyllo, Modash, Ensembledata. Pick after trialing. | Will |
| Equity | 33/33/33, 24-month vest | Will |
| Name | "The List" → test with 30 | All 3 |
| Operating entity | TBD (offshore likely) | Will |

### Phase 2 — Two parallel tracks (weeks 2-6)

```text
Track A — Build (Will)                Track B — Sell (Radwan + Dima)
──────────────────────                ─────────────────────────────
prototype.html                        target list: 5-10 anchor venues
SwiftUI scaffold                      Kee Beirut + 2 clubs
Phyllo Identity wired                 2-3 restaurants
Phyllo Connect for verify             1-2 beach clubs
Browse drops + Apply                  1 wellness anchor
Notifications via APNs                pitch deck (5 slides)
Manual venue side via Notion          6-12mo soft exclusivity
                                      0% fee for first 90 days
```

The two tracks **must run in parallel.** You can't fix a product without users on it.

### Phase 3 — Manual dress rehearsal (weeks 5-7)

Run 20-30 real bookings **before the app is in App Store**.

- Dima WhatsApps the drop.
- Google Form claim.
- Notion as venue dashboard.
- Story proof = screenshot to Radwan.
- We pay venue via Whish / cash. Keep our 20%.
- Log every friction point.

Rule: **every flow we build into the app should be a flow we've already done 5 times by hand.**

### Phase 4 — Public launch (weeks 9-12)

- App Store + (Play Store, later)
- 5-10 anchor venues under contract
- 100+ vetted influencers from Dima's 300
- 30+ manual bookings completed
- Launch event: Radwan DJ set at an anchor, top 50 invited, content captured = launch ad

### Phase 5 — 90-day decision

```text
> 50 paying drops, > 70% venue repeat   →  Real business. Raise or expand to Tripoli / Jounieh.
20-50 drops, mixed repeat               →  Grind. Automate broken flows.
< 20 drops                              →  The model or the economy is wrong. Revisit.
```

## What's deliberately out of scope for v1

- **DJ booking marketplace.** Phase 2, after influencer side has PMF.
- **Android.** Phase 2, after iOS revenue.
- **Multi-city.** Beirut only.
- **Multi-language UI.** English first, Arabic v2.
- **Auto Story verification.** Manual screenshot DM v1.
- **Auto payments.** Whish / OMT / cash v1.

## Risks to actively manage

| Risk | Mitigation |
| --- | --- |
| TSS launches Beirut while we build | Lock anchor venue exclusivity in weeks 2-6 |
| Story gaming (claim, post nothing) | 3-strikes ban, manual review v1 |
| Dima's contacts don't convert | Test on top 30 before building anything heavy |
| Two-sided cold start | Pre-load Side A (database) before pitching Side B |
| Lebanese FX / payments | Whish + OMT + USD cash. No Stripe v1. |
