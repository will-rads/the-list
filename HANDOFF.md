# Handoff - The List

## Start here - 2026-10-10

Continue the UGLYCASH-inspired Paper + pink redesign in `design-explorations/ugly-light/`.
Read its `README.md`, inspect `index.html` and `font-a/b/c.png`, then continue the isolated mockup.
It contains member Home and venue Home. Font choice and production adoption are not approved.
Preserve working flows and the shared member score; do not change the backend or reskin `web/` yet.
The mockup is untracked/local: use this checkout, not a fresh clone. Will explicitly excluded it from the documentation commit.

Current context: `README.md`, the top of `docs/agent/memory.md`, `docs/agent/plan.md`, and `docs/app-store-launch-checklist.md`.

V3 React/Vite is the only active app. Local mobile layout and flow fixes pass checks; Capacitor
is generated and synced in `web/ios/`. V1/V2 are in `archive/web/`; root `ios/` is paused SwiftUI.
Run from `web/`: `npm run dev`, `npm run build`, `npm run test:mobile`, `npm run ios:sync`.

Will approved pushing and publishing on September 20. Canonical production routes are
`https://the-list-omega.vercel.app/` (venue `/venue`, teaser `/e?id=`, founder `/admin`).
Old versioned routes redirect to these links. See the latest memory entry for deployment verification.
Venue UX rebuild (2026-09-23) lives on branch `venue-ux-simple`, preview only, not production. Spec:
`docs/superpowers/specs/2026-09-23-venue-ux-simple-design.md`. Tests: `npm run build`,
`npm run test:mobile` (demo) and `npm run test:venue-live` (logged-in flows against a fake Supabase).
2026-09-25: refresh fixes, closed-list picking and paid-bill Stories added; out-of-order refresh, logout and local-data fixes followed. All of it is pushed to `origin/venue-ux-simple` (not `main`).
2026-10-03: branch `member-score` (on top of `venue-ux-simple`, now pushed) brings one member score back to the
Profile and onto the venue card and sheet (`web/v3/score.js` + the live read-only `member_records` RPC), and gives
the member app the venue's reload ordering. See the newest memory entry.
Launch blocker: the repo can't rebuild the live database (launch checklist).
Feature-code refs verified 2026-10-10 before the documentation commit: `member-score` = `fbf700e`, `venue-ux-simple` = `e14ab0b`,
`main` = `25e1162`. Feature work is not merged to main. Vercel was not rechecked this session.
Next: continue the mockup; production adoption, merge/deploy, authenticated walkthrough and Mac/device checks remain separate approvals/work.

## Cleanup completed - approved 2026-10-10

3 local and 3 remote branches remain: `main`, `member-score`, `venue-ux-simple` (excluding origin/HEAD).

- Deleted six local branches after verifying every tip is in `main`: `design/user-side-interactions`, `reskin-ultraviolet`, `v1-complete`, `v3-glass`, `venue-side`, `wave-1`. Their history remains in main.
- Deleted the five corresponding remote branches (all except local-only `reskin-ultraviolet`). The extra local `v3-glass` commit was already in main too.
- Keep `main` and current `member-score`. Keep `venue-ux-simple` for its review/preview link until approval, although its commits are all in `member-score`.
- Removed `.ds-sync/`, `.design-sync/` and `ds-bundle/` (about 51 MB of old tooling/exports). Removed the dependency junction itself without following it; active app dependencies remain intact.
- `web/node_modules/` (113 MB) and `web/dist/` (9.2 MB) are reproducible, but removing them interrupts local running/testing until `npm ci` / `npm run build`. Keep during redesign work.
- Keep `ugly-light`, other untracked design sources, research, brand/video originals, `archive/web`, paused `ios/`, and active `web/ios/`. Old does not mean disposable. Branch deletion is organization, not meaningful disk recovery.
