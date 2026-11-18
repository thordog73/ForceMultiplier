const fs=require('node:fs'),assert=require('node:assert/strict');
const s=fs.readFileSync('dist/index.html','utf8');
for(const marker of ['Improvement Laboratory','Nobel Prize CPI toolbox','Clarify & Validate the Problem','Break Down the Problem / Identify Gaps','Set Improvement Target','Determine Root Causes','Develop Countermeasures','See Countermeasures Through','Confirm Results & Process','Standardize Successful Processes','5 Whys','Pareto','Affinity','Fishbone','Control Charts','Return on Investment','Future State Mapping','Error Proofing','Quick Changeover','Use My Data in the Test Builder']) assert(s.includes(marker),`missing Improvement Laboratory marker: ${marker}`);
assert(!s.includes('Gold Rat Lab'),'user-visible Gold Rat lab label should be removed');
assert(!s.includes('>GOLD RAT<'),'GOLD RAT completion label should be removed');
console.log('PASS Analysis 22.8.5: Nobel Prize Improvement Laboratory, CPI tool cabinet, fictional/actual-data path, and neutral naming present.');
