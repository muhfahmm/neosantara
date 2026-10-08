"use client"
import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X, Swords, Shield, Ship, Plane, ChevronDown, ChevronUp } from "lucide-react";
import { getArmadaPowerSummary } from "../../4_armada/logic/armadaLogic";
import { convertBarakToSoldiers } from "../../4_armada/logic/1_barak_logic";

interface SerangModalsProps {
  isOpen: boolean;
  onClose: () => void;
  targetCountry: any;
  countryDetail: any;
  onConfirm: () => void;
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

const formatNumber = (value: unknown) => {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric.toLocaleString("id-ID") : "0";
};

const getArmadaPayload = (source: any) => {
  if (!source || typeof source !== "object") return {};
  if (source.armada && typeof source.armada === "object") return source.armada;
  return source;
};

const resolveQuantity = (source: any, group: ArmadaGroup, key: string) => {
  const payload = getArmadaPayload(source);
  const block = payload[group] && typeof payload[group] === "object" ? payload[group] : {};

  if (key === "barak") {
    // 🔥 Gunakan logika dari 1_barak_logic.ts
    const barakCount = Number(source?.barak ?? 0) ||
                    Number(payload?.barak ?? 0) ||
                    Number(block?.barak ?? 0) ||
                    Number(source?.armada?.barak ?? 0) ||
                    0;
    // Prefer stored `pasukan_infanteri` (current infantry) when available.
    const storedInfantry =
      Number(block?.pasukan_infanteri ?? NaN) ||
      Number(payload?.[group]?.pasukan_infanteri ?? NaN) ||
      Number(payload?.pasukan_infanteri ?? NaN) ||
      Number(source?.armada?.[group]?.pasukan_infanteri ?? NaN) ||
      Number(source?.armada?.pasukan_infanteri ?? NaN) ||
      Number(source?.[group]?.pasukan_infanteri ?? NaN) ||
      Number(source?.pasukan_infanteri ?? NaN) ||
      0;

    return storedInfantry > 0 ? storedInfantry : convertBarakToSoldiers(barakCount);
  }

  return (
    Number(block?.[key] ?? 0) ||
    Number(payload?.[key] ?? 0) ||
    Number(source?.[group]?.[key] ?? 0) ||
    Number(source?.armada?.[group]?.[key] ?? 0) ||
    Number(source?.[key] ?? 0) ||
    0
  );
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
}: SerangModalsProps) {
  if (!isOpen || !targetCountry) return null;

  const targetSource = targetCountry?.payload || targetCountry;
  const attackerName = countryDetail?.country || countryDetail?.nama_negara || countryDetail?.name_id || countryDetail?.name_en || "Negara Anda";
  const targetName = targetCountry?.countryName ||
    targetCountry?.payload?.countryName ||
    targetSource?.country ||
    targetSource?.nama_negara ||
    targetSource?.name_id ||
    targetSource?.name_en ||
    "Target";

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

  const [deploymentPct, setDeploymentPct] = useState<Record<string, number>>({});

  // Reset state dan bersihkan data pengerahan lama setiap kali modal dibuka
  React.useEffect(() => {
    if (isOpen) {
      setDeploymentPct({});
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("deployed_units_config");
        } catch (e) {}
      }
    }
  }, [isOpen]);

  const handlePctChange = (key: string, val: number) => {
    const next = { ...deploymentPct, [key]: val };
    setDeploymentPct(next);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("deployed_units_config", JSON.stringify(next));
      } catch (e) {}
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
      } catch (e) {}
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
      } catch (e) {}
    }
  };

  const hasDeployedUnits = Object.values(deploymentPct).some((val) => typeof val === "number" && val > 0);

  // Konfigurasi ikon untuk setiap matra
  const groupMeta: Record<ArmadaGroup, { icon: typeof Swords; color: string; bg: string }> = {
    darat: { icon: Swords, color: "text-rose-700", bg: "bg-rose-100" },
    laut: { icon: Ship, color: "text-sky-700", bg: "bg-sky-100" },
    udara: { icon: Plane, color: "text-indigo-700", bg: "bg-indigo-100" },
  };

  const content = (
    <div className="fixed inset-0 z-[9999999] flex flex-col bg-[#0F2424] font-sans select-none overflow-hidden animate-in fade-in duration-200">
      <div className="w-full h-full flex flex-col bg-[#0F2424] relative">
        {/* HEADER HALAMAN KONFIRMASI SERANG */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 gap-2 shrink-0">
          <div className="flex items-center gap-4 lg:gap-8">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1 sm:p-1.5 bg-[#0F2424] rounded-lg border border-[#00FFAA]/30 shrink-0">
                <Swords className="h-4 w-4 sm:h-5 sm:w-5 text-rose-500 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">Konfirmasi Serangan</h3>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 ml-4 lg:ml-8 pl-4 lg:pl-8 border-l border-[#00FFAA]/30">
              <span className="text-[10px] lg:text-[11px] font-black uppercase tracking-wider text-[#6B8A8A]">
                {attackerName} &rarr; {targetName}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm">
            <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* BODY MODAL */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 bg-[#0F2424] relative z-10 no-scrollbar flex flex-col">
          <div className="w-full space-y-6">

            {/* BAGIAN 1: PERBANDINGAN TOTAL KEKUATAN */}
            <div className="flex flex-col bg-[#0A1A1A] border border-[#00FFAA]/20 p-6 rounded-2xl shadow-sm gap-4">
              
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                
                {/* KARTU KIRI: PENYERANG */}
                <div className="flex-1 w-full flex flex-col items-center text-center space-y-2 p-4 rounded-xl bg-[#0F2424] border border-[#00FFAA]/20">
                  <div className="p-2.5 rounded-full bg-[#00FFAA]/10 border border-[#00FFAA]/30">
                    <Shield className="w-6 h-6 text-[#00FFAA]" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#6B8A8A]">Pasukan Penyerang</p>
                  <p className="text-xl font-black text-[#00FFAA]">{attackerName}</p>
                  <p className="text-xs text-[#E0E0E0]">
                    Kekuatan: <span className="font-black text-[#00FFAA]">{formatNumber(attackerTotalPower)}</span>
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
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#6B8A8A]">Pasukan Target</p>
                  <p className="text-xl font-black text-rose-400">{targetName}</p>
                  <p className="text-xs text-[#E0E0E0]">
                    Kekuatan: <span className="font-black text-rose-400">{formatNumber(targetTotalPower)}</span>
                  </p>
                </div>
              </div>

            </div>

            {/* BAGIAN 2: RINCIAN PASUKAN PER MATRA */}
            <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-6 rounded-2xl shadow-sm space-y-4">
              {/* BUTTON OTOMATISASI GLOBAL */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#0F2424] border border-[#00FFAA]/20">
                <span className="text-xs font-black text-[#00FFAA] uppercase tracking-wider">
                  ⚡ OTOMATISASI PENGERAHAN PASUKAN:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSetAllGlobalPct(100)}
                    className="px-3 py-1.5 rounded-lg bg-[#00FFAA] text-[#050B0B] hover:bg-[#00FFBB] font-black text-[11px] uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95"
                  >
                    Kerahkan Semua (100%)
                  </button>
                  <button
                    onClick={() => handleSetAllGlobalPct(0)}
                    className="px-3 py-1.5 rounded-lg bg-[#0F2424] border border-[#00FFAA]/30 text-[#6B8A8A] hover:text-[#00FFAA] font-black text-[11px] uppercase tracking-wider transition-all cursor-pointer active:scale-95"
                  >
                    Reset Semua (0%)
                  </button>
                </div>
              </div>

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
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSetAllGroupPct(group, 100)}
                              className="px-2.5 py-1 rounded-md bg-[#00FFAA]/15 border border-[#00FFAA]/40 text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#050B0B] font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                            >
                              Kerahkan Matra (100%)
                            </button>
                            <button
                              onClick={() => handleSetAllGroupPct(group, 0)}
                              className="px-2.5 py-1 rounded-md bg-[#0F2424] border border-[#00FFAA]/20 text-[#6B8A8A] hover:text-[#00FFAA] font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                            >
                              Reset (0%)
                            </button>
                          </div>
                        </div>

                        {/* Pasukan Militer User */}
                        <div className="w-full space-y-2 pt-1">
                          <div className="text-[10px] font-black uppercase tracking-wider text-[#00FFAA] mb-2 flex items-center justify-between">
                            <span>Jenis Alutsista / Pasukan</span>
                            <span>Jumlah Unit</span>
                          </div>
                          {attackerBreakdown[group].map((item) => {
                            const pct = deploymentPct[item.key] ?? 0;
                            const deployedQty = Math.round((item.quantity * pct) / 100);

                            return (
                              <div
                                key={item.key}
                                className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-[#00FFAA]/20 bg-[#0A1A1A] p-3 gap-2"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between text-xs font-semibold text-[#E0E0E0]">
                                    <span>{item.label}</span>
                                    <span className="font-black text-[#00FFAA] font-mono">
                                      {formatNumber(deployedQty)}{" "}
                                      <span className="text-[10px] text-[#6B8A8A] font-normal">
                                        / {formatNumber(item.quantity)}
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
                                    className="w-full accent-[#00FFAA] bg-[#0F2424] h-1.5 rounded-lg cursor-pointer"
                                  />
                                  <span className="text-xs font-mono font-black text-[#00FFAA] w-10 text-right">
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
        <div className="px-6 py-4 border-t border-[#00FFAA]/30 bg-[#0A1A1A] relative z-10 shrink-0 flex items-center justify-end gap-4">
          <button onClick={onClose} className="px-6 py-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all font-black text-xs uppercase tracking-wider cursor-pointer">
            Batal
          </button>
          <button 
            onClick={onConfirm} 
            disabled={!hasDeployedUnits}
            className={`px-8 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
              hasDeployedUnits
                ? "bg-rose-600 text-white shadow-lg shadow-rose-900/30 hover:bg-rose-500 active:scale-95 cursor-pointer"
                : "bg-gray-800 text-gray-500 border border-gray-700/60 cursor-not-allowed opacity-60"
            }`}
          >
            <Swords className="w-4 h-4" />
            Konfirmasi Serangan
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