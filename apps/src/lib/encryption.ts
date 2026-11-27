import crypto from 'node:crypto';

/**
 * Modul Enkripsi & Hashing Standar Keamanan Tinggi
 * - Enkripsi Simetris: AES-256-GCM (Authenticated Encryption)
 * - Derivasi Kunci: SHA-256 dari variable ENCRYPTION_SECRET / DB_ENCRYPTION_KEY
 * - Output format: `iv:authTag:ciphertext` (dalam hex string)
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit IV standar yang optimal untuk GCM
const AUTH_TAG_LENGTH = 16; // 128-bit authentication tag

function getSecretKey(): Buffer {
    const rawKey = process.env.ENCRYPTION_SECRET || process.env.DB_ENCRYPTION_KEY;
    if (!rawKey || !rawKey.trim()) {
        // Fallback salt acak untuk dev agar tidak crash, tapi berikan warning
        if (process.env.NODE_ENV === 'production') {
            throw new Error('ENCRYPTION_SECRET atau DB_ENCRYPTION_KEY wajib dikonfigurasi di lingkungan produksi.');
        }
        return crypto.createHash('sha256').update('neosantara_dev_fallback_key_2026').digest();
    }
    return crypto.createHash('sha256').update(rawKey.trim()).digest();
}

/**
 * Mengenkripsi plaintext string menjadi format aman `iv:authTag:ciphertext` (hex)
 */
export function encryptData(plaintext: string): string {
    const key = getSecretKey();
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
        authTagLength: AUTH_TAG_LENGTH,
    });

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Mendekripsi string format `iv:authTag:ciphertext` (hex) kembali ke plaintext
 */
export function decryptData(encryptedString: string): string {
    const key = getSecretKey();
    const parts = encryptedString.split(':');

    if (parts.length !== 3) {
        throw new Error('Format ciphertext terenkripsi tidak valid. Ekspektasi format iv:tag:data.');
    }

    const [ivHex, authTagHex, cipherHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    if (iv.length !== IV_LENGTH || authTag.length !== AUTH_TAG_LENGTH) {
        throw new Error('Panjang IV atau Auth Tag enkripsi tidak valid.');
    }

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
        authTagLength: AUTH_TAG_LENGTH,
    });

    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(cipherHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}

/**
 * Helper hashing satu arah SHA-256 (untuk lookup key / signature data yang tidak perlu didekripsi)
 */
export function hashData(value: string, salt: string = ''): string {
    return crypto.createHash('sha256').update(`${salt}:${value}`).digest('hex');
}
