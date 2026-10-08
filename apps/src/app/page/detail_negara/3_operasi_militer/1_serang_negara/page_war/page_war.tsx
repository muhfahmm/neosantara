'use client';

import React from 'react';
import {
  Swords,
  Construction,
  Zap,
  X,
  Shield,
  Activity,
} from 'lucide-react';

interface PageWarProps {
  attackerName: string;
  targetName: string;
  onAutoResult: () => void;
  onClose?: () => void;
}

export default function PageWar({
  attackerName,
  targetName,
  onAutoResult,
  onClose,
}: PageWarProps) {
  return (
    <div className="fixed inset-0 z-[300] bg-[#050B0B] flex flex-col justify-between p-6 sm:p-10 font-sans select-none overflow-hidden animate-[warFadeIn_0.4s_ease-out]">
      {/* ══════════ BACKGROUND GRID & GLOW FX ══════════ */}
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#00FFAA 1px, transparent 1px), linear-gradient(90deg, #00FFAA 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,170,0.1),transparent_70%)] pointer-events-none" />

      {/* ══════════ HEADER ══════════ */}
      <div className="relative z-10 flex items-center justify-between border-b border-[#00FFAA]/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#00FFAA]/15 border border-[#00FFAA]/40 text-[#00FFAA] shadow-[0_0_20px_rgba(0,255,170,0.3)]">
            <Swords className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-black text-[#00FFAA] uppercase tracking-widest leading-none">
              MEDAN PERTEMPURAN MILITER
            </h1>
            <p className="text-xs text-[#6B8A8A] font-bold uppercase tracking-widest mt-1">
              Simulasi Taktis Operasi {attackerName} VS {targetName}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-3 rounded-2xl bg-[#0F2424] hover:bg-[#142E2E] border border-[#00FFAA]/30 text-[#6B8A8A] hover:text-[#00FFAA] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* ══════════ KONTEN UTAMA: HALAMAN DALAM PENGEMBANGAN ══════════ */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto p-6 space-y-6 max-w-xl mx-auto">
        <div className="relative">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#0F2424] border-2 border-[#00FFAA]/40 flex items-center justify-center shadow-[0_0_60px_rgba(0,255,170,0.25)] animate-pulse">
            <Construction className="h-12 w-12 sm:h-14 sm:w-14 text-[#FFEB3B]" />
          </div>
          <div className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-[#FF2D55] text-white shadow-md">
            <Activity className="h-4 w-4" />
          </div>
        </div>

        <div className="space-y-2">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#FFEB3B]/15 border border-[#FFEB3B]/40 text-[#FFEB3B] text-xs font-black uppercase tracking-widest">
            SIMULASI MEDAN PERANG (WIP)
          </span>
          <h2 className="text-xl sm:text-3xl font-black text-white uppercase tracking-wider">
            HALAMAN SEDANG DALAM PENGEMBANGAN
          </h2>
          <p className="text-xs sm:text-sm text-[#8ab0b8] leading-relaxed max-w-md mx-auto">
            Fitur pertempuran manual 3D/Interactive Tactical War sedang dikembangkan. Silakan gunakan opsi <strong className="text-[#FFEB3B]">Hasil Otomatis</strong> untuk langsung melihat hasil akhir peperangan ini.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-[#0F2424]/80 border border-[#00FFAA]/20 rounded-2xl p-4 w-full justify-around text-xs font-bold uppercase tracking-wider">
          <div className="flex items-center gap-2 text-[#00FFAA]">
            <Shield className="h-4 w-4" /> {attackerName}
          </div>
          <span className="text-[#FFEB3B] font-black">VS</span>
          <div className="flex items-center gap-2 text-[#FF2D55]">
            <Shield className="h-4 w-4" /> {targetName}
          </div>
        </div>
      </div>

      {/* ══════════ FOOTER: BUTTON HASIL OTOMATIS KANAN BAWAH ══════════ */}
      <div className="relative z-10 flex justify-end items-center border-t border-[#00FFAA]/20 pt-4">
        <button
          onClick={onAutoResult}
          className="flex items-center gap-3 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#FFEB3B] to-[#FFC107] hover:from-[#FFF066] hover:to-[#FFD54F] text-[#050B0B] font-black text-xs sm:text-sm uppercase tracking-widest shadow-[0_0_30px_rgba(255,235,59,0.4)] transition-all transform hover:scale-105 cursor-pointer group"
        >
          <Zap className="h-5 w-5 fill-current text-[#050B0B] group-hover:rotate-12 transition-transform" />
          Hasil Otomatis
        </button>
      </div>
    </div>
  );
}
