'use strict';
// Independent arithmetic checks on the observations that learners actually see.
const path = require('node:path');
const assert = require('node:assert/strict');
const base = path.resolve(process.argv[2] || '.');
const L = require(path.join(base, 'dist/academy-analysis-model.js'));
const average = xs => xs.reduce((a, b) => a + b, 0) / xs.length;
const close = (actual, expected, message, tolerance = 1e-10) =>
  assert(Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected)), `${message}: ${actual} vs ${expected}`);
function correlation(points) {
  const n = points.length;
  const sx = points.reduce((a, p) => a + p.x, 0), sy = points.reduce((a, p) => a + p.y, 0);
  const sxx = points.reduce((a, p) => a + p.x * p.x, 0), syy = points.reduce((a, p) => a + p.y * p.y, 0);
  const sxy = points.reduce((a, p) => a + p.x * p.y, 0);
  return (n * sxy - sx * sy) / Math.sqrt((n * sxx - sx * sx) * (n * syy - sy * sy));
}
function correct(step) { return step.choices.find(choice => choice.id === step.correct); }
let cases = 0;
const reportSteps = new Set(), rateDenominators = new Map(), answerPositions = new Set();
for (const track of L.describe().tracks) {
  for (let level = 1; level <= track.lessons; level++) {
    for (const variation of [0, 1, 2]) {
      const c = L.makeCase(track.id, level, variation);
      assert.deepEqual(c, L.makeCase(track.id, level, variation), `${c.id}: stable case during a re-render`);
      assert(Object.isFrozen(c) && Object.isFrozen(c.steps), `${c.id}: no accidental mutation of the answer key`);
      assert(c.evidence && c.goal && c.summary && c.synthetic, `${c.id}: case is contextualized as training data`);
      for (const step of c.steps) {
        assert(step.question && step.instruction && step.explanation, `${c.id}/${step.id}: teach the decision and why`);
        assert.equal(new Set(step.choices.map(x => x.id)).size, step.choices.length, `${c.id}/${step.id}: distinct choice IDs`);
        assert.equal(new Set(step.choices.map(x => x.title)).size, step.choices.length, `${c.id}/${step.id}: distinguishable answers`);
        assert.equal(step.choices.filter(x => x.id === step.correct).length, 1, `${c.id}/${step.id}: one intended answer`);
        answerPositions.add(step.choices.findIndex(x => x.id === step.correct));
      }
      if (track.id === 'rates') {
        const m = c.metric;
        assert(m.denominator > 0 && m.numerator >= 0, `${c.id}: rate can be calculated from the supplied observations`);
        close(m.result, m.numerator / m.denominator * 100, `${c.id}: rate arithmetic`);
        assert.equal(correct(c.steps.find(s => s.id === 'calculate')).title, m.displayResult, `${c.id}: result block matches the calculation`);
        const numeratorText = correct(c.steps.find(s => s.id === 'numerator')).title;
        if (m.id === 'tnmcm') {
          const match = numeratorText.match(/^(\d+) \+ (\d+) = (\d+)/);
          assert(match, `${c.id}: the two status buckets remain visible`);
          assert.equal(Number(match[1]) + Number(match[2]), m.numerator, `${c.id}: NMC component hours add to the numerator`);
          assert.equal(Number(match[3]), m.numerator, `${c.id}: displayed NMC sum`);
        } else assert(numeratorText.startsWith(String(m.numerator)), `${c.id}: numerator block uses the observed count`);
        assert(correct(c.steps.find(s => s.id === 'denominator')).title.startsWith(String(m.denominator)), `${c.id}: denominator block uses the observed population`);
        rateDenominators.set(m.id, m.denominatorLabel);
        if (m.id === 'fix8') {
          assert(/breaks/.test(m.denominatorLabel) && !/flight|sortie/.test(m.denominatorLabel), `${c.id}: fixes use eligible breaks`);
          assert(/observed.*8.hour|8.hour.*observed|complete 8.hour follow.up/i.test(c.evidence), `${c.id}: the repair observation window is explicit`);
        }
        if (m.id === 'cann') assert.equal(m.unit, 'actions per 100 flights', 'CANN is an action rate rather than an asset percentage');
        if (['mc', 'tnmcm'].includes(m.id)) assert.equal(m.denominatorLabel, 'possessed hours', `${c.id}: time-based metric uses hours`);
      }
      if (track.id === 'reports') for (const step of c.steps) reportSteps.add(step.id);
      if (c.chart?.kind === 'line') for (const series of c.chart.series) {
        assert.equal(series.values.length, c.chart.labels.length, `${c.id}: each chart value has a time label`);
        assert(series.values.every(Number.isFinite), `${c.id}: chart observations are finite`);
      }
      if (track.id === 'trend') {
        const values = c.chart.series[0].values;
        close(c.stats.first, values[0], `${c.id}: first observation`);
        close(c.stats.last, values.at(-1), `${c.id}: last observation`);
        close(c.stats.change, values.at(-1) - values[0], `${c.id}: endpoint change`);
        close(c.stats.mean, average(values), `${c.id}: descriptive mean`);
        if (c.stats.pattern === 'rising') assert(c.stats.change > 0);
        if (c.stats.pattern === 'falling') assert(c.stats.change < 0);
        if (c.stats.pattern === 'cyclical') assert.deepEqual(values.slice(0, 4), values.slice(4, 8), `${c.id}: repeated cycle is actually in the chart`);
        if (c.stats.pattern === 'outlier') assert.equal(values.indexOf(Math.max(...values)), 5, `${c.id}: June is actually the high observation`);
      }
      if (track.id === 'correlation') {
        const r = correlation(c.chart.points);
        close(c.stats.r, r, `${c.id}: correlation is computed from displayed pairs`);
        if (c.stats.pattern === 'positive') assert(r > .8);
        if (c.stats.pattern === 'negative') assert(r < -.8);
        if (!['positive', 'negative'].includes(c.stats.pattern)) assert(Math.abs(r) < .1, `${c.id}: weak association case must be weak`);
        const text = correct(c.steps.find(s => s.id === 'meaning')).title;
        assert(!/proves.*cause|proves.*causation/i.test(text), `${c.id}: association does not prove causation`);
      }
      if (track.id === 'difference') {
        const [a, b] = c.chart.groups.map(group => group.values);
        close(c.stats.meanA, average(a), `${c.id}: first mean`);
        close(c.stats.meanB, average(b), `${c.id}: second mean`);
        close(c.stats.difference, average(b) - average(a), `${c.id}: stated B-minus-A direction`);
        const ss = (xs, m) => xs.reduce((n, x) => n + (x - m) ** 2, 0) / (xs.length - 1) / xs.length;
        const va = ss(a, average(a)), vb = ss(b, average(b));
        close(c.stats.t, (average(a) - average(b)) / Math.sqrt(va + vb), `${c.id}: Welch test statistic`);
        close(c.stats.df, (va + vb) ** 2 / (va ** 2 / (a.length - 1) + vb ** 2 / (b.length - 1)), `${c.id}: Welch degrees of freedom`);
        assert.equal(c.stats.significant, c.stats.p < c.stats.alpha, `${c.id}: conclusion follows declared threshold`);
        assert(c.stats.p >= 0 && c.stats.p <= 1);
        if (level === 2) assert.equal(c.stats.significant, false, `${c.id}: similar-group case cannot reward a false difference`);
      }
      if (track.id === 'improve') {
        const values = c.chart.series[0].values;
        close(c.stats.baseline, values[0], `${c.id}: baseline matches the chart`);
        close(c.stats.followup, values.at(-1), `${c.id}: follow-up matches the chart`);
        close(c.stats.change, values.at(-1) - values[0], `${c.id}: reported change matches the chart`);
        if (!c.stats.sourceValidated) {
          const text = correct(c.steps.find(s => s.id === 'decision')).title;
          assert(/reconcil|repair|population/i.test(text), `${c.id}: compromised data require correction before judging the intervention`);
        }
      }
      cases++;
    }
  }
}
assert.equal(L.makeCase('rates', 1, 0).metric.result, 20, 'The initial worked case is explicitly 2/10 = 20%');
assert.equal(rateDenominators.size, 8, 'Eight distinct rate definitions are exercised');
assert(answerPositions.size >= 3, 'Answer position is not a fixed cue');
for (const id of ['requirement', 'authority', 'source', 'window', 'validate', 'calculate', 'comments', 'review', 'submit', 'archive', 'correction'])
  assert(reportSteps.has(id), `Reporting workflow covers ${id}`);
// Reference values independently calculated with scipy.stats.ttest_ind(equal_var=False).
close(L.makeCase('difference', 2, 0).stats.p, .6697830297957642, 'Welch p-value agrees with an independent implementation');
assert(L.makeCase('difference', 1, 0).stats.p < .001, 'Large difference remains clearly below the displayed reporting threshold');
console.log(`PASS evidence review: ${cases} deterministic cases; eight correct rate populations/results; traceable reporting steps; chart-derived trends, correlations, group differences, and improvement conclusions. Statistical calculations checked separately from the UI answer key.`);
