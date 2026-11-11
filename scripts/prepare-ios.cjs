const {spawnSync}=require('node:child_process');
function run(cmd,args){const r=spawnSync(cmd,args,{stdio:'inherit'});if(r.status!==0)process.exit(r.status||1);}
run(process.execPath,['node_modules/esbuild/bin/esbuild','native-src/native.js','--bundle','--format=iife','--outfile=dist/native.js','--minify']);
run(process.execPath,['node_modules/@capacitor/cli/bin/capacitor','sync','ios']);
