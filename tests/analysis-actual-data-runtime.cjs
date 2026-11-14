'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('dist/index.html','utf8');
const a0=html.indexOf('// Actual-data Fishbone session.');
const a1=html.indexOf('const FISHBONE_TESTS=[',a0);
const f1=html.indexOf('function fishTestById',a1);
if(a0<0||a1<0||f1<0)throw new Error('blocks missing');
const src=`let state={view:{fishBuild:{alpha:.05}}}; function attrEsc(x){return String(x)}; function render(){}; ${html.slice(a0,a1)} ${html.slice(a1,f1)} globalThis.API={parseCsvLocal,runActualTest,FISHBONE_TESTS,setData:(rows,headers)=>{ACTUAL_FISH_DATA.rows=rows;ACTUAL_FISH_DATA.headers=headers;ACTUAL_FISH_DATA.map={};ACTUAL_FISH_DATA.params={};ACTUAL_FISH_DATA.result=null},map:(m,p={})=>{ACTUAL_FISH_DATA.map=m;ACTUAL_FISH_DATA.params=p},get:()=>ACTUAL_FISH_DATA.result};`;
const ctx={console};vm.createContext(ctx);vm.runInContext(src,ctx,{timeout:1000});const A=ctx.API;
function rowsFrom(obj){const keys=Object.keys(obj);const n=Math.max(...keys.map(k=>obj[k].length));return Array.from({length:n},(_,i)=>Object.fromEntries(keys.map(k=>[k,String(obj[k][i]??'')])))}
function run(id,obj,map,params={}){A.setData(rowsFrom(obj),Object.keys(obj));A.map(map,params);const t=A.FISHBONE_TESTS.find(x=>x.id===id);const r=A.runActualTest(t);assert(r&&r.statText,`${id} no result`);console.log(id,r.statText,r.p);return r}
run('kendall',{time:[1,2,3,4,5,6,7,8],y:[1,2,3,4,5,6,7,8]},{y:'y',order:'time'});
run('fvar',{g:['A','A','A','A','A','B','B','B','B','B'],y:[1,2,3,4,5,1,1.2,1.4,1.6,1.8]},{y:'y',group:'g'});
const c=run('cochran',{g:['A','A','A','B','B','B','C','C','C'],y:[1,2,3,1,5,9,2,2.2,2.4]},{y:'y',group:'g'});assert.equal(c.p,null);
run('ttest',{g:['A','A','A','A','B','B','B','B'],y:[1,2,2,3,8,9,10,11]},{y:'y',group:'g'});
run('zmean',{y:[51,52,49,50,53,54,52,51,50,52]},{y:'y'},{ref:'45',sigma:'4'});
run('zprop',{g:['A','A','A','A','A','B','B','B','B','B'],ok:['Yes','Yes','Yes','Yes','No','Yes','No','No','No','No']},{category:'ok',group:'g'},{success:'Yes'});
run('anova',{g:['A','A','A','B','B','B','C','C','C'],y:[1,2,3,4,5,6,10,11,12]},{y:'y',group:'g'});
run('mann',{g:['A','A','A','A','B','B','B','B'],y:[1,2,3,4,9,10,11,12]},{y:'y',group:'g'});
run('kruskal',{g:['A','A','A','B','B','B','C','C','C'],y:[1,2,3,4,5,6,10,11,12]},{y:'y',group:'g'});
run('chi1',{cat:['A','A','A','A','A','A','B','B','C','C']},{category:'cat'},{expected:'0.333,0.333,0.334'});
run('chi2',{loc:['A','A','A','A','B','B','B','B'],cat:['X','X','X','Y','X','Y','Y','Y']},{catA:'loc',catB:'cat'});
run('pearson',{x:[1,2,3,4,5,6,7,8],y:[2,4,6,8,10,12,14,16]},{x:'x',y:'y'});
run('spearman',{x:[1,2,3,4,5,6,7,8],y:[8,7,6,5,4,3,2,1]},{x:'x',y:'y'});
const p=A.parseCsvLocal('A,B\n1,2\n3,4\n');assert.deepEqual(Array.from(p.headers),['A','B']);assert.equal(p.rows.length,2);
console.log('PASS all 13 actual-data branches execute');
