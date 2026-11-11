import { readFile, writeFile, copyFile, mkdir, cp, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import xcode from 'xcode';
import plist from 'plist';
import { chooseBuildNumber, parseBuild } from '../native/build-number.mjs';

const config = JSON.parse(await readFile('capacitor.config.json', 'utf8'));
const pkg = JSON.parse(await readFile('package.json', 'utf8'));
const version = process.env.APP_VERSION || pkg.version;
const bundle = process.env.APP_BUNDLE_ID || config.appId;
if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error('APP_VERSION must be three numeric components.');
if (!/^[A-Za-z][A-Za-z0-9-]*(?:\.[A-Za-z0-9-]+){2,}$/.test(bundle)) throw new Error('APP_BUNDLE_ID must be a reverse-DNS bundle identifier.');
const build = process.env.IOS_BUILD_NUMBER || chooseBuildNumber({ ciNumber: process.env.CM_BUILD_NUMBER });
parseBuild(build);
if (process.env.APPLE_TEAM_ID && !/^[A-Z0-9]{10}$/.test(process.env.APPLE_TEAM_ID)) throw new Error('APPLE_TEAM_ID must be a ten-character Apple team identifier.');

config.appId = bundle;
await writeFile('capacitor.config.json', JSON.stringify(config, null, 2) + '\n');
if (existsSync('ios/App/App/capacitor.config.json')) {
  const generated = JSON.parse(await readFile('ios/App/App/capacitor.config.json', 'utf8'));
  generated.appId = bundle;
  await writeFile('ios/App/App/capacitor.config.json', JSON.stringify(generated, null, 2) + '\n');
}

const projectFile = 'ios/App/App.xcodeproj/project.pbxproj';
const project = xcode.project(projectFile);
project.parseSync();
const firstTarget = project.getFirstTarget();
const target = firstTarget.uuid;
const group = project.findPBXGroupKey({ path: 'App' });
if (!target || !group) throw new Error('The App target/group could not be found.');
for (const name of ['ForceMultiplierViewController.swift', 'FMFilesPlugin.swift']) {
  await copyFile(`native/ios/${name}`, `ios/App/App/${name}`);
  if (!project.hasFile(name)) project.addSourceFile(name, { target }, group);
}
await copyFile('native/ios/PrivacyInfo.xcprivacy', 'ios/App/App/PrivacyInfo.xcprivacy');
if (!project.hasFile('PrivacyInfo.xcprivacy')) project.addResourceFile('PrivacyInfo.xcprivacy', { target }, group);
for (const reference of Object.values(project.hash.project.objects.PBXFileReference)) {
  if (!reference || typeof reference !== 'object') continue;
  // The xcode npm parser's addFile helper can serialize optional undefined
  // properties. Omit them and identify Apple's privacy manifest as XML.
  for (const key of Object.keys(reference)) if (reference[key] === undefined || reference[key] === 'undefined') delete reference[key];
  if (String(reference.path).replaceAll('"', '') === 'PrivacyInfo.xcprivacy') {
    reference.lastKnownFileType = 'text.xml'; reference.fileEncoding = 4;
  }
}
const appSettings = {
  MARKETING_VERSION: version,
  CURRENT_PROJECT_VERSION: build,
  PRODUCT_BUNDLE_IDENTIFIER: bundle,
  IPHONEOS_DEPLOYMENT_TARGET: '15.4',
  TARGETED_DEVICE_FAMILY: '"1,2"',
  ENABLE_USER_SCRIPT_SANDBOXING: 'NO'
};
const appConfigs = new Set(project.hash.project.objects.XCConfigurationList[firstTarget.firstTarget.buildConfigurationList].buildConfigurations.map(item => item.value));
for (const [id, entry] of Object.entries(project.pbxXCBuildConfigurationSection())) {
  if (!entry?.buildSettings) continue;
  if (appConfigs.has(id)) {
    Object.assign(entry.buildSettings, appSettings);
    if (process.env.APPLE_TEAM_ID) entry.buildSettings.DEVELOPMENT_TEAM = process.env.APPLE_TEAM_ID;
  } else {
    // Deployment applies at project level, while identity belongs to App.
    for (const key of Object.keys(appSettings)) if (key !== 'IPHONEOS_DEPLOYMENT_TARGET') delete entry.buildSettings[key];
    entry.buildSettings.IPHONEOS_DEPLOYMENT_TARGET = '15.4';
  }
}
await writeFile(projectFile, project.writeSync());
const podfile = 'ios/App/Podfile';
await writeFile(podfile, (await readFile(podfile, 'utf8')).replace(/platform :ios, '[^']+'/g, "platform :ios, '15.4'"));

const infoFile = 'ios/App/App/Info.plist';
const info = plist.parse(await readFile(infoFile, 'utf8'));
info.CFBundleDisplayName = 'Force Multiplier';
info.ITSAppUsesNonExemptEncryption = false;
info.UIRequiredDeviceCapabilities = ['arm64'];
info.UIUserInterfaceStyle = 'Light';
await writeFile(infoFile, plist.build(info) + '\n');

const mainFile = 'ios/App/App/Base.lproj/Main.storyboard';
let main = await readFile(mainFile, 'utf8');
main = main.replace('customClass="CAPBridgeViewController" customModule="Capacitor"', 'customClass="ForceMultiplierViewController" customModule="App" customModuleProvider="target"');
if (!main.includes('customClass="ForceMultiplierViewController"')) throw new Error('Main storyboard is missing our bridge controller.');
await writeFile(mainFile, main);
const sceneFile = 'ios/App/App/SceneDelegate.swift';
let scene = await readFile(sceneFile, 'utf8');
scene = scene.replace('window?.rootViewController = CAPBridgeViewController()', 'window?.rootViewController = ForceMultiplierViewController()');
if (!scene.includes('window?.rootViewController = ForceMultiplierViewController()')) throw new Error('SceneDelegate is missing our bridge controller.');
await writeFile(sceneFile, scene);
await copyFile('native/ios/LaunchScreen.storyboard', 'ios/App/App/Base.lproj/LaunchScreen.storyboard');
await cp('native/assets/AppIcon.appiconset', 'ios/App/App/Assets.xcassets/AppIcon.appiconset', { recursive: true });
await cp('native/assets/LaunchMark.imageset', 'ios/App/App/Assets.xcassets/LaunchMark.imageset', { recursive: true });
await rm('ios/App/App/Assets.xcassets/Splash.imageset', { recursive: true, force: true });
await rm('ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png', { force: true });

const workspace = 'ios/App/App.xcworkspace';
await mkdir(workspace, { recursive: true });
if (!existsSync(`${workspace}/contents.xcworkspacedata`)) await writeFile(`${workspace}/contents.xcworkspacedata`, `<?xml version="1.0" encoding="UTF-8"?>
<Workspace version="1.0"><FileRef location="group:App.xcodeproj"/><FileRef location="group:Pods/Pods.xcodeproj"/></Workspace>\n`);
const schemeDir = 'ios/App/App.xcodeproj/xcshareddata/xcschemes';
await mkdir(schemeDir, { recursive: true });
const reference = `<BuildableReference BuildableIdentifier="primary" BlueprintIdentifier="${target}" BuildableName="App.app" BlueprintName="App" ReferencedContainer="container:App.xcodeproj"/>`;
await writeFile(`${schemeDir}/App.xcscheme`, `<?xml version="1.0" encoding="UTF-8"?>
<Scheme LastUpgradeVersion="2600" version="1.3">
  <BuildAction parallelizeBuildables="YES" buildImplicitDependencies="YES"><BuildActionEntries><BuildActionEntry buildForTesting="YES" buildForRunning="YES" buildForProfiling="YES" buildForArchiving="YES" buildForAnalyzing="YES">${reference}</BuildActionEntry></BuildActionEntries></BuildAction>
  <TestAction buildConfiguration="Debug" selectedDebuggerIdentifier="Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier="Xcode.IDEFoundation.Launcher.LLDB" shouldUseLaunchSchemeArgsEnv="YES"><Testables/></TestAction>
  <LaunchAction buildConfiguration="Debug" selectedDebuggerIdentifier="Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier="Xcode.IDEFoundation.Launcher.LLDB" launchStyle="0" useCustomWorkingDirectory="NO" ignoresPersistentStateOnLaunch="NO" debugDocumentVersioning="YES" debugServiceExtension="internal" allowLocationSimulation="YES"><BuildableProductRunnable runnableDebuggingMode="0">${reference}</BuildableProductRunnable></LaunchAction>
  <ProfileAction buildConfiguration="Release" shouldUseLaunchSchemeArgsEnv="YES" savedToolIdentifier="" useCustomWorkingDirectory="NO" debugDocumentVersioning="YES"><BuildableProductRunnable runnableDebuggingMode="0">${reference}</BuildableProductRunnable></ProfileAction>
  <AnalyzeAction buildConfiguration="Debug"/>
  <ArchiveAction buildConfiguration="Release" revealArchiveInOrganizer="YES"/>
</Scheme>\n`);
console.log(`Configured Force Multiplier ${version} (${build}), ${bundle}; iPhone + iPad, iOS 15.4+.`);
