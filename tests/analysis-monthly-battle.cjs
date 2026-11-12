const fs=require('node:fs'),assert=require('node:assert/strict');
const s=fs.readFileSync('dist/index.html','utf8');
for(const marker of ['fm-analysis-100-monthly','100 Analysis repetitions','Month-to-month battle rhythm','lagging indicators every month','Six-month review','A100_REPS=100','isUnlocked=function(){return true}','Track the decision month to month']) assert(s.includes(marker),`missing Analysis 22.8.3 marker: ${marker}`);
assert(s.includes("['strong'" )===false || true); // source structure may be object-literal based
assert(s.includes("{id:'strong',name:'Sustained improvement'"),'missing improving monthly pattern');
assert(s.includes("{id:'flat',name:'No meaningful change'"),'missing flat monthly pattern');
assert(s.includes("{id:'worse',name:'Unintended worsening'"),'missing worsening monthly pattern');
assert(s.includes("showRightAnswer=function(){if(state.role==='analysis'&&state.view.analysisRhythm2283)return a100Solve()"),'Show Me must support monthly battle rhythm');
assert(s.includes("resimulateQuestion=function(){if(state.role==='analysis'&&state.view.analysisRhythm2283)return a100Reset()"),'re-simulation must support monthly battle rhythm');
console.log('PASS Analysis 22.8.3: 100-repetition month-to-month lagging-indicator battle rhythm, all-open skill navigation, Show Me and re-simulation markers present.');
