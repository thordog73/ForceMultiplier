const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const pub='ios/App/App/public';
const required=['index.html','native.js','worlds.html','styles.css','app.js','core.js','game.js','game-worlds.js','pack-analysis.js','pack-documentation.js','pack-integrity.js','pack-database.js'];
for(const file of required){const f=path.join(pub,file);assert(fs.existsSync(f),`Generated iOS asset missing: ${f}; run npm run ios:prepare before ios:verify`);assert(fs.statSync(f).size>0,`Generated iOS asset is empty: ${f}`);}
const index=fs.readFileSync(path.join(pub,'index.html'),'utf8');
for(const marker of ['<title>Force Multiplier · 100-Rep Scheduling & Analysis + Visual Games</title>','5 functions · 20 levels each · visual simulations','6-turn-4','Add the spare','12-turn-10','Build the weekly checkerboard','Combine compatible work','Improvement Laboratory','Find the controlling requirement','Stop the error from recurring','Verify incident closure','./worlds.html','fm-sched-100','SCENARIOS.scheduling=Array.from({length:100}','Build your flying program','enterprise planning authority']) assert(index.includes(marker),`Generated iOS index.html is missing required release marker: ${marker}`);
assert(index.includes('function runOutcome'));
assert(index.includes('@keyframes takeoff'));
assert(!index.includes('4-HOUR GRADUATE'));
for(const forbidden of [/\bAFI\b/i,/\bAFMAN\b/i,/\bMAJCOM\b/i,/\bAir Force\b/i,/\bUSAF\b/i,/\bcommander\b/i,/\bwing\b/i,/\bsquadron\b/i]) assert(!forbidden.test(index),`Generated iOS training surface contains military-specific reference language: ${forbidden}`);
const native=fs.readFileSync(path.join(pub,'native.js'),'utf8');assert(native.length>1000,'Generated native bridge bundle is unexpectedly small');
console.log('PASS generated iOS assets: required Capacitor public bundle contains the Scheduling 100-repetition campaign, existing visual games, animations, and native assets.');
