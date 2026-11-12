'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const s=fs.readFileSync('dist/index.html','utf8');
for(const marker of [
  'function practiceTools()','Show Me the Right Answer','↻ Re-simulate Question',
  'function showRightAnswer()','function resimulateQuestion()','function markAssistedCompletion',
  "state.role==='scheduling'","state.role==='documentation'","state.role==='integrity'","state.role==='systems'","state.role==='analysis'",
  'solveSchedulingLaunch','solveSchedulingBoard','Correct answer:','Assisted practice unlocked the path'
]) assert(s.includes(marker),`missing universal practice marker: ${marker}`);
assert(s.includes("document.getElementById('showRightAnswer')?.addEventListener('click',showRightAnswer)"));
assert(s.includes("document.getElementById('resimulateQuestion')?.addEventListener('click',resimulateQuestion)"));
assert(s.includes("document.getElementById('resetBtn')?.addEventListener('click',resimulateQuestion)"));
assert(s.includes("state.runs[key()]=Math.max(1,state.runs[key()]||0)"),'Assisted path should unlock without independent skill coverage.');
console.log('PASS universal practice controls: Show Me and unlimited re-simulation cover all five functions and assisted completion stays distinct.');
