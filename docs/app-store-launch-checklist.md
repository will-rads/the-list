# App Store launch checklist

## Current status

- [x] Backend v1 is live on Supabase.
- [x] Member web app is live at `/v3`.
- [x] Venue web app is live at `/v3/venue`.
- [x] Public event teaser is live at `/v3/e?id=`.
- [x] Founder admin is live at `/admin`.
- [x] The main member and venue loop has passed browser testing.
- [x] SwiftUI member and venue apps are scaffolded with mock services.
- [x] SwiftUI CI build and tests are green.
- [x] Phyllo feasibility research is complete.
- [x] Instagram flow is locked: handle lookup at onboarding, optional Connect Instagram from Profile.
- [x] Member and venue Profile analytics dashboards are redesigned in web v3.
- [ ] Approve the deployed HTML analytics design before porting it to SwiftUI.

## Backend work still missing

- [ ] Click-test the full production web loop and log any failures.
- [ ] Export the live Supabase schema, migrations, RPCs, cron jobs, triggers, and Edge Functions into the repo.
- [ ] Create a separate staging Supabase project for testing changes before production.
- [ ] Add backend integration tests for the complete member, venue, and founder loops.
- [ ] Audit Supabase RLS, RPC permissions, rate limits, and secret handling.
- [ ] Add monitoring, error logging, backups, and recovery instructions.
- [ ] Add venue draft editing.
- [ ] Add editing for open events where the product allows it.
- [ ] Persist gender mix and custom event close time.
- [ ] Let founders update booking invoice status.
- [ ] Add payment records, cancellations, refunds, and settlement notes.
- [ ] Add real account deletion and remove the user's stored data where legally allowed.
- [ ] Replace email OTP with phone OTP after an SMS provider is chosen.
- [ ] Replace mock creator data with the chosen provider.
- [ ] Turn on Story scoring after Gemini and Meta setup is complete.
- [ ] Bind the SwiftUI services to live Supabase.
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
- [ ] Run `xcodegen` and build the app on a Mac.
- [ ] Fix any first Xcode build errors.
- [ ] Test every member and venue flow in an iPhone simulator.
- [ ] Test the final build on real iPhones.
- [ ] Compare the native screens with the live v3 web app.
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

- [ ] 1. Finish the production web click-test.
- [ ] 2. Export, secure, and test the live Supabase backend.
- [ ] 3. Close the known venue, billing, and account gaps.
- [ ] 4. Choose SMS, creator-data, and payment providers.
- [ ] 5. Complete Gemini, Meta, and creator-data integrations.
- [ ] 6. Bind SwiftUI to Supabase and add push notifications.
- [ ] 7. Finish privacy, legal, account deletion, moderation, and App Store requirements.
- [ ] 8. Build and test on a Mac and real iPhones.
- [ ] 9. Run TestFlight with the first 30 members and 2-3 venues.
- [ ] 10. Fix launch blockers and submit to the App Store.
