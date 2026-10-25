'use client';

import React from 'react';
import {
  Swords,
  Shield,
  Ship,
  Plane,
  Zap,
  Play,
} from 'lucide-react';
import { getArmadaPowerSummary } from '@/app/page/navigasi_menu/2_navigasi_bawah/6_pertahanan/4_armada/logic/armadaLogic';
import { convertBarakToSoldiers } from '@/app/page/navigasi_menu/2_navigasi_bawah/6_pertahanan/4_armada/logic/1_barak_logic';
import { getActiveSectorImpacts } from '@/app/page/navigasi_menu/2_navigasi_bawah/9_kementrian/1_pemberantasan_korupsi/logic/corruptionLogic';

interface PerbandinganPasukanProps {
  attackerName: string;
  attackerIso?: string;
  attackerPower: number;
  targetName: string;
  targetIso?: string;
  targetPower: number;
  attackerPowerOverride?: number;
  attackerDetail?: unknown;
  targetDetail?: unknown;
  isUserAttacker?: boolean;
  isUserDefender?: boolean;
  isCoalitionForce?: boolean;
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
  return Number.isFinite(numeric) ? numeric.toLocaleString('id-ID', { maximumFractionDigits: 2 }) : '0';
};

const asRecord = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};

const firstPositive = (...values: unknown[]): number =>
  values.map(Number).find((value) => Number.isFinite(value) && value > 0) ?? 0;

const getArmadaPayload = (source: unknown) => {
  const record = asRecord(source);
  const armada = asRecord(record.armada);
  return Object.keys(armada).length > 0 ? armada : record;
};

const resolveQuantity = (source: unknown, group: ArmadaGroup, key: string) => {
  const payload = getArmadaPayload(source);
  const sourceRecord = asRecord(source);
  const sourceArmada = asRecord(sourceRecord.armada);
  const block = asRecord(payload[group]);
  if (key === "barak") {
    const storedInfantry = firstPositive(
      block.pasukan_infanteri,
      asRecord(payload[group]).pasukan_infanteri,
      payload.pasukan_infanteri,
      asRecord(sourceArmada[group]).pasukan_infanteri,
      sourceArmada.pasukan_infanteri,
      asRecord(sourceRecord[group]).pasukan_infanteri,
      sourceRecord.pasukan_infanteri,
    );
    const barakCount = firstPositive(
      sourceRecord.barak,
      payload.barak,
      block.barak,
    );
    return storedInfantry > 0 ? storedInfantry : convertBarakToSoldiers(barakCount);
  }

  return firstPositive(
    block[key],
    payload[key],
    asRecord(sourceRecord[group])[key],
    asRecord(sourceArmada[group])[key],
    sourceRecord[key],
  );
};

const getGroupBreakdown = (source: unknown, group: ArmadaGroup) => {
  return armadaCatalog[group].map((item) => ({
    key: item.key,
    label: item.label,
    quantity: resolveQuantity(source, group, item.key),
  }));
};

type DeployedBreakdown = Record<ArmadaGroup, ReturnType<typeof getGroupBreakdown>>;

const getDeployedMilitaryPower = (
  breakdown: DeployedBreakdown,
  summary: ReturnType<typeof getArmadaPowerSummary> | null,
) =>
  (Object.values(breakdown).flat() as DeployedBreakdown[ArmadaGroup][number][]).reduce(
    (total, unit) => {
      const dataKey = unit.key === 'barak' ? 'pasukan_infanteri' : unit.key;
      const powerData = summary?.breakdown.find((item) => item.dataKey === dataKey);
      const powerPerUnit = powerData
        ? powerData.quantity > 0
          ? powerData.totalPower / powerData.quantity
          : powerData.powerPerUnit
        : 1;

      return total + unit.quantity * powerPerUnit;
    },
    0,
  );

export default function PerbandinganPasukan({
  attackerName,
  targetName,
  attackerDetail,
  targetDetail,
  isUserDefender = false,
  isCoalitionForce = false,
  onStartBattle,
  onAutoResult,
}: PerbandinganPasukanProps) {
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pause_game_time', { detail: { source: 'war' } }));
    }
  }, []);

  const attackerSummary = attackerDetail ? getArmadaPowerSummary(attackerDetail) : null;
  const targetSummary = targetDetail ? getArmadaPowerSummary(targetDetail) : null;

  const deploymentConfig = (() => {
    if (typeof window === 'undefined') return {};
    try {
      const savedConfig = window.localStorage.getItem('deployed_units_config');
      if (!savedConfig) return {};
      const parsed: unknown = JSON.parse(savedConfig);
      return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
        ? parsed as Record<string, unknown>
        : {};
    } catch (error) {
      console.error('Gagal membaca konfigurasi pengerahan unit.', error);
      return {};
    }
  })();

  const hasDeploymentConfig = Object.values(deploymentConfig).some(
    (value) => typeof value === 'number',
  );
  const getDeployedQuantity = (itemKey: string, rawQty: number) => {
    if (!hasDeploymentConfig) return rawQty;
    const deployedPercent = deploymentConfig[itemKey];
    return typeof deployedPercent === 'number'
      ? Math.round((rawQty * deployedPercent) / 100)
      : 0;
  };

  const attackerBreakdown = {
    darat: getGroupBreakdown(attackerDetail, 'darat').map(i => ({
      ...i,
      quantity: isUserDefender || isCoalitionForce ? i.quantity : getDeployedQuantity(i.key, i.quantity)
    })),
    laut: getGroupBreakdown(attackerDetail, 'laut').map(i => ({
      ...i,
      quantity: isUserDefender || isCoalitionForce ? i.quantity : getDeployedQuantity(i.key, i.quantity)
    })),
    udara: getGroupBreakdown(attackerDetail, 'udara').map(i => ({
      ...i,
      quantity: isUserDefender || isCoalitionForce ? i.quantity : getDeployedQuantity(i.key, i.quantity)
    })),
  };

  const targetBreakdown = {
    darat: getGroupBreakdown(targetDetail, 'darat').map(i => ({
      ...i,
      quantity: isUserDefender ? getDeployedQuantity(i.key, i.quantity) : i.quantity
    })),
    laut: getGroupBreakdown(targetDetail, 'laut').map(i => ({
      ...i,
      quantity: isUserDefender ? getDeployedQuantity(i.key, i.quantity) : i.quantity
    })),
    udara: getGroupBreakdown(targetDetail, 'udara').map(i => ({
      ...i,
      quantity: isUserDefender ? getDeployedQuantity(i.key, i.quantity) : i.quantity
    })),
  };

  const attackerDeployedPower = getDeployedMilitaryPower(attackerBreakdown, attackerSummary);
  const targetDeployedPower = getDeployedMilitaryPower(targetBreakdown, targetSummary);

  const playerMilitaryLoss = getActiveSectorImpacts(
    asRecord(isUserDefender ? targetDetail : attackerDetail),
  ).militaryEffectivenessLossPercent;
  const actualAttackerPower = Math.round(
    attackerDeployedPower * (isUserDefender ? 1 : 1 - playerMilitaryLoss / 100),
  );
  const actualTargetPower = Math.round(
    targetDeployedPower * (isUserDefender ? 1 - playerMilitaryLoss / 100 : 1),
  );

  const totalCombinedPower = actualAttackerPower + actualTargetPower;
  const attackerPct = totalCombinedPower > 0
    ? (actualAttackerPower / totalCombinedPower) * 100
    : 50;
  const targetPct = 100 - attackerPct;

  const groupMeta: Record<ArmadaGroup, { icon: typeof Swords; color: string; bg: string }> = {
    darat: { icon: Swords, color: 'text-rose-700', bg: 'bg-rose-100' },
    laut: { icon: Ship, color: 'text-sky-700', bg: 'bg-sky-100' },
    udara: { icon: Plane, color: 'text-indigo-700', bg: 'bg-indigo-100' },
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#050B0B] flex flex-col w-screen h-screen font-sans select-none overflow-hidden animate-[warFadeIn_0.3s_ease-out] text-white">
      {/* ══════════ BACKGROUND GRID & GLOW FX ══════════ */}
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#00FFAA 1px, transparent 1px), linear-gradient(90deg, #00FFAA 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,170,0.08),transparent_70%)] pointer-events-none" />

      {/* ══════════ FULL MENU CONTAINER ══════════ */}
      <div className="relative z-10 flex flex-col w-full h-full">
        {/* ══════════ HEADER ══════════ */}
        <div className="px-6 sm:px-10 py-3.5 sm:py-4 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] shrink-0 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-[#0F2424] rounded-lg border border-[#00FFAA]/30 shrink-0">
                <Swords className="h-5 w-5 text-[#00FFAA] animate-pulse" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#00FFAA] tracking-wider uppercase leading-none">
                  ANALISIS PERTAHANAN & PERTEMPURAN
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
        </div>

        {/* ══════════ BODY ══════════ */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#071313] space-y-6 custom-scrollbar">
          <div className="w-full max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto space-y-6">
            {/* BAGIAN 1: PERBANDINGAN TOTAL KEKUATAN */}
            <div className="flex flex-col bg-[#0A1A1A] border border-[#00FFAA]/20 p-5 rounded-2xl shadow-sm gap-4">
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                {/* KARTU KIRI: PENYERANG */}
                <div className="flex-1 w-full flex flex-col items-center text-center space-y-2 p-4 rounded-xl bg-[#0F2424] border border-[#00FFAA]/20">
                  <div className="p-2.5 rounded-full bg-[#00FFAA]/10 border border-[#00FFAA]/30">
                    <Shield className="w-6 h-6 text-[#00FFAA]" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#6B8A8A]">
                    {isCoalitionForce
                      ? "Pasukan Gabungan PBB"
                      : isUserDefender ? "Pasukan Agresor (Musuh)" : "Pasukan Penyerang (Anda)"}
                  </p>
                  <p className="text-xl font-black text-[#00FFAA] uppercase tracking-wide">
                    {attackerName}
                  </p>
                  <p className="text-xs text-[#E0E0E0]">
                    Kekuatan pasukan dibawa:{' '}
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
                    {isCoalitionForce
                      ? `Pasukan Target (${targetName})`
                      : isUserDefender ? "Pasukan Pertahanan (Anda)" : "Pasukan Target (Musuh)"}
                  </p>
                  <p className="text-xl font-black text-rose-400 uppercase tracking-wide">
                    {targetName}
                  </p>
                  <p className="text-xs text-[#E0E0E0]">
                    Kekuatan pasukan dibawa:{' '}
                    <span className="font-black text-rose-400 font-mono">
                      {formatNumber(actualTargetPower)}
                    </span>
                  </p>
                </div>
              </div>

              {/* GARIS KESEIMBANGAN PASUKAN */}
              <div className="w-full mt-2 pt-4 border-t border-[#00FFAA]/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6B8A8A]">
                      Keseimbangan Pasukan yang Dikerahkan:
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
                    {isUserDefender
                      ? (actualTargetPower > actualAttackerPower ? '🟢 Pertahanan Unggul' : actualTargetPower < actualAttackerPower ? '🔴 Pertahanan Terancam' : '⚖️ Seimbang')
                      : (actualAttackerPower > actualTargetPower ? '🟢 Unggul' : actualAttackerPower < actualTargetPower ? '🔴 Tertinggal' : '⚖️ Seimbang')}
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
