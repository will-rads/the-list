# Phyllo feasibility for The List

**Research date:** 2026-07-11
**Sources:** Official Phyllo website, Phyllo/InsightIQ developer documentation, API references, pricing, coverage, legal, privacy, and security pages only.

## Product decision (2026-07-11)

Instagram connection is separate from The List account login. Members still enter The List through Supabase email or phone OTP. Instagram is connected later from Profile to verify ownership and unlock richer creator data.

```text
The List login
-> Profile
-> Connect Instagram
-> choose Instagram Direct or professional account
-> Meta-hosted OAuth
-> Phyllo syncs data
-> Supabase stores the normalized result
```

- Onboarding uses handle-only public analytics first. It requires no Instagram login and must be labelled `public_estimate`, not verified.
- Profile gets a **Connect Instagram** action after onboarding. Do not describe it as signing in to The List with Instagram.
- Offer both connection paths: Instagram Direct for the lower-friction route, and the standard professional-account route linked to a Facebook Page for the richest available data.
- The actual credential and consent screen is hosted by Meta and will visibly be Instagram or Facebook. The surrounding Connect experience can be customized to fit The List, but complete removal of Phyllo/InsightIQ branding or attribution must be confirmed in writing with Phyllo.
- Phyllo must still be disclosed in The List's privacy policy and consent copy even if its name is not shown in the connection UI.
- Handle-only analytics still requires Phyllo sandbox credentials for testing and a production entitlement. Ask sales to quote public lookups separately from connected or monitored accounts; do not assume it is free or included.

## Verdict

**Feasible after prerequisites.** Phyllo can cover The List's required Instagram profile, follower, engagement, audience, content, and identity data. It cannot provide the complete verified data set from an Instagram handle alone.

The practical rollout is:

1. Use Phyllo's **public creator profile analytics API** for the current handle-only onboarding flow. It accepts a username, handle, or profile URL and returns public-data analytics without requiring that creator to connect Instagram. This can populate follower count, profile identity, calculated engagement, recent/top content, and modeled audience data. It does **not** prove account ownership or expose private Instagram insights. [Official public profile analytics API](https://docs.insightiq.ai/docs/api-reference/api/ref/operations/create-a-v-1-social-creator-profile-analytics)
2. Add Phyllo **Connect + Identity + Engagement + Audience** as a later verification step. The creator must authenticate Instagram through Phyllo's SDK. A professional Instagram connection is required for the richest source-authorized data, including reach, impressions, and full audience demographics. [Phyllo Instagram API](https://www.getphyllo.com/instagram-api)
3. Do not start production implementation until Phyllo confirms the commercial quote, production credentials, Instagram product entitlements, IG Direct availability, and the exact field matrix in a work order. Phyllo's current main pricing page publishes customized plans rather than a dependable self-serve price. [Pricing](https://www.getphyllo.com/pricing) [Terms of Service](https://www.getphyllo.com/terms-of-service)

## Product and API fit

| The List need | Phyllo product/API | What it supplies |
| --- | --- | --- |
| Handle-only first pass | Public creator profile analytics: `POST /v1/social/creators/profiles/analytics` | Public profile identity, follower count, calculated engagement, average likes/comments/views, content count, recent/top content, follower history where available, profile type, and modeled audience fields. The request accepts `identifier` as a username, handle, or URL plus the Instagram work-platform ID. [API reference](https://docs.insightiq.ai/docs/api-reference/api/ref/operations/create-a-v-1-social-creator-profile-analytics) |
| Account identity and ownership | Connect SDK + Identity API | A Phyllo user connects an Instagram account; Account and Profile resources then expose platform username/ID, name, URL, image, bio, account type, verification/business flags, and available contact/profile fields. Connection is what verifies that the app user controls the account. [Getting started](https://docs.insightiq.ai/docs/api-reference/introduction/getting-started-with-insightiq-APIs) [Profiles API](https://docs.insightiq.ai/docs/api-reference/api/ref/operations/list-v-1-profiles) |
| Followers and profile-level reputation | Identity/Profile data, plus public analytics for the non-connected path | Follower count and profile-level engagement are available. Public analytics derives them from public data; connected data comes through the authorized platform account and selected products. [Social Data APIs](https://www.getphyllo.com/social-data-api) [Public analytics API](https://docs.insightiq.ai/docs/api-reference/api/ref/operations/create-a-v-1-social-creator-profile-analytics) |
| Audience demographics | Audience APIs, requested as `IDENTITY.AUDIENCE` and/or `ENGAGEMENT.AUDIENCE`; public analytics for modeled public-data estimates | The documented audience model includes countries, cities, gender/age distribution, languages, interests, brand affinity, follower types, and credibility. Phyllo says professional Instagram accounts provide the richest/full audience demographics; personal-account IG Direct data is more limited. [Getting started](https://docs.insightiq.ai/docs/api-reference/introduction/getting-started-with-insightiq-APIs) [Instagram API](https://www.getphyllo.com/instagram-api) |
| Posts, Reels, Stories, and performance | Engagement / Content APIs | Content type, URL/media, caption/description, hashtags, mentions, timestamp, and available likes, comments, views, saves, shares, organic/paid reach, and impressions. The generic schema is normalized across platforms, so individual Instagram fields can be `null` when Instagram or the granted permissions do not supply them. [Content API](https://docs.insightiq.ai/docs/api-reference/api/ref/operations/list-v-1-social-contents) [Social Data APIs](https://www.getphyllo.com/social-data-api) |

Phyllo's current marketing site calls these offerings **Social Data APIs** and **Linkage/Connect**, while parts of the developer reference are branded **InsightIQ**. The Phyllo site links directly to `docs.insightiq.ai` as its developer documentation, so this report treats those references as Phyllo's current official API documentation. [Phyllo developer-doc link](https://www.getphyllo.com/social-data-api)

## Instagram data: exact scope

### Available from a public handle or profile URL

The public profile analytics endpoint explicitly works from publicly available data based on a username or link. Its response schema includes:

- Profile: platform username, URL, image, follower count, verification status, full name, bio/introduction, platform account type, language, and profile location where available.
- Performance: average likes, comments, views, Reels views, engagement rate, content count, sponsored-post performance, follower/reputation history, hidden-like percentage, and engagement benchmarks.
- Content: top, recent, sponsored, and lookalike content/profile records, with public engagement fields.
- Audience modeling: countries, cities, gender-age distribution, languages, interests, brand affinity, follower types, credibility score, significant followers/commenters/likers, and related modeled attributes.

These are public-data analytics, not proof that the creator owns the account and not a guarantee that every field will be populated for every Instagram profile. The endpoint's schema is cross-platform and includes fields that are platform-specific or nullable. [Public analytics API](https://docs.insightiq.ai/docs/api-reference/api/ref/operations/create-a-v-1-social-creator-profile-analytics)

The public content endpoint can retrieve public profile content or a single content item for Instagram, including post/Reel metadata and publicly visible engagement. It is marked **beta, subject to change**. [Public content API](https://docs.insightiq.ai/docs/api-reference/api/ref/operations/create-a-v-1-social-creator-content-fetch)

### Requires an Instagram connection

The creator must connect/authenticate Instagram to obtain source-authorized account identity and private or permissioned insights. Phyllo's current flow supports:

- **Standard Instagram Graph connection:** Business or Creator/Professional account linked to a Facebook Page. Phyllo states this route provides the richest data, including impressions, reach, and full audience demographics.
- **Instagram Direct (IG Direct):** Personal and creator accounts can log in directly through Meta's hosted Instagram OAuth screen without a Facebook Page. Personal accounts receive a more limited data set. IG Direct must be separately enabled for the Phyllo client/environment by the account manager or solutions team.
- **Both routes together:** Phyllo says both connection options can be offered and normalized into the same schema. Phyllo manages platform token refresh and emits a webhook if re-authentication is needed.

[Official Instagram connection and account-type details](https://www.getphyllo.com/instagram-api)

After connection, the requested SDK products control what Phyllo syncs: `IDENTITY`, `IDENTITY.AUDIENCE`, `ENGAGEMENT`, and `ENGAGEMENT.AUDIENCE` are the relevant set for The List. The account resource reports connection state and sync state per product. [Getting started](https://docs.insightiq.ai/docs/api-reference/introduction/getting-started-with-insightiq-APIs) [Account API](https://docs.insightiq.ai/docs/api-reference/api/ref/operations/get-a-v-1-account)

### What cannot be relied on

- A handle alone cannot prove ownership or return source-authorized private insights such as impressions, reach, private account data, or the richest/full audience demographics. [Instagram API](https://www.getphyllo.com/instagram-api)
- Public lookup cannot retrieve expired private Stories or reconstruct historical point-in-time follower/audience metrics. Connected Engagement can sync Stories while available, but Phyllo describes Stories as ephemeral and refreshes them at special intervals because they expire after 24 hours. [Data refresh guide](https://docs.insightiq.ai/docs/api-reference/API/data-refresh-guide)
- Historical content fetches return the item and its current available statistics, not how those statistics looked on the historical date. Identity/profile and audience data are point-in-time only and do not support historical refresh. [Data refresh guide](https://docs.insightiq.ai/docs/api-reference/API/data-refresh-guide)
- No source promises that every normalized field is present for every Instagram account, content type, account type, or permission set. The List must treat missing fields as `null`/unavailable rather than zero. [Content API](https://docs.insightiq.ai/docs/api-reference/api/ref/operations/list-v-1-social-contents)

## Does the user need to log in?

**For the current basic onboarding metrics: no.** Handle-only public analytics can return follower count, calculated engagement, public content metrics, and modeled audience data without a creator login. [Public analytics API](https://docs.insightiq.ai/docs/api-reference/api/ref/operations/create-a-v-1-social-creator-profile-analytics)

**For verification and private/first-party metrics: yes.** The List creates a Phyllo user and short-lived SDK token on its backend, opens the Connect SDK, and the creator authorizes Instagram in Meta's hosted login/OAuth screen. The List and Phyllo do not receive the user's Instagram password directly from the app UI. [Getting started](https://docs.insightiq.ai/docs/api-reference/introduction/getting-started-with-insightiq-APIs) [Instagram API](https://www.getphyllo.com/instagram-api)

Therefore the current product badge should not call handle-only data **verified**. A safe status model is:

| Status | Meaning |
| --- | --- |
| `public_estimate` | Handle-only public analytics; no ownership proof |
| `connected_limited` | Instagram connected through IG Direct/personal route, but some private metrics unavailable |
| `connected_verified` | Connected professional account with the required Identity, Engagement, and Audience products synced |
| `stale` / `reauth_required` | Session expired or data no longer fresh |

## Signup, environments, credentials, and SDK requirements

1. Register through the Phyllo dashboard to obtain a client ID and secret. API authentication uses those credentials, and official guidance says all API calls must be made from the server, never directly from an app/frontend. [Getting started](https://docs.insightiq.ai/docs/api-reference/introduction/getting-started-with-insightiq-APIs)
2. Use the free trial/sandbox for evaluation. Phyllo advertises sandbox API keys and a free API sandbox; current docs also describe a staging environment populated with dummy users and data where usernames, passwords, OTPs, and permission screens are mocked. [Instagram API](https://www.getphyllo.com/instagram-api) [Getting started](https://docs.insightiq.ai/docs/api-reference/introduction/getting-started-with-insightiq-APIs)
3. For a connected flow, the Supabase backend creates one Phyllo user per creator using a stable internal `external_id`, then creates an SDK token with the requested products. The SDK token is valid for one week. [Create user](https://docs.insightiq.ai/docs/api-reference/api/ref/operations/create-a-v-1-user) [Create SDK token](https://docs.insightiq.ai/docs/api-reference/api/ref/operations/create-a-v-1-sdk-token)
4. Initialize the Connect SDK in the web or iOS client with `clientDisplayName`, environment, Phyllo `userId`, and SDK token. The SDK emits account-connected, disconnected, token-expired, exit, and connection-failure events. [Connect SDK configuration](https://docs.insightiq.ai/docs/api-reference/connect-SDK/connect-SDK-configuration) [iOS SDK integration](https://docs.getphyllo.com/docs/api-reference/connect-SDK/mobile/ios-SDK-integration)
5. Register backend webhooks for account and data-sync events. Fetch full resources from the backend after webhook notification. Phyllo recommends frontend events for immediate UX and webhooks for reliable backend processing. [Getting started](https://docs.insightiq.ai/docs/api-reference/introduction/getting-started-with-insightiq-APIs)
6. Move to production only after Phyllo enables production credentials and the purchased products/platform routes. Confirm the correct production base URL and Instagram work-platform IDs with Phyllo rather than copying sandbox/staging identifiers. [Getting started](https://docs.insightiq.ai/docs/api-reference/introduction/getting-started-with-insightiq-APIs)

## Pricing and payment

**Current dependable answer: contact sales. Do not budget from a public number.**

- The current main pricing page says plans are customized and presents **Get a Quote**, with no public amount, included request volume, overage rate, currency, billing interval, payment method, tax treatment, cancellation term, or production minimum. [Pricing](https://www.getphyllo.com/pricing)
- Phyllo's Terms say fees and payment terms are defined by the signed work order. [Terms of Service](https://www.getphyllo.com/terms-of-service)
- The current Instagram product page says there is a free sandbox trial and usage-based pricing, but gives no unit price. [Instagram API](https://www.getphyllo.com/instagram-api)
- Official pages conflict: an older Startup signup page displays **$399/month for up to 2,000 monitored accounts**, while a June 2026 Phyllo article states **$199/month** as an entry point. Neither matches the current main pricing page's quote-only presentation. These figures are not reliable enough for a purchasing decision. [Startup page](https://www.getphyllo.com/signup/startup) [June 2026 Phyllo article](https://www.getphyllo.com/post/phyllo-vs-modash-authenticated-creator-data-vs-public-database) [Current pricing](https://www.getphyllo.com/pricing)

Ask sales to quote separately for public profile analytics calls, monitored/connected accounts, Identity, Engagement, both Audience products, webhooks/on-demand refreshes, historical fetches, Instagram/IG Direct enablement, sandbox, overages, and data retention/export rights.

## Refresh, webhooks, rate limits, retention, and security

### Refresh and freshness

For connected accounts under the standard policy, most data refreshes at least once every 24 hours; audience demographics and activity refresh weekly; ephemeral Instagram Stories refresh at optimized intervals. Connected Engagement syncs a rolling 90-day content window by default. On-demand refresh is asynchronous and completes by webhook, but uses the same standard lookback period. Historical Engagement fetches can request older items, but not historical point-in-time statistics. [Data refresh guide](https://docs.insightiq.ai/docs/api-reference/API/data-refresh-guide)

Public profile analytics is generated on demand from public data. The official endpoint does not promise a monitored-account refresh schedule in its public reference, so The List should timestamp and cache every report and avoid presenting it as real-time. [Public analytics API](https://docs.insightiq.ai/docs/api-reference/api/ref/operations/create-a-v-1-social-creator-profile-analytics)

### Webhooks

Phyllo webhooks send resource IDs rather than full data. The consumer should verify the signature, return `200` within five seconds, store/queue the payload, and then bulk-fetch up to 100 IDs. Delivery order is not guaranteed and duplicate delivery is possible, so processing must be idempotent. Failed deliveries are retried three times: after one minute, five minutes, and six hours. Signature verification and IP allow-listing are available. [Webhook handling](https://docs.insightiq.ai/docs/api-reference/guides/handling-insightiq-webhooks)

### Rate limits

No current public numeric request limit was found. The official guide says the API returns `429 Too Many Requests` and a `Retry-After` header in seconds; clients should wait for that value before retrying. The actual quota and whether public analytics, refreshes, and bulk fetches have separate limits must be confirmed in the quote/work order. [Rate-limit guide](https://docs.insightiq.ai/docs/api-reference/guides/respecting-rate-limits)

### Consent, privacy, retention, and deletion

The List remains responsible for obtaining user consent for its own collection, storage, use, and transfer of Phyllo data and must publish its own compliant privacy policy. Withdrawal of required authorization can stop Phyllo from providing connected services. The List must also implement deletion of its Supabase copy and request/propagate deletion to Phyllo where applicable. [Terms of Service](https://www.getphyllo.com/terms-of-service)

Phyllo says personal data is retained only as long as necessary or legally required, deletion can be requested, and non-personal/anonymized data may be retained indefinitely. Revoking an Instagram permission stops dependent features but is not itself guaranteed to delete previously held data; deletion/termination must be requested. [Privacy Policy](https://www.getphyllo.com/privacy-policy) [End User Agreement](https://www.getphyllo.com/end-user-agreement)

API credentials must remain server-side. Phyllo states that it uses AES-256 encryption at rest, TLS 1.3/RSA-2048 in transit, role-based access, MFA, vulnerability assessments, and penetration testing. Its main pricing page specifically says SOC 2 Type 1, while other current pages say SOC II more generally; obtain the current report and data-processing terms during vendor review. [Security](https://www.getphyllo.com/security) [Pricing](https://www.getphyllo.com/pricing)

## Mapping to The List

### Current Supabase/web path: public analytics MVP

The existing `creator-data` Edge Function already owns the correct vendor-neutral boundary. Keep the Phyllo client ID/secret in Supabase secrets and make the function responsible for provider calls, validation, normalization, caching, and errors.

Concrete flow:

```text
Web or SwiftUI -> Supabase auth -> creator-data { handle }
creator-data -> validate/normalize handle
creator-data -> Phyllo public profile analytics API
creator-data -> map provider response to The List schema
creator-data -> store creator_data JSON + source + fetched_at + status
client <- normalized response only
```

Recommended normalized fields:

```json
{
  "provider": "phyllo",
  "data_status": "public_estimate",
  "platform": "instagram",
  "handle": "creator",
  "profile_picture_url": "...",
  "followers_count": 28400,
  "engagement_rate": 0.058,
  "content_metrics": {
    "average_likes": 0,
    "average_comments": 0,
    "average_views": 0,
    "average_reels_views": 0
  },
  "audience": {
    "gender_age": [],
    "countries": [],
    "cities": [],
    "languages": [],
    "credibility_score": null
  },
  "fetched_at": "ISO-8601 timestamp"
}
```

Do not persist Phyllo credentials, raw OAuth tokens, or Instagram credentials in `profiles.creator_data`. Preserve raw provider payloads only if the work order and privacy policy permit it; otherwise store the minimum normalized fields required by vetting and product UX. [Terms of Service](https://www.getphyllo.com/terms-of-service)

### Later connected verification path

```text
Client requests verification
-> Supabase Edge Function creates/reuses Phyllo user
-> Edge Function creates one-week SDK token for Identity + Audience + Engagement
-> web/iOS client opens Phyllo Connect
-> creator completes Meta-hosted Instagram authorization
-> client receives immediate connection event
-> Phyllo sends account/profile/content webhooks to Supabase
-> webhook verifies signature, acknowledges, queues IDs
-> backend fetches account/profile/content/audience resources
-> backend normalizes and updates profiles.creator_data
-> client observes Supabase update and changes verification/freshness status
```

The SwiftUI app should never call Phyllo's REST APIs with the client secret. It only calls Supabase for an SDK token, presents the native Phyllo iOS connection UI, sends/receives non-secret IDs and UI events, and reads normalized creator data from Supabase. [Getting started](https://docs.insightiq.ai/docs/api-reference/introduction/getting-started-with-insightiq-APIs) [iOS SDK integration](https://docs.getphyllo.com/docs/api-reference/connect-SDK/mobile/ios-SDK-integration)

### Rough effort and risks

| Scope | Engineering estimate | Main risks |
| --- | --- | --- |
| Sandbox public lookup spike | 1-2 engineering days | Credentials/product access, Instagram work-platform ID, response sparsity, latency, and public endpoint commercial entitlement |
| Production handle-only integration | 2-4 additional days | Normalization, caching, timeout/retry handling, consent copy, empty/private/not-found states, and production monitoring |
| Connected web verification | 4-7 engineering days | SDK UX, Phyllo user mapping, token issuance, webhook verification/idempotency, async sync states, account-type differences, and re-authentication |
| SwiftUI connection after Supabase binding | 3-5 engineering days plus Mac QA | Native SDK/package compatibility, callback presentation, state restoration, App Store privacy declarations, and simulator/device testing |

These are implementation estimates, not Phyllo onboarding lead times. Commercial approval, production enablement, IG Direct enablement, and legal/security review can exceed engineering time.

The largest product risk is calling public/modelled audience data **verified**. The largest technical risk is treating a normalized field as universally present. The largest commercial risk is implementing against sandbox before Phyllo confirms that public analytics, connected Instagram products, refresh volume, and audience data are included at an acceptable production price.

## Documentation gaps and contradictions

- Several Stoplight documentation pages intermittently rendered `500 | Something went wrong` or required JavaScript. Their canonical URLs and rendered API references were available, but the documentation site is not consistently accessible.
- Phyllo's current website links both legacy `docs.getphyllo.com` and InsightIQ-branded `docs.insightiq.ai`. API examples also mix `api.staging.insightiq.ai` and `api.sandbox.insightiq.ai`. Confirm current production/sandbox hostnames and IDs before coding. [Getting started](https://docs.insightiq.ai/docs/api-reference/introduction/getting-started-with-insightiq-APIs) [Profiles API](https://docs.insightiq.ai/docs/api-reference/api/ref/operations/list-v-1-profiles)
- The legacy Instagram FAQ says non-creator Instagram accounts are unsupported, but the current 2026 Instagram product page says IG Direct supports personal accounts with reduced data. Treat the current product page as newer, but require written confirmation that IG Direct is enabled for The List and obtain its exact Instagram field matrix. [Legacy Instagram FAQ](https://docs.getphyllo.com/docs/api-reference/FAQs/platforms/instagram) [Current Instagram API](https://www.getphyllo.com/instagram-api)
- The public coverage page appears stale or malformed: it labels many platforms "Waitlist" and lists only Income and Identity under Instagram, while the current Instagram and Social Data API pages advertise engagement, content, and audience capabilities. Do not use that coverage page alone for procurement. [Coverage](https://www.getphyllo.com/coverage) [Instagram API](https://www.getphyllo.com/instagram-api)
- Pricing is contradictory across official pages, and the current pricing page is quote-only. Contact sales and do not assume either `$199/month` or `$399/month`. [Pricing](https://www.getphyllo.com/pricing)

## Go/no-go prerequisites

Proceed with a sandbox spike only after Phyllo confirms:

1. Public profile analytics is available for Lebanese Instagram profiles and can be called by handle without creator login.
2. The exact Instagram public and connected field matrices, including audience fields, Stories, Reels views, reach, impressions, and account-type/permission requirements.
3. IG Direct availability for personal accounts and the standard professional-account route.
4. Production price, included monitored accounts/calls, overages, billing terms, refresh charges, historical-fetch charges, and rate limits.
5. Production and sandbox base URLs, work-platform IDs, credentials, SDK versions, webhook signing details, and IP ranges.
6. Data processing agreement, data residency/subprocessors, retention/deletion SLA, SOC 2 report, incident terms, and permission to store the normalized fields in Supabase.

**Final decision:** Phyllo is a technically strong fit for The List's vendor-neutral architecture. It is **not production-ready today** because commercial terms and Instagram entitlements are unconfirmed. Run the public handle-only sandbox spike first; add connected verification only after Phyllo confirms the professional/personal data matrix and The List accepts the onboarding friction and price.
