import { cert, getApps, initializeApp, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

export class FirebaseRequestAuthError extends Error {
    constructor(
        message: string,
        readonly status: number,
    ) {
        super(message);
    }
}

function getAdminAuth() {
    const configuredApp = getApps().find(app => app.name === 'game-save-auth');
    if (configuredApp) return getAuth(configuredApp);

    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountJson) {
        throw new FirebaseRequestAuthError('Firebase server authentication is not configured.', 500);
    }

    try {
        const serviceAccount = JSON.parse(serviceAccountJson) as ServiceAccount;
        const app = initializeApp({
            credential: cert(serviceAccount),
        }, 'game-save-auth');
        return getAuth(app);
    } catch (error) {
        console.error('Firebase Admin initialization failed:', error);
        throw new FirebaseRequestAuthError('Firebase server authentication could not initialize.', 500);
    }
}

export async function verifyFirebaseRequest(request: Request): Promise<string> {
    const authorization = request.headers.get('authorization');
    const match = authorization?.match(/^Bearer\s+(.+)$/i);
    if (!match) {
        throw new FirebaseRequestAuthError('Google login is required to access game saves.', 401);
    }

    try {
        const decodedToken = await getAdminAuth().verifyIdToken(match[1]);
        return decodedToken.uid;
    } catch (error) {
        if (error instanceof FirebaseRequestAuthError) throw error;
        throw new FirebaseRequestAuthError('Firebase login token is invalid or expired.', 401);
    }
}
