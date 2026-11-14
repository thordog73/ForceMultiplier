const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),M=require('../dist/fm2290-model.js');
const handlers={},root={innerHTML:'',addEventListener:(t,f)=>handlers[t]=f},store={};const document={getElementById:id=>id==='fmApp'?root:{value:'6600 / 1.5',style:{}},documentElement:{style:{}}};const window={FMModel:M,scrollTo(){},location:{reload(){}},visualViewport:{scale:1},AudioContext:null,webkitAudioContext:null};const localStorage={getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=v};const c={window,document,localStorage,console,globalThis:null};c.globalThis=c;vm.createContext(c);vm.runInContext(fs.readFileSync('dist/fm2290.js','utf8'),c);const api=window.FM2290;
function route(m,s){api.setRoute(m,s)}
for(let id=1;id<=7;id++){route('scheduling','skill'+id);api.showMe();api.checkCurrent();assert(api.getState().feedback?.good!==false,`Scheduling skill ${id} show-me/check failed`) }
// Drive A8 all the way into Phase with the model lineup.
route('scheduling','skill3');for(let i=0;i<3;i++){api.showMe();api.checkCurrent()}assert.equal(api.getState().sched.data[3].phase[7].hours,0);assert(root.innerHTML.includes('PHASE'));
// Repeated model schedules spread the flat phase flow.
route('scheduling','skill4');for(let i=0;i<5;i++){api.showMe();api.checkCurrent()}const hrs=api.getState().sched.data[4].phase.slice(0,10).map(x=>x.hours);assert(new Set(hrs).size>=4,'Phase Flow did not spread');
// Documentation model is valid end-to-end.
route('doc','home');api.showMe();api.checkCurrent();assert(api.getState().feedback.good);assert.equal(api.getState().doc.red.A024,24);assert.equal(api.getState().doc.green.A024,26);
// Metric show-me creates the correct formula.
route('analysis','metric');let st=api.getState();st.analysis.metric='mc'; // state clone only; route through click not needed here
// Use click path for MC metric.
handlers.click({target:{closest:()=>({dataset:{metric:'mc'},closest:()=>null})}});api.showMe();api.checkCurrent();assert(api.getState().feedback.good);
// Fishbone Show Me reaches evidence-testing step.
route('analysis','sim4');api.showMe();assert.equal(api.getState().analysis.fishStep,5);
// Data Integrity and DBM show-me are concrete.
route('integrity','skill1');api.showMe();assert.equal(Object.keys(api.getState().integrity.built||{}).length,10);
route('dbm','skill1');api.showMe();assert.deepEqual(JSON.parse(JSON.stringify(api.getState().dbm.data.access)),{read:true,edit:true,admin:false,scope:'Records'});
console.log('PASS 22.9.0 functional: Show Me and completion work on the rebuilt primary workflows.');
