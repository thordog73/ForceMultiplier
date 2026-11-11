import { Capacitor, registerPlugin } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { Haptics, NotificationType, ImpactStyle } from '@capacitor/haptics';
import { createProgressStore } from './progress-store.mjs';

const isNative = Capacitor.isNativePlatform();
const Files = registerPlugin('FMFiles');
const store = createProgressStore({
  isNative,
  storage: {
    getItem: key => window.localStorage.getItem(key),
    setItem: (key, value) => window.localStorage.setItem(key, value),
    removeItem: key => window.localStorage.removeItem(key)
  },
  preferences: Preferences,
  onError: error => {
    console.warn('Progress backup:', error?.message || 'unavailable');
    window.dispatchEvent(new CustomEvent('fm-storage-warning', { detail: { message: 'Device backup is unavailable. Export your progress before closing the app.' } }));
  }
});
const safeName = name => String(name || 'force-multiplier.json').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);
const nativeApi = {
  isNative,
  ready: store.ready,
  get storageAvailable() { return store.available(); },
  saveProgress: (key, value) => store.save(key, value),
  removeProgress: key => store.remove(key),
  flush: () => store.flush(),
  async haptic(kind = 'selection') {
    if (!isNative) return;
    try {
      if (kind === 'success' || kind === 'error') await Haptics.notification({ type: kind === 'success' ? NotificationType.Success : NotificationType.Error });
      else await Haptics.impact({ style: ImpactStyle.Light });
    } catch { /* Devices without haptic support continue normally. */ }
  },
  async shareFile({ name, mimeType = 'application/json', data }) {
    if (typeof data !== 'string' || data.length > 8_000_000) throw new Error('Export must be text smaller than 8 MB.');
    if (isNative) return Files.shareFile({ name: safeName(name), mimeType, data });
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = safeName(name);
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return { completed: true };
  },
  async importFile() {
    if (isNative) {
      const result = await Files.importFile();
      return result.cancelled ? null : result;
    }
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file'; input.accept = '.json,application/json';
      input.addEventListener('change', async () => {
        try {
          const file = input.files?.[0];
          if (!file) return resolve(null);
          if (file.size > 8_000_000) throw new Error('This backup is too large. Maximum size is 8 MB.');
          resolve({ name: file.name, data: await file.text() });
        } catch (error) { reject(error); }
        finally { input.remove(); }
      }, { once: true });
      input.addEventListener('cancel', () => { input.remove(); resolve(null); }, { once: true });
      input.hidden = true; document.body.appendChild(input); input.click();
    });
  },
  async copyText(text) {
    if (isNative) { await Files.copyText({ text: String(text) }); return; }
    if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(String(text)); return; }
    const area = document.createElement('textarea'); area.value = String(text);
    area.style.position = 'fixed'; area.style.opacity = '0';
    document.body.appendChild(area); area.select();
    const copied = document.execCommand('copy'); area.remove();
    if (!copied) throw new Error('Copy is unavailable in this browser. Use Export instead.');
  },
  async printHTML(html, title = 'Force Multiplier') {
    if (isNative) { await Files.printHTML({ html: String(html), title: String(title) }); return; }
    const frame = document.createElement('iframe');
    frame.style.cssText = 'position:fixed;right:0;bottom:0;width:1px;height:1px;border:0';
    document.body.appendChild(frame);
    frame.contentDocument.open(); frame.contentDocument.write(String(html)); frame.contentDocument.close();
    frame.contentWindow.focus(); frame.contentWindow.print();
    setTimeout(() => frame.remove(), 60_000);
  }
};
window.FMNative = Object.freeze(nativeApi);
document.documentElement.classList.toggle('native-app', isNative);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') void store.flush().catch(() => {});
});
