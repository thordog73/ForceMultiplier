const {spawnSync}=require('node:child_process');
const tests=['academy-focus-controls-22160.cjs','academy-focus-22160.cjs','academy-interaction-22160.cjs','teaching-22140.cjs','task-map-2213.cjs','visuals-22150.cjs',
 'fundamentals-22120.cjs','block-academy-22100.cjs','block-academy-22110.cjs','model-2290.cjs','shell-2290.cjs','skill-first-2292.cjs','scheduling-capstone-2293.cjs','capstone-ten-users-2293.cjs','routes-2290.cjs','stress-2290.cjs','functional-2290.cjs','analysis-depth-2291.cjs','documentation-flow-2291.cjs','answer-length-2291.cjs',
 'pack-analysis.cjs','pack-documentation.cjs','pack-integrity.cjs','pack-database.cjs',
 'native-backup.cjs','uploader-contract.cjs','prepare-ios-contract.cjs'
];
for(const test of tests){const r=spawnSync(process.execPath,['tests/'+test],{stdio:'inherit'});if(r.status!==0)process.exit(r.status||1);}
