const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm'),M=require('../dist/fm2290-model.js'),B=require('../dist/block-academy-model.js');
const handlers={},root={innerHTML:'',addEventListener:(k,fn)=>handlers[k]=fn,classList:{toggle(){}}},storage={};
const document={getElementById:id=>root,documentElement:{style:{}}};
const window={FMModel:M,FMBlockModel:B,scrollTo(){},setTimeout:fn=>fn(),AudioContext:null,webkitAudioContext:null};
const localStorage={getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v};const context={window,document,localStorage,console,setTimeout:fn=>fn()};context.globalThis=context;vm.createContext(context);
for(const f of ['dist/block-academy.js','dist/fundamentals-data.js','dist/fundamentals.js','dist/fm2290.js'])vm.runInContext(fs.readFileSync(f,'utf8'),context,{filename:f});
const click=dataset=>handlers.click({target:{closest:()=>({dataset,closest:()=>null})}});
const d=window.FMFundamentals.DATA,areaKeys=['scheduling','analysis','documentation','integrity','dbm'];
assert.equal(window.FM2290.getState().module,'fundamentals');assert(root.innerHTML.includes('Understand the job.'));
assert.equal(Object.keys(d).length,5);assert.equal(areaKeys.reduce((n,k)=>n+d[k].skills.length,0),100);
assert.equal(areaKeys.reduce((n,k)=>n+d[k].modules.length,0),35);
for(const key of areaKeys){
 const area=d[key];assert.equal(area.skills.length,20);assert.equal(area.modules.length,7);const ids=area.modules.flatMap(m=>m.ids);assert.equal(ids.length,20);assert.equal(new Set(ids).size,20);
 for(const skill of area.skills)assert(ids.includes(skill.id),`${skill.id} missing from learner lessons`);
 click({fundArea:key});assert(root.innerHTML.includes(area.arc.split(' ')[0]));assert(root.innerHTML.includes('See all 20 observable skills'));
 for(const mod of area.modules){
  click({fundLesson:mod.id});assert(root.innerHTML.includes(mod.title));
  click({fundStep:'1'});assert(root.innerHTML.includes(mod.steps[0]));
  click({fundStep:'2'});assert(root.innerHTML.includes(mod.scenario));
  if(key==='scheduling'&&mod.id==='checkerboard'){
   assert(root.innerHTML.includes('Interactive checkerboard'));assert(root.innerHTML.includes('Two separate cures'));
   click({fundBoard:'combined'});assert(root.innerHTML.includes('One combined cure'));
  }
  click({fundStep:'3'});click({fundQuiz:String(mod.answer)});assert(root.innerHTML.includes('Correct. The decision is supported.'));
  assert(window.FM2290.getState().fundamentals.reviewed[key+':'+mod.id]);
  click({fundStep:'4'});assert(root.innerHTML.includes(`data-academy-mission="${mod.mission}"`));assert(root.innerHTML.includes('Open related advanced trainer'));
 }
 click({fundView:'overview'});
}
click({fundArea:'scheduling'});click({fundLesson:'checkerboard'});click({fundStep:'4'});click({academyMission:'1'});assert.equal(window.FM2290.getState().module,'academy');assert.equal(window.FM2290.getState().screen,'play');
click({route:'fundamentals:overview'});assert(root.innerHTML.includes('What will you learn?'),'return to learning dashboard works');
assert(storage.forceMultiplier2292.includes('"reviewed"'),'lesson progress saved locally');
console.log('PASS 22.12.0 fundamentals: five maps, 35 clickable lessons, 100 original skill demonstrations, scenario and decisions, checkerboard consolidation, Block Academy routing, offline save.');
