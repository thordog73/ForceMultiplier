import { readFile, readdir, access } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
export async function checkWebBundle() {
  const config = JSON.parse(await readFile('capacitor.config.json', 'utf8'));
  assert.equal(config.webDir, 'www');
  assert.ok(!config.server?.url, 'The app must launch bundled web content, not a remote server.');
  const files = await readdir('www');
  assert.ok(!files.some(f => f.startsWith('__qa_')), 'Remove temporary __qa_ pages before packaging.');
  const pages = files.filter(f => f.endsWith('.html'));
  let references = 0;
  for (const name of pages) {
    const html = await readFile(path.join('www', name), 'utf8');
    for (const match of html.matchAll(/<(?:script|link|img)\b[^>]*\b(?:src|href)=["']([^"']+)["'][^>]*>/gi)) {
      const value = match[1];
      if (value.startsWith('data:') || value.startsWith('#')) continue;
      assert.ok(!/^(?:[a-z]+:)?\/\//i.test(value), `${name} must bundle asset ${value}`);
      const file = path.normalize(path.join('www', value.split(/[?#]/)[0]));
      assert.ok(file.startsWith('www' + path.sep), 'A bundled asset escapes www.');
      await access(file); references++;
    }
  }
  const index = await readFile('www/index.html', 'utf8');
  assert.ok(index.indexOf('native-bridge.js') >= 0 && index.indexOf('native-bridge.js') < index.indexOf('game.js'), 'Hydration bridge must load before the game.');
  const bridge = await readFile('www/native-bridge.js', 'utf8');
  assert.ok(bridge.includes('Permission is hereby granted') && bridge.includes('Drifty') && bridge.includes('Ionic'), 'Bundled dependencies must retain their MIT notices.');
  return { pages: pages.length, bundledAssetReferences: references };
}
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve('scripts/check-web-bundle.mjs')) console.log('Offline bundle:', await checkWebBundle());
