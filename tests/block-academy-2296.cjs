'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const M=require('../dist/fm2290-model.js'),B=require('../dist/block-academy-model.js');
function harness(storage={}){
 const listeners={},root={innerHTML:'',addEventListener:(type,handler)=>listeners[type]=handler};
 const document={getElementById:k=>k==='baApp'?root:null,documentElement:{style:{}}};
 const window={FMModel:M,FMBlockModel:B,scrollTo(){},innerHeight:800,AudioContext:null,webkitAudioContext:null};
 const localStorage={getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v};
 const context={document,window,localStorage,console,setTimeout,Date,Math};vm.createContext(context);vm.runInContext(fs.readFileSync('dist/block-academy.js','utf8'),context);
 const click=dataset=>listeners.click({target:{closest:()=>({dataset})}});
 return {api:window.FMBlockAcademy,click,root,storage};
}
const a=harness();
assert(a.root.innerHTML.includes('REVENGE OF'));assert(a.root.innerHTML.includes('NO TIMER'));assert(a.root.innerHTML.includes('7 phone-first')===false);assert(a.root.innerHTML.includes('Database &amp; Systems'));
assert.equal(B.LEVELS.length,7);
for(const s of ['wave','status','phase','doc','analysis','integrity','dbm'])assert(a.root.innerHTML.includes('data-start="'+s+'"'));
// 6-Turn-4: first six then four of those aircraft, no advance by just time.
a.api.openLevel('wave');let m=a.api.mission();m.aircraft.forEach((x,i)=>a.api.place(x.id,'wave:'+i));m.aircraft.slice(0,4).forEach((x,i)=>a.api.place(x.id,'turn:'+i));a.api.check();assert(a.api.getState().complete.wave);assert.equal(a.api.getState().score,100);
// State survives a reload.
const reread=harness(a.storage);assert(reread.api.getState().complete.wave);
// Status: users may put an NMC on the flying line to learn from the error.
a.api.openLevel('status');m=a.api.mission();let allowed=m.aircraft.filter(x=>x.status==='FMC'),hq=m.aircraft.find(x=>x.status==='HQ');
allowed.slice(0,5).forEach((x,i)=>a.api.place(x.id,'wave:'+i));a.api.place(m.aircraft.find(x=>x.status==='NMCM').id,'wave:5');allowed.slice(0,4).forEach((x,i)=>a.api.place(x.id,'turn:'+i));a.api.check();assert(!a.api.getState().complete.status);assert(a.api.getState().message.message.includes('NMCM'));
a.api.place(hq.id,'wave:5');a.api.check();assert(a.api.getState().complete.status);
// Phase: no fly when near Phase; use Phase dock and hold lanes.
a.api.openLevel('phase');m=a.api.mission();m.aircraft.filter(x=>x.status==='FMC'&&x.hours>=24).forEach((x,i)=>a.api.place(x.id,'fly:'+i));a.api.place(m.aircraft.find(x=>x.status==='PHASE').id,'phase:0');m.aircraft.filter(x=>x.status==='NMCS'||(x.status==='FMC'&&x.hours<24)).forEach((x,i)=>a.api.place(x.id,'hold:'+i));a.api.check();assert(a.api.getState().complete.phase);
// Documentation reuses the original validated two-cure-to-one-cure downtime model.
a.api.openLevel('doc');for(const [day,value] of Object.entries(M.docDowntimeModel()))a.api.place(value,'day:'+(Number(day)-1));a.api.check();assert(a.api.getState().complete.doc);assert(a.api.getState().message.message.includes('3 saved'));
// Analysis model is sourced from existing M.METRICS; every metric accepts its own correct numerator and denominator.
a.api.openLevel('analysis');for(let k=0;k<M.METRICS.length;k++){const x=B.makeMission('analysis',0,k,M);const board={slots:{'num:0':x.metric.num,'den:0':x.metric.den},resultChoice:x.correct};assert(B.evaluate('analysis',x,board,M).ok,x.metric.name);board.resultChoice=x.correct+10;assert(!B.evaluate('analysis',x,board,M).ok,x.metric.name+' wrong result');}
m=a.api.mission();a.api.place(m.metric.num,'num:0');a.api.place(m.metric.den,'den:0');a.click({number:String(m.correct)});a.api.check();assert(a.api.getState().complete.analysis);
// Integrity and access must BOTH find mismatches AND choose a controlled action.
for(const id of ['integrity','dbm']){
 a.api.openLevel(id);m=a.api.mission();for(const r of m.discrepancies)a.click({flag:r});a.api.check();assert(!a.api.getState().complete[id]);assert.equal(a.api.getState().levelBoards[id].stage,'decision');
 a.click({choice:'erase'});a.api.check();assert(!a.api.getState().complete[id]);
 a.click({choice:m.choices.find(x=>x.correct).id});a.api.check();assert(a.api.getState().complete[id]);
}
assert.equal(Object.keys(a.api.getState().complete).length,7);assert.equal(a.api.getState().score,700);
// Assisted examples don't count toward proficiency.
a.api.openLevel('analysis');a.click({metricChange:'something'});a.api.showModel();a.api.check();assert(a.api.getState().message.message.includes('Assisted'));assert.equal(a.api.getState().score,700);
// Every variation is completable. Randomized invalid candidates cannot crash validators.
for(let variation=0;variation<12;variation++){
 for(const id of ['wave','status','phase','doc','analysis','integrity','dbm']){
  const x=B.makeMission(id,variation,variation%M.METRICS.length,M),board={slots:{},marked:[],choice:null,resultChoice:null};
  if(['wave','status'].includes(id)){const permitted=x.aircraft.filter(z=>['FMC','HQ'].includes(z.status)),first=id==='wave'?permitted:permitted.filter(z=>z.status!=='HQ').slice(0,5).concat(permitted.find(z=>z.status==='HQ'));first.slice(0,6).forEach((z,i)=>board.slots['wave:'+i]=z.id);first.slice(0,4).forEach((z,i)=>board.slots['turn:'+i]=z.id);}
  if(id==='phase'){x.aircraft.filter(z=>z.status==='FMC'&&z.hours>=24).forEach((z,i)=>board.slots['fly:'+i]=z.id);board.slots['phase:0']=x.aircraft.find(z=>z.status==='PHASE').id;x.aircraft.filter(z=>z.status==='NMCS'||(z.status==='FMC'&&z.hours<24)).forEach((z,i)=>board.slots['hold:'+i]=z.id);}
  if(id==='doc')for(const [day,v] of Object.entries(M.docDowntimeModel()))board.slots['day:'+(day-1)]=v;
  if(id==='analysis'){board.slots['num:0']=x.metric.num;board.slots['den:0']=x.metric.den;board.resultChoice=x.correct;}
  if(id==='integrity'||id==='dbm'){board.marked=x.discrepancies;board.choice=x.choices.find(c=>c.correct).id;}
  assert(B.evaluate(id,x,board,M).ok,`No valid solution for ${id} variation ${variation}`);
 }
}
// Leave the full original simulator available, not replaced by a clone.
for(const p of ['dist/index.html','dist/fm2290.js','dist/block-academy.html','dist/block-academy.css','dist/block-academy-model.js','dist/block-academy.js'])assert(fs.existsSync(p));
assert(fs.readFileSync('dist/fm2290.js','utf8').includes('./block-academy.html'));
assert(fs.readFileSync('dist/block-academy.js','utf8').includes('./index.html#capstone'));
console.log('PASS 22.9.6 seven block missions, 19 analysis metrics, 84 synthetic variation solves, original capstone/Docs compatibility, assisted-credit controls.');
