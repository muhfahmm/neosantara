'use client';

if (typeof window !== 'undefined') {
  const isTauriEnv =
    window.location.origin.includes('tauri.localhost') ||
    window.location.protocol === 'tauri:' ||
    '__TAURI_INTERNALS__' in window ||
    '__TAURI__' in window;

  if (isTauriEnv) {
    const OrigWebSocket = window.WebSocket;
    if (OrigWebSocket) {
      window.WebSocket = function (...args: any[]) {
        const url = args[0];
        // Jika request WebSocket ditujukan ke HMR (webpack-hmr atau turbopack-hmr) pada origin tauri.localhost
        if (typeof url === 'string' && (url.includes('webpack-hmr') || url.includes('turbopack-hmr'))) {
          if (url.includes('tauri.localhost')) {
            // Arahkan ke 127.0.0.1:3000 (port dev server Next.js yang di-reverse oleh adb)
            const correctedUrl = url.replace('tauri.localhost', '127.0.0.1:3000');
            console.log('[HMR Shield] Rerouting HMR WebSocket to:', correctedUrl);
            return new OrigWebSocket(correctedUrl, ...args.slice(1));
          }
        }
        return new OrigWebSocket(...(args as [any]));
      } as any;
      window.WebSocket.prototype = OrigWebSocket.prototype;
    }
  }
}

export default function HmrShield() {
  return null;
}
