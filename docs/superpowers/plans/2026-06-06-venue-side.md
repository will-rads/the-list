# The List — Venue Side Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the venue/business side of The List as a mocked, tap-through HTML prototype (`web/venue.html`) where a venue registers, posts an event with seats + a gender mix, and swipes Tinder-style through influencer applicants.

**Architecture:** New self-contained single-file React-via-Babel prototype `web/venue.html`, mirroring the structure of the existing `web/index.html` (member side). One `<style>` block reusing the locked design tokens, one `App` with a role of state machine for onboarding + a 3-tab shell. The member side gets a small role-chooser door on its intro plus, at the end, a 4-image gallery + TikTok field. All data is mocked client-side in the same vendor-neutral shape the member side already uses.

**Tech Stack:** React 18 + ReactDOM (CDN), `@babel/standalone` (in-browser JSX), Tailwind CDN, Plus Jakarta Sans (Google Fonts), Heroicons inlined as SVG. No backend, no bundler, no test framework. Images via `FileReader` + CSS transform (no upload, no canvas export).

---

## Verification model (read first — replaces TDD)

This repo has **no test framework**. The member side was built and verified by: (a) a node static check (bracket balance, single `createRoot`, presence of required tokens), and (b) Will eyeballing it in a browser. TDD is reserved for the SwiftUI phase (AGENTS.md). This plan keeps **bite-sized tasks + frequent commits**, and each task's "verify" step runs the static checker below and (where visual) is confirmed in the browser.

**Task 0 creates `web/check-venue.mjs`**, a reusable checker. Every later task verifies with:

```
node web/check-venue.mjs <required-token> <required-token> ...
```

It exits non-zero (and prints the problem) if brackets are unbalanced, if `createRoot` appears != 1 time, or if any required token is missing. "Expected: PASS" below means exit code 0 with `OK` printed.

**How screens are specified:** Load-bearing logic and novel components (the checker, the data model, `FramedImage`, `ImageCropper`, the gender tally, `SwipeCard`, the swipe deck, the gender-mix step, the member-side edits) are given as **complete code**. Routine list/form screens are given as **concrete composition specs** — exact component tree, class vocabulary, and copy — because the executing agent has `web/index.html` open as the pattern source and `DESIGN.md` as the rule source. Follow those two files for any visual detail not spelled out. This is deliberate, not a placeholder.

**Design rules that are not optional** (from `DESIGN.md`): carbon black `#0A0A0A` ground, bone `#F5F1EA` text (never pure white), ice `#9FD8E8` ≤10% on actions/selection/state only, Plus Jakarta Sans one family, flat-at-rest, glass only on floating controls + tab bar, no purple/pink, no second accent, no emoji, no Inter, no Instrument Serif.

**Branch:** all work on `venue-side` (already checked out). Commit after every task. Do **not** push without Will's explicit OK.

---

## File structure

| File | Responsibility |
| --- | --- |
| `web/venue.html` | **Create.** The entire venue-side prototype: tokens, components, `App`, render. Self-contained like `index.html`. |
| `web/check-venue.mjs` | **Create.** Static checker (brackets, single `createRoot`, required tokens). |
| `web/index.html` | **Modify (twice).** Intro role-chooser door → `venue.html` (Task 2). Member-side 4-image gallery + TikTok field (Tasks 22–23). |

`venue.html` internal order mirrors `index.html`: `<head>` (fonts, Tailwind, styles) → `<body><div id="root">` → `<script type="text/babel">`: tokens/`IMG`, mock data, shared primitives (`StatusBar`, `HomeIndicator`, `Icon`, `FramedImage`, `ImageCropper`, `Toast`, `SectionHead`, `StatusPill`, `Segmented`), screens, `App`, `createRoot`.

---

## Phase 0 — Scaffold + checker

### Task 0: Static checker

**Files:**
- Create: `web/check-venue.mjs`

- [ ] **Step 1: Write the checker**

```js
// Static check for web/venue.html — brackets balanced, one createRoot, required tokens present.
// Usage: node web/check-venue.mjs <token> <token> ...
import { readFileSync } from "node:fs";
const file = "web/venue.html";
const src = readFileSync(file, "utf8");
const tokens = process.argv.slice(2);
const problems = [];

for (const [open, close] of [["{","}"],["(",")"],["[","]"]]) {
  const o = (src.match(new RegExp("\\"+open,"g")) || []).length;
  const c = (src.match(new RegExp("\\"+close,"g")) || []).length;
  if (o !== c) problems.push(`unbalanced ${open}${close}: ${o} vs ${c}`);
}
const roots = (src.match(/createRoot/g) || []).length;
if (roots !== 1) problems.push(`expected 1 createRoot, found ${roots}`);
for (const t of tokens) if (!src.includes(t)) problems.push(`missing token: ${t}`);

if (problems.length) { console.error("FAIL\n- " + problems.join("\n- ")); process.exit(1); }
console.log(`OK — ${src.split("\n").length} lines, brackets balanced, 1 createRoot, ${tokens.length} tokens present`);
```

- [ ] **Step 2: Verify it runs (and fails as expected on a missing file token)**

Run: `node web/check-venue.mjs ZZZ_DOES_NOT_EXIST`
Expected: FAIL — but first it must read `web/venue.html`, which doesn't exist yet, so it throws ENOENT. That is acceptable for this step; the checker becomes usable after Task 1 creates the file. (If you prefer, defer running until Task 1.)

- [ ] **Step 3: Commit**

```
git add web/check-venue.mjs
git commit -m "chore(venue): static checker for venue.html"
```

### Task 1: `venue.html` shell that renders

**Files:**
- Create: `web/venue.html`

- [ ] **Step 1: Create the file by copying the member-side chrome**

Copy the **entire `<head>`** (fonts, Tailwind CDN, the full `<style>` block with all CSS tokens and utility classes) and the boilerplate primitives from `web/index.html` so the design system is identical. Then add a minimal `App` placeholder. Concretely the file is:

```html
<!doctype html>
<html lang="en">
<head>
  <!-- COPY VERBATIM from web/index.html: <meta>, <title> (change to "The List · Venue"),
       Google Fonts Plus Jakarta Sans link, Tailwind CDN script, and the ENTIRE <style> block. -->
</head>
<body>
  <div id="root"></div>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script type="text/babel" data-presets="react">
    const { useState, useRef, useEffect, useMemo } = React;

    // COPY from index.html: const IMG = {...}; the Icon component + HICONS map;
    // StatusBar, HomeIndicator components. These are unchanged.

    function App(){
      return (
        <div className="min-h-screen w-full flex flex-col items-center pt-20 pb-24">
          <div className="mb-8 text-center">
            <div className="stamp" style={{color:"var(--ink-mute)"}}>The List · Venue side · Prototype v0.1</div>
            <div className="font-black text-[28px] leading-none mt-2">Venue flow</div>
          </div>
          <div className="iphone"><div className="iphone-screen">
            <StatusBar/>
            <div className="absolute inset-0 flex items-center justify-center" style={{background:"var(--bg)"}}>
              <div className="font-black font-display-l text-[40px]">Venue</div>
            </div>
            <HomeIndicator/>
          </div></div>
        </div>
      );
    }
    ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
  </script>
</body>
</html>
```

- [ ] **Step 2: Verify static check passes**

Run: `node web/check-venue.mjs "Venue side" StatusBar HomeIndicator`
Expected: PASS (`OK — N lines, brackets balanced, 1 createRoot, 3 tokens present`)

- [ ] **Step 3: Verify in browser**

Run: `python -m http.server 5555 --directory web` then open `http://127.0.0.1:5555/venue.html`. Expected: a phone frame with a "Venue" word centered, carbon background, status bar + home indicator. (Will confirms.)

- [ ] **Step 4: Commit**

```
git add web/venue.html
git commit -m "feat(venue): scaffold venue.html shell with shared design system"
```

---

## Phase 1 — Entry role split

### Task 2: Role-chooser door on the member intro

**Files:**
- Modify: `web/index.html` (the `step === 'intro'` block, after the bottom-actions `</div>` at ~line 1528)

- [ ] **Step 1: Add a business door under the two member buttons**

Inside the intro screen, immediately **after** the closing `</div>` of the `{/* Bottom actions ... */}` block (after line 1528), insert:

```jsx
        {/* Business door — venues sign in on the other side */}
        <div className="flex items-center gap-3 mt-4 anim-up" style={{opacity:.9}}>
          <div className="flex-1 h-px" style={{background:"rgba(245,241,234,.16)"}}/>
          <div className="stamp" style={{color:"rgba(245,241,234,.6)"}}>or</div>
          <div className="flex-1 h-px" style={{background:"rgba(245,241,234,.16)"}}/>
        </div>
        <button onClick={()=>{ window.location.href = "./venue.html"; }}
          className="press w-full h-[52px] rounded-full font-medium text-[12px] uppercase tracking-[.22em] anim-up mt-3"
          style={{background:"transparent", color:"#F5F1EA", border:"1px solid rgba(245,241,234,.32)"}}>
          List your venue · Business
        </button>
```

Note: this is the one allowed exception to the "no thin trailing half-hairline" rule — it is a centered "or" divider between two button groups on the splash, not a section label. Keep it.

- [ ] **Step 2: Verify in browser**

Open `http://127.0.0.1:5555/index.html`. Expected: intro splash now shows Apply / I have an invite, an "or" divider, then "List your venue · Business". Tapping it navigates to `venue.html`. (Will confirms.)

- [ ] **Step 3: Commit**

```
git add web/index.html
git commit -m "feat(venue): business door on member intro -> venue.html"
```

### Task 3: Venue splash + mocked login

**Files:**
- Modify: `web/venue.html` (replace the `App` placeholder body with an onboarding state machine; add `ScreenVenueIntro`, `ScreenVenueLogin`)

- [ ] **Step 1: Add onboarding state to `App`**

Replace the `App` placeholder with a state machine. Add at the top of `App`:

```jsx
function App(){
  const [step, setStep] = useState("intro");
  // intro | login | onboard-group | onboard-venue | done
  const [light, setLight] = useState(false);
  const [group, setGroup] = useState(null);          // {id,name,logo} | null (independent)
  const [venue, setVenue] = useState(makeVenue());   // the venue being registered
  const [events, setEvents] = useState(SEED_EVENTS); // their drops
  const [tab, setTab] = useState("events");          // events | applicants | venue
  const [toast, setToast] = useState(null);
  // ... render below routes on step/tab (filled in later tasks)
}
```

(`makeVenue`, `SEED_EVENTS` land in Task 5; for this task stub `makeVenue = () => ({})` and `SEED_EVENTS = []` temporarily at module scope, to be replaced in Task 5.)

- [ ] **Step 2: Build `ScreenVenueIntro`**

Composition spec — mirror the member intro (`index.html` `step==='intro'`) but business voice:
- Same dark splash + `StatusBar` + `HomeIndicator`. (Reuse a static grainy treatment; do **not** require the member's `IntroVideoBG` clips — use a carbon background with the existing `grain`/vignette CSS so no new assets are needed.)
- Eyebrow `stamp`: `Est. MMXXVI · Beirut`. Stacked `THE / LIST` wordmark (same style as member). Tagline: `For the rooms that matter`.
- Bottom actions: primary ice button **`List your venue`** → `setStep("login")`; ghost button **`Business login`** → `setStep("login")`.
- A small centered text link under them: **`I'm a member`** → `window.location.href="./index.html"`.

- [ ] **Step 3: Build `ScreenVenueLogin`**

Composition spec — reuse the member `phone` step's input styling (`var(--bg-elev)`, `var(--line-2)`, 48px rounded-12 inputs, `stamp` labels):
- One-word header **`Sign in`** (`font-display-l`). Sub: `Manage your venue and its drops.`
- Inputs: `Work email` and `Password` (both plain text inputs; password `type="password"`).
- Primary ice button **`Sign in`**, enabled when both fields length ≥ 3 → `setStep("onboard-group")`.
- Helper under button: `New venue? Signing in sets you up.` (mocked — any input proceeds.)

- [ ] **Step 4: Route in `App` render**

```jsx
  if (step === "intro")  return wrap(<ScreenVenueIntro onList={()=>setStep("login")} onLogin={()=>setStep("login")}/>);
  if (step === "login")  return wrap(<ScreenVenueLogin onDone={()=>setStep("onboard-group")}/>);
```

where `wrap(node)` is a small helper rendering the page chrome (theme toggle + phone frame + `<Toast msg={toast}/>`), analogous to `index.html`'s `App` return. Define `wrap` inside `App`.

- [ ] **Step 5: Verify**

Run: `node web/check-venue.mjs ScreenVenueIntro ScreenVenueLogin "List your venue" "Business login"`
Expected: PASS. Browser: splash → login → (button advances; next screen blank until Task 6). Will confirms splash + login look on-brand.

- [ ] **Step 6: Commit**

```
git add web/venue.html
git commit -m "feat(venue): splash + mocked login"
```

---

## Phase 2 — Onboarding + image cropper

### Task 4: `FramedImage` — render a cropped image from {src,scale,x,y}

**Files:**
- Modify: `web/venue.html` (add `FramedImage` near the other primitives)

- [ ] **Step 1: Add the component**

```jsx
// Renders an image cropped to a fixed aspect frame using a stored transform.
// value: { src, scale, x, y } | null. ratio: e.g. "4/5". Empty state when null.
function FramedImage({ value, ratio="4/5", className="", empty="No image" }){
  return (
    <div className={"relative overflow-hidden rounded-[14px] "+className}
         style={{aspectRatio:ratio, background:"var(--bg-elev)"}}>
      {value && value.src ? (
        <img src={value.src} alt="" draggable={false}
          style={{position:"absolute", left:"50%", top:"50%",
                  transform:`translate(-50%,-50%) translate(${value.x||0}px,${value.y||0}px) scale(${value.scale||1})`,
                  maxWidth:"none", minWidth:"100%", minHeight:"100%", userSelect:"none"}}/>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center stamp" style={{color:"var(--ink-mute)"}}>{empty}</div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run: `node web/check-venue.mjs FramedImage`
Expected: PASS.

- [ ] **Step 3: Commit**

```
git add web/venue.html
git commit -m "feat(venue): FramedImage component"
```

### Task 5: Venue-side mock data model

**Files:**
- Modify: `web/venue.html` (replace the temporary `makeVenue`/`SEED_EVENTS` stubs with the real module-scope data block)

- [ ] **Step 1: Add the data block** (module scope, after `IMG`)

```jsx
const VENUE_TYPES = ["Club","Restaurant","Beach","Lounge","Gym"];
const BEIRUT_AREAS = ["Mar Mikhael","Gemmayze","Achrafieh","Hamra","Badaro","Saifi","Manara","Jiyeh","Batroun"];

function makeVenue(over={}){ return {
  id: "venue-1", groupId: null, name: "", type: "Club", area: "Mar Mikhael",
  description: "", heroImage: null, images: [null,null,null,null], ...over,
}; }

let _evt = 0;
function makeEvent(over={}){ return {
  id: "evt-"+(++_evt), venueId: "venue-1", title: "", type: "Club", date: "", time: "",
  mix: { girls: 15, guys: 5 },   // null === no gender preference
  seats: 20, heroImage: null, exchange: "1 Story + venue tag", status: "draft", ...over,
}; }

// A couple of pre-seeded drops so the dashboard isn't empty on first load.
const SEED_EVENTS = [
  makeEvent({ title:"Pool Day", type:"Beach", date:"Sun · 25 May", time:"14:00",
              mix:{girls:15,guys:5}, seats:20, status:"live",
              heroImage:{ src: IMG.beachClub, scale:1, x:0, y:0 } }),
  makeEvent({ title:"Late Lounge", type:"Lounge", date:"Sun · 25 May", time:"22:00",
              mix:null, seats:18, status:"draft",
              heroImage:{ src: IMG.lounge, scale:1, x:0, y:0 } }),
];

// Applicants for the swipe deck (vendor-neutral; mirrors a normalized provider row).
const APPLICANTS = [
  { id:"a1", name:"Sara Capriotti", gender:"female", quality_score:0.94, photo:IMG.saraFull,
    instagram_followers:28400, tiktok_followers:51200,
    socials:{ instagram:"https://instagram.com/capriottisara", tiktok:"https://tiktok.com/@capriottisara", other:null } },
  { id:"a2", name:"Karim Haddad", gender:"male", quality_score:0.88, photo:IMG.cocktail,
    instagram_followers:14200, tiktok_followers:9800,
    socials:{ instagram:"https://instagram.com/karim", tiktok:"https://tiktok.com/@karim", other:null } },
  { id:"a3", name:"Lea Nassar", gender:"female", quality_score:0.91, photo:IMG.restaurant,
    instagram_followers:46100, tiktok_followers:120300,
    socials:{ instagram:"https://instagram.com/lea", tiktok:null, other:"https://leanassar.com" } },
  { id:"a4", name:"Tariq Bou", gender:"male", quality_score:0.79, photo:IMG.club,
    instagram_followers:8200, tiktok_followers:21000,
    socials:{ instagram:"https://instagram.com/tariq", tiktok:"https://tiktok.com/@tariq", other:null } },
  { id:"a5", name:"Nour Khoury", gender:"female", quality_score:0.86, photo:IMG.pool,
    instagram_followers:33000, tiktok_followers:5400,
    socials:{ instagram:"https://instagram.com/nour", tiktok:"https://tiktok.com/@nour", other:null } },
  { id:"a6", name:"Maya Fares", gender:"female", quality_score:0.97, photo:IMG.lounge,
    instagram_followers:88000, tiktok_followers:240000,
    socials:{ instagram:"https://instagram.com/maya", tiktok:"https://tiktok.com/@maya", other:null } },
  { id:"a7", name:"Jad Aoun", gender:"male", quality_score:0.72, photo:IMG.beachClub,
    instagram_followers:5100, tiktok_followers:3200,
    socials:{ instagram:"https://instagram.com/jad", tiktok:null, other:null } },
  { id:"a8", name:"Yara Saad", gender:"female", quality_score:0.83, photo:IMG.saraFull,
    instagram_followers:19500, tiktok_followers:42000,
    socials:{ instagram:"https://instagram.com/yara", tiktok:"https://tiktok.com/@yara", other:null } },
];

const fmtK = (n) => n>=1000 ? (n/1000).toFixed(n>=10000?0:1)+"k" : ""+n;
const quality10 = (q) => (q*10).toFixed(1);   // 0.94 -> "9.4"
```

Confirm `IMG` (copied from `index.html`) contains `saraFull, beachClub, cocktail, restaurant, club, pool, lounge`. If any key differs, use the keys actually present in `index.html`.

- [ ] **Step 2: Verify**

Run: `node web/check-venue.mjs makeVenue makeEvent APPLICANTS quality10 SEED_EVENTS`
Expected: PASS.

- [ ] **Step 3: Commit**

```
git add web/venue.html
git commit -m "feat(venue): mock data model (group/venue/event/applicants)"
```

### Task 6: `ImageCropper` — local file pick + drag/zoom to frame

**Files:**
- Modify: `web/venue.html` (add `ImageCropper`)

- [ ] **Step 1: Add the component**

```jsx
// Pick a local file, drag + zoom inside a fixed-aspect frame, return {src,scale,x,y}.
// No upload, no canvas export — the transform is reused by FramedImage everywhere.
function ImageCropper({ ratio="4/5", value, onChange, onCancel, label="Position your image" }){
  const [src, setSrc]   = useState(value?.src || null);
  const [scale, setScale] = useState(value?.scale || 1);
  const [pos, setPos]   = useState({ x: value?.x || 0, y: value?.y || 0 });
  const drag = useRef(null);
  const fileRef = useRef(null);

  const pick = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => { setSrc(r.result); setScale(1); setPos({x:0,y:0}); };
    r.readAsDataURL(f);
  };
  const onDown = (e) => { const p = e.touches?e.touches[0]:e; drag.current = { x:p.clientX-pos.x, y:p.clientY-pos.y }; };
  const onMove = (e) => { if(!drag.current) return; const p = e.touches?e.touches[0]:e;
                          setPos({ x:p.clientX-drag.current.x, y:p.clientY-drag.current.y }); };
  const onUp   = () => { drag.current = null; };

  return (
    <div className="flex flex-col gap-4">
      <div className="stamp" style={{color:"var(--ink-mute)"}}>{label}</div>
      <div className="relative overflow-hidden rounded-[14px] mx-auto w-full"
           style={{aspectRatio:ratio, background:"var(--bg-elev)", touchAction:"none"}}
           onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
           onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}>
        {src ? (
          <img src={src} alt="" draggable={false}
            style={{position:"absolute", left:"50%", top:"50%",
                    transform:`translate(-50%,-50%) translate(${pos.x}px,${pos.y}px) scale(${scale})`,
                    maxWidth:"none", minWidth:"100%", minHeight:"100%", userSelect:"none"}}/>
        ) : (
          <button onClick={()=>fileRef.current.click()}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Icon name="plus" size={28} stroke={1.4}/>
            <span className="stamp">Choose a file</span>
          </button>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={pick} style={{display:"none"}}/>
      {src && (
        <div className="flex items-center gap-3">
          <Icon name="magnifying-glass" size={16}/>
          <input type="range" min="1" max="3" step="0.01" value={scale}
                 onChange={e=>setScale(parseFloat(e.target.value))} className="flex-1"/>
          <button onClick={()=>fileRef.current.click()} className="stamp" style={{color:"var(--ice)"}}>Replace</button>
        </div>
      )}
      <div className="flex gap-3">
        <button onClick={onCancel} className="press flex-1 h-[52px] rounded-full text-[12px] uppercase tracking-[.2em]"
                style={{border:"1px solid var(--line-2)", color:"var(--ink)"}}>Cancel</button>
        <button disabled={!src} onClick={()=>onChange({ src, scale, x:pos.x, y:pos.y })}
                className="press flex-1 h-[52px] rounded-full text-[12px] uppercase tracking-[.2em]"
                style={{background: src?"var(--ice)":"var(--bg-elev2)", color: src?"var(--ice-ink)":"var(--ink-mute)"}}>
          Use this
        </button>
      </div>
    </div>
  );
}
```

(If `Icon` has no `plus` glyph in the copied `HICONS` map, add the Heroicons `plus` path — outline 24 — to the map.)

- [ ] **Step 2: Verify**

Run: `node web/check-venue.mjs ImageCropper FileReader "Use this"`
Expected: PASS. Browser smoke (optional now, fully exercised in Task 7).

- [ ] **Step 3: Commit**

```
git add web/venue.html
git commit -m "feat(venue): ImageCropper (local file + drag/zoom to frame)"
```

### Task 7: Onboarding — group step (skippable) + venue assets

**Files:**
- Modify: `web/venue.html` (add `ScreenOnboardGroup`, `ScreenOnboardVenue`; route them)

- [ ] **Step 1: `ScreenOnboardGroup`** (composition spec)

- One-word header **`Group`**. Sub: `Run more than one venue? Group them. Otherwise skip.`
- Inputs: `Group name` (text) + an optional logo via a small `ImageCropper` with `ratio="1/1"` (square), or skip the logo.
- Two actions: primary **`Create group`** → `setGroup({id:"grp-1", name, logo})` then `setStep("onboard-venue")`; ghost **`I'm independent · skip`** → `setGroup(null)` then `setStep("onboard-venue")`.

- [ ] **Step 2: `ScreenOnboardVenue`** (composition spec)

- One-word header **`Venue`**. If `group`, show a small `stamp` chip `Under {group.name}`.
- Fields (reuse member input styling): `Venue name` (text); `Type` (a pill row from `VENUE_TYPES`, single-select, selected pill = ice fill per `chip-ice`); `Area` (a pill row or simple select from `BEIRUT_AREAS`); `Description` (textarea, 3 rows).
- **Hero image:** an `ImageCropper ratio="4/5"` whose `onChange` sets `venue.heroImage`. Until set, show the cropper inline; once set, show a `FramedImage` of it + a `Replace` action that reopens the cropper.
- **Venue gallery (4 images):** a 2×2 grid of slots. Each empty slot opens an `ImageCropper ratio="4/5"` (in a bottom sheet or inline) writing into `venue.images[i]`; filled slots render `FramedImage` + tap to replace. Copy above the grid: `Four photos influencers swipe through.`
- Primary **`Save venue`** enabled when `name` and `heroImage` exist → `setVenue(...)`, `setStep("done")`, `setTab("events")`.
- Store edits immutably, e.g. `setVenue(v => ({...v, name}))`, `setVenue(v => ({...v, images: v.images.map((im,idx)=> idx===i?cropped:im)}))`.

- [ ] **Step 3: Route in `App`**

```jsx
  if (step === "onboard-group") return wrap(<ScreenOnboardGroup group={group} setGroup={setGroup} onNext={()=>setStep("onboard-venue")}/>);
  if (step === "onboard-venue") return wrap(<ScreenOnboardVenue venue={venue} setVenue={setVenue} group={group} onDone={()=>{ setStep("done"); setTab("events"); }}/>);
```

- [ ] **Step 4: Verify**

Run: `node web/check-venue.mjs ScreenOnboardGroup ScreenOnboardVenue "I'm independent" "Save venue"`
Expected: PASS. Browser: login → group (create or skip) → venue assets; pick a real local image into the hero + a gallery slot, confirm it crops and persists. (Will confirms the cropper feels right.)

- [ ] **Step 5: Commit**

```
git add web/venue.html
git commit -m "feat(venue): onboarding — optional group + venue assets w/ cropper"
```

---

## Phase 3 — Events dashboard + post-event flow

### Task 8: App shell — 3-tab bottom bar + router

**Files:**
- Modify: `web/venue.html` (add `VenueTabBar`; expand `App` render for `step==="done"`)

- [ ] **Step 1: `VenueTabBar`** (composition spec)

Copy the member `TabBar` treatment (frosted glass `blur(22px)`, ice active icon + glow, bone label, no dot, uppercase 9px labels). Three items:
- `events` — icon `calendar` — label **Events**
- `applicants` — icon `users` (add the Heroicons `users` path to `HICONS` if missing) — label **Applicants**
- `venue` — icon `building` (or `home`/`map-pin` already present) — label **Venue**

Props: `tab`, `onTab(id)`.

- [ ] **Step 2: Route the shell in `App`**

```jsx
  // step === "done": the venue app shell
  return wrap(
    <>
      {tab === "events"     && <ScreenEvents events={events} venue={venue} onPost={()=>setStep("post")} onOpenEvent={openEvent}/>}
      {tab === "applicants" && <ScreenApplicants events={events} onReview={openReview}/>}
      {tab === "venue"      && <ScreenVenueProfile venue={venue} group={group}/>}
      <VenueTabBar tab={tab} onTab={setTab}/>
    </>
  );
```

`ScreenApplicants`, `ScreenVenueProfile`, `openEvent`, `openReview`, and `step==="post"` arrive in later tasks; for this task stub the not-yet-built screens as a centered one-word placeholder so the tab bar is exercisable.

- [ ] **Step 3: Verify**

Run: `node web/check-venue.mjs VenueTabBar "step === \"done\""`
Expected: PASS. Browser: after saving the venue, the 3-tab bar shows and switches. (Will confirms.)

- [ ] **Step 4: Commit**

```
git add web/venue.html
git commit -m "feat(venue): 3-tab app shell"
```

### Task 9: Events dashboard

**Files:**
- Modify: `web/venue.html` (add `ScreenEvents`)

- [ ] **Step 1: `ScreenEvents`** (composition spec)

- One-word header **`Events`** with the masthead rule (member `SectionHead`/masthead pattern).
- A `Segmented` control (reuse member component pattern): **Live / Draft / Past**, with counts, filtering `events` by `status`.
- Each event row: a horizontal card — small `FramedImage` of `event.heroImage` (ratio 4/5, ~64px wide) + title + `type · date · time` + a `StatusPill` (ice for Live, neutral for Draft/Past) + seats meta (`{seats} seats` or `Girls {mix.girls} · Guys {mix.guys}`). Tap → `onOpenEvent(event)`.
- A prominent primary CTA pinned near the top or bottom: **`Post an event`** → `onPost()`.
- Empty state per segment (e.g. Draft empty → `No drafts`).

- [ ] **Step 2: Verify**

Run: `node web/check-venue.mjs ScreenEvents "Post an event"`
Expected: PASS. Browser: seeded Pool Day (Live) + Late Lounge (Draft) appear under the right segments. (Will confirms.)

- [ ] **Step 3: Commit**

```
git add web/venue.html
git commit -m "feat(venue): events dashboard (live/draft/past + post CTA)"
```

### Task 10: Post-event — basics step

**Files:**
- Modify: `web/venue.html` (add `ScreenPostEvent` as a multi-step flow; this task builds its `basics` sub-step + the flow scaffold)

- [ ] **Step 1: `ScreenPostEvent` scaffold + basics**

```jsx
function ScreenPostEvent({ venue, onPublish, onCancel }){
  const [sub, setSub] = useState("basics"); // basics | seats | image | review
  const [draft, setDraft] = useState(makeEvent({ venueId: venue.id, heroImage: venue.heroImage }));
  const set = (patch) => setDraft(d => ({ ...d, ...patch }));

  if (sub === "basics") {
    const ok = draft.title.length>=2 && draft.date && draft.time;
    return (
      <div className="absolute inset-0 flex flex-col px-5 pt-[64px] pb-24" style={{background:"var(--bg)"}}>
        <StatusBar/>
        <button onClick={onCancel} className="stamp text-left mb-2" style={{color:"var(--ink-mute)"}}>Cancel</button>
        <div className="font-black font-display-l text-[40px]">Post</div>
        <div className="text-[13px] mt-2" style={{color:"var(--ink-2)"}}>Step 1 of 4 · The basics</div>
        <div className="mt-6 space-y-5">
          {/* Title input, Type pill row (VENUE_TYPES), Date input, Time input — member input styling */}
        </div>
        <div className="flex-1"/>
        <button disabled={!ok} onClick={()=>setSub("seats")}
          className="press w-full h-[58px] rounded-full text-[14px] uppercase tracking-[.2em]"
          style={{background: ok?"var(--ice)":"var(--bg-elev2)", color: ok?"var(--ice-ink)":"var(--ink-mute)"}}>Next</button>
      </div>
    );
  }
  // sub === "seats" | "image" | "review" filled in Tasks 11–12
  return null;
}
```

Fill the `{/* ... */}` with: `Title` text input; `Type` pill row from `VENUE_TYPES` (selected = `chip-ice`) writing `set({type})`; `Date` text input (placeholder `Sun · 25 May`) and `Time` text input (placeholder `22:00`). Use the member 48px rounded-12 input style.

Wire into `App`: add `step==="post"` → `wrap(<ScreenPostEvent venue={venue} onCancel={()=>setStep("done")} onPublish={publishEvent}/>)`. `publishEvent` lands in Task 12.

- [ ] **Step 2: Verify**

Run: `node web/check-venue.mjs ScreenPostEvent "Step 1 of 4"`
Expected: PASS. Browser: Post CTA opens basics; Next disabled until title+date+time. (Will confirms.)

- [ ] **Step 3: Commit**

```
git add web/venue.html
git commit -m "feat(venue): post-event basics step"
```

### Task 11: Post-event — seats + gender mix step

**Files:**
- Modify: `web/venue.html` (add the `seats` sub-step inside `ScreenPostEvent`)

- [ ] **Step 1: Build the seats + mix sub-step**

Add to `ScreenPostEvent` (replace the `return null` with a branch for `sub==="seats"`):

```jsx
  if (sub === "seats") {
    const noPref = draft.mix === null;
    const total = noPref ? draft.seats : (draft.mix.girls + draft.mix.guys);
    const Stepper = ({label, val, onDelta}) => (
      <div className="flex items-center justify-between py-3">
        <div className="text-[15px]">{label}</div>
        <div className="flex items-center gap-4">
          <button onClick={()=>onDelta(-1)} className="press w-9 h-9 rounded-full" style={{border:"1px solid var(--line-2)"}}>–</button>
          <div className="font-mono text-[20px] w-8 text-center" style={{color:"var(--ice)"}}>{val}</div>
          <button onClick={()=>onDelta(1)} className="press w-9 h-9 rounded-full" style={{border:"1px solid var(--line-2)"}}>+</button>
        </div>
      </div>
    );
    return (
      <div className="absolute inset-0 flex flex-col px-5 pt-[64px] pb-24" style={{background:"var(--bg)"}}>
        <StatusBar/>
        <button onClick={()=>setSub("basics")} className="stamp text-left mb-2" style={{color:"var(--ink-mute)"}}>Back</button>
        <div className="font-black font-display-l text-[40px]">Seats</div>
        <div className="text-[13px] mt-2" style={{color:"var(--ink-2)"}}>Step 2 of 4 · Who fills the room</div>

        {/* No-preference toggle */}
        <div className="flex items-center justify-between mt-6 py-3 border-b" style={{borderColor:"var(--line)"}}>
          <div className="text-[15px]">Set a gender mix</div>
          <button onClick={()=> set({ mix: noPref ? {girls:15,guys:5} : null }) }
            className="press px-3 h-8 rounded-full text-[11px] uppercase tracking-[.18em]"
            style={{background: noPref?"transparent":"var(--ice)", color: noPref?"var(--ink)":"var(--ice-ink)",
                    border: noPref?"1px solid var(--line-2)":"none"}}>{noPref?"Off":"On"}</button>
        </div>

        {noPref ? (
          <Stepper label="Total seats" val={draft.seats} onDelta={d=> set({ seats: Math.max(1, draft.seats+d) })}/>
        ) : (
          <>
            <Stepper label="Girls" val={draft.mix.girls} onDelta={d=> set({ mix: {...draft.mix, girls: Math.max(0, draft.mix.girls+d)} })}/>
            <Stepper label="Guys"  val={draft.mix.guys}  onDelta={d=> set({ mix: {...draft.mix, guys:  Math.max(0, draft.mix.guys+d)} })}/>
          </>
        )}

        <div className="mt-4 stamp" style={{color:"var(--ink-mute)"}}>{total} seats total</div>
        <div className="flex-1"/>
        <button disabled={total<1} onClick={()=> set({ seats: total }) || setSub("image")}
          className="press w-full h-[58px] rounded-full text-[14px] uppercase tracking-[.2em]"
          style={{background: total>=1?"var(--ice)":"var(--bg-elev2)", color: total>=1?"var(--ice-ink)":"var(--ink-mute)"}}>Next</button>
      </div>
    );
  }
```

Note: when a mix is set, `seats` is kept in sync to `girls+guys` on Next (the `set({seats: total})` before advancing).

- [ ] **Step 2: Verify**

Run: `node web/check-venue.mjs "Step 2 of 4" "Set a gender mix" Stepper`
Expected: PASS. Browser: steppers adjust Girls/Guys; total updates; toggling "Set a gender mix" off switches to a single Total seats stepper. (Will confirms.)

- [ ] **Step 3: Commit**

```
git add web/venue.html
git commit -m "feat(venue): seats + soft gender-mix step"
```

### Task 12: Post-event — hero image, exchange, review, publish

**Files:**
- Modify: `web/venue.html` (add `image` + `review` sub-steps; add `publishEvent` to `App`)

- [ ] **Step 1: `image` sub-step**

`sub==="image"`: header **`Image`** / `Step 3 of 4 · The event photo`. Show an `ImageCropper ratio="4/5"` pre-loaded with `draft.heroImage` (defaults to the venue hero). `onChange` → `set({heroImage: cropped})`, then a Next button → `setSub("review")`. Copy: `Reuse your venue hero, or choose a new one.`

- [ ] **Step 2: `review` sub-step**

`sub==="review"`: header **`Review`** / `Step 4 of 4`. Show a read-only summary card:
- `FramedImage` of `draft.heroImage` (4/5).
- Title, `type · date · time`.
- Mix line: if `draft.mix` → `Girls {girls} · Guys {guys} · {seats} seats`; else → `{seats} seats · no gender preference`.
- Exchange line: `draft.exchange` (`1 Story + venue tag`) with a small note `The exchange` — editable text input optional, default locked.
- Primary **`Publish`** → `onPublish(draft)`; ghost **`Back`** → `setSub("image")`.

- [ ] **Step 3: `publishEvent` in `App`**

```jsx
  const publishEvent = (draft) => {
    setEvents(es => [{ ...draft, status: "live" }, ...es]);
    setStep("done"); setTab("events");
    showToast("Event published");
  };
```

(Add `showToast` like the member side: `setToast(msg)` + a `useRef` timer clearing after 2200ms, rendered by `<Toast/>` inside `wrap`.)

- [ ] **Step 4: Verify**

Run: `node web/check-venue.mjs "Step 3 of 4" "Step 4 of 4" publishEvent Publish`
Expected: PASS. Browser: full post flow basics→seats→image→review→Publish lands a new Live event on the Events dashboard with a toast. (Will confirms.)

- [ ] **Step 5: Commit**

```
git add web/venue.html
git commit -m "feat(venue): post-event image/review/publish"
```

---

## Phase 4 — Applicant swipe

### Task 13: `SwipeCard` component

**Files:**
- Modify: `web/venue.html` (add `SwipeCard`)

- [ ] **Step 1: Add the component**

```jsx
// One applicant card. Shows photo, name, quality 0-10, IG + TikTok, tappable socials.
function SwipeCard({ a }){
  const Social = ({label, href, icon}) => href ? (
    <a href={href} target="_blank" rel="noreferrer"
       className="press flex items-center gap-1.5 px-3 h-9 rounded-full text-[12px]"
       style={{border:"1px solid var(--line-2)", color:"var(--ink)"}}>
      <Icon name={icon} size={14}/>{label}
    </a>
  ) : null;
  return (
    <div className="relative w-full rounded-[18px] overflow-hidden" style={{aspectRatio:"4/5", background:"var(--bg-elev)"}}>
      <FramedImage value={{src:a.photo, scale:1, x:0, y:0}} ratio="4/5" className="absolute inset-0"/>
      <div className="absolute inset-x-0 bottom-0 p-4"
           style={{background:"linear-gradient(to top, rgba(5,5,5,.92), rgba(5,5,5,.0))"}}>
        <div className="flex items-end justify-between">
          <div className="font-black font-display-l text-[28px] leading-none">{a.name}</div>
          <div className="flex items-center gap-1 font-mono text-[20px]" style={{color:"var(--ice)"}}>
            {quality10(a.quality_score)}<Icon name="sparkles" size={14}/>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-3 text-[13px]">
          <span><span className="font-mono">{fmtK(a.instagram_followers)}</span> IG</span>
          <span><span className="font-mono">{fmtK(a.tiktok_followers)}</span> TikTok</span>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <Social label="Instagram" href={a.socials.instagram} icon="instagram"/>
          <Social label="TikTok" href={a.socials.tiktok} icon="tiktok"/>
          <Social label="Link" href={a.socials.other} icon="link"/>
        </div>
      </div>
    </div>
  );
}
```

Add `sparkles` and `tiktok` glyphs to `HICONS` if absent (Heroicons has no TikTok brand mark — use a simple custom inline path or reuse `musical-note`). `instagram` already exists as the member side's custom inline mark — copy it.

- [ ] **Step 2: Verify**

Run: `node web/check-venue.mjs SwipeCard quality10 fmtK`
Expected: PASS.

- [ ] **Step 3: Commit**

```
git add web/venue.html
git commit -m "feat(venue): SwipeCard (rating + IG/TikTok + socials)"
```

### Task 14: Applicants tab — list of live events

**Files:**
- Modify: `web/venue.html` (add `ScreenApplicants`)

- [ ] **Step 1: `ScreenApplicants`** (composition spec)

- One-word header **`Applicants`** + masthead rule.
- List only `events` with `status==="live"`. Each row: title + `type · date` + an applicant count (use `APPLICANTS.length` as the mock pool, or a fixed number per event) + a `StatusPill` ice `Review`. Tap → `onReview(event)`.
- Empty state when no live events: `No live drops yet — post one to start receiving applicants.`

- [ ] **Step 2: Verify**

Run: `node web/check-venue.mjs ScreenApplicants onReview`
Expected: PASS. Browser: Applicants tab lists the Live event(s). (Will confirms.)

- [ ] **Step 3: Commit**

```
git add web/venue.html
git commit -m "feat(venue): applicants tab (live events to review)"
```

### Task 15: Swipe deck + ✗/✓ + soft gender counter + Picked

**Files:**
- Modify: `web/venue.html` (add `ScreenReview`; add `openReview` + review state to `App`)

- [ ] **Step 1: Gender tally helper** (module scope)

```jsx
function tally(pickedIds, pool){
  const ids = new Set(pickedIds); let girls=0, guys=0;
  pool.forEach(a => { if (ids.has(a.id)) (a.gender==="female" ? girls++ : guys++); });
  return { girls, guys };
}
```

- [ ] **Step 2: `ScreenReview`**

```jsx
function ScreenReview({ event, pool, onClose }){
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState([]);   // applicant ids
  const t = tally(picked, pool);
  const target = event.mix;                    // {girls,guys} | null
  const done = idx >= pool.length;
  const a = pool[idx];

  const decide = (yes) => {
    if (yes && a) setPicked(p => [...p, a.id]);
    setIdx(i => i + 1);
  };

  return (
    <div className="absolute inset-0 flex flex-col px-5 pt-[64px] pb-24" style={{background:"var(--bg)"}}>
      <StatusBar/>
      <div className="flex items-center justify-between mb-3">
        <button onClick={onClose} className="stamp" style={{color:"var(--ink-mute)"}}>Close</button>
        <div className="stamp" style={{color:"var(--ink-mute)"}}>{event.title}</div>
      </div>

      {/* Soft gender counter — fills, never blocks */}
      {target ? (
        <div className="flex gap-3 mb-4 text-[12px]">
          <div className="flex-1 px-3 py-2 rounded-[12px]" style={{background:"var(--bg-elev)"}}>
            Girls <span className="font-mono" style={{color:"var(--ice)"}}>{t.girls}</span> / {target.girls}
          </div>
          <div className="flex-1 px-3 py-2 rounded-[12px]" style={{background:"var(--bg-elev)"}}>
            Guys <span className="font-mono" style={{color:"var(--ice)"}}>{t.guys}</span> / {target.guys}
          </div>
        </div>
      ) : (
        <div className="mb-4 text-[12px] px-3 py-2 rounded-[12px]" style={{background:"var(--bg-elev)"}}>
          Picked <span className="font-mono" style={{color:"var(--ice)"}}>{picked.length}</span> / {event.seats}
        </div>
      )}

      {done ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
          <div className="font-black font-display-l text-[30px]">All reviewed</div>
          <div className="text-[13px]" style={{color:"var(--ink-2)"}}>You picked {picked.length}.</div>
          <div className="w-full mt-4 space-y-2">
            {pool.filter(x=>picked.includes(x.id)).map(x => (
              <div key={x.id} className="flex items-center gap-3 px-3 py-2 rounded-[12px]" style={{background:"var(--bg-elev)"}}>
                <FramedImage value={{src:x.photo,scale:1,x:0,y:0}} ratio="1/1" className="w-10 h-10"/>
                <div className="flex-1 text-left text-[14px]">{x.name}</div>
                <div className="font-mono text-[13px]" style={{color:"var(--ice)"}}>{quality10(x.quality_score)}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 flex items-center"><SwipeCard a={a}/></div>
          <div className="flex items-center justify-center gap-8 mt-5">
            <button onClick={()=>decide(false)} className="press w-16 h-16 rounded-full flex items-center justify-center"
                    style={{border:"1px solid var(--line-2)"}}><Icon name="x" size={26}/></button>
            <button onClick={()=>decide(true)} className="press glow-primary w-16 h-16 rounded-full flex items-center justify-center"
                    style={{background:"var(--ice)", color:"var(--ice-ink)"}}><Icon name="check" size={26}/></button>
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Wire `App`**

```jsx
  const [reviewEvent, setReviewEvent] = useState(null);
  const openReview = (e) => { setReviewEvent(e); setStep("review-deck"); };
  // route:
  if (step === "review-deck") return wrap(<ScreenReview event={reviewEvent} pool={APPLICANTS} onClose={()=>{ setStep("done"); setTab("applicants"); }}/>);
```

(`openEvent` from the Events dashboard can route to the same `ScreenReview` for a Live event, or to a read-only event detail — for v1 route Live events to review and Draft to the post flow in edit mode. Minimum: `openEvent` for a Live event calls `openReview(e)`.)

- [ ] **Step 4: Verify**

Run: `node web/check-venue.mjs ScreenReview tally "All reviewed"`
Expected: PASS. Browser: Applicants → Review → swipe ✗/✓, counter ticks (Girls x/15 · Guys y/5), going over the target does **not** block, deck ends on the Picked summary. (Will confirms the swipe feel.)

- [ ] **Step 5: Commit**

```
git add web/venue.html
git commit -m "feat(venue): swipe deck + soft gender counter + picked list"
```

### Task 16: Venue tab (profile/assets)

**Files:**
- Modify: `web/venue.html` (add `ScreenVenueProfile`)

- [ ] **Step 1: `ScreenVenueProfile`** (composition spec)

- One-word header **`Venue`**.
- `FramedImage` hero (4/5) + venue `name`, `type · area`, `description`.
- A row of the 4 gallery thumbnails (`FramedImage` each).
- If `group`: a `stamp` chip `Group · {group.name}` + a stub `Switch venue` row (single venue in v1 — show it disabled/coming).
- A settings list (reuse member Settings rows): `Edit venue` (reopens onboarding-venue in edit mode or toasts), `Log out` (→ `setStep("intro")`), `Switch to member` (→ `window.location.href="./index.html"`). Placeholders may `showToast`.

- [ ] **Step 2: Verify**

Run: `node web/check-venue.mjs ScreenVenueProfile`
Expected: PASS. Browser: Venue tab shows the registered venue + images. (Will confirms.)

- [ ] **Step 3: Commit**

```
git add web/venue.html
git commit -m "feat(venue): venue tab (assets + settings)"
```

---

## Phase 5 — Wire the member side

### Task 17: Member-side event gallery (4 swipeable images)

**Files:**
- Modify: `web/index.html` (`ScreenEventDetail`, ~line 1028; `EVENTS` data, ~line 386)

- [ ] **Step 1: Give events an image array**

In `index.html`, extend each `EVENTS` entry with a `gallery` array of 3–4 image URLs (reuse existing `IMG.*` values), e.g. `gallery:[IMG.beachClub, IMG.pool, IMG.cocktail, IMG.lounge]`. Keep the existing `img` as the hero/first.

- [ ] **Step 2: Swipeable gallery in `ScreenEventDetail`**

Replace the single hero `<img>` in `ScreenEventDetail` with a horizontal swipeable strip: a scroll-snap row of full-bleed images from `event.gallery` (fallback to `[event.img]`), with small dot indicators (active dot = ice). Use CSS `scroll-snap-type:x mandatory` + `snap-center`; keep the existing scrim + floating `glass-over-image` header controls on top. Active dot tracked via `onScroll` → index.

Concrete dot row:

```jsx
<div className="flex justify-center gap-1.5 mt-2">
  {gallery.map((_,i)=>(
    <div key={i} className="h-1.5 rounded-full transition-all"
         style={{width: i===active?16:6, background: i===active?"var(--ice)":"var(--line-2)"}}/>
  ))}
</div>
```

- [ ] **Step 3: Verify**

Open `index.html`, tap an event. Expected: hero is now a horizontal swipe of 4 images with ice dot indicators; controls + scrim intact. Static sanity (member side has no checker — eyeball + the existing node bracket check pattern). (Will confirms.)

- [ ] **Step 4: Commit**

```
git add web/index.html
git commit -m "feat: member-side event detail 4-image swipeable gallery"
```

### Task 18: TikTok on the member-side profile data

**Files:**
- Modify: `web/index.html` (`SEED_PROFILE` ~line 398, `mockCreatorDataFetch` ~line 356, `ScreenProfile` ~line 1279)

- [ ] **Step 1: Add TikTok to the data shape**

Add `tiktok_followers: 51200` to both the `mockCreatorDataFetch` resolved object and `SEED_PROFILE`. Add `socials:{instagram, tiktok}` if you want the profile to show links (optional, member side primarily shows IG).

- [ ] **Step 2: Surface it on the Profile stat strip**

In `ScreenProfile`, next to the existing Followers (IG) figure, add a TikTok figure using the same `fmtK`-style formatting already in that screen: e.g. a second small stat `‹n›k TikTok` under or beside Followers. Keep the asymmetric editorial layout (Reputation hero stays the lead — do not add a third equal column; append TikTok as a small muted figure beside Followers).

- [ ] **Step 3: Verify**

Open `index.html` → Profile. Expected: TikTok follower count shows beside IG, no layout regression, no grey-text or second-accent violation. (Will confirms.)

- [ ] **Step 4: Commit**

```
git add web/index.html
git commit -m "feat: member-side profile shows TikTok followers"
```

---

## Phase 6 — Finish

### Task 19: Docs + memory

**Files:**
- Modify: `docs/agent/memory.md` (new dated entry on top), `docs/agent/plan.md` (mark venue side done/in-progress)

- [ ] **Step 1: Memory entry**

Add a `## 2026-06-06 — Venue side prototype` entry (newest on top) summarizing: new `web/venue.html`, role-split entry, group-optional onboarding, cropper, post-event with soft gender mix, swipe + counter + picked, member-side gallery + TikTok. Note it's mocked, on branch `venue-side`, not pushed.

- [ ] **Step 2: Plan update**

In `docs/agent/plan.md`, move venue side from "out of scope" framing to a `[done]`/`[doing]` line as appropriate, and note the member side now has the gallery + TikTok.

- [ ] **Step 3: Commit**

```
git add docs/agent/memory.md docs/agent/plan.md
git commit -m "docs: record venue-side prototype"
```

### Task 20: Full walkthrough + branch decision

- [ ] **Step 1: End-to-end browser pass** (Will drives)

Serve `web/` and walk: `index.html` intro → Business → `venue.html` splash → login → group (create + skip both tried) → venue assets (real image cropped) → Events → Post (basics → mix → image → review → publish) → Applicants → Review (swipe, counter, picked) → Venue tab. Then `index.html` event gallery + Profile TikTok. Note any friction.

- [ ] **Step 2: Final static check**

Run: `node web/check-venue.mjs ScreenVenueIntro ScreenOnboardVenue ScreenEvents ScreenPostEvent ScreenReview SwipeCard VenueTabBar`
Expected: PASS.

- [ ] **Step 3: Stop — ask Will** whether to merge `venue-side` → `main` (and whether to push). Do not merge or push without explicit OK (standing rule).

---

## Self-review (author check against the spec)

- **Spec coverage:** role split (T2–T3) ✓; group-optional onboarding (T7) ✓; venue assets + hero + 4 images (T7) ✓; image crop-to-frame (T4, T6) ✓; events dashboard (T9) ✓; post event (T10–T12) ✓; seats + soft gender mix incl. no-preference (T11) ✓; applicant swipe + ✗/✓ (T13–T15) ✓; quality 0–10 + IG + TikTok + social links (T13) ✓; soft live counter (T15) ✓; picked list (T15) ✓; venue tab/switcher stub (T16) ✓; member-side 4-image gallery (T17) ✓; TikTok on member profile (T18) ✓; data-model additions gender/tiktok/socials + entities (T5) ✓; mocked auth/storage/provider (throughout) ✓; design-system reuse + one new component SwipeCard (T13) ✓.
- **Placeholder scan:** screen "composition specs" are intentional and concrete (component tree + classes + copy), backed by `index.html` as the live pattern source — stated up front, not vague TODOs. Load-bearing logic is fully coded.
- **Type consistency:** `makeEvent` uses `mix:{girls,guys}|null` and `seats`; `tally()` reads `a.gender`/`a.id`; `SwipeCard` reads `quality_score`,`instagram_followers`,`tiktok_followers`,`socials.{instagram,tiktok,other}`,`photo`,`name` — all match the `APPLICANTS` shape in T5. `FramedImage`/`ImageCropper` exchange `{src,scale,x,y}`, consistent across hero, gallery, and `heroImage`. `step`/`tab`/`sub` state names consistent across `App` and screens.
