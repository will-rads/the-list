# Errors — known pitfalls, don't repeat

Things that have already gone wrong, or known traps. New entries on top, dated `YYYY-MM-DD`.

---

## 2026-07-04 — Two traps from the v3 glass reskin

1. **Transparent screen roots bleed on stacked overlays.** Screens mount as stacked `absolute inset-0` layers (EventDetail/Pass render ABOVE the still-mounted Home). If an overlay screen root is `background:transparent` (to show the photo ground through), the underlying screen shows through it. Fix: overlay screen roots get `.screen-ground` (scrim + `var(--bg-photo)` cover — same recipe as `.iphone-screen::before`); only tab-level screens stay transparent.
2. **`npx http-server` caches (max-age 3600).** Verifying edits through it serves the STALE file — a fix looked broken for a whole round-trip. Cache-bust with `?v=N` or serve with `-c-1`.

---

## 2026-05-31 — Gemini media model IDs + SDK/TLS (image & video generation)

Model IDs on Will's `GEMINI_API_KEY` (verified via the models list endpoint), for future AI-asset work:

| Want | Model ID | SDK call |
| --- | --- | --- |
| **Nano Banana Pro** (image gen+edit) | `gemini-3-pro-image-preview` (alias `nano-banana-pro-preview`) | `client.models.generate_content(..., config=GenerateContentConfig(response_modalities=["IMAGE"], image_config=ImageConfig(aspect_ratio="9:16")))` |
| Nano Banana (cheaper) | `gemini-2.5-flash-image` / `gemini-3.1-flash-image` | same `generate_content` |
| **Veo 3.1** (video, incl. image-to-video) | `veo-3.1-generate-preview` / `veo-3.1-fast-generate-preview` | `client.models.generate_videos(...)` → poll `client.operations.get(op)` → `client.files.download(file=gv.video)` |
| Imagen 4 | `imagen-4.0-generate-001` | `predict` |

Gotchas burned on (2026-05-31, the entry-screen build):
- The repo's `gemini_analyze.py` helper is **analysis-only** (raw REST). Generation needs the **`google-genai` SDK** (`pip install google-genai`).
- **TLS:** the SDK (httpx/certifi) fails `CERTIFICATE_VERIFY_FAILED` behind the machine's intercepting CA. Fix: `pip install truststore` then `import truststore; truststore.inject_into_ssl()` at the top of the script (uses the Windows cert store). The urllib analyzer wasn't affected; the SDK is. `npx esbuild` hits the same wall — run node with `NODE_OPTIONS=--use-system-ca`.
- Veo `generate_videos` is **long-running** — submit, poll `operations.get` every ~15s (2–5 min on fast). Run as a background task.
- Veo duration isn't a free param — generate at default, then **ffmpeg `-t 5`** to trim to exactly 5.000s. Web-encode `-c:v libx264 -pix_fmt yuv420p -movflags +faststart -an`. ffmpeg lives at `C:\Users\user\Tools\ffmpeg\...\bin`.
- **Safety filter:** people + swimwear ("bikini") can return `generated_videos=None` with **no error object**. Soften wording ("elegant summer beachwear / sheer kaftan") — and even then it may refuse; always guard for a None clip and keep a fallback (we used a text-to-video clip).
- **`web/assets/*.mp4` is caught by the `*.mp4` line in `.gitignore`** — negate with `!web/assets/*.mp4` or app video silently never commits/deploys.
- Windows `%TEMP%` can be evicted mid-session — don't park multi-step generator scripts there; prefer the Edit tool for repo files and keep scripts under the repo or rewrite them when needed.

---

## 2026-05-31 — Tailwind CDN utilities silently override our custom `.font-*` classes

`web/index.html` loads `cdn.tailwindcss.com`, which generates its own utilities including **`.font-mono`** (a system monospace stack) and **`.font-black`** (weight 900). Our `<style>` block defines custom `.font-mono` (our number font) and `.font-black` (display) with the **same specificity** (single class = 0,1,0). When specificity ties, **source order wins, and Tailwind's injected stylesheet often lands after ours** — so Tailwind wins and our font is silently dropped.

Symptom: every number tagged `.font-mono` rendered in **system monospace** instead of the app font, even though our `.font-mono` rule looked correct. Easy to misdiagnose (I first blamed `tabular-nums`).

Fixes that work:
- **Higher specificity:** double the class — `.font-mono.font-mono { … }` (0,2,0) beats Tailwind's 0,1,0 regardless of source order. (What we did.)
- Or set `tailwind.config = { theme: { fontFamily: { sans:[…], mono:[…] } } }` in a script after the CDN so Tailwind's own utilities use our family.

Note: testing with a freshly-injected `document.createElement('span')` gave a **false pass** (it resolved to our font) while the real rendered elements were monospace — verify on actual DOM nodes after reload, not synthetic ones. Also: when the SwiftUI/production build drops the Tailwind CDN, this collision disappears.

---

## 2026-05-30 — Never scrape Instagram directly

Tempting shortcut: hit `instagram.com/<handle>` and parse follower count from public HTML, or query an unofficial scraper API. **Do not do this.**

- Violates Instagram Terms of Service
- Meta sends DMCA takedowns + can sue
- Apple pulls the app from the App Store when Meta flags it
- IP gets blacklisted within hours of any volume

**The only safe routes for IG data — pick one licensed provider:**

| Route | What it gives | Provider candidates (not yet locked) |
| --- | --- | --- |
| **Handle lookup APIs** | Followers, estimated demographics, engagement. No user OAuth needed. | Phyllo Identity, Modash, Ensembledata, HypeAuditor |
| **OAuth Connect SDKs** | Real Meta numbers + story-posting verification. User has to authorize. | Phyllo Connect, official IG Graph API directly |

If a new agent suggests "let me just curl instagram.com to grab the audience info" — stop them. It's the same trap as scraping LinkedIn, only worse because Meta is more aggressive.

Provider decision is **deliberately deferred** until we trial 1-2 of them. Until then, prototype uses a `mockCreatorDataFetch()` that returns the agreed normalized shape (see `web/index.html`). The backend will wrap whichever vendor we pick behind that same shape so the client never has to care.

---

## 2026-05-27 — `gh` CLI not in default PATH after winget user-scope install

After `winget install --id GitHub.cli --scope user`, the binary lands at:

```text
C:\Users\user\AppData\Local\Microsoft\WinGet\Packages\GitHub.cli_Microsoft.Winget.Source_8wekyb3d8bbwe\bin\gh.exe
```

Current shell doesn't see it (PATH not refreshed). Either:

- Restart shell so `gh` resolves, OR
- Call the full path explicitly: `& '<full path>\gh.exe' <command>`

---

## 2026-05-27 — Claude Code preview tool screenshot times out on big pages

`mcp__Claude_Preview__preview_screenshot` times out (30s) when the page is ≥ 2700px wide or ≥ 2700px tall, even when all images have loaded. Workarounds:

- Resize viewport down to ~1500×1000 first
- Take multiple screenshots scrolling the page in chunks
- Page must be < ~1500px effective render size for reliable screenshots

---

## 2026-05-27 — Bash heredoc / multi-quote pattern fails on Windows

In Claude Code on Windows, Bash tool sometimes errors with "unexpected EOF while looking for matching quote" on commands that wrap Windows paths with spaces. Pattern:

```bash
ls "C:\Users\user\Documents\Me\the-list\"   # FAILS
```

The trailing `\"` makes the shell think the next quote is opening a new string. Use **PowerShell tool** instead of Bash for any path containing spaces, OR use forward-slash form `/c/Users/user/Documents/Me/the-list/`.

---

## 2026-05-26 — Babel/Tailwind CDN warnings are noise, not errors

The HTML prototypes use `https://cdn.tailwindcss.com` + `@babel/standalone`. Console logs are flooded with:

> You are using the in-browser Babel transformer. Be sure to precompile your scripts for production.
> cdn.tailwindcss.com should not be used in production.

These are **expected for prototypes**. Do not refactor to local Tailwind / build pipeline until production. Save the refactor for the SwiftUI port.

---

## 2026-05-26 — Don't horizontal-scroll the preview iframe

`window.scrollTo(x, y)` only respects `y` in the Claude Preview iframe — `x` is silently ignored if the root has `overflow-x: hidden` or the body is scaled. Don't waste time scrolling sideways; resize the viewport wider instead, or use CSS transform: scale().

---

## 2026-05-26 — Instrument Serif italic = AI tell

Claude Design defaulted to Instrument Serif italic for display headings. By mid-2026 every AI-generated "editorial" landing page uses it. It's the new Inter. Avoid for v1.

---

## 2026-05-26 — Don't swap visual identity for one user's preference round

When Will said "I prefer your version" → instinct was to delete the Claude-design version. Wrong move. Better: keep both files as references, swap only the specific assets the user liked (the curated images). Preserve optionality during prototype phase.

---

## 2026-05-19 — Don't send long bulk WhatsApp from Radwan

Radwan: *"If I send the message now, three-quarters of them will just read the first sentence and stop."*

When the soft pre-launch outreach happens, **Dima sends, not Radwan, not Will**. She has the trust with the database. Wrong sender = ignored message.

---

## 2026-05-27 — CDN script tags in `web/` lack SRI on purpose

`web/prototype.html`, `web/gallery.html`, and `web/mockup-v1.html` load Tailwind, React, Babel-standalone, and Lucide from public CDNs with **no `integrity="sha384-..."`** attribute. A security plugin flags this on every `Write`. Verdict for v1:

- These files are **prototype-only**. Not shipped to end users. Not the SwiftUI app.
- When we port to SwiftUI the CDN concern vanishes (no JS).
- When a marketing site ships, it uses a real bundler (Vite / Next / Tailwind CLI), not CDNs. SRI gets generated automatically.

**Do NOT** copy these CDN script tags into anything that ships to end users. If you find a CDN tag in `ios/`, `marketing/`, or any production deploy folder — that's a bug.

The Icon component uses `ref.current.innerHTML = ""` to clear the slot before `appendChild`. It does **not** inject untrusted HTML; the only inputs are hardcoded icon-name strings. Safe. Same warning will fire again — ignore unless a user-controlled string is being concatenated into innerHTML.

---

## Standing don'ts

- Don't push to GitHub without confirmation.
- Don't commit secrets. `.env` is gitignored. Edit `.env.example` for new keys.
- Don't refactor Tailwind / Babel CDN to local until SwiftUI port.
- Don't add a font without checking AGENTS.md for the no-go list (Inter, Instrument Serif).
- Don't rebuild what already exists in `web/` or `docs/` — check first.
- Don't propose Android in v1.
