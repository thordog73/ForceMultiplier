const assert=require('assert/strict');
const fleet=['A/C 001','A/C 021','A/C 014','A/C 033',...Array.from({length:22},(_,i)=>i+2).filter(n=>![14,21].includes(n)).map(n=>`A/C ${String(n).padStart(3,'0')}`)];
assert.equal(fleet.length,24);
function stage(r,g,d){if(r){if(d===r)return 'R1';if(d===r+1)return 'R2'}if(g){if(d===g)return 'G1';if(d===g+1)return 'G2'}if(r&&g===r+2&&d===g+2)return 'C';if(r&&g!==r+2&&d===r+2)return 'C';if(g&&g!==r+2&&d===g+2)return 'C';return ''}
for(let i=0;i<24;i++){
 const r=i+1,g=i+3;
 assert(g+2<=28,`${fleet[i]} model cure exceeds month`);
 assert.deepEqual([stage(r,g,r),stage(r,g,r+1),stage(r,g,g),stage(r,g,g+1),stage(r,g,g+2)],['R1','R2','G1','G2','C']);
 const cures=Array.from({length:28},(_,j)=>stage(r,g,j+1)).filter(x=>x==='C').length;
 assert.equal(cures,1,`${fleet[i]} should share one final cure`);
}
const modelPhase=Array.from({length:20},(_,j)=>5+j*5);
assert.equal(new Set(modelPhase).size,20,'model Phase Flow should be fully staggered');
assert.equal(modelPhase[0],5);assert.equal(modelPhase[19],100);
const nmc=['A3','A8','A14'];
const modelLineup=['A1','A2','A4','A5','A6','A7','A9','A10','A11','A12','A13','A15'];
assert.equal(modelLineup.length,12);assert.equal(modelLineup.some(x=>nmc.includes(x)),false);
console.log('PASS 22.8.19 model logic: 24-aircraft shared-cure flow, staggered Phase model, and NMC-safe 12-turn-10 lineup.');
