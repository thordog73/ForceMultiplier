const fs=require('node:fs'),assert=require('node:assert/strict');
const s=fs.readFileSync('dist/index.html','utf8');
for(const marker of ['fm-22-8-24-stable-documentation-page','v22.8.24','href="#doc24-modification-plan"','href="#doc24-documentation-terms"','id="doc24-modification-plan"','id="doc24-documentation-terms"','${board}','${terms}']) assert(s.includes(marker),`missing stable Documentation marker: ${marker}`);
assert(s.includes("ws.innerHTML=docPage22824()"),'Documentation must render both work areas on one page');
assert(s.includes("state.inScenario=false"),'Documentation stable page must not depend on legacy scenario navigation');
console.log('PASS 22.8.24 stable single-page Documentation navigation');
