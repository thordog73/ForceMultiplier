'use strict';
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const {spawnSync} = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const REPO_URL = 'https://github.com/thordog73/ForceMultiplier.git';
const VERSION = '22.3.3';
const COPY_PATHS = [
  'dist','ios','native-src','scripts','tests','docs','reviews',
  'package.json','package-lock.json','capacitor.config.json','codemagic.yaml',
  'UPLOAD.cmd','UPLOAD-TESTFLIGHT.cmd','README.md','SOURCE_README.md',
  '.gitignore','.gitattributes','FORCE_MULTIPLIER_PACKAGE.json','SHA256SUMS.json'
];

function fail(message) {
  console.error('\nERROR: ' + message);
  process.exit(1);
}
function exe(name) {
  const probe = spawnSync(process.platform === 'win32' ? 'where.exe' : 'which', [name], {encoding:'utf8'});
  return probe.status === 0;
}
function windowsQuote(arg) {
  const value = String(arg);
  if (!/[\s&()\[\]{}^=;!'+,`~|<>]/.test(value)) return value;
  return '"' + value.replace(/"/g, '""') + '"';
}
function run(command, args, options={}) {
  console.log('\n> ' + command + ' ' + args.map(a => /\s/.test(a) ? JSON.stringify(a) : a).join(' '));
  const cwd = options.cwd || ROOT;
  let result;
  if (process.platform === 'win32' && /\.(cmd|bat)$/i.test(command)) {
    const comspec = process.env.ComSpec || 'cmd.exe';
    const line = [command, ...args].map(windowsQuote).join(' ');
    result = spawnSync(comspec, ['/d','/s','/c', line], {cwd, stdio:'inherit', windowsHide:false, shell:false});
  } else {
    result = spawnSync(command, args, {cwd, stdio:'inherit', windowsHide:false, shell:false});
  }
  if (result.error) fail(`${command} could not start: ${result.error.message}`);
  if (result.status !== 0) fail(`${command} stopped with exit code ${result.status}. Read the message immediately above.`);
}
function runQuiet(command,args,options={}) {
  return spawnSync(command,args,{cwd:options.cwd||ROOT,encoding:'utf8',windowsHide:true,shell:false});
}
function copyEntry(src,dst) {
  if (!fs.existsSync(src)) return;
  fs.cpSync(src,dst,{recursive:true,force:true});
}
function stamp() {
  const d = new Date();
  const p = n => String(n).padStart(2,'0');
  return `${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

if (process.platform !== 'win32') fail('Run UPLOAD.cmd on your Windows computer.');
if (Number(process.versions.node.split('.')[0]) < 22) fail('Node.js 22 or newer is required. Install/update Node.js, close this window, then double-click UPLOAD.cmd again.');
if (!exe('git')) fail('Git for Windows was not found. Install Git for Windows, sign in to GitHub, then double-click UPLOAD.cmd again.');
if (!exe('npm.cmd')) fail('npm was not found with Node.js. Reinstall Node.js 22+, then retry.');

console.log('Force Multiplier ' + VERSION + ' — TestFlight uploader');
console.log('Repository: ' + REPO_URL);
console.log('Bundle ID: com.fredesser.forcemultiplier');
console.log('Apple app ID: 6833361372');
console.log('\nThis command will test the package locally, push a dedicated testflight branch, and let Codemagic build/sign/upload it to App Store Connect.');
console.log('It does NOT submit the app for public App Store review.');

const userName = runQuiet('git',['config','--global','user.name']);
const userEmail = runQuiet('git',['config','--global','user.email']);
if (userName.status !== 0 || !userName.stdout.trim() || userEmail.status !== 0 || !userEmail.stdout.trim()) {
  fail('Git name/email are not configured. In Command Prompt run: git config --global user.name "Fred Esser" and git config --global user.email "YOUR_GITHUB_EMAIL", then retry.');
}

const remote = runQuiet('git',['ls-remote','--heads',REPO_URL,'main']);
if (remote.status !== 0 || !remote.stdout.trim()) {
  fail('Git could not access thordog73/ForceMultiplier. Open Git Bash or GitHub Desktop once and make sure you are signed in to GitHub, then retry.');
}

run('npm.cmd',['ci']);
run('npm.cmd',['test']);
run('npm.cmd',['run','check']);
run('npm.cmd',['run','ios:prepare']);

const checkout = path.join(os.tmpdir(), `force-multiplier-testflight-${Date.now()}`);
run('git',['clone','--',REPO_URL,checkout],{cwd:os.tmpdir()});
const branch = `testflight/force-multiplier-${VERSION}-${stamp()}`;
run('git',['checkout','-b',branch],{cwd:checkout});

for (const rel of COPY_PATHS) {
  const dst = path.join(checkout,rel);
  fs.rmSync(dst,{recursive:true,force:true});
  copyEntry(path.join(ROOT,rel),dst);
}
run('git',['add','--all'],{cwd:checkout});
const diff = runQuiet('git',['diff','--cached','--quiet'],{cwd:checkout});
if (diff.status === 0) fail('No changed files were found after copying the release candidate. Nothing was pushed.');
if (diff.status !== 1) fail('Git could not inspect the staged changes.');
run('git',['commit','-m',`Force Multiplier ${VERSION} TestFlight candidate`],{cwd:checkout});
run('git',['push','--set-upstream','origin',branch],{cwd:checkout});

console.log('\n============================================================');
console.log('UPLOAD TO GITHUB COMPLETED');
console.log('Branch: ' + branch);
console.log('Codemagic should now start the signed TestFlight workflow automatically.');
console.log('Open https://codemagic.io/builds to watch the build.');
console.log('After Apple processes the upload, check App Store Connect > ForceMultiplierSimulator > TestFlight.');
console.log('No public App Store review submission was requested.');
console.log('============================================================\n');
console.log('Temporary checkout kept for inspection: ' + checkout);
