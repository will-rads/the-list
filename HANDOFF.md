# Handoff - The List

Current: `README.md`, the top of `docs/agent/memory.md`, and `docs/app-store-launch-checklist.md`.

V3 React/Vite is the only active app. Local mobile layout and flow fixes pass checks; Capacitor
is generated and synced in `web/ios/`. V1/V2 are in `archive/web/`; root `ios/` is paused SwiftUI.
Run from `web/`: `npm run dev`, `npm run build`, `npm run test:mobile`, `npm run ios:sync`.

Will approved pushing and publishing on September 20. Canonical production routes are
`https://the-list-omega.vercel.app/` (venue `/venue`, teaser `/e?id=`, founder `/admin`).
Old versioned routes redirect to these links. See the latest memory entry for deployment verification.
Venue UX rebuild (2026-09-23) lives on branch `venue-ux-simple`, not deployed. Spec:
`docs/superpowers/specs/2026-09-23-venue-ux-simple-design.md`. Tests: `npm run build`,
`npm run test:mobile` (demo) and `npm run test:venue-live` (logged-in flows against a fake Supabase).
2026-09-25: refresh fixes, closed-list picking and paid-bill Stories added; out-of-order refresh, logout and local-data fixes followed. All of it is pushed to `origin/venue-ux-simple` (not `main`).
2026-10-03: branch `member-score` (on top of `venue-ux-simple`, not pushed) brings one member score back to the
Profile and onto the venue card and sheet (`web/v3/score.js` + the live read-only `member_records` RPC), and gives
the member app the venue's reload ordering. See the newest memory entry.
Launch blocker: the repo can't rebuild the live database (launch checklist).
Next: Will reviews both branches, then merge and deploy on his say-so, then the visual redesign,
then the authenticated walkthrough and Mac/device verification.
