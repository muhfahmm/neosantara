"use client"
import React, { useState } from "react";
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

  const [expandedGroup, setExpandedGroup] = useState<ArmadaGroup | null>("darat");

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

  // Konfigurasi ikon untuk setiap matra
  const groupMeta: Record<ArmadaGroup, { icon: typeof Swords; color: string; bg: string }> = {
    darat: { icon: Swords, color: "text-rose-700", bg: "bg-rose-100" },
    laut: { icon: Ship, color: "text-sky-700", bg: "bg-sky-100" },
    udara: { icon: Plane, color: "text-indigo-700", bg: "bg-indigo-100" },
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans animate-in fade-in zoom-in-95 duration-150 pointer-events-auto shadow-2xl">
        
        {/* HEADER MODAL KONFIRMASI SERANG */}
        <div className="px-6 py-4 border-b border-[#00FFAA]/30 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#0F2424] rounded-xl border border-[#00FFAA]/30">
                <Swords className="h-6 w-6 text-rose-500 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#00FFAA] tracking-wider uppercase">Konfirmasi Serangan</h2>
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#6B8A8A] mt-0.5">
                  Dari: {attackerName} &rarr; Target: {targetName}
                </p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* BODY MODAL */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 bg-[#0F2424] relative z-10 no-scrollbar flex flex-col">
          <div className="w-full max-w-4xl mx-auto space-y-6">

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

              {/* BARIS BAWAH: GARIS KESEIMBANGAN PASUKAN */}
              <div className="w-full mt-2 pt-4 border-t border-[#00FFAA]/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6B8A8A]">Keseimbangan Pasukan:</span>
                  <span className="text-[10px] font-bold text-[#E0E0E0]">
                    {attackerTotalPower > targetTotalPower ? '🟢 Unggul' : attackerTotalPower < targetTotalPower ? '🔴 Tertinggal' : '⚖️ Seimbang'}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 w-full">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#00FFAA]/10 border border-[#00FFAA]/30">
                    <Shield className="h-4 w-4 text-[#00FFAA]" />
                  </div>

                  <div className="flex-1 h-5 rounded-full bg-[#0F2424] overflow-hidden relative border border-[#00FFAA]/20 shadow-inner">
                    <div 
                      className="absolute left-0 top-0 h-full bg-[#00FFAA] transition-all duration-700 ease-out" 
                      style={{ width: `${attackerPct}%` }}
                    ></div>
                    <div 
                      className="absolute right-0 top-0 h-full bg-rose-500 transition-all duration-700 ease-out" 
                      style={{ width: `${targetPct}%` }}
                    ></div>
                    <div className="absolute left-1/2 top-0 h-full w-0.5 bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)] transform -translate-x-1/2 z-10"></div>
                  </div>

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-500/10 border border-rose-500/30">
                    <Shield className="h-4 w-4 text-rose-400" />
                  </div>
                </div>
              </div>

            </div>

            {/* BAGIAN 2: PERBANDINGAN PER MATRA */}
            <div className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-6 rounded-2xl shadow-sm">
              <div className="flex flex-col gap-4">
                {(['darat', 'laut', 'udara'] as ArmadaGroup[]).map((group) => {
                  const Icon = groupMeta[group].icon;
                  return (
                    <div key={group} className="rounded-xl border border-[#00FFAA]/20 bg-[#0F2424] p-4">
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => setExpandedGroup(expandedGroup === group ? null : group)}
                          className="w-full flex items-center justify-between rounded-xl border border-[#00FFAA]/20 bg-[#0A1A1A] px-4 py-3 text-left text-sm font-black text-[#00FFAA] transition hover:bg-[#00FFAA]/10"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="h-5 w-5 text-[#00FFAA]" />
                            <span className="uppercase tracking-wider">{group}</span>
                          </div>
                          <span className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#6B8A8A]">
                            {expandedGroup === group ? "Sembunyikan" : "Lihat Rincian"}
                            {expandedGroup === group ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </span>
                        </button>

                        <div
                          className={`flex flex-col md:flex-row md:gap-6 pt-2 overflow-hidden transition-all duration-300 ease-in-out ${
                            expandedGroup === group
                              ? "opacity-100 translate-y-0 max-h-[3000px] pointer-events-auto"
                              : "opacity-0 translate-y-[-10px] max-h-0 pointer-events-none"
                          }`}
                        >
                          {/* Sisi Kiri: Penyerang */}
                          <div className="flex-1 w-full space-y-2">
                            <div className="text-[10px] font-black uppercase tracking-wider text-[#00FFAA] mb-2">Penyerang</div>
                            {attackerBreakdown[group].map((item) => (
                              <div key={item.key} className="flex items-center justify-between rounded-lg border border-[#00FFAA]/20 bg-[#0A1A1A] px-3 py-2 text-xs font-semibold text-[#E0E0E0]">
                                <span>{item.label}</span>
                                <span className="font-black text-[#00FFAA]">{formatNumber(item.quantity)}</span>
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
                                <span className="font-black text-rose-400">{formatNumber(item.quantity)}</span>
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

        {/* FOOTER MODAL */}
        <div className="px-6 py-4 border-t border-[#00FFAA]/30 bg-[#0A1A1A] relative z-10 shrink-0 flex items-center justify-end gap-4">
          <button onClick={onClose} className="px-6 py-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all font-black text-xs uppercase tracking-wider cursor-pointer">
            Batal
          </button>
          <button 
            onClick={onConfirm} 
            className="px-8 py-2 rounded-xl bg-rose-600 text-white shadow-lg shadow-rose-900/30 font-black text-xs uppercase tracking-wider hover:bg-rose-500 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
          >
            <Swords className="w-4 h-4" />
            Konfirmasi Serangan
          </button>
        </div>

      </div>
    </div>
  );
}