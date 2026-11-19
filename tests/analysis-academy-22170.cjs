'use strict';
// Integration review of actual app dispatch, learning feedback, and saved progress.
// This intentionally does not claim browser layout or human training validation.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const base = path.resolve(process.argv[2] || '.');
const dist = path.join(base, 'dist');
const M = require(path.join(dist, 'fm2290-model.js'));
const B = require(path.join(dist, 'block-academy-model.js'));
const L = require(path.join(dist, 'academy-analysis-model.js'));
const P = require(path.join(dist, 'academy-phase.js'));
const storage = {};
const shell = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
for (const asset of ['academy-analysis-model.js', 'academy-analysis.js', 'academy-analysis.css', 'academy-phase.js', 'academy-phase.css']) {
  assert(shell.includes(asset), `The actual app shell loads ${asset}`);
}
assert(shell.indexOf('academy-analysis-model.js') < shell.indexOf('academy-analysis.js'), 'Case model loads before the analysis UI');
assert(shell.indexOf('academy-analysis.js') < shell.indexOf('fm2290.js'), 'Analysis UI is ready before the app starts');

function boot() {
  const handlers = {};
  const classes = {toggle() {}, add() {}, remove() {}, contains() { return false; }};
  const style = {setProperty() {}, removeProperty() {}};
  const root = {
    innerHTML: '', style, classList: classes,
    querySelector() { return null; }, querySelectorAll() { return []; },
    addEventListener(name, fn) { (handlers[name] ||= []).push(fn); }
  };
  const document = {
    getElementById() { return root; }, querySelector() { return null; }, querySelectorAll() { return []; },
    documentElement: {style, classList: classes, clientHeight: 844, clientWidth: 390},
    body: {style, classList: classes}, addEventListener() {}
  };
  const window = {
    FMModel: M, FMBlockModel: B, FMAcademyAnalysisModel: L, FMAcademyPhase: P,
    innerWidth: 390, innerHeight: 844, scrollY: 0, scrollTo() {}, addEventListener() {},
    setTimeout: fn => fn(), requestAnimationFrame: fn => fn(),
    matchMedia: () => ({matches: true, addEventListener() {}})
  };
  const context = {
    window, document, console,
    localStorage: {getItem: key => storage[key] || null, setItem: (key, value) => storage[key] = value},
    setTimeout: fn => fn(), clearTimeout() {}, requestAnimationFrame: fn => fn()
  };
  context.globalThis = context;
  vm.createContext(context);
  for (const file of ['fundamentals-data.js', 'teaching.js', 'academy-analysis.js', 'block-academy.js', 'fm2290.js']) {
    vm.runInContext(fs.readFileSync(path.join(dist, file), 'utf8'), context, {filename: file});
  }
  function click(dataset) {
    const element = {dataset, closest() { return null; }};
    for (const fn of handlers.click || []) fn({target: {closest: () => element}, preventDefault() {}});
  }
  return {window, root, click, state: () => window.FM2290.getState()};
}

let app = boot();
const tracks = ['rates', 'reports', 'trend', 'correlation', 'difference', 'fishbone', 'improve'];
function current() { return app.state().academy.analysisLab; }
function start(track, level = 1, variation = 0, progress = {}) {
  const academy = app.state().academy || {};
  app.window.FM2290.setRoute('academy', 'analysis-lab', {academy: {
    ...academy,
    analysisLab: {track, level, variation, step: 0, selected: null, checked: false,
      feedback: null, assisted: false, completed: false, history: [], progress}
  }});
  return L.makeCase(track, level, variation);
}
function answerCase(c, options = {}) {
  if (options.wrongFirst) {
    app.click({alAction: 'next'});
    assert.equal(current().step, 0, `${c.track}: unchecked answer cannot advance`);
    app.click({alAction: 'check'});
    assert.equal(current().checked, false, `${c.track}: an empty choice cannot pass`);
  }
  for (let index = 0; index < c.steps.length; index++) {
    const step = c.steps[index];
    assert.equal(current().step, index, `${c.track}: active step`);
    if (options.wrongFirst && index === 0) {
      const wrong = step.choices.find(choice => choice.id !== step.correct);
      assert(wrong, `${c.track}: useful alternative answer is available`);
      app.click({alChoice: wrong.id});
      app.click({alAction: 'check'});
      assert.equal(current().step, index, `${c.track}: wrong answer does not advance`);
      assert.equal(current().checked, false, `${c.track}: wrong answer is not validated`);
      assert(current().feedback, `${c.track}: wrong answer gives feedback`);
      app.click({alAction: 'next'});
      assert.equal(current().step, index, `${c.track}: direct next action cannot bypass correction`);
    }
    app.click({alChoice: step.correct});
    assert.equal(current().selected, step.correct, `${c.track}: one tap places the answer`);
    app.click({alAction: 'check'});
    assert.equal(current().checked, true, `${c.track}: correct answer validates`);
    assert(current().feedback, `${c.track}: correct answer explains its meaning`);
    app.click({alAction: 'next'});
  }
  assert.equal(current().completed, true, `${c.track}: case completes after the final check`);
}

let completed = 0;
for (const track of tracks) {
  for (const variation of [0, 1, 2]) {
    const c = start(track, track === 'rates' ? variation + 1 : 1, variation);
    assert(c.steps.length >= 3, `${track}: evidence-to-conclusion sequence`);
    if (['trend', 'correlation', 'difference'].includes(track)) {
      assert(c.chart, `${track}: case contains actual chart evidence`);
      assert(app.root.innerHTML.includes('<svg'), `${track}: chart is rendered in the active view`);
    }
    const before = JSON.stringify(current().progress);
    answerCase(c, {wrongFirst: true});
    assert.notEqual(JSON.stringify(current().progress), before, `${track}: independent completion records progress`);
    completed++;
  }
}

// Assisted walkthroughs can finish, but do not masquerade as independent progress.
for (const track of ['rates', 'reports', 'correlation']) {
  const c = start(track);
  const beforeIndependent = current().progress[track]?.independent || 0;
  const beforeCoached = current().progress[track]?.coached || 0;
  app.click({alAction: 'example'});
  assert.equal(current().assisted, true, `${track}: worked example is recorded as assisted`);
  answerCase(c);
  assert.equal(current().progress[track].independent, beforeIndependent, `${track}: assisted work does not award independent credit`);
  assert.equal(current().progress[track].coached, beforeCoached + 1, `${track}: coached practice is recorded separately`);
  app.click({alAction: 'retry'});
  assert.equal(current().assisted, false, `${track}: fresh independent attempt clears assistance`);
  assert.equal(current().completed, false, `${track}: retry starts a new attempt`);
  assert.equal(current().step, 0, `${track}: retry starts at the first decision`);
}

// Moving between the rate course and laboratory must preserve the active decision.
const resumed = start('rates');
app.click({alChoice: resumed.steps[0].correct});
app.click({alAction: 'check'});
app.click({alAction: 'next'});
app.click({alChoice: resumed.steps[1].correct});
app.click({alTrack: 'trend'});
assert.equal(current().track, 'trend', 'Menu opens a laboratory track through the actual dispatcher');
app.click({alTrack: 'rates'});
assert.equal(current().track, 'rates', 'Menu returns to the rate track');
assert.equal(current().step, 1, 'Switching courses retains the active decision');
assert.equal(current().selected, resumed.steps[1].correct, 'Switching courses retains the selected answer block');
assert.equal(current().checked, false, 'An unchecked selection does not become checked when resumed');

// Reload checks the actual saved state, not merely transient JS objects.
const persistedCase = start('rates', 1, 0);
answerCase(persistedCase);
const saved = JSON.stringify(current().progress);
assert(Object.keys(storage).length, 'The app wrote local progress');
app = boot();
assert.equal(JSON.stringify(current().progress), saved, 'Independent progress survives a reload');

// Shared Challenge/Prove settings survive closing the coach on the new lab route.
for (const stage of [3, 4]) {
  start('rates');
  app.click({alAction: 'coach'});
  app.click({coachStage: String(stage)});
  app.click({coachToggle: '1'});
  assert.equal(app.state().teaching.open, false, 'The inner training coach is closed');
  app.click({alAction: 'close'});
  assert(app.window.FMTeaching.activeIndependent(app.state()), `Closed coach preserves independent stage ${stage}`);
  app.click({alAction: 'example'});
  assert.equal(current().selected, null, `Stage ${stage} cannot reveal the answer`);
  assert.equal(current().assisted, false, `Stage ${stage} cannot silently become coached`);
  app.click({alAction: 'help'});
  app.click({coachStage: '1'});
  app.click({alAction: 'close'});
  assert(!app.window.FMTeaching.activeIndependent(app.state()), `Help Me unlocks coaching from stage ${stage}`);
  app.click({alAction: 'example'});
  assert.equal(current().assisted, true, 'Help Me permits a worked example');
}

// On short viewports, option paging must expose every actual choice without
// resetting the selection or making a hidden answer unreachable.
for (const [width, height] of [[320, 568], [375, 667], [390, 844], [844, 390]]) {
  app.window.innerWidth = width;
  app.window.innerHeight = height;
  const c = start('trend');
  app.click({alChoice: c.steps[0].correct});
  app.click({alAction: 'check'});
  app.click({alAction: 'next'});
  const step = c.steps[1];
  const seen = new Set();
  let selected;
  for (let page = 0; page < 10; page++) {
    const visible = [...app.root.innerHTML.matchAll(/data-al-choice="([^"]+)"/g)].map(match => match[1]);
    assert(visible.length, `${width}×${height}: answer blocks are rendered`);
    visible.forEach(id => seen.add(id));
    if (selected === undefined) {
      selected = visible[0];
      app.click({alChoice: selected});
    }
    const before = current().choicePage;
    app.click({alAction: 'options-next'});
    assert.equal(current().selected, selected, `${width}×${height}: paging preserves the selected answer`);
    if (current().choicePage === before) break;
  }
  assert.equal(seen.size, step.choices.length, `${width}×${height}: every pattern block is reachable`);
  app.click({alAction: 'options-prev'});
  assert.equal(current().selected, selected, `${width}×${height}: reverse paging preserves the selected answer`);
}
app.window.innerWidth = 390;
app.window.innerHeight = 844;
for (const [level, caveat] of [[5, 'At Month 3'], [6, 'A source audit']]) {
  start('improve', level);
  assert(app.root.innerHTML.includes(caveat), `Improvement case ${level} exposes its source problem before answering`);
}

// Upgrade the persisted old mission-5 route into guided rate learning. Preserve
// the learner's existing campaign work instead of reopening the obsolete board.
function bootLegacyRate(round, progress, score, extra = {}) {
  const legacyCase = B.makeChallenge(5, round, 2);
  storage.forceMultiplier2292 = JSON.stringify({
    ...M.defaultState(), module: 'academy', screen: 'play',
    academy: {mission: 5, round, variation: 2, progress: {1: 17, 3: 9, 5: progress},
      score, lives: 3, stage: 'play', placements: B.emptyPlacements(legacyCase),
      selectedPiece: null, message: null, assisted: false, hint: false, ...extra}
  });
  app = boot();
}
bootLegacyRate(13, 12, 2400);
assert.equal(app.state().screen, 'analysis-lab', 'An upgraded old rate route opens the guided course');
assert.equal(current().track, 'rates', 'The upgraded route opens rate practice');
assert.equal(current().level, 13, 'The legacy round becomes the guided rate case level');
assert.equal(current().variation, 2, 'The legacy variation survives migration');
assert.equal(app.state().academy.progress[5], 12, 'Migration preserves rate campaign completion');
assert.equal(app.state().academy.progress[1], 17, 'Migration preserves another mission’s completion');
assert.equal(app.state().academy.progress[3], 9, 'Migration preserves Phase Flow mission completion');
assert.equal(app.state().academy.score, 2400, 'Migration does not reset or award campaign points');
assert(app.root.innerHTML.includes('al-shell'), 'The guided learning interface is actually rendered');
assert(!app.root.innerHTML.includes('observed events'), 'The obsolete generic events/flights sample is not rendered');
answerCase(L.makeCase('rates', 13, 2));
assert.equal(app.state().academy.progress[5], 13, 'Completing the migrated case advances the campaign normally');
assert.equal(app.state().academy.score, 2575, 'The migrated next case receives one normal award');

// A previously saved guided rate decision takes precedence over the obsolete
// route’s round number, retaining its unfinished answer rather than restarting.
bootLegacyRate(13, 12, 2400, {analysisLab: {
  track: 'reports', level: 2, variation: 0, step: 0, selected: null, checked: false,
  history: [], progress: {}, runs: {rates: {level: 5, variation: 3, step: 1,
    selected: 'population', checked: false, feedback: null, assisted: false,
    completed: false, history: [{step: 'numerator', choice: 'count', checked: true}],
    mistakes: 0, choicePage: 0}}
}});
assert.equal(current().level, 5, 'Saved guided level is preferred when an old route is resumed');
assert.equal(current().variation, 3, 'Saved guided variation is restored');
assert.equal(current().step, 1, 'Saved guided decision is restored');
assert.equal(current().selected, 'population', 'Saved guided selection is restored');
assert.equal(app.state().academy.progress[5], 12, 'Restoring guided work preserves campaign credit');

// Finishing case 90 can earn the last campaign award once. A new variation at
// level 90 remains valid practice but cannot repeatedly award campaign points.
bootLegacyRate(90, 89, 5000);
answerCase(L.makeCase('rates', 90, 2));
assert.equal(app.state().academy.progress[5], 90, 'The final campaign case completes normally');
assert.equal(app.state().academy.score, 5175, 'The final campaign completion receives one award');
app.click({alAction: 'retry'});
assert.equal(current().level, 90, 'Retry keeps the completed campaign level');
assert.equal(current().variation, 3, 'Retry supplies a new variation');
answerCase(L.makeCase('rates', 90, 3));
assert.equal(app.state().academy.progress[5], 90, 'Repeated case 90 cannot exceed the campaign cap');
assert.equal(app.state().academy.score, 5175, 'Repeated case 90 cannot farm additional campaign points');

// Phase Flow belongs to the actual planning view, before the Help dialog opens.
const phaseCase = B.makeChallenge(3, 1, 0);
const phasePlan = B.modelPlacements(phaseCase);
const academy = app.state().academy;
app.window.FM2290.setRoute('academy', 'play', {academy: {
  ...academy, mission: 3, round: 1, variation: 0, placements: phasePlan,
  stage: 'play', focusPanel: null, selectedPiece: null, message: null
}});
assert(app.root.innerHTML.includes('Live Phase Flow overview'), 'Actual Phase Flow is in the planning screen');
const snapshot = P.snapshot(phaseCase, phasePlan);
assert.equal(snapshot.rows.length, phaseCase.aircraft.length, 'Phase Flow includes the entire actual fleet');
for (const row of snapshot.rows) {
  const original = phaseCase.aircraft.find(a => a.id === row.id);
  const sorties = Number(phasePlan.first.includes(row.id)) + Number(phasePlan.turn.includes(row.id));
  assert.equal(row.after, original.phaseHours - sorties * phaseCase.flightHoursPerSortie,
    `${row.id}: forecast matches the current flying plan`);
}

// Live learner assets, including standalone preview payloads, use the renamed term.
for (const name of ['task-map-data.js', 'task-map.js', 'visuals.js', 'Task_Map_Preview.html', 'academy-analysis-model.js', 'academy-analysis.js']) {
  const file = path.join(dist, name);
  if (fs.existsSync(file)) assert(!/9302/i.test(fs.readFileSync(file, 'utf8')), `${name}: legacy report label remains`);
}
console.log(`PASS Analysis Academy: ${completed} rate/report/laboratory cases through actual handlers, explanatory retries, independent versus assisted progress, reload persistence, legacy-route migration, the 90-case campaign award cap, chart evidence, actual Phase Flow, and current report terminology. No browser-layout or training-effectiveness claim is made.`);
