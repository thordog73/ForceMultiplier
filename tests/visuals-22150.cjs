'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const w={};const ctx={window:w};vm.createContext(ctx);
for(const f of ['fundamentals-data.js','task-map-data.js','visuals.js'])vm.runInContext(fs.readFileSync('dist/'+f,'utf8'),ctx,{filename:f});
const audit=w.FMVisuals.verify();
assert.equal(audit.lessonCount,35);assert.equal(audit.taskCount,72);
assert.deepEqual(Array.from(audit.lessonMissing),[]);assert.deepEqual(Array.from(audit.taskMissing),[]);
let lessons=0,tasks=0;
for(const [area,data] of Object.entries(w.FMFundamentalsData))for(const mod of data.modules){
 const kind=w.FMVisuals.LESSONS[area][mod.id];
 for(const mode of ['bad','good','edge']){
  const html=w.FMVisuals.lesson(area,mod.id,mode);
  assert(html.includes(`data-visual-kind="${kind}"`));assert(html.includes(`data-visual-case="${mode}"`));
  assert(html.length>450);assert(!html.includes('undefined'));}
 lessons++;
}
for(const t of w.FMTaskMapData.tasks){
 const kind=w.FMVisuals.TASKS[t.id];
 for(const mode of ['bad','good','edge']){const html=w.FMVisuals.task(t,mode);
  assert(html.includes(`data-visual-kind="${kind}"`),t.id);
  assert(html.includes(`data-visual-case="${mode}"`));assert(html.length>450,t.id);
 }
 tasks++;
}
// Prevent regressions back to a checkerboard for task-specific records and forms.
const mandatory={
 'fgs_scheduling-08':'record-review','fgs_scheduling-03':'forms',
 'fgs_scheduling-02':'inventory','fgs_scheduling-07':'fhp',
 'fgs_scheduling-11':'phase','wing_scheduling-07':'hangar',
 'wing_documentation-02':'jml','fgs_documentation-03':'history',
 'wing_analysis-09':'brief','engine-02':'engine-system',
 'engine-04':'engine-waiver','dit_dbm-03':'permissions',
 'dit_dbm-06':'diagnosis'
};
for(const [id,kind] of Object.entries(mandatory)){const t=w.FMTaskMapData.tasks.find(t=>t.id===id);assert(t&&w.FMVisuals.TASKS[id]===kind);assert(w.FMVisuals.task(t,'good').includes(t.title)||kind==='record-review');}
const taskCode=fs.readFileSync('dist/task-map.js','utf8'),shell=fs.readFileSync('dist/fm2290.js','utf8'),idx=fs.readFileSync('dist/index.html','utf8');
assert(taskCode.includes('FMTeaching?.taskGallery(t,m,showCase)'));
assert(taskCode.includes('function questionForTask(t)'));
assert(!taskCode.includes('data-route="references:home"'));assert(!taskCode.includes('Reference starting points'));
assert(!shell.includes("['references','References']"));
assert(shell.includes("oldDialog?.scrollTop"));
for(const required of ['visuals.js','visuals.css'])assert(idx.includes(required));
for(const obsolete of ['references.js','references.css','references-data.js'])assert(!idx.includes(obsolete));
console.log(`PASS v22.15.0: ${lessons} fundamental diagrams and ${tasks} task-specific diagrams × 3 views; reference UI removed; scroll-restoration logic present.`);
