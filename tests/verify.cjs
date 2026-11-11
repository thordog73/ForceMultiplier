'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..');
const c={console};c.window=c;vm.createContext(c);
for(const f of ['core','scheduling','analysis','records'])vm.runInContext(fs.readFileSync(path.join(root,'www',f+'.js'),'utf8'),c,{filename:f+'.js'});
const ctx={id:'equipment',name:'Equipment services',asset:'unit',assets:'units',job:'booking',jobs:'bookings',org:'Northstar Services'};
let total=0;
const evidence=[];
for(const t of c.FM_TRACKS)for(const l of t.lessons){
  const s=l.build(712223,ctx),checks=s.check(s.model);assert.ok(checks.length);assert.ok(checks.every(x=>x.ok),t.id+'/'+l.id);assert.ok(s.check({}).some(x=>!x.ok),t.id+'/'+l.id+' blank');
  assert.equal(new Set(s.fields.map(f=>f.id)).size,s.fields.length,'unique field ids');
  evidence.push({id:'qa-'+total,version:'22.1',track:t.id,trackTitle:t.title,lessonId:l.id,lessonTitle:l.title,level:l.level,capstone:!!(s.capstone||l.level==='Capstone'||l.capstone),contextId:ctx.id,contextName:ctx.name,seed:712223,mode:'independent',assisted:false,calcProvided:false,hints:0,example:false,attemptNo:1,startedAt:'2026-11-10T20:00:00Z',submittedAt:'2026-11-10T20:05:00Z',elapsedMs:300000,answers:{...s.model},fields:s.fields.map(f=>({id:f.id,label:f.label,kind:f.kind,options:f.options})),brief:s.brief,facts:s.facts||[],tables:s.tables||[],checks,pass:true,review:null});total++;
}
const app=fs.readFileSync(path.join(root,'www/app.js'),'utf8');
c.CONTEXTS=[ctx];c.DIMS=['Discover','Evaluate','Decide','Act','Communicate','Defend'].map(x=>[x,'']);c.getTrack=id=>c.FM_TRACKS.find(t=>t.id===id);
vm.runInContext(app.slice(app.indexOf('function validateBackup(data)'),app.indexOf('async function restoreFile(file)')),c);
const backup={schema:3,settings:{sound:true,context:'equipment',mode:'independent',calcPractice:true},cases:{},evidence,previewEvidence:[],notes:'',last:{track:'scheduling',lesson:0},lab:{kind:'trend',x:'1,2,3',y:'2,3,4'}};
assert.equal(c.validateBackup(JSON.parse(JSON.stringify(backup))).evidence.length,43);
for(const mutate of [d=>d.last=null,d=>d.lab=null,d=>d.evidence[0].id='x" onclick="bad',d=>d.evidence[0].tables=[{headers:['a'],rows:[null]}],d=>d.evidence[0].review={name:'x',scores:{}},d=>d.settings.context='unknown',d=>d.cases={bad:{seed:1,answers:{}}}]){const d=JSON.parse(JSON.stringify(backup));mutate(d);assert.throws(()=>c.validateBackup(d));}
const r=c.FM.stats.compare([1,2,3,4,5],[2,3,4,5,6]);assert.ok(Math.abs(r.p-0.34659350708733416)<1e-9);assert.equal(r.difference,1);assert.equal(c.FM.stats.correlation([1,1,1],[2,3,4]).r,null);
for(const f of ['index.html','styles.css','core.js','app.js','scheduling.js','analysis.js','records.js','manifest.webmanifest','sw.js','icon.svg','icon-192.png','icon-512.png','icon-maskable.png'])assert.ok(fs.existsSync(path.join(root,'www',f)),f);
const manifest=JSON.parse(fs.readFileSync(path.join(root,'www/manifest.webmanifest'),'utf8'));assert.equal(manifest.display,'standalone');
console.log(JSON.stringify({tracks:c.FM_TRACKS.length,lessons:total,models:'passed',blankGuards:'passed',backupRoundtrip:'passed',malformedBackupGuards:'passed',statisticalReference:'passed',offlineAssets:'present'}));
