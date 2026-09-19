# App Store launch checklist

## Current status

**Direction, 2026-09-20:** V3 React + Vite, packaged with Capacitor for iOS. V1/V2 are preserved in `archive/web/`; SwiftUI in `ios/` is paused. Mobile demo journeys, regression checks, and the production build pass locally; the Capacitor project is generated and synced. The web build was pushed and deployed on 2026-09-20; native compilation remains pending.

- [x] Backend v1 is live on Supabase.
- [x] Member web app is live at `/`.
- [x] Venue web app is live at `/venue`.
- [x] Public event teaser is live at `/e?id=`.
- [x] Founder admin is live at `/admin`.
- [x] Earlier member and venue demo flows passed browser checks; the full authenticated walkthrough remains pending.
- [x] SwiftUI scaffold and its earlier passing CI results are preserved as history; that track is paused.
- [x] Phyllo feasibility research is complete.
- [x] Instagram flow is locked: handle lookup at onboarding, optional Connect Instagram from Profile.
- [x] Member and venue Profile analytics dashboards are redesigned in web v3.
- [x] Complete web workflows are implemented for member, venue, founder, and public teaser surfaces.
- [x] Manual Story screenshot upload, rejected-proof retry, and founder review are implemented.
- [x] Sensitive RPC grants are hardened; PostgreSQL `PUBLIC` and `anon` execute access are zero.
- [x] Verify V3 demo journeys, anchored navigation, sheets, and no outer scroll at 390x844 and 320x568; reduced-height forms also checked.
- [ ] Verify real iPhone keyboard and safe-area behavior.
- [x] Validate the local Vite production build and Capacitor asset sync.

## Backend work still missing

- [ ] Click-test the full production web loop and log any failures.
- [ ] Export the live Supabase schema, migrations, RPCs, cron jobs, triggers, and Edge Functions into the repo.
- [ ] Create a separate staging Supabase project for testing changes before production.
- [ ] Add backend integration tests for the complete member, venue, and founder loops.
- [ ] Audit Supabase RLS, RPC permissions, rate limits, and secret handling.
- [ ] Add monitoring, error logging, backups, and recovery instructions.
- [x] Add venue draft editing.
- [x] Add editing for open events where the product allows it.
- [x] Persist gender mix and custom event close time.
- [x] Let founders update booking invoice status.
- [ ] Add payment records, cancellations, refunds, and settlement notes.
- [ ] Add real account deletion and remove the user's stored data where legally allowed.
- [ ] Replace email OTP with phone OTP after an SMS provider is chosen.
- [ ] Replace mock creator data with the chosen provider.
- [ ] Turn on Story scoring after Gemini and Meta setup is complete.
- [ ] Verify existing Supabase authentication, uploads, links, and session persistence inside the Capacitor app.
- [ ] Add APNs push notifications for the iOS app.

## External services still missing

- [ ] Choose and configure an SMS provider.
- [ ] Add the production Gemini API key.
- [ ] Complete Meta App Review and Instagram Graph API setup.
- [x] Complete the [Phyllo feasibility report](phyllo-feasibility.md).
- [ ] Open a Phyllo sandbox and test handle-only analytics with Lebanese Instagram profiles.
- [ ] Ask Phyllo for separate production pricing for public lookups and connected accounts.
- [ ] Confirm full white-label options and any required Phyllo/InsightIQ attribution.
- [ ] Ask Phyllo to enable Instagram Direct and the professional Facebook-Page route.
- [ ] Confirm the exact field matrix for both Instagram connection routes.
- [ ] Choose the v1 venue payment method: Whish business, OMT, bank transfer, cash, or card payment link.
- [ ] Confirm the Apple Developer account and App Store Connect access.

## App Store work still missing

- [ ] Confirm the operating legal entity and Apple seller name.
- [ ] Enrol the organization in the Apple Developer Program and complete D-U-N-S verification if needed.
- [x] Generate/sync the Capacitor iOS wrapper in `web/ios/` from the Vite build.
- [ ] Open the Capacitor project on a Mac and build it with Xcode.
- [ ] Fix any first Xcode build errors.
- [ ] Test every member and venue flow in an iPhone simulator.
- [ ] Test the final build on real iPhones.
- [ ] Verify the shared V3 UI in the iOS wrapper, including safe areas, keyboard, navigation, and external links.
- [ ] Create and add the final 1024 px app icon.
- [ ] Confirm bundle ID, signing, capabilities, and release configuration.
- [ ] Publish a privacy policy, Terms of Service, community rules, and support contact.
- [ ] Ask for clear consent before sharing creator or Story data with Gemini, Meta, Phyllo, or another provider.
- [ ] Add reporting, blocking, and moderation controls if member photos or Story content are displayed in the app.
- [ ] Add real in-app account deletion.
- [ ] Add privacy descriptions and complete App Store privacy answers for every collected data type and third-party service.
- [ ] Prepare screenshots, description, keywords, support URL, privacy policy URL, and age rating.
- [ ] Prepare working member, venue, and founder review accounts for Apple.
- [ ] Upload a TestFlight build.
- [ ] Test with Dima's top 30 contacts and fix launch blockers.
- [ ] Submit the final build for App Review.

## Best implementation order

- [ ] 1. Fix V3 phone layout and test member/venue flows.
- [x] 2. Validate the Vite production build and Capacitor asset sync; native compilation remains below.
- [ ] 3. With deployment approval, finish the authenticated production walkthrough.
- [ ] 4. Export and test the backend; close venue, billing, and account gaps.
- [ ] 5. Choose providers and finish the required SMS, creator-data, and Story integrations.
- [ ] 6. Test Capacitor authentication, uploads, links, and push notifications.
- [ ] 7. Finish privacy, legal, account deletion, moderation, and App Store requirements.
- [ ] 8. Build and test on a Mac and real iPhones.
- [ ] 9. Run TestFlight with the first 30 members and 2-3 venues.
- [ ] 10. Fix launch blockers and submit to the App Store.
