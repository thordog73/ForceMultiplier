import test from 'node:test';
import assert from 'node:assert/strict';
import { createProgressStore, PROGRESS_KEYS } from './progress-store.mjs';
const [game, legacy, workspace] = PROGRESS_KEYS;
const prefix = 'fm.progress.';
function fixture({ device = {}, cache = {}, get, set, setCache } = {}) {
  const native = new Map(Object.entries(device));
  const local = new Map(Object.entries(cache));
  const writes = [], errors = [];
  const preferences = {
    async get({ key }) { return get ? get(key) : { value: native.get(key) ?? null }; },
    async set({ key, value }) { writes.push(['set', key, value]); if (set) await set(key, value); native.set(key, value); },
    async remove({ key }) { writes.push(['remove', key]); native.delete(key); }
  };
  const store = createProgressStore({ isNative: true, preferences, storage: {
    getItem: key => local.get(key) ?? null,
    setItem(key, value) { if (setCache) setCache(key, value); local.set(key, value); },
    removeItem(key) { local.delete(key); }
  }, onError: error => errors.push(error.message) });
  return { store, local, native, writes, errors };
}
test('native backup wins; existing browser data migrates only when no native backup exists', async () => {
  const f = fixture({ device: { [prefix + game]: '{"level":6}' }, cache: { [game]: '{"level":1}', [legacy]: '{"level":3}' } });
  assert.deepEqual(await f.store.ready, { available: true, native: true });
  assert.equal(f.local.get(game), '{"level":6}');
  assert.equal(f.native.get(prefix + legacy), '{"level":3}');
  assert.deepEqual(f.writes, [['set', prefix + legacy, '{"level":3}']]);
});
test('failed hydration never saves default state over an unread backup', async () => {
  const f = fixture({ get: async key => { if (key === prefix + workspace) throw new Error('read failed'); return { value: '{"level":6}' }; }, cache: { [game]: '{"level":1}' } });
  assert.deepEqual(await f.store.ready, { available: false, native: true });
  assert.equal(f.local.get(game), '{"level":1}');
  await assert.rejects(f.store.save(game, '{"level":0}'), /unavailable/);
  assert.deepEqual(f.writes, []);
  await assert.rejects(f.store.flush(), /read failed/);
});
test('malformed backup blocks every application/migration, retaining data for recovery', async () => {
  const f = fixture({ device: { [prefix + game]: '{"level":9}', [prefix + workspace]: 'invalid-json' }, cache: { [game]: '{"level":2}' } });
  assert.equal((await f.store.ready).available, false);
  assert.equal(f.local.get(game), '{"level":2}');
  assert.equal(f.native.get(prefix + workspace), 'invalid-json');
  assert.deepEqual(f.writes, []);
});
test('writes and resets remain in requested order even when writes are asynchronous', async () => {
  const f = fixture({ set: async () => new Promise(resolve => setTimeout(resolve, 3)) });
  await f.store.ready;
  await Promise.all([f.store.save(game, '{"level":4}'), f.store.save(game, '{"level":5}'), f.store.remove(game), f.store.save(game, '{"level":1}')]);
  await f.store.flush();
  assert.equal(f.native.get(prefix + game), '{"level":1}');
  assert.deepEqual(f.writes.map(row => row[0]), ['set', 'set', 'remove', 'set']);
});
test('a write failure is surfaced and later saves can recover', async () => {
  let count = 0;
  const f = fixture({ set: async () => { if (++count === 1) throw new Error('out of space'); } });
  await f.store.ready;
  await assert.rejects(f.store.save(game, '{"level":4}'), /out of space/);
  await assert.rejects(f.store.flush(), /out of space/);
  await f.store.save(game, '{"level":5}');
  await f.store.flush();
  assert.equal(f.native.get(prefix + game), '{"level":5}');
  assert.ok(f.errors.includes('out of space'));
});
test('unrelated keys and invalid JSON cannot enter the progress store', async () => {
  const f = fixture(); await f.store.ready;
  assert.throws(() => f.store.save('unrelated-account-data', '{}'), /progress key/);
  assert.throws(() => f.store.remove('unrelated-account-data'), /progress key/);
  for (const value of ['broken', '[]', 'null', '42', '"hello"']) await assert.rejects(f.store.save(game, value), /JSON object/);
  assert.deepEqual(f.writes, []);
});
test('browser mode does not need the native plugins or read local storage during bootstrap', async () => {
  const store = createProgressStore({ isNative: false, preferences: null, storage: null });
  assert.deepEqual(await store.ready, { available: true, native: false });
  await store.save(game, '{}'); await store.remove(game); await store.flush();
});
test('a failed browser cache write never enables overwriting device progress', async () => {
  const f = fixture({ device: { [prefix + game]: '{"level":7}' }, setCache: () => { throw new Error('cache full'); } });
  assert.equal((await f.store.ready).available, false);
  await assert.rejects(f.store.save(game, '{"level":0}'));
  assert.equal(f.native.get(prefix + game), '{"level":7}');
});
test('failed save then relaunch preserves the newer cache and repairs the stale native mirror', async () => {
  const f = fixture({ device: { [prefix + game]: '{"level":2}' }, set: async () => { throw new Error('write failed'); } });
  await f.store.ready;
  f.local.set(game, '{"level":9}');
  await assert.rejects(f.store.save(game, '{"level":9}'));
  assert.equal(f.native.get(prefix + game), '{"level":2}');
  const relaunched = fixture({ device: Object.fromEntries(f.native), cache: Object.fromEntries(f.local) });
  assert.equal((await relaunched.store.ready).available, true);
  assert.equal(relaunched.local.get(game), '{"level":9}');
  assert.equal(relaunched.native.get(prefix + game), '{"level":9}');
  assert.equal(relaunched.local.has('fm.progress.pending.' + game), false);
});
test('continued failure during relaunch preserves both copies and remains retryable', async () => {
  const f = fixture({ device: { [prefix + game]: '{"level":2}' }, cache: { [game]: '{"level":9}', ['fm.progress.pending.' + game]: '{"level":9}' }, set: async () => { throw new Error('still full'); } });
  assert.deepEqual(await f.store.ready, { available: true, native: true, pending: true });
  assert.equal(f.local.get(game), '{"level":9}');
  assert.equal(f.native.get(prefix + game), '{"level":2}');
  await assert.rejects(f.store.flush(), /still full/);
});
test('explicit reset deletes malformed/unreadable backups and pending metadata', async () => {
  const f = fixture({ device: { [prefix + game]: 'corrupt' }, cache: { ['fm.progress.pending.' + game]: '{"level":3}' } });
  assert.equal((await f.store.ready).available, false);
  for (const key of PROGRESS_KEYS) await f.store.remove(key);
  await f.store.flush();
  assert.equal(f.store.available(), true);
  assert.equal(f.native.size, 0);
  assert.equal(f.local.size, 0);
  assert.deepEqual(f.writes.map(x => x[0]), ['remove', 'remove', 'remove']);
});
