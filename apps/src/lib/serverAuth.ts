import { FirebaseRequestAuthError, verifyFirebaseRequest } from './firebaseAdmin';

export interface AuthenticatedUser {
    uid: string;
}

/**
 * Memverifikasi ID token Firebase/Google di server dari header Authorization: Bearer <token>.
 * Melempar FirebaseRequestAuthError (status 401) jika token tidak ada, tidak valid, atau kedaluwarsa.
 * UID tidak pernah dibaca dari body atau query client demi keamanan.
 */
export async function requireUser(request: Request): Promise<AuthenticatedUser> {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (!authHeader || !authHeader.trim().toLowerCase().startsWith('bearer ')) {
        throw new FirebaseRequestAuthError(
            'Header otorisasi tidak ditemukan atau tidak valid. Harap sertakan Authorization: Bearer <token>.',
            401
        );
    }

    const uid = await verifyFirebaseRequest(request);
    if (!uid || typeof uid !== 'string' || !uid.trim()) {
        throw new FirebaseRequestAuthError('Sesi autentikasi tidak valid atau pengguna tidak ditemukan.', 401);
    }

    return { uid: uid.trim() };
}
