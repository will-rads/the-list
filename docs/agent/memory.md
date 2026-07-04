# Memory — decisions & current state

Running log. Newest entry on top. Date format: `YYYY-MM-DD`.

---

## 2026-07-04 — v3 GLASS reskin built (`web/v3/`, branch `v3-glass`) — Ultraviolet not convincing

Will's call: Ultraviolet (858813a) stays but doesn't convince. New comparison version — frosted glassmorphism, NO hue (purple dead in v3), over a photo ground he picks later. Concept renders tried first (`research/v3-concepts/`, via new global skill `~/.claude/skills/imagegen-frontend-mobile` + Higgsfield) — rejected, went straight-to-code. Pipeline per Will: Fable planned + QA'd; Opus + Sonnet agents implemented. Spec: `docs/superpowers/specs/2026-07-04-v3-glass-reskin-design.md`.

- **Scope: member only** — `web/v3/index.html` forked from the Ultraviolet member file; venue follows after Will approves. `web/v3/check-v3.mjs` = forked checker (index only; purple pair now BANNED; requires `--bg-photo` + `backdrop-filter`).
- **Photo ground:** `--bg-photo` var painted by `.iphone-screen::before` (scrim `rgba(0,0,0,.62)` dark / `rgba(247,246,243,.55)` light). Placeholder Unsplash bar shot marked for swap — **Will supplies the final image; swap = one var edit.**
- **Tokens:** `--bg-elev/2` translucent white; `--ice` pure white (dark) / `#1E1E1E` (light); neutral inks/lines; elevated surfaces carry `backdrop-filter: blur(22px) saturate(1.4)`. Jakarta-only + sentence case hold. Onboarding stays opaque black deliberately.
- **Overlay-bleed fix:** `.screen-ground` on EventDetail + Pass roots (trap logged in errors.md 2026-07-04).
- Verified: check-v3 OK, zero purple literals, Playwright dark+light (Home, Explore, EventDetail, Pass). Pre-existing, untouched: validateDOMNesting button-in-button warning after simulatePick.
- Not pushed. Next: Will eyeballs v3 glass → gives bg image → venue file + scrim tune if his image is bright.

---

## 2026-07-04 — v3 Ultraviolet reskin BUILT (branch `reskin-ultraviolet`, local)

Executed the same session the direction was picked. Spec: `docs/superpowers/specs/2026-07-04-v3-ultraviolet-reskin-design.md`. Both `web/v2` files: token swap (dark: card `#16131D`/`#1E1A29`, ink `#EEEBF6`/`#B4ACC9`/`#7E7793`, lines purple-tint, accent `#A374FF`/ink-on-accent `#14092B`; light: cream grounds keep, accent `#6A3FD8`), Cormorant link removed + all display classes → Jakarta 700 −0.02em, dotted rules (.hr/.hr-2), floating glass pill dock (.tabbar rebuilt — left/right 16, bottom 12, r999, glass + purple hairline; venue too), glow signatures (display-l text-shadow, chip-ice halo, purple pulse/glow-ice), purple page washes + grain dots, glass re-tint (.glass/.glass-over-image), card fill `#16131D`. JSX: Home identity strip removed (icons justify-end), tabs + mastheads Tonight→Home / Index→Explore (venue tabs untouched), aria "Search the index"→"Search", event-detail When/Doors/Seats editorial rail → **widget card tiles** (Will's mid-session call: "widget style like profile" — StatTile pattern). check-v2.mjs: requires `#A374FF`+`#6A3FD8` both files; bans add `Cormorant`, `Space Grotesk`. Verified: checker OK both; Playwright eyeball dark+light, member Home/Event detail + venue Desk — dock, tiles, glow, no strip, labels all confirmed. Console: only pre-existing noise (SaveButton button-in-button warning predates reskin; python http.server drops big images — use Vercel preview for real review). NOT pushed. `web/brand.html` still documents Kit V.2 — stale until Will ratifies the new look.

---

## 2026-07-04 — Redesign #3 direction PICKED: 1c Ultraviolet, amended

Claude Design run done (project `9e016580-e3bc-4655-aff3-cb9c5c944767`; file pulled via Will's Chrome session to `design-explorations/redesign-directions/redesign-directions.dc.html` — DesignSync tool stayed auth-walled, browser route worked). Three directions produced (1a Carmine/Archivo, 1b Brass/Bodoni, 1c Ultraviolet/Space Grotesk). **Will picked 1c Ultraviolet** — accent `#A374FF` dark / `#6A3FD8` light, card `#16131D`, ink `#EEEBF6`, muted `#7E7793`, glow readouts, dotted rules, floating pill dock, 20–24px radii, purple radial washes over `#000000` (pitch black holds). **Will's amendments:** (1) typeface = **Plus Jakarta Sans everywhere** — no Space Grotesk, and Cormorant Garamond display retires with this reskin (Inter/Instrument Serif bans unchanged); (2) **glass UI throughout** — translucent blurred panels (maps to iOS Liquid Glass in the SwiftUI port); (3) icons: current set disliked, family swap must be cheap → centralize all icons behind one map/component during reskin; (4) tab renames ruled: **Tonight→Home, Index→Explore**, Invites + Profile stay; (5) **Home header text removed** — no greeting/identity block at top of Home ("The List / Sara Capriotti / No. 048" and 1c's "Hi, Sara · No. 048" pill all die). Functional icons (bell, search) stay; screen opens with content, not text. Sequence ruled: reskin `web/v2` now, **skip Wave 2 in HTML** (billing/insights/invites/tiers build native later), then SwiftUI via `prompts/swiftui-goal.md` + Codex audit per wave. check-v2.mjs to extend: allow `#A374FF`/`#6A3FD8`/`#16131D` family, keep old bans.

---

## 2026-07-04 — SwiftUI build prompts written; no SwiftUI skill exists

Two paste-ready prompts committed to `prompts/`: **`swiftui-goal.md`** (build-session bootstrap: preconditions incl. reskin-final + Xcode check, read order, mock-first mission with switchboards, hard-rules table, iOS 17+/@Observable/tokens-first/services-behind-protocols architecture, TDD on state machines, wave gates, ready-check format) and **`codex-swiftui-audit.md`** (Codex audits each wave: build → static → behavioral loop via switchboards → visual diff vs live /v2 at 393×852 → state-machine diff; fixes P0/P1 only, proposes P2/P3, never touches `web/`). Division: Claude builds, Codex audits — Will's call. Checked for remembered SwiftUI skills: **none exist** in `~/.claude/skills`, `~/.codex/skills`, or project — discipline baked into the prompts instead. `ios/README.md` is stale (v1 port plan); goal prompt supersedes it. **Open blocker: toolchain — Will is on Windows; where Xcode/simulator runs is unanswered.**

---

## 2026-07-04 — Supabase live: MCP connected, project created

Will made Supabase account + connected official Supabase MCP (user scope). Production project: **"The List"**, ref `zrbakomzpuesifasuamb`, region `eu-central-1` (Frankfurt, picked for Beirut latency over the dashboard's Tokyo recommendation), Postgres 17, ACTIVE_HEALTHY. Stray first project "will-rads's Project" (`hkimxtoorylsstadvzyw`, Tokyo) — unused, Will should delete to free the 2-project free-tier slot. Backend build = own session (schema, auth, RLS, storage, Gemini edge function — key server-side only). Still needed later: Gemini API key; IG/Meta side blocked on @thelist handle + app review.

---

## 2026-07-03 — Redesign #3 route: Claude Design exploration; push bundle built

Will's call: instead of brainstorming direction in-chat first, push the current identity to **Claude Design** (claude.ai/design) and let it generate directions. Bundle built at `design-explorations/claude-design-sync/`: `context/redesign-brief.md` (what's locked: pitch black, Inter/Instrument Serif bans, sentence case; what's open: everything else), `tokens/colors.html` + `tokens/type.html` + `components/core.html` (dsCard preview cards), `reference/` = brand-kit.html copy (dsCard) + both v2 app files verbatim (context, not cards). **Blocked on authorization:** the DesignSync tool needs `/design-login`, which only runs in an interactive `claude` terminal — this desktop session can't do it. Once Will authorizes, flow = `list_projects` → `create_project "The List"` → `finalize_plan` → `write_files`. Bundle is local-only, not committed.

---

## 2026-07-03 — Story verification model locked: the @thelist mention spine

Will's calls, same session as the wave-1 ship (spec §4 updated with full detail):

- **Verification is The List's job, never the venue's.** Venue rates attendance at the Door only; never reviews content. Their view = Recap story wall + verified reach.
- **Story requirement becomes `tag @venue + tag @thelist`.** Will's insight: routing every story through OUR one IG business account (mention webhook, media retrievable 24h, video included) means **no venue ever connects a Graph API** — one Meta integration total, zero venue onboarding friction. Bonus: every story broadcasts @thelist = proof mechanism doubles as marketing. Same play TSS runs.
- Video stories: no special handling — mention media includes video; the upload fallback accepts screen recordings; Gemini reads video natively with the same rubric.
- New vetting rule: member accounts must be public/creator (private mention media isn't retrievable).
- Enforcement: due → reminder +12h → Missed at 24h → strike; 3 strikes pause. Missed-story-strike = working default, founders ratify. Handle hunt (@thelist likely taken) joins Dima's name test.
- Backend implications parked for the Supabase session: our IG professional account + story-mentions app review; handle↔member matching; no venue OAuth.

---

## 2026-07-03 — Wave 1 shipped (the complete night loop) + pitch-black dark mode

**Branch `wave-1` (local, not pushed).** Resumed the existing plan `docs/superpowers/plans/2026-06-11-v1-feature-complete.md` at T12 (T1–T11 were already built and committed through `6e1a1a8` — plan.md's "writing-plans next" line was stale). Completed T12–T18:

- **T12 Pass + Brief (member):** `ScreenPass` ticket artifact — photo, serif name, event block, huge Cormorant door code, "Show this at the door" / "Checked in ✓" band; `BriefBlock` (arrival/dress/meeting/rules + concierge line) on the Pass and the confirmed card. Entry points: My Events "View pass →", Home pinned-night pill ("Doors 14:00 · View pass"), pass notification.
- **T13 My Events vocabulary:** picked rows get "Confirm within Xh" chip → takeover; Past renders the story axis — Story due/Rejected = loudest card with solid "Upload your Story →" CTA; Verified pill + score; quiet states greyed; "Event cancelled · no strike".
- **T14 Story upload:** `StorySheet` (ask restated, FileReader screenshot preview, Submit) → "Under review · we check within a few hours" → 8s → verified {91, "Tag visible, posted in window"}; `forceVerdict` also does needs_review {64} / rejected {32, re-upload path}.
- **T15 Notifications:** `notifTarget` deep-links every row (picked/expiring → takeover, pass → Pass, story → StorySheet or My Events:Past, drop → detail, cancelled → My Events:Past); closing the sheet marks all read; simulatePick also seeds the "Confirm your seat — 2h left" row.
- **T16/T17 Switchboards:** hidden "Demo" disclosure — member (Settings): pick now / expire a pick / check me in / story verdict ×3 / reset; venue (Venue tab): new applicants arrive (cycles the 26-face pool) / a pick declines / **advance to tonight** (lounge open→locked, applied→waitlist, picked→confirmed with generated codes, date→TODAY so Desk/Door treat it as tonight's second room) / reset.
- **T18 Mirror audit:** demo-world table checked line by line across both files — all numbers agree (LST-4F/LST-9Q, 18+1+2, 20/18/2, 8.6, 14+1+3, invoices due/paid). One documented deviation: Late Lounge seeds 24 applied with **no pre-picked guests** (spec table implied 9/15·3/5 mix fill) — deliberate, the swipe demo starts clean; the 26-applicant pool can't honestly support 12 extra picked.

**Pitch-black ruling (Will, 2026-07-03):** dark mode ground is now true black — `--bg`/`--page` `#000000`, all `rgba(18,19,21,…)`/`rgba(13,14,16,…)` scrims → `rgba(0,0,0,…)`, fixed dark literals swapped, both files. Card fills (`#1B1C1F`/`#232428`) keep their lift. Light theme untouched. The v2 spec's token table (`#121315`/`#0D0E10`) is superseded on this point.

Verified: `check-v2.mjs` OK both files (parse gate + tokens); Playwright end-to-end — member apply → pick (10s) → takeover countdown → confirm → Invites → Pass with generated code; story due → upload → review → 8s → Verified; venue advance-to-tonight full stage transition. Commits: `cfa7b27` (black) then one per task through T17, docs in the wave-close commit. **Next: Will eyeballs wave 1 in the browser (the gate) → Wave 2 (T19–T23: billing, insights, invites, tiers, withdraw, rebook).** Stray untracked file `C?UsersuserDocumentsMethe-list__review_diff.txt` (mangled name, old scratch) left untouched at repo root — Will to delete.

---

## 2026-06-12 — Brand kit rebuilt as HTML (`web/brand.html`)

Will: recreate the Kit V.2 PDF (`Brand Kit Proposal/The List - Kit V.2 (Low Res.).pdf`) as HTML, "almost exactly." Built `web/brand.html` — a single scrolling document, one `.sheet` per PDF page (8 sheets: Cover, 00.0 Overview, 01.0 Logo System, 02.3 Accent Scale, 03.0 Typography, 04.0 UI Components, 05.0 Cards, 06.0 Iconography, 06.1 Trend-Forward, 07.0 Imagery). Self-contained: no Tailwind/React/Babel (unlike index.html) — plain CSS + one vanilla `<script>` that inlines 40+ Heroicons-outline SVG paths from a `HICONS` name-map (zero icon CDN, same posture as the app). Cover/venue imagery reuse the app's Unsplash IDs.

**Faithful to the PDF, but corrected to the live app per Will's standing v2 rulings:** body/UI face is **Plus Jakarta Sans, not Inter** (Inter ban holds — the kit's "Inter" labels are replaced); display/headings **Cormorant Garamond 600**; palette is the v2 Warm Cream (dark `#121315`/`#F7F6F3`) + Anthracite (light `#F7F6F3`/`#1E1E1E`, brand `#2A2D31` / CTA `#454B52` / highlight `#6A737D`) scales straight from the v2 spec — no ice blue. Note: the kit's own tracked-caps section labels + cover tagline are reproduced as uppercase here (matching the source document); the app's sentence-case rule governs the product UI, not this reproduction of the kit artifact.

**Verified** via Playwright (preview screenshotter still times out on tall pages per errors.md): all 232 icons resolve (0 fallback boxes), 10 `.sheet` nodes, ~9100px tall; eyeballed Cover, Accent, Typography, Components, Cards, Imagery against the PDF — match. Local only, not committed, not pushed. Not deployed (would serve at `the-list-omega.vercel.app/brand` once pushed, cleanUrls).

---

## Current state (one line)

**v2 ADOPTED as the product base + feature-complete v1 spec approved (2026-06-11, entry below). Next: Will reviews the spec → writing-plans → 2-wave build in `web/v2/`. DESIGN.md/PRODUCT.md sync to Kit V.2 is now due (docs still describe v1).**

Deploy state (updated 2026-07-03): **`main` == `wave-1` == `e29bf2b` (Wave 1 complete + pitch-black dark mode), deployed to production and verified live** — `the-list-omega.vercel.app/v2` serves ScreenPass/switchboards/black tokens (checked by content probe). Will approved the merge in chat ("merge to main") after the wave-1 preview. Prior state: `main` fast-forwarded to `v1-complete` (`6e1a1a8`, 24 commits) and deployed — Will wanted public links for Radwan + Dima; the `v1-complete` preview URLs were behind Vercel's default deployment protection (previews always SSO-gate; production domain never does). Production `the-list-omega.vercel.app` (Vercel project `the-list` = `prj_0eEd1e3V6M7fUKbsYYFBv7Hdzp5o`, team `team_OYAkDhYump5FEH2U2tnEIX7F`, root dir = `web/`, cleanUrls): `/` = v1 member side (now incl. the v1-complete work: picked flow/simulatePick, live countdown takeover, honest apply states, curly-quote purge), `/venue` = v1 venue side, **`/v2` + `/v2/venue` = Kit V.2 reskin** (`web/v2/`, assets ref `../assets/`). Founder-share links sent: `the-list-omega.vercel.app` + `/venue` (public, verified logged-out). Share rule: only `the-list-omega.vercel.app/...` links are public; anything `the-list-<hash>-…` or `-git-<branch>-` is a login-walled preview.

---

## 2026-06-11 — v2 ADOPTED + v1 feature-complete spec approved (brainstorm, 5 sections)

Will's calls, locked in a full brainstorm (spec: `docs/superpowers/specs/2026-06-11-v1-feature-complete-design.md`):

- **v2 (Kit V.2) is the product.** All feature work in `web/v2/`; v1 files frozen as archive. The pending "Will reviews v2" gate is resolved: adopted.
- **Backend parked.** UI/UX feature-completeness first; Supabase/DB gets its own session later. Mocks stay normalized/vendor-neutral.
- **Lifecycle spine:** Draft → Open → Locked → Past, + **Cancelled** exception (no charge, no strikes). Locked closes *applications*, not *picks* — un-swiped applicants flip to **Waitlist** ("Still under review" member-facing), and the venue swipes the waitlist for replacements when a pick **Expires** (24h no-confirm) or **Declines**. Member never sees the word "Locked" — copy is "List closed".
- **Apply ≠ picked fix:** Apply → "Applied · under review"; the Picked takeover fires on a simulated venue pick (~10s) via notification, with a real 24h confirm countdown.
- **Concierge comms (TSS-style):** no chat anywhere in v1; statuses + venue-authored Brief (arrival window, dress code, meeting point, house rules).
- **Door:** member **Pass screen** (photo + name + short code LST-4F) eyeballed against the Door list. No QR. Venue gets "Close the night" → rating queue → Recap.
- **Story proof = AI-assisted review v1:** in-app screenshot upload → Gemini first-pass against rubric (tag visible, real Story, right venue/event, time window, not faked, quality) → verified / needs review / rejected + score + reason; founders override. Production note recorded: Supabase Storage, Gemini key backend-only. Prototype simulates verdicts.
- **Money in venue UI:** transparent bundles (The Ten/Twenty/Forty + custom, placeholder prices) at posting; Recap carries the invoice (Due/Paid only, settle via Whish/OMT/cash outside app).
- **Demo world:** both files seed the SAME fictional world (events, states, pass codes, story proofs, recap numbers; canonical today Sun 25 May) — static agreement, no cross-file sync. Hidden **switchboard** (tucked in Settings sheet / Venue tab) jumps states for pitches.
- **2 build waves:** wave 1 = the complete night loop; wave 2 = billing, insights, invites, tiers, strikes, polish. **Cut list locked:** no chat, QR, in-app payments, auto-IG verification, multi-venue switching, DJ marketplace, Android, web member app.

Next: Will reviews the spec file → writing-plans → wave 1 build.

---

## 2026-06-12 — `v1-complete` merged to `main` + deployed; public founder links

Will: preview links for the v1-complete work were asking Radwan/Dima to log in. Cause: Vercel deployment protection SSO-gates ALL preview URLs (`the-list-<hash>-…`, `…-git-<branch>-…`) by default; the production domain is public. Fix: fast-forwarded `main` to `origin/v1-complete` (`7aad801..6e1a1a8`, 24 commits — picked flow, countdown takeover, honest apply states, venue recap refactor, curly-quote purge + JSX parse gate in the checker), pushed, production deploy `dpl_9wmUGiZ6hYP6vZ8L23JmvuwieRGh` READY, verified `/` + `/venue` serve logged-out. Founder links = `the-list-omega.vercel.app` + `/venue` (+ `/v2`, `/v2/venue`). Alternative (not taken, needs Will in dashboard): Settings → Deployment Protection → off, which would un-gate previews.

---

## 2026-06-11 — Pushed everything to `main` + deployed; v2 live at `/v2`

Will said push the repo + publish v2 on Vercel "same project, as v2." Done:

- **GitHub:** committed the v2 reskin + 2026-06-10 fullness pass + brand-kit PDFs + docs; gitignored the junk (`*.zip` incl. 35M/44M archives, `Intro Video/` 35M, `Brand Kit Proposal/_pages/` 13M scratch). Pushed `venue-side`, then fast-forward-merged `venue-side` → `main` (main was 25 commits behind) and pushed `main` (`d20299e..7aad801`).
- **Vercel:** the project deploys `web/` from `main` (root dir = web/), so v2 had to live under web/ to serve. Moved `v2/` → `web/v2/`, repointed assets `../web/assets/` → `../assets/`. Push triggered the GitHub-integration build; production deploy `dpl_8Kgd1i7u5MG5mRosJSUXuwFcTweh` = READY. **Verified live** via Vercel web_fetch: `the-list-omega.vercel.app/v2` returns title "The List · Prototype v2", Cormorant + `#121315`, 0 ice-blue leftovers, `../assets/` refs resolving.
- **Live URL map** (cleanUrls): `/` v1 member · `/venue` v1 venue · `/v2` v2 member · `/v2/venue` v2 venue · `/gallery` · `/mockup-v1`.
- Will chose "/v2 on live domain" (over root-reconfig / preview-only) knowing it updates production to current. The decision moved v2 out of repo-root (his earlier structural pick) into web/v2 — accepted via that option's text.

Risk shipped knowingly: the 2026-06-10 fullness pass (web/) went to production unverified. Static-checked only.

---

## 2026-06-11 — v2 brand-kit reskin built (`v2/index.html` + `v2/venue.html`, uncommitted)

Will delivered **Brand Kit V.2** (`Brand Kit Proposal/The List - Kit V.2 (Low Res.).pdf`; page renders in `_pages/`, rasterized via PyMuPDF — the PDF has no text layer and the Read tool's pdftoppm is missing on this machine). New `v2/` folder at root: copies of both prototypes reskinned to the kit, **functionality untouched**. Spec: `docs/superpowers/specs/2026-06-11-v2-brand-kit-reskin-design.md`. Built by 2 parallel subagents (one per file), my cross-check after.

**The kit:** light "Anthracite Scale" (bg `#F7F6F3`, ink `#1E1E1E`, brand `#2A2D31`, CTA `#454B52`, highlight `#6A737D`) / dark "Warm Cream Scale" (bg `#121315`, cream `#F7F6F3`, `#EDECE6`, `#D8D4C7`). **No chromatic accent — ice blue is dead in v2.** Cormorant Garamond (display/headings, 600) + body sans. Pill CTAs with trailing arrows, white cards, numbered step circles, "• label" dot badges, minimal line icons (kept Heroicons = kit 06.0).

**Will's rulings (override kit where they conflict):**
- Kit says Inter for body → **rejected, Plus Jakarta Sans stays** (Inter ban holds). Two-family system now: Cormorant Garamond + Plus Jakarta Sans.
- Kit's grey text hierarchy → **approved** ("try the grey") — reverses the no-grey-text rule from 2026-05-31, in v2 only for now.
- **All-caps banned everywhere** (overrides the kit's own tracked-caps labels). Sentence case; brand/venue names keep capitals. Statusbar exempt.
- 2026-06-10 accent-gradient exploration **archived** (`design-explorations/accent-direction.html`) — kit's monochrome wins.
- Dark stays primary.

Mechanics worth remembering: Tailwind CDN's own `.font-black` (weight 900) fights the serif rule the same way its `.font-mono` did — both files now use doubled selectors (`.font-black.font-black`, `.font-mono.font-mono`); venue's was my post-pass fix (index subagent caught it, venue's didn't). Both files Babel/parser-verified by the subagents; my greps confirm 0 ice/Satoshi/Host/uppercase leftovers + identical tokens.

**`web/` (v1) untouched and still live. v2 not committed, not pushed, not visually eyeballed by Will yet.** Next: Will opens `v2/index.html` + `v2/venue.html` from disk → feedback → then DESIGN.md/PRODUCT.md sync for v2 (deliberately NOT done yet — docs still describe v1; sync only if v2 is adopted).

---

## 2026-06-10 — Venue prototype filled out + influencer "fullness" pass (NOT yet browser-verified)

Spec: `docs/superpowers/specs/2026-06-10-venue-prototype-design.md` (approved in chat). Two workstreams, parallel (subagent on index.html, main agent on venue.html). **Will's style call: TSS-style widget stat tiles (big number + small label in rounded cards) replace the editorial stat treatment, both sides.**

**`web/venue.html` (built 2026-06-06, entry below — augmented, not replaced):**
- **Zero-typing demo path** (Will's ask): "Preview the desk · demo data" on the splash → seeds `DEMO_VENUE` (Cyan Beach Club, Jiyeh, pool-day hero) and jumps straight in. No email, no photo upload.
- **New Desk/"Tonight" tab** (dashboard, default): bell + badge + Activity sheet, urgent card ("Open for swipe" + countdown + Start swiping → review deck), 2×2 **StatTiles** (137 Applied / To review / Confirmed (ice) / 1 Room tonight), upcoming drafts list, + New room.
- **New Door tab** (night-of): Expected / In / No show segments, check-in + no-show actions with toasts, rate sheet (6–10 chips) feeding reputation copy.
- **Picks lifted to App state** — swiping in the review deck now moves the desk's Confirmed/To review tiles (was thrown away locally).
- Applicant photos swapped from venue shots to 8 Unsplash portraits (`FACE` map — a cocktail photo was standing in for "Karim Haddad").
- Tab bar 3 → 4 (Tonight / Events / Door / Venue); Applicants tab folded into Desk + Events (ScreenApplicants left as dead code). Atoms copied from index.html (Countdown, StatusPill, DateChip, SectionHead, Segmented, StatTile, NotifSheet). "← Influencer side" page link.

**`web/index.html` (subagent; favorites + calendar-strip already existed, skipped):**
- StatTile atom; Profile's asymmetric hero stats → 3 tiles (Reputation ice / Followers / Engagement); My Events gets Applied/Confirmed/Past tiles that switch segments on tap.
- Bell + badge on Home → Activity sheet (picked / closes-soon / Story-verified rows).
- "Hi, Sara" greeting in the eyebrow + "Your night" pinned confirmed-event row above Featured → taps to My List.
- Full-month May calendar sheet on Explore (event days dotted, selected = ice) wired to the day strip.

**NOT visually verified** — auto-mode classifier outage blocked browser eval + git this session (file edits worked). Will eyeballs at `http://127.0.0.1:5555/venue.html` and `/index.html`. **Next chat: check current branch first (`venue-side` vs `main` — venue.html lives on `venue-side` per the 2026-06-06 entry), browser-verify both (broken images, console errors, font/ice budget), then commit. Not committed, not pushed.**

---

## 2026-06-06 — Venue side prototype built (`web/venue.html`, branch `venue-side`)

Built the whole second side of the marketplace as a new mocked prototype, end to end, via the brainstorm → spec → plan → subagent-driven-execution pipeline. Spec: `docs/superpowers/specs/2026-06-06-venue-side-design.md`. Plan: `docs/superpowers/plans/2026-06-06-venue-side.md` (20 tasks). All on branch `venue-side` — **not merged to `main`, not pushed**.

**Decisions locked in brainstorm:** HTML prototype first (match member side, SwiftUI later); new file `web/venue.html` (keep the live member build stable) with a shared role-select; gender mix = **soft target + live counter** (fills, never blocks); images = **real local file pick + crop-to-frame** (FileReader + CSS transform, no upload/server); quality rating = **single 0–10** on the swipe card; auth = **mocked role login** (real auth is the Supabase phase); nav = **3-tab bottom bar** (Events / Applicants / Venue), consistent with the member side.

**What shipped in `web/venue.html`** (self-contained, reuses the member design system verbatim — carbon `#0A0A0A` + ice `#9FD8E8` + one-family Plus Jakarta Sans, flat-at-rest, glass only on the tab bar):
- **Entry role split** — the member intro (`web/index.html`) gained a "List your venue · Business" door → `venue.html`. Venue splash (static grainy, no video assets) → mocked login (any input enters).
- **Onboarding** — optional Group step (skippable: "I'm independent") → Venue assets (name / type / area / description + hero crop + 4 gallery photos). Group → Venue → Event hierarchy.
- **Reusable image pipeline** — `ImageCropper` (local file → drag/zoom in a fixed 4:5 frame → `{src,scale,x,y}`) + `FramedImage` (renders that transform anywhere). No upload, no canvas.
- **Events dashboard** — Live / Draft / Past segmented + Post CTA. **Post-event flow** (4 steps): basics → seats + **soft gender mix** (Girls/Guys steppers or "no preference" total) → hero crop → review → publish (prepends a Live event).
- **Applicant swipe** — `ScreenReview`: a `SwipeCard` deck (photo, name, **quality 0–10**, **IG + TikTok** followers, tappable Instagram/TikTok/other links), ✗/✓ buttons, a **soft live counter** (`Girls x/15 · Guys y/5`, fills but never blocks a swipe past target), ending on a **Picked** list.
- **Venue tab** — hero + assets + 4 gallery thumbs, group chip, calm settings (Edit venue / Switch to member / Log out — neutral ink, no red).
- **Data model** — vendor-neutral mocks (`makeVenue`/`makeEvent`/`SEED_EVENTS`/`APPLICANTS` with `gender`, `tiktok_followers`, `socials`), mirroring a normalized provider response so it stays swappable (same posture as the member side's `mockCreatorDataFetch`).

**Member side (`web/index.html`) additions:** event detail hero is now a **4-image swipeable gallery** (scroll-snap + ice dot indicators); Profile shows **TikTok followers** beside IG (small, muted, not a third hero — Reputation still leads).

**Verification:** no test framework (per the prototype's standing model); each task verified by a node static checker (`web/check-venue.mjs`: bracket balance + single `createRoot` + required-token presence) and two-stage subagent review (spec compliance, then code quality). Two real bugs the static check could NOT catch were caught by review and fixed: (1) duplicated React/ReactDOM/Babel CDN tags in the venue scaffold (head + body) → would break rendering; (2) a `useState` placed **after** App's conditional early returns → Rules-of-Hooks crash on reaching the `done` step. **Not browser-rendered/eyeballed yet** (no Playwright in env) — Will's walkthrough is the next gate. Serve `web/` and open `/venue.html` (and re-check `/index.html` for the gallery + TikTok).

**New helper committed:** `web/check-venue.mjs` (static checker; reusable for future venue.html edits).

---

Prototype `web/index.html` at **v0.4 — merged to `main` (`9c4a041`) + pushed + auto-deployed to Vercel** (`the-list-omega.vercel.app`). v0.4 = TSS-style grainy **entry/intro screen**: new `onboardStep:"intro"` first step plays 3 AI-generated grainy Beirut nightlife clips (5s each, crossfading + looping) behind a centered THE LIST wordmark + "By invitation only" + Apply for access (ice) / I have an invite (ghost). Pipeline: gemini-analyser on `research/screen-rec-1.mp4` → Nano Banana Pro stills (Raouché / Batroun / rooftop) → Veo 3.1 image-to-video → ffmpeg to 5s/720×1280/muted → `web/assets/intro-{1,2,3}.{mp4,jpg}` (intro-2 uses a text-to-video fallback — the beachwear still tripped Veo's safety filter).

v0.4 sits on top of **v0.3 — user-side interaction pass** (also merged): every visible control has a behavior (save/bookmark + new **Saved** tab via pill-`Segmented`, Share sheet, Settings sheet, verify→verified flip, toasts); thin section half-hairlines replaced by `SectionHead` + `StatusPill` / `DateChip` / `Toggle`; decorative punctuation stripped; **Two-Family → One-Family Rule** reconciled across all docs; vendor-neutral profile-data sourcing table in `context.md`. Pool Day asset unchanged: `web/assets/pool-day.jpg` (159 KB) via `IMG.beachClub`. Core flow unchanged throughout (intro → home → detail → apply → picked → invites/profile). **Phase: prototype shipped + live. Next: SwiftUI planning / port → lock working name (Dima top 30) → venue anchors → Supabase.** Not yet visually browser-verified — open `web/index.html` to watch the intro montage; intro-2 is a t2v clip, not an animation of its still.

---

## 2026-06-02 — Texture variant killed, regular look chosen

Will picked the **regular look**. The texture-pass exploration is dead. Removed everywhere in one pass:

- `web/index-textured.html` — gone (only ever existed on the branch; never on `main`).
- Local branch `design/texture-pass` (`61beba3`) — deleted.
- Remote branch `origin/design/texture-pass` — deleted from GitHub (Will OK'd the push).

`web/index.html` (v0.4) is now the sole prototype, unchanged. Note: `main` still carries one **unpushed** doc commit `d20299e` ("docs: record texture-pass variant for handoff") — harmless, just documents the now-dead variant; left unpushed per the don't-push-without-OK rule. The build details of the variant are preserved in the entry directly below for history. **Next: SwiftUI planning / port.**

---

## 2026-06-02 — Texture-pass variant (`web/index-textured.html`) on branch `design/texture-pass`

Will is exploring a retro/analog look inspired by `research/inspo-1.jpg` (a cream/olive/lilac grungy-zine UI). Decision locked: **texture only** — keep The List's cold, exclusive identity (carbon black + ice blue + single Plus Jakarta Sans, "One Cold Voice"); do NOT take inspo-1's warm palette, second accent, or condensed display font. To compare looks without risk, made a **side-by-side copy**, not an in-place edit:

- **`web/index.html`** — untouched, the live v0.4 build (still the source of truth on `main`).
- **`web/index-textured.html`** — the copy, with all texture moves applied in one pass.

Texture moves applied to the copy (all CSS/markup, no flow/data/palette change):
1. **App-wide grain + scanline veil** — `.iphone-screen::after` lays a faint CRT scanline + noise overlay over the whole phone (z-45, below status bar, non-blocking).
2. **CRT treatment on media** — intro clips, Event Detail hero, Profile hero, Home featured + Explore lead cards get `.tex-scan` (scanlines), `.tex-screen` (glow vignette); intro clips also get `.tex-aberr` (RGB chromatic-aberration fringe).
3. **VHS inset frame** — `.tex-vhs` thin retro border motif on hero media + feature cards.
4. **Halation/bloom** — `.tex-halation` neon-on-film glow on ice CTAs (Apply, Confirm, Enter, onboarding) + the reveal ring.
5. **Chunkier pills** — CTAs 58→62px, `.tex-pill-xl` (heavier weight + tracking), `.tex-seg` taller Segmented.
6. **Poster wordmark** — entry THE/LIST heavier + tighter + slight vertical scale via `.tex-wordmark` (still Plus Jakarta Sans — no new font).

New CSS lives in one labeled block ("TEXTURE BUILD"). Committed `f3fbfb5` on `design/texture-pass`, pushed to origin. **Recovery note:** the branch ref was briefly lost after a checkout last session (the commit survived as dangling); recovered via `git branch design/texture-pass f3fbfb5` from reflog, then pushed so it persists. Verified: 1819 lines, brackets balanced, single createRoot, all texture classes wired. **Not browser-rendered** (no Playwright in env). If Will picks textured: copy index-textured.html → index.html, commit, merge to main; else delete the branch.

---

## 2026-05-31 — TSS-style grainy entry/intro screen (v0.4) — full AI media pipeline

Recreated The Secret Society's intro screen for The List, end to end. Core flow untouched; the entry screen is a new first onboarding step, not a flow change. iOS untouched, dark primary, Carbon + Ice.

**Pipeline (via `GEMINI_API_KEY`, `google-genai` SDK + `truststore` for the machine's intercepting-CA TLS):**
1. **Analyze** — `/gemini-analyser` (`gemini-2.5-flash`) on `research/screen-rec-1.mp4` → `research/screen-rec-1.analysis.txt`. TSS intro = full-bleed 9:16 grainy nightlife montage, ~1s hard cuts (we use 3×5s crossfades per Will), warm/crushed film grade, dark top+bottom scrims, wordmark + buttons.
2. **Stills** — **Nano Banana Pro** = `gemini-3-pro-image-preview`, `generate_content` with `image_config.aspect_ratio="9:16"`, `response_modalities=["IMAGE"]`. 3 stills → `research/gen/still-{1,2,3}-*.png`: Raouché Pigeon Rocks dusk (slip dress + leather jacket), Batroun Phoenician sea wall (beachwear, beach-club crowd), Beirut rooftop night (sequin dress, dancing crowd, skyline). Edgy Beirut model aesthetic; **grain/retro grade baked into the prompt** so animation keeps the look.
3. **Animate** — **Veo 3.1 fast** = `veo-3.1-fast-generate-preview`, `generate_videos` image-to-video, polled long-running op. intro-1 + intro-3 are true i2v of the stills. intro-2 (beachwear) returned `generated_videos=None` (people+swimwear safety filter) even after softening wording, so it falls back to a text-to-video grainy-Beirut clip; its poster is still the approved still. ffmpeg trim to exactly 5.000s, 720×1280, `-an`, H.264 yuv420p, `+faststart` → `web/assets/intro-{1,2,3}.mp4` + `.jpg` posters.
4. **Implement** — `web/index.html`: `INTRO_CLIPS`; `IntroVideoBG` (3 stacked `<video>` muted/autoPlay/playsInline, crossfade every 5s, reduced-motion holds frame, grain+vignette+scrims); new `ScreenOnboard` `step==='intro'` (initial `onboardStep`) with stacked THE / LIST wordmark, eyebrow, tagline, Apply (ice) + Invite (ghost) → both go to `phone`.

**Verified:** ffprobe each clip = 5.000s / h264 / 720×1280 / yuv420p / no audio; mid-frames eyeballed on-brand; index.html brackets balanced (curly/paren/sq delta 0), 1751 lines, `INTRO_CLIPS`/`IntroVideoBG`/intro step all present, `useState("intro")` initial. Not browser-rendered (Playwright MCP not available in env; esbuild check blocked by the same corporate CA).

**Provenance + git:** stills, raw clips, t2v backup, and the analysis kept under `research/gen/` + `research/`. `.gitignore` `*.mp4` negated for `web/assets/*.mp4` so the clips ship. Model IDs + SDK/TLS/ffmpeg/safety-filter gotchas logged in `errors.md`.

---

## 2026-05-31 — User-side interaction-completeness pass (v0.3) + TSS pattern map + One-Family rename

Big pass on `web/index.html` to make the influencer side review-ready. Visual/interaction/doc only — **core flow untouched** (onboarding → home → detail → apply → picked → invites/profile), iOS untouched, provider code still mocked + vendor-neutral, dark primary, Carbon + Ice. **Local only, not committed.**

**New shared components** (one `App`-level source of truth for `saved`, `shareEvent`, `settingsOpen`, `toast`): `SaveButton`, `Toggle`, `StatusPill`, `DateChip`, `parseDate`, `SectionHead`, `Segmented`, `Toast`, `ShareSheet`, `SettingsSheet`, plus a module-scope `SEED_PROFILE` (extracted from the old inline Profile fallback so verify + Profile share one seed). Added Heroicon glyphs: `bookmark-fill`, `link`, `paper-plane`, `bell`.

**Interactions wired (no more dead taps):**
- **Save/bookmark** — `saved` id array in `App`; toggle from Event Detail header + featured/lead image cards; ice-filled bookmark when saved; toast on change.
- **Saved experience** — new **Saved** segment in Invites (cleanest home for it; the Invites tab icon is already a bookmark). Invites tabs now a pill `Segmented`: Applied / Confirmed / Saved / Past, with counts. Saved rows open detail; an inline `SaveButton` unsaves. Empty state included.
- **Share** — `ShareSheet` bottom sheet: event preview + 4-up actions (Copy link / To Story / Message / More), each toasts + closes.
- **Settings** — `SettingsSheet` from the Profile gear: display name / IG handle / phone inputs, two notification `Toggle`s, a light-theme `Toggle`, vendor-neutral privacy note, Save + Log out + Delete (placeholders toast). Delete stays neutral ink (no second colour — One Cold Voice).
- **Verification** — Profile "Connect" → `onVerify` flips `data_status` to `verified` (badge → "Verified · Tier 1", audience → "Live", strip disappears), works on both the seeded and onboarded profile.
- **Minor controls** — Home search → jumps to Index; Map / Calendar / View pass → `Toast`.

**Finished-edge / divider rework (retires thin half-hairlines):** every "label + `flex-1 h-px`" section break → `SectionHead` (3×15px ice tick + label + optional outline meta pill). `StatusPill` (ice/neutral/outline) is now the one status vocabulary (Open, 24h left, Confirmed+dot, Under review, Not selected). `DateChip` (ice on the confirmed check-in block). Full-width masthead rules kept on purpose.

**Punctuation cleanup (display text only):** dropped decorative periods — Profile name (`Capriotti.`→`Capriotti`), `You're in.`→`You're in`, `Tier One.`→`Tier One`, `Couldn't read that.`→`Couldn't read that`, intro `Tap through Sara's flow.`→ no period. Kept punctuation in sentences, helper copy, handles, dates/times, ratios, and `·` data separators.

**TSS screenshot → our app map** (structure borrowed, look thrown away — see `research/screenshots/`):

| TSS pattern (screenshot) | Mapped to |
| --- | --- |
| Date-block chip on cards / featured banner | `DateChip` (ice on confirmed) |
| Status pills (OPEN FOR SWIPE green, UNDER REVIEW red) | `StatusPill` — ice/neutral/outline, second hue dropped |
| Segmented toggles (ENGAGEMENT/HEALTH, CHECKED IN/OUT/NO SHOW) | `Segmented` for Invites tabs |
| Save-heart circle on card image | `SaveButton` (our bookmark + ice) |
| Count badge on title (To Review 24, 45 Events) | counts in `Segmented` + Filters pill |
| Pending/Interest toggle switch | `Toggle` in Settings |
| Reputation triad (Punctuality/Presentation/Joviality) | noted for the venue side; not in v1 user UI |
| Glass featured banner (date + title + time + arrow) | informs the featured/section finish |

**Docs reconciled:** `DESIGN.md` (One-Family Rule rename + retires Two-Family; new §5 component entries for SectionHead/StatusPill/DateChip/Segmented/SaveButton/Toggle/Toast + Share/Settings sheets; Finished-Edge Rule in Do's; new Don'ts for half-hairlines, second status colour, decorative punctuation; hairline + section-label prose updated). `.impeccable/design.json` rule renamed. `AGENTS.md` font row cleaned (dropped Satoshi/Host Grotesk clause). `PRODUCT.md` + `context.md` font lines name the One-Family Rule. `context.md` gained the vendor-neutral "Profile data sourcing" table. `gallery.html` / `mockup-v1.html` left as-is (archived alternate directions — acid-lime/Satoshi/Instrument-Serif — not the live app; errors.md says keep them as references).

**Verified:** Node static check — file 1672 lines, brackets balanced (curly/paren/square delta 0), single `App`/`#root`/`createRoot`, all screen-render props + overlay mounts present, all 16 new component defs present, no leftover `flex-1 h-px` section dividers. Babel/visual render: see verification note below / next entry. (The Read tool was glitching with repeated-line artifacts on this big file — verified via Node instead.)

---

## 2026-05-31 — Merged to `main` + deployed to Vercel

Committed the full type/color overhaul + fixes on branch `design/type-color-overhaul` (`f45acf7`, 11 files, +318/−150), merged fast-forward into `main`, pushed (`52221e4..f45acf7`), then deleted the branch (local + remote). The earlier Pool Day image commit `f2610a6` rode along in the same history. `main` → Vercel auto-deploy (`the-list-omega.vercel.app`). **First push since the overhaul** — the prototype is now live, not just local. Standing rule reminder still holds for future work: don't push without Will's explicit OK; branch first.

---

## 2026-05-31 — Follow-up fixes: Tailwind `.font-mono` override, grey round-2, Pool Day image

Iterated on the same-day font change below. Final state of `web/index.html`:

- **Tailwind `.font-mono` collision fixed.** cdn.tailwindcss.com ships its own `.font-mono` utility (system monospace stack) that overrode our custom `.font-mono` at equal specificity (0,1,0, Tailwind wins on source order) → numbers were literally rendering in **system monospace**. Fixed with a doubled selector **`.font-mono.font-mono`** (0,2,0). Also dropped `tabular-nums` + forced weight so numbers read like body. Logged in `errors.md`.
- **No-grey cleanup, round 2.** The earlier token swap missed hardcoded `rgba(245,241,234,.5/.6)` text greys on the Home featured card (the `·` separator + "seats · applied") — flattened to `var(--ink)`. Remaining alpha-greys on Profile "member since" + the Picked reveal screen left intentionally (pending Will's call — they may be intended peak-moment hierarchy).
- **Pool Day image.** `./assets/pool-day.png` was a 2.6 MB file that painted black/slow and caused screenshot timeouts. Re-encoded with Pillow → **`./assets/pool-day.jpg`** (800×1000, 159 KB), repointed `IMG.beachClub`. Staged + committed (`f2610a6` on `main`, local only, not pushed). Original png still tracked.

Verified in preview :5555: body + display + numbers all resolve to Plus Jakarta Sans (`document.fonts` loaded), numbers no longer monospace, jpg loads complete. Screenshot still times out (page width, not the image) — verified via computed styles.

---

## 2026-05-31 — Font system replaced + greys killed (Will's call, overrides locked DESIGN.md)

Will overruled the locked two-family system and the grey hierarchy. `web/index.html` only — visual/CSS, not pushed. (Also reverted an undocumented Inter typography test a prior session had left in the working copy, before applying this.)

- **One font: Plus Jakarta Sans** across the whole app — body, labels, numbers/timers (`.font-mono` keeps `tabular-nums`), tabs, status bar, section labels, theme toggle. Dropped Satoshi + Host Grotesk and both font links; loaded Jakarta 400–800. Headers go bolder (display 800, `.font-mono` 700, body 400). Jakarta tops out at 800, so the Tailwind `font-black` utility's 900 clamps to the 800 face — harmless, looks identical.
- **No grey text.** `--ink-2` and `--ink-mute` both repointed to `--ink` (bone `#F5F1EA` in dark / black `#0A0A0A` in light) in both themes — kills every token grey in one move, 50 call sites untouched. Removed 4 opacity-dimmed text spots (lead time, "seats" unit, venue label, onboarding helper) that still read grey. Hierarchy now carried by size + weight only.
- **Ice kept** (`#9FD8E8` dark / `#26768F` light) on key numbers + primary buttons. Will confirmed "only black and white" meant text, not the accent.
- Non-text greys now inherit ink (fine): bottom-sheet drag-handle (ink@.4), audience male-split bar (now bone vs ice female), disabled-CTA label.

Verified in browser (preview :5555): `document.fonts` = loaded, check 400/800 true, body+display+stamp resolve to Plus Jakarta Sans, no leftover Satoshi/Host links, `--ink-2`/`--ink-mute` = bone. Screenshot tool timed out (known big-page issue) — verified via computed styles instead.

**Open for Will:** (1) dark-mode "white" kept as warm bone `#F5F1EA`, not pure `#FFFFFF` (the old Warm-White rule) — say if you want pure white. (2) `DESIGN.md` / `PRODUCT.md` / `AGENTS.md` still document the two-family + grey system and now contradict the prototype — update them on your OK.

---

## 2026-05-31 — UI audit fixes #5/#6/#7/#9/#10 (remaining items, Will's call to do all)

Closed out the last 5 audit items in `web/index.html`. Visual/CSS/markup only — no flow/data/provider/onboarding/routing/iOS change. Dark primary. Not pushed. Will audits next, then asks to push.

- **#5 Unify floating-control glass:** the Event Detail header buttons (back/bookmark/share) had a one-off inline glass (`rgba(10,10,10,.45)`/`blur(8px)`/border .25) different from everything else. Added a canonical **`.glass-over-image`** class (dark + light) — the single recipe for a control floating over a *photo*, distinct from `.glass` (floats over the app bg). Routed all three buttons through it; `.profile-glass` now shares the same base (keeps its own text-color contract). One over-image glass, not three.
- **#6 Home masthead:** Home had no display header while Index/Invites/Profile do. Gave it the one-word header **"Tonight"** (`font-display-l` 40px, matches Index) under the `The List · No. 048` eyebrow, with the date baseline-aligned right and search kept. Matches the One-Word Header rule (which already names "Tonight" for Home) and the Home tab label.
- **#7 Light-theme refinement:** light `.card` edge firmed (border `.06 → .12`, fill `.62 → .78`, tighter shadow) so cards read as objects on white, not flat panels. Active/press glows in light now key off the deep ice **`#26768F`** (`rgba(38,118,143,…)`) as a tight ring, not the bright dark-theme halo (`.glow-ice`, `.glow-primary`, card-hover border). Dark theme untouched.
- **#9 Editorial spacing rhythm:** broke the near-uniform section cadence on the most-stacked screens — Event Detail "The exchange" `pt-7 → pt-8`; Profile "Audience" `pt-6 → pt-7` and "Recent" `pt-6 → pt-9` (ascending air toward the final block). Generous between sections, tight within; 20px gutter (`px-5`) untouched.
- **#10 Numeric/timer polish:** new **`Countdown`** component renders timers with tighter, dimmed colons (opacity .4) so the tabular digits carry the weight — wired into Event Detail "Closes in" and Picked "Confirm within" (was `04 : 56 : 12` spaced). Encoded the **ice text-vs-fill rule** in a comment + demoted the Exchange ordinals `01/02` from ice to ink-mute (ordinals/labels are never ice; ice = the one *value* number). Net: less ice, tighter to the ≤10% budget.

Static-checked: all edited regions re-read + balanced, `Countdown`/`.glass-over-image` resolve, grep confirms no leftover spaced timers or bespoke button glass. **Not visually verified from agent env** (no browser render). Served at `http://127.0.0.1:5555/` for Will to eyeball. DESIGN.md updated with `.glass-over-image` + the ice text/fill rule.

---

## 2026-05-31 — UI audit fix #3 (Explore rhythm)

Killed the "identical card grid" tell on Explore (`ScreenExplore`). No flow/data/sort/provider/routing/iOS change — visual restructure only, reusing existing card vocabularies. Dark primary. Not pushed.

- **Before:** 5 identical 200px full-bleed image cards in `space-y-4` → reads as a template grid.
- **After:** `[lead, ...rest] = list`. **Lead** = first room as one tall 300px full-bleed editorial card (34px `font-display-l` title, badge + type chips, ice date/seats rail). **Index** = the rest as denser horizontal rows (reuses the Home "Also tonight" row: 14×16 thumb + type stamp + title + venue·area, right rail = ice seats + time).
- **Rhythm:** generous `pt-6` gap after the lead, tight `space-y-2` between rows (tight-within / generous-between, per the layout ref). Lead appears instantly; rows keep the `stagger`.
- **Ice rationed:** rows show ice on seats only (the scarcity number), date/time stay muted — keeps ice ≤10% and "one number worth reading."
- Added a quiet empty state (`list.length === 0`) for future filters; current chips all match ≥1 so it won't fire in demo.

Meta rail above ("{n} rooms · Sorted · closes soonest") unchanged — now reads as the index masthead over the lead. List order untouched (lead = `list[0]`, same first item as before), so no sort-logic change.

Static-checked: JSX balanced, `lead`/`rest`/`e.*` all resolve, all classes (`card`/`grain`/`font-display-l`/`stamp`/`font-mono`/`press`) pre-exist — no new CSS. **Not visually verified from agent env** (no browser render). Served at `http://127.0.0.1:5555/` for Will to eyeball.

---

## 2026-05-31 — UI audit fixes 1/4/2/8 (premium-editorial pass)

Executed 4 of the 10 ranked audit fixes in `web/index.html`. No flow/data/provider/onboarding/routing/iOS changes. Dark stays primary. Not pushed.

- **#1 Flat-At-Rest:** removed `backdrop-filter: blur(6px)` from resting `.card` (was glassmorphism-on-everything, violating our own Glass-Is-For-Floating rule). Bumped fill to `rgba(26,26,26,.66)` so cards still read elevated without blur. Floating glass (top controls, tab bar) keeps its blur.
- **#4 Eyebrow reduction:** added a calmer `.section-label` style (Satoshi 700, 14px, sentence-case) and converted the 4 recurring section dividers (Also tonight, The exchange, Audience, Recent) from tracked-uppercase `.stamp`. Removed the redundant "Personal" eyebrow above the Invites header. `.stamp` kept for true value labels (When/Doors/Seats, form labels, statuses).
- **#2 Profile stat strip:** replaced the 3 equal metric columns (hero-metric SaaS cliché) with an asymmetric editorial block — Reputation `9.4` as a 64px ice hero, Followers + Engagement as a smaller muted right-aligned pair. Same data + verified/estimated logic untouched.
- **#8 Tab bar:** removed the active ice dot + its CSS; active state now ice icon + glow + bone label only (one signal, "status without shouting"). Theme-toggle dot (separate) untouched.

Verified: script brackets balanced, all states present. Preview served at `http://127.0.0.1:5555/` (python, web/). Fixes 3,5,6,7,9,10 from the audit still open.

---

## 2026-05-31 — shared iOS agent skills installed

Installed 8 repo-local iOS skills under `.agent/skills/` so Claude Code, Codex, or any other agent can use the same project skill library:

- `swiftui-ui-patterns`
- `swiftui-view-refactor`
- `swift-concurrency-expert`
- `ios-debugger-agent`
- `swiftui-performance-audit`
- `swiftui-liquid-glass`
- `swift-architecture-skill`
- `swift-testing-expert`

`AGENTS.md` now tells agents to read `.agent/skills/<skill-name>/SKILL.md` when Will invokes a skill. `.agent/skills/README.md` documents sources, use cases, recommended order, and the third-party-skill safety note.

---

## 2026-05-30 — colorize + truth-telling states + reveal split + dates + error path

Worked the audit backlog + the "what would you improve" list. All in `web/index.html`. Light theme kept (Will's call).

- **colorize (light-theme contrast, verified AA via node WCAG calc):** light `--ice` `#4FA8C5` → **`#26768F`** (white-on-ice + ice-as-text both 5.16:1), light `--ink-mute` `#7A7A7A` → **`#696969`** (5.04:1 on cards), added light `--ice-dim`. Dark theme untouched (already passed). DESIGN.md token + prose updated.
- **#2 truth-telling (apply ≠ in):** My Events first segment renamed **Invited → Applied**; added an "Under review · applied 2h ago" pending card (with "Not every application is picked" note) and a muted/grayscale **"Not selected"** row in Past (no score, "venue picked others"). Design call: rejection stays a quiet status, not a full-screen takeover — keeps Picked as the one peak.
- **#3 reveal hierarchy:** onboarding "Tier One" ring is now a quiet **outlined credential** (no pulsing halo); the Picked "You're in" ring keeps the filled + pulse celebration. Getting picked > initial acceptance.
- **#5 dates:** canonical "today" = Sunday 25 May (matches Explore active day + featured). Home header `Saturday · 24.05` → `Sunday · 25.05`; Sound Bath + Late Lounge `Fri · 23` → `Sun · 25`.
- **#4 onboarding error/retry:** `mockCreatorDataFetch` now rejects for handles `fail`/`notfound`/`error` (deterministic demo trigger); `submit()` try/catch → new `error` step ("Couldn't read that." + "Try another handle" → back to phone). **List skeletons deliberately deferred** — the lists are synchronous seed data; faking loading would be theater and flash on every nav. The only real async (creator-data fetch) already has its "Reading" loading screen. Skeletons land with the Supabase fetch.

Static-checked (balanced brackets, all onboarding states present). Not visually verified — Playwright MCP never connected, npm/curl SSL-blocked; opened in Will's browser. Demo tip: type handle `notfound` to see the error path.

---

## 2026-05-30 — impeccable audit + icon swap (Phosphor → Heroicons)

**Audit of `web/index.html`: 13/20 (Acceptable).** Damage concentrated in a11y + the light theme. Verified contrast numbers (node WCAG calc), which corrected an earlier wrong assumption:

- **Dark theme passes** — bone 17.6:1, bone-2 10.9:1, bone-mute 5.73:1, ice 12.7:1. (My earlier "bone-mute ~4.0:1" note was wrong; fixed in DESIGN.md.)
- **Light theme is the real debt (P1):** white text on `--ice` `#4FA8C5` = **2.71:1** (primary buttons + accent numbers fail); `--ink-mute` `#7A7A7A` = 3.9-4.3:1 (fails small-text AA).
- Other P1: icon-only buttons have no `aria-label`; no `:focus-visible` ring.
- P2: reduced-motion only guards `.stagger` (ringPop/pulseIce/spin/anim-fade/slideUp/sheetIn unguarded — corrects a DESIGN.md overclaim); inputs not label-associated; `.card` puts backdrop-blur on every card (violates our own Glass-Is-For-Floating rule); images not lazy-loaded.
- Recommended fixes: `/impeccable colorize` (light palette), `/impeccable harden` (a11y), `/impeccable polish` (card-blur, lazy-load, eyebrow density). NOT yet applied — audit only documents.

**Icon family swapped Phosphor → Heroicons (outline).** Will rejected Lucide then Phosphor; Heroicons chosen as the closest free stand-in for SF Symbols (the SwiftUI target). Now **inlined as SVG** (zero icon CDN dependency — removed the Phosphor `<script>`). Path data pulled from `unpkg heroicons@2.1.5/24/outline` via `node --use-system-ca` (curl/npm were SSL-cert-blocked in this sandbox). `Icon` rewritten to a `HICONS` name-map; call sites unchanged. compass→map, search→magnifying-glass, settings→cog-6-tooth, sliders→adjustments-horizontal; **instagram is a custom inline mark** (Heroicons has no brand glyphs). Added `aria-hidden` on icons (folds in an audit P3). Not visually verified from agent env — opened in Will's browser.

---

## 2026-05-30 — impeccable document: DESIGN.md + sidecar written

Ran `/impeccable document` (scan mode, tokens extracted from `web/index.html`). Created `the-list/DESIGN.md` (Stitch 6-section format + YAML token frontmatter) and `the-list/.impeccable/design.json` (sidecar: tonal ramps, shadow/motion tokens, 8 live-renderable component snippets, narrative).

Two creative calls locked with Will:

- **Creative North Star: "The Midnight Editorial"** (fashion magazine printed for the dark).
- **Depth = restrained accent** (glass on floating controls only, ice glow on active/pressed only, flat at rest). Drives the Elevation doctrine.

Captured tokens (canonical = the prototype's hex vars): carbon black `#0A0A0A` / bone `#F5F1EA` / ice `#9FD8E8`; Satoshi 900 display+numeric, Host Grotesk body. Named rules: One Cold Voice (ice <=10%), Warm-White (no pure white text), Two-Family, One-Word Header, Flat-At-Rest, Glass-Is-For-Floating. All PRODUCT.md anti-refs carried into Don'ts verbatim.

Contrast debt re-flagged in DESIGN.md: Bone Mute `#8A8A8A` on carbon ~4.0:1 (below 4.5 for small body). `/impeccable audit web/index.html` is the next obvious pass.

---

## 2026-05-30 — impeccable init: PRODUCT.md written

Ran `/impeccable init`. Created `the-list/PRODUCT.md` (strategic design context for the impeccable skill).

- **Register locked: `product`** (app UI — design serves the app; the editorial flavor doesn't make it a brand/marketing surface).
- Users / purpose / brand personality / anti-references pulled straight from existing `docs/agent/context.md` + `errors.md` (no new decisions there).
- **Accessibility default set: WCAG AA + `prefers-reduced-motion`** + ice-blue never the sole state signal. Will was unsure, so this is the working default — not founder-ratified. Revisit at SwiftUI build.
- Flagged contrast debt (muted grey + white-on-image) as the first `/impeccable audit` target.

Note: impeccable scripts live at the `Me` level; PRODUCT.md lives at the product root (`the-list/`). Future `/impeccable` commands should run with `the-list` as the working dir or the context script won't find it. DESIGN.md not yet generated.

---

## 2026-05-30 — Polish pass on `web/index.html` (no flow change)

Visual-only pass. Flow, copy (beyond headers), and creator-data/provider logic untouched.

1. **One-word headers** (sentence → word):
   - Explore "All open rooms in Beirut." → **Index** (dropped the duplicate small "Index" eyebrow)
   - My Events "My List" → **Invites**; Filter sheet "Refine the index." → **Filters**
   - Onboarding 3 states: "Apply for access." → **Apply**, "Reading your audience." → **Reading**, "You're on the list." → **Listed**
   - **Tab bar also aligned** (decision, flagged for Will): "My List" → Invites, "Me" → Profile. Tonight/Index already matched. Revert if only in-screen headers were wanted.

2. **Depth (TSS-style, no purple/pink):**
   - `.glass` frosted controls (Home search, Explore Filters pill, My Events calendar)
   - Tab bar now translucent + `blur(22px)` + subtle ice top-glow; active tab icon glows ice
   - `.card` = translucent black + 1px glass border + softer shadow; applied to list/featured/past/confirmed/verify/country-tile cards
   - `.glow-ice` on active pills/days/chips; `.glow-primary` on ice CTAs — **active + pressed only**, not resting
   - Ornamental ice dot-grid via `body::before`, radial-masked so it only shows outside the (opaque) phone
   - `.press` hover micro-interaction added

3. **Icons: Lucide → Phosphor** (web-font CDN `@phosphor-icons/web@2.1.1`). Rewrote `Icon` to emit `ph-thin/ph-light/ph` classes (weight from old `stroke` prop — thin default, no fills). `PH_NAMES` map keeps every call site's old lucide name working (search→magnifying-glass, settings→gear-six, share→share-network, calendar→calendar-blank, instagram→instagram-logo). Removed the innerHTML/`createIcons` pattern.

**Not visually verified from agent env** — Playwright MCP didn't connect, npm cert-blocked (no esbuild/headless). Static-checked all edited classNames + confirmed no Lucide remnants. Opened in Will's browser for eyeball. Not pushed.

---

## 2026-05-30 — Creator-data UX wired, provider deliberately not locked

Decision: **the prototype now shows the real UX** (type handle → 2-second fetch → profile auto-populates with followers, engagement, audience split), **but we do NOT lock the vendor yet.**

Provider candidates, ranked by current lean:

| Candidate | Why it's interesting | Why we haven't picked |
| --- | --- | --- |
| **Phyllo** | Two modes from one vendor (Identity API + Connect SDK for OAuth). Cheap at beta volume. Drop-in OAuth means we don't have to do Meta App Review ourselves. | Haven't trialed it. Pricing assumptions unverified. |
| **Modash** | Largest indexed creator DB (~250M). Fast to integrate. | Flat $99/mo even at 30 users — expensive in beta. |
| **Ensembledata** | Cheapest per-lookup ($0.01–0.05). Lightweight data. | Less rich than the others. Real-time only, no historical. |
| **HypeAuditor** | Strong fake-follower detection — useful for vetting. | Heavy pricing ($399/mo+). Overkill until volume justifies. |

Rejected outright:

- **Direct IG scraping** — violates IG ToS, Meta DMCAs apps, App Store pulls. Hard no.
- **Manual review by Dima** — rejected by user. Want production-ready, zero manual in the happy path.

Prototype changes shipped:

- New `mockCreatorDataFetch(handle)` function returns the normalized response shape after a 2.4s simulated network call. Drop-in replaceable with a real `fetch()` once backend exists.
- `ScreenProfile` reads from `profile` prop instead of hardcoded values. Falls back to Sara seed if no profile (handles Skip-onboarding demo path).
- "Verify with Instagram" upgrade strip shown on Profile when `data_status === "estimated"`. Disappears when verified.
- Profile badge shows "Self-reported · Tier 1" until OAuth, then "Verified · Tier 1".
- `.env.example` uses generic `CREATOR_DATA_PROVIDER` + `CREATOR_DATA_API_KEY` first. Vendor-specific keys (Phyllo, Modash, Ensembledata) live in a commented block below — uncomment whichever we pick.

Backend integration still to build — out of prototype scope. The client doesn't know which vendor backs the data, so swapping is one Edge-function change.

---

## 2026-05-30 — Agent docs moved out of root

Moved project working docs from root into `docs/agent/`:

- `context.md`
- `plan.md`
- `memory.md`
- `errors.md`

Root stays reserved for `README.md` and `AGENTS.md`, which are the files humans and agent tooling should find first. Updated README, AGENTS, Claude starter, and Codex starter prompts to point to the new paths.

---

## 2026-05-28 — Font system locked + scroll bug fixed

Body font swapped to **Host Grotesk** (matching the LAU MarketMind webapp at `C:\Users\user\LAU\LAU Applied AI Final Project\webapp-final`). Reasons:

- Geist Mono looked too "techy" and added a third font family
- Host Grotesk is a friendlier sans, pairs cleanly with Satoshi, used in Will's other production project so brand voice carries across

Headers: **Satoshi** (500 / 700 / 900) — kept.
Numbers / timers: **Host Grotesk with `tabular-nums`** — no separate mono family.

CSS structure:

- `body` → Host Grotesk 400
- `.font-black` / `.font-display` → Satoshi 900 letter-spacing -0.015em
- `.font-mono` aliased to Host Grotesk + tabular-nums (kept as class so JSX still works)
- `.stamp` → Host Grotesk 500 small-caps

Scroll fix: status bar, tab bar, sticky Apply CTA, and home indicator now sit as **siblings** of the scroll container, not children. Previously they were positioned `absolute bottom-0` inside an `overflow-y-auto` div — which makes them stick to the bottom of the *scrolled content*, not the visible viewport edge. New pattern wraps everything in a `<PhoneScreen>` component.

---

## 2026-05-28 — Live on Vercel

Deployed `web/` directory as the Vercel root. Live URL: `the-list-omega.vercel.app`. Root Directory setting in Vercel had to be edited post-import (wasn't set during the GitHub auto-import flow). `vercel.json` adds `cleanUrls: true` so `/gallery` and `/mockup-v1` resolve without `.html`.

---

## 2026-05-27 — Initial repo scaffold

Created the repo at `github.com/will-rads/the-list` (public). Moved all existing assets into:

- `web/gallery.html` — Claude design version (was `The List.html`)
- `web/mockup-v1.html` — original carbon black + ice blue + Satoshi
- `research/screenshots/` — 10 TSS screenshots
- `research/voice-notes/` — Radwan's WhatsApp voice notes
- `research/secretsociety.jpeg`, `research/review-full.jpeg`
- `docs/plan-breakdown.md` — synthesis of Radwan's pitch
- `docs/secret-society-research.md` — TSS public knowledge brief
- `docs/transcripts/transcripts.json` + `transcribe.py`

Wrote `README.md`, `AGENTS.md`, `context.md`, `plan.md`, `memory.md` (this file), `errors.md`. Wrote `prompts/claude-starter.md` + `prompts/codex-starter.md`. Wrote `.gitignore` + `.env.example`.

---

## 2026-05-26 — Design v1 image swap

Took the original mockup-v1 (Carbon Black + Ice Blue + Satoshi, picsum random images) and swapped 9 unique placeholder URLs for curated Unsplash venue photos from the Claude design version. Both dark and light rows now use the same curated set. Image set: `pool`, `beachClub`, `cocktail`, `restaurant`, `lounge`, `saraFull` — venue-appropriate, magazine-quality.

---

## 2026-05-26 — Light mode + density on Claude design

Took `The List.html` (the Claude-design version with acid lime + Instrument Serif). Added:

- Light mode via `html.light` CSS class
- Theme toggle pill top-right of the page
- Tab bar gradient flips with theme
- Killed § 03 "The room reads you back" applicant pile on Event Detail (redundant with "137 applied" in meta rail)
- Shortened § 01 paragraph
- Reduced § 02 exchange rules from 3 → 2

Outcome: less crowded, light + dark both viewable.

---

## 2026-05-26 — Two design directions diverged

Two reference HTMLs now exist:

- **mockup-v1.html** — Will's original brief (Carbon Black, Ice Blue, Satoshi). 12 phones, dark+light side-by-side.
- **gallery.html** (was The List.html) — Claude design's interpretation (Acid Lime, Instrument Serif italic). 6 phones, single mode (now with light toggle added).

Will prefers mockup-v1's color/font system but liked gallery.html's image selection. Image swap merged the two.

Open: font choice for v1 build. Instrument Serif feels AI-flavored. Options:

- Drop the serif entirely. Geist + Geist Mono only.
- Swap to Fraunces (free, more characterful).
- Paid display face later (Söhne, PP Editorial New, Tobias).

---

## 2026-05-26 — Apply + Swipe model confirmed

After seeing The Secret Society's actual venue-side UI (10 screenshots from Radwan once he got accepted):

- Influencers don't claim spots FCFS. They **apply**, then venue swipes Tinder-style.
- Reputation scoring exists: Punctuality / Presentation / Joviality (each ~10).
- Venue marks each attendee CHECKED IN / CHECKED OUT / NO SHOW.
- One brand can manage many establishments.

Locked: we copy this structure exactly. Wedge is in visual language + Lebanon-local + the limited-spot drop framing.

---

## 2026-05-19 — Pitch received

Radwan sent 9 WhatsApp voice notes (10:06-13:02 UTC+3) pitching the idea. Transcribed via Gemini 3 Flash, batched in a single multi-clip request for context preservation. Transcripts at `docs/transcripts/transcripts.json` (Arabizi + English).

Founding team: Radwan / Dima / Will. 33.33% × 3. Decisions need all three.

---

## Standing rules (don't break these)

- No purple or pink gradients in any UI. TSS's biggest visual weakness.
- No Inter font. Anywhere.
- No Instrument Serif unless explicitly approved (too AI-flavored as of 2026).
- iPhone-first. No Android in v1. No web app for end users in v1.
- Brand pays. Influencer free. Don't experiment with this.
- v1 is Beirut only.
- Story requirement is **1 Story + tag**, not 4. The 4-Story rule is TSS's biggest weakness.
