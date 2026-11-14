'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const s=fs.readFileSync('dist/index.html','utf8');
for(const marker of [
  'METRIC_INSIGHTS','What does this mean?','What if it is high?','What should I ask next?',
  'Actual data','Local session only.','Upload CSV','Or paste CSV','Analyze actual data','parseCsvLocal','runActualTest',
  'Kendall τ','Welch t','χ²','Mann–Whitney','Kruskal–Wallis','Pearson correlation coefficient',"Spearman's rank correlation",
  "This offline trainer does not claim an exact Cochran significance probability",
  'Raw data are held in memory only','Do not load classified, CUI, PII'
]) assert(s.includes(marker),`missing 22.6.4 actual-data/commander marker: ${marker}`);
const insightBlock=s.slice(s.indexOf('const METRIC_INSIGHTS={'),s.indexOf('function metricInsight',s.indexOf('const METRIC_INSIGHTS={')));
for(const id of ['mc','aa','nmcm','nmcs','nmcb','tnmcm','tnmcs','break','fix','repeat','recur','rr','cann','ground','air','sse','mse','dd','asd','ute']) assert(insightBlock.includes(`${id}:{`),`missing metric insight ${id}`);
assert(s.includes("let ACTUAL_FISH_DATA={name:'',headers:[],rows:[]"),'Actual rows must be session-memory state rather than localStorage state.');
assert(!s.includes('state.analysis.actualData='),'Raw actual data must not be added to saved analysis progress.');
assert(s.includes("mode==='actual'?'Build test → map my data':'Build & run test'"),'Actual data must still require test construction before mapping columns.');
assert(s.includes("t.id==='chi2'")&&s.includes("t.id==='zprop'")&&s.includes("t.id==='cochran'"),'Actual data path must branch across Fishbone test families.');
console.log('PASS Analysis 22.6.4: metric meaning/commander prompts tied to all 20 metrics and local-session actual-data Fishbone workflow present.');
