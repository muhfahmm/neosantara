import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server.js';
import { getCorsHeaders } from './cors';

export { ALLOWED_ORIGINS, getCorsHeaders } from './cors';

export function handleCorsPreflight(request: Request): NextResponse | null {
    if (request.method.toUpperCase() === 'OPTIONS') {
        const corsHeaders = getCorsHeaders(request);
        return new NextResponse(null, {
            status: 204,
            headers: {
                ...corsHeaders,
                'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
                'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-CSRF-Token, X-Requested-With, Accept, If-None-Match',
                'Access-Control-Max-Age': '86400',
            },
        });
    }
    return null;
}

/**
 * Client Upstash Redis (bila URL dan TOKEN tersedia)
 */
const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const redisClient = (upstashUrl && upstashToken)
    ? new Redis({ url: upstashUrl, token: upstashToken })
    : null;

/**
 * In-Memory Fallback Token Bucket / Sliding Window Limiter
 */
interface InMemoryBucket {
    count: number;
    resetAt: number;
}
const memoryBuckets = new Map<string, InMemoryBucket>();

function checkInMemoryRateLimit(
    identifier: string,
    limit: number,
    windowMs: number
): { success: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const entry = memoryBuckets.get(identifier);

    if (!entry || now > entry.resetAt) {
        memoryBuckets.set(identifier, {
            count: 1,
            resetAt: now + windowMs,
        });
        return { success: true, remaining: limit - 1, resetAt: now + windowMs };
    }

    if (entry.count >= limit) {
        return { success: false, remaining: 0, resetAt: entry.resetAt };
    }

    entry.count += 1;
    return { success: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

/**
 * Pilihan limit rate
 */
export type RateLimitTier = 'auth' | 'topup' | 'standard' | 'strict';

const TIER_CONFIG: Record<RateLimitTier, { limit: number; windowSec: number }> = {
    auth: { limit: 5, windowSec: 60 },      // 5 request/menit
    topup: { limit: 3, windowSec: 60 },     // 3 request/menit
    strict: { limit: 15, windowSec: 60 },   // 15 request/menit
    standard: { limit: 60, windowSec: 60 }, // 60 request/menit
};

/**
 * Mendapatkan identifikasi klien (IP Address atau User ID)
 */
export function getClientIp(request: Request): string {
    const cfIp = request.headers.get('cf-connecting-ip');
    if (cfIp) return cfIp.trim();

    const xForwardedFor = request.headers.get('x-forwarded-for');
    if (xForwardedFor) {
        const firstIp = xForwardedFor.split(',')[0].trim();
        if (firstIp) return firstIp;
    }

    const xRealIp = request.headers.get('x-real-ip');
    if (xRealIp) return xRealIp.trim();

    return '127.0.0.1';
}

/**
 * Evaluasi Rate Limit
 */
export async function checkRateLimit(
    request: Request,
    tier: RateLimitTier = 'standard',
    customIdentifier?: string
): Promise<{ success: boolean; retryAfter: number; remaining: number }> {
    const config = TIER_CONFIG[tier];
    const ip = getClientIp(request);
    const identifier = customIdentifier ? `${tier}:${customIdentifier}` : `${tier}:${ip}`;

    // 1. Gunakan Upstash jika kredensial env tersedia
    if (redisClient) {
        try {
            const ratelimit = new Ratelimit({
                redis: redisClient,
                limiter: Ratelimit.slidingWindow(config.limit, `${config.windowSec} s`),
                analytics: true,
                prefix: 'ratelimit',
            });
            const result = await ratelimit.limit(identifier);
            const retryAfterSec = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
            return {
                success: result.success,
                retryAfter: retryAfterSec,
                remaining: result.remaining,
            };
        } catch (error) {
            console.warn('[RateLimit] Upstash Redis error, falling back to in-memory:', error);
        }
    }

    // 2. Fallback In-Memory
    const windowMs = config.windowSec * 1000;
    const memResult = checkInMemoryRateLimit(identifier, config.limit, windowMs);
    const retryAfterSec = Math.max(1, Math.ceil((memResult.resetAt - Date.now()) / 1000));

    return {
        success: memResult.success,
        retryAfter: retryAfterSec,
        remaining: memResult.remaining,
    };
}

/**
 * Buat respons 429 Too Many Requests standar
 */
export function createRateLimitErrorResponse(
    retryAfter: number,
    request?: Request
): NextResponse {
    const corsHeaders = request ? getCorsHeaders(request) : {};
    return NextResponse.json(
        {
            error: 'Terlalu banyak permintaan (Rate Limit Exceeded). Harap coba beberapa saat lagi.',
            retryAfter,
        },
        {
            status: 429,
            headers: {
                ...corsHeaders,
                'Retry-After': String(retryAfter),
                'Cache-Control': 'no-store, private',
            },
        }
    );
}
