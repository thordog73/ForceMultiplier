const fs=require('node:fs'),assert=require('node:assert/strict');
const s=fs.readFileSync('dist/index.html','utf8');
for(const marker of [
  "Array.from({length:24}",
  "S100_UNAVAILABLE_REASONS=['NMC','CANN','PHASE','DEPOT','MOD']",
  "24 aircraft · ${spec.first}-turn-${spec.turn} + spare",
  "24 aircraft · 12-turn-10 + spare",
  "NMC, CANN, PHASE, DEPOT and MOD",
  "s100StatusLabel(x)",
  "s100MarkUnavailable(items,r,5,local)",
  "s100MarkUnavailable(items,r,limits?5:3"
]) assert(s.includes(marker),`missing 22.8.4 Scheduling marker: ${marker}`);
assert(!s.includes('count=big?16:9'),'old 16/9 aircraft pool should no longer drive the 100-rep lineup');
assert(s.includes("if(x?.unavailable)return"),'unavailable aircraft tap must remain non-selecting');
assert(s.includes("if(v.selected.some(id=>map[id]?.unavailable)||v.turn.some(id=>map[id]?.unavailable))"),'lineup grader must reject unavailable aircraft');
console.log('PASS Scheduling 22.8.4: 24-aircraft early pool, real unavailable labels, progressive meaning/Phase reveal, and unavailable grading guards present.');
