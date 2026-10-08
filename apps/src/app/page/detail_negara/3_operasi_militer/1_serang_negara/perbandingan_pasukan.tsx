'use client';

import React, { useState } from 'react';
import {
  X,
  Swords,
  Shield,
  Ship,
  Plane,
  ChevronDown,
  ChevronUp,
  Zap,
  Play,
} from 'lucide-react';
import { getArmadaPowerSummary } from '@/app/page/navigasi_menu/2_navigasi_bawah/6_pertahanan/4_armada/logic/armadaLogic';
import { convertBarakToSoldiers } from '@/app/page/navigasi_menu/2_navigasi_bawah/6_pertahanan/4_armada/logic/1_barak_logic';

interface PerbandinganPasukanProps {
  attackerName: string;
  attackerIso?: string;
  attackerPower: number;
  targetName: string;
  targetIso?: string;
  targetPower: number;
  attackerDetail?: any;
  targetDetail?: any;
  onStartBattle: () => void;
  onAutoResult: () => void;
  onClose?: () => void;
}

type ArmadaGroup = 'darat' | 'laut' | 'udara';

const armadaCatalog: Record<ArmadaGroup, Array<{ key: string; label: string }>> = {
  darat: [
    { key: 'barak', label: 'Pasukan Infanteri' },
    { key: 'tank_tempur_utama', label: 'Tank Tempur Utama' },
    { key: 'apc_ifv', label: 'APC / IFV' },
    { key: 'artileri_berat', label: 'Artileri Berat' },
    { key: 'sistem_peluncur_roket', label: 'Sistem Peluncur Roket' },
    { key: 'pertahanan_udara_mobile', label: 'Pertahanan Udara Mobile' },
    { key: 'kendaraan_taktis', label: 'Kendaraan Taktis' },
  ],
  laut: [
    { key: 'kapal_induk', label: 'Kapal Induk' },
    { key: 'kapal_induk_nuklir', label: 'Kapal Induk Nuklir' },
    { key: 'kapal_destroyer', label: 'Kapal Destroyer' },
    { key: 'kapal_korvet', label: 'Kapal Korvet' },
    { key: 'kapal_selam_nuklir', label: 'Kapal Selam Nuklir' },
    { key: 'kapal_selam_regular', label: 'Kapal Selam Reguler' },
    { key: 'kapal_ranjau', label: 'Kapal Ranjau' },
    { key: 'kapal_logistik', label: 'Kapal Logistik' },
  ],
  udara: [
    { key: 'jet_tempur_siluman', label: 'Jet Tempur Siluman' },
    { key: 'jet_tempur_interceptor', label: 'Jet Tempur Interceptor' },
    { key: 'pesawat_pengebom', label: 'Pesawat Pengebom' },
    { key: 'helikopter_serang', label: 'Helikopter Serang' },
    { key: 'pesawat_pengintai', label: 'Pesawat Pengintai' },
    { key: 'drone_intai_uav', label: 'Drone Intai UAV' },
    { key: 'drone_kamikaze', label: 'Drone Kamikaze' },
    { key: 'pesawat_angkut', label: 'Pesawat Angkut' },
  ],
};

const formatNumber = (value: unknown) => {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric.toLocaleString('id-ID') : '0';
};

const getArmadaPayload = (source: any) => {
  if (!source || typeof source !== 'object') return {};
  if (source.armada && typeof source.armada === 'object') return source.armada;
  return source;
};

const resolveQuantity = (source: any, group: ArmadaGroup, key: string, fallbackPower: number) => {
  const payload = getArmadaPayload(source);
  const block = payload[group] && typeof payload[group] === 'object' ? payload[group] : {};

  let val = 0;
  if (key === "barak") {
    const barakCount =
      Number(source?.barak ?? 0) ||
      Number(payload?.barak ?? 0) ||
      Number(block?.barak ?? 0) ||
      Number(source?.armada?.barak ?? 0) ||
      0;
    const storedInfantry =
      Number(block?.pasukan_infanteri ?? NaN) ||
      Number(payload?.[group]?.pasukan_infanteri ?? NaN) ||
      Number(payload?.pasukan_infanteri ?? NaN) ||
      Number(source?.armada?.[group]?.pasukan_infanteri ?? NaN) ||
      Number(source?.armada?.pasukan_infanteri ?? NaN) ||
      Number(source?.[group]?.pasukan_infanteri ?? NaN) ||
      Number(source?.pasukan_infanteri ?? NaN) ||
      0;

    val = storedInfantry > 0 ? storedInfantry : convertBarakToSoldiers(barakCount);
  } else {
    val =
      Number(block?.[key] ?? 0) ||
      Number(payload?.[key] ?? 0) ||
      Number(source?.[group]?.[key] ?? 0) ||
      Number(source?.armada?.[group]?.[key] ?? 0) ||
      Number(source?.[key] ?? 0) ||
      0;
  }

  // Jika nilai masih 0, hasilkan estimasi realistis berbasis skor militer (terutama untuk target NPC / data default)
  if (val === 0 && fallbackPower > 0) {
    if (key === 'barak') return Math.round(fallbackPower * 120);
    if (key === 'tank_tempur_utama') return Math.round(fallbackPower * 1.5);
    if (key === 'apc_ifv') return Math.round(fallbackPower * 4.2);
    if (key === 'artileri_berat') return Math.round(fallbackPower * 1.8);
    if (key === 'sistem_peluncur_roket') return Math.round(fallbackPower * 0.8);
    if (key === 'pertahanan_udara_mobile') return Math.round(fallbackPower * 0.6);
    if (key === 'kendaraan_taktis') return Math.round(fallbackPower * 5.0);

    if (key === 'kapal_destroyer') return Math.round(fallbackPower * 0.15);
    if (key === 'kapal_korvet') return Math.round(fallbackPower * 0.25);
    if (key === 'kapal_selam_regular') return Math.round(fallbackPower * 0.1);
    if (key === 'kapal_logistik') return Math.round(fallbackPower * 0.3);

    if (key === 'jet_tempur_siluman') return Math.round(fallbackPower * 0.2);
    if (key === 'jet_tempur_interceptor') return Math.round(fallbackPower * 0.35);
    if (key === 'pesawat_pengebom') return Math.round(fallbackPower * 0.1);
    if (key === 'helikopter_serang') return Math.round(fallbackPower * 0.4);
    if (key === 'drone_intai_uav') return Math.round(fallbackPower * 0.8);
    if (key === 'drone_kamikaze') return Math.round(fallbackPower * 1.5);
    if (key === 'pesawat_angkut') return Math.round(fallbackPower * 0.25);
  }

  return val;
};

const getGroupBreakdown = (source: any, group: ArmadaGroup, fallbackPower: number) => {
  return armadaCatalog[group].map((item) => ({
    key: item.key,
    label: item.label,
    quantity: resolveQuantity(source, group, item.key, fallbackPower),
  }));
};

export default function PerbandinganPasukan({
  attackerName,
  attackerIso = 'id',
  attackerPower,
  targetName,
  targetIso = 'un',
  targetPower,
  attackerDetail,
  targetDetail,
  onStartBattle,
  onAutoResult,
  onClose,
}: PerbandinganPasukanProps) {
  const [expandedGroup, setExpandedGroup] = useState<ArmadaGroup | null>('darat');

  const attackerSummary = attackerDetail ? getArmadaPowerSummary(attackerDetail) : null;
  const targetSummary = targetDetail ? getArmadaPowerSummary(targetDetail) : null;

  const attackerTotalPower = attackerSummary?.totals?.totalPower ?? attackerPower;
  const targetTotalPower = targetSummary?.totals?.totalPower ?? targetPower;

  // Baca konfigurasi persentase pengerahan dari Konfirmasi Serangan
  const getDeployedQuantity = (itemKey: string, rawQty: number) => {
    if (typeof window === "undefined") return 0;
    try {
      const saved = localStorage.getItem("deployed_units_config");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed[itemKey] === "number") {
          return Math.round((rawQty * parsed[itemKey]) / 100);
        }
      }
    } catch (e) {}
    return 0;
  };

  const attackerBreakdown = {
    darat: getGroupBreakdown(attackerDetail, 'darat', attackerTotalPower).map(i => ({ ...i, quantity: getDeployedQuantity(i.key, i.quantity) })),
    laut: getGroupBreakdown(attackerDetail, 'laut', attackerTotalPower).map(i => ({ ...i, quantity: getDeployedQuantity(i.key, i.quantity) })),
    udara: getGroupBreakdown(attackerDetail, 'udara', attackerTotalPower).map(i => ({ ...i, quantity: getDeployedQuantity(i.key, i.quantity) })),
  };

  // Hitung total kekuatan pasukan penyerang yang BENAR-BENAR DIKERAHKAN
  const totalDeployedAttackerUnits = [...attackerBreakdown.darat, ...attackerBreakdown.laut, ...attackerBreakdown.udara].reduce((acc, curr) => acc + curr.quantity, 0);
  const totalRawAttackerUnits = [...getGroupBreakdown(attackerDetail, 'darat', attackerTotalPower), ...getGroupBreakdown(attackerDetail, 'laut', attackerTotalPower), ...getGroupBreakdown(attackerDetail, 'udara', attackerTotalPower)].reduce((acc, curr) => acc + curr.quantity, 0);

  const deploymentRatio = totalRawAttackerUnits > 0 ? totalDeployedAttackerUnits / totalRawAttackerUnits : 0;
  const actualAttackerPower = Math.round(attackerTotalPower * deploymentRatio);

  const totalCombinedPower = Math.max(1, actualAttackerPower + targetTotalPower);
  const attackerPct = totalCombinedPower > 0 ? (actualAttackerPower / totalCombinedPower) * 100 : 50;
  const targetPct = 100 - attackerPct;

  const targetBreakdown = {
    darat: getGroupBreakdown(targetDetail, 'darat', targetTotalPower),
    laut: getGroupBreakdown(targetDetail, 'laut', targetTotalPower),
    udara: getGroupBreakdown(targetDetail, 'udara', targetTotalPower),
  };

  const groupMeta: Record<ArmadaGroup, { icon: typeof Swords; color: string; bg: string }> = {
    darat: { icon: Swords, color: 'text-rose-700', bg: 'bg-rose-100' },
    laut: { icon: Ship, color: 'text-sky-700', bg: 'bg-sky-100' },
    udara: { icon: Plane, color: 'text-indigo-700', bg: 'bg-indigo-100' },
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none font-sans select-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans animate-in fade-in zoom-in-95 duration-150 pointer-events-auto shadow-2xl text-white">
        {/* ══════════ HEADER ══════════ */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 gap-2 shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-[#0F2424] rounded-lg border border-[#00FFAA]/30 shrink-0">
                <Swords className="h-5 w-5 text-[#00FFAA] animate-pulse" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#00FFAA] tracking-wider uppercase leading-none">
                  KONFIRMASI SERANGAN
                </h3>
                <p className="text-[10px] text-[#6B8A8A] font-bold uppercase tracking-widest mt-1">
                  Analisis Operasi Tempur Intelijen Militer
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 ml-4 pl-4 border-l border-[#00FFAA]/30">
              <span className="text-xs font-black uppercase tracking-wider text-[#6B8A8A]">
                {attackerName} &rarr; {targetName}
              </span>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm"
            >
              <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* ══════════ BODY ══════════ */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 bg-[#0F2424] space-y-6 no-scrollbar">
          <div className="w-full max-w-4xl mx-auto space-y-6">
            {/* BAGIAN 1: PERBANDINGAN TOTAL KEKUATAN */}
            <div className="flex flex-col bg-[#0A1A1A] border border-[#00FFAA]/20 p-5 rounded-2xl shadow-sm gap-4">
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                {/* KARTU KIRI: PENYERANG */}
                <div className="flex-1 w-full flex flex-col items-center text-center space-y-2 p-4 rounded-xl bg-[#0F2424] border border-[#00FFAA]/20">
                  <div className="p-2.5 rounded-full bg-[#00FFAA]/10 border border-[#00FFAA]/30">
                    <Shield className="w-6 h-6 text-[#00FFAA]" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#6B8A8A]">
                    Pasukan Penyerang
                  </p>
                  <p className="text-xl font-black text-[#00FFAA] uppercase tracking-wide">
                    {attackerName}
                  </p>
                  <p className="text-xs text-[#E0E0E0]">
                    Kekuatan:{' '}
                    <span className="font-black text-[#00FFAA] font-mono">
                      {formatNumber(actualAttackerPower)}
                    </span>
                  </p>
                </div>

                {/* ELEMEN TENGAH: VS */}
                <div className="flex items-center justify-center py-2 md:py-0">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#00FFAA]/30 bg-[#0F2424] text-xl font-black text-[#00FFAA] shadow-sm">
                    VS
                  </div>
                </div>

                {/* KARTU KANAN: TARGET */}
                <div className="flex-1 w-full flex flex-col items-center text-center space-y-2 p-4 rounded-xl bg-[#0F2424] border border-rose-500/20">
                  <div className="p-2.5 rounded-full bg-rose-500/10 border border-rose-500/30">
                    <Shield className="w-6 h-6 text-rose-400" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#6B8A8A]">
                    Pasukan Target
                  </p>
                  <p className="text-xl font-black text-rose-400 uppercase tracking-wide">
                    {targetName}
                  </p>
                  <p className="text-xs text-[#E0E0E0]">
                    Kekuatan:{' '}
                    <span className="font-black text-rose-400 font-mono">
                      {formatNumber(targetTotalPower)}
                    </span>
                  </p>
                </div>
              </div>

              {/* GARIS KESEIMBANGAN PASUKAN */}
              <div className="w-full mt-2 pt-4 border-t border-[#00FFAA]/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6B8A8A]">
                      Keseimbangan Pasukan:
                    </span>
                    <span className="text-xs font-mono font-black text-[#00FFAA]">
                      {attackerPct.toFixed(1)}%
                    </span>
                    <span className="text-xs font-bold text-[#6B8A8A]">/</span>
                    <span className="text-xs font-mono font-black text-rose-400">
                      {targetPct.toFixed(1)}%
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-[#E0E0E0]">
                    {actualAttackerPower > targetTotalPower
                      ? '🟢 Unggul'
                      : actualAttackerPower < targetTotalPower
                      ? '🔴 Tertinggal'
                      : '⚖️ Seimbang'}
                  </span>
                </div>

                <div className="flex items-center gap-3 w-full">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#00FFAA]/10 border border-[#00FFAA]/30">
                    <Shield className="h-4 w-4 text-[#00FFAA]" />
                  </div>

                  <div className="flex-1 h-5 rounded-full bg-[#0F2424] overflow-hidden relative border border-[#00FFAA]/20 shadow-inner">
                    <div
                      className="absolute left-0 top-0 h-full bg-[#00FFAA] transition-all duration-700 ease-out"
                      style={{ width: `${attackerPct}%` }}
                    />
                    <div
                      className="absolute right-0 top-0 h-full bg-rose-500 transition-all duration-700 ease-out"
                      style={{ width: `${targetPct}%` }}
                    />
                    <div className="absolute left-1/2 top-0 h-full w-0.5 bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)] transform -translate-x-1/2 z-10" />
                  </div>

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-500/10 border border-rose-500/30">
                    <Shield className="h-4 w-4 text-rose-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* BAGIAN 2: PERBANDINGAN PASUKAN PER MATRA */}
            <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-5 rounded-2xl shadow-sm">
              <div className="flex flex-col gap-4">
                {(['darat', 'laut', 'udara'] as ArmadaGroup[]).map((group) => {
                  const Icon = groupMeta[group].icon;

                  return (
                    <div key={group} className="rounded-xl border border-[#00FFAA]/20 bg-[#0F2424] p-4">
                      <div className="space-y-3">
                        <div className="w-full flex items-center justify-between rounded-xl border border-[#00FFAA]/20 bg-[#0A1A1A] px-4 py-3 text-sm font-black text-[#00FFAA]">
                          <div className="flex items-center gap-3">
                            <Icon className="h-5 w-5 text-[#00FFAA]" />
                            <span className="uppercase tracking-wider">{group}</span>
                          </div>
                        </div>

                        {/* Perbandingan Pasukan Side-by-Side */}
                        <div className="flex flex-col md:flex-row md:gap-6 pt-1">
                          {/* Sisi Kiri: Penyerang */}
                          <div className="flex-1 w-full space-y-2">
                            <div className="text-[10px] font-black uppercase tracking-wider text-[#00FFAA] mb-2">Penyerang</div>
                            {attackerBreakdown[group].map((item) => (
                              <div key={item.key} className="flex items-center justify-between rounded-lg border border-[#00FFAA]/20 bg-[#0A1A1A] px-3 py-2 text-xs font-semibold text-[#E0E0E0]">
                                <span>{item.label}</span>
                                <span className="font-black text-[#00FFAA] font-mono">{formatNumber(item.quantity)}</span>
                              </div>
                            ))}
                          </div>

                          <div className="hidden md:block w-[1px] self-stretch bg-[#00FFAA]/20 rounded-full" />

                          {/* Sisi Kanan: Target */}
                          <div className="flex-1 w-full space-y-2">
                            <div className="text-[10px] font-black uppercase tracking-wider text-rose-400 mb-2">Target</div>
                            {targetBreakdown[group].map((item) => (
                              <div key={item.key} className="flex items-center justify-between rounded-lg border border-[#00FFAA]/20 bg-[#0A1A1A] px-3 py-2 text-xs font-semibold text-[#E0E0E0]">
                                <span>{item.label}</span>
                                <span className="font-black text-rose-400 font-mono">{formatNumber(item.quantity)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ══════════ FOOTER ACTION BUTTONS ══════════ */}
        <div className="px-6 py-4 border-t border-[#00FFAA]/30 bg-[#0A1A1A] shrink-0 flex items-center justify-end gap-3">
          <button
            onClick={onStartBattle}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-[#00FFAA] to-[#00CC88] hover:from-[#00FFBB] hover:to-[#00DD99] text-[#050B0B] font-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-[0_0_20px_rgba(0,255,170,0.3)] active:scale-95"
          >
            <Play className="h-4 w-4 fill-current" />
            Mulai Perang
          </button>

          <button
            onClick={onAutoResult}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#0F2424] hover:bg-[#142E2E] border-2 border-[#FFEB3B]/60 hover:border-[#FFEB3B] text-[#FFEB3B] font-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-[0_0_15px_rgba(255,235,59,0.2)] active:scale-95"
          >
            <Zap className="h-4 w-4 fill-current text-[#FFEB3B]" />
            Hasil Otomatis
          </button>
        </div>
      </div>
    </div>
  );
}

