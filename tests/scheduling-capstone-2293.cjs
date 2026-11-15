const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),M=require('../dist/fm2290-model.js');
assert.equal(M.SCHED_SKILLS.length,8);assert.equal(M.SCHED_SKILLS[7].title,'90-Day Fleet Scheduling Capstone');
let fleet=M.initCapstoneFleet();assert.equal(fleet.length,24);assert.equal(M.capstoneAvailable(fleet,1).length,24);assert.equal(M.capstoneStatusFor(fleet.find(x=>x.id==='A7'),3),'NMC');assert.equal(M.capstoneStatusFor(fleet.find(x=>x.id==='A4'),5),'UNAVAILABLE');
const handlers={},root={innerHTML:'',addEventListener:(t,f)=>handlers[t]=f},store={};const document={getElementById:id=>id==='fmApp'?root:{value:'',style:{}},documentElement:{style:{}}};const window={FMModel:M,scrollTo(){},location:{reload(){}},visualViewport:{scale:1},AudioContext:null,webkitAudioContext:null};const localStorage={getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=v};const c={window,document,localStorage,console,globalThis:null};c.globalThis=c;vm.createContext(c);vm.runInContext(fs.readFileSync('dist/fm2290.js','utf8'),c);const api=window.FM2290;
api.setRoute('scheduling','skill8');assert(root.innerHTML.includes('Day 1 of 90'));assert(root.innerHTML.includes('UNAVAILABLE'));assert(root.innerHTML.includes('24-aircraft Phase Flow'));
function clickAction(action){handlers.click({target:{closest:()=>({dataset:{action},closest:()=>null})}})}
for(let i=0;i<90;i++){
 const before=api.getState().sched.data[8],avail=M.capstoneAvailable(before.fleet,before.day).length;
 if(avail<12)clickAction('capstone-shortfall');else{api.showMe();const st=api.getState().sched.data[8];assert.equal(st.selected.length,12,`Day ${st.day}: model lineup`);assert.equal(st.turn.length,10,`Day ${st.day}: model turns`);api.checkCurrent();assert.notEqual(api.getState().feedback?.good,false,`Day ${before.day} failed`);}
}
const d=api.getState().sched.data[8],score=M.capstoneScore(d);assert.equal(d.day,91);assert.equal(d.complete,true);assert.equal(d.history.length,90);assert.equal(score.hours+score.shortfalls*0,score.hours);assert(score.score>=0&&score.score<=100);assert(root.innerHTML.includes('Capstone complete'));
assert(d.history.some(x=>(x.phaseEntries||[]).length>0),'No aircraft ever entered Phase');
assert.equal(score.hangar,0,'Model solution should avoid hangar queens');
console.log(`PASS 22.9.3 scheduling capstone: 24-aircraft fleet completed 90 days, ${score.hours} hours, score ${score.score}, ${score.shortfalls} shortfalls.`);
