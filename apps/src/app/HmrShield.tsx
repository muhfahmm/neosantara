'use client';

if (typeof window !== 'undefined') {
  const isTauriEnv =
    window.location.origin.includes('tauri.localhost') ||
    window.location.protocol === 'tauri:' ||
    '__TAURI_INTERNALS__' in window ||
    '__TAURI__' in window;

  if (isTauriEnv) {
    const OrigWebSocket = window.WebSocket;
    const hmrPort = process.env.NEXT_PUBLIC_TAURI_ANDROID_HMR_PORT;
    if (OrigWebSocket) {
      window.WebSocket = class extends OrigWebSocket {
        constructor(url: string | URL, protocols?: string | string[]) {
          const urlString = url.toString();
          if (
            hmrPort &&
            (urlString.includes('webpack-hmr') || urlString.includes('turbopack-hmr'))
          ) {
            const parsedUrl = new URL(urlString, window.location.href);
            if (parsedUrl.hostname === 'tauri.localhost') {
              parsedUrl.hostname = '127.0.0.1';
              parsedUrl.port = hmrPort;
              console.log('[HMR Shield] Rerouting HMR WebSocket to:', parsedUrl.toString());
              super(parsedUrl.toString(), protocols);
              return;
            }
          }

          super(urlString, protocols);
        }
      };
    }
  }
}

export default function HmrShield() {
  return null;
}
