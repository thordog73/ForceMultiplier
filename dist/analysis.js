(function () {
  'use strict';
  const F = window.FM;
  const rnd = (n, d = 2) => Math.round((n + Number.EPSILON) * Math.pow(10, d)) / Math.pow(10, d);
  const sum = a => a.reduce((s, x) => s + x, 0);
  const mean = a => sum(a) / a.length;
  const median = a => { const b = a.slice().sort((x, y) => x - y); return b.length % 2 ? b[(b.length - 1) / 2] : (b[b.length / 2 - 1] + b[b.length / 2]) / 2; };
  const sd = a => Math.sqrt(sum(a.map(x => Math.pow(x - mean(a), 2))) / (a.length - 1));
  const corr = (x, y) => { const mx = mean(x), my = mean(y); return sum(x.map((v, i) => (v - mx) * (y[i] - my))) / Math.sqrt(sum(x.map(v => (v - mx) ** 2)) * sum(y.map(v => (v - my) ** 2))); };
  const slope = (x, y) => { const mx = mean(x), my = mean(y); return sum(x.map((v, i) => (v - mx) * (y[i] - my))) / sum(x.map(v => (v - mx) ** 2)); };
  const normalCdf = z => { const sign = z < 0 ? -1 : 1, x = Math.abs(z) / Math.sqrt(2), t = 1 / (1 + 0.3275911 * x); const erf = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return (1 + sign * erf) / 2; };
  const present = x => x !== null && x !== undefined && String(x).trim() !== '';
  const ck = (id, label, ok, feedback, critical = false) => ({ id, label, ok: !!ok, feedback, critical });
  const num = (a, id, expected, label, feedback, critical = false, tolerance = 0.05) => ck(id, label, present(a[id]) && Number.isFinite(Number(a[id])) && Math.abs(Number(a[id]) - expected) <= tolerance, feedback, critical);
  const sel = (a, id, expected, label, feedback, critical = false) => ck(id, label, present(a[id]) && String(a[id]) === String(expected), feedback, critical);
  const nf = (id, label, extra = {}) => ({ id, label, kind: 'number', step: 'any', ...extra });
  const sf = (id, label, choices, extra = {}) => ({ id, label, kind: 'select', options: choices.map(x => typeof x === 'string' ? { value: x, label: x } : { value: x[0], label: x[1] }), ...extra });
  const context = c => Object.assign({ id: 'equipment', name: 'Equipment services', asset: 'unit', assets: 'units', job: 'booking', jobs: 'bookings', org: 'Northstar Services' }, c || {});
  const fmt = x => String(rnd(x));
  const chart = (x, y, title, xLabel, yLabel, line = true) => {
    const lo = Math.min(0, ...y), hi = Math.max(...y) * 1.1 || 1, xmin = Math.min(...x), xmax = Math.max(...x);
    const px = v => 70 + (v - xmin) / (xmax - xmin || 1) * 580;
    const py = v => 210 - (v - lo) / (hi - lo || 1) * 165;
    return `<svg viewBox="0 0 710 270" role="img" aria-label="${F.esc(title)}" style="display:block;width:100%;max-height:310px"><title>${F.esc(title)}</title><rect x="0" y="0" width="710" height="270" rx="14" fill="#f5f8fc"/><text x="24" y="26" fill="#22324a" font-size="15" font-weight="600">${F.esc(title)}</text>${[0, 1, 2, 3].map(i => { const yy = 210 - i * 55; return `<line x1="70" x2="650" y1="${yy}" y2="${yy}" stroke="#dce4ef"/><text x="61" y="${yy + 4}" text-anchor="end" font-size="11" fill="#52657b">${fmt(lo + (hi - lo) * i / 3)}</text>`; }).join('')}${line ? `<polyline points="${x.map((v, i) => `${px(v)},${py(y[i])}`).join(' ')}" fill="none" stroke="#4556db" stroke-width="3"/>` : ''}${x.map((v, i) => `<circle cx="${px(v)}" cy="${py(y[i])}" r="5" fill="#4556db"><title>${F.esc(xLabel)} ${fmt(v)}; ${F.esc(yLabel)} ${fmt(y[i])}</title></circle>${line ? `<text x="${px(v)}" y="229" text-anchor="middle" font-size="11" fill="#52657b">${fmt(v)}</text>` : ''}`).join('')}<text x="360" y="252" text-anchor="middle" font-size="12" fill="#52657b">${F.esc(xLabel)}</text><text transform="translate(18 145) rotate(-90)" text-anchor="middle" font-size="12" fill="#52657b">${F.esc(yLabel)}</text></svg>`;
  };

  // Local statistical calculations for the interactive lab. No service calls.
  // Student t probabilities use the regularized incomplete beta function.
  const logGamma = z => {
    const coefficients = [676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    if (z < 0.5) return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * z)) - logGamma(1 - z);
    z -= 1; let x = 0.99999999999980993;
    coefficients.forEach((v, i) => { x += v / (z + i + 1); });
    const t = z + coefficients.length - 0.5;
    return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
  };
  const betaFraction = (a, b, x) => {
    const floor = 1e-300, qab = a + b, qap = a + 1, qam = a - 1;
    let c = 1, d = 1 - qab * x / qap;
    if (Math.abs(d) < floor) d = floor;
    d = 1 / d; let h = d;
    for (let m = 1; m <= 300; m++) {
      const m2 = 2 * m;
      let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      d = 1 + aa * d; if (Math.abs(d) < floor) d = floor;
      c = 1 + aa / c; if (Math.abs(c) < floor) c = floor;
      d = 1 / d; h *= d * c;
      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      d = 1 + aa * d; if (Math.abs(d) < floor) d = floor;
      c = 1 + aa / c; if (Math.abs(c) < floor) c = floor;
      d = 1 / d; const delta = d * c; h *= delta;
      if (Math.abs(delta - 1) < 3e-14) return h;
    }
    throw new Error('The probability calculation did not converge for these inputs.');
  };
  const regularizedBeta = (x, a, b) => {
    if (!(a > 0 && b > 0 && x >= 0 && x <= 1)) throw new Error('Invalid probability inputs.');
    if (x === 0 || x === 1) return x;
    const term = Math.exp(logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log1p(-x));
    const value = x < (a + 1) / (a + b + 2) ? term * betaFraction(a, b, x) / a : 1 - term * betaFraction(b, a, 1 - x) / b;
    return Math.max(0, Math.min(1, value));
  };
  const tProbability = (t, df) => {
    if (!(df > 0) || Number.isNaN(t)) return null;
    if (!Number.isFinite(t)) return 0;
    return regularizedBeta(df / (df + t * t), df / 2, 0.5);
  };
  const tCritical = (df, alpha = 0.05) => {
    if (!(df > 0 && alpha > 0 && alpha < 1)) return null;
    let low = 0, high = 2;
    while (tProbability(high, df) > alpha && high < 1e12) high *= 2;
    for (let i = 0; i < 90; i++) { const mid = (low + high) / 2; if (tProbability(mid, df) > alpha) low = mid; else high = mid; }
    return (low + high) / 2;
  };
  const numericSeries = values => {
    if (!Array.isArray(values) || values.some(v => typeof v !== 'number' || !Number.isFinite(v))) throw new Error('Use a series of finite numbers; remove labels, blanks, and missing values explicitly.');
    return values.slice();
  };
  const summarize = values => {
    const a = numericSeries(values), n = a.length;
    if (!n) return { n: 0, mean: null, median: null, sampleSD: null, min: null, max: null };
    return { n, mean: mean(a), median: median(a), sampleSD: n > 1 ? sd(a) : null, min: Math.min(...a), max: Math.max(...a) };
  };
  const correlation = (xs, ys) => {
    const x = numericSeries(xs), y = numericSeries(ys), n = x.length;
    if (n !== y.length) throw new Error('Correlation needs the same number of X and Y values, kept in their original pairs.');
    const unavailable = { n, r: null, t: null, df: n > 2 ? n - 2 : null, p: null, method: 'Pearson correlation', warning: 'At least two pairs and nonzero variation in both columns are required.' };
    if (n < 2 || sd(x) === 0 || sd(y) === 0) return unavailable;
    const r = Math.max(-1, Math.min(1, corr(x, y)));
    if (!Number.isFinite(r)) return { ...unavailable, warning: 'The values exceed a stable calculation range. Rescale the measurements.' };
    const df = n - 2;
    const t = n > 2 ? (Math.abs(r) === 1 ? (r > 0 ? Infinity : -Infinity) : r * Math.sqrt(df / (1 - r * r))) : null;
    return { n, r, t, df: n > 2 ? df : null, p: n > 2 ? tProbability(t, df) : null, method: 'Pearson correlation; two-sided t test of zero population correlation', warning: n > 2 ? 'Inference assumes independent paired observations and an appropriate bivariate normal model. Association does not establish causation.' : 'Two points determine a line; at least three pairs are required for this significance test.' };
  };
  const compare = (aValues, bValues) => {
    const a = numericSeries(aValues), b = numericSeries(bValues), sa = summarize(a), sb = summarize(b);
    const result = { nA: a.length, nB: b.length, meanA: sa.mean, meanB: sb.mean, difference: a.length && b.length ? sb.mean - sa.mean : null, standardError: null, t: null, df: null, p: null, ci: null, ciLow: null, ciHigh: null, confidenceLevel: 0.95, method: 'Welch independent-samples t test; difference = B minus A' };
    if (a.length < 2 || b.length < 2) return { ...result, warning: 'At least two observations in each independent group are required for inference.' };
    const va = sa.sampleSD ** 2 / a.length, vb = sb.sampleSD ** 2 / b.length, se = Math.sqrt(va + vb);
    if (!Number.isFinite(se) || se === 0) return { ...result, standardError: se === 0 ? 0 : null, warning: 'The samples have no estimable sampling variation, or the values exceed the stable numeric range. An inferential result is not available.' };
    const df = (va + vb) ** 2 / (va ** 2 / (a.length - 1) + vb ** 2 / (b.length - 1)), t = result.difference / se, critical = tCritical(df), margin = critical * se;
    return { ...result, standardError: se, t, df, p: tProbability(t, df), ci: [result.difference - margin, result.difference + margin], ciLow: result.difference - margin, ciHigh: result.difference + margin, warning: 'Inference assumes independent observations and independent samples with an appropriate sampling design; small skewed samples may not support this approximation. A group difference alone does not establish causation.' };
  };
  const trend = values => {
    const y = numericSeries(values), n = y.length;
    if (n < 2) return { n, slope: null, intercept: null, r2: null, method: 'Descriptive least-squares trend', warning: 'At least two ordered values are required.' };
    const x = y.map((_, i) => i + 1), b = slope(x, y), rv = sd(y) === 0 ? null : corr(x, y);
    return { n, slope: b, intercept: mean(y) - b * mean(x), r2: rv === null ? null : rv * rv, method: 'Descriptive least-squares trend; equally spaced indices start at 1', warning: 'Slope is the outcome-unit change per observation interval. This descriptive fit does not establish a cause or guarantee a forecast.' };
  };
  F.stats = { summarize, correlation, compare, trend, tProbability, tCritical, defaults: { a: [8, 7, 9, 6, 10, 8, 11, 7], b: [6, 5, 8, 6, 7, 5, 9, 6], x: [1, 2, 3, 4, 5, 6, 7, 8], y: [3, 4, 4, 6, 5, 7, 8, 9] } };

  const track = {
    id: 'analysis', title: 'Analysis', kicker: 'Make evidence useful', color: '#5362d6', icon: 'chart',
    description: 'Turn source records into sound calculations, useful comparisons, and decisions you can explain.',
    outcome: 'Validate the inputs, calculate the right measures, distinguish a signal from uncertainty, and defend a recommendation.',
    reference: [
      { name: 'A percentage', formula: 'Relevant part ÷ eligible whole × 100', meaning: 'The numerator must be a subset of the denominator. Both use the same period, population, and units.', example: '9 late deliveries ÷ 60 completed deliveries × 100 = 15%.' },
      { name: 'Maintenance-attributed downtime', formula: '(Maintenance-only hours + maintenance-and-parts hours) ÷ in-scope asset-hours × 100', meaning: 'In this app, time awaiting both maintenance work and parts is included. Define the scope before calculation.', example: '(32 + 8) ÷ 400 × 100 = 10%.' },
      { name: 'Parts-attributed downtime', formula: '(Parts-only hours + maintenance-and-parts hours) ÷ in-scope asset-hours × 100', meaning: 'The shared maintenance-and-parts time overlaps with maintenance-attributed downtime. Do not add the two rates to obtain total downtime.', example: '(20 + 8) ÷ 400 × 100 = 7%.' },
      { name: 'Availability', formula: '(In-scope asset-hours − all unavailable asset-hours) ÷ in-scope asset-hours × 100', meaning: 'Count every unavailable hour once. In scenarios with only three mutually exclusive downtime states, unavailable = maintenance only + parts only + both.', example: '(400 − 32 − 20 − 8) ÷ 400 × 100 = 85%.' },
      { name: 'Failure events per 100 completed jobs', formula: 'Qualifying failure events ÷ completed jobs × 100', meaning: 'This is an event rate per exposure, not necessarily a percentage of assets. Multiple events per job can produce a rate above 100.', example: '12 events ÷ 240 completed jobs × 100 = 5 events per 100 jobs.' },
      { name: 'Timely repair', formula: 'Qualifying failures repaired within the time window ÷ all eligible failures × 100', meaning: 'Use the stated failure cohort. In these cases, each eligible failure has been observed for the full repair window; open or late failures remain in the denominator.', example: '18 repaired within 8 hours ÷ 24 eligible failures × 100 = 75%.' },
      { name: 'Combined rate', formula: 'Sum of numerators ÷ sum of denominators × scale', meaning: 'Use the underlying counts. A simple average of group percentages is generally wrong when exposures differ.', example: '(2 + 9) ÷ (20 + 180) × 100 = 5.5%.' },
      { name: 'Sample standard deviation', formula: 'Square root of [sum of (value − sample mean)² ÷ (n − 1)]', meaning: 'Describes spread around the mean in the original units. This formula is for a sample with at least two observations.', example: 'For 2, 4, 6 hours: mean = 4 hours; sample SD = 2 hours.' },
      { name: 'Measurement scales', formula: 'Nominal: labels; ordinal: ordered categories; interval: equal steps; ratio: equal steps and a meaningful zero', meaning: 'The measurement scale affects which arithmetic and summaries make sense. A rank gap does not automatically represent an equal-sized difference.', example: 'Site name is nominal; priority rank is ordinal; Celsius temperature is interval; elapsed repair time is ratio.' },
      { name: 'Percentage points', formula: 'Later percentage − earlier percentage', meaning: 'An absolute difference between rates. Relative percentage change is a different calculation.', example: 'Availability rises from 80% to 88%: +8 percentage points; +10% relative to 80%.' },
      { name: 'Zero denominator', formula: 'Rate undefined when eligible exposure = 0', meaning: 'Report not applicable or not estimable and explain why. Do not silently substitute zero percent.', example: 'No eligible failures means the timely-repair rate cannot be calculated.' },
      { name: 'Statistical evidence', formula: 'Compare a prespecified p-value with a prespecified significance level', meaning: 'A p-value is a probability of results at least as incompatible with a specified null model as the observed result, assuming that model and its assumptions. It is not the probability the null is true. Also report effect size, uncertainty, and study limitations.', example: 'p = 0.03 with alpha = 0.05 supports rejecting the specified null, but does not establish a useful effect or causation.' }
    ],
    lessons: []
  };

  track.lessons.push({
    id: 'one-rate', title: 'Start with one rate', minutes: 4, level: 'Foundation', summary: 'Build a percentage from a count and its eligible total.',
    build(seed, c) {
      c = context(c); const r = F.rng(seed), total = F.int(r, 6, 18) * 5, late = F.int(r, 2, Math.floor(total / 4)), rate = late / total * 100;
      return {
        brief: `${c.org} completed ${total} ${c.jobs} this week. ${late} finished after the agreed deadline. Report the late-completion percentage. Every completed ${c.job} belongs in this weekly denominator.`,
        facts: [{ label: `Completed ${c.jobs}`, value: total }, { label: 'Late completions', value: late }, { label: 'Reporting period', value: 'One week' }], tables: [],
        teach: ['A percentage describes a part of an eligible whole.', 'Write the numerator, denominator, and units before calculating.', 'Multiply by 100 once. Round the final result, not the underlying counts.'],
        hint: `${late} ÷ ${total} × 100. The eligible whole is all completed ${c.jobs}, not only those that were late.`,
        fields: [nf('numerator', 'Late-completion count', { min: 0, unit: c.jobs }), nf('denominator', 'Eligible completed total', { min: 0, unit: c.jobs }), nf('rate', 'Late-completion percentage', { min: 0, max: 100, unit: '%' })],
        model: { numerator: late, denominator: total, rate: rnd(rate) },
        check: a => [num(a, 'numerator', late, 'Relevant events counted', `The late-completion numerator is ${late}.`), num(a, 'denominator', total, 'Eligible population used', `All ${total} completed ${c.jobs} belong in the denominator.`, true, 0), num(a, 'rate', rate, 'Percentage calculated', `${late} ÷ ${total} × 100 = ${fmt(rate)}%.`)],
        debrief: 'A correct percentage needs a defined scope as well as correct arithmetic. The same structure applies to late deliveries, rejected orders, missed appointments, and incomplete records.'
      };
    }
  });

  track.lessons.push({
    id: 'exposure-and-overlap', title: 'Choose the right denominator', minutes: 6, level: 'Foundation', summary: 'Use asset-hours and avoid counting the same unavailable hour twice.',
    build(seed, c) {
      c = context(c); const r = F.rng(seed), units = F.int(r, 5, 12), hours = F.pick(r, [8, 10, 12]), h = units * hours, m = F.int(r, 5, 12), p = F.int(r, 3, 8), both = F.int(r, 2, 5), un = m + p + both;
      const availability = (h - un) / h * 100, mt = (m + both) / h * 100, pt = (p + both) / h * 100;
      return {
        brief: `There are ${units} ${c.assets} in scope for a ${hours}-hour reporting day. The event log below partitions unavailable time into three non-overlapping states. There is no other downtime. Build the daily measures without double-counting shared time.`,
        facts: [{ label: 'Units in scope', value: units }, { label: 'Hours per unit', value: hours }, { label: 'Completed jobs', value: F.int(r, 20, 40) }],
        tables: [{ title: 'Mutually exclusive time states', headers: ['State', 'Asset-hours'], rows: [['Maintenance work only', m], ['Waiting for parts only', p], ['Maintenance work and parts simultaneously', both]] }],
        teach: ['Asset-hours combine the number of assets and the time each belongs in scope.', 'A downtime rate uses asset-hours, not completed jobs.', 'Maintenance-attributed and parts-attributed downtime both include the shared state. Total unavailable time counts that state once.', 'If there are no eligible failures, timely repair is undefined rather than zero.'],
        hint: `Scope = ${units} × ${hours}. Unavailable = ${m} + ${p} + ${both}. Maintenance-attributed = ${m} + ${both}; parts-attributed = ${p} + ${both}.`,
        fields: [nf('hours', 'In-scope asset-hours', { unit: 'asset-hours' }), nf('unavailable', 'Total unavailable time', { unit: 'asset-hours' }), nf('maintenance', 'Maintenance-attributed downtime', { unit: '%' }), nf('parts', 'Parts-attributed downtime', { unit: '%' }), nf('available', 'Availability', { unit: '%' }), sf('zero', 'No eligible failures occurred. Report timely repair as:', [['undefined', 'Not estimable: no eligible failures'], ['zero', '0%: no timely repairs recorded'], ['full', '100%: nothing required repair']])],
        model: { hours: h, unavailable: un, maintenance: rnd(mt), parts: rnd(pt), available: rnd(availability), zero: 'undefined' },
        check: a => [num(a, 'hours', h, 'Time exposure defined', `${units} × ${hours} = ${h} asset-hours.`, true, 0), num(a, 'unavailable', un, 'Shared hours counted once', `${m} + ${p} + ${both} = ${un} unavailable asset-hours.`, true, 0), num(a, 'maintenance', mt, 'Maintenance attribution calculated', `(${m} + ${both}) ÷ ${h} × 100 = ${fmt(mt)}%.`), num(a, 'parts', pt, 'Parts attribution calculated', `(${p} + ${both}) ÷ ${h} × 100 = ${fmt(pt)}%.`), num(a, 'available', availability, 'Availability reconciles', `(${h} − ${un}) ÷ ${h} × 100 = ${fmt(availability)}%.`), sel(a, 'zero', 'undefined', 'Zero denominator handled honestly', 'With no eligible failures, the timely-repair denominator is zero. Report the rate as not estimable.', true)],
        debrief: 'Define states so the total reconciles. Overlapping component measures cannot be added as if they described separate time.'
      };
    }
  });

  track.lessons.push({
    id: 'combine-rates', title: 'Combine unequal workloads', minutes: 5, level: 'Foundation', summary: 'Aggregate counts before calculating a combined rate.',
    build(seed, c) {
      c = context(c); const r = F.rng(seed), small = F.int(r, 2, 5) * 10, large = F.int(r, 12, 25) * 10, ns = F.int(r, 3, 8), nl = F.int(r, 5, 15), n = ns + nl, d = small + large, rate = n / d * 100, simple = (ns / small * 100 + nl / large * 100) / 2;
      return {
        brief: `Two teams completed different numbers of ${c.jobs}. Management needs one combined late-completion rate for the same week.`,
        facts: [], tables: [{ title: 'Weekly team totals', headers: ['Team', `Completed ${c.jobs}`, 'Late completions', 'Team late rate'], rows: [['East', small, ns, `${fmt(ns / small * 100)}%`], ['West', large, nl, `${fmt(nl / large * 100)}%`]] }],
        teach: ['A combined rate weights each observation equally, not each team equally.', 'Add numerators and add denominators, then divide.', 'A mean of percentages answers a different question when workloads differ.'],
        hint: `Combine ${ns} + ${nl} late completions and ${small} + ${large} completed ${c.jobs}.`,
        fields: [nf('late', 'Combined late completions'), nf('total', 'Combined completed total'), nf('rate', 'Combined late-completion rate', { unit: '%' }), sf('method', 'Method to retain in the report', [['counts', 'Sum the underlying counts, then divide'], ['average', 'Give each team rate equal weight'], ['largest', 'Use only the larger team’s rate']])],
        model: { late: n, total: d, rate: rnd(rate), method: 'counts' },
        check: a => [num(a, 'late', n, 'Numerators combined', `${ns} + ${nl} = ${n}.`), num(a, 'total', d, 'Exposures combined', `${small} + ${large} = ${d}.`, true, 0), num(a, 'rate', rate, 'Weighted result calculated', `${n} ÷ ${d} × 100 = ${fmt(rate)}%. A simple average would be ${fmt(simple)}%.`), sel(a, 'method', 'counts', 'Aggregation method defensible', 'Use the combined numerator and combined denominator. Team size determines contribution to the overall rate.', true)],
        debrief: 'Use this method for aggregated error rates, availability across assets, defects across production runs, and service performance across sites.'
      };
    }
  });

  track.lessons.push({
    id: 'source-audit', title: 'Reconcile the source records', minutes: 7, level: 'Applied', summary: 'Resolve duplicated and out-of-scope events before publishing a rate.',
    build(seed, c) {
      c = context(c); const r = F.rng(seed), jobs = F.int(r, 12, 24) * 10, repaired = F.int(r, 3, 6), open = F.int(r, 2, 4), valid = repaired + open;
      const rows = Array.from({ length: valid }, (_, i) => [`E-${101 + i}`, 'Current week', i < repaired ? 'Repaired in 8 hours' : 'Still open after 8 hours', 'Original event']);
      rows.push(['E-101', 'Current week', 'Repaired in 8 hours', 'Duplicate import of E-101']); rows.push(['E-099', 'Previous week', 'Repaired in 8 hours', 'Outside this reporting cohort']);
      return {
        brief: `The summary counted every imported row as a new failure. Use the unique event ID and the reporting week to rebuild the figures. The ${jobs} completed ${c.jobs} are independently verified. Every current-week failure has been observed for at least 8 hours.`,
        facts: [{ label: `Verified completed ${c.jobs}`, value: jobs }, { label: 'Imported rows', value: rows.length }, { label: 'Repair window', value: '8 hours' }],
        tables: [{ title: 'Imported failure log', headers: ['Event ID', 'Cohort', 'Outcome', 'Source note'], rows }],
        teach: ['A repeated identifier may be a repeated record, not a new event.', 'Apply the same cohort rules to the numerator and denominator.', 'Open failures that have passed the repair window remain in the eligible failure denominator.', 'Preserve the original source and record the reason for excluding a row.'],
        hint: 'Exclude the duplicate import and previous-week event. Count the remaining unique failures, including those still open after 8 hours.',
        fields: [sf('duplicate', 'Disposition of the second E-101 record', [['exclude', 'Exclude duplicate; retain source lineage'], ['count', 'Count again as another failure'], ['delete', 'Delete both records with this ID']]), sf('previous', 'Disposition of E-099', [['exclude', 'Exclude from this week; preserve record'], ['count', 'Include because it appears in the file'], ['move', 'Change its date to the current week']]), nf('failures', 'Eligible unique failures'), nf('timely', 'Eligible failures repaired within 8 hours'), nf('failureRate', `Failure events per 100 completed ${c.jobs}`, { unit: 'per 100 jobs' }), nf('repairRate', 'Timely-repair percentage', { unit: '%' })],
        model: { duplicate: 'exclude', previous: 'exclude', failures: valid, timely: repaired, failureRate: rnd(valid / jobs * 100), repairRate: rnd(repaired / valid * 100) },
        check: a => [sel(a, 'duplicate', 'exclude', 'Duplicate excluded with lineage', 'Count each unique event once. Keep the raw import and record why the second E-101 row was excluded.', true), sel(a, 'previous', 'exclude', 'Reporting cohort preserved', 'E-099 belongs to the previous week. Do not modify its date to fit this report.', true), num(a, 'failures', valid, 'Failure cohort reconciled', `${valid} unique current-week failures remain.`, true, 0), num(a, 'timely', repaired, 'Timely repairs reconciled', `${repaired} eligible failures were repaired within 8 hours.`, false, 0), num(a, 'failureRate', valid / jobs * 100, 'Failure exposure correct', `${valid} ÷ ${jobs} × 100 = ${fmt(valid / jobs * 100)} events per 100 completed ${c.jobs}.`), num(a, 'repairRate', repaired / valid * 100, 'Repair denominator correct', `${repaired} ÷ ${valid} × 100 = ${fmt(repaired / valid * 100)}%. The open failures remain eligible.`)],
        debrief: 'Reliable analysis begins before the calculator. Keep exclusions visible so another analyst can reconstruct the result.'
      };
    }
  });

  track.lessons.push({
    id: 'describe-distribution', title: 'Describe a distribution', minutes: 6, level: 'Applied', summary: 'Calculate center and spread, then explain an unusually long job.',
    build(seed, c) {
      c = context(c); const r = F.rng(seed), base = F.int(r, 2, 5), values = [base, base + 1, base + 1, base + 2, base + 2, base + 3, base + F.int(r, 13, 19)], avg = mean(values), med = median(values), spread = sd(values);
      return {
        brief: `A sample of seven completed ${c.jobs} has these turnaround times. One job involved a verified extra component replacement. Describe the sample without quietly removing the long job.`,
        facts: [{ label: 'Observation type', value: 'Sample of completed jobs' }, { label: 'Unit', value: 'Hours per job' }], tables: [{ title: 'Turnaround sample', headers: ['Job', 'Hours'], rows: values.map((v, i) => [`J-${i + 1}`, v]) }],
        teach: ['The mean uses every value. The median is the middle ordered value.', 'Sample standard deviation describes spread around the mean; its units match the observations.', 'A real extreme observation can explain operational variability. Investigate it and disclose any separate analysis.', 'A sample of completed jobs does not describe unfinished jobs automatically.'],
        hint: `Mean = ${sum(values)} ÷ 7. The fourth ordered value is the median. For sample SD, divide the squared-deviation total by 6 before taking the square root.`,
        fields: [nf('mean', 'Sample mean turnaround', { unit: 'hours' }), nf('median', 'Sample median turnaround', { unit: 'hours' }), nf('sd', 'Sample standard deviation', { unit: 'hours' }), sf('scale', 'Measurement scale of elapsed turnaround hours', [['ratio', 'Ratio: equal units and a meaningful zero'], ['interval', 'Interval: equal units with an arbitrary zero'], ['ordinal', 'Ordinal: ordered categories without equal gaps'], ['nominal', 'Nominal: labels with no numeric order']]), sf('outlier', 'Treatment of the verified long job', [['retain', 'Retain it and explain its operational cause'], ['drop', 'Remove it because it raises the average'], ['replace', 'Replace it with the median before reporting']]), sf('scope', 'Population directly described by these values', [['completed', 'These seven completed jobs'], ['all', 'All unfinished and completed jobs'], ['future', 'Every job in the next reporting period']])],
        model: { mean: rnd(avg), median: med, sd: rnd(spread), scale: 'ratio', outlier: 'retain', scope: 'completed' },
        check: a => [num(a, 'mean', avg, 'Mean calculated', `${sum(values)} ÷ 7 = ${fmt(avg)} hours.`), num(a, 'median', med, 'Median calculated', `The middle ordered value is ${med} hours.`), num(a, 'sd', spread, 'Sample spread calculated', `Sample standard deviation uses n − 1 = 6 and equals ${fmt(spread)} hours.`, false, 0.06), sel(a, 'scale', 'ratio', 'Measurement scale recognized', 'Elapsed duration has equal units and a meaningful zero; four elapsed hours is twice two elapsed hours.'), sel(a, 'outlier', 'retain', 'Valid observation preserved', 'The component replacement is a verified event. Keep it and explain it; any alternative analysis should disclose its exclusion.', true), sel(a, 'scope', 'completed', 'Inference scope honest', 'These observations describe the seven sampled completed jobs. Unfinished work and future work need additional evidence.')],
        debrief: 'Report more than a single average when a long tail matters. The mean, median, and spread answer different operational questions.'
      };
    }
  });

  track.lessons.push({
    id: 'read-trend', title: 'Read change over time', minutes: 6, level: 'Applied', summary: 'Quantify a trend and distinguish percentage points from relative change.',
    build(seed, c) {
      c = context(c); const r = F.rng(seed), start = F.int(r, 76, 86), direction = F.pick(r, [-1, 1]), increments = [0, 1, 3, 2, 5, 7].map(v => direction * v), y = increments.map(v => start + v), x = [1, 2, 3, 4, 5, 6], change = y[5] - y[0], rel = change / y[0] * 100, trend = slope(x, y);
      return {
        brief: `${c.org} tracked weekly availability using the same asset-hour definition for six weeks. Describe the direction and magnitude of the observed change. A new work process started in week 3, but the data alone do not establish its effect.`,
        facts: [{ label: 'Consistent definition', value: 'Available asset-hours / in-scope asset-hours' }], tables: [{ title: 'Weekly availability', headers: ['Week', 'Availability'], rows: x.map((v, i) => [v, `${y[i]}%`]) }], visual: chart(x, y, 'Availability over six weeks', 'Week', 'Availability (%)'),
        teach: ['Time order matters: a trend asks how an outcome changes over time.', 'The difference between two percentages is measured in percentage points.', 'Relative percent change divides that difference by the starting percentage.', 'A process change and a trend occurring together are not sufficient to establish causation.'],
        hint: `End minus start = ${y[5]} − ${y[0]}. Relative change = that difference ÷ ${y[0]} × 100. Keep the sign.`,
        fields: [nf('points', 'Week 6 minus week 1', { unit: 'percentage points' }), nf('relative', 'Relative change from week 1', { unit: '%' }), sf('direction', 'Observed direction across the period', [['up', 'Generally increasing availability'], ['down', 'Generally decreasing availability'], ['flat', 'No directional pattern in availability']]), sf('claim', 'Conclusion supported by these data', [['descriptive', 'Availability changed; investigate possible causes'], ['causal', 'The new process caused the entire change'], ['guaranteed', 'The same trend will continue next quarter']])],
        model: { points: change, relative: rnd(rel), direction: direction > 0 ? 'up' : 'down', claim: 'descriptive' },
        check: a => [num(a, 'points', change, 'Absolute change calculated', `${y[5]}% − ${y[0]}% = ${change} percentage points.`), num(a, 'relative', rel, 'Relative change calculated', `${change} ÷ ${y[0]} × 100 = ${fmt(rel)}%.`), sel(a, 'direction', direction > 0 ? 'up' : 'down', 'Trend direction identified', `The overall direction is ${direction > 0 ? 'upward' : 'downward'}; the fitted descriptive slope is ${fmt(trend)} percentage points per week.`), sel(a, 'claim', 'descriptive', 'Causal claim bounded', 'There is no controlled comparison here. Workload, staffing, seasonality, or other changes may explain part of the trend.', true)],
        debrief: 'A trend is a starting point for investigation. Use consistent definitions, inspect the time series, and state the evidence needed to test a causal explanation.'
      };
    }
  });

  track.lessons.push({
    id: 'correlation', title: 'Explore an association', minutes: 7, level: 'Applied', summary: 'Calculate correlation and identify an appropriate follow-up.',
    build(seed, c) {
      c = context(c); const r = F.rng(seed), direction = F.pick(r, [-1, 1]), base = F.int(r, 2, 5), x = [1, 2, 3, 4, 5, 6], noise = [0, 0.7, -0.2, 0.4, -0.4, 0.1], y = x.map((v, i) => rnd((direction > 0 ? base + v * 1.4 : base + 10 - v * 1.4) + noise[i], 1)), rv = corr(x, y);
      return {
        brief: `For six operating days, the team paired the number of waiting jobs with average turnaround time. Calculate the Pearson correlation for these paired observations. These are observational data from a small sample.`,
        facts: [{ label: 'Paired observations', value: 6 }, { label: 'Study type', value: 'Observational' }], tables: [{ title: 'Paired daily observations', headers: ['Day', 'Waiting jobs (X)', 'Mean turnaround hours (Y)'], rows: x.map((v, i) => [i + 1, v, y[i]]) }], visual: chart(x, y, 'Waiting work and turnaround', 'Waiting jobs', 'Turnaround hours', false),
        teach: ['Correlation describes the direction and strength of a linear association between paired variables.', 'Pearson r ranges from −1 to +1 when both variables have nonzero variance.', 'Correlation does not by itself show which variable causes the other or rule out a common cause.', 'Use paired observations. Sorting one column independently destroys the pairing.'],
        hint: `Subtract each column mean, multiply paired deviations, sum those products, and divide by the square root of the product of both squared-deviation sums. Here mean X = ${fmt(mean(x))}; mean Y = ${fmt(mean(y))}.`,
        fields: [nf('r', 'Pearson correlation r', { min: -1, max: 1, help: 'Round to two decimal places.' }), sf('direction', 'Association in this sample', [['positive', 'Higher X is associated with higher Y'], ['negative', 'Higher X is associated with lower Y'], ['none', 'There is no linear association']]), sf('followup', 'Next investigation', [['control', 'Check job mix and staffing; test a planned change'], ['causal', 'Declare the queue the sole cause of turnaround'], ['sort', 'Sort both columns separately to improve the fit']]), sf('constant', 'If all X values were identical, Pearson r would be:', [['undefined', 'Undefined because X has zero variance'], ['zero', 'Exactly zero by definition'], ['one', 'Exactly one because X is consistent']])],
        model: { r: rnd(rv), direction: direction > 0 ? 'positive' : 'negative', followup: 'control', constant: 'undefined' },
        check: a => [num(a, 'r', rv, 'Paired correlation calculated', `Pearson r = ${fmt(rv)} for these six paired observations.`, false, 0.02), sel(a, 'direction', direction > 0 ? 'positive' : 'negative', 'Association direction interpreted', `The association is ${direction > 0 ? 'positive' : 'negative'} in this sample.`), sel(a, 'followup', 'control', 'Follow-up respects observational limits', 'Investigate potential confounders and design a test. The correlation alone does not identify a cause.', true), sel(a, 'constant', 'undefined', 'Degenerate input recognized', 'A constant variable has zero variance, making the Pearson correlation denominator zero.')],
        debrief: 'The direction of an association can be useful even before a cause is known. Keep the paired records, investigate other explanations, and avoid turning a correlation into a causal claim.'
      };
    }
  });

  track.lessons.push({
    id: 'compare-groups', title: 'Compare two groups fairly', minutes: 6, level: 'Applied', summary: 'Compute an observed difference and check whether the groups are comparable.',
    build(seed, c) {
      c = context(c); const r = F.rng(seed), base = F.int(r, 6, 10), diff = F.int(r, 1, 3), a = [base - 2, base, base + 1, base - 1, base + 2], b = a.map((v, i) => v - diff + [0, 1, 0, -1, 0][i]), ma = mean(a), mb = mean(b), delta = mb - ma;
      return {
        brief: `Compare turnaround for two teams. Team A handled mixed-complexity ${c.jobs}; Team B handled only routine ${c.jobs}. These are independent samples of five completed jobs per team.`,
        facts: [{ label: 'Team A work', value: 'Mixed complexity' }, { label: 'Team B work', value: 'Routine only' }], tables: [{ title: 'Independent turnaround samples', headers: ['Observation', 'Team A hours', 'Team B hours'], rows: a.map((v, i) => [i + 1, v, b[i]]) }],
        teach: ['Compute the observed effect before deciding whether it matters.', 'The subtraction direction determines the sign. Here use B minus A.', 'Comparable measurement does not guarantee comparable groups.', 'Row position does not make independent observations paired.'],
        hint: `Mean A = sum of A ÷ 5; mean B = sum of B ÷ 5; observed difference = B − A. The job mix differs between the teams.`,
        fields: [nf('a', 'Team A mean', { unit: 'hours' }), nf('b', 'Team B mean', { unit: 'hours' }), nf('difference', 'Observed difference: B minus A', { unit: 'hours' }), sf('claim', 'Appropriate interpretation', [['observed', 'B is faster in this sample; job mix may explain it'], ['better', 'B is proven better at every type of work'], ['paired', 'Treat each row as a matched pair of jobs']]), sf('next', 'Stronger next comparison', [['match', 'Compare like-for-like complexity and time periods'], ['remove', 'Remove all slow jobs from Team A’s sample'], ['larger', 'Assume a larger sample eliminates job-mix bias']])],
        model: { a: ma, b: mb, difference: delta, claim: 'observed', next: 'match' },
        check: ans => [num(ans, 'a', ma, 'Team A summarized', `Mean A = ${fmt(ma)} hours.`), num(ans, 'b', mb, 'Team B summarized', `Mean B = ${fmt(mb)} hours.`), num(ans, 'difference', delta, 'Effect direction retained', `B minus A = ${fmt(mb)} − ${fmt(ma)} = ${fmt(delta)} hours.`), sel(ans, 'claim', 'observed', 'Comparison limitation identified', 'The observed group difference can reflect complexity mix. Independent rows are not matched pairs.', true), sel(ans, 'next', 'match', 'Next comparison improves comparability', 'Use the same outcome definition and compare similar complexity, staffing conditions, and time periods.')],
        debrief: 'An accurate difference can still support an inaccurate conclusion. Explain which comparison you made and what important differences remain between the groups.'
      };
    }
  });

  track.lessons.push({
    id: 'statistical-evidence', title: 'Interpret statistical evidence', minutes: 7, level: 'Applied', summary: 'Use a prespecified threshold while reporting effect size and uncertainty.',
    build(seed, c) {
      c = context(c); const r = F.rng(seed), significant = F.pick(r, [true, false]), estimate = significant ? -F.pick(r, [0.3, 0.4, 0.5]) : -F.pick(r, [0.5, 0.7, 0.8]), z = significant ? F.pick(r, [2.2, 2.5, 2.8]) : F.pick(r, [0.8, 1.2, 1.5]), standardError = Math.abs(estimate) / z, p = rnd(2 * (1 - normalCdf(z)), 3), lo = estimate - 1.96 * standardError, hi = estimate + 1.96 * standardError;
      return {
        brief: `A planned randomized pilot compared a new workflow with the current workflow. The analysis below was supplied by the study analyst; its assumptions are treated as met for this exercise. The target is a reduction of at least 1 hour. Interpret the result without claiming more than it shows.`,
        facts: [{ label: 'Prespecified alpha', value: '0.05' }, { label: 'Practical target', value: 'At least 1 hour faster' }, { label: 'Null hypothesis', value: 'Mean difference = 0 hours' }],
        tables: [{ title: 'Supplied study output — synthetic pilot', headers: ['Measure', 'Result'], rows: [['Difference: new minus current', `${fmt(estimate)} hours`], ['95% confidence interval', `[${fmt(lo)}, ${fmt(hi)}] hours`], ['Two-sided p-value', p], ['Method', 'Normal approximation; assumptions met for this exercise'], ['Analysis plan', 'One prespecified primary comparison']] }],
        teach: ['The null here states that the population mean difference is zero.', 'With a prespecified alpha of 0.05, p below 0.05 supports rejecting that null under the test assumptions.', 'A nonsignificant result does not prove that the workflows are identical.', 'Statistical significance and practical importance are different. Report the estimated difference and interval.', 'The p-value is not the probability that the null hypothesis is true.'],
        hint: `Compare ${p} with 0.05. The point estimate is a ${fmt(Math.abs(estimate))}-hour reduction; the practical target is 1 hour.`,
        fields: [sf('null', 'Statistical decision at alpha = 0.05', [['reject', 'Reject the specified zero-difference null'], ['retain', 'Do not reject the specified null'], ['probability', 'Assign the null a probability equal to p']]), nf('effect', 'Estimated change: new minus current', { unit: 'hours' }), sf('target', 'Has the result demonstrated the 1-hour target?', [['no', 'No; the estimate and interval do not establish it'], ['yes', 'Yes; any negative estimate meets the target'], ['p', 'Yes; significance alone proves practical value']]), sf('meaning', 'Meaning of the reported p-value', [['conditional', 'Compatibility of the result with the null model'], ['nullchance', 'Probability that the null hypothesis is true'], ['replicate', 'Probability the exact result repeats next time']]), sf('decision', 'Evidence-based next action', [['review', 'Review uncertainty, cost, and additional evidence'], ['guarantee', 'Guarantee the same saving in every location'], ['ignore', 'Discard the effect estimate and report only p']])],
        model: { null: significant ? 'reject' : 'retain', effect: estimate, target: 'no', meaning: 'conditional', decision: 'review' },
        check: a => [sel(a, 'null', significant ? 'reject' : 'retain', 'Prespecified rule applied', `${p} is ${significant ? 'below' : 'above'} 0.05, so ${significant ? 'reject' : 'do not reject'} the zero-difference null. This does not assign a probability to the null.`, true), num(a, 'effect', estimate, 'Effect size retained', `The estimated difference is ${fmt(estimate)} hours, new minus current.`), sel(a, 'target', 'no', 'Practical target evaluated separately', `The estimate is ${fmt(Math.abs(estimate))} hours faster. The interval does not establish a reduction of at least 1 hour.`), sel(a, 'meaning', 'conditional', 'P-value interpretation bounded', 'Under the specified null model and test assumptions, the p-value measures how unusual a result at least this incompatible would be. It is not P(null is true).', true), sel(a, 'decision', 'review', 'Decision uses more than a threshold', 'Consider the effect, uncertainty, implementation cost, and quality of the study. A threshold alone does not decide whether to adopt the workflow.')],
        debrief: 'Publish the estimated effect, its uncertainty, the study design, and the practical threshold together. A small p-value is not a performance target.'
      };
    }
  });

  track.lessons.push({
    id: 'analysis-capstone', title: 'Build and defend an evidence brief', minutes: 14, level: 'Capstone', capstone: true, summary: 'Reconcile a reporting package, calculate five measures, and make a bounded recommendation.',
    build(seed, c) {
      c = context(c); const r = F.rng(seed), rows = ['East', 'Central', 'West'].map(name => ({ name, h: F.int(r, 7, 12) * 100, m: F.int(r, 30, 65), p: F.int(r, 15, 38), b: F.int(r, 5, 15), jobs: F.int(r, 12, 24) * 10, failures: F.int(r, 8, 18) }));
      rows.forEach(x => { x.timely = F.int(r, Math.floor(x.failures / 2), x.failures - 1); });
      const total = key => sum(rows.map(x => x[key]));
      const h = total('h'), m = total('m'), p = total('p'), b = total('b'), jobs = total('jobs'), failures = total('failures'), timely = total('timely'), unavailable = m + p + b, maintenance = (m + b) / h * 100, parts = (p + b) / h * 100, available = (h - unavailable) / h * 100, fr = failures / jobs * 100, tr = timely / failures * 100, inflated = jobs + F.int(r, 2, 5) * 10;
      const unavailableFraction = x => (x.m + x.p + x.b) / x.h;
      const worst = rows.reduce((x, y) => unavailableFraction(x) >= unavailableFraction(y) ? x : y);
      const worstNames = rows.filter(x => Math.abs(unavailableFraction(x) - unavailableFraction(worst)) < 1e-10).map(x => x.name);
      return {
        capstone: true,
        brief: `Prepare ${c.org}’s weekly operations brief. The source ledger is verified. The draft summary contains an incorrect completed-job total and double-counts shared downtime. Rebuild the measures from the ledger, identify a follow-up priority, and make the result reproducible. All failure events are unique, current-week events observed for the full 8-hour repair window. No other unavailability exists in this case.`,
        facts: [{ label: 'Reporting period', value: 'Same seven-day interval at all sites' }, { label: 'Timely-repair window', value: '8 hours from failure' }, { label: 'Draft completed-job total', value: inflated }, { label: 'Draft unavailable hours', value: m + p + 2 * b }],
        tables: [{ title: 'Verified weekly source ledger', headers: ['Site', 'In-scope asset-hours', 'Maintenance only', 'Parts only', 'Both simultaneously', `Completed ${c.jobs}`, 'Eligible failures', 'Repaired ≤8h'], rows: rows.map(x => [x.name, x.h, x.m, x.p, x.b, x.jobs, x.failures, x.timely]) }],
        teach: ['Reconcile the work product to source evidence before interpreting the results.', 'Aggregate source counts, preserving the reporting scope and overlapping-state definitions.', 'Use completed jobs for the failure-event exposure and eligible failures for timely repair.', 'A site with low availability deserves investigation, but the rate alone does not identify a cause.', 'Your recommendation, evidence, limitation, and defense will need a coach’s review.'],
        hint: 'Sum every source column. Unavailable = maintenance only + parts only + both. Maintenance-attributed and parts-attributed measures each include both, so their sum double-counts that state. Compare site availability using each site’s own asset-hour denominator.',
        fields: [
          nf('hours', 'Reconciled in-scope asset-hours', { group: '1. Reconcile the ledger', unit: 'asset-hours' }),
          nf('jobs', `Corrected completed ${c.jobs}`, { group: '1. Reconcile the ledger' }),
          nf('unavailable', 'Corrected total unavailable time', { group: '1. Reconcile the ledger', unit: 'asset-hours' }),
          nf('failures', 'Eligible failure cohort', { group: '1. Reconcile the ledger' }),
          nf('timely', 'Qualifying timely repairs', { group: '1. Reconcile the ledger' }),
          nf('maintenance', 'Maintenance-attributed downtime', { group: '2. Calculate the measures', unit: '%' }),
          nf('parts', 'Parts-attributed downtime', { group: '2. Calculate the measures', unit: '%' }),
          nf('available', 'Availability', { group: '2. Calculate the measures', unit: '%' }),
          nf('failureRate', `Failure events per 100 completed ${c.jobs}`, { group: '2. Calculate the measures', unit: 'per 100 jobs' }),
          nf('repairRate', 'Timely-repair percentage', { group: '2. Calculate the measures', unit: '%' }),
          sf('priority', 'Site with lowest observed availability', rows.map(x => [x.name, x.name]), { group: '3. Evaluate and recommend' }),
          sf('claim', 'Claim the current evidence supports', [['investigate', 'Investigate the low-availability site and its work mix'], ['cause', 'Blame the site’s staff solely on the availability rate'], ['parts', 'Assume every unavailable hour is a parts delay']], { group: '3. Evaluate and recommend' }),
          sf('record', 'Handling of the incorrect draft figures', [['trace', 'Preserve draft, cite source, document the correction'], ['overwrite', 'Overwrite silently so only the new figures remain'], ['average', 'Average the draft with the verified source totals']], { group: '3. Evaluate and recommend' }),
          sf('transfer', 'A new site reports zero jobs but several failures. Its failure rate per 100 jobs is:', [['undefined', 'Undefined; report counts and investigate scope'], ['zero', 'Zero; no completed jobs means no failure risk'], ['hundred', '100%; every observed failure must count equally']], { group: '4. Handle a changed condition' })
        ],
        model: { hours: h, jobs, unavailable, failures, timely, maintenance: rnd(maintenance), parts: rnd(parts), available: rnd(available), failureRate: rnd(fr), repairRate: rnd(tr), priority: worst.name, claim: 'investigate', record: 'trace', transfer: 'undefined' },
        check: a => [
          num(a, 'hours', h, 'Exposure reconciled', `The ledger totals ${h} asset-hours.`, true, 0),
          num(a, 'jobs', jobs, 'Draft job total corrected', `Source rows total ${jobs} completed ${c.jobs}; the draft’s ${inflated} is unsupported.`, true, 0),
          num(a, 'unavailable', unavailable, 'Shared downtime counted once', `${m} maintenance-only + ${p} parts-only + ${b} shared = ${unavailable} unavailable asset-hours.`, true, 0),
          num(a, 'failures', failures, 'Failure cohort reconciled', `The eligible cohort contains ${failures} failures, including late or still-open cases.`, true, 0),
          num(a, 'timely', timely, 'Timely-repair count reconciled', `${timely} failures were repaired within the stated 8-hour window.`, false, 0),
          num(a, 'maintenance', maintenance, 'Maintenance attribution calculated', `(${m} + ${b}) ÷ ${h} × 100 = ${fmt(maintenance)}%.`),
          num(a, 'parts', parts, 'Parts attribution calculated', `(${p} + ${b}) ÷ ${h} × 100 = ${fmt(parts)}%.`),
          num(a, 'available', available, 'Availability reconciles to time', `(${h} − ${unavailable}) ÷ ${h} × 100 = ${fmt(available)}%.`),
          num(a, 'failureRate', fr, 'Failure-event exposure selected', `${failures} ÷ ${jobs} × 100 = ${fmt(fr)} events per 100 completed ${c.jobs}.`),
          num(a, 'repairRate', tr, 'Repair-cohort denominator selected', `${timely} ÷ ${failures} × 100 = ${fmt(tr)}%. Completed jobs are not this denominator.`),
          ck('priority', 'Priority uses normalized availability', worstNames.includes(a.priority), `${worstNames.join(' and ')} ${worstNames.length > 1 ? 'tie for' : 'has'} the lowest availability after dividing unavailable hours by each site’s own asset-hours.`),
          sel(a, 'claim', 'investigate', 'Recommendation stays within evidence', 'Investigate causes and work mix. A rate does not establish blame or a unique root cause.', true),
          sel(a, 'record', 'trace', 'Correction remains reproducible', 'Keep the original draft and verified ledger, record the corrected figures, and explain the mismatch.', true),
          sel(a, 'transfer', 'undefined', 'Changed condition handled', 'A zero completed-job denominator makes the event rate undefined. Keep the event count visible and investigate reporting alignment.', true)
        ],
        debrief: 'Your work product should let another person rebuild every measure, understand what changed, and evaluate the recommendation. Correct formulas support the brief; a defensible decision also requires context and clear limits.'
      };
    }
  });

  window.FM_TRACKS.push(track);
})();
