#!/usr/bin/env python3
"""Launch the compiled app on fresh, disposable iPhone and iPad simulators.

Captures genuine simulator screenshots. It checks installation/launch/liveness;
the screenshots must still be inspected for appearance and the six-aircraft UI.
Never erases or modifies the user's existing simulator data.
"""
import json
import os
from pathlib import Path
import plistlib
import re
import subprocess
import sys
import time
import uuid

def sim(*args, timeout=180):
    result = subprocess.run(['xcrun', 'simctl', *args], text=True, capture_output=True, timeout=timeout)
    if result.returncode:
        raise RuntimeError(f"simctl {' '.join(args[:3])}: {result.stderr.strip()}")
    return result.stdout.strip()

app = Path(sys.argv[1]).resolve()
if not app.is_dir():
    raise SystemExit(f'Compiled simulator app is missing: {app}')
with (app / 'Info.plist').open('rb') as handle:
    info = plistlib.load(handle)
bundle = info['CFBundleIdentifier']
out = Path('artifacts/simulator').resolve()
out.mkdir(parents=True, exist_ok=True)
devices = json.loads(sim('list', 'devices', 'available', '--json'))['devices']
types = json.loads(sim('list', 'devicetypes', '--json'))['devicetypes']
type_by_name = {item['name']: item['identifier'] for item in types}
def version(runtime):
    return tuple(int(n) for n in re.findall(r'\d+', runtime.rsplit('iOS-', 1)[-1]))
runtimes = sorted((r for r in devices if '.iOS-' in r), key=version, reverse=True)
results = []
for family in ['iPhone', 'iPad']:
    chosen = None
    for runtime in runtimes:
        options = [d for d in devices[runtime] if d['name'].startswith(family) and d.get('isAvailable', True)]
        if options:
            # Prefer larger Pro/Max screens when present; no fabricated sizes.
            options.sort(key=lambda d: ('Max' in d['name'] or '13-inch' in d['name'], 'Pro' in d['name'], d['name']), reverse=True)
            chosen = (runtime, options[0])
            break
    if not chosen:
        raise SystemExit(f'No available {family} simulator on this Xcode image. Install an iOS simulator runtime and rerun.')
    runtime, template = chosen
    device_type = template.get('deviceTypeIdentifier') or type_by_name.get(template['name'])
    if not device_type:
        raise SystemExit(f"Cannot identify simulator model {template['name']}.")
    udid = sim('create', f'FM Smoke {family} {uuid.uuid4().hex[:8]}', device_type, runtime)
    try:
        sim('boot', udid)
        sim('bootstatus', udid, '-b', timeout=300)
        sim('status_bar', udid, 'override', '--time', '9:41', '--dataNetwork', 'wifi', '--wifiMode', 'active', '--wifiBars', '3', '--batteryState', 'charged', '--batteryLevel', '100')
        sim('install', udid, str(app))
        launch = sim('launch', '--terminate-running-process', udid, bundle)
        # All content is local. Allow first WKWebView start and Preferences read.
        time.sleep(8)
        processes = sim('spawn', udid, 'launchctl', 'list')
        if bundle not in processes:
            raise RuntimeError(f'{bundle} exited before the screenshot on {family}.')
        screenshot = out / f'{family.lower()}-initial-game.png'
        sim('io', udid, 'screenshot', '--type=png', str(screenshot))
        item = {'family': family, 'device': template['name'], 'runtime': runtime, 'bundle': bundle,
                'version': info['CFBundleShortVersionString'], 'build': info['CFBundleVersion'],
                'launch': launch, 'screenshot': screenshot.name,
                'checks': 'installed, launched, process present, actual screenshot captured',
                'visualReview': 'pending: inspect screenshot for six-aircraft opening screen'}
        results.append(item)
        (out / 'smoke-results.json').write_text(json.dumps(results, indent=2) + '\n')
        print(f"Captured {family}: {template['name']} / {runtime}", flush=True)
    finally:
        subprocess.run(['xcrun', 'simctl', 'shutdown', udid], capture_output=True)
        subprocess.run(['xcrun', 'simctl', 'delete', udid], capture_output=True)
print('Simulator launch checks completed. Inspect the actual screenshots before using them in App Store Connect.')
