# SECURITY AUDIT REPORT: NEOSANTARA
**Target Domain Resmi**: `https://neosantara.com`  
**Waktu Audit**: 27 November 2026  
**Auditor**: Senior Security Engineer & Full-Stack Developer  
**Status Audit**: Selesai (Temuan Baseline)

---

## Ringkasan Eksekutif
Audit ini dilakukan secara menyeluruh terhadap seluruh arsitektur proyek NEOSANTARA yang mencakup:
- **Next.js App Router** (Backend API & Frontend React)
- **Desktop Engine** (Tauri v2 + Rust)
- **Database** (PostgreSQL)
- **Autentikasi** (Firebase Auth + Google Identity)
- **Jaringan & Konfigurasi** (CORS, Security Headers, Environment Variables, Git History)

---

## Temuan Audit per Kategori

### 1. Keamanan API & Backend (Next.js & Eksternal)
| No | Item / Area | Status | Lokasi File | Deskripsi & Bukti Temuan |
| :--- | :--- | :--- | :--- | :--- |
| 1.1 | **Rate Limiting** | **Sebagian** | [apps/src/app/api/game-save/route.ts](file:///d:/project-sendiri/neosantara/apps/src/app/api/game-save/route.ts#L13-L30) | Sudah ada in-memory rate limiting lokal (60 req/menit per UID) khusus pada `/api/game-save`. **Belum ada** integrasi Upstash Redis (`@upstash/ratelimit`) terpusat untuk `/api/auth`, `/api/topup`, atau proteksi per-IP berbasis Redis di seluruh API route lainnya. Header `Retry-After` juga belum dikembalikan. |
| 1.2 | **Validasi Input API (Zod)** | **Sebagian** | [apps/src/app/api/game-save/route.ts](file:///d:/project-sendiri/neosantara/apps/src/app/api/game-save/route.ts#L33-L50), [war-simulation/route.ts](file:///d:/project-sendiri/neosantara/apps/src/app/api/war-simulation/route.ts), [client-error/route.ts](file:///d:/project-sendiri/neosantara/apps/src/app/api/client-error/route.ts) | Baru 3 dari 21 endpoint API yang memvalidasi payload dengan Zod. Sebanyak 18 endpoint lain (misalnya `/api/alokasi-subsidi`, `/api/pajak-negara`, `/api/travel-fuel-data`, dll.) masih belum memvalidasi input secara ketat dengan Zod dan belum menolak field tak dikenal (`.strict()`). |
| 1.3 | **Security Headers** | **Belum Ada** | [apps/next.config.ts](file:///d:/project-sendiri/neosantara/apps/next.config.ts#L19-L31) | Di `next.config.ts`, baru ada headers CORS dasar. **Belum ada** Content-Security-Policy (CSP) ketat, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, dan `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`. |
| 1.4 | **Konfigurasi CORS** | **Sebagian** *(Rentan)* | [apps/next.config.ts](file:///d:/project-sendiri/neosantara/apps/next.config.ts#L24) | Saat ini menggunakan wildcard berbahaya: `{ key: 'Access-Control-Allow-Origin', value: '*' }`. Harus dibatasi hanya ke origin resmi `https://neosantara.com` dan origin loopback/webview Tauri yang sah (`http://localhost:3000`, `tauri://localhost`, `http://tauri.localhost`). |
| 1.5 | **FastAPI Backend Service** | **Belum Ada** *(Standby / External)* | [apps/next.config.ts](file:///d:/project-sendiri/neosantara/apps/next.config.ts#L3-L37) | Terdapat konfigurasi rewrite `/api/negotiate-choice` dan `/api/confirm-policy` ke `DIALOG_API_URL` (`http://127.0.0.1:8000`). Layanan FastAPI ini berjalan sebagai service mandiri di luar repository utama ini. Proteksi Pydantic, CORS, dan rate limit harus distandarisasi pada gateway Next.js maupun service Python terkait. |

---

### 2. Keamanan Database (PostgreSQL)
| No | Item / Area | Status | Lokasi File | Deskripsi & Bukti Temuan |
| :--- | :--- | :--- | :--- | :--- |
| 2.1 | **Kredensial User Database** | **Sebagian** | [apps/.env.local](file:///d:/project-sendiri/neosantara/apps/.env.local) | Koneksi aplikasi saat ini menggunakan user bawaan PostgreSQL (`user = postgres` / superuser). Belum ada user aplikasi non-root berprinsip *least privilege* (hanya SELECT, INSERT, UPDATE, DELETE tanpa DDL DROP/ALTER/SUPERUSER). |
| 2.2 | **Proteksi IDOR** | **Sudah Ada** | [apps/src/app/api/game-save/route.ts](file:///d:/project-sendiri/neosantara/apps/src/app/api/game-save/route.ts#L71-L85) | Akses game save sudah diverifikasi secara server-authoritative (`WHERE id = $id AND owner_uid = $ownerUid`). Percobaan akses save milik pengguna lain mengembalikan 404/403 dan tidak membocorkan metadata. Perlu diperluas ke endpoint lain jika ada penambahan resource berbasis ID (misal saldo/topup/transaksi). |
| 2.3 | **Parameterized Queries** | **Sudah Ada** | [apps/src/lib/db.ts](file:///d:/project-sendiri/neosantara/apps/src/lib/db.ts), [game-save/route.ts](file:///d:/project-sendiri/neosantara/apps/src/app/api/game-save/route.ts) | Seluruh query ke PostgreSQL menggunakan binding parameter `$1, $2, ...` dari driver `pg`. Tidak ditemukan kerentanan SQL Injection melalui string concatenation. |
| 2.4 | **Enkripsi Data Sensitif & Hashing** | **Belum Ada** | Database schema | Autentikasi utama menggunakan Firebase Auth (Google OAuth). Tidak ada tabel password internal. Namun jika ada token pembayaran atau data identitas transaksi sensitif di masa mendatang, belum tersedia modul enkripsi AES-256 server-side. |

---

### 3. Keamanan Aplikasi Desktop (Tauri v2 + Rust)
| No | Item / Area | Status | Lokasi File | Deskripsi & Bukti Temuan |
| :--- | :--- | :--- | :--- | :--- |
| 3.1 | **CSP di Tauri** | **Sudah Ada** | [apps/src-tauri/tauri.conf.json](file:///d:/project-sendiri/neosantara/apps/src-tauri/tauri.conf.json#L26) | CSP lokal di `tauri.conf.json` sudah diatur (`default-src 'self' ... connect-src 'self' http://localhost:* https://*.firebaseio.com https://*.googleapis.com`). Perlu ditambahkan domain production `https://neosantara.com`. |
| 3.2 | **Audit Command IPC & Capabilities** | **Sudah Ada** | [apps/src-tauri/src/lib.rs](file:///d:/project-sendiri/neosantara/apps/src-tauri/src/lib.rs), [apps/src-tauri/capabilities/default.json](file:///d:/project-sendiri/neosantara/apps/src-tauri/capabilities/default.json) | Capabilities terkunci ketat hanya pada `core:default` dan `opener:default`. Tidak ada plugin berbahaya seperti `fs:all` atau `shell:all` yang dapat dieksploitasi untuk Remote Code Execution (RCE). Argumen command divalidasi ketat di sisi Rust. |
| 3.3 | **Server-Authoritative State** | **Sebagian** | [apps/src/app/page/map_system/map-system.tsx](file:///d:/project-sendiri/neosantara/apps/src/app/page/map_system/map-system.tsx) | Game berjalan offline-first / hybrid: state permainan saat runtime disimulasikan di klien (React/Wasm) lalu di-snapshot ke server saat save game. Untuk fitur kompetitif/topup di masa mendatang, aksi kritis (saldo mata uang premium/topup) wajib dihitung di server. |
| 3.4 | **Code Signing Configuration** | **Belum Ada** | [apps/src-tauri/tauri.conf.json](file:///d:/project-sendiri/neosantara/apps/src-tauri/tauri.conf.json) | Belum ada konfigurasi signing environment (`TAURI_SIGNING_PRIVATE_KEY` / Windows Authenticode certificate) untuk produksi installer `.exe`. |

---

### 4. Infrastruktur & Jaringan
| No | Item / Area | Status | Lokasi File | Deskripsi & Bukti Temuan |
| :--- | :--- | :--- | :--- | :--- |
| 4.1 | **Audit Protokol HTTPS/WSS** | **Sebagian** | [apps/src/lib/apiHelper.ts](file:///d:/project-sendiri/neosantara/apps/src/lib/apiHelper.ts#L36) | Terdapat fallback dev hardcoded `http://192.168.137.1:3000` di `apiHelper.ts` untuk debugging Android emulator lokal. Panggilan API produksi harus dipastikan selalu diarahkan ke `https://neosantara.com`. |
| 4.2 | **Audit Git History & Secret Leaks** | **Sudah Ada** | [.gitignore](file:///d:/project-sendiri/neosantara/.gitignore) | Berkas `.env`, `.env.local`, dan `.env*.local` sudah diabaikan di `.gitignore`. Pengecekan riwayat git log menunjukkan tidak ada secret atau password database aktif yang bocor ke commit publik. |
| 4.3 | **Konfigurasi Cloudflare WAF** | **Belum Ada** | Konfigurasi DNS/Edge | Belum ada dokumen panduan konfigurasi Cloudflare (Full Strict SSL, Cloudflare WAF rules, DDoS Protection, Bot Fight Mode, serta masking IP origin). |

---

### 5. Keamanan Autentikasi (Firebase / Google)
| No | Item / Area | Status | Lokasi File | Deskripsi & Bukti Temuan |
| :--- | :--- | :--- | :--- | :--- |
| 5.1 | **Verifikasi Token Server-Side** | **Sudah Ada** | [apps/src/lib/serverAuth.ts](file:///d:/project-sendiri/neosantara/apps/src/lib/serverAuth.ts), [firebaseAdmin.ts](file:///d:/project-sendiri/neosantara/apps/src/lib/firebaseAdmin.ts) | Verifikasi kriptografis RSA-SHA256 menggunakan sertifikat resmi Google x509 berjalan aktif pada setiap request berotorisasi di server Next.js. |
| 5.2 | **Manajemen Masa Berlaku Token & Refresh** | **Sudah Ada** | [apps/src/lib/firebaseClient.ts](file:///d:/project-sendiri/neosantara/apps/src/lib/firebaseClient.ts), [desktop_auth.rs](file:///d:/project-sendiri/neosantara/apps/src-tauri/src/desktop_auth.rs) | Token ID Firebase kedaluwarsa dalam 1 jam secara default. Di Desktop, refresh token disimpan di Windows Credential Manager (`keyring`) dan dihapus saat logout. |
| 5.3 | **Dukungan MFA (Multi-Factor Authentication)** | **Belum Ada** | Auth settings | Alur login masih single-factor (Google OAuth/Play Games). Belum diatur opsi MFA lanjutan. |

---

### 6. Keamanan Frontend (React)
| No | Item / Area | Status | Lokasi File | Deskripsi & Bukti Temuan |
| :--- | :--- | :--- | :--- | :--- |
| 6.1 | **Audit `dangerouslySetInnerHTML` / XSS** | **Sudah Ada** *(Aman)* | Seluruh frontend `apps/src/` | Pencarian kode membuktikan **TIDAK ADA** penggunaan `dangerouslySetInnerHTML` maupun `document.write` di seluruh komponen React. |
| 6.2 | **Sanitasi Konten Pengguna** | **Sebagian** | Form input dan rendering nama negara | Komponen React me-render teks secara deklaratif (otomatis di-escape oleh React JSX). Namun input nama negara, nama save, dan data JSON perlu dipastikan divalidasi panjang dan karakternya sebelum dikirim ke database. |
| 6.3 | **Penyimpanan Token (HttpOnly Cookies)** | **Belum Ada** | [apps/src/lib/firebaseClient.ts](file:///d:/project-sendiri/neosantara/apps/src/lib/firebaseClient.ts) | Saat ini token ID Firebase dikirimkan via header `Authorization: Bearer <token>` dari SDK client. Belum ada jembatan session cookie (`__session`) berflag `HttpOnly; Secure; SameSite=Lax/Strict` untuk transfer sesi otomatis di browser. |

---

## Kesimpulan Status
- **Sudah Ada**: 7 item (Proteksi IDOR, Parameterized Query, Tauri Capability Lock, Audit Git Secrets, Verifikasi Kriptografi Token, Audit XSS/dangerouslySetInnerHTML, Manajemen Token Lifetime).
- **Sebagian**: 5 item (Rate Limiting, Validasi Zod di sebagian endpoint, CORS masih wildcard, Server-authoritative logic, Sanitasi input pemain).
- **Belum Ada**: 6 item (Security Headers CSP/HSTS di Next.js, Role Database Least Privilege, Integrasi Upstash Redis, Session HttpOnly Cookies, Code Signing Desktop, Setup Cloudflare WAF).
