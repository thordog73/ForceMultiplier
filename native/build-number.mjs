// Apple accepts one to three numeric components. Keeping the traditional
// 4/2/2 digit limits also works with older tools that inspect app bundles.
export function parseBuild(value) {
  const text = String(value).trim();
  if (!/^\d{1,4}(?:\.\d{1,2}){0,2}$/.test(text)) throw new Error(`Invalid iOS build number: ${text}`);
  const parts = text.split('.').map(Number);
  while (parts.length < 3) parts.push(0);
  return parts;
}
export function compareBuild(a, b) {
  const left = parseBuild(a), right = parseBuild(b);
  for (let i = 0; i < 3; i++) if (left[i] !== right[i]) return left[i] - right[i];
  return 0;
}
export function incrementBuild(value) {
  const parts = parseBuild(value);
  if (++parts[2] > 99) { parts[2] = 0; if (++parts[1] > 99) { parts[1] = 0; parts[0]++; } }
  if (parts[0] > 9999) throw new Error('Choose a new build number convention before exceeding 9999.99.99.');
  return parts.join('.');
}
export function chooseBuildNumber({ previous = [], explicit, now = new Date(), ciNumber } = {}) {
  // One component per UTC day, then hour/minute; ASC maximum handles same-minute
  // reruns. CM_BUILD_NUMBER contributes a strictly increasing candidate as well.
  const days = Math.floor((now.getTime() - Date.UTC(2020, 0, 1)) / 86400000) + 1;
  let candidate = `${days}.${now.getUTCHours()}.${now.getUTCMinutes()}`;
  parseBuild(candidate);
  if (ciNumber !== undefined && ciNumber !== '') {
    if (!/^\d+$/.test(String(ciNumber))) throw new Error('CM_BUILD_NUMBER must be numeric.');
    const count = Number(ciNumber) + 1;
    if (!Number.isSafeInteger(count) || count > 99999999) throw new Error('CM_BUILD_NUMBER exceeds the supported build range.');
    const ci = `${Math.floor(count / 10000) + 1}.${Math.floor(count / 100) % 100}.${count % 100}`;
    if (compareBuild(ci, candidate) > 0) candidate = ci;
  }
  let highest = '0';
  for (const value of previous) if (compareBuild(value, highest) > 0) highest = value;
  if (explicit) {
    parseBuild(explicit);
    if (compareBuild(explicit, highest) <= 0) throw new Error('IOS_BUILD_NUMBER must be greater than the existing App Store/TestFlight build.');
    return explicit;
  }
  return compareBuild(candidate, highest) > 0 ? candidate : incrementBuild(highest);
}
