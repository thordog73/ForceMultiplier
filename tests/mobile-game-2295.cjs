const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),M=require('../dist/fm2290-model.js');
function makeApp(stored={}){
 const handlers={},root={innerHTML:'',addEventListener:(t,f)=>handlers[t]=f},store={...stored};
 const document={getElementById:id=>id==='fmApp'?root:{value:'',style:{}},documentElement:{style:{}}};
 const window={FMModel:M,scrollTo(){},location:{reload(){}},visualViewport:{scale:1},AudioContext:null,webkitAudioContext:null};
 const localStorage={getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=v};
 const c={window,document,localStorage,console,globalThis:null};c.globalThis=c;vm.createContext(c);vm.runInContext(fs.readFileSync('dist/fm2290.js','utf8'),c);
 return {api:window.FM2290,click:dataset=>handlers.click({target:{closest:()=>({dataset})}}),root,store};
}
const a=makeApp();a.api.setRoute('scheduling','skill8');
assert(a.root.innerHTML.includes('REVENGE OF THE NONNER'));
assert(a.root.innerHTML.includes('ADD MORE JETS TO THE SCHEDULE!'));
assert(a.root.innerHTML.includes('NON-NONNER'));
assert(a.root.innerHTML.includes('90-Day Fleet Scheduling Capstone'));
assert.equal((a.root.innerHTML.match(/data-cap-slot=/g)||[]).length,22);
assert.equal((a.root.innerHTML.match(/class="game-block /g)||[]).length,24);
const statusHTML=a.root.innerHTML;assert(statusHTML.includes('game-block hq'),'Day 1 must display HQ');
assert(statusHTML.includes('class="game-slot'));
// Both tap banks and slot removals retain the legacy capstone representation.
for(let i=1;i<=12;i++)a.click({capTile:'A'+i});
let d=a.api.getState().sched.data[8];assert.equal(d.selected.length,12);assert.equal(d.waveSlots.filter(Boolean).length,12);
a.click({capMode:'turn'});for(let i=1;i<=10;i++)a.click({capTile:'A'+i});
d=a.api.getState().sched.data[8];assert.equal(d.turn.length,10);assert.equal(d.turnSlots.filter(Boolean).length,10);
a.click({capSlot:'wave:0'});d=a.api.getState().sched.data[8];assert.equal(d.selected.length,11);assert.equal(d.turn.length,9,'Removing flyer must also remove it from turn slots');
a.click({capMode:'wave'});a.click({capTile:'A1'});a.click({capMode:'turn'});a.click({capTile:'A1'});a.api.checkCurrent();
d=a.api.getState().sched.data[8];assert.equal(d.day,2);assert.equal(d.history[0].hours,66);assert.equal(d.lastLaunch.weekday,'MONDAY');
assert(a.root.innerHTML.includes('MONDAY LAUNCHED'));
// Next day uses fresh grid and last launch is cosmetic; model still works.
a.api.showMe();a.api.checkCurrent();d=a.api.getState().sched.data[8];assert.equal(d.day,3);
assert(a.root.innerHTML.includes('+2 JETS · ACCEPT'));
a.click({capOfficer:'add'});d=a.api.getState().sched.data[8];assert.equal(d.extraJets,2);assert.equal(d.officerChoice,'add');
assert.equal(d.waveSlots.length,14);assert(a.root.innerHTML.includes('14'));
a.api.showMe();d=a.api.getState().sched.data[8];assert.equal(d.selected.length,14);assert.equal(d.turn.length,10);
a.api.checkCurrent();d=a.api.getState().sched.data[8];assert.equal(d.day,4);assert.equal(d.history[2].hours,72);assert.equal(d.history[2].extraJets,2);
assert.equal(d.lastLaunch.extraJets,2);assert.equal(d.extraJets,0,'New day clears the prior officer requirement');
// Correctly handle officer challenge defense and no accidental penalty.
for(let day=4;day<8;day++){a.api.showMe();a.api.checkCurrent()};
d=a.api.getState().sched.data[8];assert.equal(d.day,8);assert(a.root.innerHTML.includes('DEFEND THE PLAN'));
a.click({capOfficer:'defend'});d=a.api.getState().sched.data[8];assert.equal(d.officerChoice,'defend');assert.equal(d.extraJets,0);
a.api.showMe();a.api.checkCurrent();d=a.api.getState().sched.data[8];assert.equal(d.history[7].hours,66);assert.equal(d.history[7].officerDecision,'defend');
// Remains offline-state safe and preserves classic option.
a.click({action:'game-toggle-classic'});assert(a.root.innerHTML.includes('capstone-command'));a.click({action:'game-toggle-classic'});assert(a.root.innerHTML.includes('REVENGE OF THE NONNER'));
const b=makeApp(a.store);b.api.setRoute('scheduling','skill8');assert.equal(b.api.getState().sched.data[8].day,9);
// Other modules and the existing modification sandbox are reachable and unaltered.
b.api.setRoute('doc','home');assert(b.root.innerHTML.includes('Modification Plan'));b.api.setRoute('doc','downtime');assert(b.root.innerHTML.includes('Recover Flying Days'));
// Errors cost a practice life, not the ability to keep learning.
const c=makeApp();c.api.setRoute('scheduling','skill8');for(let i=0;i<6;i++)c.api.checkCurrent();assert.equal(c.api.getState().sched.data[8].lives,0);
assert.equal(c.api.getState().sched.data[8].day,1);
console.log('PASS 22.9.5 mobile capstone: tap/undo/turn, officer extra +2, 72h model, risk display, campaign persistence, fallback, practice lives, preserved Docs.');
