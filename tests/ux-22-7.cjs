'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const s=fs.readFileSync('dist/index.html','utf8');
for(const term of [
  'From FHP to today’s flying','Build the long-range plan','Build the monthly schedule','Build the weekly schedule','See and manage Phase flow',
  'Plan the red and green modifications','Combine compatible modification work','two workdays + one 24-hour cure','Why are we scheduling work?',
  'v.spare=v.spare===id?null:id','status-banner227','Calculator','Statistical Analysis Lab','TREND','CORRELATION','DIFFERENCE',
  'Nominal','Ordinal','Interval','Ratio','Kendall / Mann–Kendall trend test','data-metric-jump227',
  'Plan the aircraft modification rollout','A/C 001','A/C 021','LAMBORGHINI DIABLO PACKAGE','Modification package complete? <b>NO</b>',
  'Schedule the modification month','Build the daily schedule from the month','Schedule the modifications across the month','Build the daily schedule around the modifications',
  'data-modmonth227','data-dailymod227','RED/GREEN modification concept → whole-month schedule','Monthly modification schedule → daily schedule','exactly <strong>5 flying aircraft</strong>','exactly <strong>1 spare</strong>'
]) assert(s.includes(term),'22.7 UX marker missing: '+term);
assert(s.includes("clearOutcomeTimers();\n  document.body.classList"),'render must cancel stale outcome timers');
assert(s.includes('function runOutcome(){clearOutcomeTimers();'),'Execute must single-flight animation timers');
assert(s.includes('resimulateQuestion=function(){clearOutcomeTimers();'),'22.7 re-simulation wrapper must cancel timers');
const scenStart=s.indexOf('const SCENARIOS={');const schedStart=s.indexOf('scheduling:[',scenStart);const schedEnd=s.indexOf('analysis:[',schedStart);const schedBlock=s.slice(schedStart,schedEnd);
assert(!schedBlock.includes('Balance future workload'),'obsolete generic future-workload level must not remain in the live Scheduling progression');
assert(schedBlock.indexOf('Schedule the modification month')<schedBlock.indexOf('Build the daily schedule from the month'),'month modification schedule must flow directly into the daily schedule');
// Parse every inline script to catch malformed patches before packaging.
for(const [i,m] of [...s.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].entries()) if(m[1].trim()) new vm.Script(m[1],{filename:`index-inline-${i}.js`});
console.log('PASS 22.7 UX: scheduling horizons/modifications, revisable answers, clickable Analysis rates/calculator/stats guide, Documentation rollout/exception, and lockup guards present.');
