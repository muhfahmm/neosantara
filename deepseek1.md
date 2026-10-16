## 1. Konsep Dasar: Jangan Simpan Diamond di Client

Saat ini kamu menyimpan `player_diamonds` di `localStorage`:

```ts
localStorage.setItem('player_diamonds', '150');
```

**Ini bahaya** untuk game berbayar. User bisa buka DevTools → ubah `localStorage` → dapat diamond gratis.

**Solusi:** semua data ekonomi (diamond, inventory berbayar, riwayat pembelian) **harus disimpan di PostgreSQL**, bukan di client.

```
❌ localStorage.setItem('player_diamonds', '999999')
✅ POST /api/topup/verify → server update PostgreSQL → client fetch ulang
```

---

## 2. Arsitektur yang Disarankan

Karena game kamu bisa berjalan sebagai web **dan** desktop, gunakan arsitektur **hybrid**:

```
┌─────────────────────┐         ┌──────────────────────────┐
│  Desktop App        │         │  Web Server (Next.js)    │
│  (Electron/Tauri)   │◄───────►│  - API Routes            │
│                     │  HTTPS  │  - Auth (NextAuth/JWT)   │
│  - UI Game          │         │  - Payment Logic         │
│  - Buka browser     │         │  - Webhook Handler       │
└─────────────────────┘         └──────────┬───────────────┘
                                           │
                                           ▼
                                ┌──────────────────────┐
                                │  Payment Gateway     │
                                │  (Midtrans/Xendit)   │
                                └──────────┬───────────┘
                                           │ webhook
                                           ▼
                                ┌──────────────────────┐
                                │  PostgreSQL          │
                                │  - users             │
                                │  - transactions      │
                                │  - diamond_ledger    │
                                └──────────────────────┘
```

**Poin kunci:** server kamu (Next.js API) tetap harus hidup di internet sebagai **backend**. Aplikasi desktop hanya jadi **client**. Kalau game full offline tanpa server, sistem top-up tidak bisa aman.

---

## 3. Opsi Payment Gateway

### Untuk Indonesia:

| Gateway | Kelebihan | Kekurangan |
|---------|-----------|------------|
| **Midtrans** | Populer, banyak metode (QRIS, VA, e-wallet, kartu), dokumentasi bagus | Fee ~2.9% + Rp2.000 |
| **Xendit** | API modern, support QRIS, VA, e-wallet | Fee mirip Midtrans |
| **Duitku** | Fee lebih murah untuk UMKM | Dokumentasi kurang lengkap |
| **Tripay** | Support banyak channel, cocok untuk indie | Kadang lambat verifikasi |
| **Stripe** | Global, bagus untuk luar negeri | Kurang populer di Indonesia untuk QRIS |

### Untuk Global / Steam:
- **Steam MicroTxn** — kalau game dirilis di Steam
- **Google Play Billing** — kalau rilis di Play Store
- **Microsoft Store** — kalau rilis di Microsoft Store
- **Paddle / Gumroad** — untuk indie developer

**Rekomendasi:** mulai dengan **Midtrans** atau **Xendit** untuk Indonesia. Kalau nanti rilis di Steam, tambahkan Steam MicroTxn.

---

## 4. Flow Top-Up di Desktop App

Karena desktop app tidak bisa langsung buka halaman payment gateway dengan aman, flow-nya seperti ini:

### Flow A: Deep Link + External Browser (Paling Umum)

```
1. User klik "Top Up 100 Diamond"
        │
        ▼
2. Desktop app panggil API: POST /api/topup/create
   { packageId: "diamond_100" }
        │
        ▼
3. Server buat transaksi di PostgreSQL + minta Snap Token ke Midtrans
        │
        ▼
4. Server balikin URL pembayaran
        │
        ▼
5. Desktop app buka URL di browser default:
   shell.openExternal(paymentUrl)
        │
        ▼
6. User bayar di browser (QRIS/VA/e-wallet)
        │
        ▼
7. Midtrans kirim webhook ke server:
   POST /api/topup/webhook
        │
        ▼
8. Server verifikasi signature, update PostgreSQL:
   - tandai transaksi "paid"
   - tambah diamond ke user
        │
        ▼
9. Desktop app polling / WebSocket dapat notifikasi:
   "Pembayaran berhasil, +100 diamond"
```

### Flow B: In-App Browser (Lebih Mulus)

Gunakan `BrowserWindow` (Electron) atau `WebviewWindow` (Tauri) untuk buka halaman pembayaran **di dalam aplikasi**, lalu tangkap URL callback.

```ts
// Electron
const paymentWindow = new BrowserWindow({ width: 800, height: 600 });
paymentWindow.loadURL(paymentUrl);
paymentWindow.webContents.on('will-navigate', (event, url) => {
  if (url.startsWith('https://yourapp.com/topup/success')) {
    paymentWindow.close();
    // Refresh diamond dari server
  }
});
```

---

## 5. Struktur Database PostgreSQL

```sql
-- Tabel user
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel saldo diamond (jangan disimpan di client!)
CREATE TABLE user_wallets (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  diamonds INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel transaksi top-up
CREATE TABLE topup_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  order_id TEXT UNIQUE NOT NULL,       -- ID dari Midtrans
  package_id TEXT NOT NULL,            -- "diamond_100"
  amount_idr INTEGER NOT NULL,         -- 15000
  diamonds INTEGER NOT NULL,           -- 100
  status TEXT NOT NULL,                -- pending | paid | failed | expired
  payment_method TEXT,                 -- qris | bca_va | gopay
  gateway_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

-- Ledger untuk audit (setiap perubahan diamond dicatat)
CREATE TABLE diamond_ledger (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  delta INTEGER NOT NULL,              -- +100 atau -50
  reason TEXT NOT NULL,                -- topup | purchase | refund
  reference_id UUID,                   -- topup_transactions.id atau purchase.id
  balance_after INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Kenapa pakai ledger?**  
Kalau ada sengketa atau bug, kamu bisa audit kapan diamond bertambah/berkurang. Ini standar industri.

---

## 6. API Routes yang Dibutuhkan

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout

GET  /api/wallet/balance              → ambil saldo diamond
POST /api/topup/create                → buat transaksi, dapat payment URL
POST /api/topup/webhook               → terima callback dari Midtrans
GET  /api/topup/history               → riwayat top-up user

POST /api/purchase/item               → beli item dengan diamond
GET  /api/purchase/history            → riwayat pembelian
```

---

## 7. Contoh Kode: Create Top-Up (Midtrans)

```ts
// app/api/topup/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import midtransClient from 'midtrans-client';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
});

const PACKAGES = {
  diamond_100:  { diamonds: 100,  price: 15000 },
  diamond_500:  { diamonds: 500,  price: 70000 },
  diamond_1200: { diamonds: 1200, price: 150000 },
};

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { packageId } = await req.json();
  const pkg = PACKAGES[packageId];
  if (!pkg) return NextResponse.json({ error: 'Paket tidak valid' }, { status: 400 });

  const orderId = `TOPUP-${session.userId}-${Date.now()}`;

  // Simpan transaksi pending
  await db.query(
    `INSERT INTO topup_transactions (user_id, order_id, package_id, amount_idr, diamonds, status)
     VALUES ($1, $2, $3, $4, $5, 'pending')`,
    [session.userId, orderId, packageId, pkg.price, pkg.diamonds]
  );

  // Minta Snap token ke Midtrans
  const transaction = await snap.createTransaction({
    transaction_details: { order_id: orderId, gross_amount: pkg.price },
    customer_details: { email: session.email },
  });

  return NextResponse.json({
    orderId,
    token: transaction.token,
    redirectUrl: transaction.redirect_url,
  });
}
```

---

## 8. Contoh Kode: Webhook Handler

```ts
// app/api/topup/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { order_id, status_code, gross_amount, signature_key, transaction_status } = body;

  // 1. Verifikasi signature Midtrans
  const expected = crypto
    .createHash('sha512')
    .update(`${order_id}${status_code}${gross_amount}${process.env.MIDTRANS_SERVER_KEY}`)
    .digest('hex');

  if (expected !== signature_key) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
  }

  // 2. Hanya proses kalau status paid/settlement
  if (transaction_status !== 'settlement' && transaction_status !== 'capture') {
    return NextResponse.json({ ok: true });
  }

  // 3. Idempotent: cek apakah order sudah pernah diproses
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `SELECT * FROM topup_transactions WHERE order_id = $1 FOR UPDATE`,
      [order_id]
    );
    const tx = rows[0];
    if (!tx || tx.status === 'paid') {
      await client.query('ROLLBACK');
      return NextResponse.json({ ok: true });
    }

    // Update transaksi
    await client.query(
      `UPDATE topup_transactions SET status = 'paid', paid_at = NOW(), gateway_response = $1 WHERE order_id = $2`,
      [body, order_id]
    );

    // Tambah diamond ke wallet
    await client.query(
      `UPDATE user_wallets SET diamonds = diamonds + $1, updated_at = NOW() WHERE user_id = $2`,
      [tx.diamonds, tx.user_id]
    );

    // Catat di ledger
    const { rows: walletRows } = await client.query(
      `SELECT diamonds FROM user_wallets WHERE user_id = $1`,
      [tx.user_id]
    );
    await client.query(
      `INSERT INTO diamond_ledger (user_id, delta, reason, reference_id, balance_after)
       VALUES ($1, $2, 'topup', $3, $4)`,
      [tx.user_id, tx.diamonds, tx.id, walletRows[0].diamonds]
    );

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }

  return NextResponse.json({ ok: true });
}
```

---

## 9. Sisi Desktop App (Electron/Tauri)

### Electron

```ts
// electron/main.js
import { ipcMain, shell, BrowserWindow } from 'electron';

ipcMain.handle('topup:start', async (event, packageId) => {
  const session = await getSessionToken();
  const res = await fetch('https://yourapi.com/api/topup/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session}` },
    body: JSON.stringify({ packageId }),
  });
  const { redirectUrl } = await res.json();

  // Buka di browser default
  shell.openExternal(redirectUrl);
  return { ok: true };
});

// Polling cek status setiap 3 detik
ipcMain.handle('topup:check', async (event, orderId) => {
  const res = await fetch(`https://yourapi.com/api/topup/status?orderId=${orderId}`);
  return res.json();
});
```

### Tauri

```rust
use tauri::Manager;
use tauri_plugin_shell::ShellExt;

#[tauri::command]
async fn start_topup(app: tauri::AppHandle, package_id: String) -> Result<String, String> {
    // Panggil API Next.js kamu
    let client = reqwest::Client::new();
    let res = client.post("https://yourapi.com/api/topup/create")
        .json(&serde_json::json!({ "packageId": package_id }))
        .send().await.map_err(|e| e.to_string())?;
    let json: serde_json::Value = res.json().await.map_err(|e| e.to_string())?;
    let url = json["redirectUrl"].as_str().unwrap_or("").to_string();

    // Buka di browser default
    app.shell().open(&url, None).map_err(|e| e.to_string())?;
    Ok(url)
}
```

---

## 10. Keamanan: Jangan Sampai Bocor

| Risiko | Mitigasi |
|--------|----------|
| User ubah `localStorage` | Simpan saldo di PostgreSQL, fetch tiap buka app |
| User replay webhook | Verifikasi signature + idempotent check `order_id` |
| User spoof order | Validasi `order_id` milik user yang login |
| User refund setelah dapat diamond | Cek status refund, tarik kembali diamond |
| User pakai VPN + kartu curang | Aktifkan Midtrans Fraud Detection |
| User modifikasi file game | Code signing + obfuscation (opsional) |
| User buka DevTools di Electron | Matikan DevTools di production |
| User inject request ke API | Rate limiting + JWT validasi ketat |

---

## 11. Yang Harus Kamu Putuskan Dulu

Sebelum coding, jawab pertanyaan ini:

1. **Game ini online atau offline?**  
   - Online → top-up bisa real-time dengan server
   - Offline → butuh sync saat online, lebih rumit

2. **User harus login atau bisa main tanpa akun?**  
   - Kalau tanpa login, top-up tidak bisa aman
   - Saran: wajib login (email/Google) untuk top-up

3. **Target platform?**  
   - Web + Desktop sendiri → Midtrans/Xendit
   - Steam → Steam MicroTxn
   - Play Store → Google Play Billing
   - Microsoft Store → Microsoft Store IAP

4. **Server hosting di mana?**  
   - Vercel (Next.js) → bagus untuk webhook
   - VPS (Vultr, DigitalOcean) → kontrol penuh
   - Cloudflare Workers → untuk edge

5. **Model bisnis?**  
   - Sekali beli (premium)
   - Freemium + diamond
   - Subscription
   - Battle pass / season

---

## 12. Rekomendasi Bertahap

### Tahap 1 (Sekarang, sebelum rilis)
- Buat sistem **akun user** (register/login)
- Pindahkan **diamond** dari `localStorage` ke PostgreSQL
- Buat **API wallet** untuk cek saldo

### Tahap 2 (Saat mau monetisasi)
- Integrasi **Midtrans Snap**
- Buat halaman `/page/topup_page` yang **panggil API create transaction**
- Buat **webhook handler**
- Buat **halaman riwayat top-up**

### Tahap 3 (Setelah jalan)
- Tambah **item shop** (beli item dengan diamond)
- Tambah **ledger** untuk audit
- Tambah **fraud detection** (Midtrans punya)
- Tambah **refund handling**
- Tambah **analytics** (berapa user top-up, berapa rata-rata)

### Tahap 4 (Kalau rilis di platform)
- Steam → migrasi ke **Steam MicroTxn**
- Play Store → **Google Play Billing**
- Tambah **code signing** untuk desktop app

---

## 13. Contoh Harga Paket (Saran)

| Paket | Diamond | Harga IDR | Bonus |
|-------|---------|-----------|-------|
| Starter | 100 | 15.000 | - |
| Popular | 500 | 70.000 | +50 (10%) |
| Best Value | 1.200 | 150.000 | +200 (17%) |
| Mega | 3.000 | 350.000 | +700 (23%) |

**Tips:** selalu kasih **bonus untuk paket besar** agar user tertarik top-up lebih banyak. Ini standar di game mobile.

---

## 14. Catatan Khusus untuk Konversi Desktop

Karena game kamu akan jadi aplikasi desktop:

- **Jangan simpan API key Midtrans di client** — taruh di server Next.js saja
- **Jangan buka payment URL di dalam app tanpa validasi** — gunakan `shell.openExternal` atau webview dengan domain whitelist
- **Buat halaman `/topup/success` dan `/topup/failed` di web** untuk redirect setelah bayar
- **Pakai deep link** (contoh: `neosantara://topup/success?orderId=xxx`) untuk balik ke app
- **Polling atau WebSocket** untuk update saldo setelah bayar
- **Simpan token auth di secure storage** (Electron: `safeStorage`, Tauri: `tauri-plugin-store` dengan encryption)

---

## Kesimpulan

Sistem top-up di game desktop itu **bisa** dilakukan, tapi **wajib ada server backend** (Next.js API kamu) yang:
1. Menyimpan saldo diamond di PostgreSQL
2. Berkomunikasi dengan payment gateway
3. Menerima webhook untuk update saldo
4. Memvalidasi setiap transaksi

Aplikasi desktop hanya jadi **client** yang:
1. Minta buat transaksi
2. Buka browser/webview untuk bayar
3. Polling status
4. Refresh saldo dari server

Kalau kamu mau, saya bisa lanjutkan dengan:
- **Skema autentikasi** (NextAuth + JWT untuk desktop)
- **Kode lengkap** webhook Midtrans + Xendit
- **Halaman topup_page** yang siap pakai
- **Skema anti-cheat** untuk diamond
- **Integrasi Electron/Tauri** dengan deep link