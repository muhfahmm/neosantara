### 🏗️ Arsitektur Hybrid untuk Game Global

Kunci utamanya adalah **server kamu (Next.js API) tetap menjadi otoritas tunggal** yang menyimpan saldo diamond di PostgreSQL. Aplikasi desktop (Electron/Tauri) hanya bertindak sebagai klien yang meminta transaksi dan menampilkan UI.

```
┌─────────────────────┐
│  Desktop App        │
│  (Electron/Tauri)   │
│  - UI Game          │
│  - Panggil API      │
└──────────┬──────────┘
           │ HTTPS
           ▼
┌─────────────────────┐
│  Next.js API        │
│  - Auth (JWT)       │
│  - Topup Logic      │
│  - Webhook Handler  │
└──────────┬──────────┘
           │
     ┌─────┴─────┐
     ▼           ▼
┌─────────┐ ┌──────────────┐
│PostgreSQL│ │Google/Steam  │
│(diamond) │ │API           │
└─────────┘ └──────────────┘
```

### 🎮 Integrasi Google Play Billing

Google Play Billing kini mendukung **PC Native (Windows)** melalui "Play for Native PC", dan integrasi server-side-nya **sama persis** dengan Android.

**Alur:**

1.  **Client (Desktop App)**: Memulai pembelian produk in-app menggunakan Google Play Billing Library. SDK akan mengembalikan `purchaseToken` setelah pembelian berhasil.
2.  **Client → Server**: Kirim `purchaseToken`, `productId`, dan `packageName` ke API Next.js kamu.
3.  **Server Verifikasi**: Panggil Google Play Developer API (menggunakan `googleapis` atau library seperti `iap-verification-sdk`) untuk memvalidasi token tersebut.
4.  **Server Update**: Jika valid, tambahkan diamond ke `user_wallets` di PostgreSQL dan catat di `diamond_ledger`.

**Contoh Kode Verifikasi (Next.js API Route):**

```ts
// app/api/topup/google/verify/route.ts
import { google } from 'googleapis';

export async function POST(req: Request) {
  const { purchaseToken, productId, packageName, userId } = await req.json();

  // Setup auth ke Google Play Developer API
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!),
    scopes: ['https://www.googleapis.com/auth/androidpublisher'],
  });
  const androidpublisher = google.androidpublisher({ version: 'v3', auth });

  try {
    // Verifikasi pembelian in-app
    const res = await androidpublisher.purchases.products.get({
      packageName,
      productId,
      token: purchaseToken,
    });

    // purchaseState: 0 = purchased, 1 = canceled, 2 = pending
    if (res.data.purchaseState !== 0) {
      return Response.json({ error: 'Pembelian tidak valid' }, { status: 400 });
    }

    // Idempotent: cek apakah token sudah pernah diproses
    const existing = await db.query(
      'SELECT 1 FROM topup_transactions WHERE order_id = $1',
      [`google-${purchaseToken}`]
    );
    if (existing.rowCount > 0) {
      return Response.json({ ok: true, message: 'Sudah diproses' });
    }

    // Update saldo diamond & catat ledger (dalam satu transaksi DB)
    const diamonds = PRODUCT_MAP[productId].diamonds;
    await db.query('BEGIN');
    await db.query(
      `UPDATE user_wallets SET diamonds = diamonds + $1 WHERE user_id = $2`,
      [diamonds, userId]
    );
    const { rows } = await db.query(
      'SELECT diamonds FROM user_wallets WHERE user_id = $1',
      [userId]
    );
    await db.query(
      `INSERT INTO diamond_ledger (user_id, delta, reason, reference_id, balance_after)
       VALUES ($1, $2, 'topup', $3, $4)`,
      [userId, diamonds, `google-${purchaseToken}`, rows[0].diamonds]
    );
    await db.query('COMMIT');

    return Response.json({ ok: true, diamonds });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Google Play verification failed:', error);
    return Response.json({ error: 'Verifikasi gagal' }, { status: 500 });
  }
}
```

### 🕹️ Integrasi Steam Wallet (Steam MicroTxn)

Steam **tidak** mengirim webhook. Alur verifikasinya adalah **polling** dari server kamu ke Steam setelah user menyelesaikan pembayaran.

**Alur (berdasarkan dokumentasi Steamworks):**

1.  **Server → Steam**: Panggil `ISteamMicroTxn/InitTxn` untuk membuat sesi pembayaran. Steam akan mengembalikan URL approval.
2.  **Client Buka URL**: Aplikasi desktop membuka URL tersebut (bisa via browser default atau overlay Steam di dalam game).
3.  **User Approve**: User menyetujui pembayaran menggunakan Steam Wallet.
4.  **Server Polling**: Setelah user kembali, server kamu **harus** memanggil `ISteamMicroTxn/QueryTxn` untuk mengecek status order.
5.  **Finalisasi**: Jika status `Approved`, panggil `ISteamMicroTxn/FinalizeTxn` untuk menyelesaikan transaksi dan update diamond di PostgreSQL.
6.  **Rekonsiliasi**: Panggil `ISteamMicroTxn/GetReport` secara berkala (minimal harian) untuk memastikan tidak ada transaksi yang terlewat.

**Poin Penting:** Jangan pernah memberikan diamond sebelum `FinalizeTxn` berhasil dipanggil.

### 🔒 Menyimpan Saldo Diamond di PostgreSQL (Aman)

Jangan simpan saldo di `localStorage`. Gunakan skema database yang mendukung audit dan transaksi atomik.

```sql
-- Tabel wallet
CREATE TABLE user_wallets (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  diamonds INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel ledger untuk audit setiap perubahan
CREATE TABLE diamond_ledger (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  delta INTEGER NOT NULL,          -- +100 atau -50
  reason TEXT NOT NULL,            -- 'topup_google' | 'topup_steam' | 'purchase'
  reference_id TEXT,               -- purchaseToken / orderId Steam
  balance_after INTEGER NOT NULL,  -- saldo setelah transaksi
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Setiap kali diamond berubah, **selalu** update `user_wallets` dan catat di `diamond_ledger` dalam satu transaksi database (`BEGIN ... COMMIT`).

### 🖥️ Integrasi dengan Electron / Tauri

**Electron:**
Gunakan `shell.openExternal()` untuk membuka URL approval Steam, lalu lakukan polling ke API kamu sendiri. Untuk Google Play, kamu perlu mengintegrasikan Google Play Billing SDK (C++/Java) melalui native module, atau menggunakan WebView khusus.

**Tauri (Lebih Direkomendasikan untuk Steam):**
Ada plugin komunitas `tauri-plugin-steamworks` yang mengintegrasikan Steamworks SDK langsung ke Tauri. Ini memudahkan akses ke `ISteamMicroTxn` dari sisi client, meskipun pemanggilan `InitTxn` dan `FinalizeTxn` tetap harus dari server.

### 💎 Model Bisnis & Paket Harga

Karena target global, gunakan harga dalam **USD** dan **sesuaikan otomatis** dengan kurs Steam/Google Play.

| Paket | Diamond | Harga USD | Bonus |
|-------|---------|-----------|-------|
| Starter | 100 | $0.99 | - |
| Popular | 500 | $4.99 | +50 (10%) |
| Best Value | 1,200 | $9.99 | +200 (17%) |
| Mega | 3,000 | $24.99 | +700 (23%) |

### ⚠️ Pertimbangan Khusus Game Global

*   **Pajak**: Steam dan Google Play akan memotong pajak sesuai yurisdiksi user. Kamu tidak perlu mengurusnya sendiri.
*   **Refund**: Steam dan Google Play memiliki kebijakan refund sendiri. Server kamu **harus** memproses `RefundTxn` dari Steam dan mencabut diamond yang sudah diberikan jika refund terjadi.
*   **Multi-Platform**: Jika user top-up di Android lalu main di PC, saldo diamond harus tersinkron karena disimpan di server, bukan di device.

### 🚀 Rekomendasi Tahapan

1.  **Sekarang**: Pindahkan `player_diamonds` dari `localStorage` ke PostgreSQL. Buat API `/api/wallet/balance`.
2.  **Tahap 2**: Integrasikan **Steam MicroTxn** terlebih dahulu (karena lebih sederhana dan kamu bisa rilis di Steam Early Access).
3.  **Tahap 3**: Tambahkan **Google Play Billing** untuk versi Android/PC Native.
4.  **Tahap 4**: Tambahkan sistem audit dan rekonsiliasi otomatis menggunakan `GetReport`.
