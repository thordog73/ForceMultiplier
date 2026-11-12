const fs=require('node:fs'),assert=require('node:assert/strict');
const s=fs.readFileSync('dist/index.html','utf8');
for(const marker of ['Big Boss Report','Numbers','Charts & Drivers','Genuine improvement','No meaningful change','Change made performance worse','Type I error · false positive','Type II error · false negative','Verify the evidence in Data Integrity','a100ToIntegrity2285']) assert(s.includes(marker),`missing Big Boss/Analysis outcome marker: ${marker}`);
assert(s.includes("showRightAnswer=function(){if(state.role==='analysis'&&state.view.analysisRhythm2283)return a100Solve()"),'Show Me must support recurring Big Boss rotations');
assert(s.includes("resimulateQuestion=function(){if(state.role==='analysis'&&state.view.analysisRhythm2283)return a100Reset()"),'re-simulation must support recurring Big Boss rotations');
console.log('PASS Analysis 22.8.5: recurring Big Boss Numbers + Charts & Drivers reports, better/same/worse/Type I/Type II outcomes, and Data Integrity handoff present.');
