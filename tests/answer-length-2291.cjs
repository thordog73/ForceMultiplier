const assert=require('node:assert/strict'),M=require('../dist/fm2290-model.js');
let correctLongest=0;for(const q of M.ANSWER_LENGTH_BANK){const lens=q.choices.map(x=>x.length),max=Math.max(...lens);if(lens[q.correct]===max)correctLongest++;}
const share=correctLongest/M.ANSWER_LENGTH_BANK.length;
assert(share<=.25,`Correct answer is longest too often: ${(share*100).toFixed(1)}%`);
assert(M.ANSWER_LENGTH_BANK.some(q=>q.choices[q.correct].length===Math.min(...q.choices.map(x=>x.length))),'Need examples where the correct answer is shortest');
assert(M.ANSWER_LENGTH_BANK.some(q=>q.choices[q.correct].length===Math.max(...q.choices.map(x=>x.length))),'Need some examples where the correct answer is longest so length itself is not an inverse cue');
console.log(`PASS 22.9.1 answer-length audit: correct is longest in ${correctLongest}/${M.ANSWER_LENGTH_BANK.length} audited questions.`);
