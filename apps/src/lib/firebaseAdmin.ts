import { cert, getApps, initializeApp, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import crypto from 'crypto';

export class FirebaseRequestAuthError extends Error {
    constructor(
        message: string,
        readonly status: number,
    ) {
        super(message);
    }
}

let publicKeysCache: { keys: Record<string, string>; expiresAt: number } | null = null;

async function getFirebasePublicKeys(): Promise<Record<string, string>> {
    const now = Date.now();
    if (publicKeysCache && publicKeysCache.expiresAt > now) {
        return publicKeysCache.keys;
    }

    try {
        const response = await fetch('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com');
        if (!response.ok) {
            throw new Error(`Failed to fetch public keys: ${response.status}`);
        }

        const cacheControl = response.headers.get('cache-control') || '';
        const maxAgeMatch = cacheControl.match(/max-age=(\d+)/i);
        const maxAgeSeconds = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : 3600;

        const keys = await response.json();
        publicKeysCache = {
            keys,
            expiresAt: now + maxAgeSeconds * 1000,
        };
        return keys;
    } catch (error) {
        console.error('Failed to retrieve Firebase public certificates:', error);
        if (publicKeysCache) return publicKeysCache.keys;
        throw error;
    }
}

function parseJwtPart(b64: string): Record<string, unknown> {
    const padded = b64.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
}

async function verifyIdTokenWithPublicKey(token: string, expectedProjectId: string): Promise<string> {
    const parts = token.split('.');
    if (parts.length !== 3) {
        throw new FirebaseRequestAuthError('Firebase login token is malformed.', 401);
    }

    const header = parseJwtPart(parts[0]);
    const payload = parseJwtPart(parts[1]);

    const kid = header.kid as string;
    if (!kid) {
        throw new FirebaseRequestAuthError('Firebase token missing key identifier (kid).', 401);
    }

    const publicKeys = await getFirebasePublicKeys();
    const certPem = publicKeys[kid];
    if (!certPem) {
        throw new FirebaseRequestAuthError('Firebase token signed with unknown certificate.', 401);
    }

    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(`${parts[0]}.${parts[1]}`);

    const signaturePadded = parts[2].replace(/-/g, '+').replace(/_/g, '/');
    const signature = Buffer.from(signaturePadded, 'base64');

    const isValid = verifier.verify(certPem, signature);
    if (!isValid) {
        throw new FirebaseRequestAuthError('Firebase login token signature verification failed.', 401);
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    const exp = Number(payload.exp);
    if (Number.isFinite(exp) && exp < nowSeconds) {
        throw new FirebaseRequestAuthError('Firebase login token is expired.', 401);
    }

    const aud = payload.aud as string;
    if (expectedProjectId && aud !== expectedProjectId) {
        throw new FirebaseRequestAuthError(`Firebase token audience mismatch: expected ${expectedProjectId}, got ${aud}`, 401);
    }

    const sub = (payload.sub || payload.user_id) as string;
    if (!sub) {
        throw new FirebaseRequestAuthError('Firebase token missing user ID (sub).', 401);
    }

    return sub;
}

function getAdminAuth() {
    const configuredApp = getApps().find(app => app.name === 'game-save-auth');
    if (configuredApp) return getAuth(configuredApp);

    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountJson) {
        return null;
    }

    try {
        const serviceAccount = JSON.parse(serviceAccountJson) as ServiceAccount;
        const app = initializeApp({
            credential: cert(serviceAccount),
        }, 'game-save-auth');
        return getAuth(app);
    } catch (error) {
        console.error('Firebase Admin initialization failed:', error);
        return null;
    }
}

export async function verifyFirebaseRequest(request: Request): Promise<string> {
    const authorization = request.headers.get('authorization');
    const match = authorization?.match(/^Bearer\s+(.+)$/i);
    if (!match) {
        throw new FirebaseRequestAuthError('Google login is required to access game saves.', 401);
    }

    const token = match[1];
    const adminAuth = getAdminAuth();

    if (adminAuth) {
        try {
            const decodedToken = await adminAuth.verifyIdToken(token);
            return decodedToken.uid;
        } catch (error) {
            console.warn('Firebase Admin SDK verifyIdToken failed, attempting public key fallback:', error);
        }
    }

    // Fallback: Verifikasi kriptografis RSA-SHA256 menggunakan sertifikat resmi Google x509
    try {
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '';
        return await verifyIdTokenWithPublicKey(token, projectId);
    } catch (error) {
        if (error instanceof FirebaseRequestAuthError) throw error;
        console.error('Public key token verification failed:', error);
        throw new FirebaseRequestAuthError('Firebase login token is invalid or expired.', 401);
    }
}
