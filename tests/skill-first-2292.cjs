const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),M=require('../dist/fm2290-model.js');
const js=fs.readFileSync('dist/fm2290.js','utf8'),css=fs.readFileSync('dist/fm2290.css','utf8'),index=fs.readFileSync('dist/index.html','utf8');
for(const marker of ['CURRENT SKILL','More about this skill','data-action="prev"','data-action="next"','Spot Differences Over 12 Months','data-trend-toggle','data-diff-chart-toggle','R1','R2','G1','G2','Cure']) assert(js.includes(marker),marker+' missing');
assert(index.includes('maximum-scale=8'));assert(index.includes('user-scalable=yes'));
assert(css.includes('pinch-zoom'),'Documentation board must allow pinch zoom');
assert(css.includes('.doc-table .cellbtn{width:26px'),'checkerboard should use compact cells');
assert(css.includes('.topbar{position:relative'),'module selector should not be the sticky frame');
assert(css.includes('.sticky-skillbar{position:sticky'),'skill objective must be sticky');
const handlers={},root={innerHTML:'',addEventListener:(t,f)=>handlers[t]=f},store={};
const document={getElementById:id=>id==='fmApp'?root:{value:'',style:{}},documentElement:{style:{}}};
const window={FMModel:M,scrollTo(){},location:{reload(){}},visualViewport:{scale:1},AudioContext:null,webkitAudioContext:null};
const localStorage={getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=v};const c={window,document,localStorage,console,globalThis:null};c.globalThis=c;vm.createContext(c);vm.runInContext(js,c);const api=window.FM2290;
const click=dataset=>handlers.click({target:{closest:()=>({dataset,closest:()=>null})}});
// Top navigation is present on an actual skill and Next changes to the next skill.
api.setRoute('scheduling','skill1');assert(root.innerHTML.includes('CURRENT SKILL'));assert(root.innerHTML.includes('Next →'));click({action:'next'});assert.equal(api.getState().screen,'skill2');click({action:'prev'});assert.equal(api.getState().screen,'skill1');
// Trend screen allows multiple answers and Show Me identifies more than one.
api.setRoute('analysis','sim2');api.showMe();let st=api.getState();assert(st.analysis.trendSelected.length>1,'trend exercise must have multiple correct selections');api.checkCurrent();assert.equal(api.getState().feedback.good,true);
// Difference-over-time screen also allows multiple answers.
api.setRoute('analysis','sim3');api.showMe();st=api.getState();assert(st.analysis.diffChartSelected.length>1,'difference exercise must have multiple correct selections');api.checkCurrent();assert.equal(api.getState().feedback.good,true);
// Next from visual difference proceeds to the formal difference test.
click({action:'next'});assert.equal(api.getState().screen,'sim3test');assert(root.innerHTML.includes('Walk through the test'));
// Documentation is a sandbox: place a deliberately wrong stage, receive feedback, then model/check succeeds.
api.setRoute('doc','home');click({docMode:'r1'});click({docCell:'A001:5'});api.checkCurrent();assert.equal(api.getState().feedback.good,false,'wrong manual placement should be allowed, then caught by Check');
click({action:'doc-clear'});click({docMode:'r1'});click({docCell:'A001:1'});assert.equal(api.getState().doc.cells.A001[1],'r1');
api.showMe();api.checkCurrent();assert.equal(api.getState().feedback.good,true);assert.equal(api.getState().doc.cells.A024[28],'c');
console.log('PASS 22.9.2 skill-first UX: sticky skill header, top/bottom navigation, multi-trend/difference Analysis, manual mistake-friendly Documentation, pinch-ready compact board.');
