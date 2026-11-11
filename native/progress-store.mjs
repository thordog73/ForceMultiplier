// Native Preferences is a durable mirror of the existing browser workspace.
// Reads finish before the game starts. Writes are serialized, including resets.
export const PROGRESS_KEYS = Object.freeze([
  'force-multiplier-worlds-22',
  'force-multiplier-flightline-22',
  'force-multiplier-universal-v22'
]);

export function createProgressStore({ isNative, storage, preferences, onError = () => {} }) {
  const allowed = new Set(PROGRESS_KEYS);
  const prefix = 'fm.progress.';
  const pendingPrefix = 'fm.progress.pending.';
  let queue = Promise.resolve();
  let available = !isNative;
  let openingError = null;
  const failures = new Map();
  const removed = new Set();
  const valid = value => {
    if (typeof value !== 'string' || value.length > 8_000_000) return false;
    try { const parsed = JSON.parse(value); return !!parsed && typeof parsed === 'object' && !Array.isArray(parsed); }
    catch { return false; }
  };
  const ready = (async () => {
    if (!isNative) return { available: true, native: false };
    try {
      const items = await Promise.all(PROGRESS_KEYS.map(async key => ({ key, ...(await preferences.get({ key: prefix + key })) })));
      // Apply only after all reads succeed. Never replace a backup with empty defaults
      // because an earlier read failed. Invalid native data is not silently overwritten.
      if (items.some(({ value }) => value !== null && !valid(value))) throw new Error('Saved device progress could not be read.');
      const snapshots = items.map(item => ({ ...item, local: storage.getItem(item.key), pending: storage.getItem(pendingPrefix + item.key) }));
      for (const { local, pending } of snapshots) {
        if (pending !== null && (!valid(pending) || (valid(local) && local !== pending))) {
          throw new Error('Conflicting local progress was preserved. Export it before resetting or restoring.');
        }
      }
      // A pending marker records an intentional save made after a successful
      // hydration. Keep it across crashes/write failures, so an older native
      // mirror can never silently replace the newer local copy on relaunch.
      const retries = [];
      for (const { key, value, local, pending } of snapshots) {
        if (pending !== null) {
          storage.setItem(key, pending);
          retries.push({ key, value: pending });
        } else if (value !== null) storage.setItem(key, value);
        else if (valid(local)) retries.push({ key, value: local });
      }
      available = true;
      for (const { key, value } of retries) {
        try {
          storage.setItem(pendingPrefix + key, value);
          await preferences.set({ key: prefix + key, value });
          if (storage.getItem(pendingPrefix + key) === value) storage.removeItem(pendingPrefix + key);
        } catch (error) { failures.set(key, error); onError(error); }
      }
      return { available: true, native: true, ...(failures.size ? { pending: true } : {}) };
    } catch (error) {
      available = false;
      openingError = error;
      onError(error);
      return { available: false, native: true };
    }
  })();
  function checkKey(key) {
    if (!allowed.has(key)) throw new Error('This is not a Force Multiplier progress key.');
  }
  function enqueue(key, operation, allowRemoval = false) {
    const result = queue.then(async () => {
      await ready;
      if (!isNative) return;
      if (!available && !allowRemoval) throw new Error('Device backup is unavailable. Your current browser session is still usable. Export it before closing.');
      await operation();
      failures.delete(key);
    });
    // A single write failure must not permanently poison the serial queue.
    queue = result.catch(error => { failures.set(key, error); onError(error); });
    return result;
  }
  return {
    ready,
    save(key, value) {
      checkKey(key);
      if (!valid(value)) return Promise.reject(new Error('Progress must be a JSON object smaller than 8 MB.'));
      if (isNative && available) {
        try { storage.setItem(pendingPrefix + key, value); }
        catch (error) { failures.set(key, error); onError(error); return Promise.reject(error); }
      }
      return enqueue(key, async () => {
        await preferences.set({ key: prefix + key, value });
        if (storage.getItem(pendingPrefix + key) === value) storage.removeItem(pendingPrefix + key);
      });
    },
    remove(key) {
      checkKey(key);
      // Only the UI's explicitly confirmed reset calls this method. A corrupt
      // backup must not make deleting the user's own app progress impossible.
      return enqueue(key, async () => {
        await preferences.remove({ key: prefix + key });
        storage.removeItem(pendingPrefix + key);
        removed.add(key);
        if (PROGRESS_KEYS.every(item => removed.has(item))) { available = true; openingError = null; }
      }, true);
    },
    async flush() {
      await ready;
      await queue;
      if (openingError) throw openingError;
      if (failures.size) throw failures.values().next().value;
    },
    available: () => available
  };
}
