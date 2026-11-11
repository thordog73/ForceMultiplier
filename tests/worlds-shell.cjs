'use strict';
// This is a DOM-free shell integration test. It drives the actual event listeners
// and reads only the application's persisted public progress format.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const dist=path.join(__dirname,'../www');
const Flight=require(path.join(dist,'game-rules.js'));
const Worlds=require(path.join(dist,'game-worlds.js'));
const packs=Object.fromEntries(['analysis','documentation','database','integrity'].map(id=>[id,require(path.join(dist,'pack-'+id+'.js'))]));
const source=fs.readFileSync(path.join(dist,'game.js'),'utf8');
const key='force-multiplier-worlds-22',oldKey='force-multiplier-flightline-22';
let assertions=0;
function same(a,b,msg){assert.deepEqual(a,b,msg);assertions++;}
function yes(a,msg){assert.ok(a,msg);assertions++;}
const clone=x=>JSON.parse(JSON.stringify(x));
function harness({entries=[],hash=''}={}){
  const local=new Map(entries),listeners={},windowListeners={},timers=new Map();let tick=0;
  const empty=()=>({innerHTML:'',textContent:'',className:'',dataset:{},classList:{add(){},remove(){},toggle(){}},querySelector(){return null},querySelectorAll(){return[]},addEventListener(){},focus(){},scrollIntoView(){}});
  const root=empty(),toast=empty(),body=empty(),dialogBody=empty(),dialog={...empty(),open:false,close(){this.open=false},showModal(){this.open=true}};
  const location={hash};
  const window={FLIGHT_GAME:Flight,FM_GAME_PACKS:packs,FM_WORLDS:Worlds,scrollY:0,addEventListener(name,fn){windowListeners[name]=fn},history:{replaceState(a,b,value){location.hash=value}},scrollTo(){}};
  const context={
    window,document:{body,activeElement:null,documentElement:{},getElementById(id){return{'game':root,'game-toast':toast,'game-dialog':dialog,'dialog-body':dialogBody}[id]},addEventListener(name,fn){listeners[name]=fn},createTreeWalker(){return{nextNode(){return false}}}},
    NodeFilter:{SHOW_TEXT:4},location,navigator:{},localStorage:{getItem(k){return local.get(k)||null},setItem(k,v){local.set(k,v)}},CSS:{escape:x=>x},innerWidth:1200,matchMedia(){return{matches:true}},setTimeout(fn,ms){const id=++tick;timers.set(id,{fn,ms});return id},clearTimeout(id){timers.delete(id)},console
  };
  vm.runInNewContext(source,context,{filename:'game.js'});
  function event(type,dataset,tagName='BUTTON',value=''){
    const target={dataset,tagName,value,disabled:false,closest(selector){if(selector==='[data-skill-action]')return dataset.skillAction?target:null;if(selector==='[data-action]')return dataset.action?target:null;return null;}};
    listeners[type]({target});
  }
  return{
    act(action,data={}){event('click',{action,...data})},
    pack(action,data={}){event('click',{skillAction:action,...data})},
    input(action,value,data={}){event('change',{skillAction:action,...data},'INPUT',value)},
    read(){return JSON.parse(local.get(key))},
    entries(){return[...local.entries()]},
    hash(){return location.hash},
    route(value){location.hash=value;windowListeners.hashchange?.()},
    flush(){for(const[id,t]of[...timers])if(t.ms===50){timers.delete(id);t.fn()}},
    html(){return root.innerHTML},
    dialogHtml(){return dialogBody.innerHTML},
    toast(){return toast.textContent}
  };
}
const track=(h,world,skill)=>h.read().tracks[world+':'+skill];
const current=h=>{const p=h.read();return p.tracks[p.world+':'+p.activeSkill].current};
const state=h=>current(h).state;
const scenario=h=>{const p=h.read(),c=current(h);return p.activeSkill==='scheduling'?Flight.make(c.level,c.seed):packs[p.activeSkill].make(c.level,c.seed)};
const bareState=()=>({am:[],pm:[],wave:'am',launched:[],phase:'work',placements:{},flights:{},confirmed:[],activeDay:0,boardWave:'am',selectedTask:null,mistakes:0,hints:0,assisted:false,won:false});
const legacyScenario=Flight.make(2,173);
const legacyState={...bareState(),am:[legacyScenario.model.am[0]]};
const legacy={best:{1:3,6:2},sound:true,current:{level:2,seed:173,state:legacyState},last12:{seed:291,state:Flight.make(12,291).model}};
let h=harness({entries:[[oldKey,JSON.stringify(legacy)]]});
same(track(h,'airline','scheduling').current,legacy.current,'legacy unfinished work migrates');
same(track(h,'airline','scheduling').best,legacy.best,'legacy stars migrate');
same(track(h,'airline','scheduling').last12,legacy.last12,'legacy checkerboard carry-over migrates');
same(h.read().sound,true,'legacy sound migrates');
yes(h.entries().some(([k,v])=>k===oldKey&&v===JSON.stringify(legacy)),'migration preserves original saved data');

// Actual unfinished pack work survives both independent selectors.
h.act('switch-skill',{skill:'analysis'});
let a=scenario(h);h.pack('pick-job',{id:a.target[0]});
const analysisBefore=clone(current(h));
h.act('switch-skill',{skill:'documentation'});
let d=scenario(h);h.pack('attach',{id:d.target});
const docsBefore=clone(current(h));
h.act('switch-world',{world:'bus'});
same(h.read().activeSkill,'documentation','world switch keeps skill');
same(state(h).play,{assignment:null},'new world starts its own state');
d=scenario(h);h.pack('attach',{id:d.assets.find(x=>x!==d.target)});
const busDocsBefore=clone(current(h));
h.act('switch-world',{world:'airline'});
same(current(h),docsBefore,'returning to prior world restores exact unfinished work');
h.act('switch-skill',{skill:'analysis'});
same(current(h),analysisBefore,'returning to prior skill restores exact unfinished work');
h.act('switch-skill',{skill:'scheduling'});
same(current(h),legacy.current,'scheduling choices survive other games');
h.act('switch-world',{world:'bus'});
same(state(h).am,[],'bus scheduling does not inherit airline selections');
h.act('plane',{plane:'01'});
const busScheduleBefore=clone(current(h));
h.act('switch-skill',{skill:'documentation'});
same(current(h),busDocsBefore,'bus documentation survives other bus games');
h.act('switch-skill',{skill:'scheduling'});
same(current(h),busScheduleBefore,'bus scheduling restores its own choice');

// Browser reload and explicit routes use the matching world/skill state.
const savedEntries=h.entries(),savedHash=h.hash(),beforeReload=clone(current(h));
h=harness({entries:savedEntries,hash:savedHash});
same(current(h),beforeReload,'reload resumes exact routed case');
h=harness({entries:h.entries(),hash:'#airline/documentation/1'});
same(current(h),docsBefore,'deep-link reload preserves the same existing level');
h=harness({entries:h.entries(),hash:'#level-2'});
same(current(h),legacy.current,'legacy level links open airline scheduling');

// Every pack's first interactive control is routed through data-skill-action.
for(const world of Object.keys(Worlds.worlds)){
  h.act('switch-world',{world});
  h.act('switch-skill',{skill:'analysis'});h.act('level',{id:'1'});a=scenario(h);
  h.pack('pick-job',{id:a.target[0]});yes(state(h).play.picked.includes(a.target[0]),'analysis action routes');
  h.act('switch-skill',{skill:'documentation'});h.act('level',{id:'1'});d=scenario(h);
  h.pack('attach',{id:d.target});same(state(h).play.assignment,d.target,'documentation action routes');
  h.act('switch-skill',{skill:'database'});h.act('level',{id:'1'});
  h.pack('key',{id:'a',slot:'read'});yes(state(h).play.grants.a.includes('read'),'database action routes');
  h.act('switch-skill',{skill:'integrity'});h.act('level',{id:'1'});
  h.pack('copy',{id:'a'});yes(packs.integrity.check(scenario(h),state(h).play).ok,'integrity action routes');
  h.act('skill-check');same(state(h).earned,3,'unassisted correct work earns three stars');
}

// A button's empty DOM value must not swallow its numeric data-value.
h.act('switch-skill',{skill:'documentation'});h.act('level',{id:'4'});d=scenario(h);
h.pack('due',{value:String(d.due)});
same(state(h).play.due,d.due,'numeric button data-value is used');
h.act('undo');same(state(h).play.due,null,'Undo restores previous work input');
h.input('due',String(d.due));same(state(h).play.due,d.due,'input change uses its current value');
h.act('skill-check');same(state(h).earned,3,'numeric task completes through shell');

// Assistance is sticky through Undo and switch/reload.
h.act('level',{id:'1'});h.act('help');h.act('close');d=scenario(h);
h.pack('attach',{id:d.target});h.act('undo');yes(state(h).hints>0,'Undo preserves hints');
h.pack('attach',{id:d.target});h.act('skill-check');same(state(h).earned,1,'hinted case earns one star');
h.act('replay');h.act('solution');h.act('undo');yes(state(h).assisted,'Undo preserves demonstrated status');
h.act('solution');const assistedCase=clone(current(h));
h.act('switch-skill',{skill:'analysis'});h.act('switch-skill',{skill:'documentation'});
same(current(h),assistedCase,'assistance survives skill switching');
h=harness({entries:h.entries(),hash:h.hash()});
yes(state(h).assisted,'assistance survives reload');
h.act('skill-check');same(state(h).earned,0,'shown working example cannot earn independent stars');

// Exercise every pack's scenario creation, example, final checker and win UI.
for(const skill of Object.keys(packs)){
  h.act('switch-skill',{skill});
  for(const level of packs[skill].levels){
    h.act('level',{id:String(level.id)});h.act('solution');h.act('skill-check');
    same(state(h).won,true,skill+' '+level.id+' solution completes through UI');
    same(state(h).earned,0,'demo remains unscored');
    yes(h.html().includes('DEMO COMPLETE'),'completion is clearly identified');
  }
  yes(!track(h,h.read().world,skill).last12,'non-scheduling tracks never cache scheduling model');
}

// Checkerboard 12 -> 13 carry-over stays inside its scheduling world.
h.act('switch-world',{world:'airline'});h.act('switch-skill',{skill:'scheduling'});
h.act('level',{id:'12'});h.act('solution');h.act('check-board');
const board12=clone(track(h,'airline','scheduling').last12);
yes(board12,'completed scheduling checkerboard is retained');
h.act('next-level');
same(current(h).seed,board12.seed,'changed-plan case keeps original seed');
same(state(h).placements,board12.state.placements,'changed-plan case retains work');
same(state(h).flights,board12.state.flights,'changed-plan case retains flights');
yes(!Flight.checkBoard(scenario(h),state(h)).ok,'new outage/demand makes the previous plan need revision');
h.act('switch-world',{world:'cats'});h.act('level',{id:'13'});
yes(!track(h,'cats','scheduling').last12,'different world does not borrow airline carry-over');

// Restarting an exposed case must not turn it into an unassisted case.
h.act('switch-skill',{skill:'documentation'});h.act('level',{id:'1'});h.act('solution');
const exposedSeed=current(h).seed;h.act('reset');
same(current(h).seed,exposedSeed,'Restart keeps the same case');
same(state(h).play,{assignment:null},'Restart clears work inputs');
yes(state(h).assisted,'Restart of the same case preserves demonstration exposure');
d=scenario(h);h.pack('attach',{id:d.target});h.act('skill-check');
same(state(h).earned,0,'re-entering a demonstrated same-seed answer is not independent');
h.act('replay');same(state(h).assisted,false,'New case starts a new independent attempt');
yes(current(h).seed!==exposedSeed,'New case changes the seed');

// A supplied example is remembered without pretending the learner completed it.
h=harness();h.act('switch-skill',{skill:'analysis'});h.act('solution');h.act('skill-check');h.act('review');
same(track(h,'airline','analysis').best['1'],0,'demo status remains remembered');
yes(h.html().includes('example viewed'),'demo has a distinct level label');
yes(!h.html().includes('active done'),'demo is not marked as completed');
h.act('map');yes(h.dialogHtml().includes('Example viewed'),'level map identifies an example');
h.act('skills');yes(h.dialogHtml().includes('<em>0 / 12</em>'),'demo is excluded from completed level count');
h.act('close');h.act('replay');a=scenario(h);
for(const id of a.target)h.pack('pick-job',{id});
h.act('skill-check');same(track(h,'airline','analysis').best['1'],3,'fresh independent work replaces demo status');
h.act('review');h.act('solution');h.act('skill-check');
same(track(h,'airline','analysis').best['1'],3,'later example cannot erase earned stars');

// Existing unfinished cases and same-case restarts retain their generator revision.
for(const [skill,level] of [['analysis',5],['analysis',9],['analysis',11],['analysis',12],['database',10]]){
  const seed=775,pack=packs[skill],old=pack.make(level,seed,1),play=pack.solve(old);
  const legacyProfile={version:1,world:'airline',activeSkill:skill,sound:false,tracks:{['airline:'+skill]:{best:{},current:{level,seed,state:{...bareState(),play}}}}};
  h=harness({entries:[[key,JSON.stringify(legacyProfile)]],hash:'#airline/'+skill+'/'+level});
  same(current(h).revision,1,'old saved case acquires revision1');
  same(state(h).play,play,'legacy inputs are not reinterpreted');
  h.act('skill-check');yes(state(h).won,'legacy answer remains accepted');
  h.act('review');h.act('reset');same(current(h).revision,1,'Restart keeps legacy case revision');
  h.act('solution');h.act('skill-check');yes(state(h).won,'legacy restarted example still checks');
  h.act('replay');same(current(h).revision,2,'New case uses current generation');
}

console.log('PASS: worlds shell migration, independent progress, routing/reload, all packs, Undo, assistance, demo status, revisions and carry-over; '+assertions+' assertions.');
