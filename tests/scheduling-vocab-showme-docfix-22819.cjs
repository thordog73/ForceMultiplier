const fs=require('fs'),assert=require('assert/strict');
const s=fs.readFileSync('dist/index.html','utf8');
for(const marker of [
 'fm-22-8-19-fixes-vocab','Scheduling Vocabulary','6-turn-4','Hangar queen','Phase Flow','Flying-hour program','Checkerboard',
 'function ss19ModelScheduling()','v.rem=Array.from({length:20},(_,j)=>5+(j*5))','Model answer loaded for Skill',
 'doc18Clear','GREEN cannot begin before the two RED workdays are complete','Model 24-aircraft modification flow loaded',
 'Break the asset into 40 work units','Top five drivers of non-mission-capable time','Now trend the five drivers for 12 months','1 · Difference','2 · Fishbone','3 · Correlation'
]) assert(s.includes(marker),'missing 22.8.19 marker: '+marker);
assert(s.includes("if(state.role==='scheduling'&&SCENARIOS.scheduling.length===7)return ss19ModelScheduling()"),'latest Show Me must route to simplified Scheduling solver');
assert(s.includes("d.red[a]=i+1;d.green[a]=i+3"),'Documentation Show Me must fill the 24-aircraft model flow');
console.log('PASS 22.8.19 Scheduling vocabulary, current Show Me routing, Documentation model flow, and Analysis investigation guards.');
