const fs=require('node:fs'),assert=require('node:assert/strict');
const s=fs.readFileSync('dist/index.html','utf8');
for(const marker of ['Force Multiplier 22.8.7 · click-to-reveal metric arithmetic','Click to reveal answer','Substitute the actual numbers','Worked statistical example','Walk through example','Calculated by the app','STAT_WORKED_2287','calcWorkedStat2287','Tap any tool to see a worked example']) assert(s.includes(marker),`missing 22.8.7 marker: ${marker}`);
for(const id of ['kendall','fvar','cochran','ttest','zmean','zprop','anova','mann','kruskal','chi1','chi2','pearson','spearman']) assert(new RegExp('\\b'+id+':\\{csv:').test(s),`missing worked dataset for ${id}`);
const patch=s.slice(s.lastIndexOf('Force Multiplier 22.8.7 · click-to-reveal metric arithmetic'));
assert(patch.includes('renderAnalysis=function()'),'22.8.7 runtime render override missing');
assert(!patch.includes('data-analysis-value'),'22.8.7 runtime render should not create manual result inputs');
assert(!patch.includes('analysisCalculator(companies)'),'22.8.7 runtime render should not mount the keypad calculator');
console.log('PASS Analysis 22.8.7: click-to-reveal metric arithmetic and all 13 calculated worked statistical examples present.');
