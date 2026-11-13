'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const s=fs.readFileSync('dist/index.html','utf8');
for(const marker of [
  'FISHBONE_TESTS','Kendall / Mann–Kendall trend test','F test for homogeneity of variance',"Cochran's C test for homogeneity of variance",'Two-sample t test','Z test for a mean','Z test for proportions','One-way ANOVA F test','Mann–Whitney U test','Kruskal–Wallis H test','One-sample chi-square goodness-of-fit','Chi-square independence / homogeneity','Pearson correlation coefficient',"Spearman's rank correlation",
  'Create the test. Do not just recognize its name.','Question family','Measurement / data structure','Null hypothesis (H₀)','Alternative hypothesis (H₁)','Significance threshold','Build & run test','Interpret the result','Show Me the Right Answer · build this test','fishboneBuilt','requiredFishTest','goldChoiceSet','picked.correct'
]) assert(s.includes(marker),`missing Improvement Laboratory/Fishbone marker: ${marker}`);
const block=s.slice(s.indexOf('const FISHBONE_TESTS=['),s.indexOf('function fishTestById',s.indexOf('const FISHBONE_TESTS=[')));
const ids=[...block.matchAll(/\{id:'([^']+)'/g)].map(m=>m[1]);
assert.deepEqual(ids,['kendall','fvar','cochran','ttest','zmean','zprop','anova','mann','kruskal','chi1','chi2','pearson','spearman']);
assert(s.includes("return shuffle(q.choices.map(x=>({text:x,correct:x===q.rightText}))"),'Improvement Laboratory choices must be deterministically shuffled.');
assert(!s.includes("if(state.view.goldChoice!==q.right)"),'Improvement Laboratory must not depend on a fixed answer position.');
// Guard against the old 'longest answer is always correct' construction by checking several deliberately shorter rightText answers.
for(const right of ['There is an association worth testing.','A sustained worsening trend is present.','Verify against the baseline and look for the next constraint.']) assert(s.includes(`rightText:'${right}'`));
assert(s.includes('The correlation proves the proposed causal mechanism and no further evidence is needed.'),'Need a deliberately longer distractor so answer length is not a cue.');
console.log('PASS Improvement Laboratory: answer order/length cues hardened and 13-test Fishbone Test Builder requires learners to construct and interpret tests.');
