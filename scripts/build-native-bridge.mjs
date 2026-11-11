import { build } from 'esbuild';
import { readFile, writeFile } from 'node:fs/promises';
const packages = ['core', 'ios', 'preferences', 'haptics'];
const notices = await Promise.all(packages.map(async name => {
  const root = `node_modules/@capacitor/${name}`;
  const metadata = JSON.parse(await readFile(`${root}/package.json`, 'utf8'));
  return `@capacitor/${name} ${metadata.version}\n${await readFile(`${root}/LICENSE`, 'utf8')}`;
}));
const licenses = 'Third-party native runtime notices\n\n' + notices.join('\n\n');
await writeFile('native/THIRD-PARTY-NOTICES.txt', licenses);
await build({
  entryPoints: ['native/bridge.mjs'], outfile: 'www/native-bridge.js', bundle: true,
  platform: 'browser', format: 'iife', target: ['safari15'], minify: true,
  legalComments: 'eof', banner: { js: `/*!\n${licenses.replaceAll('*/', '* /')}\n*/` }
});
console.log('Bundled native bridge into www/native-bridge.js');
