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
  ['publish', 'persistEvent(draft, null, true)', 'events', 'Event published'],
  ['draft', 'persistEvent(draft, null, false)', 'events', 'Draft saved'],
  ['edit', 'persistEvent(draft, "event", true)', 'events', 'Event published'],
  ['venue', 'saveVenue(draft)', 'venue', 'Venue saved'],
  ['rpc', 'runRpc("pick_applicant", {p_app:"application"})', 'desk', 'Change saved'],
];

for (const [name, action, expectedTab, savedMessage] of cases) {
  for (const failure of ['refresh', 'write-result', 'write-throw']) {
    const state = {
      step:name === 'venue' ? 'onboard-venue' : 'post', tab:'desk', editing:'draft',
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
