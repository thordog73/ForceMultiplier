'use strict';
const assert=require('node:assert/strict');
const Flight=require('../www/game-rules.js'),Worlds=require('../www/game-worlds.js');
const Packs=Object.fromEntries(['analysis','documentation','database','integrity'].map(id=>[id,require('../www/pack-'+id+'.js')]));
const backup=require('../www/game-backup.js');
const engines={Flight,Packs,Worlds};
const clone=value=>JSON.parse(JSON.stringify(value));
const profile=()=>({version:1,activeSkill:'scheduling',world:'airline',sound:false,haptics:true,tracks:{}});
const blank=()=>({am:[],pm:[],wave:'am',launched:[],phase:'work',placements:{},flights:{},confirmed:[],activeDay:0,boardWave:'am',selectedTask:null,mistakes:0,hints:0,assisted:false,won:false});
let checks=0;
for(const world of Object.keys(Worlds.worlds))for(const skill of ['scheduling',...Object.keys(Packs)]){
  const engine=skill==='scheduling'?Flight:Packs[skill];
  for(const level of engine.levels)for(const revision of [1,2]){
    const s=engine.make(level.id,1149,revision);
    for(const solved of [false,true]){
      const data=profile(),state=blank();
      if(skill==='scheduling'){
        state.selectedTask=s.tasks?.[0]?.id||null;
        state.activeDay=s.flightGoals?.find(g=>g.am||g.pm)?.day??0;
        if(solved)Object.assign(state,clone(s.model));
      }else state.play=solved?engine.solve(s):clone(s.initial);
      data.world=world;data.activeSkill=skill;
      data.tracks[world+':'+skill]={best:{[level.id]:solved?3:0},current:{level:level.id,seed:s.seed,revision:s.revision||1,state}};
      try{assert.deepEqual(backup.validate(data,engines),data);}catch(error){error.message=world+'/'+skill+'/'+level.id+' revision '+revision+' solved '+solved+': '+error.message;throw error;}checks++;
    }
  }
}
const carried=profile();carried.tracks['airline:scheduling']={best:{12:3},current:null,last12:{seed:129,state:Flight.make(12,129).model}};
assert.deepEqual(backup.validate(carried,engines),carried);checks++;
assert.equal(Worlds.worlds.squirrel.label,'Acorn Ops');checks++;
function rejects(change){const data=clone(carried);change(data);assert.throws(()=>backup.validate(data,engines));checks++;}
rejects(p=>p.tracks['airline:scheduling'].best[99]=3);
rejects(p=>p.tracks['airline:scheduling'].best[1]=4);
rejects(p=>p.tracks['unrecognized:scheduling']=p.tracks['airline:scheduling']);
rejects(p=>p.tracks['airline:scheduling'].last12.seed=-1);
rejects(p=>p.tracks['airline:scheduling'].last12.state.placements.injected=0);
rejects(p=>p.tracks['airline:scheduling'].last12.state.flights[0]={am:['unknown'],pm:[]});
rejects(p=>p.tracks['airline:scheduling'].current={level:1,seed:1,state:{}});
rejects(p=>p.tracks['airline:scheduling'].extra=JSON.parse('{"__proto__":{"polluted":true}}'));
rejects(p=>p.tracks['airline:scheduling'].extra='x'.repeat(12001));
rejects(p=>p.tracks['airline:scheduling'].extra=Array(2001).fill(0));
assert.equal({}.polluted,undefined);checks++;
console.log('PASS game backups: all 55 levels, four worlds, both generator revisions, initial/solved states, carry-over and malformed import guards; '+checks+' checks.');
