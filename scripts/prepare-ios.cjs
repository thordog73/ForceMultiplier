'use strict';
const {spawnSync}=require('node:child_process');
const esbuild=require('esbuild');

function run(cmd,args){
  const r=spawnSync(cmd,args,{stdio:'inherit'});
  if(r.error){console.error(r.error);process.exit(1);}
  if(r.status!==0)process.exit(r.status||1);
}

esbuild.buildSync({
  entryPoints:['native-src/native.js'],
  bundle:true,
  format:'iife',
  outfile:'dist/native.js',
  minify:true,
  platform:'browser',
  target:['safari15']
});

run(process.execPath,['node_modules/@capacitor/cli/bin/capacitor','sync','ios']);
