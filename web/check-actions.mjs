// Run with node web/check-actions.mjs. No requests reach Supabase.
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import vm from "node:vm";

const source = readFileSync(new URL("./v3/member.jsx", import.meta.url), "utf8");
function between(start, end) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);
  assert.ok(from >= 0 && to > from, `Member handler markers changed: ${start}`);
  return source.slice(from, to);
}

// Exercise the shipped handlers, with only their external dependencies replaced.
const handlers = between("  const onApply = async", "  // forceVerdict")
  + between("  const onConfirmPick = async", "  const showToast");
const support = between("const GS =", "// Story states")
  + between("  const refreshAfterMutation = async", "  const loadMemberRecord");
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
vm.runInContext(between("const GS =", "// Story states") + handlers
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
