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
for(const f of ['block-academy.js','fm2290.js'])vm.runInContext(fs.readFileSync(path.join(base,'dist',f),'utf8'),context,{filename:f});
const click=dataset=>handlers.click.forEach(fn=>fn({target:{closest:()=>({dataset,closest:()=>null})},preventDefault(){}}));
const current=()=>window.FM2290.getState().academy;
function start(mission,round=1){
 const ch=B.makeChallenge(mission,round);
 window.FM2290.setRoute('academy','play',{academy:{mission,round,variation:0,progress:{[mission]:round-1},score:0,lives:3,stage:'play',placements:B.emptyPlacements(ch),selectedPiece:null,message:null,assisted:false,hint:false}});
 return ch;
}
function place(id,slot,index=0){click({academyTile:id});click({academySlot:`${slot}:${index}`});}
const checks=[];
{
 const ch=start(1),[p,q]=ch.available;
 place(p.id,'first');place(p.id,'turn');
 place(q.id,'first');
 assert.equal(current().placements.turn[0],null);
 click({academyAction:'undo'});
 assert.equal(current().placements.first[0],p.id,'undo replacement must restore original first-wave aircraft');
 assert.equal(current().placements.turn[0],p.id,'undo replacement must restore dependent turn');
 checks.push('Replace aircraft + undo restores first wave and dependent turn');
 click({academyRemove:'first:0'});
 assert.equal(current().placements.first[0],null);assert.equal(current().placements.turn[0],null);
 click({academyAction:'undo'});
 assert.equal(current().placements.first[0],p.id);assert.equal(current().placements.turn[0],p.id);
 checks.push('Remove first wave + undo restores dependent turn');
 click({academyRemove:'turn:0'});assert.equal(current().placements.first[0],p.id);assert.equal(current().placements.turn[0],null);
 click({academyAction:'undo'});assert.equal(current().placements.turn[0],p.id);
 checks.push('Remove turn leaves first wave and undo restores turn');
}
{
 const ch=start(4),ids=ch.slots.map(s=>s.correct);
 place(ids[0],'step0');place(ids[1],'step1');
 place(ids[1],'step0');
 assert.equal(current().placements.step0[0],ids[1]);assert.equal(current().placements.step1[0],null);
 click({academyAction:'undo'});
 assert.equal(current().placements.step0[0],ids[0]);assert.equal(current().placements.step1[0],ids[1]);
 checks.push('Move decision between occupied cells + undo restores both cells');
 click({academyAction:'reset'});const empty=JSON.stringify(current().placements);
 click({academyAction:'undo'});assert.equal(JSON.stringify(current().placements),empty,'reset must clear old round undo history');
 checks.push('Reset clears undo history');
}
{
 const ch=start(5);click({academyAction:'model'});assert.equal(current().assisted,true);
 click({academyAction:'undo'});assert.equal(current().assisted,true,'undo cannot erase shown-model assistance');
 const p=B.modelPlacements(ch);
 for(const [bank,ids] of Object.entries(p))for(let i=0;i<ids.length;i++){
  // Existing assignments may be selected or empty after undo; tap twice only when already selected.
  if(current().selectedPiece===ids[i])click({academyTile:ids[i]});
  place(ids[i],bank,i);
 }
 click({academyAction:'check'});assert.equal(current().progress[5]||0,0);
 checks.push('Model → undo → solve cannot gain independent credit');
}
{
 const ch=start(2,61),before=JSON.stringify(current().placements);
 click({afWave:'turn'});click({afBankPage:'1'});click({afWave:'spare'});click({afBankPage:'-1'});
 assert.equal(JSON.stringify(current().placements),before,'view navigation cannot place or remove aircraft');
 checks.push('Wave and bank paging do not mutate the plan');
}
{
 start(1);const ch=B.makeSlideChallenge(1),a=current();
 window.FM2290.setRoute('academy','slide',{academy:{...a,slideProgress:0,slide:{round:1,positions:B.slidePositions(ch),moves:0,solved:false,selected:'target',message:null}}});
 const blocker=ch.pieces.find(p=>p.id.startsWith('block'));
 const initial=JSON.stringify(current().slide.positions);
 click({slidePiece:blocker.id});click({slideNudge:'-1'});
 assert.notEqual(JSON.stringify(current().slide.positions),initial);assert.equal(current().slide.moves,1);
 click({slideAction:'undo'});
 assert.equal(JSON.stringify(current().slide.positions),initial,'slide undo restores exact positions');
 assert.equal(current().slide.moves,0,'slide undo restores move count');
 checks.push('Slide undo restores positions and move count');
 click({slidePiece:blocker.id});click({slideNudge:'-1'});click({slideAction:'reset'});
 const reset=JSON.stringify(current().slide.positions);
 click({slideAction:'undo'});assert.equal(JSON.stringify(current().slide.positions),reset);
 assert.equal(current().slide.moves,0);assert.equal(current().slide.solved,false);
 checks.push('Slide reset clears undo history');
}
console.log('PASS one-screen interaction controls:\n'+checks.map(x=>' - '+x).join('\n'));
