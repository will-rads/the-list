// Run with node web/check-actions.mjs. No requests reach Supabase.
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import vm from "node:vm";
import { memberScore } from "./v3/score.js";

const source = readFileSync(new URL("./v3/member.jsx", import.meta.url), "utf8");
function between(start, end) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);
  assert.ok(from >= 0 && to > from, `Member handler markers changed: ${start}`);
  return source.slice(from, to);
}

// One score formula for the Profile, the venue cards and both demos.
const sara = {attended:17, no_shows:1, stories_verified:16, stories_missed:1, avg_rating:9.2};
assert.equal(memberScore({}).score, null, "no data, no score");
assert.equal(memberScore(null).score, null, "no record, no score");
assert.equal(memberScore(sara).score, 9.4, "Sara: 94% show up, 94% Stories, 9.2 rating");
assert.equal(memberScore({no_shows:2}).score, 0, "only no-shows is a real zero, not missing data");
assert.equal(memberScore({avg_rating:"6.0"}).score, 6, "a rating alone counts, even as text");
assert.ok(!/profile\??\.reputation|rpc\("member_record"/.test(source), "the Profile reads member_records, never the old reputation counter");
console.log("PASS member score: empty, Sara 9.4, only no-shows 0, rating alone, null record.");

// Exercise the shipped handlers, with only their external dependencies replaced.
const states = between("const GS =", "// Member-facing copy");
const handlers = between("  const onApply = async", "  // forceVerdict")
  + between("  const onConfirmPick = async", "  const showToast");
const support = states
  + between("  const refreshAfterMutation = async", "  // The score's counts");
const refs = () => ({ hydrateStarted:{current:0}, hydrateFloor:{current:0}, hydrateLanded:{current:0}, epoch:{current:0} });
const cases = [
  ["onApply", "applied"],
  ["onCancelApplication", "withdrawn"],
  ["onConfirmPick", "confirmed"],
  ["onDeclinePick", "declined"],
];

for (const [name, savedState] of cases) {
  for (const failure of ["refresh", "rpc-result", "rpc-throw", ...(name === "onApply" ? ["refresh-after-navigation"] : [])]) {
    const state = {
      apply: "idle", rows: [{eventId:"event", applicationId:"application", state:"picked"}],
      notice: null, screen: "picked", messages: [], writes: 0, reads: 0, busy: [],
    };
    const context = vm.createContext({
      ...refs(), renderEpoch: 0,
      session: {user:{id:"member"}}, activeEvent: {id:"event"}, applyState: "idle",
      currentEventRef: {current:{id:"event"}},
      pickedEventId: "event", tab: "home", myEvents: state.rows,
      pickActionRef: {current:false},
      supabaseClient: {rpc: async () => {
        state.writes++;
        if (failure === "rpc-throw") throw new Error("Connection failed");
        return {data:"applied", error:failure === "rpc-result" ? new Error("Request rejected") : null};
      }},
      hydrateMember: async () => {
        state.reads++;
        if (failure === "refresh-after-navigation") {
          context.currentEventRef.current = {id:"another-event"};
          state.apply = "idle"; // Selecting a different event resets that screen's action.
        }
        throw new Error("Refresh failed");
      },
      setSyncNotice: value => { state.notice = value; },
      setApplyState: value => { state.apply = value; state.busy.push(value); },
      setMyEvents: update => { state.rows = update(state.rows); },
      showToast: message => state.messages.push(message),
      setPickedEventId: () => {}, setTab: () => {},
      setScreen: value => { state.screen = value; },
    });
    const argument = name === "onCancelApplication"
      ? "({eventId:'event', applicationId:'application'})" : "()";
    const action = name + argument;
    await vm.runInContext(support + handlers + (name.includes("Pick") ? `Promise.all([${action}, ${action}])` : action), context);
    const label = `${name}: ${failure}`;
    assert.equal(state.writes, 1, label);
    assert.equal(context.pickActionRef.current, false, `${label}: release action guard`);
    assert.ok(state.messages.length, `${label}: explain the outcome`);
    assert.notEqual(state.apply, "submitting", `${label}: leave the busy state`);
    if (name === "onApply") assert.equal(state.busy[0], "submitting", label);

    if (failure.startsWith("refresh")) {
      assert.equal(state.rows[0].state, savedState, `${label}: keep accepted mutation`);
      assert.ok(state.notice, `${label}: expose retry instead of reporting a failed mutation`);
      assert.equal(state.reads, 1, label);
      assert.equal(context.hydrateFloor.current, 1, `${label}: reloads started before the write can't land`);
      if (name === "onApply") assert.equal(state.apply, failure === "refresh-after-navigation" ? "idle" : "submitted", `${label}: late result cannot mark another event as applied`);
      if (name === "onConfirmPick") assert.equal(state.screen, "mylist", label);
      if (name === "onDeclinePick") assert.equal(state.screen, "home", label);
      // Retry the failed read; never submit the mutation twice.
      await vm.runInContext("refreshAfterMutation('Saved')", context);
      assert.equal(state.writes, 1, `${label}: retry must not write again`);
      assert.equal(state.reads, 2, `${label}: retry requests fresh state`);
    } else {
      assert.equal(state.rows[0].state, "picked", `${label}: rejected mutation leaves data alone`);
      assert.equal(state.notice, null, `${label}: never claim a rejected mutation was saved`);
      assert.equal(state.reads, 0, label);
      assert.equal(context.hydrateFloor.current, 0, `${label}: a rejected write leaves reloads alone`);
      assert.equal(state.apply, "idle", label);
      assert.equal(state.screen, "picked", `${label}: allow retrying the action`);
    }
  }
}

const demoState = {rows:[{eventId:"event", state:"applied"}], notifs:[], cleared:[]};
const demo = vm.createContext({
  session:null, events:[{id:"event", title:"Demo room"}],
  eventById:(id, events)=>events.find(event=>event.id===id),
  myEventsRef:{current:demoState.rows}, pickTimersRef:{current:{event:42}},
  clearTimeout:id=>demoState.cleared.push(id),
  setMyEvents:update=>{demoState.rows=typeof update === "function" ? update(demoState.rows) : update;},
  setNotifs:update=>{demoState.notifs=update(demoState.notifs);},
  setApplyState:()=>{}, showToast:()=>{},
});
vm.runInContext(states + handlers
  + between("  function simulatePick", "  const onApply"), demo);
await vm.runInContext("onCancelApplication({eventId:'event'})", demo);
assert.ok(demoState.cleared.includes(42), "Demo cancellation clears the delayed pick timer");
assert.equal(demo.pickTimersRef.current.event, undefined);
assert.equal(vm.runInContext("simulatePick('event')", demo), false, "A stale callback cannot resurrect a cancelled application");
assert.equal(demoState.rows.length, 0);
assert.equal(demoState.notifs.length, 0, "Cancelled application gets no phantom pick notifications");
for (const state of ["declined", "confirmed", "withdrawn"]) {
  demo.myEventsRef.current = [{eventId:"event", state}];
  assert.equal(vm.runInContext("simulatePick('event')", demo), false, `${state} cannot be picked again`);
  assert.equal(demoState.notifs.length, 0);
}
demo.myEventsRef.current = [{eventId:"event", state:"applied"}];
assert.equal(vm.runInContext("simulatePick('event')", demo), true, "Applied demo member can still be picked");
assert.equal(demoState.rows[0].state, "picked");
assert.equal(demoState.notifs.length, 2);
assert.equal(vm.runInContext("simulatePick('event')", demo), false, "A second pick must not duplicate notifications");
assert.equal(demoState.notifs.length, 2);
console.log("PASS member actions: 13 failure/navigation cases, guarded duplicate requests, read-only retries, and demo cancellation/pick regression.");

// ---- Reloads, saves and the record load finishing out of order ----
// The real reload numbering, refresh, logout and save code runs. Only the reads are fake, and the test answers
// them in any order. `realLoad` also runs the real landing code over a fake database.
const clone = value => JSON.parse(JSON.stringify(value ?? null));
const tick = () => new Promise(resolve => setImmediate(resolve));
const ordering = between("  const hydrateMember = async", "  const loadMember = async")
  + between("  const refreshAfterMutation = async", "  const completeAuth = async")
  + between("  const resetToIntro = () =>", "  // Cleanup all pending timers")
  + handlers + between("  const submitStory = async", "  // Open the pass")
  + between("  const showToast = ", "  // Verify-with-Instagram");
const landing = between("function notificationKind", "function mapApplication")
  + between("  const loadMember = async", "  // A failed read must not undo");

function makeApp({ manual = false, manualRecord = false, realLoad = false, status = "approved", server = [], notifications = [], write } = {}) {
  const state = { server:clone(server), myEvents:clone(server), saved:["old"], profile:{full_name:"Old name", ig_handle:"old"},
    syncNotice:null, onboardStep:"done", memberRecord:undefined, storyEventId:"event", applyState:"idle",
    messages:[], writes:0, reads:0, uploads:0, invokes:0, landed:[], refreshFails:true };
  const loads = [], recordLoads = [], recordCalls = [];
  const live = { hydrateStarted:{current:0}, hydrateFloor:{current:0}, hydrateLanded:{current:0}, epoch:{current:0}, recordSeq:{current:0} };
  const writeOk = async (name, args) => {
    state.writes++;
    const row = state.server.find(item => item.applicationId === args?.p_app);
    if (name === "apply_to_event") state.server.push({eventId:args.p_event, applicationId:"app-" + args.p_event, state:"applied"});
    if (row) Object.assign(row, {cancel_application:{state:"withdrawn"}, confirm_pick:{state:"confirmed"}, decline_pick:{state:"declined"},
      submit_story:{story:"review", storyMediaUrl:args.p_media}}[name]);
    return {data:name === "apply_to_event" ? "applied" : null, error:null};
  };
  // A load answers with the server as it was when the load started, like a real slow request.
  const settle = (resolve, reject, land) => ({
    ok:async () => { resolve(land()); await tick(); },
    fail:async () => { reject(new Error("Refresh failed")); await tick(); },
  });
  const fakeLoad = (uid, seq, stale) => {
    state.reads++;
    const snapshot = clone(state.server);
    const land = () => {
      if (stale()) return null;
      live.hydrateLanded.current = seq; state.landed.push(seq); state.syncNotice = null;
      state.myEvents = snapshot;
      return true;
    };
    if (manual) return new Promise((resolve, reject) => loads.push({ seq, ...settle(resolve, reject, land) }));
    return state.refreshFails ? Promise.reject(new Error("Refresh failed")) : Promise.resolve(land());
  };
  // realLoad: the profile read is the one the test controls; the other reads return nothing.
  const readProfile = () => {
    state.reads++;
    const row = {id:"member", status, full_name:"Sara", ig_handle:"sara", creator_data:{}}, seq = live.hydrateStarted.current;
    if (!manual) return Promise.resolve({data:row, error:null});
    return new Promise(resolve => loads.push({ seq, ok:async () => { resolve({data:row, error:null}); await tick(); },
      fail:async () => { resolve({data:null, error:new Error("Refresh failed")}); await tick(); } }));
  };
  const table = name => { const query = { select:() => query, eq:() => query, in:() => query, order:() => query,
    then:(resolve, reject) => Promise.resolve({data:name === "notifications" ? notifications : [], error:null}).then(resolve, reject),
    single:readProfile, update:() => ({ eq:write || (() => writeOk("update_profile")) }) }; return query; };
  const set = key => value => { state[key] = typeof value === "function" ? value(state[key]) : value; };
  const setters = Object.fromEntries(["session", "profile", "events", "myEvents", "notifs", "saved", "memberRecord", "currentEvent",
    "pickedEventId", "passEventId", "storyEventId", "shareEvent", "settingsOpen", "notifOpen", "applyState", "syncNotice", "screen",
    "tab", "onboardStep"].map(key => ["set" + key[0].toUpperCase() + key.slice(1), set(key)]));
  const context = vm.createContext({
    ...live, ...setters, renderEpoch:0, session:{user:{id:"member"}}, SEED_EVENTS:["seed"], SEED_NOTIFS:["seed"], MY_EVENTS:[{eventId:"event", state:"seed"}],
    get myEvents() { return state.myEvents; }, get saved() { return state.saved; }, get profile() { return state.profile; },
    activeEvent:{id:"event"}, applyState:"idle", currentEventRef:{current:{id:"event"}}, pickedEventId:"event", tab:"home",
    pickActionRef:{current:false}, toastTimer:{current:null}, setTimeout:() => 0, clearTimeout() {},
    setToast:message => state.messages.push(message),
    fetch:async () => ({ blob:async () => ({ type:"image/jpeg" }) }),
    supabaseClient:{
      rpc:(name, args) => {
        if (name === "event_stats") return Promise.resolve({data:[], error:null});
        if (name !== "member_records") return (write || writeOk)(name, args);
        recordCalls.push(args);
        if (!manualRecord) return Promise.resolve({data:[{member_id:"member", record:sara}], error:null});
        return new Promise(resolve => recordLoads.push({ ok:data => resolve({data, error:null}), fail:error => resolve({data:null, error}) }));
      },
      from:table,
      auth:{ signOut:async () => ({error:null}) },
      functions:{ invoke:async () => { state.invokes++; return {error:null}; } },
      storage:{ from:() => ({ upload:async () => { state.uploads++; return {error:null}; },
        getPublicUrl:() => ({data:{publicUrl:"https://media.test/story.jpg"}}) }) },
    },
    ...(realLoad ? {} : { loadMember:fakeLoad }),
  });
  vm.runInContext(states + ordering + (realLoad ? landing : ""), context);
  const run = code => vm.runInContext(code, context);
  const rows = () => Object.fromEntries(state.myEvents.map(row => [row.eventId, row.state]));
  return { state, context, loads, recordLoads, recordCalls, refs:live, run, rows };
}

// A save the server accepted shows right away even though the refresh after it failed.
{
  const app = makeApp({ server:[{eventId:"event", applicationId:"application", state:"checked_in", story:"due"}] });
  const { state } = app;
  assert.equal(await app.run('submitStory("event", "data:image/jpeg;base64,AA==")'), true);
  assert.equal(state.myEvents[0].story, "review", "the sent Story shows as under review");
  assert.equal(state.myEvents[0].storyMediaUrl, "https://media.test/story.jpg");
  assert.equal(state.storyEventId, null, "the sheet closes, so nobody sends it twice");
  assert.equal(state.syncNotice, "Story sent", "the delayed banner reports it");
  assert.deepEqual([state.writes, state.uploads, state.reads], [1, 1, 1]);
  assert.equal(app.refs.hydrateFloor.current, 1, "reloads started before the write can't land");
  await app.run('refreshAfterMutation("Story sent")');
  assert.deepEqual([state.writes, state.uploads, state.reads], [1, 1, 2], "retry reads only, never uploads again");

  const rejected = makeApp({ server:[{eventId:"event", applicationId:"application", state:"checked_in", story:"due"}],
    write:async () => ({error:new Error("Request rejected")}) });
  assert.equal(await rejected.run('submitStory("event", "data:image/jpeg;base64,AA==")'), false);
  assert.equal(rejected.state.myEvents[0].story, "due", "a rejected upload shows nothing");
  assert.equal(rejected.state.storyEventId, "event", "the sheet stays open to try again");
  assert.equal(rejected.state.syncNotice, null);
  assert.deepEqual([rejected.state.reads, rejected.refs.hydrateFloor.current], [0, 0]);
}
{
  const app = makeApp();
  const { state } = app;
  const form = {name:"New name", handle:"newhandle", phone:"", notifPicks:true, notifDrops:false};
  assert.equal(await app.run(`saveSettings(${JSON.stringify(form)})`), true);
  assert.deepEqual(clone(state.profile), {full_name:"New name", ig_handle:"newhandle", handle:"newhandle", phone:null, notif_picks:true, notif_drops:false},
    "the saved fields show now");
  assert.equal(state.syncNotice, "Settings saved", "the delayed banner reports it");
  assert.deepEqual([state.writes, state.invokes, state.reads], [1, 1, 1]);
  assert.equal(app.refs.hydrateFloor.current, 1, "reloads started before the write can't land");
  await app.run('refreshAfterMutation("Settings saved")');
  assert.deepEqual([state.writes, state.invokes, state.reads], [1, 1, 2], "retry reads only");

  const rejected = makeApp({ write:async () => ({error:new Error("Request rejected")}) });
  assert.equal(await rejected.run(`saveSettings(${JSON.stringify(form)})`), false);
  assert.deepEqual(clone(rejected.state.profile), {full_name:"Old name", ig_handle:"old"}, "a rejected save shows nothing");
  assert.deepEqual([rejected.state.syncNotice, rejected.state.reads, rejected.refs.hydrateFloor.current], [null, 0, 0]);
}

// Two saves, then their reloads answer in every order.
async function twoSaves(order) {
  const app = makeApp({ manual:true, server:[{eventId:"other", applicationId:"other-application", state:"applied"}] });
  const first = app.run("onApply()"); await tick();
  const second = app.run('onCancelApplication({eventId:"other", applicationId:"other-application"})'); await tick();
  assert.deepEqual(app.loads.map(load => load.seq), [1, 2], "each save starts its own reload");
  for (const settle of order(app.loads)) await settle();
  await Promise.all([first, second]);
  return app;
}
const bothSaved = {other:"withdrawn", event:"applied"};
{ // The newer reload lands first, then the older one fails: the late failure changes nothing.
  const app = await twoSaves(([a, b]) => [b.ok, a.fail]);
  assert.equal(app.state.syncNotice, null, "a late failure must not raise the banner over newer data");
  assert.deepEqual(app.state.landed, [2]);
  assert.deepEqual(app.rows(), bothSaved);
}
{ // The older reload answers first but a write happened since, so it can't land; the newer one fails.
  const app = await twoSaves(([a, b]) => [a.ok, b.fail]);
  assert.deepEqual(app.state.landed, [], "a reload that started before the second write must not land");
  assert.equal(app.state.syncNotice, "Application cancelled", "the banner says updates are delayed");
  assert.deepEqual(app.rows(), bothSaved, "both saved changes still show");
}
{ // The older one fails first, the newer one lands after: server truth wins and the banner clears.
  const app = await twoSaves(([a, b]) => [a.fail, b.ok]);
  assert.deepEqual(app.state.landed, [2]);
  assert.equal(app.state.syncNotice, null, "the newer reload clears the banner");
  assert.deepEqual(app.rows(), bothSaved);
}
{ // A reload that started before a save answers after the save's own reload: its old data is dropped.
  const app = makeApp({ manual:true });
  const poll = app.run('hydrateMember("member")'); await tick();   // carries the old server
  const save = app.run("onApply()"); await tick();
  await app.loads[1].ok(); await save;
  await app.loads[0].ok();
  assert.equal(await poll, null, "the old reload reports stale");
  assert.deepEqual(app.rows(), {event:"applied"}, "old data never replaces newer data");
  assert.deepEqual(app.state.landed, [2]);
}
{ // Logout while a boot load and a save's reload are still running: nothing from the old session lands.
  const app = makeApp({ manual:true });
  const boot = app.run('hydrateMember("member")'); await tick();
  const save = app.run("onApply()"); await tick();
  await app.run("logout()");
  assert.equal(await app.run('hydrateMember("member")'), null, "an old screen can't start a reload after logout");
  assert.equal(await app.run('refreshAfterMutation("Saved")'), true, "nor ask for a banner");
  assert.deepEqual([app.loads.length, app.state.syncNotice], [2, null]);
  await app.loads[0].ok(); await app.loads[1].fail();
  assert.equal(await boot, null, "a boot load finishing after logout reports stale");
  await save;
  assert.deepEqual(clone(app.state.myEvents), [{eventId:"event", state:"seed"}], "no old data after logout");
  assert.equal(app.state.syncNotice, null, "no banner for the old session");
  assert.deepEqual(app.state.landed, []);
  app.context.renderEpoch = app.refs.epoch.current; // the next render belongs to the new session
  const next = app.run('hydrateMember("member")'); await tick();   // the next session's load still works
  await app.loads[2].ok();
  assert.equal(await next, true);
}
{ // A failed load that finishes after logout is swallowed, not reported.
  const app = makeApp({ manual:true });
  const boot = app.run('hydrateMember("member")'); await tick();
  await app.run("logout()");
  await app.loads[0].fail();
  assert.equal(await boot, null);
}
console.log("PASS member ordering: overlapping saves, late failures, stale reloads, logout mid-load, all out of order.");

// A write (not just its reload) can still be waiting when the member signs out, and then succeed, be rejected or drop.
for (const action of ['onApply()', 'onCancelApplication({eventId:"event", applicationId:"application"})', 'onConfirmPick()', 'onDeclinePick()',
  'submitStory("event", "data:image/jpeg;base64,AA==")', 'saveSettings({name:"New", handle:"new", phone:"", notifPicks:true, notifDrops:true})',
  'toggleSave("event")']) {
  for (const outcome of ["succeeds", "is rejected", "drops"]) {
    let answer;
    const app = makeApp({ manual:true, server:[{eventId:"event", applicationId:"application", state:"picked"}],
      write:() => new Promise((resolve, reject) => { answer = { resolve, reject }; }) });
    const save = app.run(action); await tick();
    assert.ok(answer, `${action}: the write reached the server`);
    await app.run("logout()");
    const afterLogout = clone(app.state);
    if (outcome === "succeeds") answer.resolve({data:null, error:null});
    else if (outcome === "is rejected") answer.resolve({data:null, error:new Error("Request rejected")});
    else answer.reject(new Error("Connection failed"));
    await save.catch(() => {}); // a dropped call may reach a caller that is already gone; it must still change nothing
    const label = `${action} ${outcome} after logout`;
    assert.equal(app.loads.length, 0, `${label}: an old save must not start a new load`);
    assert.deepEqual(clone(app.state), afterLogout, `${label}: changes nothing, shows no toast and no banner`);
    assert.equal(app.context.pickActionRef.current, false, `${label}: release action guard`);
  }
}

// The score's counts: the member's own row, newest request wins, nothing lands after logout.
{
  const app = makeApp({ manualRecord:true });
  const first = app.run("loadMemberRecord()"), second = app.run("loadMemberRecord()"); await tick();
  assert.deepEqual(clone(app.recordCalls), [{p_members:["member"]}, {p_members:["member"]}], "asks for the member's own id");
  app.recordLoads[1].ok([{member_id:"member", record:sara}]); await second;
  app.recordLoads[0].ok([{member_id:"member", record:{attended:1}}]); await first;
  assert.deepEqual(clone(app.state.memberRecord), sara, "an older answer never replaces the newest request");
  const older = app.run("loadMemberRecord()"), newer = app.run("loadMemberRecord()"); await tick();
  app.recordLoads[3].ok([{member_id:"member", record:sara}]); await newer;
  app.recordLoads[2].fail(new Error("Offline")); await older;
  assert.deepEqual(app.state.messages, [], "an older failure after a newer success stays silent");
  const third = app.run("loadMemberRecord()"); await tick();
  app.recordLoads[4].fail(new Error("Offline")); await third;
  assert.deepEqual(clone(app.state.memberRecord), sara, "a failed reload keeps the record already shown");
  assert.deepEqual(app.state.messages, ["Offline"], "a failed reload that is the newest request says so");

  const none = makeApp({ manualRecord:true });
  const empty = none.run("loadMemberRecord()"); await tick();
  none.recordLoads[0].ok([]); await empty;
  assert.deepEqual(clone(none.state.memberRecord), {}, "no row means no score yet, not an error");
  const failed = none.run("loadMemberRecord()"); await tick();
  none.recordLoads[1].fail(new Error("Offline")); await failed;
  assert.deepEqual(clone(none.state.memberRecord), {}, "still the record that loaded");

  const fresh = makeApp({ manualRecord:true });
  const broken = fresh.run("loadMemberRecord()"); await tick();
  fresh.recordLoads[0].fail(new Error("Offline")); await broken;
  assert.equal(fresh.state.memberRecord, null, "a failed first load is null, so the Profile says so and retries");

  const late = makeApp({ manualRecord:true });
  const pending = late.run("loadMemberRecord()"); await tick();
  await late.run("logout()");
  late.recordLoads[0].ok([{member_id:"member", record:sara}]); await pending;
  assert.equal(late.state.memberRecord, undefined, "a record load finishing after logout is dropped");
  assert.equal(await late.run("loadMemberRecord()"), null, "an old screen can't start a record load after logout");
  assert.equal(late.recordCalls.length, 1);

  const lateFail = makeApp({ manualRecord:true });
  const pendingFail = lateFail.run("loadMemberRecord()"); await tick();
  await lateFail.run("logout()");
  lateFail.recordLoads[0].fail(new Error("Offline")); await pendingFail;
  assert.deepEqual([lateFail.state.memberRecord, lateFail.state.messages], [undefined, []], "a failed record load after logout stays silent");
}
console.log("PASS member record: own id, newest wins, failed reload keeps the record, dropped after logout; writes pending at logout change nothing.");

// The real landing code over a fake database: an approved member skips the intro whichever reload lands first.
{
  const app = makeApp({ realLoad:true, manual:true });
  app.state.onboardStep = "intro"; app.state.syncNotice = "Saved";
  const boot = app.run('hydrateMember("member")'); await tick();
  const realtime = app.run('hydrateMember("member")'); await tick();
  assert.deepEqual(app.loads.map(load => load.seq), [1, 2]);
  await app.loads[1].ok();
  assert.equal(app.state.onboardStep, "done", "the reload that landed opened the app");
  assert.equal(app.state.syncNotice, null, "landing clears the banner");
  assert.equal(app.state.profile.full_name, "Sara");
  await app.loads[0].ok();
  assert.equal(await boot, null, "the older boot load is stale");
  assert.equal(await realtime, true);
  assert.deepEqual([app.refs.hydrateLanded.current, app.state.onboardStep], [2, "done"], "a stale boot load can't undo it");

  const failing = makeApp({ realLoad:true, manual:true });
  const older = failing.run('hydrateMember("member")'); await tick();
  const newer = failing.run('hydrateMember("member")'); await tick();
  await failing.loads[1].ok(); await failing.loads[0].fail();
  assert.equal(await older, null, "a stale failure is swallowed");
  assert.equal(await newer, true);
  const lone = makeApp({ realLoad:true, manual:true });
  const broken = lone.run('hydrateMember("member")'); await tick();
  const reported = assert.rejects(broken, /Refresh failed/, "a real read error still reaches the caller");
  await lone.loads[0].fail(); await reported;

  const malformed = makeApp({ realLoad:true, notifications:[null] });
  await assert.rejects(malformed.run('hydrateMember("member")'), /Cannot read properties of null/, "a row the app can't read is an error, not a silent stale reload");
  assert.deepEqual([malformed.refs.hydrateLanded.current, malformed.state.profile.full_name], [0, "Old name"], "and none of that reload lands");

  const waiting = makeApp({ realLoad:true, status:"pending" });
  waiting.state.onboardStep = "intro";
  assert.equal(await waiting.run('hydrateMember("member")'), true);
  assert.equal(waiting.state.onboardStep, "queue", "a member still under review waits in the queue");
  const signingIn = makeApp({ realLoad:true });
  signingIn.state.onboardStep = "otp";
  await signingIn.run('hydrateMember("member")');
  assert.equal(signingIn.state.onboardStep, "otp", "only a start-up session skips the intro; sign-in steps stay put");
}

// The approval poll: an answer that arrives after logout is ignored.
{
  const calls = [];
  const poll = vm.createContext({ active:true, epoch:{current:0}, born:0,
    setTierSuggestion:value => calls.push(["tier", value]), onProfileFetched:value => calls.push(["profile", value.handle]),
    setStep:value => calls.push(["step", value]) });
  vm.runInContext(between("    const acceptApproval = row => {", "    const check = async"), poll);
  const approved = 'acceptApproval({status:"approved", ig_handle:"sara", creator_data:{tier_suggestion:2}})';
  vm.runInContext('acceptApproval({status:"pending"})', poll);
  assert.deepEqual(calls, [], "only an approved profile moves on");
  vm.runInContext(approved, poll);
  assert.deepEqual(calls, [["tier", 2], ["profile", "sara"], ["step", "tier-reveal"]]);
  calls.length = 0; poll.epoch.current++;
  vm.runInContext(approved, poll);
  assert.deepEqual(calls, [], "an approval answer after logout changes nothing");
}
console.log("PASS member landing: stale boot load can't undo the intro skip, real read errors surface; approval answers after logout are dropped.");
