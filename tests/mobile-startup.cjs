'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const www=path.join(__dirname,'../www');
const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return{promise,resolve};};
const settle=()=>new Promise(resolve=>setImmediate(resolve));
function setup(page,native){
  const ready=deferred(),cache=new Map(),events={},reads=[];
  const element=()=>({innerHTML:'',textContent:'',hidden:true,dataset:{},open:false,classList:{add(){},remove(){},toggle(){},contains(){return false}},querySelector(){return null},querySelectorAll(){return[]},addEventListener(){},focus(){},scrollIntoView(){},close(){this.open=false},showModal(){this.open=true}});
  const els=Object.fromEntries(['game','game-toast','game-dialog','dialog-body','app','main','toast','modal','modal-content','storage-notice','storage-message'].map(id=>[id,element()]));
  const context={console,Promise,Blob,URL,Date,Math,NodeFilter:{SHOW_TEXT:4},location:{hash:page==='app'?'#settings':'',protocol:'capacitor:'},navigator:{},CSS:{escape:x=>x},innerWidth:390,scrollY:0,
    document:{body:element(),documentElement:element(),activeElement:null,hidden:false,getElementById:id=>els[id]||null,querySelector:q=>q[0]==='#'?els[q.slice(1)]||null:null,querySelectorAll:()=>[],addEventListener:(name,fn)=>(events[name]||=[]).push(fn),createTreeWalker:()=>({nextNode:()=>false})},
    localStorage:{getItem:k=>{reads.push(k);return cache.get(k)||null},setItem:(k,v)=>cache.set(k,v),removeItem:k=>cache.delete(k)},
    addEventListener:(name,fn)=>(events[name]||=[]).push(fn),scrollTo(){},matchMedia:()=>({matches:true}),history:{replaceState(a,b,value){context.location.hash=value}},
    setTimeout(){return 1},clearTimeout(){},setInterval(){return 1},requestAnimationFrame:fn=>fn(),
    FMNative:{isNative:native,ready:ready.promise,saveProgress:async()=>{},removeProgress:async()=>{},flush:async()=>{},haptic:async()=>{}}};
  context.window=context;vm.createContext(context);
  const files=page==='game'?['device-ui','game-rules','game-worlds','pack-analysis','pack-documentation','pack-database','pack-integrity','game-backup','game']:['device-ui','core','scheduling','analysis','records','app'];
  for(const file of files)vm.runInContext(fs.readFileSync(path.join(www,file+'.js'),'utf8'),context,{filename:file+'.js'});
  return{context,cache,reads,els,ready,act(action){const target={dataset:{action},tagName:'BUTTON',disabled:false,closest(selector){return selector==='[data-action]'?target:null}};for(const fn of events.click||[])fn({target,defaultPrevented:false})}};
}
(async()=>{
  let checks=0;
  const mainKey='force-multiplier-worlds-22',oldKey='force-multiplier-universal-v22';
  let h=setup('game',true);
  assert.equal(h.reads.length,0,'native game must not read a stale web cache before hydration');checks++;
  h.cache.set(mainKey,JSON.stringify({version:1,world:'cats',activeSkill:'scheduling',sound:false,tracks:{'cats:scheduling':{best:{1:3},current:null}}}));
  h.ready.resolve({available:true,native:true});await settle();
  let saved=JSON.parse(h.cache.get(mainKey));assert.equal(saved.world,'cats');assert.equal(saved.tracks['cats:scheduling'].best[1],3);checks+=2;
  h.act('menu');assert.match(h.els['dialog-body'].innerHTML,/Haptics/);assert.match(h.els['dialog-body'].innerHTML,/Focus view/);checks+=2;
  h.act('haptics');assert.equal(JSON.parse(h.cache.get(mainKey)).haptics,false);checks++;
  h=setup('app',true);assert.equal(h.reads.length,0,'native workspace must also await hydration');checks++;
  h.cache.set(oldKey,JSON.stringify({schema:3,settings:{sound:false},cases:{},evidence:[],notes:'Preserve local review notes.'}));
  h.ready.resolve({available:true,native:true});await settle();
  assert.equal(h.context.FM_APP.getState().notes,'Preserve local review notes.');assert.match(h.els.app.innerHTML,/Ready offline/);assert.doesNotMatch(h.els.app.innerHTML,/Install app|home-screen instructions/);assert.match(h.els.app.innerHTML,/Restore workspace backup/);checks+=4;
  h=setup('game',false);assert.ok(h.reads.length>0,'web app starts without waiting for a native-only gate');h.act('menu');assert.doesNotMatch(h.els['dialog-body'].innerHTML,/Haptics/);checks+=2;
  h=setup('app',false);assert.match(h.els.app.innerHTML,/Install app/);assert.match(h.els.app.innerHTML,/restore-file/);checks+=2;
  console.log('PASS mobile startup: both native apps await hydration, retain restored data, expose native tools, and preserve browser fallbacks; '+checks+' checks.');
})().catch(error=>{console.error(error);process.exitCode=1;});
