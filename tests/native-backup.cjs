const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const source=fs.readFileSync('native-src/native.js','utf8').replace(/^import .*;$/gm,'');
const key='force-multiplier-worlds-22';
function harness(native=true){const store=new Map(),calls=[],listeners={};let approved=true;const window={};const context={window,Capacitor:{isNativePlatform:()=>native},Filesystem:{writeFile:async args=>(calls.push(['write',args]),{uri:'file:///safe/cache/backup.json'}),deleteFile:async args=>calls.push(['delete',args])},Directory:{Cache:'CACHE'},Encoding:{UTF8:'utf8'},Share:{share:async args=>calls.push(['share',args])},document:{getElementById:()=>({hidden:true}),addEventListener:(n,f)=>listeners[n]=f},localStorage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)},confirm:()=>approved,location:{href:''},console,alert(){},setTimeout};vm.runInNewContext(source,context);return{window,store,calls,context,setApproved:v=>approved=v};}
(async()=>{
 const h=harness();h.store.set(key,JSON.stringify({world:'airline',activeSkill:'scheduling',tracks:{}}));
 await h.window.FMBackup();assert.deepEqual(h.calls.map(c=>c[0]),['write','share','delete']);assert.equal(h.calls[0][1].directory,'CACHE');assert.equal(JSON.parse(h.calls[0][1].data).entries[key],h.store.get(key));
 const file=value=>({size:100,text:async()=>JSON.stringify(value)});
 await assert.rejects(()=>h.window.FMRestore(file({format:'wrong'})),/supported/);
 await assert.rejects(()=>h.window.FMRestore(file({format:'force-multiplier-all-progress',version:1,entries:{unrelated:'{}'}})),/supported/);
 await assert.rejects(()=>h.window.FMRestore(file({format:'force-multiplier-all-progress',version:1,entries:{[key]:'{}'}})),/missing/);
 await assert.rejects(()=>h.window.FMRestore({size:11*1024*1024}),/10 MB/);
 const valid={format:'force-multiplier-all-progress',version:1,entries:{[key]:JSON.stringify({world:'bus',activeSkill:'scheduling',tracks:{}})}};
 h.setApproved(false);await h.window.FMRestore(file(valid));assert.equal(JSON.parse(h.store.get(key)).world,'airline');h.window.FMDelete();assert(h.store.has(key));
 h.setApproved(true);await h.window.FMRestore(file(valid));assert.equal(JSON.parse(h.store.get(key)).world,'bus');assert.equal(h.context.location.href,'./index.html');
 h.store.set('unrelated','keep');h.window.FMDelete();assert(!h.store.has(key));assert.equal(h.store.get('unrelated'),'keep');
 console.log('PASS native backup contracts: share/cache cleanup, schema/size guards, cancellation, restore, scoped deletion. Native plugins mocked; not an iOS device test.');
})().catch(e=>{console.error(e);process.exit(1)});
