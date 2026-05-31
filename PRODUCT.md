# Product

## Register

product

## Users

**Primary (v1): vetted Beirut influencers, models, and DJs.** Sourced from Dima's 250-300 contact database. Context: on their iPhone in the evening, deciding where to go out, scanning which events are worth applying to. The job to be done: find a desirable, time-boxed event, apply, get picked by the venue, show up, post one Instagram Story tagging the venue. They care about access and status, not discounts.

**Secondary (post-v1): venues.** A separate dual UX where venues post events and swipe through applicants. Out of scope for the v1 influencer app; managed manually (Notion) during the dress-rehearsal phase.

## Product Purpose

The List is an invite-only nightlife marketplace for Beirut. Venues post time-boxed events with limited spots (20-50). Vetted influencers apply; the venue swipes Tinder-style and picks who comes. In exchange for the spot, the influencer posts one Instagram Story tagging the venue. **Brand pays, influencer free.**

It is a structural clone of The Secret Society (Dubai) with a deliberately different visual language. Success = paid drops booked, high venue-repeat rate, and Stories actually posted. The unfair advantage is Dima's pre-built creator database (the cold-start that took TSS three years to assemble) and Radwan's venue relationships.

iPhone-first, Beirut only, SwiftUI app. The current surface is a clickable HTML prototype (`web/index.html`) standing in for the eventual native build.

## Brand Personality

Berlin nightlife meets fashion editorial. Closer to Aesop / Bottega / Berghain than to Uber Eats or a dating app. Three words: **editorial, exclusive, nocturnal.** Confident and restrained, never hype-y or cute. The emotional goal is quiet status: "I'm on a list other people aren't," anticipation, belonging. Voice is sparse and specific; copy names real venues and real exchanges, not slogans. Bilingual-ready (English first, Arabizi-friendly).

## Anti-references

- **The Secret Society's own visual language**: purple-pink gradients, cheesy "editorial" cosplay. We copy their structure and throw away their look.
- **Dating apps.** We borrow the swipe mechanic but must never read as Tinder/Bumble.
- **Coupon / discount apps.** This is access and status, not a deal. No "% off," no urgency-coupon energy.
- **Generic SaaS / startup gradients.** No glowing gradient hero clichés.
- **Fonts**: no Inter anywhere; no Instrument Serif (an AI-design tell as of 2026).
- No emojis in the UI. No "Great question!" filler in product copy.

## Design Principles

1. **Scarcity is the product.** Limited spots, countdowns, and "you're in" moments are the core value. The UI should make access feel earned and finite, never abundant or always-available.
2. **Earned familiarity, editorial skin.** Use standard app affordances (bottom tab bar, apply button, swipe, bottom sheet) so the app is instantly usable; the distinctiveness lives in typography, color, and copy, not in reinventing controls.
3. **Status without shouting.** Exclusivity comes through restraint and editorial confidence, not badges, gradients, or hype words. If a screen feels loud, it is off-brand.
4. **A few screens are moments, the rest are tools.** This is a consumer nightlife app: the Picked / "You're in" reveal and the onboarding tier reveal are emotional peaks that earn choreography. Browse, Explore, and Profile are tools and should stay calm and fast.
5. **Beirut-local, never stock.** Real venue names, real neighborhoods, bilingual-ready. The app should feel made for this scene, not a template skinned for it.

## Accessibility & Inclusion

Working target: **WCAG AA** (body text >=4.5:1, large text >=3:1, visible focus states, labeled controls) plus honoring `prefers-reduced-motion` (the prototype already guards its stagger/reveal animations). The ice-blue accent must never be the sole signal of state; always pair it with text or an icon so it survives color-blindness and the dark/light theme switch.

Not yet formally ratified by the founders; treat as the design default and revisit when the SwiftUI build begins. Known debt to check: muted-grey body text and white-on-image overlays on the prototype need a contrast pass (good first `/impeccable audit` target).
