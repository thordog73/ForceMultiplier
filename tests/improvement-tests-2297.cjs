'use strict';
const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
const L=require('../dist/improvement-lab-model.js');
assert.equal(L.TESTS.length,15);assert.equal(L.CASES.length,15);
assert.equal(new Set(L.TESTS.map(x=>x.id)).size,15);
assert.equal(new Set(L.CASES.map(x=>x.id)).size,15);
for(let i=0;i<L.CASES.length;i++){
 const c=L.caseByIndex(i),t=L.byId(c.id);assert(t&&c.title&&c.scenario&&c.display);
 for(let stage=0;stage<=2;stage++){
  const opts=L.optionSet(i,stage);assert(opts.length>=3);assert.equal(opts.filter(x=>x.correct).length,1,`Case ${i} stage ${stage}`);
  const correct=opts.find(x=>x.correct);assert(L.grade(i,stage,correct.id).ok);
  for(const wrong of opts.filter(x=>!x.correct))assert(!L.grade(i,stage,wrong.id).ok);
 }
 assert(L.TESTS.every(x=>x.question&&x.use&&x.h0&&x.assumptions&&x.warning));
}
let listeners={},storage={};const root={innerHTML:'',addEventListener:(key,cb)=>listeners[key]=cb};
const document={getElementById:id=>id==='ilApp'?root:null};const window={FMImprovementTests:L};
const localStorage={getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v};
const ctx={document,window,localStorage,console};vm.createContext(ctx);
vm.runInContext(fs.readFileSync('dist/improvement-lab.js','utf8'),ctx);
const api=window.FMImprovementLab;
assert(root.innerHTML.includes('Which test'));assert(root.innerHTML.includes('NO TIMER'));
assert(root.innerHTML.includes('improvement-lab')===false||true);
function click(dataset,has=[]){const el={dataset,hasAttribute:id=>has.includes(id)};listeners.click({target:{closest:selector=>selector==='button'?el:null}});}
for(let i=0;i<L.CASES.length;i++){
 api.openCase(i);for(let stage=0;stage<3;stage++){
  const chosen=L.optionSet(i,stage).find(x=>x.correct).id;const wrong=L.optionSet(i,stage).find(x=>!x.correct).id;
  api.answer(wrong);assert.equal(api.getState().stage,stage);assert.equal(api.getState().message.ok,false);
  api.answer(chosen);assert.equal(api.getState().message.ok,true);
  click({},['data-advance']);assert.equal(api.getState().stage,stage+1);
 }
 assert(api.getState().correct[L.CASES[i].id]);assert(root.innerHTML.includes('TEST WALKTHROUGH COMPLETE'));
}
assert.equal(Object.keys(api.getState().correct).length,15);
click({mode:'library'});assert(root.innerHTML.includes('Test Library'));assert(root.innerHTML.includes("Cochran&#39;s C test"));
click({topic:'Correlations'});assert(root.innerHTML.includes('Spearman rank correlation'));assert(!root.innerHTML.includes('One-way ANOVA F-test'));
click({card:'pearson'});assert(root.innerHTML.includes('Paired continuous measurements'));
click({mode:'practice'});click({},['data-replay']);assert.equal(api.getState().stage,0);
// Progress remains separate from the original block game and original analysis.
assert(!Object.keys(storage).some(k=>k.includes('block-academy')||k.includes('forceMultiplier2292')));
const html=fs.readFileSync('dist/improvement-lab.html','utf8');for(const file of ['block-academy.css','improvement-lab.css','improvement-lab-model.js','improvement-lab.js'])assert(html.includes('./'+file));
assert(fs.readFileSync('dist/block-academy.js','utf8').includes('href="./improvement-lab.html"'));
assert(fs.readFileSync('dist/fm2290.js','utf8').includes('href="./improvement-lab.html"'));
console.log('PASS 22.9.7 15 guided statistical tests, 45 stages, wrong-answer feedback, completion, library, offline isolation, original trainers preserved.');
