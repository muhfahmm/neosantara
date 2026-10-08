import { NextResponse } from 'next/server';
import { execFile } from 'child_process';
import path from 'path';
import { simulateBattleTs } from '@/app/page/detail_negara/3_operasi_militer/1_serang_negara/war_algoritm/battleEngine';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      attackerPower = 0,
      targetPower = 0,
      terrain = 'normal',
      attackerTech = 1.0,
      targetTech = 1.0,
      damageRate = 0.15,
      maxRounds = 1000,
    } = body;

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
