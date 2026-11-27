export function isDesktopOrAppEnvironment(): boolean {
  if (typeof window === 'undefined') return false;

  const origin = window.location.origin || '';
  const protocol = window.location.protocol || '';
  const userAgent = navigator.userAgent || '';

  // 1. Cek Protokol / Origin Tauri
  const isTauriProtocol = protocol === 'tauri:' || origin.includes('tauri.localhost');

  // 2. Cek Global Object Tauri
  const isTauriGlobal = '__TAURI_INTERNALS__' in window || '__TAURI__' in window;

  // 3. Cek User-Agent Tauri / Electron / Cordova / Capacitor
  const isCustomClientUA = /Tauri|Electron|Capacitor|Cordova|NeosantaraClient/i.test(userAgent);

  // 4. Cek Global Object Electron
  const isElectronGlobal =
    'electron' in window ||
    ('process' in window && (window as unknown as { process?: { type?: string } }).process?.type === 'renderer');

  return isTauriProtocol || isTauriGlobal || isCustomClientUA || isElectronGlobal;
}
