'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const handlers={};const root={innerHTML:'',addEventListener:(name,fn)=>(handlers[name]||(handlers[name]=[])).push(fn),classList:{toggle(){}}},storage={};
const doc={getElementById:()=>root,documentElement:{style:{}},querySelector:()=>null};
const w={scrollTo(){},AudioContext:null,webkitAudioContext:null,FMModel:require('../dist/fm2290-model.js'),FMBlockModel:require('../dist/block-academy-model.js')};
const ctx={window:w,document:doc,localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v},console,setTimeout:fn=>fn()};ctx.globalThis=ctx;vm.createContext(ctx);
for(const file of ['block-academy.js','fundamentals-data.js','task-map-data.js','task-map.js','references-data.js','references.js','teaching.js','fundamentals.js','fm2290.js']){
 const path='dist/'+file;vm.runInContext(fs.readFileSync(path,'utf8'),ctx,{filename:path});
}
const click=dataset=>{const e={preventDefault(){},target:{closest:selector=>selector.includes('data-ref-')?null:({dataset,closest:()=>null})}};for(const fn of handlers.click||[])fn(e)};
const input=(dataset,value)=>{const e={target:{dataset,value,id:''}};for(const fn of handlers.input||[])fn(e)};
const areas=Object.entries(w.FMFundamentalsData);let lessons=0,tasks=0;
for(const [area,data] of areas){
 click({route:'fundamentals:overview'});click({fundArea:area});
 for(const mod of data.modules){
  click({fundLesson:mod.id});assert(root.innerHTML.includes('Show Me'),JSON.stringify({module:w.FM2290.getState().module,screen:w.FM2290.getState().fundamentals,html:root.innerHTML.slice(0,350)}));assert(root.innerHTML.includes('What a defensible approach looks like'));assert(root.innerHTML.includes('data-teach-case="bad"'));
  click({teachCase:'bad'});assert(root.innerHTML.includes('What a flawed approach looks like'));
  click({fundStep:'1'});assert(root.innerHTML.includes(mod.steps[0]));
  click({fundStep:'2'});assert(root.innerHTML.includes(mod.scenario));assert(root.innerHTML.includes('What a flawed approach looks like'));
  click({fundStep:'3'});assert(root.innerHTML.includes(mod.question));click({fundQuiz:String(mod.answer)});assert(root.innerHTML.includes('Correct. The decision is supported.'));
  click({fundCaseNext:'1'});assert(root.innerHTML.includes('Case 2 of 3'));click({fundStep:'4'});assert(root.innerHTML.includes('New condition:'));
  for(const key of ['decision','evidence','risk','brief'])input({fundProof:key},'I verified the authorized evidence and made a traceable decision with safety checks.');
  click({fundProofSave:'1'});assert(root.innerHTML.includes('Attempt saved locally.'));
  assert(root.innerHTML.includes(`data-academy-mission="${mod.mission}"`));lessons++;
 }
}
click({route:'fundamentals:overview'});
for(const t of w.FMTaskMapData.tasks){click({taskOpen:t.id});assert(root.innerHTML.includes('tmap-dialog'), 'missing modal '+t.id);assert(root.innerHTML.includes('data-task-teachcase="bad"'),'missing gallery '+t.id);click({taskTeachcase:'edge'});assert(root.innerHTML.includes('When you must stop or reconsider'));click({taskClose:'1'});tasks++;}
click({route:'academy:home'});click({academyMission:'1'});assert(root.innerHTML.includes('Teach this skill'));
click({coachToggle:'1'});assert(root.innerHTML.includes('data-coach-stage="4"'));click({coachStage:'3'});click({academyAction:'hint'});assert(root.innerHTML.includes('Model answer and hints are unavailable'));click({coachStage:'1'});assert(root.innerHTML.includes('Help is permitted in this mode'));
for(const route of ['scheduling:skill8','analysis:metric','doc:inspection','integrity:skill4','dbm:skill3','flashcards:home']){const [m,s]=route.split(':');click({route});assert(root.innerHTML.includes('teach-coach'),route);if(!root.innerHTML.includes('data-coach-stage="4"'))click({coachToggle:'1'});assert(root.innerHTML.includes('data-coach-stage="4"'));}
const saved=JSON.parse(storage.forceMultiplier2292);assert(saved.fundamentals.proofRecords.length>=35);
assert(fs.readFileSync('dist/index.html','utf8').includes('teaching.js'));assert(fs.readFileSync('dist/sw.js','utf8').includes('teaching.js'));
console.log(`PASS 22.14.0 training system: ${lessons} five-stage lessons, ${tasks} source-task galleries, evidence capture, coach on every specialty, guarded challenge mode, offline assets.`);
