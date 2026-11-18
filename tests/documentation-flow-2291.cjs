const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),M=require('../dist/fm2290-model.js');
const handlers={},root={innerHTML:'',addEventListener:(t,f)=>handlers[t]=f},store={};
const document={getElementById:id=>id==='fmApp'?root:{value:'',style:{}},documentElement:{style:{}}};
const window={FMModel:M,scrollTo(){},location:{reload(){}},visualViewport:{scale:1},AudioContext:null,webkitAudioContext:null};
const localStorage={getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=v};const c={window,document,localStorage,console,globalThis:null};c.globalThis=c;vm.createContext(c);vm.runInContext(fs.readFileSync('dist/fm2290.js','utf8'),c);const api=window.FM2290;
function click(dataset){handlers.click({target:{closest:()=>({dataset,closest:()=>null})}})}
api.setRoute('doc','inspection');assert(root.innerHTML.includes('Recurring inspection forecast'));click({action:'show-me'});click({action:'check'});assert.equal(api.getState().feedback.good,true,'Inspection Flow model/check failed');
let st=api.getState();assert.equal(Object.keys(st.doc.inspection).length,12);
api.setRoute('doc','phase');assert(root.innerHTML.includes('Projected Phase week'));click({action:'show-me'});click({action:'check'});assert.equal(api.getState().feedback.good,true,'Phase Flow model/check failed');
st=api.getState();assert.equal(Object.keys(st.doc.phase).length,12);
console.log('PASS 22.9.1 Documentation: learner-built Inspection and Phase Flow.');
