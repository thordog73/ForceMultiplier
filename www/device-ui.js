/* Shared device behavior. Curriculum and scoring do not depend on native APIs. */
(function () {
  'use strict';
  const native = window.FMNative;
  const isNative = !!native?.isNative;
  let generation = 0;
  let storageAvailable = true;
  let openingFailed = false;
  const pending = new Set();

  function notice(ok) {
    storageAvailable = ok;
    const banner = document.getElementById('storage-notice');
    if (!banner) return;
    banner.hidden = ok;
    if (ok) return;
    const message = document.getElementById('storage-message');
    if (message) message.textContent = openingFailed
      ? 'Saved progress could not be opened. Export this session before reopening the app.'
      : 'Your latest changes may not be saved. Keep this screen open and export a backup.';
    const retry = banner.querySelector('[data-action="retry-save"]');
    if (retry) retry.hidden = openingFailed;
  }

  if (isNative) {
    document.documentElement.classList.add('native-app');
    native.ready.then(result => {
      if (result?.available === false) { openingFailed = true; notice(false); }
      else if (result?.pending) notice(false);
    });
    window.addEventListener('fm-storage-warning', () => notice(false));
    // Flush the durable mirror before a bundled page replaces this web view.
    document.addEventListener('click', async event => {
      const link = event.target.closest?.('a[href]');
      const href = link?.getAttribute('href') || '';
      if (event.defaultPrevented || !/^\.\/(?:index|courses|about|privacy|support)\.html(?:#.*)?$/.test(href)) return;
      event.preventDefault();
      await Promise.allSettled([...pending]);
      try { await native.flush(); }
      catch (_) { notice(false); return; }
      if (!storageAvailable) { notice(false); return; }
      window.location.assign(href);
    });
  }

  function save(key, value) {
    const ticket = ++generation;
    const text = typeof value === 'string' ? value : JSON.stringify(value);
    let cacheOK = true;
    try { localStorage.setItem(key, text); } catch (_) { cacheOK = false; notice(false); }
    if (!isNative) { notice(cacheOK); return Promise.resolve(cacheOK); }
    const operation = native.saveProgress(key, text).then(() => {
      if (ticket === generation) notice(cacheOK && !openingFailed);
      return cacheOK && !openingFailed;
    }, () => { if (ticket === generation) notice(false); return false; });
    pending.add(operation);
    operation.finally(() => pending.delete(operation));
    return operation;
  }

  async function remove(keys) {
    await Promise.allSettled([...pending]);
    // This path is reached only after the user confirms a reset. An unreadable
    // or failed backup must not prevent the user from deleting that app data.
    if (isNative) await native.flush().catch(() => {});
    for (const key of keys) {
      if (isNative) await native.removeProgress(key);
      localStorage.removeItem(key);
    }
    openingFailed = false;
    notice(true);
  }

  async function shareJSON(name, value) {
    const data = JSON.stringify(value, null, 2);
    if (native?.shareFile) return native.shareFile({name, mimeType:'application/json', data});
    const url = URL.createObjectURL(new Blob([data], {type:'application/json'}));
    const link = document.createElement('a');
    link.href = url; link.download = name;
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return {completed:true};
  }

  window.FMDevice = {isNative, save, remove, shareJSON,
    get storageAvailable() { return storageAvailable; },
    get openingFailed() { return openingFailed; }};
})();
