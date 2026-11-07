import { gzipSync, brotliCompressSync } from 'node:zlib';
import { createHash } from 'node:crypto';

export interface CachedPayload {
  rawBuffer: Buffer;
  gzipBuffer: Buffer;
  brBuffer: Buffer;
  etag: string;
  contentType: string;
  timestamp: number;
}

const memoryStore = new Map<string, CachedPayload>();

/**
 * Creates pre-serialized, pre-compressed buffers and generates ETag.
 */
export function setCachedResponse<T>(key: string, data: T, contentType = 'application/json'): CachedPayload {
  const jsonStr = typeof data === 'string' ? data : JSON.stringify(data);
  const rawBuffer = Buffer.from(jsonStr, 'utf8');
  
  // Fast md5/sha1 hash for ETag
  const hash = createHash('md5').update(rawBuffer).digest('base64url').slice(0, 16);
  const etag = `W/"${hash}-${rawBuffer.length}"`;

  const gzipBuffer = gzipSync(rawBuffer, { level: 6 });
  const brBuffer = brotliCompressSync(rawBuffer);

  const payload: CachedPayload = {
    rawBuffer,
    gzipBuffer,
    brBuffer,
    etag,
    contentType,
    timestamp: Date.now(),
  };

  memoryStore.set(key, payload);
  return payload;
}

export function getCachedResponse(key: string, maxAgeMs = 60000): CachedPayload | null {
  const item = memoryStore.get(key);
  if (!item) return null;
  if (Date.now() - item.timestamp > maxAgeMs) {
    return null;
  }
  return item;
}

export function invalidateCache(key?: string): void {
  if (key) {
    memoryStore.delete(key);
  } else {
    memoryStore.clear();
  }
}

/**
 * Builds HTTP Response with proper 304 Not Modified, Content-Encoding, CORS, and Cache-Control.
 */
export function buildCachedApiResponse(
  request: Request,
  payload: CachedPayload,
  cacheControl = 'public, max-age=60, stale-while-revalidate=120'
): Response {
  const ifNoneMatch = request.headers.get('if-none-match');
  if (ifNoneMatch && (ifNoneMatch === payload.etag || ifNoneMatch.includes(payload.etag))) {
    return new Response(null, {
      status: 304,
      headers: {
        'ETag': payload.etag,
        'Cache-Control': cacheControl,
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  const acceptEncoding = request.headers.get('accept-encoding') || '';
  let body: Buffer = payload.rawBuffer;
  const headers = new Headers({
    'Content-Type': payload.contentType,
    'ETag': payload.etag,
    'Cache-Control': cacheControl,
    'Access-Control-Allow-Origin': '*',
    'Vary': 'Accept-Encoding',
  });

  if (acceptEncoding.includes('br')) {
    headers.set('Content-Encoding', 'br');
    body = payload.brBuffer;
  } else if (acceptEncoding.includes('gzip')) {
    headers.set('Content-Encoding', 'gzip');
    body = payload.gzipBuffer;
  }

  headers.set('Content-Length', body.byteLength.toString());

  return new Response(body as unknown as BodyInit, {
    status: 200,
    headers,
  });
}

