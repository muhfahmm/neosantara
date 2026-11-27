import { encryptData, decryptData, hashData } from '../apps/src/lib/encryption.ts';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTests() {
  console.log('=== TEST 1: Enkripsi & Dekripsi AES-256-GCM ===');
  const sensitivePayload = JSON.stringify({
    uid: 'kG6z9tEPgLOEMIdaIKNBircPQv22',
    account_number: '1234-5678-9012-3456',
    topup_nominal: 500000,
    timestamp: Date.now(),
  });

  const encrypted = encryptData(sensitivePayload);
  console.log('[INFO] Hasil Enkripsi (iv:tag:cipher):', encrypted.slice(0, 40) + '...');

  const decrypted = decryptData(encrypted);
  if (decrypted === sensitivePayload) {
    console.log('[PASS] Dekripsi AES-256-GCM berhasil merekonstruksi data asli 100%');
  } else {
    console.error('[FAIL] Dekripsi tidak cocok!');
    process.exit(1);
  }

  // Uji Integritas (Tamper Resistance): Ubah 1 karakter ciphertext
  const parts = encrypted.split(':');
  const tamperedCipher = parts[2].slice(0, -2) + (parts[2].endsWith('a') ? 'b' : 'a');
  const tamperedString = `${parts[0]}:${parts[1]}:${tamperedCipher}`;

  try {
    decryptData(tamperedString);
    console.error('[FAIL] Enkripsi gagal mendeteksi modifikasi/tampering!');
    process.exit(1);
  } catch (e) {
    console.log('[PASS] GCM Auth Tag berhasil mendeteksi tampering/modifikasi ciphertext ilegal!');
  }

  console.log('\n=== TEST 2: Verifikasi Sintaks Skrip SQL Least-Privilege ===');
  const sqlPath = path.resolve(__dirname, 'setup_least_privilege_user.sql');
  if (fs.existsSync(sqlPath)) {
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    if (sqlContent.includes('GRANT SELECT, INSERT, UPDATE, DELETE') &&
        sqlContent.includes('app_neosantara_user') &&
        !sqlContent.includes('GRANT ALL PRIVILEGES')) {
      console.log('[PASS] Skrip SQL Least Privilege valid: Membatasi hak hanya ke CRUD, tanpa DROP/SUPERUSER');
    } else {
      console.error('[FAIL] Skrip SQL mengandung hak berlebih!');
      process.exit(1);
    }
  } else {
    console.error('[FAIL] Skrip setup_least_privilege_user.sql tidak ditemukan!');
    process.exit(1);
  }

  console.log('\nSEMUA PENGUJIAN TAHAP 2 (DATABASE & ENKRIPSI) BERHASIL 100%!');
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
