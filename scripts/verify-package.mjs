import { readFile, access } from 'node:fs/promises';
import assert from 'node:assert/strict';
import plist from 'plist';
import xcode from 'xcode';
import { checkWebBundle } from './check-web-bundle.mjs';
import { parseBuild } from '../native/build-number.mjs';
const pkg = JSON.parse(await readFile('package.json', 'utf8'));
const lock = JSON.parse(await readFile('package-lock.json', 'utf8'));
const config = JSON.parse(await readFile('capacitor.config.json', 'utf8'));
assert.equal(pkg.version, '22.0.0');
assert.equal(lock.version, pkg.version);
assert.equal(lock.packages[''].version, pkg.version);
for (const [name, version] of Object.entries({ ...pkg.dependencies, ...pkg.devDependencies })) {
  assert.match(version, /^\d+\.\d+\.\d+$/, `Pin ${name} to a known version.`);
  assert.equal(lock.packages[`node_modules/${name}`].version, version);
}
assert.equal(config.appName, 'Force Multiplier');
assert.equal(config.ios.webContentsDebuggingEnabled, false);
const web = await checkWebBundle();
const project = xcode.project('ios/App/App.xcodeproj/project.pbxproj');
project.parseSync();
assert.ok(!(await readFile('ios/App/App.xcodeproj/project.pbxproj', 'utf8')).includes('= undefined;'));
const target = project.getFirstTarget().uuid;
const sources = project.pbxSourcesBuildPhaseObj(target).files.map(f => f.comment);
const resources = project.pbxResourcesBuildPhaseObj(target).files.map(f => f.comment);
for (const name of ['FMFilesPlugin.swift', 'ForceMultiplierViewController.swift', 'SceneDelegate.swift']) {
  assert.equal(sources.filter(x => x === `${name} in Sources`).length, 1, `Compile ${name} once.`);
  await access(`ios/App/App/${name}`);
}
assert.equal(resources.filter(x => x === 'PrivacyInfo.xcprivacy in Resources').length, 1);
const builds = project.pbxXCBuildConfigurationSection();
let appConfigurations = 0;
for (const entry of Object.values(builds)) {
  const values = entry?.buildSettings;
  if (!values?.PRODUCT_BUNDLE_IDENTIFIER) continue;
  appConfigurations++;
  assert.equal(values.PRODUCT_BUNDLE_IDENTIFIER.replaceAll('"', ''), config.appId);
  assert.equal(String(values.MARKETING_VERSION).replaceAll('"', ''), pkg.version);
  assert.equal(String(values.IPHONEOS_DEPLOYMENT_TARGET), '15.4');
  assert.equal(values.TARGETED_DEVICE_FAMILY, '"1,2"');
  parseBuild(values.CURRENT_PROJECT_VERSION);
}
assert.equal(appConfigurations, 2);
const info = plist.parse(await readFile('ios/App/App/Info.plist', 'utf8'));
assert.equal(info.ITSAppUsesNonExemptEncryption, false);
assert.deepEqual(info.UIRequiredDeviceCapabilities, ['arm64']);
assert.equal(info.UIApplicationSceneManifest.UIApplicationSupportsMultipleScenes, false);
const privacy = plist.parse(await readFile('ios/App/App/PrivacyInfo.xcprivacy', 'utf8'));
assert.equal(privacy.NSPrivacyTracking, false);
assert.deepEqual(privacy.NSPrivacyCollectedDataTypes, []);
assert.deepEqual(privacy.NSPrivacyAccessedAPITypes, [{ NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryUserDefaults', NSPrivacyAccessedAPITypeReasons: ['CA92.1'] }]);
const scene = await readFile('ios/App/App/SceneDelegate.swift', 'utf8');
assert.ok(scene.includes('rootViewController = ForceMultiplierViewController()'));
const main = await readFile('ios/App/App/Base.lproj/Main.storyboard', 'utf8');
assert.ok(main.includes('customClass="ForceMultiplierViewController"'));
const iconContents = JSON.parse(await readFile('ios/App/App/Assets.xcassets/AppIcon.appiconset/Contents.json', 'utf8'));
const png = await readFile(`ios/App/App/Assets.xcassets/AppIcon.appiconset/${iconContents.images[0].filename}`);
assert.equal(png.readUInt32BE(16), 1024); assert.equal(png.readUInt32BE(20), 1024);
assert.equal(png[25], 2, 'App Store icon must be RGB without an alpha channel.');
await access('ios/App/App.xcworkspace/contents.xcworkspacedata');
const scheme = await readFile('ios/App/App.xcodeproj/xcshareddata/xcschemes/App.xcscheme', 'utf8');
assert.ok(scheme.includes(`BlueprintIdentifier="${target}"`));
const ci = await readFile('codemagic.yaml', 'utf8');
assert.ok(ci.includes('ios-simulator:') && ci.includes('ios-app-store:'));
assert.ok(!ci.match(/submit_to_app_store:\s*true/));
for (const name of ['check-apple-tools.sh', 'build-simulator.sh', 'build-archive.sh', 'simulator-smoke.py', 'set-build-number.mjs']) await access(`scripts/${name}`);
console.log(JSON.stringify({ version: pkg.version, bundle: config.appId, platform: 'iPhone + iPad / iOS 15.4+', ...web, nativeProject: 'parsed; sources, resources, scheme and manifests linked', appleCompile: 'NOT RUN by this verifier' }, null, 2));
