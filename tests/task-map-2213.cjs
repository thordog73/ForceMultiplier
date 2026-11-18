const fs=require('node:fs');const assert=require('node:assert/strict');const vm=require('node:vm');
const d=JSON.parse(fs.readFileSync('dist/task-map-data.js','utf8').split('window.FMTaskMapData=')[1].trim().slice(0,-1));
assert.equal(d.tasks.length,72);assert.equal(d.additions.length,12);assert.equal(new Set(d.tasks.map(t=>t.id)).size,72);
const sec=d.sections.map(x=>x.id);for(const t of d.tasks){assert(sec.includes(t.section));assert(t.fundamentals.length>=3);assert(t.definition.length>40);assert(t.proof.length>45);assert(t.scenario.length>30);assert(t.pitfall.length>30);assert(t.mission>=1&&t.mission<=7);assert(t.refNames.every(x=>d.sources[x]));}
const a=d.tasks.find(t=>t.id==='fgs_scheduling-01');assert(a.fundamentals.some(x=>/consolidate/i.test(x)));assert(a.fundamentals.some(x=>/quarterly/i.test(x)));
for(const file of ['dist/index.html','ios/App/App/public/index.html']){const h=fs.readFileSync(file,'utf8');for(const asset of ['task-map.css','task-map-data.js','task-map.js'])assert(h.includes('./'+asset));}
const legacy=fs.readFileSync('dist/fundamentals.js','utf8');assert(legacy.includes('FMTaskMap.render'));assert(legacy.includes('FMTaskMap.handleClick'));
const main=fs.readFileSync('dist/fm2290.js','utf8');assert(main.includes('FMTaskMap.attach'));
const sw=fs.readFileSync('dist/sw.js','utf8');assert(sw.includes('task-map-data.js'));
console.log('PASS 22.13.0 MXMGR task map: 72 source tasks, 12 proposals, 100-skill links, asset delivery and integration.');
