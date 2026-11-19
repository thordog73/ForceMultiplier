const assert=require('node:assert/strict');
const pack=require('../dist/pack-integrity.js');
const clone=x=>JSON.parse(JSON.stringify(x));
let checks=0;
const ok=(condition,label)=>{assert.ok(condition,label);checks++;};
function play(s){
  let state=clone(s.initial);
  const apply=event=>{const before=JSON.stringify(state),result=pack.act(s,state,event);ok(JSON.stringify(state)===before,'act preserves previous state');ok(!result.error,'valid action succeeds');state=result.state;};
  if(s.type==='records'){
    const seen=new Set();
    for(const row of s.rows){if(seen.has(row.eventId)){apply({action:'remove',id:row.id});continue;}seen.add(row.eventId);apply({action:'copy',id:row.id});}
    if(s.requireReason)apply({action:'reason',id:'source'});
  }
  if(s.type==='units'){apply({action:'number',id:String(s.target)});apply({action:'unit',id:'min'});}
  if(s.type==='duplicates'){
    const seen=new Set();for(const row of s.rows){if(seen.has(row.eventId))apply({action:'remove',id:row.id});else seen.add(row.eventId);}
  }
  if(s.type==='links')for(const child of s.children){apply({action:'job',id:child.id});apply({action:'parent',id:child.asset});}
  if(s.type==='window')for(const id of s.expected)apply({action:'row',id});
  if(s.type==='sources'){apply({action:'source',id:'current'});apply({action:'apply-source'});}
  if(s.type==='gate'){for(const id of ['unique','known','nonnegative'])apply({action:'rule',id});apply({action:'run-gate'});}
  return state;
}
for(let seed=1;seed<=20;seed++){
  for(const level of pack.levels){
    const s=pack.make(level.id,seed);
    ok(!pack.check(s,s.initial).ok,'initial state fails level '+level.id);
    ok(!pack.check(s,{}).ok,'missing state fails');
    ok(pack.check(s,pack.solve(s)).ok,'model solves level '+level.id);
    ok(pack.check(s,play(s)).ok,'actions solve level '+level.id);
    ok(JSON.stringify(s)===JSON.stringify(pack.make(level.id,seed)),'same seed reproduces case');
  }
}
let s=pack.make(2,3),p=pack.solve(s);
p.records.a.value=0;ok(!pack.check(s,p).ok,'unknown is not zero');
p=pack.solve(s);p.records.b.value=null;ok(!pack.check(s,p).ok,'known zero is not unknown');
s=pack.make(3,3);p=pack.solve(s);p.unit='h';ok(!pack.check(s,p).ok,'correct number wrong units fails');
p=pack.solve(s);p.value=Infinity;ok(!pack.check(s,p).ok,'nonfinite counts rejected');
s=pack.make(4,3);p=clone(s.initial);
const copies=s.rows.filter(x=>x.eventId===s.rows.find(x=>x.id==='a').eventId);
p.removed=[copies[0].id];ok(pack.check(s,p).ok,'either duplicate copy may be removed');
p.removed=[copies[1].id];ok(pack.check(s,p).ok,'alternate duplicate removal accepted');
p.removed=copies.map(x=>x.id);ok(!pack.check(s,p).ok,'cannot remove entire event');
p.removed=[s.rows.find(x=>x.id==='b').id];ok(!pack.check(s,p).ok,'same asset and count do not make distinct event a duplicate');
s=pack.make(5,3);p=pack.solve(s);p.links.a='99';ok(!pack.check(s,p).ok,'dangling parent ID rejected');
s=pack.make(6,3);p=pack.solve(s);p.selected=p.selected.filter(id=>s.rows.find(x=>x.id===id).value!==0);ok(!pack.check(s,p).ok,'zero record still belongs in period');
s=pack.make(7,3);p=clone(s.initial);
for(const id of ['draft','current']){p=pack.act(s,p,{action:'source',id}).state;p=pack.act(s,p,{action:'apply-source'}).state;}
ok(pack.check(s,p).ok,'wrong source can be corrected while preserving history');
p.audit[1].before=-1;ok(!pack.check(s,p).ok,'broken source history rejected');
s=pack.make(8,3);p=pack.solve(s);p.audit=[];ok(!pack.check(s,p).ok,'correct number alone is not traceable correction');
p=pack.solve(s);p.reason='estimate';ok(!pack.check(s,p).ok,'unsupported correction reason rejected');
s=pack.make(9,3);p=pack.solve(s);p=pack.act(s,p,{action:'rule',id:'nonzero'}).state;p=pack.act(s,p,{action:'run-gate'}).state;ok(!pack.check(s,p).ok,'overbroad zero rejection fails');
p=pack.solve(s);p=pack.act(s,p,{action:'rule',id:'unique'}).state;ok(!pack.check(s,p).ok,'changing gate invalidates old test');
s=pack.make(10,3);p=clone(s.initial);
p=pack.act(s,p,{action:'remove',id:'a'}).state;
for(const id of ['b','c','d'])p=pack.act(s,p,{action:'copy',id}).state;
ok(pack.check(s,p).ok,'alternate clean batch may keep the already-correct duplicate');
ok(pack.meter(s,p).done===pack.meter(s,p).total,'alternate clean batch meter completes');
const ui={esc:String,icon:()=>'<svg></svg>',asset:()=>'<svg></svg>',world:{label:'Airline',icon:'plane',assetSingular:'aircraft',assetPlural:'aircraft',jobPlural:'flights'}};
const fresh=pack.make(10,3),before=pack.render(fresh,fresh.initial,ui);
const reviewed=pack.act(fresh,fresh.initial,{action:'copy',id:'d'}).state;
const after=pack.render(fresh,reviewed,ui);
ok(before!==after,'verifying an already-correct record produces persistent visible feedback');
ok(after.includes('data-focus="di-copy-d" aria-label="Record '+fresh.rows.find(r=>r.id==='d').eventId+' reviewed" aria-pressed="true"'),'reviewed record is identified to assistive technology');
ok(after.includes('Reviewed'),'reviewed state has a readable label');
console.log('PASS integrity: 10 levels × 20 seeds; '+checks+' assertions.');
