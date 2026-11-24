import { NextResponse } from 'next/server';
import { z } from 'zod';

const ClientErrorSchema = z.object({
  message: z.string().max(2000).optional(),
  stack: z.string().max(10000).optional(),
  componentStack: z.string().max(10000).optional(),
  info: z.unknown().optional(),
  timestamp: z.union([z.string(), z.number()]).optional(),
}).passthrough();

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    if (rawBody.length > 50_000) {
      return NextResponse.json(
        { error: 'Payload exceeds limit (50KB)' },
        { status: 413 }
      );
    }

    let jsonBody: unknown;
    try {
      jsonBody = JSON.parse(rawBody || '{}');
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
    }

    const parseResult = ClientErrorSchema.safeParse(jsonBody);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload structure' },
        { status: 400 }
      );
    }

    console.warn('[CLIENT ERROR REPORT]:', parseResult.data);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}

