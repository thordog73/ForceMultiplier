const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),M=require('../dist/fm2290-model.js');
function make(seed,strategy){const handlers={},root={innerHTML:'',addEventListener:(t,f)=>handlers[t]=f},store={};const document={getElementById:id=>id==='fmApp'?root:{value:'',style:{}},documentElement:{style:{}}};const window={FMModel:M,scrollTo(){},location:{reload(){}},visualViewport:{scale:1},AudioContext:null,webkitAudioContext:null};const localStorage={getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=v};const c={window,document,localStorage,console,globalThis:null};c.globalThis=c;vm.createContext(c);vm.runInContext(fs.readFileSync('dist/fm2290.js','utf8'),c);const api=window.FM2290,click=dataset=>handlers.click({target:{closest:()=>({dataset,closest:()=>null})}});api.setRoute('scheduling','skill8');let x=seed>>>0,rnd=()=>{x=(x*1664525+1013904223)>>>0;return x/4294967296};
 for(let rep=0;rep<90;rep++){
  const st=api.getState().sched.data[8],day=st.day;M.normalizeCapstoneFleet(st.fleet,day);let avail=st.fleet.map(a=>({id:a.id,h:a.phaseHours,days:M.capstoneDaysSince(a,day),status:M.capstoneStatusFor(a,day)})).filter(a=>a.status==='AVAILABLE');
  if(avail.length<12){click({action:'capstone-shortfall'});continue;}
  let ordered;
  if(strategy==='lowphase')ordered=avail.slice().sort((a,b)=>a.h-b.h);
  else if(strategy==='highphase')ordered=avail.slice().sort((a,b)=>b.h-a.h);
  else if(strategy==='oldest')ordered=avail.slice().sort((a,b)=>b.days-a.days||b.h-a.h);
  else if(strategy==='alpha')ordered=avail.slice().sort((a,b)=>Number(a.id.slice(1))-Number(b.id.slice(1)));
  else if(strategy==='reverse')ordered=avail.slice().sort((a,b)=>Number(b.id.slice(1))-Number(a.id.slice(1)));
  else if(strategy==='alternate')ordered=avail.slice().sort((a,b)=>day%2?a.h-b.h:b.h-a.h);
  else if(strategy==='random')ordered=avail.slice().sort(()=>rnd()-.5);
  else ordered=avail.slice().sort((a,b)=>b.days-a.days||b.h-a.h);
  const selected=ordered.slice(0,12);for(const a of selected)click({air:a.id});click({mode:'turn'});
  let turn=selected.slice();if(strategy==='lowphase')turn.sort((a,b)=>a.h-b.h);else if(strategy==='highphase')turn.sort((a,b)=>b.h-a.h);else if(strategy==='random')turn.sort(()=>rnd()-.5);else turn.sort((a,b)=>b.h-a.h);for(const a of turn.slice(0,10))click({air:a.id});api.checkCurrent();assert.notEqual(api.getState().feedback?.good,false,`strategy ${strategy} day ${day}`);
 }
 const d=api.getState().sched.data[8],q=M.capstoneScore(d);assert.equal(d.history.length,90);assert.equal(d.complete,true);assert(root.innerHTML.includes('Capstone complete'));return q;}
const strategies=['modelish','lowphase','highphase','oldest','alpha','reverse','alternate','random','random','oldest'];const results=strategies.map((s,i)=>make(100+i,s));assert(results.some(x=>x.clusters>0),'Stress users never produced a Phase cluster');assert(results.some(x=>x.hangar>0||x.shortfalls>0),'Stress users never produced a utilization/availability consequence');console.log('PASS 22.9.3 capstone 10-user stress:',results.map((r,i)=>`${i+1}:${r.score}/${r.shortfalls}s/${r.hangar}hq/${r.clusters}pc`).join(' '));
