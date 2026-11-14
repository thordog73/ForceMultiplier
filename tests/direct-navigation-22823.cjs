const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync('dist/index.html','utf8');
function must(x,msg){if(!x)throw new Error(msg)}
must(html.includes("onclick=\"return window.FM_openDoc('mod')\""),'Modification Plan lacks direct route');
must(html.includes("onclick=\"return window.FM_openDoc('terms')\""),'Documentation Terms lacks direct route');
must(html.includes('window.FM_openAnalysisMetric'),'Analysis metric direct route missing');
must(html.includes('window.FM_openAnalysisStage'),'Analysis stage direct route missing');
must(html.includes('fm-22-8-23-direct-navigation'),'Final navigation layer missing');
const m=html.match(/<script id="fm-22-8-23-direct-navigation">([\s\S]*?)<\/script>/);must(m,'navigation script not found');
const ctx={state:{role:'documentation',scenario:0,view:{},doc18:null},window:{},console,document:{addEventListener(){}}};ctx.window=ctx;ctx.save=()=>{ctx.saved=(ctx.saved||0)+1};ctx.render=()=>{ctx.rendered=(ctx.rendered||0)+1};vm.createContext(ctx);vm.runInContext(m[1],ctx);
ctx.FM_openDoc('mod');must(ctx.state.role==='documentation'&&ctx.state.view.doc21Mode==='mod'&&ctx.state.inScenario===true,'Modification navigation state failed');
ctx.FM_openDoc('terms');must(ctx.state.view.doc21Mode==='terms'&&ctx.state.doc18.tab==='terms','Terms navigation state failed');
ctx.FM_openAnalysisMetric(3);must(ctx.state.role==='analysis'&&ctx.state.scenario===3&&ctx.state.inScenario===true,'Metric navigation state failed');
ctx.FM_openAnalysisStage(4);must(ctx.state.role==='analysis'&&ctx.state.scenario===19&&ctx.state.view.analysisFlow22820===true&&ctx.state.view.an20.step===4,'Analysis stage navigation state failed');
ctx.FM_openAnalysisAcq();must(ctx.state.view.acquisitionOpen===true,'Acquisition navigation state failed');
console.log('22.8.23 direct navigation: PASS');
