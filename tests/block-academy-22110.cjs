'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm'),B=require('../dist/block-academy-model.js'),M=require('../dist/fm2290-model.js');
const colors=['NMCM','NMCS','NMCB','DEPOT','PHASE','HQ','PFR','PBG','CURE'];
const expected={NMCM:'#f2475d',NMCS:'#ffe268',NMCB:'#ffad52',DEPOT:'#303947',PHASE:'#b96df0',HQ:'#ffffff',PFR:'#ffffff',PBG:'#ffffff',CURE:'#ffffff'};
for(const status of colors)assert.equal(B.appearance(status).color[0],expected[status],`${status} color must preserve maintenance status meaning`);
const green=[0,1,15,29].map(d=>B.appearance('FMC',d).color[0]);
assert.equal(new Set(green).size,4,'FMC must lighten with successive idle days, rather than use random hues');
assert.equal(B.appearance('HQ').border,'#11a567');
for(let id=1;id<=3;id++)for(let round=1;round<=90;round++){
 const ch=B.makeChallenge(id,round),p=B.modelPlacements(ch);
 assert.equal(ch.day,B.dayForRound(round));assert(B.validate(ch,p).ok);
 assert(ch.aircraft.every(a=>a.status!=='FMC'||a.daysIdle<30),'day 30 cannot remain FMC');
 for(const a of ch.aircraft)assert.deepEqual(a.color,B.appearance(a.status,a.daysIdle).color);
 if(ch.id===3){assert.equal(ch.flightHoursPerSortie,2);const p2=B.emptyPlacements(ch);assert(!B.validate(ch,p2).ok)}
}
for(let round=1;round<=90;round++){
 const ch=B.makeSlideChallenge(round);let pos=B.slidePositions(ch);
 assert(!B.slideSolved(ch,pos),'slide puzzle should not start complete');
 // Slide each maintenance blocker away from the launch column; their colors remain status-linked.
 for(const p of ch.pieces.filter(p=>p.id.startsWith('block'))){const r=B.slideMove(ch,pos,p.id,-p.x);assert(r.ok,`level ${round} must allow ${p.id} to move out of FMC lane: ${r.message}`);pos=r.positions}
 const launch=B.slideMove(ch,pos,'target',-4);
 assert(launch.ok,`level ${round}: green target must reach the doorway`);
 assert(B.slideSolved(ch,launch.positions),`level ${round}: sliding puzzle must be solvable`);
 assert(ch.pieces.some(p=>p.goal&&p.status==='FMC'&&p.axis==='v'),'goal must be a vertical FMC aircraft');
}
const handlers={},root={innerHTML:'',addEventListener:(k,fn)=>handlers[k]=fn,classList:{toggle(){}}},storage={};
const document={getElementById:id=>root,documentElement:{style:{}}};
const window={FMModel:M,FMBlockModel:B,scrollTo(){},setTimeout:fn=>fn(),AudioContext:null,webkitAudioContext:null};
const localStorage={getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v};
const context={window,document,localStorage,console,setTimeout:fn=>fn()};context.globalThis=context;vm.createContext(context);
for(const f of ['dist/block-academy.js','dist/fm2290.js'])vm.runInContext(fs.readFileSync(f,'utf8'),context,{filename:f});
const click=dataset=>handlers.click({target:{closest:()=>({dataset,closest:()=>null})}});
click({academyMission:'3'});assert(root.innerHTML.includes('Phase Flow'));assert(root.innerHTML.includes('MONDAY DOOR'));assert(root.innerHTML.includes('academy-phase-row'));
assert(root.innerHTML.includes('LIVES'));assert(root.innerHTML.includes('FMC lightens each idle day'));
click({academyAction:'phase-toggle'});assert.equal(window.FM2290.getState().academy.phaseExpanded,true);
const ch3=B.makeChallenge(3,1),pick=ch3.available[0];
click({academyFocusAircraft:pick.id});assert.equal(window.FM2290.getState().academy.selectedPiece,pick.id);
click({route:'academy:home'});click({academyMission:'4'});
assert(root.innerHTML.includes('Save Downtime'));for(const label of ['PFR','PBG','CURE','H in Documentation'])assert(root.innerHTML.includes(label),label+' documentation must be present');
click({route:'academy:slide'});assert(root.innerHTML.includes('Clear the Launch Lane'));assert(root.innerHTML.includes('NO TIMER'));
click({slidePiece:'block0'});click({slideNudge:'-1'});
click({slidePiece:'target'});click({slideNudge:'-1'});click({slideNudge:'-1'});click({slideNudge:'-1'});click({slideNudge:'-1'});
assert(root.innerHTML.includes('FMC AIRCRAFT CLEARED THE DOOR!'));
assert.equal(window.FM2290.getState().academy.slideProgress,1);
click({slideAction:'next'});assert.equal(window.FM2290.getState().academy.slide.round,2);
assert(root.innerHTML.includes('SLIDE PUZZLE 2/90'));
click({route:'academy:home'});assert(root.innerHTML.includes('1/90 sliding puzzles complete'));
assert(root.innerHTML.includes('Flashcards'));
console.log('PASS 22.11.0 Academy: exact status colors, aging to HQ, weekday doors, 90 solvable sliding puzzles, Phase Flow, PFR/PBG/CURE, navigation and progress.');
