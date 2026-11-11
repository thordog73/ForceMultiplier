'use strict';

const assert = require('node:assert/strict');
const G = require('../www/game-rules.js');
const clone = value => JSON.parse(JSON.stringify(value));
let assertions = 0;
function check(value, message) { assertions++; assert.ok(value, message); }
function equal(actual, expected, message) { assertions++; assert.deepEqual(actual, expected, message); }

// Build a second feasible plan from constraints, independently of scenario.model.
function fillFlights(s, placements, reverse = false) {
  const state = { placements: { ...placements }, flights: {} };
  for (const goal of s.flightGoals) {
    const ready = G.available(s, state, goal.day);
    if (reverse) ready.reverse();
    state.flights[goal.day] = {};
    for (const wave of ['am', 'pm']) {
      const required = [...new Set([
        ...(goal[wave === 'am' ? 'requiredAM' : 'requiredPM'] || []),
        ...(goal.pilots || []).filter(p => (p.wave || 'am') === wave).map(p => p.plane)
      ])];
      check(required.every(p => ready.includes(p)), 'Independent plan can satisfy required aircraft');
      const picks = [...required, ...ready.filter(p => !required.includes(p))].slice(0, goal[wave]);
      equal(picks.length, goal[wave], 'Independent plan has enough available aircraft');
      state.flights[goal.day][wave] = picks;
    }
  }
  return state;
}

let modelCases = 0;
for (const level of G.levels) {
  for (let seed = 0; seed < 100; seed++) {
    const scenario = G.make(level.id, seed);
    modelCases++;
    equal(scenario, G.make(level.id, seed), 'Seeds are deterministic');
    check(scenario.objective.length <= 70, 'Objective stays short');
    check(scenario.tip.length <= 100, 'Optional tip stays short');
    check(scenario.reveal.length <= 100, 'Post-play reveal stays short');
    check(!/\b(air force|airman|commander|DAFI|TNMCM|NMCM|CFETP)\b/i.test(JSON.stringify(scenario)), 'Scenario vocabulary is generic');
    if (level.kind === 'waves') {
      for (const wave of scenario.waves) {
        const result = G.checkWave(scenario, wave.id, scenario.model[wave.id]);
        check(result.ok, `Level ${level.id}, seed ${seed}, ${wave.id}: ${result.message}`);
        check(!G.checkWave(scenario, wave.id, []).ok, 'An empty wave fails');
        const reordered = scenario.model[wave.id].slice().reverse();
        check(G.checkWave(scenario, wave.id, reordered).ok, 'Order of aircraft does not matter');
      }
    } else {
      const result = G.checkBoard(scenario, scenario.model);
      check(result.ok, `Level ${level.id}, seed ${seed}: ${result.errors.join('; ')}`);
      check(result.workOK && result.flightOK, 'A model completes both phases');
      equal(result.score.flights, result.score.target, 'Model meets all flight targets');
      check(!G.checkBoard(scenario, {}).ok, 'A blank board fails');
      equal(G.checkBoard(scenario, {}).tasksMissing.length, scenario.tasks.length, 'Missing tasks are exposed');
      const independent = fillFlights(scenario, scenario.model.placements, true);
      check(G.checkBoard(scenario, independent).ok, 'Alternative feasible aircraft choices pass');
    }
  }
}

// Unknown, duplicate, over-capacity, under-capacity, and malformed selections.
{
  const s = G.make(3, 40), picks = s.model.am;
  check(!G.checkWave(s, 'am', picks.slice(1)).ok, 'Too few aircraft fail');
  check(!G.checkWave(s, 'am', s.planes.map(p => p.id)).ok, 'Too many aircraft fail');
  check(!G.checkWave(s, 'am', [...picks.slice(1), picks[1]]).ok, 'Duplicate aircraft fail');
  equal(G.checkWave(s, 'am', [...picks.slice(1), '99']).badIds, ['99'], 'Unknown aircraft fail');
  check(!G.checkWave(s, 'am', null).ok, 'Malformed selection fails');
  check(!G.checkWave(s, 'late', picks).ok, 'Unknown wave fails');
  const pm = s.planes.map(p => p.id).filter(p => !picks.includes(p));
  pm.push(...picks.slice(0, 10 - pm.length));
  check(G.checkWave(s, 'pm', pm).ok, 'The second wave can include rested spares');
}
{
  const s = G.make(2, 12), required = s.waves[0].required[0];
  const withoutRequired = s.planes.map(p => p.id).filter(p => p !== required).slice(0, 6);
  equal(G.checkWave(s, 'am', withoutRequired).missingIds, [required], 'Long-idle aircraft must fly');
}
{
  const s = G.make(4, 12), blocked = s.waves[0].blocked[0];
  equal(G.checkWave(s, 'am', [blocked, ...s.model.am.slice(1)]).badIds, [blocked], 'Grounded aircraft cannot fly');
}
{
  const s = G.make(5, 12);
  for (const wave of s.waves) {
    const pilot = wave.pilots[0];
    const withoutPilot = s.planes.map(p => p.id).filter(p => p !== pilot.plane && !wave.blocked.includes(p)).slice(0, wave.count);
    const failed = G.checkWave(s, wave.id, withoutPilot);
    equal(failed.missingIds, [pilot.plane], 'Pilot-specific aircraft is required');
    check(failed.message.includes(pilot.name), 'Feedback identifies the pilot');
  }
}

// One day of work + a full 24-hour cure: neither flight wave is allowed next day.
{
  const s = G.make(8, 8), task = s.tasks[0], p = task.plane;
  const t = G.timeline(s, { 'mod-a': 0 });
  equal(t.errors, [], 'Single-mod timeline has no errors');
  equal(t.cells[`${p}|0`].kind, 'modA', 'Monday is work');
  equal(t.cells[`${p}|1`].kind, 'cure', 'Tuesday is cure');
  equal(t.release['mod-a'], 2, 'Aircraft returns Wednesday morning');
  equal(t.workDaysUsed, 1, 'One active workday');
  equal(t.holdDaysUsed, 1, 'One full calendar cure day');
  equal(t.groundDays, 2, 'Two grounded aircraft-days');
  check(!G.available(s, { placements: { 'mod-a': 0 } }, 1).includes(p), 'Curing aircraft unavailable');
  check(G.available(s, { placements: { 'mod-a': 0 } }, 2).includes(p), 'Released aircraft available');
  for (const wave of ['am', 'pm']) {
    const state = clone(s.model);
    state.flights[1][wave][0] = p;
    const result = G.checkBoard(s, state);
    check(!result.ok && !result.flightOK && result.workOK, 'A cure-flight conflict fails in either wave');
    check(result.badCells.includes(`${p}|1`), 'Feedback highlights the conflict cell');
  }
  const late = { ...s.model, placements: { 'mod-a': 1 } };
  check(!G.checkBoard(s, late).ok, 'A late cure cannot meet the Wednesday aircraft requirement');
}

// Compatible blocks share one cure only when adjacent over working days.
{
  const s = G.make(9, 9), p = s.tasks[0].plane;
  const adjacent = G.timeline(s, { 'mod-a': 0, 'mod-b': 2 });
  equal(adjacent.errors, [], 'Adjacent mods fit');
  equal(adjacent.workDaysUsed, 4, 'Both two-day mods have four active workdays');
  equal(adjacent.holdDaysUsed, 1, 'Adjacent mods share one cure');
  equal(adjacent.groundDays, 5, 'Adjacent mods cost five grounded days');
  equal(adjacent.release['mod-a'], 5, 'First mod releases with final shared cure');
  equal(adjacent.release['mod-b'], 5, 'Second mod releases with final shared cure');
  equal(adjacent.cells[`${p}|4`].taskIds.slice().sort(), ['mod-a', 'mod-b'], 'Cure belongs to both mods');
  const reverse = fillFlights(s, { 'mod-a': 2, 'mod-b': 0 });
  check(G.checkBoard(s, reverse).ok, 'Either compatible mod can come first');

  const separated = G.timeline(s, { 'mod-a': 0, 'mod-b': 3 });
  equal(separated.errors, [], 'Separated mods are physically valid');
  equal(separated.workDaysUsed, 4, 'Separated mods still require four active workdays');
  equal(separated.holdDaysUsed, 2, 'Separated mods require two cures');
  equal(separated.groundDays, 6, 'Separated mods cost six grounded days');
  const separateState = fillFlights(s, { 'mod-a': 0, 'mod-b': 3 });
  const result = G.checkBoard(s, separateState);
  check(!result.ok && result.flightOK && !result.workOK, 'The five-day efficiency target rejects separate cures');
  equal(result.score.groundTarget, 5, 'Efficiency target exposed to UI');
  const noBudget = { ...s, maxGroundDays: null };
  check(G.checkBoard(noBudget, separateState).ok, 'Feasible nonoptimal plan passes when no efficiency goal applies');

  const overlapping = G.timeline(s, { 'mod-a': 0, 'mod-b': 1 });
  check(overlapping.errors.length > 0, 'Active work cannot overlap');
  check(overlapping.errors.some(e => e.cell === `${p}|1`), 'Overlap identifies its board cell');
}

// Weekend cure and paused active work use calendar time consistently.
{
  const s = G.make(10, 10), p = s.tasks[0].plane;
  const t = G.timeline(s, s.model.placements);
  equal(t.errors, [], 'Tuesday–Friday work fits');
  equal(t.taskDays['mod-a'], [1, 2], 'First mod uses Tuesday and Wednesday');
  equal(t.taskDays['mod-b'], [3, 4], 'Second mod uses Thursday and Friday');
  equal(t.cells[`${p}|5`].kind, 'cure', 'Cure runs on Saturday');
  equal(t.release['mod-a'], 6, 'Return after Saturday 16:00 cure is Sunday morning');
  check(G.available(s, s.model, 7).includes(p), 'Monday flying is available');
  check(G.timeline(s, { 'mod-a': 5 }).errors.length > 0, 'Active work cannot start Saturday');

  const extended = G.make(12, 4);
  const tail = extended.planes[0].id;
  extended.blockedCells = [];
  extended.tasks = [{ id: 'long', label: 'Inspect ' + tail, short: 'INSP', plane: tail, kind: 'inspection', workDays: 2, window: [0, 11] }];
  let span = G.timeline(extended, { long: 4 });
  equal(span.taskDays.long, [4, 7], 'Friday start continues Monday');
  equal(span.workDaysUsed, 2, 'Only weekdays count as active work');
  equal(span.groundDays, 4, 'Aircraft stays unavailable across the paused weekend');
  check(span.cells[`${tail}|5`] && span.cells[`${tail}|6`], 'Both weekend days stay blocked');
  equal(span.release.long, 8, 'Inspection returns aircraft Tuesday');
  extended.tasks = [
    { id: 'a', label: 'Mod A', short: 'A', plane: tail, kind: 'modA', workDays: 2, holdHours: 24, sharedHold: 'finish', window: [0, 11] },
    { id: 'b', label: 'Mod B', short: 'B', plane: tail, kind: 'modB', workDays: 2, holdHours: 24, sharedHold: 'finish', window: [0, 11] }
  ];
  span = G.timeline(extended, { a: 3, b: 7 });
  equal(span.errors, [], 'Mods may be adjacent across a weekend');
  equal(span.workDaysUsed, 4, 'Weekend does not add workdays');
  equal(span.holdDaysUsed, 1, 'Compatible mods still share one cure');
  equal(span.groundDays, 7, 'Downtime includes the paused weekend');
  equal(span.cells[`${tail}|9`].kind, 'cure', 'Shared cure follows final Tuesday work');
}

// Windows, outages, boundary errors, unknown task IDs, and absent work.
{
  const s = G.make(7, 3), task = s.tasks[0];
  check(G.timeline(s, { [task.id]: 3 }).errors.some(e => /must fit/.test(e.message)), 'Work must fit its full window');
  for (const bad of [-1, 1.5, 99, '1', undefined]) {
    check(G.timeline(s, { [task.id]: bad }).errors.length > 0, 'Invalid start is rejected');
  }
  check(G.timeline(s, { unknown: 0 }).errors.length > 0, 'Unknown work tile is rejected');
  const outage = { ...s, blockedCells: [{ plane: task.plane, day: 0, reason: 'Repair' }] };
  check(G.timeline(outage, { [task.id]: 0 }).errors.length > 0, 'Work cannot occupy an outage day');
  equal(G.available(s, s.model, -1), [], 'Off-board availability is empty');
  equal(G.available(s, s.model, 50), [], 'Off-board availability is empty');
  const noWork = { placements: {}, flights: s.model.flights };
  const result = G.checkBoard(s, noWork);
  check(!result.ok && !result.workOK, 'Flights alone cannot pass a level');
  equal(result.tasksMissing.slice().sort(), s.tasks.map(t => t.id).sort(), 'Missing IDs returned');
  for (const day of ['-1', '50', '1.5', '01', 'later']) {
    const invalid = clone(s.model);
    invalid.flights[day] = { am: [], pm: [] };
    check(!G.checkBoard(s, invalid).ok, 'Off-board or ambiguous day key fails');
  }
}

// Multiple placements can solve an inspection week; validation does not use model equality.
{
  const s = G.make(7, 70);
  const alternative = fillFlights(s, { 'inspect-a': 1, 'inspect-b': 3 }, true);
  check(G.checkBoard(s, alternative).ok, 'A different feasible work plan passes');
}

// The final event is an actual constraint and demand change, with short UI metadata.
{
  const s = G.make(13, 37), change = s.change;
  check(s.blockedCells.some(c => c.plane === change.plane && c.day === change.day), 'New outage changes availability');
  equal(s.flightGoals.find(g => g.day === change.addedDay).am, 7, 'Final event adds first-wave demand');
  equal(s.flightGoals.find(g => g.day === change.addedDay).pm, 6, 'Final event adds second-wave demand');
  const bad = clone(s.model);
  bad.flights[change.day].am[0] = change.plane;
  check(!G.checkBoard(s, bad).ok, 'Flying the newly grounded aircraft fails');
  const short = clone(s.model);
  short.flights[change.addedDay].am.pop();
  check(!G.checkBoard(s, short).ok, 'Ignoring the extra flight fails');
}

console.log(`PASS: ${G.levels.length} levels, ${modelCases} seeded models, ${assertions} assertions.`);
