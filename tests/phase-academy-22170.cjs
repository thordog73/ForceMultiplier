'use strict';
// Source interaction checks for the live Phase Flow. This is not a browser or
// pixel-layout test; it exercises the production render and action handlers.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const base=path.resolve(process.argv[2]||path.join(__dirname,'..'));
const B=require(path.join(base,'dist/block-academy-model.js'));
const M=require(path.join(base,'dist/fm2290-model.js'));
const P=require(path.join(base,'dist/academy-phase.js'));
const window={FMModel:M,FMBlockModel:B,FMAcademyPhase:P,innerWidth:390,innerHeight:844,setTimeout:fn=>fn(),matchMedia:()=>({matches:true})};
const context={window,document:{querySelector(){return null}},console,Date,setTimeout:fn=>fn()};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(base,'dist/block-academy.js'),'utf8'),context,{filename:'block-academy.js'});
const A=window.FMBlockAcademy;
let state,html='',saves=0;
const ui={state:()=>state,save(){saves++;},render(){html=A.renderAcademy(state);},setRoute(module,screen){state.module=module;state.screen=screen;ui.render();},tone(){}};
const click=dataset=>{assert.equal(A.handleClick(dataset,state,ui),true,'production action must be handled');};
const current=()=>state.academy;
const plan=()=>JSON.stringify(current().placements);
const workspace=()=>html.split('<div class="af-workspace">')[1]?.split('<footer class="af-dock">')[0]||'';
function start(round=61,mission=3){
 const ch=B.makeChallenge(mission,round,0);
 state={module:'academy',screen:'play',sound:false,academy:{mission,round,variation:0,progress:{[mission]:round-1},score:0,lives:3,stage:'play',placements:B.emptyPlacements(ch),selectedPiece:null,message:null,assisted:false,hint:false}};
 ui.render();return ch;
}
function add(id,wave){if(current().selectedPiece!==id)click({academyTile:id});click({afPhasePlace:wave});}
const checks=[];

// A saved game without the new preference opens the actual graph during play.
{
 const ch=start();
 assert.equal(current().phaseView,undefined);
 assert.match(workspace(),/data-phase-view="chart"/);
 assert.match(workspace(),/class="ap-mini-chart"/);
 assert.match(workspace(),/data-af-help="phase-live"/);
 assert.match(workspace(),/aria-label="Available blocks"/);
 assert.match(html,/<footer class="af-dock">/);
 for(const aircraft of ch.aircraft)assert(workspace().includes(aircraft.id),'chart represents '+aircraft.id);
 assert.equal((workspace().match(/data-academy-tile=/g)||[]).length,3,'phone bank must display one row of three choices');
 assert.match(workspace(),new RegExp('0/'+ch.needFirst));
 assert.match(workspace(),new RegExp('0/'+ch.needTurn));
 checks.push('Real chart is the default workspace; all tails, all wave counts, aircraft bank and standard footer remain available');
}

// Repeated quick actions use the exact production placement flow and update hours.
{
 const ch=start(),solution=B.modelPlacements(ch),id=solution.first[0],aircraft=ch.aircraft.find(a=>a.id===id),spare=solution.spare[0];
 add(id,'first');
 assert.equal(current().placements.first[0],id);
 let row=P.snapshot(ch,current().placements).rows.find(r=>r.id===id);
 assert.equal(row.after,aircraft.phaseHours-2);
 assert(workspace().includes(aircraft.phaseHours+' → '+(aircraft.phaseHours-2)+'h'),'rendered selected readout must update after the first sortie');
 add(id,'turn');
 row=P.snapshot(ch,current().placements).rows.find(r=>r.id===id);
 assert.equal(row.sorties,2);assert.equal(row.after,aircraft.phaseHours-4);
 assert(workspace().includes(aircraft.phaseHours+' → '+(aircraft.phaseHours-4)+'h'),'rendered chart must include both sorties');
 add(spare,'spare');
 row=P.snapshot(ch,current().placements).rows.find(r=>r.id===spare);
 assert.equal(current().placements.spare[0],spare);
 assert.equal(row.sorties,0);assert.equal(row.after,row.current,'protecting a spare must not consume flying hours');
 const before=plan(),history=current().undo.length;
 click({academyTile:id});click({afPhasePlace:'first'});
 assert.equal(plan(),before);assert.equal(current().undo.length,history);
 assert.match(current().message,/already in First wave/);
 checks.push('First-wave plus turn hours update the graph; spare consumes no hours; repeated assignment preserves dependent turns and undo history');
}

// Changing views is navigation only, including with a selected aircraft.
{
 const ch=start(),id=B.modelPlacements(ch).first[0];add(id,'first');
 click({academyTile:id});const before=plan(),history=current().undo.length;
 click({afPhaseView:'assignments'});
 assert.match(workspace(),/aria-label="Aircraft assignments"/);
 assert(!workspace().includes('class="ap-mini-chart"'));
 assert.equal(plan(),before);assert.equal(current().selectedPiece,id);
 click({afPhaseView:'chart'});
 assert.match(workspace(),/class="ap-mini-chart"/);
 assert.equal(plan(),before);assert.equal(current().undo.length,history);assert.equal(current().selectedPiece,id);
 click({afHelp:'phase-live'});
 assert.equal(current().focusPanel,'phase-live');assert.match(html,/academy-phase-live ap-expanded/);
 assert.match(html,/hidden aria-hidden="true"><section class="academy-phase-flow"/,'legacy chart must be hidden when the detailed live view is present');
 click({afHelp:'close'});assert.equal(current().focusPanel,null);assert.equal(plan(),before);
 click({afPhaseView:'assignments'});click({academyAction:'reset'});
 assert.equal(current().phaseView,'chart');assert.match(workspace(),/data-phase-view="chart"/);
 checks.push('Chart/Assignments tabs and expansion preserve plans and selection; reset returns to the chart');
}

// Invalid quick actions cannot silently substitute aircraft or invent a turn.
{
 const ch=start(),solution=B.modelPlacements(ch),grounded=ch.aircraft.find(a=>a.status!=='FMC');
 const initial=plan();add(solution.first[0],'turn');
 assert.equal(plan(),initial);assert.match(current().message,/must first be/);
 add(grounded.id,'first');assert.equal(plan(),initial);assert.match(current().message,/cannot be assigned/);
 for(const id of solution.first)add(id,'first');
 const full=plan(),history=current().undo.length,other=ch.available.find(a=>!solution.first.includes(a.id)).id;
 add(other,'first');
 assert.equal(plan(),full);assert.equal(current().undo.length,history);assert.match(current().message,/First wave is full/);
 add(solution.spare[0],'spare');
 const withSpare=plan(),spareHistory=current().undo.length,another=ch.available.find(a=>!solution.first.includes(a.id)&&a.id!==solution.spare[0]).id;
 add(another,'spare');
 assert.equal(plan(),withSpare);assert.equal(current().undo.length,spareHistory);assert.match(current().message,/Protected spare is full/);
 checks.push('Turns require first-wave membership; grounded aircraft are rejected; full first-wave and spare banks are never overwritten');
}

// Compact bank paging still reaches every aircraft and does not alter the plan.
{
 const ch=start(),initial=plan(),seen=new Set();
 for(let i=0;i<50;i++){
  for(const match of workspace().matchAll(/data-academy-tile="([^"]+)"/g))seen.add(match[1]);
  const before=current().bankPage;click({afBankPage:'1'});if(current().bankPage===before)break;
 }
 assert.equal(seen.size,ch.aircraft.length);assert.equal(plan(),initial);
 start(1,1);assert(!workspace().includes('af-phase-tabs'));assert.match(workspace(),/aria-label="Aircraft assignments"/);
 checks.push('Every aircraft remains reachable through compact paging; other missions retain their existing boards');
}

// Model-derived projections remain stable and exact across progression tiers.
{
 let count=0;
 for(const round of [1,16,36,61,90])for(let variation=0;variation<8;variation++){
  const ch=B.makeChallenge(3,round,variation),before=JSON.stringify(ch),empty=P.snapshot(ch,B.emptyPlacements(ch)),p=B.modelPlacements(ch),full=P.snapshot(ch,p);
  assert.deepEqual(empty.rows.map(r=>r.id),full.rows.map(r=>r.id));
  assert(empty.rows.every(r=>r.current===r.after));
  for(const row of full.rows)assert.equal(row.after,row.current-(Number(p.first.includes(row.id))+Number(p.turn.includes(row.id)))*ch.flightHoursPerSortie);
  assert.equal(full.invalid.length,0);assert.equal(JSON.stringify(ch),before);count++;
 }
 const invalid=P.snapshot({aircraft:[{id:'A01',status:'FMC',phaseHours:2}],flightHoursPerSortie:2,nearPhaseAt:16},{first:['A01'],turn:['A01']});
 assert.equal(invalid.rows[0].after,-2);assert.equal(invalid.invalid.length,1);
 checks.push(count+' generated challenges preserve all aircraft and exact projections; negative-hour forecasts remain visible as errors');
}
assert(saves>0);
console.log('PASS Phase Flow source interactions:\n'+checks.map(check=>' - '+check).join('\n')+'\nNo browser or pixel-layout measurement is claimed.');
