const assert=require('node:assert/strict');
const pack=require('../www/pack-database.js');
const clone=x=>JSON.parse(JSON.stringify(x));
let checks=0;
const ok=(condition,label)=>{assert.ok(condition,label);checks++;};
function play(s){
  let state=clone(s.initial);
  const apply=event=>{const before=JSON.stringify(state),result=pack.act(s,state,event);ok(JSON.stringify(state)===before,'act preserves previous state');ok(!result.error,'valid action succeeds');state=result.state;};
  if(s.type==='permissions'||s.type==='control'){
    for(const a of s.actors){
      for(const key of ['read','edit','admin'])if((state.grants[a.id]||[]).includes(key)!==a.required.includes(key))apply({action:'key',id:a.id,slot:key});
      if(s.chooseScope)apply({action:'scope',id:a.id,slot:a.scope});
    }
  }
  if(s.type==='lifecycle')for(const a of s.actors)if(state.active[a.id]!==a.want)apply({action:'account',id:a.id});
  if(s.type==='pipeline'||s.type==='control')apply({action:'repair',id:s.broken});
  if(s.type==='sequence'||s.type==='control')for(const id of ['backup','test','apply','verify'])apply({action:'step',id});
  if(s.type==='recovery')for(const action of ['restore','replay','verify','reopen'])apply({action});
  return state;
}
for(let seed=1;seed<=20;seed++){
  for(const level of pack.levels){
    const s=pack.make(level.id,seed);
    ok(!pack.check(s,s.initial).ok,'blank or incorrect initial state fails');
    ok(!pack.check(s,{}).ok,'missing state fails');
    ok(pack.check(s,pack.solve(s)).ok,'model solves level '+level.id);
    ok(pack.check(s,play(s)).ok,'actions solve level '+level.id);
    ok(JSON.stringify(s)===JSON.stringify(pack.make(level.id,seed)),'same seed reproduces case');
  }
}
let s=pack.make(1,3),p=pack.solve(s);
p.grants.a.push('admin');ok(!pack.check(s,p).ok,'surplus administration is rejected');
p=pack.solve(s);p.grants.a.push('read');ok(!pack.check(s,p).ok,'duplicate keys rejected');
p=pack.solve(s);p.grants.a=['unknown'];ok(!pack.check(s,p).ok,'unknown key rejected');
s=pack.make(3,4);p=pack.solve(s);p.scopes.a='Reports';ok(!pack.check(s,p).ok,'correct key wrong scope fails');
s=pack.make(6,4);p=pack.solve(s);[p.grants.a,p.grants.b]=[p.grants.b,p.grants.a];ok(!pack.check(s,p).ok,'same display name does not authorize wrong identity');
ok(s.actors.every(a=>a.task==='View reports'),'account cards do not reveal approval instead of requiring identity matching');
ok(s.actors.filter(a=>a.required.length).length===1,'only the unique identity on the request is authorized');
const fakeUi={esc:String,icon:()=>'',world:{icon:'plane',label:'Airline'}};
const identityHtml=pack.render(s,s.initial,fakeUi);
ok(identityHtml.includes('APPROVED REQUEST')&&identityHtml.includes(s.identityTicket.id),'approval evidence remains on the source request');
ok(!identityHtml.includes('No request')&&!identityHtml.includes('>Approved<'),'identity answer is not disclosed on account cards');
s=pack.make(7,4);p=clone(s.initial);
const healthy=s.nodes.find(n=>n.id!==s.broken);
const noRestart=pack.act(s,p,{action:'repair',id:healthy.id});
ok(JSON.stringify(noRestart.state)===JSON.stringify(p),'healthy node is not needlessly restarted');
ok(!pack.check(s,noRestart.state).ok,'repairing healthy node does not solve failure');
s=pack.make(8,4);p={order:['test','backup','apply','verify']};ok(!pack.check(s,p).ok,'incorrect change order fails');
s=pack.make(9,4);p=clone(s.initial);
ok(pack.act(s,p,{action:'reopen'}).error,'cannot reopen unverified service');
ok(pack.act(s,p,{action:'replay'}).error,'cannot replay before restore');
p=pack.act(s,p,{action:'restore'}).state;
ok(pack.act(s,p,{action:'verify'}).error,'snapshot without pending changes is incomplete');
p=pack.act(s,p,{action:'replay'}).state;
const again=pack.act(s,p,{action:'replay'}).state;
ok(again.count===s.target,'replay is not applied twice');
p=pack.solve(s);p.count--;ok(!pack.check(s,p).ok,'status flags cannot override wrong record count');
const capstoneSignatures=new Set(),failedNodes=new Set(),viewerPositions=new Set(),surplusPositions=new Set(),requestedScopes=new Set();
for(let seed=1;seed<=100;seed++){
  const c=pack.make(10,seed),work=play(c);
  ok(pack.check(c,work).ok,'varied capstone completes through real actions');
  ok(!pack.check(c,c.initial).ok,'varied capstone begins with work to resolve');
  failedNodes.add(c.broken);
  viewerPositions.add(c.actors.find(a=>a.required.length===1).id);
  surplusPositions.add(c.actors.find(a=>c.initial.grants[a.id].includes('admin')).id);
  c.actors.forEach(a=>requestedScopes.add(a.scope));
  capstoneSignatures.add(JSON.stringify({actors:c.actors.map(a=>({task:a.task,scope:a.scope,required:a.required})),grants:c.initial.grants,broken:c.broken}));
  for(const node of c.nodes)if(node.id!==c.broken){const before=JSON.stringify(c.initial),attempt=pack.act(c,c.initial,{action:'repair',id:node.id});ok(JSON.stringify(attempt.state)===before,'healthy capstone node remains untouched');}
}
ok(failedNodes.size===3,'capstone varies the failed dependency');
ok(viewerPositions.size===2&&surplusPositions.size===2,'capstone varies which person needs each access correction');
ok(requestedScopes.size===3,'capstone uses all taught scope names');
ok(capstoneSignatures.size>20,'new seeds vary substantive capstone constraints');
for(let seed=1;seed<=20;seed++){
  const legacy=pack.make(10,seed,1),oldWork=pack.act(legacy,legacy.initial,{action:'key',id:'a',slot:'admin'}).state;
  const resumed=pack.make(10,seed,legacy.revision);
  ok(JSON.stringify(resumed)===JSON.stringify(legacy),'legacy capstone retains original facts and order');
  ok(pack.check(resumed,play(resumed)).ok,'legacy capstone remains solvable after restore');
  const latest=pack.make(10,seed),newWork=pack.act(latest,latest.initial,{action:'repair',id:latest.broken}).state;
  ok(JSON.stringify(pack.make(10,seed,latest.revision))===JSON.stringify(latest),'new capstone restores its exact version and facts');
}
console.log('PASS database: 10 levels × 20 seeds, 100 varied capstones, legacy/new restore; '+checks+' assertions.');
