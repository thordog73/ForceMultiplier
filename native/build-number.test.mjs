import test from 'node:test';
import assert from 'node:assert/strict';
import { parseBuild, compareBuild, incrementBuild, chooseBuildNumber } from './build-number.mjs';
test('build components compare numerically and accept short Apple forms', () => {
  assert.deepEqual(parseBuild('12'), [12, 0, 0]);
  assert.equal(compareBuild('1.9', '1.10'), -1);
  assert.equal(compareBuild('22', '22.0.0'), 0);
  for (const invalid of ['1.0-beta', '1.2.3.4', '20000', '', '1.200']) assert.throws(() => parseBuild(invalid));
});
test('default build number is UTC-based; same-minute rerun exceeds Apple maximum', () => {
  const now = new Date('2026-11-11T06:15:00Z');
  const initial = chooseBuildNumber({ now });
  assert.equal(initial, '2507.6.15');
  assert.equal(chooseBuildNumber({ now, previous: ['4', initial] }), '2507.6.16');
  assert.equal(chooseBuildNumber({ now, previous: ['3000.99.99', '9'] }), '3001.0.0');
});
test('explicit build cannot reuse a known uploaded number', () => {
  assert.equal(chooseBuildNumber({ explicit: '4000.2.3', previous: ['4000.2.2'] }), '4000.2.3');
  assert.throws(() => chooseBuildNumber({ explicit: '4000.2.2', previous: ['4000.2.2'] }), /greater/);
  assert.throws(() => incrementBuild('9999.99.99'), /exceeding/);
});
