const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync('dist/index.html','utf8');
const m=html.match(/<script id="fm-22-8-26-documentation-direct">([\s\S]*?)<\/script>/);
assert(m,'22.8.26 Documentation direct script missing');
const listeners={};
const sandbox={
  console,
  window:{},
  state:{role:'documentation',doc26:null},
  save(){},render(){},
  document:{addEventListener(type,fn){listeners[type]=fn},getElementById(){return null},querySelector(){return null}},
  requestAnimationFrame(fn){fn()},
  fmShowFeedback2288(){},
};
vm.createContext(sandbox);vm.runInContext(m[1],sandbox);
const api=sandbox.window.FM_DOC26_API;assert(api,'doc26 API not exposed');
assert.strictEqual(api.fleet.length,24,'expected 24 aircraft');
function blank(){return {red:{},green:{}}}
function model(){const x=api.model();return {red:{...x.red},green:{...x.green}}}
function placeRed(s,a,d){s.red[a]=d;if(s.green[a]&&s.green[a]<d+2)s.green[a]=0}
function placeGreen(s,a,d){const err=api.canGreen(s.red[a],d);if(err)return err;s.green[a]=d;return ''}
const users=[];
// 1: exact manual model
users.push(()=>{const s=blank();api.fleet.forEach((a,i)=>{placeRed(s,a,i+1);assert.strictEqual(placeGreen(s,a,i+3),'')});assert.strictEqual(api.validate(s),'')});
// 2: green before red rejected, then corrected
users.push(()=>{const s=blank(),a=api.fleet[0];assert(api.canGreen(0,3));placeRed(s,a,1);assert(api.canGreen(1,2));assert.strictEqual(placeGreen(s,a,3),'');const M=model();Object.assign(s.red,M.red);Object.assign(s.green,M.green);assert.strictEqual(api.validate(s),'')});
// 3: clear and rebuild
users.push(()=>{let s=model();s={red:{},green:{}};assert(api.validate(s));s=model();assert.strictEqual(api.validate(s),'')});
// 4: late green gives separate cures then correct to shared cure
users.push(()=>{const s=blank(),a=api.fleet[0];placeRed(s,a,1);assert.strictEqual(placeGreen(s,a,8),'');assert.deepStrictEqual(Array.from(api.cell(1,8,3)),['cure','C']);assert.deepStrictEqual(Array.from(api.cell(1,8,10)),['cure','C']);placeGreen(s,a,3);assert.deepStrictEqual(Array.from(api.cell(1,3,5)),['cure','C']);const M=model();Object.assign(s.red,M.red);Object.assign(s.green,M.green);assert.strictEqual(api.validate(s),'')});
// 5: remove/change RED invalidates earlier GREEN
users.push(()=>{const s=blank(),a=api.fleet[2];placeRed(s,a,3);placeGreen(s,a,5);placeRed(s,a,8);assert.strictEqual(s.green[a],0);const M=model();Object.assign(s.red,M.red);Object.assign(s.green,M.green);assert.strictEqual(api.validate(s),'')});
// 6: last aircraft boundary
users.push(()=>{const s=blank(),a=api.fleet[23];placeRed(s,a,24);assert.strictEqual(placeGreen(s,a,26),'');assert.deepStrictEqual(Array.from(api.cell(24,26,28)),['cure','C']);const M=model();Object.assign(s.red,M.red);Object.assign(s.green,M.green);assert.strictEqual(api.validate(s),'')});
// 7: too-late GREEN rejected
users.push(()=>{const s=blank(),a=api.fleet[0];placeRed(s,a,1);assert(api.canGreen(1,27));const M=model();Object.assign(s.red,M.red);Object.assign(s.green,M.green);assert.strictEqual(api.validate(s),'')});
// 8: wrong aircraft catches exact row error
users.push(()=>{const s=model();s.red[api.fleet[10]]=15;const err=api.validate(s);assert(err.includes(api.fleet[10]));s.red[api.fleet[10]]=11;assert.strictEqual(api.validate(s),'')});
// 9: validate green offset
users.push(()=>{const s=model();s.green[api.fleet[5]]=20;const err=api.validate(s);assert(err.includes('GREEN'));s.green[api.fleet[5]]=8;assert.strictEqual(api.validate(s),'')});
// 10: repeated model/re-entry state independent
users.push(()=>{const a=model(),b=model();a.red[api.fleet[0]]=9;assert.notStrictEqual(a.red[api.fleet[0]],b.red[api.fleet[0]]);assert.strictEqual(api.validate(b),'')});
users.forEach((fn,i)=>{fn();console.log(`PASS simulated Documentation user ${i+1}`)});
console.log(`PASS Documentation planner stress: ${users.length}/10 simulated users`);
