'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const s=fs.readFileSync('dist/index.html','utf8');
for(const marker of [
  'Acquisition Mission','ANALYSIS_METRICS','MC Rate','TNMCM','TNMCS','Break Rate','8-Hour Fix Rate','Repeat Rate','Recur Rate','CANN Rate','Ground Abort Rate','Air Abort Rate','SSE','MSE','Deferred Discrepancies / Asset','ASD','Utilization','Gold Rat Lab','Snitch on the business','Trend','Difference','Correlation','Fishbone','Identify the constraint','Fix the constraint','Did the action work?','New organization / reset the 20-metric workup'
]) assert(s.includes(marker),`analysis acquisition game missing: ${marker}`);
const block=s.slice(s.indexOf('const ANALYSIS_METRICS=['),s.indexOf('function cap(',s.indexOf('const ANALYSIS_METRICS=[')));
const ids=[...block.matchAll(/\{id:'([^']+)'/g)].map(m=>m[1]);
assert.deepEqual(ids,['mc','aa','nmcm','nmcs','nmcb','tnmcm','tnmcs','break','fix','repeat','recur','rr','cann','ground','air','sse','mse','dd','asd','ute']);
assert(s.includes("analysis:{caseSeed:101,caseNo:1,metricResults:{},decision:null,goldComplete:false}"));
assert(s.includes("Object.keys(state.runs).filter(k=>k.startsWith('analysis:')).forEach(k=>delete state.runs[k])"));
assert(s.includes('state.analysis.caseSeed')&&s.includes('state.analysis.caseNo'));
assert(s.includes('analysisWins()'));
assert(s.includes('Take over ${companies[weaker].name} → Gold Rat Lab'));
console.log('PASS analysis acquisition: 20 metric-build levels, stable organization case, acquisition decision, weaker-company Gold Rat lab, and reset workflow present.');
