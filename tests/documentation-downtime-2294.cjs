'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const M=require('../dist/fm2290-model.js');
const stages=['r1','r2','g1','g2','c'];
assert.equal(M.docDowntimeWeekend(6),true,'Saturday is off');
assert.equal(M.docDowntimeWeekend(7),true,'Sunday is off');
assert.equal(M.docDowntimeWeekend(13),true,'Week 2 Saturday is off');
assert.equal(M.docDowntimeWeekend(5),false,'Friday is a workday');
assert.equal(M.docDowntimeNextWorkday(6),8,'Saturday cure returns Monday');
assert.equal(M.docDowntimeNextWorkday(13),15,'Week 2 Saturday cure returns following Monday');
for(let v=0;v<3;v++){
 const scenario=M.docDowntimeCase(v),bad=M.docDowntimeStats(scenario.baseline),good=M.docDowntimeEvaluate(scenario,M.docDowntimeModel());
 assert.equal(bad.cures,2);assert(bad.weekdays>=7);assert.equal(good.ok,true);assert.equal(good.weekdays,4);assert.equal(good.cures,1);assert.equal(good.readyDay,8);assert.equal(good.saved,bad.weekdays-4);assert(good.readyDay<bad.readyDay);
 assert.equal(M.docDowntimeEvaluate(scenario,scenario.baseline).ok,false,'two-cure original must fail');
}
const c=M.docDowntimeCase(0),model=M.docDowntimeModel();
const badPlans=[
 [{1:'r1',2:'r2',3:'c',5:'g1',8:'g2',9:'c'},'Two cures'],
 [{2:'r1',3:'r2',4:'g1',5:'g2',6:'c',13:'c'},'Two cures'],
 [{2:'r1',3:'r2',4:'g1',6:'g2',7:'c'},'Gap in GREEN'],
 [{2:'r1',3:'r2',4:'g1',6:'g2',7:'c'},'GREEN on weekend'],
 [{2:'r1',3:'r2',5:'g1',8:'g2',9:'c'},'Gap in work'],
 [{1:'r1',2:'r2',3:'g1',4:'g2',5:'c'},'Weekday cure'],
 [{9:'r1',10:'r2',11:'g1',12:'g2',13:'c'},'Too late'],
 [{2:'r1',3:'r2',4:'g1',5:'g2',7:'c'},'Cure begins late'],
 [{2:'r2',3:'r1',4:'g1',5:'g2',6:'c'},'Wrong order'],
 [{2:'r1',3:'r2',4:'g1',5:'g2'},'Missing cure'],
 [{2:'r1',3:'r2',4:'g1',5:'g2',6:'c',10:'r1'},'Duplicate work'],
 [{2:'r1',3:'r2',4:'g1',5:'g2',6:'c',11:'bogus'},'Unknown tile']
];
for(const [bad,description] of badPlans){const r=M.docDowntimeEvaluate(c,bad);assert.equal(r.ok,false,description+': '+r.message);assert(r.message&&r.message.length>16)}
assert.equal(M.docDowntimeEvaluate(c,model).saved,3);
// A varied set of novice actions must never crash the pure evaluation function.
let seed=746732;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
for(let i=0;i<4000;i++){const p={};for(let k=0;k<12;k++){if(rand()<.7)p[1+Math.floor(rand()*14)]=stages[Math.floor(rand()*5)];}const r=M.docDowntimeEvaluate(M.docDowntimeCase(i),p);assert.equal(typeof r.ok,'boolean');assert.equal(typeof r.message,'string');}

const handlers={},root={innerHTML:'',addEventListener:(event,fn)=>handlers[event]=fn},store={};
const document={getElementById:id=>id==='fmApp'?root:{value:'',style:{}},documentElement:{style:{}}};
const window={FMModel:M,scrollTo(){},location:{reload(){}},visualViewport:{scale:1},AudioContext:null,webkitAudioContext:null};
const localStorage={getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=v};
const ctx={window,document,localStorage,console,globalThis:null};ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(fs.readFileSync('dist/fm2290.js','utf8'),ctx);
const api=window.FM2290,click=dataset=>handlers.click({target:{closest:()=>({dataset,closest:()=>null})}});
api.setRoute('doc','home');click({docMode:'r1'});click({docCell:'A001:1'});
assert.equal(api.getState().doc.cells.A001[1],'r1','Original 24-aircraft sandbox works');
click({action:'next'});
assert.equal(api.getState().screen,'downtime','New exercise must follow the original');
for(const word of ['Recover Flying Days','Original plan','Your repaired plan','Saturday','Sunday','Check Downtime Savings','Reset to flawed plan','Show Efficient Plan','New Variation'])assert(root.innerHTML.includes(word),word+' missing');
assert.equal((root.innerHTML.match(/data-doc-down-cell=/g)||[]).length,14,'Two weeks of editable day cells');
assert.equal((root.innerHTML.match(/data-doc-down-mode=/g)||[]).length,6,'Red, Green, Cure, Erase palette');
click({action:'doc-down-check'});assert.equal(api.getState().feedback.good,false,'Flawed plan should fail');assert(api.getState().feedback.msg.includes('Two cures'));
click({action:'doc-down-clear'});for(const [day,stage] of Object.entries(model)){click({docDownMode:stage});click({docDownCell:day});}
assert.equal(Object.keys(api.getState().doc.downtime.cells).length,5,'Learner must be able to build from blank');
click({action:'doc-down-check'});assert.equal(api.getState().feedback.good,true,'Correct manual plan passes');
assert(root.innerHTML.includes('Flying weekdays recovered'));
assert(root.innerHTML.includes('3</b>'),'Three recovered weekdays must be visible');
assert.equal(api.getState().doc.cells.A001[1],'r1','Original sandbox must remain untouched');
click({docDownMode:'erase'});click({docDownCell:'6'});assert.equal(api.getState().doc.downtime.passed,false,'Any edit invalidates the previous success');
assert.equal(api.getState().doc.downtime.cells[6],undefined);
click({action:'show-me'});assert.equal(api.getState().doc.downtime.cells[6],'c','Show Me fills the actual board');click({action:'check'});assert.equal(api.getState().feedback.good,true);
click({action:'resim'});assert.equal(api.getState().doc.downtime.variation,1);assert.equal(M.docDowntimeStats(api.getState().doc.downtime.cells).cures,2,'New Variation loads flawed plan');
assert.equal(api.getState().doc.cells.A001[1],'r1','Reset downtime does not erase original board');
click({action:'doc-down-reset'});assert.equal(M.docDowntimeStats(api.getState().doc.downtime.cells).cures,2);
click({action:'prev'});assert.equal(api.getState().screen,'home');
click({action:'next'});assert.equal(api.getState().screen,'downtime');click({action:'next'});assert.equal(api.getState().screen,'inspection');click({action:'prev'});assert.equal(api.getState().screen,'downtime');
click({route:'analysis:home'});click({route:'doc:downtime'});assert.equal(api.getState().doc.downtime.variation,1,'Variation survives module change');
console.log('PASS 22.9.4 Documentation downtime recovery: 3 variants, repair and bad sequences, 4,000 simulated plans, all controls, model, progression and sandbox preservation.');
