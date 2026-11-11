const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const pub='ios/App/App/public';
const required=['index.html','native.js','worlds.html','styles.css','app.js','core.js','game.js','game-worlds.js','pack-analysis.js','pack-documentation.js','pack-integrity.js','pack-database.js'];
for(const file of required){const f=path.join(pub,file);assert(fs.existsSync(f),`Generated iOS asset missing: ${f}; run npm run ios:prepare before ios:verify`);assert(fs.statSync(f).size>0,`Generated iOS asset is empty: ${f}`);}
const index=fs.readFileSync(path.join(pub,'index.html'),'utf8');
for(const marker of ['<title>Force Multiplier · Visual Simulations</title>','100 transferable skills · visual simulations · repeat with variation','6-turn-4','12-turn-10','Weekly checkerboard','Reconcile two systems','Troubleshoot the symptom','./worlds.html']) assert(index.includes(marker),`Generated iOS index.html is missing required visual-simulation marker: ${marker}`);
assert(!index.includes('4-HOUR GRADUATE'));
const native=fs.readFileSync(path.join(pub,'native.js'),'utf8');assert(native.length>1000,'Generated native bridge bundle is unexpectedly small');
console.log('PASS generated iOS assets: required Capacitor public bundle exists and contains the visual simulation entry point and native assets.');
