(function () {
  'use strict';
  var F = window.FM;
  var ck = F.check;
  function number(a, key) {
    var v = a && a[key];
    if (v === '' || v === null || v === undefined || typeof v === 'boolean') return null;
    var x = Number(v);
    return Number.isFinite(x) ? x : null;
  }
  function whole(x) { return x !== null && Number.isInteger(x); }
  function same(a, key, expected, tolerance) {
    var x = number(a, key);
    return x !== null && Math.abs(x - expected) <= (tolerance === undefined ? 0.001 : tolerance);
  }
  function inRange(x, lo, hi) { return whole(x) && x >= lo && x <= hi; }
  function sum(values) { return values.reduce(function (s, x) { return s + x; }, 0); }
  function uniq(values) { return new Set(values).size === values.length; }
  function assetName(context, index) {
    var s = context.asset || 'unit';
    return s.charAt(0).toUpperCase() + s.slice(1) + ' ' + String(index + 1).padStart(2, '0');
  }
  function pool(context, count) {
    return Array.from({ length: count }, function (_, i) { return { id: 'r' + (i + 1), name: assetName(context, i) }; });
  }
  function options(resources) { return resources.map(function (x) { return { value: x.id, label: x.name }; }); }
  function workday(day) { return whole(day) && day >= 1 && (day - 1) % 7 < 5; }
  function nextWorkday(day) {
    var d = day + 1;
    while (!workday(d)) d++;
    return d;
  }
  function workDates(start, duration) {
    if (!workday(start) || !whole(duration) || duration < 1) return [];
    var ds = [start];
    while (ds.length < duration) ds.push(nextWorkday(ds[ds.length - 1]));
    return ds;
  }
  var weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  function dayName(day) { return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][(day - 1) % 7]; }
  function dayLabel(day) { return 'Day ' + day + ' · ' + dayName(day); }
  function numericField(id, label, extras) { return Object.assign({ id: id, label: label, kind: 'number', min: 0, step: 1 }, extras || {}); }
  function selectField(id, label, resources, extras) { return Object.assign({ id: id, label: label, kind: 'select', options: options(resources) }, extras || {}); }

  window.FM_TRACKS.push({
    id: 'scheduling',
    title: 'Scheduling',
    kicker: 'Make a plan that works',
    description: 'Turn demand, available resources, deadlines, and interruptions into an executable plan.',
    outcome: 'Build, execute, revise, and explain a feasible schedule while protecting essential constraints.',
    color: '#2563eb',
    icon: 'calendar',
    reference: [
      { name: 'Usable daily capacity', formula: '(Available resources − protected reserve) × jobs per resource', meaning: 'Use the same day and the same operating assumptions for every term. Remove unavailable resources before calculating capacity.', example: '6 available resources − 1 reserve = capacity for 5 one-resource jobs.' },
      { name: 'Period demand', formula: 'Operating days × required jobs per operating day', meaning: 'This is a demand calculation. A separate capacity check establishes whether the demand can be met.', example: '22 operating days × 8 jobs = 176 requested jobs.' },
      { name: 'Safe full operating weeks', formula: 'floor(remaining usage allowance ÷ forecast usage per week)', meaning: 'For the simplified forecast, service starts before another full week would exceed the stated usage allowance. Actual usage must be monitored.', example: '95 hours remaining ÷ 20 hours per week = 4 full weeks; plan service by the start of week 5.' },
      { name: 'Completion after dependent work', formula: 'Earliest start = latest required prerequisite completion', meaning: 'Then apply the relevant work calendar. Elapsed waiting or cure time can follow a different calendar from staffed work.', example: 'Parts arrive Thursday. Two workdays of repair finish Friday. A full workday of verification is Monday; the next operating shift is Tuesday.' }
    ],
    lessons: [
      {
        id: 'one-task', title: 'One task. One available resource.', minutes: 5, level: 'Foundation',
        summary: 'Choose a resource and a start time that fit a real operating window.',
        build: function (seed, context) {
          var r = F.rng(seed), resources = pool(context, 3);
          var chosen = F.int(r, 0, 2), available = 8 + F.int(r, 0, 2), duration = F.int(r, 2, 3), deadline = available + duration + F.int(r, 1, 2);
          var model = { resource: resources[chosen].id, start: available, finish: available + duration };
          return {
            brief: 'A customer needs one ' + context.job + ' completed today. Select an available ' + context.asset + ' and enter a start and finish time. Times use a 24-hour clock.',
            facts: [{ label: 'Job duration', value: duration + ' uninterrupted hours' }, { label: 'Latest completion', value: deadline + ':00' }],
            tables: [{ title: 'Resource availability', headers: ['Resource', 'Status', 'Usable window'], rows: resources.map(function (x, i) { return [x.name, i === chosen ? 'Available' : i === (chosen + 1) % 3 ? 'Unavailable: repair' : 'Already assigned', i === chosen ? available + ':00–' + deadline + ':00' : 'No free window today']; }) }],
            teach: ['A schedule needs a task, a capable available resource, and enough uninterrupted time.', 'A desired start time does not make an unavailable resource usable.', 'Finish time = start time + task duration. A later start can also be valid if the deadline is still met.'],
            hint: 'Use the resource with an open window. Your start must be at or after ' + available + ':00 and your finish at or before ' + deadline + ':00.',
            fields: [selectField('resource', 'Assigned resource', resources), numericField('start', 'Start hour', { min: 0, max: 23, unit: ':00' }), numericField('finish', 'Finish hour', { min: 0, max: 24, unit: ':00' })],
            model: model,
            check: function (a) {
              var start = number(a, 'start'), finish = number(a, 'finish');
              return [
                ck('available', 'Resource is available', a.resource === resources[chosen].id, resources[chosen].name + ' is the only resource with an open window.', true),
                ck('window', 'Start fits the operating window', inRange(start, available, deadline - duration), 'Choose a whole-hour start from ' + available + ':00 through ' + (deadline - duration) + ':00.', true),
                ck('duration', 'Full task duration is scheduled', start !== null && finish !== null && finish === start + duration, 'Allow all ' + duration + ' hours: finish = start + ' + duration + '.', true),
                ck('deadline', 'Completion meets the deadline', whole(finish) && finish <= deadline && finish >= available + duration, 'The task must finish by ' + deadline + ':00.', true)
              ];
            },
            debrief: 'Several start times may work. Feasibility comes from satisfying the resource, duration, and deadline constraints together.'
          };
        }
      },
      {
        id: 'two-waves', title: 'Six resources, then four', minutes: 8, level: 'Foundation',
        summary: 'Reuse resources after their first assignment and required turnaround.',
        build: function (seed, context) {
          var r = F.rng(seed), resources = pool(context, 6), firstStart = F.int(r, 7, 9), duration = F.int(r, 2, 3), turnaround = F.int(r, 1, 2);
          var ready = firstStart + duration + turnaround, lastSecondStart = ready + F.int(r, 1, 2);
          var fields = [], model = { secondStart: ready };
          for (var i = 0; i < 6; i++) { fields.push(selectField('first' + i, 'First-wave job ' + (i + 1), resources, { group: 'First wave · six simultaneous jobs' })); model['first' + i] = resources[i].id; }
          for (var j = 0; j < 4; j++) { fields.push(selectField('second' + j, 'Second-wave job ' + (j + 1), resources, { group: 'Second wave · four simultaneous jobs' })); model['second' + j] = resources[j].id; }
          fields.push(numericField('secondStart', 'Second-wave start hour', { group: 'Timing', min: 0, max: 23, unit: ':00' }));
          return {
            brief: 'All six ' + context.assets + ' are available. Assign one resource to each of six simultaneous jobs, then reuse any four for a second wave. One resource can perform only one job at a time.',
            facts: [{ label: 'First wave starts', value: firstStart + ':00' }, { label: 'Each first-wave job', value: duration + ' hours' }, { label: 'Turnaround after each job', value: turnaround + ' hours' }, { label: 'Latest second-wave start', value: lastSecondStart + ':00' }],
            tables: [{ title: 'Available resources', headers: ['Resource', 'First-wave status'], rows: resources.map(function (x) { return [x.name, 'Available']; }) }],
            teach: ['Six jobs followed by four jobs require ten assignments, but can use the same six resources.', 'Count simultaneous work separately from total work.', 'A resource cannot start its next task until the previous task and turnaround are complete.'],
            hint: 'The first wave uses each resource once. The second wave uses four different resources. They are ready at ' + firstStart + ' + ' + duration + ' + ' + turnaround + ' = ' + ready + ':00.',
            fields: fields, model: model,
            check: function (a) {
              var valid = resources.map(function (x) { return x.id; });
              var first = Array.from({ length: 6 }, function (_, k) { return a['first' + k]; });
              var second = Array.from({ length: 4 }, function (_, k) { return a['second' + k]; });
              return [
                ck('first', 'Six distinct first-wave assignments', first.every(function (x) { return valid.includes(x); }) && uniq(first), 'Every first-wave job needs a different available resource. Assignment order can vary.', true),
                ck('second', 'Four distinct second-wave assignments', second.every(function (x) { return valid.includes(x); }) && uniq(second), 'Any four different available resources can cover the second wave.', true),
                ck('turnaround', 'Turnaround and start deadline are respected', inRange(number(a, 'secondStart'), ready, lastSecondStart), 'Start between ' + ready + ':00 and ' + lastSecondStart + ':00, after the first jobs and turnaround.', true)
              ];
            },
            debrief: 'Total demand is ten jobs; peak simultaneous demand is six resources. The turnaround interval is a real constraint even when the resource looks free.'
          };
        }
      },
      {
        id: 'availability-priority', title: 'Availability before priority', minutes: 8, level: 'Foundation',
        summary: 'Use an idle resource without overriding availability or consuming the reserve.',
        build: function (seed, context) {
          var r = F.rng(seed), resources = pool(context, 8), order = F.shuffle(r, resources.slice()), blocked = order.slice(0, 2).map(function (x) { return x.id; }), eligible = order.slice(2), priority = eligible[0];
          var idle = {};
          resources.forEach(function (x) { idle[x.id] = x.id === priority.id ? F.int(r, 29, 38) : F.int(r, 2, 18); });
          idle[blocked[0]] = F.int(r, 40, 55);
          var fields = [], model = {};
          for (var i = 0; i < 4; i++) { fields.push(selectField('job' + i, 'Job ' + (i + 1) + ' resource', resources, { group: 'Today’s assignments' })); model['job' + i] = eligible[i].id; }
          fields.push(selectField('reserve', 'Protected reserve', resources, { group: 'Reserve' })); model.reserve = eligible[4].id;
          return {
            brief: 'Assign four simultaneous jobs and protect one unused, available reserve. Include the available resource that has been idle the longest. A long idle period never overrides an unavailable status.',
            facts: [{ label: 'Today’s demand', value: '4 simultaneous jobs' }, { label: 'Reserve requirement', value: '1 available resource, not assigned to a job' }],
            tables: [{ title: 'Availability and recent use', headers: ['Resource', 'Status', 'Days since last use'], rows: resources.map(function (x) { return [x.name, x.id === blocked[0] ? 'Unavailable · awaiting parts' : x.id === blocked[1] ? 'Unavailable · required service' : 'Available', idle[x.id]]; }) }],
            teach: ['Filter out unavailable resources before ranking the remaining choices.', 'A priority is a preference within the feasible options; it does not cancel a hard constraint.', 'A reserve must be usable and unassigned. Counting a broken resource as a reserve overstates resilience.'],
            hint: priority.name + ' has the longest idle period among the available resources. Give it one of the four jobs, then choose three other available resources and a separate available reserve.',
            fields: fields, model: model,
            check: function (a) {
              var jobs = Array.from({ length: 4 }, function (_, i) { return a['job' + i]; }), valid = eligible.map(function (x) { return x.id; });
              return [
                ck('available', 'All assigned resources are available', jobs.every(function (x) { return valid.includes(x); }), 'Do not assign either unavailable resource, even if it has been idle longer.', true),
                ck('unique', 'Jobs do not double-book a resource', jobs.every(Boolean) && uniq(jobs), 'Four simultaneous jobs require four different resources.', true),
                ck('priority', 'Longest-idle available resource is used', jobs.includes(priority.id), priority.name + ' is the longest-idle available resource and should receive a job.'),
                ck('reserve', 'Reserve is available and unassigned', valid.includes(a.reserve) && !jobs.includes(a.reserve), 'Protect one different available resource as the reserve.', true)
              ];
            },
            debrief: 'Use current availability to define what is possible, then apply priorities. More than one allocation can be correct.'
          };
        }
      },
      {
        id: 'weekly-demand', title: 'Build the working week', minutes: 10, level: 'Applied',
        summary: 'Reconcile daily demand, available capacity, a protected reserve, and the weekly total.',
        build: function (seed, context) {
          var r = F.rng(seed), available = [], demand = [], fields = [], model = {};
          for (var i = 0; i < 5; i++) {
            available[i] = F.int(r, 5, 8); demand[i] = F.int(r, 3, available[i] - 1);
            fields.push(numericField('jobs' + i, 'Scheduled jobs', { group: weekdays[i], min: 0, max: 8 }));
            fields.push(numericField('reserve' + i, 'Protected available reserves', { group: weekdays[i], min: 0, max: 8 }));
            model['jobs' + i] = demand[i]; model['reserve' + i] = 1;
          }
          fields.push(numericField('total', 'Weekly scheduled jobs', { group: 'Weekly reconciliation' })); model.total = sum(demand);
          return {
            brief: 'Plan five operating days for ' + context.org + '. Each resource can perform one job per day. Meet the listed daily demand exactly and retain at least one available reserve each day. No work is scheduled on Saturday or Sunday.',
            facts: [{ label: 'Productivity', value: '1 job per resource per day' }, { label: 'Protected reserve', value: 'At least 1 available resource each operating day' }],
            tables: [{ title: 'Daily requirements', headers: ['Day', 'Available resources', 'Requested jobs'], rows: weekdays.map(function (d, i) { return [d, available[i], demand[i]]; }) }],
            teach: ['A weekly total can look adequate while an individual day is overbooked.', 'Keep demand separate from capacity: demand is requested work; capacity is feasible work.', 'Reserves consume available capacity even when they produce no planned jobs.'],
            hint: 'For each day, schedule the requested jobs and at least one reserve. Check jobs + reserves ≤ available resources, then add the five job counts.',
            fields: fields, model: model,
            check: function (a) {
              var checks = [];
              for (var i = 0; i < 5; i++) {
                var jobs = number(a, 'jobs' + i), reserve = number(a, 'reserve' + i);
                checks.push(ck('demand' + i, weekdays[i] + ' demand is met', jobs === demand[i], 'Schedule exactly ' + demand[i] + ' requested jobs on ' + weekdays[i] + '.', true));
                checks.push(ck('capacity' + i, weekdays[i] + ' reserve and capacity fit', whole(jobs) && whole(reserve) && jobs >= 0 && reserve >= 1 && jobs + reserve <= available[i], weekdays[i] + ' has ' + available[i] + ' available resources. Jobs plus reserves cannot exceed this number.', true));
              }
              checks.push(ck('total', 'Weekly total reconciles', same(a, 'total', sum(demand)), 'The five daily requirements total ' + sum(demand) + ' jobs.'));
              return checks;
            },
            debrief: 'A feasible weekly plan must satisfy every day’s constraints and reconcile to the period’s required output.'
          };
        }
      },
      {
        id: 'shared-cure', title: 'Workdays and calendar time', minutes: 12, level: 'Applied',
        summary: 'Combine compatible work packages and use one shared cure interval.',
        build: function (seed, context) {
          var r = F.rng(seed), readyDay = F.int(r, 1, 2), aStart = readyDay, bStart = readyDay + 2;
          var finishDay = bStart + 1, cureEnd = finishDay + 1, release = nextWorkday(cureEnd);
          var model = { aStart: aStart, bStart: bStart, shared: true, cureStart: finishDay, cureEnd: cureEnd, release: release };
          return {
            brief: 'One ' + context.asset + ' needs two compatible work packages. Each needs two full working days. There is one crew and one work bay, so packages cannot overlap. They may be completed in either order and share one final 24-hour cure. Schedule the earliest available operating return after the cure.',
            facts: [{ label: 'Resource and crew available', value: dayLabel(readyDay) + ' at 08:00' }, { label: 'Staffed work', value: 'Monday–Friday, 08:00–17:00' }, { label: 'Both packages due', value: 'By Day 5, Friday, 17:00' }, { label: 'Cure', value: '24 consecutive calendar hours, including weekends' }, { label: 'Operating shifts', value: 'Monday–Friday at 08:00' }],
            tables: [{ title: 'Planning calendar', headers: ['Day', 'Crew works?', 'Cure may continue?'], rows: Array.from({ length: 10 }, function (_, i) { var d = i + 1; return [dayLabel(d), workday(d) ? 'Yes · 08:00–17:00' : 'No', 'Yes']; }) }, { title: 'Required packages', headers: ['Package', 'Work duration', 'Compatibility'], rows: [['Surface treatment', '2 full working days', 'May share final cure'], ['Protective coating', '2 full working days', 'May share final cure']] }],
            teach: ['Working days and elapsed calendar time are different clocks.', 'Compatible work can share a cure when the stated process permits it; this case explicitly allows that combination.', 'A Friday 17:00 finish plus 24 calendar hours is Saturday 17:00. The next 08:00 operating shift is Monday.'],
            hint: 'Use four staffed days without overlapping the packages. Cure starts at 17:00 on the final workday and ends at 17:00 the next calendar day. Find the next weekday 08:00 shift after that.',
            fields: [numericField('aStart', 'Surface treatment starts on day', { group: 'Crew work', min: 1, max: 5 }), numericField('bStart', 'Protective coating starts on day', { group: 'Crew work', min: 1, max: 5 }), { id: 'shared', label: 'Use one shared final cure for the compatible packages', kind: 'checkbox', group: 'Cure plan' }, numericField('cureStart', 'Cure starts on day, at 17:00', { group: 'Cure plan', min: 1, max: 10 }), numericField('cureEnd', 'Cure ends on day, at 17:00', { group: 'Cure plan', min: 1, max: 10 }), numericField('release', 'First operating return day, at 08:00', { group: 'Return to use', min: 1, max: 12 })],
            model: model,
            check: function (a) {
              var sa = number(a, 'aStart'), sb = number(a, 'bStart'), da = workDates(sa, 2), db = workDates(sb, 2), cs = number(a, 'cureStart'), ce = number(a, 'cureEnd'), rel = number(a, 'release');
              var validWork = da.length === 2 && db.length === 2 && sa >= readyDay && sb >= readyDay && da[1] <= 5 && db[1] <= 5;
              var last = validWork ? Math.max(da[1], db[1]) : null;
              return [
                ck('work', 'Both packages fit staffed days and the deadline', validWork, 'Each package needs two full weekdays, beginning no earlier than Day ' + readyDay + ' and finishing by Friday, Day 5.', true),
                ck('crew', 'The single crew and bay are not double-booked', validWork && da.every(function (d) { return !db.includes(d); }), 'The two packages cannot occupy the same workday. Either package may go first.', true),
                ck('shared', 'Compatible packages share the final cure', a.shared === true || a.shared === 'true' || a.shared === 'on', 'This case permits one cure after both packages; select the shared final cure.'),
                ck('cureStart', 'Cure begins after the final package', last !== null && cs === last, 'Begin the final cure at 17:00 on the day both work packages are complete.', true),
                ck('cureEnd', 'Cure lasts 24 calendar hours', whole(cs) && whole(ce) && ce === cs + 1, 'At the same 17:00 clock time, 24 hours later is the next calendar day, even on a weekend.', true),
                ck('release', 'Return uses the first eligible operating shift', whole(ce) && rel === nextWorkday(ce), 'A cure ending at 17:00 misses that day’s 08:00 shift. Use the next weekday morning.', true)
              ];
            },
            debrief: 'Combining permitted work packages avoids an extra cure cycle. A weekend may be useful elapsed time even when no crew work is scheduled.'
          };
        }
      },
      {
        id: 'parts-dependencies', title: 'Follow the dependency chain', minutes: 10, level: 'Applied',
        summary: 'Build the earliest feasible parts, repair, verification, and return sequence.',
        build: function (seed, context) {
          var r = F.rng(seed), partDay = F.int(r, 3, 5), duration = F.int(r, 2, 3), repair = workDates(partDay, duration), verify = nextWorkday(repair[repair.length - 1]), release = nextWorkday(verify), request = 8;
          return {
            brief: 'A replacement part arrives at 08:00 on the listed day. Repair requires full working days, then an independent verification requires one more full working day. Build the earliest feasible sequence and decide whether the original customer commitment can be kept.',
            facts: [{ label: 'Part available', value: dayLabel(partDay) + ' at 08:00' }, { label: 'Repair effort', value: duration + ' full working days' }, { label: 'Independent verification', value: '1 full working day, after all repair work' }, { label: 'Work calendar', value: 'Monday–Friday · full-day work finishes at 17:00' }, { label: 'Customer commitment', value: 'Day 8, Monday, at 08:00' }],
            tables: [{ title: 'Calendar', headers: ['Day', 'Staffed day'], rows: Array.from({ length: 12 }, function (_, i) { return [dayLabel(i + 1), workday(i + 1) ? 'Yes' : 'No']; }) }],
            teach: ['An expected delivery is a prerequisite, not completed repair.', 'Dependent work starts after its prerequisites are complete and qualified people are available.', 'If the earliest feasible completion misses the commitment, communicate the conflict and agree on a revised plan. Do not remove required verification to make the date appear achievable.'],
            hint: 'Begin repair on Day ' + partDay + '. Count ' + duration + ' weekdays, then one additional weekday for verification. Return occurs at 08:00 on the following weekday.',
            fields: [numericField('repairStart', 'Repair start day, 08:00', { min: 1, max: 12, group: 'Dependency plan' }), numericField('repairFinish', 'Repair finish day, 17:00', { min: 1, max: 12, group: 'Dependency plan' }), numericField('verify', 'Verification day, 08:00–17:00', { min: 1, max: 12, group: 'Dependency plan' }), numericField('release', 'Earliest return day, 08:00', { min: 1, max: 15, group: 'Customer commitment' }), { id: 'commitment', label: 'Action on the original commitment', kind: 'select', group: 'Customer commitment', options: [{ value: 'keep', label: 'Keep the original commitment' }, { value: 'revise', label: 'Agree a revised commitment with the customer' }] }],
            model: { repairStart: partDay, repairFinish: repair[repair.length - 1], verify: verify, release: release, commitment: release <= request ? 'keep' : 'revise' },
            check: function (a) {
              return [
                ck('start', 'Repair starts when the part is available', same(a, 'repairStart', partDay), 'The earliest repair start is Day ' + partDay + ' at 08:00.', true),
                ck('finish', 'All repair working days are included', same(a, 'repairFinish', repair[repair.length - 1]), 'Repair occupies Days ' + repair.join(', ') + ' and finishes at 17:00 on Day ' + repair[repair.length - 1] + '.', true),
                ck('verify', 'Independent verification follows repair', same(a, 'verify', verify), 'Verification uses the next full working day: Day ' + verify + '.', true),
                ck('release', 'Return follows completed verification', same(a, 'release', release), 'The earliest operating return is Day ' + release + ' at 08:00.', true),
                ck('commitment', 'Customer action matches feasibility', a.commitment === (release <= request ? 'keep' : 'revise'), release <= request ? 'The completed sequence meets the Day 8 commitment.' : 'The sequence cannot meet Day 8. Agree a revised commitment rather than skipping required work.', true)
              ];
            },
            debrief: 'A defensible return estimate includes every prerequisite and the actual calendar. The earliest possible date and the originally requested date are different facts.'
          };
        }
      },
      {
        id: 'period-forecast', title: 'Forecast demand and required service', minutes: 12, level: 'Applied',
        summary: 'Connect three planning periods to a quarter and stagger required service.',
        build: function (seed, context) {
          var r = F.rng(seed), daily = F.int(r, 7, 11), days = [22, 22, 21], resources = pool(context, 4), forecasts = [], fields = [], model = {};
          for (var p = 0; p < 3; p++) { fields.push(numericField('period' + p, 'Period ' + (p + 1) + ' requested jobs', { group: 'Demand forecast' })); model['period' + p] = days[p] * daily; }
          fields.push(numericField('quarter', 'Quarter requested jobs', { group: 'Demand forecast' })); model.quarter = 65 * daily;
          for (var i = 0; i < 4; i++) {
            var selectedWeek = 2 + i * 2 + F.int(r, 0, 1), due = selectedWeek + 1, use = F.int(r, 10, 20), remaining = (due - 1) * use + F.int(r, 0, use - 1);
            forecasts.push({ name: resources[i].name, use: use, remaining: remaining, due: due, selected: selectedWeek });
            fields.push(numericField('due' + i, 'Latest service start week', { group: resources[i].name, min: 1, max: 13 }));
            fields.push(numericField('service' + i, 'Your scheduled service week', { group: resources[i].name, min: 1, max: 13 }));
            model['due' + i] = due; model['service' + i] = selectedWeek;
          }
          return {
            brief: 'Create a quarter demand forecast and a four-resource service plan. The 90-day horizon starts on a Monday and is divided into three 30-day planning periods. For service forecasting, each resource follows its stated weekly usage. One service bay can process one resource for one full week.',
            facts: [{ label: 'Requested output', value: daily + ' jobs per operating day' }, { label: 'Operating calendar', value: 'Monday–Friday · 65 operating days in this 90-day horizon' }, { label: 'Service rule', value: 'Start service before another full week would exceed remaining usage allowance' }, { label: 'Bay capacity', value: '1 resource per week' }],
            tables: [{ title: 'Demand periods', headers: ['Planning period', 'Calendar days', 'Operating days'], rows: [['Period 1', 'Days 1–30', 22], ['Period 2', 'Days 31–60', 22], ['Period 3', 'Days 61–90', 21]] }, { title: 'Service forecast inputs', headers: ['Resource', 'Remaining usage allowance', 'Forecast usage per operating week'], rows: forecasts.map(function (x) { return [x.name, x.remaining + ' hours', x.use + ' hours']; }) }],
            teach: ['Multiply operating days by required daily output to forecast demand. Then test whether a resource plan can supply it.', 'For this simplified weekly forecast, floor(remaining hours ÷ weekly hours) gives the number of full operating weeks still allowed.', 'Start service by the following week and avoid assigning two resources to the single bay at once. Early service is permitted in this exercise; it may have a cost in real operations.'],
            hint: 'Demand is ' + daily + ' × each period’s operating days. For a resource with R remaining hours and U hours per week, the latest service start is floor(R ÷ U) + 1. Pick distinct service weeks no later than those deadlines.',
            fields: fields, model: model,
            check: function (a) {
              var checks = [], scheduled = [];
              for (var p = 0; p < 3; p++) checks.push(ck('period' + p, 'Period ' + (p + 1) + ' demand reconciles', same(a, 'period' + p, days[p] * daily), days[p] + ' operating days × ' + daily + ' jobs = ' + (days[p] * daily) + '.'));
              checks.push(ck('quarter', 'Quarter demand reconciles', same(a, 'quarter', 65 * daily), 'The three periods total 65 operating days and ' + (65 * daily) + ' requested jobs.'));
              forecasts.forEach(function (x, i) {
                var w = number(a, 'service' + i); scheduled.push(w);
                checks.push(ck('due' + i, x.name + ' service forecast is correct', same(a, 'due' + i, x.due), 'floor(' + x.remaining + ' ÷ ' + x.use + ') + 1 = week ' + x.due + '.'));
                checks.push(ck('service' + i, x.name + ' is scheduled before its limit', inRange(w, 1, x.due), 'Schedule the service at the start of a week from 1 through ' + x.due + '.', true));
              });
              checks.push(ck('bay', 'Service bay is not double-booked', scheduled.every(function (x) { return inRange(x, 1, 13); }) && uniq(scheduled), 'Each service occupies the only bay for a full week. Choose different weeks.', true));
              return checks;
            },
            debrief: 'Forecasts connect daily expectations to a longer horizon. They must be updated when actual usage changes; the forecast itself is not evidence that service has been completed.'
          };
        }
      },
      {
        id: 'disrupted-week', title: 'Repair a disrupted week', minutes: 12, level: 'Applied',
        summary: 'Revise the plan after capacity changes while retaining the reserve and customer commitments.',
        build: function (seed, context) {
          var r = F.rng(seed), disrupted = F.int(r, 1, 3), original = [4, 4, 4, 4, 3], mandatory = original.slice(), available = [6, 6, 6, 6, 6], destination = disrupted + 1;
          mandatory[disrupted]--; available[disrupted] = 4;
          var fields = [], model = { movedDay: destination + 1 }, revised = mandatory.slice(); revised[destination]++;
          for (var i = 0; i < 5; i++) {
            fields.push(numericField('jobs' + i, 'Revised jobs', { group: weekdays[i], min: 0, max: 6 }));
            fields.push(numericField('reserve' + i, 'Available reserves', { group: weekdays[i], min: 0, max: 6 }));
            model['jobs' + i] = revised[i]; model['reserve' + i] = 1;
          }
          fields.push(numericField('movedDay', 'Flexible job’s new day (1 = Monday, 5 = Friday)', { group: 'Customer update', min: 1, max: 5 }));
          return {
            brief: 'Two resources become unavailable on ' + weekdays[disrupted] + '. Retain one reserve every day. One job originally due that day may move to any later day this week with customer agreement; all other jobs keep their original dates. Revise the plan without losing any of the 19 jobs.',
            facts: [{ label: 'Daily productivity', value: '1 job per available resource' }, { label: 'Protected reserve', value: 'At least 1 each day' }, { label: 'Flexible job', value: 'Released on ' + weekdays[disrupted] + '; due by Friday' }, { label: 'Weekly commitment', value: '19 completed jobs' }],
            tables: [{ title: 'Original plan and new facts', headers: ['Day', 'Original jobs', 'Available resources now', 'Jobs that must remain on this day'], rows: weekdays.map(function (d, i) { return [d, original[i], available[i], mandatory[i]]; }) }],
            teach: ['When availability changes, recompute capacity before defending the old plan.', 'Do not quietly consume a protected reserve or remove a customer commitment.', 'Move only work that is actually flexible, and keep its release date and latest completion date visible.'],
            hint: 'The disrupted day can support only 4 − 1 = 3 jobs. Keep its three fixed jobs, then place the one flexible job on a later day with spare capacity.',
            fields: fields, model: model,
            check: function (a) {
              var checks = [], counts = [], moved = number(a, 'movedDay');
              for (var i = 0; i < 5; i++) {
                var jobs = number(a, 'jobs' + i), reserve = number(a, 'reserve' + i); counts.push(jobs);
                checks.push(ck('capacity' + i, weekdays[i] + ' remains feasible', whole(jobs) && jobs >= 0 && whole(reserve) && reserve >= 1 && jobs + reserve <= available[i], 'Jobs plus at least one reserve must fit within ' + available[i] + ' available resources.', true));
                checks.push(ck('fixed' + i, weekdays[i] + ' fixed commitments are protected', whole(jobs) && jobs >= mandatory[i], 'Keep the ' + mandatory[i] + ' jobs that cannot move from ' + weekdays[i] + '.', true));
              }
              var movedOK = inRange(moved, disrupted + 2, 5);
              checks.push(ck('moved', 'The flexible job moves to an eligible day', movedOK, 'Move the flexible job to a day after ' + weekdays[disrupted] + ' and no later than Friday.', true));
              checks.push(ck('allocation', 'The revised plan matches the customer update', movedOK && counts.every(function (x, i) { return x === mandatory[i] + (i === moved - 1 ? 1 : 0); }), 'Each day retains its fixed jobs, and the selected new day receives exactly one additional job.', true));
              checks.push(ck('total', 'All 19 jobs remain in the plan', counts.every(whole) && sum(counts) === 19, 'The disruption changes timing; it does not erase one of the 19 requested jobs.'));
              return checks;
            },
            debrief: 'A revised schedule is a decision with consequences. Preserve fixed commitments, move only flexible work, and communicate the actual change.'
          };
        }
      },
      {
        id: 'quarter-capstone', title: 'Run the 90-day plan', minutes: 25, level: 'Capstone', capstone: true,
        summary: 'Build and revise a complete quarter plan with outages, service windows, reserves, and changed demand.',
        build: function (seed, context) {
          var r = F.rng(seed), resources = pool(context, 6), returnsWeek = F.int(r, 4, 6), shockWeek = F.int(r, 7, 10), extra = F.int(r, 8, 14), baseline = 234, target = baseline + extra;
          var firstCommit = F.int(r, 61, 65), secondCommit = F.int(r, 132, 138), centers = [2, 5, 8, 11].map(function (w) { return w + F.int(r, 0, 1); });
          var service = centers.map(function (w, i) { return { resource: resources[i], start: Math.max(1, w - 1), end: Math.min(13, w + 1), model: w }; });
          var baseCap = Array.from({ length: 13 }, function (_, i) { var w = i + 1; return (6 - 1 - (w < returnsWeek ? 1 : 0) - (w === shockWeek ? 1 : 0)) * 5; });
          var capacity = baseCap.map(function (c, i) { return c - (centers.includes(i + 1) ? 5 : 0); });
          var output = capacity.map(function (c) { return Math.min(18, c); });
          function topUp(to, required) {
            var need = required - sum(output.slice(0, to));
            for (var k = to - 1; k >= 0 && need > 0; k--) { var add = Math.min(need, capacity[k] - output[k]); output[k] += add; need -= add; }
          }
          topUp(4, firstCommit); topUp(8, secondCommit); topUp(13, target);
          var fields = [], model = {};
          service.forEach(function (x, i) { fields.push(numericField('service' + i, x.resource.name + ' service week', { min: 1, max: 13, group: 'Required service · one bay', help: 'Choose week ' + x.start + '–' + x.end + '. This resource is unavailable for that whole week.' })); model['service' + i] = x.model; });
          for (var i = 0; i < 13; i++) { fields.push(numericField('week' + (i + 1), 'Week ' + (i + 1) + ' completed jobs', { min: 0, max: 25, group: i < 4 ? 'Weeks 1–4' : i < 8 ? 'Weeks 5–8' : 'Weeks 9–13', help: 'Subtract 5 from the shown capacity if you schedule a service this week.' })); model['week' + (i + 1)] = output[i]; }
          return {
            brief: 'Build a revised 90-calendar-day plan for six ' + context.assets + '. The plan starts on Monday: there are 13 operating weeks and 65 weekdays; Day 90 is Saturday. Required service uses one bay for one full week per resource. One resource awaits parts, another suffers a newly reported outage, and a customer adds work. Allocate all required service and revise weekly output to meet the commitments below.',
            facts: [{ label: 'Baseline plan', value: '18 jobs each week · 234 jobs in total' }, { label: 'New demand released at start of Week 8', value: extra + ' additional jobs · revised quarter total ' + target }, { label: 'Cumulative commitments', value: firstCommit + ' by end of Week 4; ' + secondCommit + ' by end of Week 8; ' + target + ' by end of Week 13' }, { label: 'Reserve and productivity', value: 'Protect 1 available resource daily; each other available resource completes 1 job per operating day' }, { label: 'Parts delay', value: resources[5].name + ' unavailable Weeks 1–' + (returnsWeek - 1) + '; available Monday of Week ' + returnsWeek }, { label: 'New disruption', value: resources[4].name + ' unavailable for all of Week ' + shockWeek }],
            tables: [{ title: 'Required service windows', headers: ['Resource', 'Earliest start week', 'Latest start week', 'Duration'], rows: service.map(function (x) { return [x.resource.name, x.start, x.end, '1 full operating week']; }) }, { title: 'Weekly capacity before your service choices', headers: ['Week', 'Calendar days', 'Operating days', 'Original target', 'Maximum jobs before planned service'], rows: Array.from({ length: 13 }, function (_, i) { var start = 1 + i * 7, end = Math.min(90, start + 6); return [i + 1, start + '–' + end, 5, 18, baseCap[i]]; }) }],
            teach: ['The capacity table already removes the protected reserve, the parts outage, and the new disruption. Subtract five more jobs in each week that uses the service bay.', 'Only one resource can use the bay in a week. Every service must start within its stated window.', 'Weekly output may vary. Meet cumulative commitments and exactly the revised quarter demand without exceeding any week’s capacity.', 'The additional jobs are released at the start of Week 8. Do not count work that has not been released; at most the 234 baseline jobs can be completed before Week 8.', 'This is a planning model: all baseline work is available at the start, and jobs may move within the horizon subject to the cumulative commitments. A real plan also needs current task-level information.'],
            hint: 'Choose four different service weeks inside the windows. For those weeks subtract 5 from the capacity table. Allocate weekly jobs within the resulting limits, check cumulative output at Weeks 4 and 8, then reconcile the total to ' + target + '. Several plans can work.',
            fields: fields, model: model, capstone: true,
            check: function (a) {
              var checks = [], chosen = [], counts = [];
              service.forEach(function (x, i) { var w = number(a, 'service' + i); chosen.push(w); checks.push(ck('service' + i, x.resource.name + ' meets its service window', inRange(w, x.start, x.end), x.resource.name + ' must start its one-week service in Week ' + x.start + ' through Week ' + x.end + '.', true)); });
              var servicesValid = chosen.every(function (w, i) { return inRange(w, service[i].start, service[i].end); });
              checks.push(ck('bay', 'The service bay is not double-booked', servicesValid && uniq(chosen), 'The single bay can process only one resource per week. Four distinct service weeks are required.', true));
              for (var i = 0; i < 13; i++) {
                var w = i + 1, count = number(a, 'week' + w), events = chosen.filter(function (x) { return x === w; }).length, cap = baseCap[i] - events * 5; counts.push(count);
                checks.push(ck('week' + w, 'Week ' + w + ' output fits available capacity', servicesValid && whole(count) && count >= 0 && count <= cap, 'Week ' + w + ': capacity ' + baseCap[i] + ' before service − ' + events + ' service(s) × 5 = ' + cap + ' jobs. The reserve is already protected in that capacity.', true));
              }
              var allNumbers = counts.every(function (x) { return whole(x) && x >= 0; });
              checks.push(ck('commit4', 'First cumulative commitment is met', allNumbers && sum(counts.slice(0, 4)) >= firstCommit, 'Complete at least ' + firstCommit + ' jobs by the end of Week 4.', true));
              checks.push(ck('commit8', 'Second cumulative commitment is met', allNumbers && sum(counts.slice(0, 8)) >= secondCommit, 'Complete at least ' + secondCommit + ' jobs by the end of Week 8.', true));
              checks.push(ck('released', 'Output does not precede work release', allNumbers && sum(counts.slice(0, 7)) <= baseline, 'Before Week 8, only the ' + baseline + ' baseline jobs have been released.', true));
              checks.push(ck('quarter', 'Revised quarter total reconciles', allNumbers && sum(counts) === target, 'Baseline ' + baseline + ' + added work ' + extra + ' = exactly ' + target + ' requested jobs over 90 calendar days.', true));
              return checks;
            },
            debrief: 'The work product is a complete 90-day allocation, including weekly output, planned service, reserves, an outage, a parts delay, and revised demand. Explain which constraints drove your choices, where capacity remains, and how you would revise the plan if availability changed again. Objective checks establish feasibility in this model; an evaluator reviews your communication and judgment.'
          };
        }
      }
    ]
  });
})();
