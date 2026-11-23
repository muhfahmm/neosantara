'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import {
  Swords,
  Shield,
  Ship,
  Plane,
  Zap,
} from 'lucide-react';
import { getArmadaPowerSummary } from '@/app/page/navigasi_menu/2_navigasi_bawah/6_pertahanan/4_armada/logic/armadaLogic';
import { convertBarakToSoldiers } from '@/app/page/navigasi_menu/2_navigasi_bawah/6_pertahanan/4_armada/logic/1_barak_logic';
import { getLocalizedCountryName } from '@/app/logic/countryNameLogic';
import { useLanguage } from '@/app/page/paused_menu/terjemahan_paused_menu/languageLogic';
import { estimateBattleWinProbability } from './war_algoritm/battleEngine';

interface PerbandinganPasukanProps {
  attackerName: string;
  attackerIso?: string;
  attackerPower: number;
  targetName: string;
  targetIso?: string;
  targetPower: number;
  attackerPowerOverride?: number;
  attackerDeploymentPercent?: number;
  attackerDetail?: unknown;
  targetDetail?: unknown;
  isUserAttacker?: boolean;
  isUserDefender?: boolean;
  isCoalitionForce?: boolean;
  requestedInvasion?: boolean;
  targetCityIsCapital?: boolean;
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

const formatNumber = (value: unknown, locale: string) => {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric.toLocaleString(locale, { maximumFractionDigits: 2 }) : '0';
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

function WinProbabilityPanel({
  attackerPower,
  targetPower,
  requestedInvasion,
  targetCityIsCapital,
  isUserDefender,
  userCountryName,
  opponentCountryName,
}: {
  attackerPower: number;
  targetPower: number;
  requestedInvasion: boolean;
  targetCityIsCapital?: boolean;
  isUserDefender: boolean;
  userCountryName: string;
  opponentCountryName: string;
}) {
  const { t } = useLanguage();
  const tr = (key: string, params?: Record<string, string | number>) =>
    t(`navigation_defense_attack.${key}`, params);
  const winProbability = React.useMemo(
    () => estimateBattleWinProbability({
      attackerPower,
      targetPower,
      requestedInvasion,
      targetCityIsCapital,
    }),
    [attackerPower, targetPower, requestedInvasion, targetCityIsCapital],
  );
  const userWinPct = isUserDefender
    ? winProbability.targetWinPct
    : winProbability.attackerWinPct;
  const opponentWinPct = isUserDefender
    ? winProbability.attackerWinPct
    : winProbability.targetWinPct;

  return (
    <div className="mt-5 rounded-xl border border-root-accent/20 bg-root-surface/70 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-root-subtle">
          {tr('analysis.winProbability.title')}
        </span>
        <span className="text-[10px] font-semibold text-root-subtle">
          {tr('analysis.winProbability.simulations', { count: winProbability.simulations })}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="rounded-lg border border-root-accent/20 bg-root-canvas px-3 py-2">
          <p className="text-[10px] font-bold text-root-subtle">
            {tr('analysis.winProbability.user', { country: userCountryName })}
          </p>
          <p className="font-mono text-lg font-black text-root-accent">
            {userWinPct.toFixed(1)}%
          </p>
        </div>
        <div className="rounded-lg border border-rose-500/20 bg-root-canvas px-3 py-2">
          <p className="text-[10px] font-bold text-root-subtle">
            {tr('analysis.winProbability.opponent', { country: opponentCountryName })}
          </p>
          <p className="font-mono text-lg font-black text-rose-400">
            {opponentWinPct.toFixed(1)}%
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-root-canvas px-3 py-2">
          <p className="text-[10px] font-bold text-root-subtle">
            {tr('analysis.winProbability.draw')}
          </p>
          <p className="font-mono text-lg font-black text-root-text">
            {winProbability.drawPct.toFixed(1)}%
          </p>
        </div>
      </div>
      <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-root-canvas">
        <div className="bg-root-accent" style={{ width: `${userWinPct}%` }} />
        <div className="bg-rose-500" style={{ width: `${opponentWinPct}%` }} />
        <div className="bg-white/35" style={{ width: `${winProbability.drawPct}%` }} />
      </div>
      {winProbability.isBalanced && (
        <p className="mt-3 text-center text-[10px] font-bold text-amber-300">
          {tr('analysis.winProbability.balanced')}
        </p>
      )}
    </div>
  );
}

export default function PerbandinganPasukan({
  attackerName,
  targetName,
  attackerDetail,
  targetDetail,
  attackerDeploymentPercent,
  isUserDefender = false,
  isUserAttacker = false,
  isCoalitionForce = false,
  requestedInvasion = false,
  targetCityIsCapital,
  onAutoResult,
}: PerbandinganPasukanProps) {
  const { t, language } = useLanguage();
  const tr = (key: string, params?: Record<string, string | number>) =>
    t(`navigation_defense_attack.${key}`, params);
  const localizedAttackerName = getLocalizedCountryName(attackerName, language);
  const localizedTargetName = getLocalizedCountryName(targetName, language);

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
      quantity: typeof attackerDeploymentPercent === 'number'
        ? Math.round(i.quantity * attackerDeploymentPercent / 100)
        : isUserDefender || isCoalitionForce ? i.quantity : getDeployedQuantity(i.key, i.quantity)
    })),
    laut: getGroupBreakdown(attackerDetail, 'laut').map(i => ({
      ...i,
      quantity: typeof attackerDeploymentPercent === 'number'
        ? Math.round(i.quantity * attackerDeploymentPercent / 100)
        : isUserDefender || isCoalitionForce ? i.quantity : getDeployedQuantity(i.key, i.quantity)
    })),
    udara: getGroupBreakdown(attackerDetail, 'udara').map(i => ({
      ...i,
      quantity: typeof attackerDeploymentPercent === 'number'
        ? Math.round(i.quantity * attackerDeploymentPercent / 100)
        : isUserDefender || isCoalitionForce ? i.quantity : getDeployedQuantity(i.key, i.quantity)
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

  const actualAttackerPower = attackerDeployedPower;
  const actualTargetPower = targetDeployedPower;

  const totalCombinedPower = actualAttackerPower + actualTargetPower;
  const attackerPct = totalCombinedPower > 0
    ? (actualAttackerPower / totalCombinedPower) * 100
    : 50;
  const targetPct = 100 - attackerPct;
  const userCountryName = isUserDefender ? localizedTargetName : localizedAttackerName;
  const opponentCountryName = isUserDefender ? localizedAttackerName : localizedTargetName;

  const groupMeta: Record<ArmadaGroup, { icon: typeof Swords; color: string; bg: string }> = {
    darat: { icon: Swords, color: 'text-rose-700', bg: 'bg-rose-100' },
    laut: { icon: Ship, color: 'text-sky-700', bg: 'bg-sky-100' },
    udara: { icon: Plane, color: 'text-indigo-700', bg: 'bg-indigo-100' },
  };

  const analysisContent = (
    <div className="fixed inset-0 z-[10000000001] bg-[#050B0B] flex flex-col w-screen h-screen font-sans select-none overflow-hidden animate-[warFadeIn_0.3s_ease-out] text-white">
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
      <div className="relative z-10 flex flex-col w-full h-full min-h-0">
        {/* ══════════ HEADER ══════════ */}
        <div className="px-6 sm:px-10 py-3.5 sm:py-4 border-b border-root-accent/20 flex items-center justify-between bg-root-canvas shrink-0 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-root-surface rounded-lg border border-root-accent/30 shrink-0">
                <Swords className="h-5 w-5 text-root-accent animate-pulse" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-root-accent tracking-wider uppercase leading-none">
                  {tr("analysis.title")}
                </h3>
                <p className="text-[10px] text-root-subtle font-bold uppercase tracking-widest mt-1">
                  {tr("analysis.subtitle")}
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 ml-4 pl-4 border-l border-root-accent/30">
              <span className="text-xs font-black uppercase tracking-wider text-root-subtle">
                {localizedAttackerName} &rarr; {localizedTargetName}
              </span>
            </div>
          </div>
        </div>

        {/* ══════════ BODY ══════════ */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#071313] space-y-6 custom-scrollbar">
          <div className="w-full max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto space-y-6">
            {/* BAGIAN 1: PERBANDINGAN TOTAL KEKUATAN */}
            <div className="flex flex-col bg-root-canvas border border-root-accent/20 p-5 rounded-2xl shadow-sm gap-4">
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                {/* KARTU KIRI: PENYERANG */}
                <div className="flex-1 w-full flex flex-col items-center text-center space-y-2 p-4 rounded-xl bg-root-surface border border-root-accent/20">
                  <div className="p-2.5 rounded-full bg-root-accent/10 border border-root-accent/30">
                    <Shield className="w-6 h-6 text-root-accent" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-root-subtle">
                    {isCoalitionForce
                      ? isUserAttacker ? tr("analysis.attackerYou") : tr("analysis.coalition")
                      : isUserDefender ? tr("analysis.attackerAI") : tr("analysis.attackerYou")}
                  </p>
                  <p className="text-xl font-black text-root-accent uppercase tracking-wide">
                    {localizedAttackerName}
                  </p>
                  <p className="text-xs text-root-text">
                    {tr("analysis.carriedPower")}{' '}
                    <span className="font-black text-root-accent font-mono">
                      {formatNumber(actualAttackerPower, language)}
                    </span>
                  </p>
                </div>

                {/* ELEMEN TENGAH: VS */}
                <div className="flex items-center justify-center py-2 md:py-0">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-root-accent/30 bg-root-surface text-xl font-black text-root-accent shadow-sm">
                    VS
                  </div>
                </div>

                {/* KARTU KANAN: TARGET */}
                <div className="flex-1 w-full flex flex-col items-center text-center space-y-2 p-4 rounded-xl bg-root-surface border border-rose-500/20">
                  <div className="p-2.5 rounded-full bg-rose-500/10 border border-rose-500/30">
                    <Shield className="w-6 h-6 text-rose-400" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-root-subtle">
                    {isCoalitionForce
                      ? isUserDefender
                        ? tr("analysis.targetYou")
                        : tr("analysis.targetCountry", { country: localizedTargetName })
                      : isUserDefender
                        ? tr("analysis.defenderYou")
                        : tr("analysis.targetEnemy")}
                  </p>
                  <p className="text-xl font-black text-rose-400 uppercase tracking-wide">
                    {localizedTargetName}
                  </p>
                  <p className="text-xs text-root-text">
                    {tr("analysis.carriedPower")}{' '}
                    <span className="font-black text-rose-400 font-mono">
                      {formatNumber(actualTargetPower, language)}
                    </span>
                  </p>
                </div>
              </div>

              {/* GARIS KESEIMBANGAN PASUKAN */}
              <div className="w-full mt-2 pt-4 border-t border-root-accent/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-root-subtle">
                      {tr("analysis.balance")}
                    </span>
                    <span className="text-xs font-mono font-black text-root-accent">
                      {attackerPct.toFixed(1)}%
                    </span>
                    <span className="text-xs font-bold text-root-subtle">/</span>
                    <span className="text-xs font-mono font-black text-rose-400">
                      {targetPct.toFixed(1)}%
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-root-text">
                    {isUserDefender
                      ? actualTargetPower > actualAttackerPower
                        ? tr("analysis.defenseSuperior")
                        : actualTargetPower < actualAttackerPower
                          ? tr("analysis.defenseThreatened")
                          : tr("analysis.balanced")
                      : actualAttackerPower > actualTargetPower
                        ? tr("analysis.superior")
                        : actualAttackerPower < actualTargetPower
                          ? tr("analysis.behind")
                          : tr("analysis.balanced")}
                  </span>
                </div>

                <div className="flex items-center gap-3 w-full">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-root-accent/10 border border-root-accent/30">
                    <Shield className="h-4 w-4 text-root-accent" />
                  </div>

                  <div className="flex-1 h-5 rounded-full bg-root-surface overflow-hidden relative border border-root-accent/20 shadow-inner">
                    <div
                      className="absolute left-0 top-0 h-full bg-root-accent transition-all duration-700 ease-out"
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
                {!isCoalitionForce && (isUserAttacker || isUserDefender) && (
                  <WinProbabilityPanel
                    attackerPower={actualAttackerPower}
                    targetPower={actualTargetPower}
                    requestedInvasion={requestedInvasion}
                    targetCityIsCapital={targetCityIsCapital}
                    isUserDefender={isUserDefender}
                    userCountryName={userCountryName}
                    opponentCountryName={opponentCountryName}
                  />
                )}
              </div>
            </div>

            {/* BAGIAN 2: PERBANDINGAN PASUKAN PER MATRA */}
            <div className="bg-root-canvas border border-root-accent/20 p-5 rounded-2xl shadow-sm">
              <div className="flex flex-col gap-4">
                {(['darat', 'laut', 'udara'] as ArmadaGroup[]).map((group) => {
                  const Icon = groupMeta[group].icon;
                  const groupLabel = tr(`groups.${group}`);

                  return (
                    <div key={group} className="rounded-xl border border-root-accent/20 bg-root-surface p-4">
                      <div className="space-y-3">
                        <div className="w-full flex items-center justify-between rounded-xl border border-root-accent/20 bg-root-canvas px-4 py-3 text-sm font-black text-root-accent">
                          <div className="flex items-center gap-3">
                            <Icon className="h-5 w-5 text-root-accent" />
                            <span className="uppercase tracking-wider">{groupLabel}</span>
                          </div>
                        </div>

                        {/* Perbandingan Pasukan Side-by-Side */}
                        <div className="flex flex-col md:flex-row md:gap-6 pt-1">
                          {/* Sisi Kiri: Penyerang */}
                          <div className="flex-1 w-full space-y-2">
                            <div className="text-[10px] font-black uppercase tracking-wider text-root-accent mb-2">{tr("analysis.attacker")}</div>
                            {attackerBreakdown[group].map((item) => (
                              <div key={item.key} className="flex items-center justify-between rounded-lg border border-root-accent/20 bg-root-canvas px-3 py-2 text-xs font-semibold text-root-text">
                                <span>{tr(`units.${item.key}`)}</span>
                                <span className="font-black text-root-accent font-mono">{formatNumber(item.quantity, language)}</span>
                              </div>
                            ))}
                          </div>

                          <div className="hidden md:block w-[1px] self-stretch bg-root-accent/20 rounded-full" />

                          {/* Sisi Kanan: Target */}
                          <div className="flex-1 w-full space-y-2">
                            <div className="text-[10px] font-black uppercase tracking-wider text-rose-400 mb-2">{tr("analysis.target")}</div>
                            {targetBreakdown[group].map((item) => (
                              <div key={item.key} className="flex items-center justify-between rounded-lg border border-root-accent/20 bg-root-canvas px-3 py-2 text-xs font-semibold text-root-text">
                                <span>{tr(`units.${item.key}`)}</span>
                                <span className="font-black text-rose-400 font-mono">{formatNumber(item.quantity, language)}</span>
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
        <div className="px-6 py-4 border-t border-root-accent/30 bg-root-canvas shrink-0 flex items-center justify-end gap-3">
          <button
            onClick={onAutoResult}
            className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-root-surface hover:bg-[#142E2E] border-2 border-[#FFEB3B]/60 hover:border-[#FFEB3B] text-[#FFEB3B] font-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-[0_0_15px_rgba(255,235,59,0.2)] active:scale-95"
          >
            <Zap className="h-4 w-4 fill-current text-[#FFEB3B]" />
            {tr("analysis.automaticResult")}
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(analysisContent, document.body)
    : analysisContent;
}