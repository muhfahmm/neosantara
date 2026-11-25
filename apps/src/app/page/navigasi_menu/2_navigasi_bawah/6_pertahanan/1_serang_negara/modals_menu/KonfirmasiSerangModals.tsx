"use client"
import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X, Swords, Shield, Ship, Plane, ChevronDown, ChevronUp, AlertTriangle, ShieldAlert } from "lucide-react";
import { getArmadaPowerSummary } from "../../4_armada/logic/armadaLogic";
import { convertBarakToSoldiers } from "../../4_armada/logic/1_barak_logic";
import { getActivePlayerAttack, type PlayerAttackStatus } from "./playerAttackStatus";
import TravelFuelCostPanel from "../../../3_produksi_konsumsi/fuelLogic/TravelFuelCostPanel";
import type { TravelFuelStatus } from "../../../3_produksi_konsumsi/fuelLogic/travelFuelLogic";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";
import { loadActiveResolutions } from "@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/1_resolusi_PBB/logic/resolusiPBBUILogic";
import { loadActiveSecurityCouncilItems } from "@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/2_keamanan_PBB/logic/keamananPBBUILogic";

interface SerangModalsProps {
  isOpen: boolean;
  onClose: () => void;
  targetCountry: any;
  countryDetail: any;
  onConfirm: (deploymentConfig: Record<string, number>) => void;
  onAttackBlocked: (status: PlayerAttackStatus, requestedTarget: string) => void;
  travelFuelStatus: TravelFuelStatus;
  mode?: "serang" | "bantuan_militer";
  customTitle?: string;
  customConfirmLabel?: string;
}

type ArmadaGroup = "darat" | "laut" | "udara";

// 🔥 Katalog alutsista (Data User - Ditulis eksplisit di sini)
const armadaCatalog: Record<ArmadaGroup, Array<{ key: string; label: string }>> = {
  darat: [
    { key: "barak", label: "Pasukan Infanteri" },
    { key: "tank_tempur_utama", label: "Tank Tempur Utama" },
    { key: "apc_ifv", label: "APC / IFV" },
    { key: "artileri_berat", label: "Artileri Berat" },
    { key: "sistem_peluncur_roket", label: "Sistem Peluncur Roket" },
    { key: "pertahanan_udara_mobile", label: "Pertahanan Udara Mobile" },
    { key: "kendaraan_taktis", label: "Kendaraan Taktis" },
  ],
  laut: [
    { key: "kapal_induk", label: "Kapal Induk" },
    { key: "kapal_induk_nuklir", label: "Kapal Induk Nuklir" },
    { key: "kapal_destroyer", label: "Kapal Destroyer" },
    { key: "kapal_korvet", label: "Kapal Korvet" },
    { key: "kapal_selam_nuklir", label: "Kapal Selam Nuklir" },
    { key: "kapal_selam_regular", label: "Kapal Selam Reguler" },
    { key: "kapal_ranjau", label: "Kapal Ranjau" },
    { key: "kapal_logistik", label: "Kapal Logistik" },
  ],
  udara: [
    { key: "jet_tempur_siluman", label: "Jet Tempur Siluman" },
    { key: "jet_tempur_interceptor", label: "Jet Tempur Interceptor" },
    { key: "pesawat_pengebom", label: "Pesawat Pengebom" },
    { key: "helikopter_serang", label: "Helikopter Serang" },
    { key: "pesawat_pengintai", label: "Pesawat Pengintai" },
    { key: "drone_intai_uav", label: "Drone Intai UAV" },
    { key: "drone_kamikaze", label: "Drone Kamikaze" },
    { key: "pesawat_angkut", label: "Pesawat Angkut" },
  ],
};

const deploymentUnitKeys = Object.values(armadaCatalog).flatMap((units) =>
  units.map(({ key }) => key)
);

const formatNumber = (value: unknown, locale: string) => {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric.toLocaleString(locale, { maximumFractionDigits: 0 }) : "0";
};

const getArmadaPayload = (source: any) => {
  if (!source || typeof source !== "object") return {};
  if (source.armada && typeof source.armada === "object") return source.armada;
  return source;
};

const firstAvailableQuantity = (...values: unknown[]): number | undefined => {
  for (const value of values) {
    if (value === null || value === undefined || value === "") continue;
    const quantity = Number(value);
    if (Number.isFinite(quantity)) return Math.max(0, quantity);
  }
  return undefined;
};

const resolveQuantity = (source: any, group: ArmadaGroup, key: string) => {
  const payload = getArmadaPayload(source);
  const block = payload[group] && typeof payload[group] === "object" ? payload[group] : {};

  if (key === "barak") {
    const storedInfantry = firstAvailableQuantity(
      block?.pasukan_infanteri,
      payload?.pasukan_infanteri,
      source?.armada?.pasukan_infanteri,
      source?.[group]?.pasukan_infanteri,
      source?.pasukan_infanteri,
    );
    if (storedInfantry !== undefined && storedInfantry > 0) return storedInfantry;

    const barakCount = firstAvailableQuantity(
      block?.barak,
      payload?.barak,
      source?.armada?.barak,
      source?.barak,
    ) ?? 0;
    return storedInfantry === 0 ? 0 : convertBarakToSoldiers(barakCount);
  }

  return firstAvailableQuantity(
    block?.[key],
    payload?.[key],
    source?.armada?.[group]?.[key],
    source?.[group]?.[key],
    source?.[key],
  ) ?? 0;
};

const getGroupBreakdown = (source: any, group: ArmadaGroup) => {
  return armadaCatalog[group].map((item) => ({
    key: item.key,
    label: item.label,
    quantity: resolveQuantity(source, group, item.key),
  }));
};

export default function SerangModals({
  isOpen,
  onClose,
  targetCountry,
  countryDetail,
  onConfirm,
  onAttackBlocked,
  travelFuelStatus,
  mode = "serang",
  customTitle,
  customConfirmLabel,
}: SerangModalsProps) {
  const { t, language } = useLanguage();
  const tr = (key: string, params?: Record<string, string | number>) =>
    t(`navigation_defense_attack.${key}`, params);
  const isMilitaryAid = mode === "bantuan_militer";
  const displayTitle = customTitle || (isMilitaryAid ? (tr("deployment.militaryAidTitle") || "KONFIRMASI BANTUAN MILITER") : tr("deployment.title"));
  const displayConfirmLabel = customConfirmLabel || (isMilitaryAid ? (tr("deployment.militaryAidConfirm") || "KIRIM BANTUAN MILITER") : tr("deployment.confirm"));
  const [deploymentPct, setDeploymentPct] = useState<Record<string, number>>({});

  React.useEffect(() => {
    if (!isOpen || typeof window === "undefined") return;
    try {
      const initialDeployment = Object.fromEntries(
        deploymentUnitKeys.map((key) => [key, 0])
      );
      setDeploymentPct(initialDeployment);
      localStorage.setItem("deployed_units_config", JSON.stringify(initialDeployment));
    } catch (error) {
      console.error("Gagal menginisialisasi konfigurasi pengerahan unit.", error);
    }
  }, [isOpen]);

  if (!isOpen || !targetCountry) return null;

  const targetSource = targetCountry?.payload || targetCountry;
  const attackerName = countryDetail?.country || countryDetail?.nama_negara || countryDetail?.name_id || countryDetail?.name_en || tr("fallback.yourCountry");
  const targetName = targetCountry?.countryName ||
    targetCountry?.payload?.countryName ||
    targetSource?.country ||
    targetSource?.nama_negara ||
    targetSource?.name_id ||
    targetSource?.name_en ||
    tr("fallback.target");
  const handleConfirm = () => {
    const activeAttack = getActivePlayerAttack();
    if (activeAttack) {
      onAttackBlocked(activeAttack, targetName);
      onClose();
      return;
    }
    onConfirm(deploymentPct);
  };

  const attackerSummary = getArmadaPowerSummary(countryDetail);
  const targetSummary = getArmadaPowerSummary(targetSource);

  const attackerStats = {
    darat: attackerSummary.totals.groups.darat?.power ?? 0,
    laut: attackerSummary.totals.groups.laut?.power ?? 0,
    udara: attackerSummary.totals.groups.udara?.power ?? 0,
  };
  const targetStats = {
    darat: targetSummary.totals.groups.darat?.power ?? 0,
    laut: targetSummary.totals.groups.laut?.power ?? 0,
    udara: targetSummary.totals.groups.udara?.power ?? 0,
  };

  // Status Resolusi & Mandat PBB (Informatif, tanpa memblokir serangan)
  const normTarget = String(targetName).trim().toLowerCase();
  const activePbbResolutions = loadActiveResolutions();
  const activeSecurityItems = loadActiveSecurityCouncilItems();
  const targetEmbargoResolution = activePbbResolutions.find(r =>
    (r.type === 'economic_embargo' || r.type === 'arms_embargo') &&
    String(r.target?.name || '').trim().toLowerCase() === normTarget
  );
  const invasionMandateItem = activeSecurityItems.find(item =>
    item.type === 'military' &&
    String(item.target?.name || '').trim().toLowerCase() === normTarget &&
    item.status === 'passed'
  );
  const hasInvasionMandate = Boolean(invasionMandateItem);

  const handlePctChange = (key: string, val: number) => {
    const next = { ...deploymentPct, [key]: val };
    setDeploymentPct(next);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("deployed_units_config", JSON.stringify(next));
      } catch (e) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[KonfirmasiSerang] Gagal menyimpan deployed_units_config:', e);
        }
      }
    }
  };

  const attackerBreakdown = {
    darat: getGroupBreakdown(countryDetail, "darat"),
    laut: getGroupBreakdown(countryDetail, "laut"),
    udara: getGroupBreakdown(countryDetail, "udara"),
  };
  const targetBreakdown = {
    darat: getGroupBreakdown(targetSource, "darat"),
    laut: getGroupBreakdown(targetSource, "laut"),
    udara: getGroupBreakdown(targetSource, "udara"),
  };

  const attackerTotalPower = attackerSummary.totals.totalPower;
  const targetTotalPower = targetSummary.totals.totalPower;

  // 🔥 Hitung persentase untuk bilah keseimbangan
  const totalCombinedPower = attackerTotalPower + targetTotalPower;
  const attackerPct = totalCombinedPower > 0 ? (attackerTotalPower / totalCombinedPower) * 100 : 50;
  const targetPct = totalCombinedPower > 0 ? (targetTotalPower / totalCombinedPower) * 100 : 50;

  const handleSetAllGroupPct = (group: ArmadaGroup, val: number) => {
    const items = attackerBreakdown[group];
    const next = { ...deploymentPct };
    items.forEach((item) => {
      next[item.key] = val;
    });
    setDeploymentPct(next);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("deployed_units_config", JSON.stringify(next));
      } catch (e) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[KonfirmasiSerang] Gagal menyimpan deployed_units_config:', e);
        }
      }
    }
  };

  const handleSetAllGlobalPct = (val: number) => {
    const next: Record<string, number> = {};
    [...attackerBreakdown.darat, ...attackerBreakdown.laut, ...attackerBreakdown.udara].forEach((item) => {
      next[item.key] = val;
    });
    setDeploymentPct(next);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("deployed_units_config", JSON.stringify(next));
      } catch (e) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[KonfirmasiSerang] Gagal menyimpan deployed_units_config:', e);
        }
      }
    }
  };

  // Konfigurasi ikon untuk setiap matra
  const groupMeta: Record<ArmadaGroup, { icon: typeof Swords; color: string; bg: string }> = {
    darat: { icon: Swords, color: "text-rose-700", bg: "bg-rose-100" },
    laut: { icon: Ship, color: "text-sky-700", bg: "bg-sky-100" },
    udara: { icon: Plane, color: "text-indigo-700", bg: "bg-indigo-100" },
  };

  const hasDeployedUnits = (Object.keys(attackerBreakdown) as ArmadaGroup[]).some((group) =>
    attackerBreakdown[group].some((item) =>
      item.quantity > 0 && (deploymentPct[item.key] ?? 0) > 0
    )
  );

  const content = (
    <div className="fixed inset-0 z-[10000000001] flex flex-col bg-root-surface font-sans select-none overflow-hidden animate-in fade-in duration-200">
      <div className="w-full h-full flex flex-col min-h-0 bg-root-surface relative">
        {/* HEADER HALAMAN KONFIRMASI SERANG */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-root-accent/20 flex items-center justify-between bg-root-canvas relative z-10 gap-2 shrink-0">
          <div className="flex items-center gap-4 lg:gap-8">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1 sm:p-1.5 bg-root-surface rounded-lg border border-root-accent/30 shrink-0">
                <Swords className="h-4 w-4 sm:h-5 sm:w-5 text-rose-500 animate-pulse" />
              </div>
              <div>
                <h3 className="text-[length:var(--modal-font-title)] font-bold text-root-accent tracking-tight leading-none uppercase">{displayTitle}</h3>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 ml-4 lg:ml-8 pl-4 lg:pl-8 border-l border-root-accent/30">
              <span className="text-[10px] lg:text-[11px] font-black uppercase tracking-wider text-root-subtle">
                {attackerName} &rarr; {targetName}
              </span>
            </div>
          </div>
          <SharedModalCloseButton onClick={onClose} className="p-1.5 lg:p-2 rounded-xl border border-root-accent/30 bg-root-surface text-root-subtle hover:text-root-accent hover:border-root-accent transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm" appearance="custom">
            <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">{tr("deployment.close")}</span>
            <X className="h-4 w-4" />
          </SharedModalCloseButton>
        </div>

        {/* BODY MODAL */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 bg-root-surface relative z-10 neon-scrollbar flex flex-col">
          <div className="w-full space-y-6">

            {/* STATUS MANDAT PBB & EMBARGO (INFORMATIF) - Hanya tampil jika mode serang biasa, bukan bantuan militer / kirim pasukan sekutu */}
            {!isMilitaryAid && (
              <div className="flex flex-col gap-2">
                {hasInvasionMandate ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                    <Shield className="w-5 h-5 shrink-0 text-emerald-400" />
                    <div>
                      <span className="font-black uppercase tracking-wider block">Mandat Operasi Militer PBB Aktif</span>
                      <span>Serangan terhadap {targetName} didukung oleh Resolusi Dewan Keamanan PBB. Anda tidak akan dikenakan sanksi agresi sepihak.</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                    <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
                    <div>
                      <span className="font-black uppercase tracking-wider block">Peringatan: Tanpa Mandat Resmi PBB</span>
                      <span>Serangan ini merupakan inisiatif sepihak tanpa resolusi DK PBB. Berisiko memicu sanksi diplomatik dan embargo multilateral terhadap negara Anda.</span>
                    </div>
                  </div>
                )}

                {targetEmbargoResolution && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs">
                    <ShieldAlert className="w-5 h-5 shrink-0 text-sky-400" />
                    <div>
                      <span className="font-black uppercase tracking-wider block">Target Sedang Dalam Embargo PBB</span>
                      <span>{targetName} saat ini dikenakan sanksi resolusi PBB ({targetEmbargoResolution.label || targetEmbargoResolution.desc}). Pasokan militer target melemah.</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* BAGIAN 1: PERBANDINGAN TOTAL KEKUATAN */}
            <div className="flex flex-col bg-root-canvas border border-root-accent/20 p-6 rounded-2xl shadow-sm gap-4">
              
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                
                {/* KARTU KIRI: PENYERANG */}
                <div className="flex-1 w-full flex flex-col items-center text-center space-y-2 p-4 rounded-xl bg-root-surface border border-root-accent/20">
                  <div className="p-2.5 rounded-full bg-root-accent/10 border border-root-accent/30">
                    <Shield className="w-6 h-6 text-root-accent" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-root-subtle">{tr("deployment.attacker")}</p>
                  <p className="text-xl font-black text-root-accent">{attackerName}</p>
                  <p className="text-xs text-root-text">
                    {tr("deployment.power")}: <span className="font-black text-root-accent">{formatNumber(attackerTotalPower, language)}</span>
                  </p>
                </div>

                {/* ELEMEN TENGAH: VS */}
                <div className="flex items-center justify-center py-2 md:py-0">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-root-accent/30 bg-root-surface text-xl font-black text-root-accent shadow-sm">
                    {tr("deployment.versus")}
                  </div>
                </div>

                {/* KARTU KANAN: TARGET */}
                <div className="flex-1 w-full flex flex-col items-center text-center space-y-2 p-4 rounded-xl bg-root-surface border border-rose-500/20">
                  <div className="p-2.5 rounded-full bg-rose-500/10 border border-rose-500/30">
                    <Shield className="w-6 h-6 text-rose-400" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-root-subtle">{tr("deployment.target")}</p>
                  <p className="text-xl font-black text-rose-400">{targetName}</p>
                  <p className="text-xs text-root-text">
                    {tr("deployment.power")}: <span className="font-black text-rose-400">{formatNumber(targetTotalPower, language)}</span>
                  </p>
                </div>
              </div>

            </div>

            <TravelFuelCostPanel
              status={travelFuelStatus}
              label={tr("deployment.fuelLabel")}
              locale={language}
              translate={(key, params) => tr(`fuel.${key}`, params)}
            />

            {/* BAGIAN 2: RINCIAN PASUKAN PER MATRA */}
            <div className="bg-root-canvas border border-root-accent/20 p-6 rounded-2xl shadow-sm space-y-4">
              {/* BUTTON OTOMATISASI GLOBAL */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-root-surface border border-root-accent/20">
                <span className="text-xs font-black text-root-accent uppercase tracking-wider">
                  ⚡ {tr("deployment.automation")}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSetAllGlobalPct(100)}
                    className="px-3 py-1.5 rounded-lg bg-root-accent text-root-accent-ink hover:bg-root-accent/85 font-black text-[11px] uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95"
                  >
                    {tr("deployment.deployAll")}
                  </button>
                  <button
                    onClick={() => handleSetAllGlobalPct(0)}
                    className="px-3 py-1.5 rounded-lg bg-root-surface border border-root-accent/30 text-root-subtle hover:text-root-accent font-black text-[11px] uppercase tracking-wider transition-all cursor-pointer active:scale-95"
                  >
                    {tr("deployment.resetAll")}
                  </button>
                </div>
              </div>

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
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSetAllGroupPct(group, 100)}
                              className="px-2.5 py-1 rounded-md bg-root-accent/15 border border-root-accent/40 text-root-accent hover:bg-root-accent hover:text-root-accent-ink font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                            >
                              {tr("deployment.deployGroup")}
                            </button>
                            <button
                              onClick={() => handleSetAllGroupPct(group, 0)}
                              className="px-2.5 py-1 rounded-md bg-root-surface border border-root-accent/20 text-root-subtle hover:text-root-accent font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                            >
                              {tr("deployment.resetGroup")}
                            </button>
                          </div>
                        </div>

                        {/* Pasukan Militer User */}
                        <div className="w-full space-y-2 pt-1">
                          <div className="text-[10px] font-black uppercase tracking-wider text-root-accent mb-2 flex items-center justify-between">
                            <span>{tr("deployment.unitType")}</span>
                            <span>{tr("deployment.unitCount")}</span>
                          </div>
                          {attackerBreakdown[group].map((item) => {
                            const pct = deploymentPct[item.key] ?? 0;
                            const deployedQty = Math.round((item.quantity * pct) / 100);

                            return (
                              <div
                                key={item.key}
                                className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-root-accent/20 bg-root-canvas p-3 gap-2"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between text-xs font-semibold text-root-text">
                                    <span>{tr(`units.${item.key}`)}</span>
                                    <span className="font-black text-root-accent font-mono">
                                      {formatNumber(deployedQty, language)}{" "}
                                      <span className="text-[10px] text-root-subtle font-normal">
                                        / {formatNumber(item.quantity, language)}
                                      </span>
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 sm:w-60 shrink-0">
                                  <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={pct}
                                    onChange={(e) =>
                                      handlePctChange(item.key, Number(e.target.value))
                                    }
                                    className="w-full accent-root-accent bg-root-surface h-1.5 rounded-lg cursor-pointer"
                                  />
                                  <span className="text-xs font-mono font-black text-root-accent w-10 text-right">
                                    {pct}%
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* FOOTER MODAL */}
        <div className="px-6 py-4 border-t border-root-accent/30 bg-root-canvas relative z-10 shrink-0 flex items-center justify-end gap-4">
          <button onClick={onClose} className="px-6 py-2 rounded-xl border border-root-accent/30 bg-root-surface text-root-subtle hover:text-root-accent hover:border-root-accent transition-all font-black text-xs uppercase tracking-wider cursor-pointer">
            {tr("deployment.cancel")}
          </button>
          <button 
            onClick={handleConfirm}
            disabled={!hasDeployedUnits || (!travelFuelStatus.ok && !isMilitaryAid)}
            className={`px-8 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
              hasDeployedUnits && (travelFuelStatus.ok || isMilitaryAid)
                ? isMilitaryAid
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/30 hover:bg-emerald-500 active:scale-95 cursor-pointer"
                  : "bg-rose-600 text-white shadow-lg shadow-rose-900/30 hover:bg-rose-500 active:scale-95 cursor-pointer"
                : "bg-gray-800 text-gray-500 border border-gray-700/60 cursor-not-allowed opacity-60"
            }`}
          >
            {isMilitaryAid ? <Shield className="w-4 h-4" /> : <Swords className="w-4 h-4" />}
            {displayConfirmLabel}
          </button>
        </div>

      </div>
    </div>
  );

  if (typeof window !== "undefined") {
    return createPortal(content, document.body);
  }

  return content;
}