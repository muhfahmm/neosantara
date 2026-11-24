import { NextResponse } from 'next/server';
import { execFile } from 'child_process';
import path from 'path';
import { z } from 'zod';
import { simulateBattleTs } from '@/app/page/detail_negara/3_operasi_militer/1_serang_negara/war_algoritm/battleEngine';

const WarSimulationSchema = z.object({
  attackerPower: z.number().min(0).max(10_000_000).default(0),
  targetPower: z.number().min(0).max(10_000_000).default(0),
  terrain: z.enum(['normal', 'mountain', 'pegunungan', 'fortress', 'benteng']).default('normal'),
  attackerTech: z.number().min(0.1).max(10.0).default(1.0),
  targetTech: z.number().min(0.1).max(10.0).default(1.0),
  damageRate: z.number().min(0.01).max(1.0).default(0.15),
  maxRounds: z.number().min(1).max(10_000).default(1000),
  seed: z.number().optional(),
});

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    if (rawBody.length > 50_000) {
      return NextResponse.json(
        { error: 'Payload body exceeds maximum limit (50KB)' },
        { status: 413 }
      );
    }

    let jsonBody: unknown;
    try {
      jsonBody = JSON.parse(rawBody || '{}');
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON payload format' },
        { status: 400 }
      );
    }

    const parseResult = WarSimulationSchema.safeParse(jsonBody);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Validation error: invalid request payload',
          issues: parseResult.error.issues.map(i => ({ path: i.path.join('.'), message: i.message })),
        },
        { status: 400 }
      );
    }

    const {
      attackerPower,
      targetPower,
      terrain,
      attackerTech,
      targetTech,
      damageRate,
      maxRounds,
      seed,
    } = parseResult.data;

    // Coba jalankan skrip Python AI
    const pythonScriptPath = path.join(
      process.cwd(),
      'src',
      'app',
      'page',
      'detail_negara',
      '3_operasi_militer',
      '1_serang_negara',
      'war_algoritm',
      'battle_engine.py'
    );

    const pythonPromise = new Promise((resolve, reject) => {
      const payload = JSON.stringify({
        attackerPower,
        targetPower,
        terrain,
        attackerTech,
        targetTech,
        damageRate,
        maxRounds,
        seed,
      });

      execFile('python', [pythonScriptPath, payload], (error, stdout) => {
        if (error) {
          return reject(error);
        }
        try {
          const parsed = JSON.parse(stdout);
          resolve(parsed);
        } catch (e) {
          reject(e);
        }
      });
    });

    try {
      const pythonResult = await pythonPromise;
      return NextResponse.json(pythonResult);
    } catch (pyErr) {
      console.warn('[WarSimulation API] Python execution fallback to TS:', pyErr);
      const tsResult = simulateBattleTs({
        attackerPower,
        targetPower,
        terrain,
        attackerTech,
        targetTech,
        damageRate,
        maxRounds,
        seed,
      });
      return NextResponse.json(tsResult);
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to calculate war outcome' },
      { status: 500 }
    );
  }
}
