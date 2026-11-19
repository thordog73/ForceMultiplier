'use strict';
// Behavior checks for one-screen game controls. No CSS or pixel claims.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const base=path.resolve(process.argv[2]||'.');
const B=require(path.join(base,'dist/block-academy-model.js'));
const M=require(path.join(base,'dist/fm2290-model.js'));
const handlers={},storage={};
const cl={toggle(){},add(){},remove(){},contains(){return false}};
const style={setProperty(){},removeProperty(){}};
const root={innerHTML:'',style,classList:cl,querySelector(){return null},querySelectorAll(){return []},addEventListener(k,fn){(handlers[k]??=[]).push(fn)}};
const document={getElementById:id=>root,querySelector(){return null},querySelectorAll(){return []},documentElement:{style,classList:cl,clientHeight:844,clientWidth:390},body:{style,classList:cl},addEventListener(){}};
const window={FMModel:M,FMBlockModel:B,scrollTo(){},scrollY:0,innerHeight:844,innerWidth:390,setTimeout:fn=>fn(),requestAnimationFrame:fn=>fn(),addEventListener(){},matchMedia:()=>({matches:true,addEventListener(){}})};
const context={window,document,localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v},console,setTimeout:fn=>fn(),clearTimeout(){},requestAnimationFrame:fn=>fn()};context.globalThis=context;vm.createContext(context);
for(const f of ['fundamentals-data.js','teaching.js','block-academy.js','fm2290.js'])vm.runInContext(fs.readFileSync(path.join(base,'dist',f),'utf8'),context,{filename:f});
const click=dataset=>handlers.click.forEach(fn=>fn({target:{closest:()=>({dataset,closest:()=>null})},preventDefault(){}}));
const current=()=>window.FM2290.getState().academy;
function start(mission,round=1){
 const ch=B.makeChallenge(mission,round);
 window.FM2290.setRoute('academy','play',{academy:{mission,round,variation:0,progress:{[mission]:round-1},score:0,lives:3,stage:'play',placements:B.emptyPlacements(ch),selectedPiece:null,message:null,assisted:false,hint:false}});
 return ch;
}
function place(id,slot,index=0){click({academyTile:id});click({academySlot:`${slot}:${index}`});}

const checks=[];
// A same-cell assignment must not call model placement and clear its linked turn.
{
 const ch=start(1),id=ch.available[0].id;
 place(id,'first');place(id,'turn');
 const before=JSON.stringify(current().placements),history=current().undo.length;
 place(id,'first');
 assert.equal(JSON.stringify(current().placements),before);
 assert.equal(current().undo.length,history);
 checks.push('Same-cell placement preserves dependent turn and undo history');
}
// Coaching state must survive closing the overlay and hiding its inner panel.
for(const screen of ['play','slide'])for(const stage of [3,4]){
 start(5);if(screen==='slide')window.FM2290.setRoute('academy','slide');
 click({afHelp:'coach'});click({coachStage:String(stage)});
 click({coachToggle:'1'}); // Close the inner coach too.
 assert.equal(window.FM2290.getState().teaching.open,false);
 click({afHelp:'close'});
 assert.equal(current().focusPanel,null);
 assert(window.FMTeaching.activeIndependent(window.FM2290.getState()),`stage ${stage} stays active in ${screen}`);
 if(screen==='play'){
  const before=JSON.stringify(current().placements);
  click({academyAction:'model'});assert.equal(JSON.stringify(current().placements),before);assert.equal(current().assisted,false);
  click({academyAction:'hint'});assert.equal(current().hint,false);
 }else{
  const before=current().slide.message;
  click({slideAction:'hint'});assert.equal(current().slide.message,before);
 }
 click({afHelp:'coach'});click({coachStage:'1'});click({afHelp:'close'});
 assert(!window.FMTeaching.activeIndependent(window.FM2290.getState()));
 if(screen==='play'){
  click({academyAction:'model'});assert.equal(current().assisted,true);
 }else{click({slideAction:'hint'});assert.match(current().slide.message,/Slide the/);}
}
checks.push('Challenge and Prove gates persist after both coach/overlay close; Help Me releases them');
// Pages must visit every item/cell at the compact size thresholds.
for(const [w,h] of [[320,568],[375,667],[390,844],[844,390]]){
 window.innerWidth=w;window.innerHeight=h;
 for(const mission of [3,4]){
  const ch=start(mission,61),initial=JSON.stringify(current().placements);
  const items=ch.kind==='launch'?ch.aircraft:ch.pieces,seen=new Set();
  for(let i=0;i<50;i++){
   for(const match of root.innerHTML.matchAll(/data-academy-tile="([^"]+)"/g))seen.add(match[1]);
   const page=current().bankPage;click({afBankPage:'1'});if(current().bankPage===page)break;
  }
  assert.equal(seen.size,items.length,`all candidate blocks reachable for ${mission} at ${w}x${h}`);
  const cells=new Set();
  if(ch.kind==='launch')for(const wave of ch.slots){
   click({afWave:wave.id});
   for(let i=0;i<50;i++){
    for(const match of root.innerHTML.matchAll(/data-academy-slot="([^"]+)"/g))cells.add(match[1]);
    const page=current().wavePage;click({afWavePage:'1'});if(current().wavePage===page)break;
   }
  }else for(let i=0;i<50;i++){
   for(const match of root.innerHTML.matchAll(/data-academy-slot="([^"]+)"/g))cells.add(match[1]);
   const page=current().slotPage;click({afSlotPage:'1'});if(current().slotPage===page)break;
  }
  assert.equal(cells.size,ch.slots.reduce((n,s)=>n+(s.count||1),0),`all destinations reachable for ${mission} at ${w}x${h}`);
  assert.equal(JSON.stringify(current().placements),initial);
 }
}
checks.push('Every late-stage aircraft, decision and destination remains reachable through paging at four size branches');
// Native destination buttons retain Enter/Space activation when no block is selected.
{
 const ch=start(4),id=ch.slots[0].correct;place(id,'step0');
 const button={tagName:'BUTTON',dataset:{academySlot:'step0:0'}};button.closest=()=>button;
 let prevented=0;
 for(const fn of handlers.keydown||[])fn({key:'Enter',target:button,preventDefault(){prevented++}});
 assert.equal(prevented,0,'native button keyboard click must not be cancelled');
 click({academySlot:'step0:0'});
 assert.equal(current().selectedPiece,id);assert.equal(current().message,null);
 checks.push('Occupied native buttons remain keyboard-activatable and expose selected-block details');
}
console.log('PASS focused source review:\n'+checks.map(x=>' - '+x).join('\n'));
