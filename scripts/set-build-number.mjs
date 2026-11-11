import { spawnSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { chooseBuildNumber } from '../native/build-number.mjs';
const previous = [];
const appId = process.argv.includes('--offline') ? undefined : process.env.APP_STORE_APPLE_ID;
if (appId) {
  if (!/^\d+$/.test(appId)) throw new Error('APP_STORE_APPLE_ID must be the numeric ID from App Store Connect.');
  for (const command of ['get-latest-testflight-build-number', 'get-latest-app-store-build-number']) {
    const result = spawnSync('app-store-connect', [command, appId, '--platform', 'IOS', '--all-versions', '--no-color'], { encoding: 'utf8' });
    if (result.error || result.status !== 0) {
      // An authentication/network error must never be treated as a new app.
      process.stderr.write(result.stderr || result.error?.message || 'App Store Connect lookup failed.');
      throw new Error('Could not verify the current Apple build number. Fix the account/app ID and rerun.');
    }
    const value = result.stdout.trim();
    // The CLI can return empty output for an app with no uploaded build.
    if (value && value !== 'null' && value !== 'None') previous.push(value);
  }
}
const number = chooseBuildNumber({ previous, explicit: process.env.IOS_BUILD_NUMBER, ciNumber: process.env.CM_BUILD_NUMBER });
if (process.env.CM_ENV) appendFileSync(process.env.CM_ENV, `IOS_BUILD_NUMBER=${number}\n`);
console.log(number);
