# Plan

## Where we are right now

Release tracker: [App Store launch checklist](../app-store-launch-checklist.md). Provider research: [Phyllo feasibility report](../phyllo-feasibility.md).

**Phyllo direction (2026-07-11):** preferred provider for the first sandbox trial. Onboarding uses handle-only public estimates with no Instagram login. Members can later use **Connect Instagram** from Profile through either Instagram Direct or the richer professional-account + Facebook Page route. This connection verifies Instagram data; it does not replace Supabase login. Production price, exact fields, IG Direct enablement, and full white-label terms still need written confirmation from Phyllo.

**Phase: backend v1 LIVE on Supabase (2026-07-10) — next: Will click-tests the production backend.** Project `zrbakomzpuesifasuamb` powers the production app at `the-list-omega.vercel.app`: `/v3` = wired member app, `/v3/venue` = wired venue app, `/v3/e?id=` = public teaser, and `/admin` = founder ops. `/` and `/v2` are frozen archives. The SwiftUI app is scaffolded with mock services and CI green; Supabase binding is the Mac-day wave. v3 glass is the adopted look. After the production click-test: choose the SMS provider; add `GEMINI_API_KEY` + complete Meta App Review to light up Stories; trial Phyllo or another creator-data provider.

```text
[done]      Voice notes transcribed + plan synthesized
[done]      The Secret Society researched (origin, scale, weaknesses)
[done]      6 reference screens designed in HTML (dark + light)
[done]      Image set curated (Unsplash, venue-appropriate)
[done]      Single-phone tap-through prototype (onboarding → home → detail → apply → picked → my list)
[done]      Fonts + accent locked (Plus Jakarta Sans — one family, ice blue)
[done]      Design system documented (PRODUCT.md, DESIGN.md, .impeccable/design.json)
[done]      UI quality passes: a11y/contrast, icons, flat cards, editorial polish
[done]      Type/color overhaul: single-font Plus Jakarta Sans + no grey text
[done]      User-side interaction pass (v0.3): Saved tab, Share + Settings sheets, verify flip, finished dividers
[done]      TSS-style grainy entry screen (v0.4): 3 Veo clips from Nano Banana stills, crossfading montage
[done]      Reviewed → merged to main → deployed to Vercel (the-list-omega.vercel.app)
[done]      Venue side prototype (web/venue.html, branch venue-side): role split, onboarding, post-event + gender mix, applicant swipe + counter, member-side gallery + TikTok
[done]      Fullness pass both sides (2026-06-10): venue demo path + Desk tiles + Door check-in; member bell + greeting + stat tiles + calendar — UNCOMMITTED, unverified
[done]      Brand Kit V.2 received → v2 reskin built (2026-06-11): anthracite/cream monochrome, Cormorant Garamond + Plus Jakarta Sans, sentence case, arrows on CTAs
[done]      All merged to main + deployed (2026-06-11): v1 at /, v2 LIVE at /v2 on the-list-omega.vercel.app (v2 moved to web/v2)
[done]      v2 reviewed → ADOPTED as product base (2026-06-11); v1 frozen as archive
[done]      Feature-complete v1 brainstorm → spec approved (docs/superpowers/specs/2026-06-11-v1-feature-complete-design.md)
[done]      Wave 1 built (2026-07-03, branch wave-1): lifecycle both sides, wizard, deck + undo + waitlist, desk, door + codes, recap, honest apply → picked flow, Pass + Brief, story upload → AI verdict, notification deep links, both demo switchboards, mirror audit. Dark mode → pitch black.
[done]      v3 glass reskin adopted (2026-07-04): member web moved to the Jakarta-only, no-grey, bg-3 glass system
[done]      SwiftUI scaffold + CI (2026-07-04/05): member + venue mock services compile and test; Supabase binding waits for Mac day
[done]      Backend v1 + venue web + teaser + admin deployed (2026-07-10): live Supabase loop wired through production
[done]      Web v3 Profile analytics redesign (2026-07-11): member + venue four-tab dashboards, truthful data modes, charts, lazy content
[done]      Deterministic Sara preview (2026-07-11): /v3?demo=1 bypasses saved login and opens the complete seeded dashboard
[doing]     Will click-tests production backend  ◄── HERE
[next]      Will visually approves the deployed HTML Profile analytics; then port it to SwiftUI
[next]      Choose SMS provider; switch auth from email OTP to phone OTP
[next]      Add GEMINI_API_KEY + complete Meta App Review; then light up Story scoring
[next]      Open Phyllo sandbox; test Lebanese handles; request written pricing, field matrix, IG Direct, and white-label terms
[next]      Lock working name (test with Dima's top 30)
[next]      Venue anchor contracts (5-10 Beirut venues)
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
| Creator data provider | Phyllo is the preferred sandbox trial; final production choice waits on data coverage and written pricing. | Will |
| Equity | 33/33/33, 24-month vest | Will |
| Name | "The List" → test with 30 | All 3 |
| Operating entity | TBD (offshore likely) | Will |

### Phase 2 — Two parallel tracks (build shipped; sales ongoing)

```text
Track A — Build (Will)                Track B — Sell (Radwan + Dima)
──────────────────────                ─────────────────────────────
v3 member + venue web live            target list: 5-10 anchor venues
SwiftUI scaffold + CI green           Kee Beirut + 2 clubs
Provider trial pending                2-3 restaurants
Graph API + Gemini dark               1-2 beach clubs
Browse drops + Apply live             1 wellness anchor
Realtime web notifications live       pitch deck (5 slides)
Venue v3 web live                     6-12mo soft exclusivity
                                      0% fee for first 90 days
```

The two tracks **must run in parallel.** You can't fix a product without users on it.

### Phase 3 — Dress rehearsal (weeks 5-7)

Run 20-30 real bookings **before the app is in App Store**.

- Dima WhatsApps the drop.
- Google Form claim.
- Notion as venue dashboard.
- Story proof = Graph API + Gemini once keys + Meta review land; no manual upload path.
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
- **Superseded:** manual screenshot Story proof. Current ruling (2026-07-10) is Graph API + Gemini only; it stays dark until keys + Meta review.
- **Auto payments.** Whish / OMT / cash v1.

## Risks to actively manage

| Risk | Mitigation |
| --- | --- |
| TSS launches Beirut while we build | Lock anchor venue exclusivity in weeks 2-6 |
| Story gaming (claim, post nothing) | Gemini rubric + founder override in `/admin` |
| Dima's contacts don't convert | Test on top 30 before building anything heavy |
| Two-sided cold start | Pre-load Side A (database) before pitching Side B |
| Lebanese FX / payments | Whish + OMT + USD cash. No Stripe v1. |
