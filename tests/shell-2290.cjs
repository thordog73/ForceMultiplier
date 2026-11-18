const fs=require('node:fs'),assert=require('node:assert/strict');
const index=fs.readFileSync('dist/index.html','utf8'),js=fs.readFileSync('dist/fm2290.js','utf8'),model=fs.readFileSync('dist/fm2290-model.js','utf8'),css=fs.readFileSync('dist/fm2290.css','utf8'),surface=js+'\n'+model;
for(const f of ['fm2290.css','fm2290-model.js','native.js','fm2290.js','block-academy.css','block-academy-model.js','block-academy.js']) assert(index.includes('./'+f),`index missing ${f}`);
for(const forbidden of ['./app.js','./game.js','fm-sched-100','renderScheduling100','renderAnalysis22820','renderDocumentation22826']) assert(!index.includes(forbidden),`new shell references legacy surface ${forbidden}`);
for(const marker of ['Schedule a 6-Turn-4','Avoid a Hangar Queen','Schedule Into Phase','Fix the Phase Flow','Schedule Around NMC Aircraft','Build the Flying-Hour Program','Build the Weekly Schedule','Metrics first. Then investigate the problem.','40 Systems → Pareto','Spot Differences Over 12 Months','Look for Differences','Fishbone the Difference','Look for Correlation','Modification Plan','Documentation terms','Make the record represent reality.','Grant User Access','Troubleshoot the Data Path']) assert(surface.includes(marker),`missing screen marker ${marker}`);
assert.equal((js.match(/function render\(/g)||[]).length,1,'expected one root render function');
assert.equal((js.match(/root\.addEventListener\('click'/g)||[]).length,1,'expected one root click handler');
assert(css.includes('@media(max-width:760px)'));
console.log('PASS 22.9.0 shell: one render path, one click router, agreed screen map present.');
