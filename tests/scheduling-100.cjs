
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const s=fs.readFileSync('dist/index.html','utf8');
for(const marker of [
  'fm-sched-100','Scheduling 100 reps','100-repetition battle rhythm','Make the daily scheduling call','Execute the approved FHP','Accept limitations · watch Phase',
  'Build the FHP execution plan','Build the 90-day plan','Month → week → day','Reveal the Phase Flow tracker','Control Phase flow','Recover the schedule','Integrated scheduler battle rhythm',
  'PRIORITY USE','DO NOT SCHEDULE · UNAVAILABLE','UNDERUSED · SCHEDULE IF FEASIBLE','LIMITED CONFIGURATION','Phase consequence','Phase Flow · hours remaining','400-hour Phase',
  'AFI 11-102','AFMAN 11-101','data-s100-air','data-s100-fhp','data-s100-long','data-s100-month','data-s100-daily','data-s100-rate','data-s100-capdaily',
  'Next repetition →','100-repetition battle rhythm complete'
]) assert(s.includes(marker),'22.8.1 Scheduling marker missing: '+marker);
assert(s.includes('SCENARIOS.scheduling=Array.from({length:100}'), 'Scheduling must expose 100 runtime repetitions.');
assert(s.includes('if(b===0)return renderS100Foundation();'),'Opening repetitions must route to authentic foundation scheduling, not the mechanical plot exercise.');
assert(s.includes("state.view.completed=false;save();render()"),'Editable wrong-answer flow must remain live after interaction.');
for(const [i,m] of [...s.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].entries()) if(m[1].trim()) new vm.Script(m[1],{filename:`index-inline-${i}.js`});
console.log('PASS 22.8.1 Scheduling: authentic opening decisions, progressive Phase reveal, 100-rep battle rhythm and editable checkerboards present.');
