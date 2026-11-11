const fs=require('node:fs'),assert=require('node:assert/strict');
const s=fs.readFileSync('dist/index.html','utf8');
const dataMatch=s.match(/const DATA=(\{.*?\});\nconst STORE=/s);assert(dataMatch,'DATA block missing');
const D=JSON.parse(dataMatch[1]);
const skills=Object.values(D.skills).flat().map(x=>x[0]);assert.equal(skills.length,100);assert.equal(new Set(skills).size,100);
assert.equal(D.packets.length,40);
const mins={};for(const p of D.packets)mins[p[0]]=(mins[p[0]]||0)+p[2];for(const [role,total] of Object.entries(mins))assert.equal(total,40,role+' must budget 40 minutes');
assert.equal(Object.keys(D.worlds).length,14);

// Training-integrity regression: recognition alone must never count as an independent case.
const bindStart=s.indexOf('function bindPhase');const bindEnd=s.indexOf('function bindCommon',bindStart);const bind=s.slice(bindStart,bindEnd);
assert.equal((bind.match(/creditSkills\(p\)/g)||[]).length,1,'independent credit must be awarded only once in the Integrate success path');
const recognizeEnd=bind.indexOf("document.getElementById('checkInt')");
assert(!bind.slice(0,recognizeEnd).includes('creditSkills(p)'),'Recognize must not award independent-case credit');
assert(bind.includes('handoverLog.push'),'integrated work-product evidence must be retained');

// Progression gates must require per-skill transfer, not merely a global world count.
assert(s.includes('tierTransferCount(3,2)===100'),'12-hour gate must require every skill across at least two worlds');
assert(s.includes('tierTransferCount(5,3)===100'),'24-hour gate must require every skill across at least three worlds');
assert(s.includes('state.success[s]=Math.min(5'),'success counts must be capped at five');
assert(s.includes('state.creditLog[s]=state.creditLog[s].slice(-5)'),'credit history must be bounded');

// Stored working-group comments are rendered safely and bounded for localStorage durability.
assert(s.includes('function esc(s)'),'HTML escape helper missing');
for(const id of ['learnerComment','smeNotice','smeNovice','smeTrust']){
  assert(s.includes(`id="${id}" maxlength="800"`),id+' should be bounded');
  assert(s.includes(`esc(f.${id}||'')`),id+' should be escaped before HTML rendering');
}
assert(s.includes('challengeRecords[state.challengeTier]'),'challenge evidence must be retained');
assert(s.includes('handoverLog:state.handoverLog'),'feedback export must include integrated handover evidence');


// Saved-state and answer-position hardening.
assert(s.includes("const state=rawState&&typeof rawState==='object'&&!Array.isArray(rawState)?rawState:{}"),'malformed saved-state guard missing');
assert(s.includes("state.world=DATA.worlds[state.world]?state.world:'airplanes'"),'invalid-world recovery missing');
assert(s.includes('function optionOrder(opts,name)'),'answer-order shuffling missing');
assert(s.includes('value=\"${i}\"'),'shuffled choices must retain their original answer IDs for scoring');

// Model the fixed designation gates under high-volume attempts.
const worlds=Object.keys(D.worlds);
const creditLog=Object.fromEntries(skills.map(k=>[k,[]]));
const success=Object.fromEntries(skills.map(k=>[k,0]));
function credit(skill,world,seed){if(success[skill]>=5)return;const key=world+':'+seed;if(creditLog[skill].some(x=>x.key===key))return;success[skill]=Math.min(5,success[skill]+1);creditLog[skill].push({key,world});creditLog[skill]=creditLog[skill].slice(-5)}
function eligible(n,w){return skills.every(k=>success[k]>=n&&new Set(creditLog[k].map(x=>x.world)).size>=w)}
// 100,000 duplicate attempts in one world cannot unlock either advanced gate.
for(let i=0;i<100000;i++)credit(skills[i%skills.length],worlds[0],i%5);
assert(!eligible(3,2));assert(!eligible(5,3));
// Add enough genuinely cross-world cases for Advanced.
for(const k of skills){credit(k,worlds[1],10);credit(k,worlds[0],11);credit(k,worlds[1],12)}
assert(eligible(3,2),'three cases across two worlds should satisfy the modeled Advanced transfer gate');
assert(!eligible(5,3));
// Complete five cases spanning three worlds for Expert.
for(const k of skills){credit(k,worlds[2],20);credit(k,worlds[2],21);credit(k,worlds[1],22);credit(k,worlds[0],23);credit(k,worlds[2],24)}
assert(eligible(5,3),'five cases across three worlds should satisfy the modeled Expert transfer gate');
assert(Object.values(success).every(n=>n===5));assert(Object.values(creditLog).every(a=>a.length<=5));
console.log('PASS guided stress: 100 skills, 40-minute function budgets, integration-only credit, per-skill cross-world gates, bounded evidence, 100,000 duplicate-attempt resistance.');
