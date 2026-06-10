# Plan

## Where we are right now

**Phase: both marketplace sides prototyped.** User side (`web/index.html`) is v0.4, merged to `main`, deployed to Vercel (`the-list-omega.vercel.app`) — TSS-style grainy entry, full interaction pass, and now a 4-image swipeable event gallery + TikTok on the profile. **Venue side (`web/venue.html`) is now built** on branch `venue-side` (mocked, not merged/pushed): role-split entry, group-optional onboarding, image crop-to-frame, Events dashboard, post-event with seats + soft gender mix, Tinder applicant swipe (quality 0–10 + IG/TikTok + links) with a soft gender counter + Picked, Venue tab. Built brainstorm → spec → plan → subagent-driven from `docs/superpowers/`. Same locked carbon+ice+Plus Jakarta Sans system. **2026-06-10 fullness pass on top — UNCOMMITTED + NOT BROWSER-VERIFIED:** venue side got a zero-typing demo path ("Preview the desk"), a Desk/"Tonight" dashboard tab (widget stat tiles + urgent swipe card + bell/Activity), a Door night-of check-in tab, and real applicant portraits; member side got bell/Activity, "Hi, Sara" + pinned night, widget stat tiles (Profile + My Events), and a month calendar on Explore. Will's style call: TSS-style widget stat tiles replace editorial stats, both sides. Next: check branch (`venue-side`?), Will's browser walkthrough → verify (broken images / console errors) → commit → merge decision → SwiftUI port (both sides).

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
[done]      Brand Kit V.2 received → v2/ reskin built (2026-06-11): anthracite/cream monochrome, Cormorant Garamond + Plus Jakarta Sans, sentence case, arrows on CTAs — UNCOMMITTED
[doing]     Will eyeballs v2/index.html + v2/venue.html → feedback → adopt/iterate → docs sync + commit  ◄── HERE
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
web/index.html reference               target list: 5-10 anchor venues
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
