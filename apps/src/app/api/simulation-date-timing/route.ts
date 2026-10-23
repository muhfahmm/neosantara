import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface SimulationDateTiming {
    date: string;
    tickToPaintMs: number;
    commitMs: number;
    queuedMs: number;
    speed: number;
    source: string;
    rustDateMs: number;
    playerPresent: boolean;
    longTaskMs: number;
}

function isSimulationDateTiming(value: unknown): value is SimulationDateTiming {
    if (!value || typeof value !== 'object') return false;
    const timing = value as Partial<SimulationDateTiming>;
    const parsedDate = typeof timing.date === 'string'
        ? new Date(`${timing.date}T00:00:00Z`)
        : null;
    return typeof timing.date === 'string' &&
        /^\d{4}-\d{2}-\d{2}$/.test(timing.date) &&
        parsedDate !== null &&
        !Number.isNaN(parsedDate.getTime()) &&
        parsedDate.toISOString().slice(0, 10) === timing.date &&
        Number.isFinite(timing.tickToPaintMs) &&
        Number(timing.tickToPaintMs) >= 0 &&
        Number.isFinite(timing.commitMs) &&
        Number(timing.commitMs) >= 0 &&
        Number.isFinite(timing.queuedMs) &&
        Number(timing.queuedMs) >= 0 &&
        Number.isFinite(timing.speed) &&
        Number(timing.speed) > 0 &&
        (timing.source === 'clock' || timing.source === 'date-commit') &&
        Number.isFinite(timing.rustDateMs) &&
        Number(timing.rustDateMs) >= 0 &&
        typeof timing.playerPresent === 'boolean' &&
        Number.isFinite(timing.longTaskMs) &&
        Number(timing.longTaskMs) >= 0;
}

export async function POST(request: Request) {
    const origin = request.headers.get('origin');
    const requestHost = request.headers.get('x-forwarded-host') || request.headers.get('host');
    const forwardedProtocol = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
    if (!origin || !requestHost) {
        return NextResponse.json({ error: 'Origin tidak valid.' }, { status: 403 });
    }
    let originUrl: URL;
    try {
        originUrl = new URL(origin);
    } catch {
        return NextResponse.json({ error: 'Origin tidak valid.' }, { status: 403 });
    }
    const requestProtocol = forwardedProtocol || new URL(request.url).protocol.slice(0, -1);
    if (originUrl.host !== requestHost || originUrl.protocol !== `${requestProtocol}:`) {
        return NextResponse.json({ error: 'Origin tidak valid.' }, { status: 403 });
    }

    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > 2048) {
        return NextResponse.json({ error: 'Payload terlalu besar.' }, { status: 413 });
    }

    let payload: unknown;
    try {
        payload = await request.json();
    } catch {
        return NextResponse.json({ error: 'Payload JSON tidak valid.' }, { status: 400 });
    }
    if (!isSimulationDateTiming(payload)) {
        return NextResponse.json({ error: 'Data timing pergantian tanggal tidak valid.' }, { status: 400 });
    }

    console.info(
        `[simulation-date] ${payload.date} | tick-to-paint=${payload.tickToPaintMs.toFixed(1)}ms | ` +
        `commit=${payload.commitMs.toFixed(1)}ms | queued=${payload.queuedMs.toFixed(1)}ms | ` +
        `rust-date=${payload.rustDateMs.toFixed(3)}ms | long-task=${payload.longTaskMs.toFixed(1)}ms | ` +
        `player=${payload.playerPresent ? 'yes' : 'no'} | ` +
        `source=${payload.source} | speed=${payload.speed}x`,
    );
    return NextResponse.json({ logged: true });
}
