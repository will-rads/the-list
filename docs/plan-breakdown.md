# Radwan's Pitch — Plan Breakdown

> Source: 9 WhatsApp voice notes recorded 2026-05-19, 10:06–13:02.
> Transcripts (Arabizi + English) in `transcripts.json`.
> Reference image: `secretsociety.jpeg` — Radwan's iPhone home screen with the **The Secret Society** app circled inside his "Social" folder (Dubai-based, invite-only model/influencer perks app).

---

## 1. The core idea (one sentence)

Build a Lebanese clone of **The Secret Society** (Dubai) — an invite-only, two-sided marketplace where vetted **models / influencers** get heavily discounted bundles at **clubs, bars, pubs, resorts**, in exchange for posting Instagram Stories from the venue.

---

## 2. Why now (Radwan's framing)

- He and Dima had this idea **2-3 years ago** but parked it (couldn't build the app themselves).
- Trigger event: Will brought up the idea of building an app together → Radwan remembered.
- **First-mover urgency:** Nobody has cloned it in Lebanon yet. Many Lebanese DJs commute to Dubai and most top models there already know The Secret Society — *someone* will copy it soon.
- **Season urgency:** It's the **start of summer** — they can ship in 2-3 months and ride peak Beirut nightlife.
- Radwan claims he just submitted his Secret Society profile (24h review window) so the team can study the UX from inside.

---

## 3. The two sides of the marketplace

### Side A — Models / Influencers / DJs (demand)
- Tiered by follower count (e.g. 5k / 10k / 15k+ → different perk levels).
- Pay a fraction of normal cost ($40-50 instead of $150-200) for an open-bar / cocktail bundle.
- **Obligation:** post a Story from the venue.
- UX analogue Radwan named: **Toters** — log in as a "buyer" persona, browse offers by venue.

### Side B — Venues (supply)
- Clubs, bars, pubs, resorts, restaurants become **members** of the platform.
- Two bundle models being debated:
  - **Radwan's preference:** 3 fixed tiers — e.g. $50 / $70 / $100 bundles — easier to sell.
  - **Dima's preference:** fully **custom bundles per venue** (each venue knows its own cost structure better).
  - → Likely answer: ship with 3 templates, allow custom override.
- UX analogue: **Toters seller side** — different UI from the model side. Same app, role-gated.

### Working name candidate
- Dima suggested **"The List"** → Radwan: "nice but a bit cheesy." Still open.

---

## 4. The killer mechanic — "limited spots"

This is Dima's contribution and Radwan thinks it's the strongest hook.

- Each bundle at each venue has a **capped number of slots** (e.g. **20 spots** for a Saturday at Kee Beirut).
- Creates scarcity → models fight to claim a spot → FOMO.
- Drives demand to the app (not the venue's own DMs).
- Vibe argument: *"20 well-dressed models walking into a bar changes the whole atmosphere, the Stories go viral, guys follow next week."*

This is the wedge that gets venues to actually pay for the bundles — they're not buying drinks, they're buying a curated crowd + reach.

---

## 5. Business model / monetisation

- **The founders take a cut** on each bundle sold (Radwan: *"akid byetla3lna cut, mesh 3am na3mela kermal PR"*).
- Open questions he flagged for the Friday meeting:
  - % cut per booking
  - Venue membership fee? (flat monthly vs. per-booking only)
  - Tier pricing for influencers (free with proof of follower count? annual?)
- Secondary revenue (later phases):
  - DJ booking marketplace (Radwan's original angle — parked for v1)
  - Other "services" not yet defined

---

## 6. Why he thinks they'll win — the unfair advantages

1. **The Dima database.** ~150-200 female + 100-150 male models in Lebanon, with WhatsApp numbers + Instagrams. Built over 3 years of shoots / industry work. Total ~250-300 cold-warm contacts.
2. **Dima Bareface herself** — she has worked with most of them. A bulk WhatsApp from her gets opened; from Radwan/Will it gets ignored. She's the sales channel.
3. **Radwan as front-facing co-founder** — Lebanese DJ, plays the venues this app is targeting. "Image at the front." When venues see a co-founder DJing at Kee, conversion is easier.
4. **A-list anchors.** He claims the top male and top female model in Lebanon are personal friends and would publicly back the launch.
5. **Persona validation** — names his friend Anthony Labaki (C43 AMG / Rolex archetype) as exactly the customer who *loves* to save: "yeftah Puccini b 13 dollar w 3ando Rolex." His thesis: high-status people are price-sensitive at the surface tier, and that's where the product lives.

---

## 7. Team & equity (Radwan's proposal)

| Founder | Role | Contribution |
|---|---|---|
| **Radwan** | PR / image / DJ front | Industry presence, venue relationships, public face |
| **Dima** | Database / sales / model relations | The 250-300 contact list + the trust to actually message them |
| **Will (you)** | Tech / AI / build | Apps, copy, brand systems, automation |

**Equity:** **33.33% / 33.33% / 33.33%.** "Nothing moves unless the three of us sign off." Meeting → decision → execute.

---

## 8. Execution plan he's outlining

- **This weekend (Saturday)** — three-way working session at his place, then "deghre 3a Kee Beirut" for field research.
- **Before then** — Will brainstorms with AI on how to gather all of this into one structured plan.
- **First 24h** — Radwan gets accepted into The Secret Society → all three study the app from inside.
- **Phase 1 (this summer)** — launch with **models + PR side only**. No DJ booking layer yet.
- **Phase 2** — once the app has momentum: layer in DJ bookings, music services, etc.
- **Heavy AI use** — for copy, brand, structure, even brainstorming. He compared "how easy the portfolio was" with AI vs. "the app is the harder lift."

---

## 9. What's actually needed from us — checklist for Saturday

### Product / design
- [ ] **Pull apart The Secret Society** once Radwan's in (screen-by-screen audit of flows: onboarding, vetting, browse, claim, post-proof).
- [ ] Decide the **role-split UX** (model side vs. venue side — single app or two apps?).
- [ ] Decide the **tier model** (3 fixed bundles vs. custom-per-venue vs. hybrid).
- [ ] Lock the **limited-spots** mechanic — how spots release, claim window, no-show penalty.
- [ ] **Story-proof loop** — how does the app verify the influencer actually posted? (manual review, IG API, screenshot upload?)
- [ ] **Name** — "The List" is on the table. Brainstorm 5–10 candidates with domains checked.

### Tech
- [ ] Decide stack — likely mobile-first (the reference is iOS). Cheap options: React Native + Expo, or PWA first to ship faster.
- [ ] Backend / auth / role-based access (model / venue / admin).
- [ ] Influencer vetting workflow (Instagram handle → follower count → manual or automated tier).
- [ ] Venue dashboard (create bundle, set spots, see claims, see Story proofs).
- [ ] Admin dashboard (the three founders see everything, approve, override).
- [ ] Notifications (new bundle drops, spot left = X, claim confirmations).

### Business / GTM
- [ ] Cut % per booking — propose a number.
- [ ] Venue membership model — free to list + take cut, or paid tier? Recommend: free + cut for v1 to remove friction.
- [ ] Pricing for end users (models) — likely free with verification; paid tier later for premium drops.
- [ ] Launch sequence: which 5-10 Beirut venues do we close first? Kee is the recurring example.
- [ ] Bulk WhatsApp script from Dima for the 300-name list — opt-in to a soft waitlist before launch.

### Legal / ops
- [ ] LLC / partnership structure with 33/33/33 split — Lebanon vs. offshore?
- [ ] Terms for venues (revenue share, content rights, no-show policy).
- [ ] Terms for influencers (Story commitment, tagging requirements, penalty for skipping).

### Risks to flag at the meeting
- **The Secret Society launching Beirut themselves** — Radwan's biggest fear; we should plan a moat (exclusivity contracts with top 10 venues from week 1?).
- **Story-proof gaming** — influencers claim the deal, post a low-effort Story, vanish. Need a quality bar + a kill-switch.
- **Two-sided cold start** — classic chicken-and-egg. Mitigation: pre-load Side A (the database is the asset) before approaching Side B.
- **Lebanon FX / payments** — venue payouts, model fees: USD cash, Whish, OMT, Stripe? Needs an answer.

---

## 10. One-line summary

A two-sided invite-only nightlife marketplace where Dima's 300-name model database is the cold-start advantage, Radwan is the front-of-house and venue relationship layer, and we build a Toters-style role-gated app that lets venues drop limited-spot bundles which models claim in exchange for Stories — shipped this summer to beat The Secret Society into Lebanon.

---

## Files produced this session
- `transcripts.json` — all 9 voice notes in Arabizi + English + overall summary.
- `transcribe.py` — reproducible script (Gemini 3 Flash, thinking=high, single-request batch).
- `PLAN-BREAKDOWN.md` — this document.
