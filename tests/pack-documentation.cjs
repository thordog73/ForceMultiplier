'use strict';
const assert=require('node:assert/strict');
const pack=require('../dist/pack-documentation.js');
const cp=x=>JSON.parse(JSON.stringify(x));
let assertions=0;
const yes=(v,msg)=>{assert.ok(v,msg);assertions++;};
const equal=(a,b,msg)=>{assert.deepEqual(a,b,msg);assertions++;};
const ui={esc:x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),icon:n=>'<svg aria-hidden="true"><title>'+n+'</title></svg>',asset:()=>'<svg aria-hidden="true"></svg>',world:{id:'airline',assetSingular:'aircraft'}};
function action(s,p,event){
  const before=cp(p),out=pack.act(s,p,event);
  equal(p,before,'act must not mutate input');
  yes(out&&out.state&&typeof out.state==='object','act returns state');
  return out;
}
function play(s){
  let p=cp(s.initial);const run=e=>{const out=action(s,p,e);yes(!out.error,'valid action should succeed: '+JSON.stringify(e));p=out.state;};
  const solution=pack.solve(s);
  if(s.id===1)run({action:'attach',id:s.target});
  if(s.id===2)solution.tagged.forEach(id=>run({action:'tag',id}));
  if(s.id===3)run({action:'document',id:solution.document});
  if(s.id===4)run({action:'due',value:String(solution.due)});
  if(s.id===5)run({action:'day',value:String(solution.day)});
  if(s.id===6)solution.items.forEach(id=>run({action:'item',id}));
  if(s.id===7)['rule','match','plan','parts','work','verify'].forEach(id=>run({action:'step',id}));
  if(s.id===8){solution.evidence.forEach(id=>run({action:'evidence',id}));run({action:'stamp'});}
  if(s.id===9){
    run({action:'source',id:s.requirements[1].id});run({action:'place',index:'1'});
    run({action:'source',id:s.requirements[2].id});run({action:'place',index:'3'});
    run({action:'archive',index:'2'});
  }
  if(s.id===10)s.parts.forEach(slot=>run({action:'pack',slot,id:'a'}));
  return p;
}
for(const level of pack.levels){
  const variants=new Set();
  for(let seed=1;seed<=20;seed++){
    const s=pack.make(level.id,seed);
    equal(s,pack.make(level.id,seed),'seeded generation is stable');
    yes(!pack.check(s,s.initial).ok,'empty/untouched level cannot pass');
    yes(pack.check(s,pack.solve(s)).ok,'solved state passes');
    yes(pack.check(s,play(s)).ok,'real event path produces valid work');
    const wrong=action(s,s.initial,{action:'made-up',id:'fake'});yes(wrong.error,'invalid actions rejected');
    equal(wrong.state,s.initial,'invalid action does not change state');
    const m=pack.meter(s,s.initial);yes(Number.isFinite(m.done)&&m.total>0,'meter valid');
    for(const world of [{id:'airline',assetSingular:'aircraft'},{id:'bus',assetSingular:'bus'},{id:'cats',assetSingular:'care van'},{id:'squirrel',assetSingular:'rover'}]){
      const html=pack.render(s,s.initial,{...ui,world});
      yes(html.includes('Documentation work board')&&html.includes('data-skill-action='),'interactive board in every world');
      yes(!html.includes('undefined')&&!html.includes('NaN'),'no missing render values');
      yes(!html.includes('data-action='),'pack actions stay namespaced');
    }
    variants.add(JSON.stringify(s));
  }
  yes(variants.size>1,'new cases differ');
}
{
  const s=pack.make(2,4),answer=pack.solve(s);
  const extra=s.assets.find(a=>!answer.tagged.includes(a.id)).id;
  yes(!pack.check(s,{tagged:[...answer.tagged,extra]}).ok,'extra applicability selection fails');
  yes(!pack.check(s,{tagged:[answer.tagged[0],answer.tagged[0]]}).ok,'duplicates fail');
}
{
  const s=pack.make(3,8),draft=s.documents.find(d=>d.status==='Draft');
  yes(draft.revision>s.rev&&!pack.check(s,{document:draft.id}).ok,'highest draft is not current');
}
for(const id of [4,5]){
  const s=pack.make(id,10),key=id===4?'due':'day',solution=pack.solve(s);
  for(const bad of [null,'',0,NaN,String(solution[key])])yes(!pack.check(s,{[key]:bad}).ok,'missing/invalid meter or date is not accepted');
  yes(action(s,s.initial,{action:id===4?'due':'day',value:''}).error,'blank events are not zero');
}
{
  const s=pack.make(6,1),right=pack.solve(s),wrong=s.tiles.find(t=>!t.valid);
  yes(!pack.check(s,{items:[...right.items,wrong.id]}).ok,'wrong kit/revision adds a defect');
}
{
  const s=pack.make(7,2);
  const locked=action(s,s.initial,{action:'step',id:'work'});
  yes(locked.error&&!locked.state.done.length,'work cannot bypass prerequisites');
  const correct=pack.solve(s),reordered={done:correct.done,trail:['rule','match','plan','parts','work','verify']};
  yes(pack.check(s,reordered).ok,'parts and schedule may be prepared in either order');
  yes(!pack.check(s,{done:correct.done,trail:['work','rule','match','parts','plan','verify']}).ok,'trail verifies chronological prerequisites');
  yes(!pack.check(s,{done:correct.done,trail:[]}).ok,'done flags alone are not evidence');
}
{
  const s=pack.make(8,2),answer=pack.solve(s);
  yes(!pack.check(s,{...answer,closed:false}).ok,'unfiled closeout fails');
  yes(!pack.check(s,{evidence:['c','b'],closed:true}).ok,'other asset evidence fails');
  yes(action(s,s.initial,{action:'stamp'}).error,'empty job cannot be closed');
  let p=answer;p=action(s,p,{action:'evidence',id:'a'}).state;
  yes(p.closed===false,'changing evidence reopens closeout');
}
{
  const s=pack.make(9,7),answer=pack.solve(s);
  yes(pack.check(s,{...answer,rows:[null,...answer.rows.filter(Boolean).reverse()]}).ok,'register row order is not prescribed');
  yes(!pack.check(s,{...answer,rows:[s.requirements[0],s.requirements[0],s.requirements[2],null]}).ok,'duplicate requirement fails');
  yes(!pack.check(s,{...answer,rows:[...s.requirements,{id:'EXTRA',interval:2}]}).ok,'extra requirement fails');
  yes(action(s,s.initial,{action:'place',index:'1'}).error,'must choose source before copying');
  yes(action(s,s.initial,{action:'archive',index:'99'}).error,'invalid row rejected');
  let twoEdits=cp(s.initial);
  for(const event of [{action:'source',id:s.requirements[1].id},{action:'place',index:'1'},{action:'source',id:s.requirements[2].id},{action:'place',index:'2'}])twoEdits=action(s,twoEdits,event).state;
  yes(pack.check(s,twoEdits).ok,'replacing the obsolete row allows a valid two-edit solution');
  equal(pack.meter(s,twoEdits),{done:2,total:2,label:'edits recorded'},'progress completes after the valid two edits');
}
{
  const s=pack.make(10,5),answer=pack.solve(s);
  for(const part of s.parts){const p=cp(answer);delete p.choices[part];yes(!pack.check(s,p).ok,'every trace link required');}
  yes(action(s,s.initial,{action:'pack',slot:'kit',id:'missing'}).error,'unknown pack choice rejected');
  let p=cp(s.initial);
  for(const part of s.parts){
    const previousFocus='doc-pack-'+part+'-a';
    const beforeHtml=pack.render(s,p,ui);
    yes(beforeHtml.includes('data-focus="'+previousFocus+'"'),'choice focus is scoped to its tab');
    const result=action(s,p,{action:'pack',slot:part,id:'a'});p=result.state;
    equal(result.focus,'doc-pack-tab-'+p.tab,'auto-advance targets the new tab, not an answer');
    const html=pack.render(s,p,ui);
    yes(html.includes('data-focus="'+result.focus+'"'),'requested focus target exists');
    if(part!=='proof')yes(!html.includes('data-focus="'+previousFocus+'"'),'old answer cannot silently focus another answer');
  }
}
console.log('PASS: Documentation, 10 levels × 20 seeds; '+assertions+' assertions, event paths and four worlds.');
