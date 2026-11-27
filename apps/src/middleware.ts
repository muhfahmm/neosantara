import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware untuk membatasi akses antarmuka game (/page/*)
 * Hanya mengizinkan request dari Desktop App (Tauri / Electron) atau Mobile App.
 * Browser biasa akan diarahkan ke homepage/portal download.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Lewatkan jika endpoint API, aset statis, atau homepage
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  // Jika env memperbolehkan web bermain (misal flag dev testing), loloskan
  if (process.env.ALLOW_WEB_GAME === 'true' || process.env.NEXT_PUBLIC_ALLOW_WEB_GAME === 'true') {
    return NextResponse.next();
  }

  // Cek Header Identifikasi Desktop / App
  const userAgent = request.headers.get('user-agent') || '';
  const clientHeader = request.headers.get('x-neosantara-client') || '';
  const secFetchDest = request.headers.get('sec-fetch-dest') || '';

  const isDesktopOrApp =
    /Tauri|Electron|Capacitor|Cordova|NeosantaraClient/i.test(userAgent) ||
    clientHeader === 'desktop-app' ||
    clientHeader === 'mobile-app';

  // Jika mengakses root '/' atau rute game ('/page/*') tapi BUKAN dari desktop/mobile app
  if ((pathname === '/' || pathname.startsWith('/page')) && !isDesktopOrApp) {
    if (secFetchDest === 'document' || request.headers.get('accept')?.includes('text/html')) {
      const htmlResponse = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Neosantara - Desktop Only Access</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #020617;
      color: #f8fafc;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      box-sizing: border-box;
    }
    .card {
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(16, 185, 129, 0.3);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      border-radius: 16px;
      padding: 36px 32px;
      max-width: 480px;
      width: 90%;
      text-align: center;
      backdrop-filter: blur(12px);
    }
    .icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 20px;
      border-radius: 16px;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #34d399;
      font-size: 32px;
    }
    h1 {
      font-size: 1.25rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #34d399;
      margin: 0 0 12px;
      font-family: monospace;
    }
    p {
      font-size: 0.9rem;
      color: #94a3b8;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .badge {
      display: inline-block;
      padding: 6px 14px;
      background: rgba(16, 185, 129, 0.15);
      color: #6ee7b7;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 600;
      font-family: monospace;
      margin-bottom: 20px;
    }
    .hint {
      font-size: 0.8rem;
      color: #64748b;
      border-top: 1px solid rgba(51, 65, 85, 0.6);
      padding-top: 16px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">🛡️</div>
    <h1>Akses Browser Dibatasi</h1>
    <span class="badge">API & CLIENT ONLY</span>
    <p>
      Server web ini difungsikan sebagai <strong>Backend & API Hub</strong> Neosantara. Game tidak dapat dimainkan langsung melalui browser biasa.
    </p>
    <div class="hint">
      Jalankan <code>npm run dev</code> atau <code>npm run electron:start</code> di terminal untuk membuka game melalui Electron Desktop.
    </div>
  </div>
</body>
</html>`;
      return new NextResponse(htmlResponse, {
        status: 403,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/page/:path*'],
};
