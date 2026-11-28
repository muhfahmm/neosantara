import { handleLocalMasterDataRequest } from './localMasterData';

/**
 * Resolves API paths to absolute URLs when running inside Tauri Mobile WebView,
 * or returns relative paths when running directly on Next.js web server.
 */
export function resolveApiUrl(path: string): string {
  if (typeof window === 'undefined') {
    return path;
  }

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '');
  if (configuredApiUrl) {
    return `${configuredApiUrl}${cleanPath}`;
  }

  const origin = window.location.origin;
  const isTauriLocalhost = origin.includes('tauri.localhost') || window.location.protocol === 'tauri:';
  const isMobileUserAgent = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isTauriEnv = '__TAURI_INTERNALS__' in window || '__TAURI__' in window;

  if (isTauriLocalhost || isMobileUserAgent || isTauriEnv) {
    if (!isTauriLocalhost && (origin.startsWith('http://') || origin.startsWith('https://'))) {
      return `${origin}${cleanPath}`;
    }
    const configuredHost = process.env.NEXT_PUBLIC_API_HOST;
    if (configuredHost) {
      return `${configuredHost}${cleanPath}`;
    }
    const tauriDevHost = process.env.NEXT_PUBLIC_TAURI_DEV_HOST;
    if (tauriDevHost) {
      return `http://${tauriDevHost}:3000${cleanPath}`;
    }
    if (process.env.NODE_ENV === 'development' && origin.startsWith('http')) {
      return `${origin}${cleanPath}`;
    }
    return `http://192.168.137.1:3000${cleanPath}`;
  }

  return cleanPath;
}

/**
 * Patches global window.fetch to automatically resolve relative /api/ requests
 * when running inside Tauri Mobile WebView.
 */
export function patchGlobalFetch() {
  if (typeof window === 'undefined') return;

  const w = window as any;
  if (w.__API_FETCH_PATCHED__) return;
  w.__API_FETCH_PATCHED__ = true;

  const originalFetch = window.fetch;
  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
    let urlString = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    const requestUrl = new URL(urlString, window.location.origin);

    if (requestUrl.pathname.startsWith('/api/')) {
      if (process.env.NEXT_PUBLIC_LOCAL_MASTER_DATA === '1') {
        const method = init?.method ?? (input instanceof Request ? input.method : 'GET');
        const localResponse = await handleLocalMasterDataRequest(
          `${requestUrl.pathname}${requestUrl.search}`,
          originalFetch,
          method,
        );
        if (localResponse) return localResponse;
      }

      if (urlString.startsWith('/api/') || urlString.startsWith('/api?')) {
        const resolved = resolveApiUrl(urlString);
        if (typeof input === 'string') {
          input = resolved;
        } else if (input instanceof URL) {
          input = new URL(resolved);
        } else {
          input = new Request(resolved, input);
        }
      }
    }
    return originalFetch.call(this, input, init);
  };
}
