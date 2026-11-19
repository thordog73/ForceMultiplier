const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync('dist/index.html','utf8');
const m=html.match(/<script id="fm-22-8-24-canonical-navigation">([\s\S]*?)<\/script>/);
assert(m,'canonical navigation script missing');
function fresh(){
  const state={role:'scheduling',scenario:0,inScenario:false,view:{},doc18:null};
  const ctx={state,window:{},document:{addEventListener(){}},console,save(){},render(){}};
  ctx.window=ctx; vm.createContext(ctx); vm.runInContext(m[1],ctx); return ctx;
}
function expect(ctx,role,inScenario,check,msg){
  assert.equal(ctx.state.role,role,msg+' role');
  assert.equal(ctx.state.inScenario,inScenario,msg+' inScenario');
  if(check)check(ctx.state);
}
const users=[
 c=>{c.FM_go('analysis','home');expect(c,'analysis',false,s=>assert.deepEqual(s.view,{}),'U1 analysis home');c.FM_openAnalysisMetric(0);expect(c,'analysis',true,s=>assert.equal(s.scenario,0),'U1 metric');c.FM_exitToHub();expect(c,'analysis',false,s=>assert.deepEqual(s.view,{}),'U1 exit');},
 c=>{c.FM_go('documentation','home');c.FM_openDoc('mod');expect(c,'documentation',true,s=>assert.equal(s.view.doc21Mode,'mod'),'U2 doc mod');c.FM_exitToHub();expect(c,'documentation',false,s=>assert.deepEqual(s.view,{}),'U2 exit');},
 c=>{c.FM_go('analysis','acquisition');expect(c,'analysis',true,s=>assert(s.view.acquisitionOpen),'U3 acq');c.FM_openAnalysisStage(0);expect(c,'analysis',true,s=>assert(s.view.analysisFlow22820&&s.view.an20.step===0),'U3 improvement');c.FM_exitToHub();expect(c,'analysis',false,null,'U3 exit');},
 c=>{c.FM_openDoc('terms');expect(c,'documentation',true,s=>assert.equal(s.view.doc21Mode,'terms'),'U4 terms');c.FM_openDoc('mod');expect(c,'documentation',true,s=>assert.equal(s.view.doc21Mode,'mod'),'U4 mod');},
 c=>{c.FM_openAnalysisMetric(19);expect(c,'analysis',true,s=>assert.equal(s.scenario,19),'U5 metric19');c.FM_openDoc('mod');expect(c,'documentation',true,s=>assert.deepEqual(Object.keys(s.view),['doc21Mode']),'U5 switch');},
 c=>{c.FM_openDoc('mod');c.FM_go('analysis','home');expect(c,'analysis',false,s=>assert.deepEqual(s.view,{}),'U6 doc->analysis');},
 c=>{c.FM_openAnalysisStage(5);expect(c,'analysis',true,s=>assert.equal(s.view.an20.step,5),'U7 stage5');c.FM_openAnalysisStage(2);expect(c,'analysis',true,s=>assert.equal(s.view.an20.step,2),'U7 stage2');},
 c=>{c.FM_go('integrity','home');expect(c,'integrity',false,s=>assert.deepEqual(s.view,{}),'U8 integrity');c.FM_go('documentation','home');expect(c,'documentation',false,null,'U8 doc');},
 c=>{c.FM_go('systems','home');expect(c,'systems',false,null,'U9 systems');c.FM_go('analysis','acquisition');expect(c,'analysis',true,s=>assert(s.view.acquisitionOpen),'U9 analysis');},
 c=>{c.FM_go('scheduling','scenario',6);expect(c,'scheduling',true,s=>assert.equal(s.scenario,6),'U10 sched');c.FM_exitToHub();expect(c,'scheduling',false,null,'U10 exit');},
 c=>{c.FM_openAnalysisAcq();c.FM_exitToHub();c.FM_openAnalysisStage(0);expect(c,'analysis',true,s=>assert(!s.view.acquisitionOpen&&s.view.analysisFlow22820),'U11 stale acq cleared');},
 c=>{c.FM_openDoc('terms');c.FM_exitToHub();c.FM_openAnalysisMetric(3);expect(c,'analysis',true,s=>assert(!s.view.doc21Mode),'U12 stale doc cleared');},
 c=>{c.FM_openAnalysisStage(1);c.FM_exitToHub();c.FM_openDoc('terms');expect(c,'documentation',true,s=>assert(!s.view.analysisFlow22820),'U13 stale analysis cleared');},
 c=>{c.FM_openAnalysisMetric(-3);expect(c,'analysis',true,s=>assert.equal(s.scenario,0),'U14 clamp low');c.FM_openAnalysisMetric(99);expect(c,'analysis',true,s=>assert.equal(s.scenario,19),'U14 clamp high');},
 c=>{c.FM_openAnalysisStage(-2);expect(c,'analysis',true,s=>assert.equal(s.view.an20.step,0),'U15 stage low');c.FM_openAnalysisStage(88);expect(c,'analysis',true,s=>assert.equal(s.view.an20.step,5),'U15 stage high');},
 c=>{c.FM_openDoc('nonsense');expect(c,'documentation',true,s=>assert.equal(s.view.doc21Mode,'mod'),'U16 doc default');},
 c=>{c.FM_go('badrole','home');expect(c,'scheduling',false,null,'U17 role fallback');},
 c=>{c.FM_go('analysis','home');c.FM_openAnalysisStage(0);c.FM_go('analysis','home');c.FM_openAnalysisStage(3);expect(c,'analysis',true,s=>assert.equal(s.view.an20.step,3),'U18 repeated hub');},
 c=>{c.FM_go('documentation','home');c.FM_openDoc('mod');c.FM_go('documentation','home');c.FM_openDoc('terms');expect(c,'documentation',true,s=>assert.equal(s.view.doc21Mode,'terms'),'U19 repeated doc');},
 c=>{c.FM_openAnalysisAcq();c.FM_openAnalysisStage(0);c.FM_openDoc('mod');c.FM_go('analysis','home');expect(c,'analysis',false,s=>assert.deepEqual(s.view,{}),'U20 expert cross-function reset');}
];
let pass=0;
users.forEach((fn,i)=>{const c=fresh();try{fn(c);pass++;}catch(e){console.error(`USER ${i+1} FAIL`,e.stack);process.exitCode=1;}});
if(pass===20)console.log('PASS navigation 20-user simulation: 20/20 paths matched the expert watcher expectations.');
