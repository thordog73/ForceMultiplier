import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
const files = (await readdir('tests')).filter(f => f.endsWith('.cjs')).sort();
for (const file of files) {
  const result = spawnSync(process.execPath, [`tests/${file}`], { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
const native = spawnSync(process.execPath, ['--test', 'native/progress-store.test.mjs', 'native/build-number.test.mjs'], { stdio: 'inherit' });
if (native.error) throw native.error;
process.exit(native.status || 0);
