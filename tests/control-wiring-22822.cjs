const fs=require('fs'),assert=require('assert/strict');
const s=fs.readFileSync('dist/index.html','utf8');
const required=[
 ['Scheduling skill navigation','data-ss18-open','dataset.ss18Open'],
 ['Scheduling vocabulary','data-sched19-vocab','sched19-vocab'],
 ['Analysis metrics','data-an20-metric','dataset.an20Metric'],
 ['Analysis simulator stages','data-an20-stage','dataset.an20Stage'],
 ['Analysis Fishbone walkthrough','data-an21-fish-next','an21-fish-next'],
 ['Documentation hub','data-doc21-open','dataset.doc21Open'],
 ['Documentation planner cells','data-doc18-cell','dataset.doc18Cell'],
 ['Documentation terms','data-doc18-term','dataset.doc18Term'],
 ['Data Integrity field lab','data-di21-term','dataset.di21Term'],
 ['DBM interactive choices','data-choice','dataset.choice'],
 ['Universal Next Exercise','nextExercise2288','nextExercise2288'],
 ['Universal Show Me','showRightAnswer','showRightAnswer'],
 ['Legacy checkerboard cell','data-s100-cell','dataset.s100Cell'],
 ['Legacy checkerboard check','s100CheckPlot','legacyPlot.addEventListener']
];
for(const [label,rendered,wired] of required){assert(s.includes(rendered),label+' is not rendered');assert(s.includes(wired),label+' has no reachable wiring marker');}
for(const marker of ['Open Modification Plan','Open Documentation Terms','Create the Pareto chart','Look for Differences','Look for Correlation','Open Record Field Lab'])assert(s.includes(marker),'missing current path marker '+marker);
console.log('PASS 22.8.22 current control/navigation wiring audit, including dormant legacy checkerboard hardening.');
