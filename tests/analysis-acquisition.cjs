'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const s=fs.readFileSync('dist/index.html','utf8');
for(const marker of [
  'Acquisition Mission','ANALYSIS_METRICS','MC Rate','TNMCM','TNMCS','Break Rate','8-Hour Fix Rate','Repeat Rate','Recur Rate','CANN Rate','Ground Abort Rate','Air Abort Rate','SSE','MSE','Deferred Discrepancies / Asset','ASD','Utilization','Gold Rat Lab','Snitch on the business','Trend','Difference','Correlation','Fishbone','Identify the constraint','Fix the constraint','Did the action work?','New organization / reset the 20-metric workup','Built-in calculator','Supervisor Assist','Enter Gold Rat Lab','Direct entry.'
]) assert(s.includes(marker),`analysis acquisition game missing: ${marker}`);
const block=s.slice(s.indexOf('const ANALYSIS_METRICS=['),s.indexOf('function cap(',s.indexOf('const ANALYSIS_METRICS=[')));
const ids=[...block.matchAll(/\{id:'([^']+)'/g)].map(m=>m[1]);
assert.deepEqual(ids,['mc','aa','nmcm','nmcs','nmcb','tnmcm','tnmcs','break','fix','repeat','recur','rr','cann','ground','air','sse','mse','dd','asd','ute']);
assert(s.includes("analysis:{caseSeed:101,caseNo:1,metricResults:{},decision:null,goldComplete:false,assisted:{},fishboneBuilt:{}}"));
assert(s.includes("Object.keys(state.runs).filter(k=>k.startsWith('analysis:')).forEach(k=>delete state.runs[k])"));
assert(s.includes('state.analysis.caseSeed')&&s.includes('state.analysis.caseNo'));
assert(s.includes('analysisWins()'));
assert(s.includes('Take over ${companies[weaker].name} → Gold Rat Lab'));
assert(s.includes("function isUnlocked(role,i){return role==='analysis'||"),'Analysis metrics must be open-entry rather than sequentially locked');
assert(s.includes('analysisCalcEvaluate')&&s.includes('data-calc-use')&&s.includes('data-calc-insert'),'Inline calculator workflow missing');
assert(s.includes('supervisorAssistMetric')&&s.includes('Show me / skip this metric'),'Supervisor Assist workflow missing');
assert(s.includes('openGoldDirect')&&s.includes('sideGoldDirect'),'Gold Rat must be directly visible from Analysis navigation');
console.log('PASS analysis acquisition: 20 open-entry metric builders, inline calculator, Supervisor Assist, direct acquisition, visible Gold Rat lab, weaker-company improvement flow, and reset workflow present.');
