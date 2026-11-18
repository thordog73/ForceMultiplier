'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const d={window:{}};vm.createContext(d);vm.runInContext(fs.readFileSync('dist/references-data.js','utf8'),d);
const DB=d.window.FMReferenceData;
assert.equal(DB.commands.filter(c=>!['DAF','ANG'].includes(c.id)).length,9);
assert(DB.references.length>=14);
assert.equal(new Set(DB.references.map(x=>x.id)).size,DB.references.length);
for(const r of DB.references){
 assert(DB.commands.some(c=>c.id===r.command),'Unknown command '+r.command);
 assert(/^\d{4}-\d\d-\d\d$/.test(r.date),'No publication date '+r.id);
 assert(r.url.startsWith('https://static.e-publishing.af.mil/production/1/'),r.id+' unofficial link');
 assert(r.level&&r.note&&r.number);
}
const mockWindow={FMReferenceData:DB,Capacitor:{isNativePlatform:()=>false,Plugins:{}},open:()=>({}),alert:()=>{}};
const ctx={window:mockWindow,document:{},URL};vm.createContext(ctx);vm.runInContext(fs.readFileSync('dist/references.js','utf8'),ctx);
const lib=mockWindow.FMReferences;assert(lib,'Library module missing');
assert.equal(lib.getVisible().length,DB.references.length);
assert(lib.render().includes('Save PDF'));
assert(lib.render().includes('All commands'));
assert(lib.render().includes('Check current edition'));
assert(lib.isOfficialURL(DB.catalog));
assert(!lib.isOfficialURL('http://static.e-publishing.af.mil/'));assert(!lib.isOfficialURL('https://evil.com/'));
assert(lib.render().includes('ACC'));
assert(lib.render().includes('AFGSC'));
assert(lib.render().includes('USAFE-AFAFRICA'));
assert(lib.render().includes('not a live inventory'));
const main=fs.readFileSync('dist/fm2290.js','utf8');
assert(main.includes("['references','References']"));assert(main.includes("window.FMReferences.render"));assert(main.includes('window.FMReferences.attach'));
const idx=fs.readFileSync('dist/index.html','utf8');for(const a of ['references.css','references-data.js','references.js'])assert(idx.includes('./'+a));
const s=fs.readFileSync('dist/task-map.js','utf8');assert(s.includes('data-route="references:home"'));assert(s.includes('data-ref-catalog='));
const sw=fs.readFileSync('dist/sw.js','utf8');for(const a of ['references.css','references-data.js','references.js'])assert(sw.includes('./'+a));
(async()=>{
 const calls=[];
 const mockNative={FMReferenceData:DB,Capacitor:{isNativePlatform:()=>true,Plugins:{
   Filesystem:{downloadFile:async x=>(calls.push(['download',x]),{path:'file:///private/var/mobile/tmp/fm.pdf'}),deleteFile:async x=>(calls.push(['delete',x]),null)},
   Share:{share:async x=>(calls.push(['share',x]),{})}
 }},alert:()=>{}};
 const env={window:mockNative,document:{getElementById:()=>null},URL};vm.createContext(env);vm.runInContext(fs.readFileSync('dist/references.js','utf8'),env);
 await mockNative.FMReferences.savePDF('afgsc21');
 assert.deepEqual(calls.map(x=>x[0]),['download','share','delete']);
 assert.equal(calls[0][1].directory,'CACHE');assert(calls[0][1].url.includes('afgsc'));
 assert.deepEqual(Array.from(calls[1][1].files),['file:///private/var/mobile/tmp/fm.pdf']);
 await mockNative.FMReferences.openURL(DB.catalog,'Official catalog');assert.equal(calls[3][0],'share');assert.equal(calls[3][1].url,DB.catalog);
 console.log('PASS references 22.13.1: nine MAJCOMs, verified-host filters, native file save/share/cleanup and offline manifest.');
})().catch(e=>{console.error(e);process.exitCode=1;});
