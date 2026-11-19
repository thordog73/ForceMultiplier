'use strict';
// Exercise the UI's real action handlers across early and late rounds.
// This validates game behavior only. It makes no rendered-layout claim.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const base=path.resolve(process.argv[2]||'.');
const B=require(path.join(base,'dist/block-academy-model.js'));
const M=require(path.join(base,'dist/fm2290-model.js'));
const handlers={}, storage={};
const cl={toggle(){},add(){},remove(){},contains(){return false}};
const style={setProperty(){},removeProperty(){}};
const root={innerHTML:'',style,classList:cl,querySelector(){return null},querySelectorAll(){return []},addEventListener(k,fn){(handlers[k]??=[]).push(fn)}};
const document={getElementById:id=>root,querySelector(){return null},querySelectorAll(){return []},documentElement:{style,classList:cl,clientHeight:844,clientWidth:390},body:{style,classList:cl},addEventListener(){}};
const window={FMModel:M,FMBlockModel:B,scrollTo(){},scrollY:0,innerHeight:844,innerWidth:390,setTimeout:fn=>fn(),requestAnimationFrame:fn=>fn(),addEventListener(){},matchMedia:()=>({matches:true,addEventListener(){}})};
const context={window,document,localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v},console,setTimeout:fn=>fn(),clearTimeout(){},requestAnimationFrame:fn=>fn()};context.globalThis=context;vm.createContext(context);
for(const f of ['block-academy.js','fm2290.js'])vm.runInContext(fs.readFileSync(path.join(base,'dist',f),'utf8'),context,{filename:f});
const click=dataset=>handlers.click.forEach(fn=>fn({target:{closest:()=>({dataset,closest:()=>null})},preventDefault(){}}));
function start(mission,round){
 const ch=B.makeChallenge(mission,round),a=window.FM2290.getState().academy||{};
 window.FM2290.setRoute('academy','play',{academy:{...a,mission,round,variation:0,progress:{[mission]:round-1},score:0,lives:3,stage:'play',placements:B.emptyPlacements(ch),selectedPiece:null,message:null,assisted:false,hint:false}});
 return ch;
}
let repetitions=0;
for(let mission=1;mission<=7;mission++)for(const round of [1,16,36,61,90]){
 const ch=start(mission,round),p=B.modelPlacements(ch);
 for(const [bank,ids] of Object.entries(p))for(let i=0;i<ids.length;i++){
  click({academyTile:ids[i]});
  assert.equal(window.FM2290.getState().academy.selectedPiece,ids[i]);
  click({academySlot:`${bank}:${i}`});
  assert.equal(window.FM2290.getState().academy.placements[bank][i],ids[i]);
 }
 click({academyAction:'check'});
 let a=window.FM2290.getState().academy;
 assert.equal(a.stage,'victory',`mission ${mission} round ${round} must complete`);
 assert.equal(a.progress[mission],round,`mission ${mission} round ${round} must save progress`);
 repetitions++;
}
// An assisted model is useful learning, but must not grant independent completion.
for(let m=1;m<=7;m++){
 start(m,1);click({academyAction:'model'});click({academyAction:'check'});
 const a=window.FM2290.getState().academy;
 assert.equal(a.progress[m]||0,0);assert.equal(a.assisted,true);
}
// Invalid selection must not invent an assignment, and retries preserve prior progress.
const ch=start(2,36),grounded=ch.aircraft.find(x=>x.status!=='FMC');
click({academyTile:grounded.id});click({academySlot:'first:0'});
assert.equal(window.FM2290.getState().academy.placements.first[0],null);
for(let i=0;i<3;i++)click({academyAction:'check'});
assert.equal(window.FM2290.getState().academy.stage,'retry-needed');
assert.equal(window.FM2290.getState().academy.progress[2],35);
click({academyAction:'retry'});assert.equal(window.FM2290.getState().academy.lives,3);
// Early, intermediate and late slide cases retain legal axis movement and completion.
for(const round of [1,30,61,90]){
 const ch=B.makeSlideChallenge(round),a=window.FM2290.getState().academy;
 window.FM2290.setRoute('academy','slide',{academy:{...a,slideProgress:round-1,slide:{round,positions:B.slidePositions(ch),moves:0,solved:false,selected:'target',message:null}}});
 for(const p of ch.pieces.filter(p=>p.id.startsWith('block'))){
  click({slidePiece:p.id});
  for(let j=0;j<p.x;j++)click({slideNudge:'-1'});
 }
 click({slidePiece:'target'});
 for(let j=0;j<4;j++)click({slideNudge:'-1'});
 const result=window.FM2290.getState().academy;
 assert.equal(result.slide.solved,true,`slide ${round} must solve`);
 assert.equal(result.slideProgress,round);
}
console.log(`PASS UI interaction review: ${repetitions} early/late mission completions, all seven model-assistance gates, invalid-aircraft rejection, retry continuity, four slide tiers. No browser layout measurement is claimed.`);
