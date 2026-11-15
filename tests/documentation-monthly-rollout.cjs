
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const s=fs.readFileSync('dist/index.html','utf8');
for(const marker of [
  'Plan the 24-aircraft modification rollout','24-aircraft monthly modification checkerboard','A/C 001 starts Day 1','A/C 021 starts Day 2','A/C 014 starts Day 3','A/C 033 starts Day 4',
  'RED Day 1–2 → GREEN Day 3–4 → final 24-hour cure Day 5','data-doc-month2282','docPreview2282','24-aircraft monthly modification rollout planned and controlled','Find the controlling requirement'
]) assert(s.includes(marker),'22.8.2 Documentation marker missing: '+marker);
assert(s.includes("DOC_MONTH_FLEET_2282=['A/C 001','A/C 021','A/C 014','A/C 033'"),'supplied sequence must preserve the established first four aircraft');
assert(s.includes("DOC_MONTH_FLEET_2282.forEach((a,i)=>starts[a]=i+1)"),'Show Me must populate the complete 24-aircraft model plan');
assert(s.includes("v.starts[a]=Number(v.starts[a])===d?null:d"),'selected start day must remain removable/editable');
assert(!s.includes('Place all four aircraft in the rollout.'),'obsolete four-aircraft grader must be removed');
for(const [i,m] of [...s.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].entries()) if(m[1].trim()) new vm.Script(m[1],{filename:`index-inline-${i}.js`});
console.log('PASS 22.8.2 Documentation: 24-aircraft monthly modification flow, editable start dates and model answer present.');
