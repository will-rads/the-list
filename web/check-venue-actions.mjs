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

// Execute the shipped functions with network, media, and React state replaced.
const handlers = between('  function eventStart', '  function ScreenNoVenue')
  + between('    const refreshAfterMutation', '    const markNotificationsRead')
  + between('    const saveVenue = async', '    useEffect(() => {')
  + between('    const persistEvent = async', '    const publishEvent');

const cases = [
  ['publish', 'persistEvent(draft, null, true)', 'events', 'Event posted'],
  ['draft', 'persistEvent(draft, null, false)', 'events', 'Saved for later'],
  ['edit', 'persistEvent(draft, "event", true)', 'events', 'Event posted'],
  ['venue', 'saveVenue(draft)', 'venue', 'Venue saved'],
  ['rpc', 'runRpc("pick_applicant", {p_app:"application"})', 'home', 'Change saved'],
];

for (const [name, action, expectedTab, savedMessage] of cases) {
  for (const failure of ['refresh', 'write-result', 'write-throw']) {
    const state = {
      step:name === 'venue' ? 'onboard-venue' : 'post', tab:'home', editing:'draft',
      notice:null, messages:[], writes:0, reads:0, uploads:0, refreshFails:true,
    };
    const write = async () => {
      state.writes++;
      if (failure === 'write-throw') throw new Error('Connection failed');
      return {data:'event', error:failure === 'write-result' ? new Error('Write rejected') : null};
    };
    const context = vm.createContext({
      session:{user:{id:'owner'}}, venue:{heroImage:null},
      draft:{id:'venue', title:'Test event', name:'Test venue', date:'2030-05-25',
        time:'20:00', closesAt:'24h before doors', seats:20, images:[], heroImage:null},
      supabaseClient:{rpc:write, from:() => ({update:() => ({eq:write})})},
      uploadCroppedMedia:async () => { state.uploads++; return null; },
      hydrateVenue:async () => {
        state.reads++;
        if (state.refreshFails) throw new Error('Refresh failed');
        return true;
      },
      setStep:value => { state.step = value; },
      setTab:value => { state.tab = value; },
      setEditingDraft:value => { state.editing = value; },
      setSyncNotice:value => { state.notice = value; },
      showToast:message => state.messages.push(message),
      plainError:(error, fallback) => fallback,
    });
    vm.runInContext(handlers, context);
    const label = `${name}: ${failure}`;
    if (failure === 'refresh') {
      await vm.runInContext(action, context);
      assert.equal(state.notice, savedMessage, `${label}: report the committed write`);
      assert.equal(state.tab, expectedTab, label);
      if (name !== 'rpc') assert.equal(state.step, 'done', `${label}: close the save form`);
      if (['publish', 'draft', 'edit'].includes(name)) assert.equal(state.editing, null, label);
      assert.equal(state.reads, 1, label);
      const uploads = state.uploads;
      // The banner retries only the read, even if it fails again.
      await vm.runInContext('refreshAfterMutation("Saved")', context);
      state.refreshFails = false;
      await vm.runInContext('refreshAfterMutation("Saved")', context);
      assert.equal(state.reads, 3, label);
      assert.equal(state.notice, null, `${label}: successful retry clears the banner`);
      assert.equal(state.uploads, uploads, `${label}: retry must not upload media again`);
    } else {
      await assert.rejects(vm.runInContext(action, context));
      assert.equal(state.step, name === 'venue' ? 'onboard-venue' : 'post', label);
      assert.equal(state.notice, null, `${label}: never claim a rejected write was saved`);
      assert.equal(state.reads, 0, label);
    }
    assert.equal(state.writes, 1, `${label}: never repeat the write during refresh`);
  }
}
console.log('PASS venue actions: 15 write/refresh failure cases, including read-only retries.');

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
console.log('PASS venue rules: separate counts, replacements, past-midnight events, same-day close times, Home order.');
