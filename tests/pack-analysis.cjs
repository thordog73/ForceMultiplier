'use strict';
const assert=require('node:assert/strict');
const pack=require('../dist/pack-analysis.js');
const clone=x=>JSON.parse(JSON.stringify(x));
let checked=0;
function expect(ok,message){assert.ok(ok,message);checked++;}
function action(s,st,action,id,value){
  const before=clone(st),event={action,id:String(id)};
  if(value!==undefined)event.value=String(value);
  const result=pack.act(s,st,event);
  assert.deepEqual(st,before,'Reducer mutated previous state');checked++;
  expect(result&&result.state&&typeof result.state==='object','Action returns state');
  return result.state;
}
const ui={esc:x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),icon:name=>'<svg aria-hidden="true" data-icon="'+name+'"></svg>',asset:()=>'<svg class="plane-svg" aria-hidden="true"></svg>',world:{id:'cats',jobPlural:'visits',assetPlural:'care vans'}};
for(const level of pack.levels){
  for(let seed=1;seed<=20;seed++){
    const s=pack.make(level.id,seed),original=clone(s);
    expect(!pack.check(s,s.initial).ok,'Initial state must not pass '+level.id);
    expect(!pack.check(s,{}).ok,'Empty state must not pass '+level.id);
    expect(!pack.check(s,null).ok,'Null state must not pass '+level.id);
    expect(pack.check(s,pack.solve(s)).ok,'Solved state failed '+level.id);
    assert.deepEqual(s,original,'Solving/checking changed scenario');checked++;
    let st=clone(s.initial);
    if(s.id===1||s.id===2)for(const id of s.target)st=action(s,st,'pick-job',id);
    if(s.id===3||s.id===5){st=action(s,st,'number',s.count,s.count);st=action(s,st,'number',s.total,s.total);}
    if(s.id===4){for(const g of s.groups)st=action(s,st,'rate',g.id,g.rate);st=action(s,st,'winner',s.winner);}
    if(s.id===6){
      for(let cap=0;cap<30&&st.heights.some(n=>n!==s.mean);cap++){
        const high=st.heights.findIndex(n=>n>s.mean),low=st.heights.findIndex(n=>n<s.mean);
        st=action(s,st,'move-token',high);st=action(s,st,'move-token',low);
      }
      expect(st.heights.reduce((n,x)=>n+x,0)===s.values.reduce((n,x)=>n+x,0),'Tokens conserved');
    }
    if(s.id===7){for(const id of s.sorted)st=action(s,st,'median-add',id);st=action(s,st,'median-position',2);}
    if(s.id===8){st=action(s,st,'source','matching');st=action(s,st,'restore','gap');}
    if(s.id===9){st=action(s,st,'trend-point',5);st=action(s,st,'trend-point',0);st=action(s,st,'direction',s.direction);}
    if(s.id===10){for(const [id,value] of Object.entries(s.extremes)){st=action(s,st,'slot',id);st=action(s,st,'number',value,value);}st=action(s,st,'winner',s.winner);}
    if(s.id===11){st=action(s,st,'direction',s.direction);st=action(s,st,'claim',s.expectedClaim);}
    if(s.id===12){for(const id of s.target)st=action(s,st,'report-row',id);st=action(s,st,'number',s.count,s.count);st=action(s,st,'number',s.total,s.total);st=action(s,st,'scope','today');}
    expect(pack.check(s,st).ok,'Real action path failed '+s.id+' seed '+seed);
    const meter=pack.meter(s,st);
    expect(Number.isFinite(meter.done)&&Number.isFinite(meter.total)&&meter.total>0,'Valid meter');
    const html=pack.render(s,st,ui);
    expect(html.includes('sg-workbench')&&!html.includes('undefined')&&!html.includes('NaN'),'Valid renderer');
    const noOp=action(s,st,'unknown','unknown');
    assert.deepEqual(noOp,st,'Unknown action changed work');checked++;
    const bad=clone(pack.solve(s));
    if(s.id===1||s.id===2)bad.picked.push('not-a-job');
    if(s.id===3||s.id===5)bad.slots.whole=0;
    if(s.id===4)bad.rates.A=null;
    if(s.id===6)bad.heights[0]++;
    if(s.id===7)bad.middle=0;
    if(s.id===8){bad.filled=0;bad.evidence='matching';}
    if(s.id===9)bad.anchors=[1,5];
    if(s.id===10)bad.winner=s.winner==='A'?'B':'A';
    if(s.id===11)bad.claim='cause';
    if(s.id===12)bad.picked.push('archive');
    expect(!pack.check(s,bad).ok,'Incorrect work passed '+s.id);
  }
}
// A wrong source cannot be laundered by copying its numeric value into the gap.
{
  const s=pack.make(8,87);
  let st=action(s,s.initial,'source','wrong-unit');st=action(s,st,'restore','gap');
  expect(!pack.check(s,st).ok,'Wrong unit accepted');
  st.filled=s.values[s.missing];
  expect(!pack.check(s,st).ok,'Correct number with wrong provenance accepted');
}
// Duplicate/unknown records and NaN inputs cannot produce a pass.
{
  const s=pack.make(1,10),st=pack.solve(s);st.picked[1]=st.picked[0];
  expect(!pack.check(s,st).ok,'Duplicate selected job accepted');
  const q=pack.make(3,12),before=clone(q.initial);
  const out=pack.act(q,before,{action:'number',value:'bad'}).state;
  assert.deepEqual(out,before);checked++;
  expect(!pack.check(q,{slots:{part:q.count,whole:NaN}}).ok,'NaN denominator accepted');
}
// Different representations/order of the same correct work remain valid.
{
  const s=pack.make(2,17),st=pack.solve(s);st.picked.reverse();
  expect(pack.check(s,st).ok,'Alternative selection order rejected');
  const m=pack.make(6,3),x=pack.solve(m);x.moves=50;
  expect(pack.check(m,x).ok,'Valid longer balancing route rejected');
  assert.deepEqual(pack.make('3',1),pack.make(3,1));checked++;
}
// Cases vary in substantive input data, not only their seed.
for(const l of pack.levels){
  const cases=new Set(Array.from({length:12},(_,i)=>{const s=pack.make(l.id,i+1);delete s.seed;return JSON.stringify(s);}));
  expect(cases.size>1,'New case did not change data '+l.id);
}
// Pooled denominators vary and keep both groups' actual sizes in the calculation.
for(const level of [5,12]){
  const totals=new Set();
  for(let seed=1;seed<=100;seed++){
    const s=pack.make(level,seed),rows=level===5?s.groups:s.rows.filter(x=>x.period==='Today');
    totals.add(s.total);
    expect(rows[0].total!==rows[1].total,'Pooled groups retain unequal weights');
    expect(s.total===rows.reduce((n,x)=>n+x.total,0),'Denominator is the total eligible count');
    expect(s.count===rows.reduce((n,x)=>n+x.done,0),'Numerator is the total completed count');
    expect(rows.every(x=>Number.isInteger(x.done)&&x.done>=0&&x.done<=x.total),'Counts remain whole and feasible');
    expect(s.bank.includes(s.count)&&s.bank.includes(s.total),'Both answer counts are selectable');
    const wrong=pack.solve(s);
    if(s.total!==100){wrong.slots.whole=100;expect(!pack.check(s,wrong).ok,'Memorized100 denominator must fail');}
  }
  expect(totals.size>=4&&[...totals].some(n=>n!==100),'New cases vary the pooled denominator');
}
// All offered directional responses can be correct; a neutral scatter is not proof of independence.
for(const level of [9,11]){
  const found=new Set();
  for(let seed=1;seed<=100;seed++){
    const s=pack.make(level,seed);found.add(s.direction);
    expect(pack.check(s,pack.solve(s)).ok,'Every directional case remains solvable');
    if(s.direction==='flat'&&level===9)expect(new Set(s.values).size===1,'Level time series is unambiguously flat');
    if(s.direction==='flat'&&level===11){
      const xs=s.points.map(p=>p.x),ys=s.points.map(p=>p.y),xm=xs.reduce((a,b)=>a+b)/xs.length,ym=ys.reduce((a,b)=>a+b)/ys.length;
      const numerator=xs.reduce((n,x,i)=>n+(x-xm)*(ys[i]-ym),0),denominator=Math.sqrt(xs.reduce((n,x)=>n+(x-xm)**2,0)*ys.reduce((n,y)=>n+(y-ym)**2,0));
      expect(denominator>0&&Math.abs(numerator/denominator)<.1,'Neutral scatter has weak linear correlation, not a constant variable');
      expect(s.expectedClaim==='no-linear','Neutral claim is limited to a linear trend');
      expect(!pack.check(s,{direction:'flat',claim:'association'}).ok,'Strong directional association is not inferred from neutral scatter');
      expect(!pack.check(s,{direction:'flat',claim:'cause'}).ok,'Neutral scatter does not establish cause');
    }
  }
  assert.deepEqual([...found].sort(),['down','flat','up']);checked++;
}
// Frozen pre-review scenarios guard unfinished work stored before scenario revisions.
{
  const crypto=require('node:crypto');
  const legacySignatures=[
  [
    5,
    1,
    "a76ebea7a27e29f049387570384c42fa53c8c25641be814f2f444edc779741d2"
  ],
  [
    5,
    7,
    "82176432518a97060c4649aef1ba92aa7b5a140a0d05403553e03b3448397aa8"
  ],
  [
    5,
    19,
    "7562c86ee6343d02babdefa56cd04b9d3d27cf2eb38251674d1b0038e79fb378"
  ],
  [
    9,
    1,
    "1e7f10a9e2704182b47af4131ff045c8f2115dc2eb29e880a0fe9e2bd906d05c"
  ],
  [
    9,
    7,
    "2d2591bae06215c70855069a79a4732b0c309b16c66d86c43f9e3e86a8a27c8b"
  ],
  [
    9,
    19,
    "643b365217a1bef574dbe7f1bbbd67a90fb5bd5000c28c28c7d426b61d9e0b53"
  ],
  [
    11,
    1,
    "50a485809e7e482c6bf459440977a13cda24e3bc28802befd7a71616b7aabd01"
  ],
  [
    11,
    7,
    "f8d1e52c5191900157502e218ddd2e7f61176c592f4b2f57b6d2a5aba75a84df"
  ],
  [
    11,
    19,
    "7bd36005b96f5b677ae0b134879788a01ff57d12127beaa0c1c7a46f17be5f00"
  ],
  [
    12,
    1,
    "0521069b57f69249b09a3f65cbf47017392c3f0e623fcb90c2020a83999f1785"
  ],
  [
    12,
    7,
    "a31a660b546faa6b314bbfd8f7defda1948e92e84cdb34ec745a9807e4d1c48c"
  ],
  [
    12,
    19,
    "c55b0c5fa9dde6e7bab6c8ffe24dd7517459ffbb58caed500ac7c48c83a1e255"
  ]
];
  for(const [level,seed,expected] of legacySignatures){
    const s=pack.make(level,seed,1),data=clone(s);delete data.revision;delete data.expectedClaim;
    expect(crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex')===expected,'Legacy case changed '+level+' / '+seed);
    expect(pack.check(s,pack.solve(s)).ok,'Legacy case solution still passes');
  }
  for(const level of [1,2,3,4,6,7,8,10])for(let seed=1;seed<=20;seed++){
    const old=pack.make(level,seed,1),next=pack.make(level,seed,2);delete old.revision;delete next.revision;
    assert.deepEqual(next,old,'Unaffected level changed with revision');checked++;
  }
}
console.log('PASS: Analysis, 12 levels × 20 seeds; '+checked+' assertions and real action paths.');
