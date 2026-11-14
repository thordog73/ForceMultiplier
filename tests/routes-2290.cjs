const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const M=require('../dist/fm2290-model.js');
const handlers={};const root={innerHTML:'',addEventListener:(t,fn)=>handlers[t]=fn};
const store={};const document={getElementById:id=>id==='fmApp'?root:{value:'',style:{}},documentElement:{style:{}}};
const window={FMModel:M,scrollTo(){},location:{},AudioContext:null,webkitAudioContext:null};
const localStorage={getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=v};
const context={window,document,localStorage,console,globalThis:null};context.globalThis=context;vm.createContext(context);vm.runInContext(fs.readFileSync('dist/fm2290.js','utf8'),context);
assert(window.FM2290);const click=dataset=>handlers.click({target:{closest:()=>({dataset,closest:()=>null})}});
function expect(module,screen,needle){const s=window.FM2290.getState();assert.equal(s.module,module);assert.equal(s.screen,screen);if(needle)assert(root.innerHTML.includes(needle),`${module}:${screen} missing ${needle}`)}
for(let i=1;i<=7;i++){click({schedSkill:String(i)});expect('scheduling','skill'+i,M.SCHED_SKILLS[i-1].title)}
click({route:'scheduling:vocab'});expect('scheduling','vocab','Scheduling Vocabulary');
for(const m of M.METRICS){click({metric:m.id});expect('analysis','metric',m.name)}
for(const s of ['acquisition','sim1','sim2','sim3','sim4','sim5','sim6','months']){click({analysis:s});expect('analysis',s)}
click({route:'doc:home'});expect('doc','home','Modification Plan');click({docSupport:'inspection'});expect('doc','inspection','Inspection Flow');click({route:'doc:home'});click({docSupport:'phase'});expect('doc','phase','Build Phase Flow');
for(let i=1;i<=10;i++){click({di:String(i)});expect('integrity','skill'+i)}
for(let i=1;i<=7;i++){click({dbm:String(i)});expect('dbm','skill'+i)}
for(const m of ['scheduling','analysis','doc','integrity','dbm']){click({route:m+':home'});expect(m,'home')}
console.log('PASS 22.9.0 routes: every learner-facing navigation family reaches the declared screen.');
