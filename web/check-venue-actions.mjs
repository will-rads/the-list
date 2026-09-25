// Run with node web/check-venue-actions.mjs. No requests reach Supabase.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const source = readFileSync(new URL('./v3/venue.jsx', import.meta.url), 'utf8');
function between(start, end) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);
  assert.ok(from >= 0 && to > from, `Venue handler markers changed: ${start}`);
  return source.slice(from, to);
}

// Execute the shipped functions with network, media, and React state replaced. The refresh ordering
// (hydrateVenue, refreshAfterMutation, committed, logout) is the real code; only loadVenue's reads are faked.
const handlers = between('  // Event stages', '  function makeGuest')
  + between('  function toLocalDate', '  function ScreenNoVenue')
  + between('    const hydrateVenue = async', '    const loadVenue = async')
  + between('    const refreshAfterMutation', '    const markNotificationsRead')
  + between('    const logout = async', '    useEffect(() => { document')
  + between('    const writeGuest = ', '    // One wrapper')
  + between('    const saveLocally = ', '    const publishEvent');

const clone = value => JSON.parse(JSON.stringify(value ?? null));
const tick = () => new Promise(resolve => setImmediate(resolve));

// One venue app. `manual` loads wait until the test settles them, in any order it likes.
function makeApp({ live = true, manual = false, write, server = null } = {}) {
  // The fake server applies a check-in or pick the moment its write succeeds.
  const state = { step:'post', tab:'home', editing:'draft', notice:null, messages:[], writes:0, reads:0, uploads:0,
    refreshFails:true, events:clone(server) || [], venue:null, server, landed:[] };
  const loads = [];
  const refs = { hydrateStarted:{current:0}, hydrateFloor:{current:0}, hydrateLanded:{current:0}, epoch:{current:0} };
  const writeOk = async (name, args) => {
    state.writes++;
    const g = state.server?.flatMap(e => e.guests || []).find(row => row.applicantId === args?.p_app);
    if (g && name === 'check_in') g.state = 'checked_in';
    return {data:'event', error:null};
  };
  const context = vm.createContext({
    ...refs, renderEpoch:0, shown:false, DEMO_PREVIEW:false, SEED_EVENTS:[{id:'seed'}], demoTimers:{current:{}},
    setTimeout:() => 0, clearTimeout() {}, makeVenue:() => ({id:'blank'}),
    session: live ? {user:{id:'owner'}} : null, venue:{heroImage:null},
    draft:{id:'venue', title:'Test event', name:'Test venue', date:'2030-05-25',
      time:'20:00', closesAt:'24h before doors', seats:20, images:[], heroImage:null},
    supabaseClient:{ rpc:write || writeOk, from:() => ({update:() => ({eq:write || writeOk})}), auth:{signOut:async () => {}} },
    uploadCroppedMedia:async () => { state.uploads++; return null; },
    // A load answers with the server as it was when the load started, like a real slow request.
    loadVenue:(uid, replace, seq, stale) => {
      state.reads++;
      const snapshot = clone(state.server);
      const land = () => {
        if (stale()) return null;
        refs.hydrateLanded.current = seq; state.landed.push(seq); state.notice = null;
        if (snapshot) state.events = snapshot;
        return true;
      };
      if (manual) return new Promise((resolve, reject) => loads.push({ seq,
        ok:async () => { resolve(land()); await tick(); }, fail:async () => { reject(new Error('Refresh failed')); await tick(); } }));
      return state.refreshFails ? Promise.reject(new Error('Refresh failed')) : Promise.resolve(land());
    },
    setStep:value => { state.step = value; }, setTab:value => { state.tab = value; },
    setEditingDraft:value => { state.editing = value; }, setSyncNotice:value => { state.notice = value; },
    setEvents:change => { state.events = typeof change === 'function' ? change(state.events) : change; },
    setVenue:value => { state.venue = value; }, setSession() {}, setRoleMismatch() {}, setNotifications() {}, setFocusId() {},
    showToast:message => state.messages.push(message),
    plainError:(error, fallback) => fallback,
  });
  vm.runInContext(handlers, context);
  const run = code => vm.runInContext(code, context);
  const guest = (eventId, id) => clone(state.events.find(e => e.id === eventId)?.guests.find(g => g.applicantId === id));
  return { state, context, loads, refs, run, guest };
}

const cases = [
  ['publish', 'persistEvent(draft, null, true)', 'events', 'Event posted'],
  ['draft', 'persistEvent(draft, null, false)', 'events', 'Saved for later'],
  ['edit', 'persistEvent(draft, "event", true)', 'events', 'Event posted'],
  ['venue', 'saveVenue(draft)', 'venue', 'Venue saved'],
  ['rpc', 'runRpc("pick_applicant", {p_app:"application"}, () => { shown = true; })', 'home', 'Change saved'],
];

for (const [name, action, expectedTab, savedMessage] of cases) {
  for (const failure of ['refresh', 'write-result', 'write-throw']) {
    let app;
    const write = async () => {
      app.state.writes++;
      if (failure === 'write-throw') throw new Error('Connection failed');
      return {data:'event', error:failure === 'write-result' ? new Error('Write rejected') : null};
    };
    app = makeApp({ write });
    const { state, context } = app;
    if (name === 'venue') state.step = 'onboard-venue';
    const label = `${name}: ${failure}`;
    if (failure === 'refresh') {
      await app.run(action);
      assert.equal(state.notice, savedMessage, `${label}: report the committed write`);
      assert.equal(state.tab, expectedTab, label);
      if (name !== 'rpc') assert.equal(state.step, 'done', `${label}: close the save form`);
      if (['publish', 'draft', 'edit'].includes(name)) assert.equal(state.editing, null, label);
      assert.equal(state.reads, 1, label);
      // The committed change stays on screen, so nobody repeats it.
      if (name === 'rpc') assert.equal(context.shown, true, `${label}: show the saved change locally`);
      else if (name === 'venue') assert.equal(state.venue?.name, 'Test venue', `${label}: show the saved venue`);
      else assert.deepEqual(clone(state.events.map(e => [e.id, e.stage])), [['event', name === 'draft' ? 'draft' : 'open']],
        `${label}: show the saved event instead of inviting a duplicate post`);
      assert.equal(app.refs.hydrateFloor.current, 1, `${label}: refreshes started before the write can't land`);
      const uploads = state.uploads;
      // The banner retries only the read, even if it fails again.
      await app.run('refreshAfterMutation("Saved")');
      state.refreshFails = false;
      await app.run('refreshAfterMutation("Saved")');
      assert.equal(state.reads, 3, label);
      assert.equal(state.notice, null, `${label}: successful retry clears the banner`);
      assert.equal(state.uploads, uploads, `${label}: retry must not upload media again`);
    } else {
      await assert.rejects(app.run(action));
      assert.equal(state.step, name === 'venue' ? 'onboard-venue' : 'post', label);
      assert.equal(state.notice, null, `${label}: never claim a rejected write was saved`);
      assert.equal(state.reads, 0, label);
      assert.ok(!context.shown && !state.events.length && !state.venue, `${label}: a rejected write shows nothing`);
      assert.equal(app.refs.hydrateFloor.current, 0, `${label}: a rejected write leaves polls alone`);
    }
    assert.equal(state.writes, 1, `${label}: never repeat the write during refresh`);
  }
}
console.log('PASS venue actions: 15 write/refresh failure cases, local fallbacks, read-only retries.');

// ---- Requests finishing out of order ----
const door = () => [{ id:'e', title:'E', stage:'locked', seats:4, guests:[
  { applicantId:'a', state:'confirmed', code:'LST-A' }, { applicantId:'b', state:'confirmed', code:'LST-B' }] }];
const bothIn = () => door().map(e => ({ ...e, guests:e.guests.map(g => ({ ...g, state:'checked_in' })) }));
async function twoCheckIns(order) {
  const app = makeApp({ manual:true, server:door() });
  const A = app.run('act.checkIn("e", "a")'); await tick();
  const B = app.run('act.checkIn("e", "b")'); await tick();
  assert.deepEqual(app.loads.map(l => l.seq), [1, 2], 'each save starts its own refresh');
  for (const settle of order(app.loads)) await settle();
  await Promise.all([A, B]);
  return app;
}
{ // Newer refresh lands first, then the older one fails: the late failure changes nothing.
  const app = await twoCheckIns(([a, b]) => [b.ok, a.fail]);
  assert.equal(app.state.notice, null, 'a late failure must not raise the banner over newer data');
  assert.deepEqual(app.state.landed, [2]);
  assert.equal(app.guest('e', 'a').state, 'checked_in');
}
{ // Older refresh answers first but a write happened since, so it can't land; the newer one fails.
  const app = await twoCheckIns(([a, b]) => [a.ok, b.fail]);
  assert.deepEqual(app.state.landed, [], 'a refresh that started before the second write must not land');
  assert.equal(app.state.notice, 'Change saved', 'the banner says updates are delayed');
  assert.equal(app.guest('e', 'a').state, 'checked_in', 'first save still shows');
  assert.equal(app.guest('e', 'b').state, 'checked_in', 'second save still shows');
}
{ // Older fails first (local fallback), newer lands after: server truth wins and the banner clears.
  const app = await twoCheckIns(([a, b]) => [a.fail, b.ok]);
  assert.deepEqual(app.state.landed, [2]);
  assert.equal(app.state.notice, null, 'the newer refresh clears the banner');
  assert.deepEqual(clone(app.state.events), bothIn());
}
{ // A poll that started before a save answers after the save's refresh: its old data is dropped.
  const app = makeApp({ manual:true, server:door() });
  const poll = app.run('hydrateVenue("owner")'); await tick();   // carries the old server
  const save = app.run('act.checkIn("e", "a")'); await tick();
  await app.loads[1].ok(); await save;
  await app.loads[0].ok();
  assert.equal(await poll, null, 'the old poll reports stale');
  assert.equal(app.guest('e', 'a').state, 'checked_in', 'old poll data never replaces newer data');
}
{ // Logout while a boot load and a save's refresh are still running: nothing from the old session lands.
  const app = makeApp({ manual:true, server:door() });
  app.state.step = 'done';
  const boot = app.run('hydrateVenue("owner")'); await tick();
  const save = app.run('act.checkIn("e", "a")'); await tick();
  await app.run('logout()');
  await app.loads[0].ok(); await app.loads[1].fail();
  assert.equal(await boot, null, 'a boot load finishing after logout reports stale, so it never opens Home');
  await save;
  assert.equal(app.state.step, 'intro');
  assert.deepEqual(clone(app.state.events), [{id:'seed'}], 'no old venue data after logout');
  assert.equal(app.state.notice, null, 'no banner for the old session');
  assert.deepEqual(app.state.landed, []);
  app.context.renderEpoch = app.refs.epoch.current; // the next render belongs to the new session
  const next = app.run('hydrateVenue("owner")'); await tick();   // the next session's load still works
  await app.loads[2].ok();
  assert.equal(await next, true);
}
{ // A failed load that finishes after logout is swallowed, not reported as a login error.
  const app = makeApp({ manual:true });
  const boot = app.run('hydrateVenue("owner")'); await tick();
  await app.run('logout()');
  await app.loads[0].fail();
  assert.equal(await boot, null);
}
console.log('PASS venue ordering: overlapping saves, late failures, stale polls, logout mid-load, all out of order.');

// A write (not just its refresh) can still be waiting when the owner signs out.
for (const action of ['act.checkIn("e", "a")', 'persistEvent(draft, "e", true)', 'saveVenue(draft)']) {
  let finish;
  const app = makeApp({ manual:true, server:door(), write:() => new Promise(resolve => { finish = resolve; }) });
  const save = app.run(action); await tick();
  assert.ok(finish, 'write reached the server');
  await app.run('logout()');
  finish({data:'e', error:null}); await save;
  assert.equal(app.loads.length, 0, `${action}: old save must not start a new load`);
  assert.equal(app.state.step, 'intro');
  assert.equal(app.state.notice, null);
  assert.deepEqual(clone(app.state.events), [{id:'seed'}]);
  assert.deepEqual(app.state.messages, []);
}

// Two successful edits, then reverse-order failed refreshes: never replay the older edit.
{
  const app = makeApp({ manual:true, server:door() });
  const first = app.run('persistEvent({...draft, title:"First"}, "e", true)'); await tick();
  const second = app.run('persistEvent({...draft, title:"Second"}, "e", true)'); await tick();
  assert.equal(app.state.events[0].title, 'Second');
  await app.loads[1].fail(); await second;
  await app.loads[0].fail(); await first;
  assert.equal(app.state.events[0].title, 'Second', 'late failure must not replay First');
  assert.equal(app.guest('e', 'a').state, 'confirmed');
}
console.log('PASS venue committed writes: saves pending at logout are dropped; late failures never replay older edits.');

// ---- Local fallbacks never invent data ----
for (const live of [true, false]) {
  const app = makeApp({ live, server:[{ id:'e', title:'Old', stage:'open', seats:20, date:'2030-05-25', time:'20:00',
    closesAt:'24h before doors', guests:[{ applicantId:'x', state:'confirmed', code:'LST-X' }, { applicantId:'y', state:'applied' }] }] });
  // The form opened earlier, when x had only applied.
  app.context.editDraft = { ...clone(app.state.events[0]), title:' New ', seats:30, guests:[{ applicantId:'x', state:'applied' }] };
  await app.run('persistEvent(editDraft, "e", true)');
  const e = app.state.events[0];
  assert.equal(e.title, 'New'); assert.equal(e.seats, 30, 'the edit applies');
  assert.equal(app.guest('e', 'x').state, 'confirmed', `${live ? 'live' : 'demo'} edit keeps current guests, not the form's old copy`);
  assert.equal(e.guests.length, 2);
  assert.equal(e.stage, 'open');
}
{
  const app = makeApp({ server:door().map(e => ({ ...e, guests:[{ applicantId:'w', state:'waitlist', code:null }] })) });
  await app.run('act.pick("e", "w")');
  assert.deepEqual(app.guest('e', 'w'), { applicantId:'w', state:'picked', code:null }, 'live never invents a pass code');
  const demo = makeApp({ live:false, server:door().map(e => ({ ...e, guests:[{ applicantId:'w1', state:'waitlist', code:null }] })) });
  await demo.run('act.pick("e", "w1")');
  assert.match(demo.guest('e', 'w1').code, /^LST-/, 'demo still makes a code');
}
console.log('PASS venue local fallbacks: edits keep current guests; live picks have no invented pass code.');

// Pure venue rules: three separate counts, replacements, events past midnight, same-day close times.
const rules = between('  // Event stages', '  function makeGuest')
  + between('  /* ========== plain words and counts', '  /* ========== Activity')
  + between('  function toLocalDate', '  function ScreenNoVenue');
const ctx = vm.createContext({ HOUR:3600000, DEMO_PREVIEW:false, dayLabel:d => d.toDateString(),
  localStorage:{ getItem:() => null, setItem() {} } });
vm.runInContext(rules, ctx);
const run = code => vm.runInContext(code, ctx);
run(`var locked = { id:"x", title:"X", stage:STAGE.locked, seats:4, guests:[
  {applicantId:"1", state:"picked"}, {applicantId:"2", state:"confirmed"}, {applicantId:"3", state:"checked_in"},
  {applicantId:"4", state:"expired", code:"LST-1"}, {applicantId:"5", state:"cancelled", code:null},
  {applicantId:"6", state:"waitlist"}] }`);
const t = run('tally(locked)');
assert.deepEqual([t.picked, t.awaiting, t.yes, t.coming, t.dropped, t.waiting], [3, 1, 2, 2, 1, 1], 'picked, awaiting and confirmed must stay separate');
assert.equal(run('needsReplacement(locked, tally(locked))'), true, 'an expired pick with a free seat needs a replacement');
run(`var late = { id:"l", title:"L", stage:STAGE.locked, startsAt:new Date(Date.now() - 2*HOUR).toISOString(), guests:[] }`);
run(`var old = { id:"o", title:"O", stage:STAGE.locked, startsAt:new Date(Date.now() - 30*HOUR).toISOString(), guests:[] }`);
assert.equal(run('dayOf(late, "", true)'), 'today', 'an event that started 2 hours ago is still today');
assert.equal(run('dayOf(old, "", true)'), 'over', 'an unclosed event from yesterday needs closing');
assert.equal(run('eventCloses({closesAt:"2h before doors"}, new Date(2030, 0, 1, 22)).getHours()'), 20);
run(`var open = { id:"p", title:"P", stage:STAGE.open, seats:2, startsAt:new Date(Date.now() + 72*HOUR).toISOString(),
  guests:[{applicantId:"9", state:"applied"}] }`);
assert.deepEqual([...run('homeTasks([open, locked, late], "", true).map(task => task.go)')], ['door', 'deck', 'event', 'deck'],
  'Home order: door, replacement, awaiting confirmation, picking');
run(`var tonight = { id:"t", title:"T", stage:STAGE.open, seats:2, startsAt:new Date(Date.now() + HOUR).toISOString(),
  guests:[{applicantId:"8", state:"applied"}] }`);
assert.deepEqual([...run('homeTasks([tonight], "", true).map(task => task.go)')], ['door', 'deck'],
  'an event later today keeps its picking card next to the door card');

// A closed list with empty seats can still pick from the waitlist; a full one can't.
run(`var closed = { id:"c", title:"C", stage:STAGE.locked, seats:4, startsAt:new Date(Date.now() + 72*HOUR).toISOString(), guests:[
  {applicantId:"a", state:"confirmed"}, {applicantId:"b", state:"picked"}, {applicantId:"w", state:"waitlist"}] }`);
assert.equal(run('canPickMore(closed, tally(closed))'), true, 'a closed list with 2 empty seats can pick');
assert.equal(run('needsReplacement(closed, tally(closed))'), false, 'no one dropped out, so it is not a replacement');
assert.deepEqual([...run('homeTasks([closed], "", true).map(task => task.go)')], ['event', 'deck'], 'Home offers picking for empty seats');
assert.match(run('homeTasks([closed], "", true)[1].text'), /2 seats are still empty/);
run(`var full = { ...closed, seats:2 }`);
assert.equal(run('canPickMore(full, tally(full))'), false, 'a full closed list offers no picking');

// A Story that needs review keeps its Home card after the bill is paid.
run(`var paid = { id:"d", title:"D", stage:STAGE.past, invoice:{status:"paid"}, guests:[
  {applicantId:"s1", state:"checked_in", story:SS.verified}, {applicantId:"s2", state:"checked_in", story:SS.needsReview}] }`);
assert.deepEqual([...run('homeTasks([paid], "", true).map(task => task.go)')], ['summary'], 'needs review stays on Home after payment');
run(`paid.guests[1].story = SS.verified`);
assert.deepEqual([...run('homeTasks([paid], "", true)')], [], 'all verified and paid: nothing left to do');
console.log('PASS venue rules: separate counts, replacements, past-midnight events, same-day close times, Home order, closed-list picking, needs review after payment.');
