# W5 task — markdown refresh after backend v1 (Codex brief)

Docs only. Do NOT touch code, web/*.html, ios/, or checkers. Do NOT commit or push.
Source of truth: docs/agent/memory.md top entry (2026-07-10) + docs/superpowers/plans/2026-07-10-backend-v1-plan.md. Read both first.

Style: match each file's existing voice. Keep history; demote stale claims to clearly-marked
"Superseded" notes instead of deleting rulings. Short > long.

## 1. docs/agent/plan.md — the big one
- Rewrite "Where we are right now" to the current phase: backend v1 LIVE (2026-07-10) on Supabase
  `zrbakomzpuesifasuamb`; production = the-list-omega.vercel.app with `/v3` member (wired),
  `/v3/venue` venue (NEW, wired), `/v3/e?id=` teaser, `/admin` founder ops; `/`, `/v2` frozen
  archives; SwiftUI app scaffolded + CI green (mock services, Supabase binding = Mac-day wave);
  v3 glass is the adopted look. Next gates: Will click-tests production; SMS provider decision;
  GEMINI_API_KEY + Meta App Review to light up stories; Phyllo (or other provider) trial.
- Checklist: add [done] rows for v3 glass reskin (2026-07-04), SwiftUI scaffold + CI (2026-07-04/05),
  backend v1 + venue web + teaser + admin deployed (2026-07-10). Move the ◄── HERE marker to
  "Will click-tests production backend".
- "Out of scope" list: "Auto Story verification. Manual screenshot DM v1." → replace with
  "Story verification = Graph API + Gemini only (2026-07-10 ruling), dark until keys + Meta review.
  NO manual screenshot path — superseded." Same for "Supabase backend scaffold" next-items (done).
- Risks table: "manual review v1" mitigation → "Gemini rubric + founder override in /admin".

## 2. README.md
- Line "iPhone-first. SwiftUI eventually. Static HTML prototype now." → current: iPhone-first;
  live web app (member + venue) on Supabase backend; SwiftUI app scaffolded, CI-compiled, binds on
  Mac day.
- Subfolders: "ios/ — Empty for now" → "SwiftUI app (mock-first, CI green; Supabase binding
  pending Mac day)". Add web/v3 + admin.html mention to web/ line, one clause only.

## 3. docs/agent/context.md
- Architecture block: update to reflect the live backend (Supabase project ref, RLS + RPC state
  machine, 18 notifications w/ pg_cron, realtime, edge stubs creator-data/score-story dark).
  Keep the "vendor swappable" creator-data doctrine — still true.
- "Story verification mechanic" open question + any "manual screenshot upload v1" text →
  superseded note: 2026-07-10 ruling = Graph API fetch + Gemini rubric scoring only, binary ≥70,
  founder override in /admin; @thelist mention spine (2026-07-03) superseded AS the verification
  mechanism (tag requirements live on inside the scoring rubric).
- Onboarding data flow: note auth = email OTP today, phone OTP when SMS provider lands; "Apply for
  access" now writes real profiles rows into an approval queue + invite codes skip it.
- "Venue side ... Out of v1 scope until influencer side ships" → superseded: venue web v3 shipped
  2026-07-10 at /v3/venue.

## 4. HANDOFF.md (repo root)
- Entire file describes the pre-v3 redesign session — superseded. Replace body with a 6-line
  pointer: superseded 2026-07-10; current state lives in docs/agent/memory.md (top) +
  docs/superpowers/plans/2026-07-10-backend-v1-plan.md; production URLs list. Keep the filename.

## 5. prompts/claude-starter.md (and prompts/codex-starter.md if it has the same note)
- The DESIGN.md heads-up paragraph (says v2 reskin is the live look) → v3 glass is the adopted
  look (web/v3/, spec docs/superpowers/specs/2026-07-04-v3-glass-reskin-design.md); v2 frozen at
  /v2; backend live — memory.md top entry has the state.

## 6. docs/agent/errors.md — ADD two entries on top (dated 2026-07-10), keep style
- **Agents must never retype secrets/keys**: Codex "copied" the Supabase anon key by
  reconstructing the JWT and hallucinated the middle segment → Invalid API key at runtime.
  Rule: copy keys byte-for-byte from an existing file, and QA must diff the literal.
- **Codex file writes can arrive mojibake'd** (UTF-8 → cp1252/smart-quote round-trip): 190+
  corrupted sequences (· → Â·, – → â€", → → â†') broke the Babel parse. Fix = byte-wise reverse
  map. Prevention: esbuild is now installed globally so web/v3/check-v3.mjs's parse gate actually
  runs — never accept a "checker green" that printed a parse-gate-skipped note.

## 7. DESIGN.md + PRODUCT.md
- Do NOT rewrite. Add one short banner note under each file's title: doc describes v1; current
  look = v3 glass (spec 2026-07-04-v3-glass-reskin-design.md) + standing rulings in memory.md
  (no gray text, Jakarta-only, sentence case, bg-3 ground); sync deferred deliberately.

## 8. ios/README.md
- One added line near the top: backend v1 is live (see 2026-07-10 plan doc); Swift services stay
  mock until the Mac-day Supabase binding wave.

## Verify
Grep the repo docs for leftovers of: "Empty for now", "manual screenshot", "deliberately parked",
"WAVE 1 BUILT", "Static HTML prototype now" — none should remain outside memory.md history entries
and superseded notes.

## Report
Files changed, contradictions removed, anything you left alone on purpose.
