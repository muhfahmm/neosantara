import { NextResponse } from 'next/server';

const retiredResponse = () =>
  NextResponse.json(
    { error: 'Economic policy state is session-only; save it through /api/game-save.' },
    { status: 410 }
  );

export async function GET() {
  return retiredResponse();
}

export async function POST() {
  return retiredResponse();
}
