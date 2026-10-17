'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Sword,
  Shield,
  Ship,
  Plane,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Info,
  Warehouse,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { getArmadaPowerSummary } from '@/app/page/navigasi_menu/2_navigasi_bawah/6_pertahanan/4_armada/logic/armadaLogic';
import { convertBarakToSoldiers } from '@/app/page/navigasi_menu/2_navigasi_bawah/6_pertahanan/4_armada/logic/1_barak_logic';
import { getInfraCapacityDetails } from '@/app/page/navigasi_menu/2_navigasi_bawah/6_pertahanan/4_armada/logic/infraCapacityHelper';
import { setRelationModifier } from '../../../../../../../json/4_database_hubungan_antar_negara/relationsRegistry';

interface BeriTentaraModalProps {
  isOpen: boolean;
  countryName?: string | null;
  playerCountryDetail?: any;
  setPlayerCountryDetail?: (detail: any | ((prev: any) => any)) => void;
  targetCountryDetail?: any;
  setTargetCountryDetail?: (detail: any | ((prev: any) => any)) => void;
  onClose: () => void;
  onConfirm?: () => void;
}

type ArmadaMatra = 'darat' | 'laut' | 'udara';

interface UnitDefinition {
  key: string;
  dataKey: string;
  label: string;
  matra: ArmadaMatra;
  infraKey: string;
  infraLabel: string;
}

const UNIT_CATALOG: Record<ArmadaMatra, UnitDefinition[]> = {
  darat: [
    { key: 'barak', dataKey: 'pasukan_infanteri', label: 'Pasukan Infanteri', matra: 'darat', infraKey: 'barak', infraLabel: 'Barak Militer' },
    { key: 'tank_tempur_utama', dataKey: 'tank_tempur_utama', label: 'Tank Tempur Utama (MBT)', matra: 'darat', infraKey: 'hangar_tank', infraLabel: 'Hangar Tank' },
    { key: 'apc_ifv', dataKey: 'apc_ifv', label: 'APC / IFV', matra: 'darat', infraKey: 'hangar_tank', infraLabel: 'Hangar Tank' },
    { key: 'artileri_berat', dataKey: 'artileri_berat', label: 'Artileri Berat', matra: 'darat', infraKey: 'gudang_senjata', infraLabel: 'Gudang Senjata' },
    { key: 'sistem_peluncur_roket', dataKey: 'sistem_peluncur_roket', label: 'Sistem Peluncur Roket', matra: 'darat', infraKey: 'gudang_senjata', infraLabel: 'Gudang Senjata' },
    { key: 'pertahanan_udara_mobile', dataKey: 'pertahanan_udara_mobile', label: 'Pertahanan Udara Mobile', matra: 'darat', infraKey: 'gudang_senjata', infraLabel: 'Gudang Senjata' },
    { key: 'kendaraan_taktis', dataKey: 'kendaraan_taktis', label: 'Kendaraan Taktis', matra: 'darat', infraKey: 'gudang_senjata', infraLabel: 'Gudang Senjata' },
  ],
  laut: [
    { key: 'kapal_induk', dataKey: 'kapal_induk', label: 'Kapal Induk', matra: 'laut', infraKey: 'pangkalan_laut', infraLabel: 'Pangkalan Laut' },
    { key: 'kapal_induk_nuklir', dataKey: 'kapal_induk_nuklir', label: 'Kapal Induk Nuklir', matra: 'laut', infraKey: 'pangkalan_laut', infraLabel: 'Pangkalan Laut' },
    { key: 'kapal_destroyer', dataKey: 'kapal_destroyer', label: 'Kapal Destroyer', matra: 'laut', infraKey: 'pangkalan_laut', infraLabel: 'Pangkalan Laut' },
    { key: 'kapal_korvet', dataKey: 'kapal_korvet', label: 'Kapal Korvet', matra: 'laut', infraKey: 'pangkalan_laut', infraLabel: 'Pangkalan Laut' },
    { key: 'kapal_selam_nuklir', dataKey: 'kapal_selam_nuklir', label: 'Kapal Selam Nuklir', matra: 'laut', infraKey: 'pangkalan_laut', infraLabel: 'Pangkalan Laut' },
    { key: 'kapal_selam_regular', dataKey: 'kapal_selam_regular', label: 'Kapal Selam Reguler', matra: 'laut', infraKey: 'pangkalan_laut', infraLabel: 'Pangkalan Laut' },
    { key: 'kapal_ranjau', dataKey: 'kapal_ranjau', label: 'Kapal Ranjau', matra: 'laut', infraKey: 'pangkalan_laut', infraLabel: 'Pangkalan Laut' },
    { key: 'kapal_logistik', dataKey: 'kapal_logistik', label: 'Kapal Logistik', matra: 'laut', infraKey: 'pangkalan_laut', infraLabel: 'Pangkalan Laut' },
  ],
  udara: [
    { key: 'jet_tempur_siluman', dataKey: 'jet_tempur_siluman', label: 'Jet Tempur Siluman', matra: 'udara', infraKey: 'pangkalan_udara', infraLabel: 'Pangkalan Udara' },
    { key: 'jet_tempur_interceptor', dataKey: 'jet_tempur_interceptor', label: 'Jet Tempur Interceptor', matra: 'udara', infraKey: 'pangkalan_udara', infraLabel: 'Pangkalan Udara' },
    { key: 'pesawat_pengebom', dataKey: 'pesawat_pengebom', label: 'Pesawat Pengebom', matra: 'udara', infraKey: 'pangkalan_udara', infraLabel: 'Pangkalan Udara' },
    { key: 'helikopter_serang', dataKey: 'helikopter_serang', label: 'Helikopter Serang', matra: 'udara', infraKey: 'pangkalan_udara', infraLabel: 'Pangkalan Udara' },
    { key: 'pesawat_pengintai', dataKey: 'pesawat_pengintai', label: 'Pesawat Pengintai', matra: 'udara', infraKey: 'pangkalan_udara', infraLabel: 'Pangkalan Udara' },
    { key: 'drone_intai_uav', dataKey: 'drone_intai_uav', label: 'Drone Intai UAV', matra: 'udara', infraKey: 'pangkalan_udara', infraLabel: 'Pangkalan Udara' },
    { key: 'drone_kamikaze', dataKey: 'drone_kamikaze', label: 'Drone Kamikaze', matra: 'udara', infraKey: 'pangkalan_udara', infraLabel: 'Pangkalan Udara' },
    { key: 'pesawat_angkut', dataKey: 'pesawat_angkut', label: 'Pesawat Angkut', matra: 'udara', infraKey: 'pangkalan_udara', infraLabel: 'Pangkalan Udara' },
  ],
};

const formatNumber = (num: number | string | undefined | null) => {
  const n = Number(num || 0);
  return Number.isFinite(n) ? n.toLocaleString('id-ID', { maximumFractionDigits: 2 }) : '0';
};

// Helper resolver quantity unit
function getUnitQuantity(source: any, unit: UnitDefinition): number {
  if (!source) return 0;
  if (unit.key === 'barak') {
    const rawBarak = Number(source?.barak ?? source?.armada?.barak ?? 0);
    const rawInfantry = Number(
      source?.pasukan_infanteri ??
      source?.armada?.pasukan_infanteri ??
      source?.armada?.darat?.pasukan_infanteri ??
      source?.darat?.pasukan_infanteri ??
      0
    );
    return rawInfantry > 0 ? rawInfantry : convertBarakToSoldiers(rawBarak);
  }
  const key = unit.key;
  return Number(
    source?.[key] ??
    source?.armada?.[key] ??
    source?.armada?.[unit.matra]?.[key] ??
    source?.[unit.matra]?.[key] ??
    0
  );
}

export default function BeriTentaraModal({
  isOpen,
  countryName,
  playerCountryDetail,
  setPlayerCountryDetail,
  targetCountryDetail,
  setTargetCountryDetail,
  onClose,
  onConfirm,
}: BeriTentaraModalProps) {
  const [activeTab, setActiveTab] = useState<ArmadaMatra>('darat');
  // State jumlah pengiriman per unit (key: unit.key)
  const [giftAmounts, setGiftAmounts] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const targetName = countryName || 'Negara Sekutu';
  const playerName = playerCountryDetail?.country || playerCountryDetail?.nama || playerCountryDetail?.country_name || 'Negara Anda';

  // Sisa kapasitas infra target negara sekutu (Barak, Hangar, Gudang Senjata, Pangkalan Laut, Pangkalan Udara)
  const targetInfraCapacities = useMemo(() => {
    const infraKeys = ['barak', 'hangar_tank', 'gudang_senjata', 'pangkalan_laut', 'pangkalan_udara'];
    const capMap: Record<string, { used: number; total: number; remaining: number }> = {};

    infraKeys.forEach((ik) => {
      const details = getInfraCapacityDetails(ik, targetCountryDetail);
      if (details) {
        const remaining = Math.max(0, details.totalCapacity - details.used);
        capMap[ik] = {
          used: details.used,
          total: details.totalCapacity,
          remaining: remaining,
        };
      } else {
        capMap[ik] = { used: 0, total: 9999999, remaining: 9999999 };
      }
    });
    return capMap;
  }, [targetCountryDetail]);

  // Hitung total unit yang dialokasikan per infra dalam modal ini
  const allocatedByInfra = useMemo(() => {
    const alloc: Record<string, number> = {
      barak: 0,
      hangar_tank: 0,
      gudang_senjata: 0,
      pangkalan_laut: 0,
      pangkalan_udara: 0,
    };

    (['darat', 'laut', 'udara'] as ArmadaMatra[]).forEach((matra) => {
      UNIT_CATALOG[matra].forEach((unit) => {
        const amount = giftAmounts[unit.key] || 0;
        if (amount > 0 && alloc[unit.infraKey] !== undefined) {
          alloc[unit.infraKey] += amount;
        }
      });
    });

    return alloc;
  }, [giftAmounts]);

  // Cek apakah ada unit yang dialokasikan
  const totalUnitsToGift = useMemo(() => {
    return Object.values(giftAmounts).reduce((acc, curr) => acc + (Number(curr) || 0), 0);
  }, [giftAmounts]);

  // Hitung simulasi perubahan power user & target
  const simulatedPlayerDetail = useMemo(() => {
    if (totalUnitsToGift <= 0) return playerCountryDetail;
    const clone = { ...playerCountryDetail };
    const armadaClone = clone.armada ? { ...clone.armada } : {};

    Object.entries(giftAmounts).forEach(([uKey, count]) => {
      if (count <= 0) return;
      if (uKey === 'barak') {
        const curr = getUnitQuantity(clone, { key: 'barak', dataKey: 'pasukan_infanteri', label: '', matra: 'darat', infraKey: 'barak', infraLabel: '' });
        const updated = Math.max(0, curr - count);
        clone.pasukan_infanteri = updated;
        if (clone.armada) {
          clone.armada = { ...clone.armada, pasukan_infanteri: updated };
        }
      } else {
        const curr = Number(clone[uKey] ?? armadaClone[uKey] ?? 0);
        const updated = Math.max(0, curr - count);
        clone[uKey] = updated;
        if (clone.armada) {
          clone.armada = { ...clone.armada, [uKey]: updated };
        }
      }
    });

    return clone;
  }, [playerCountryDetail, giftAmounts, totalUnitsToGift]);

  const simulatedTargetDetail = useMemo(() => {
    if (totalUnitsToGift <= 0) return targetCountryDetail;
    const clone = { ...targetCountryDetail };
    const armadaClone = clone.armada ? { ...clone.armada } : {};

    Object.entries(giftAmounts).forEach(([uKey, count]) => {
      if (count <= 0) return;
      if (uKey === 'barak') {
        const curr = getUnitQuantity(clone, { key: 'barak', dataKey: 'pasukan_infanteri', label: '', matra: 'darat', infraKey: 'barak', infraLabel: '' });
        const updated = curr + count;
        clone.pasukan_infanteri = updated;
        if (clone.armada) {
          clone.armada = { ...clone.armada, pasukan_infanteri: updated };
        }
      } else {
        const curr = Number(clone[uKey] ?? armadaClone[uKey] ?? 0);
        const updated = curr + count;
        clone[uKey] = updated;
        if (clone.armada) {
          clone.armada = { ...clone.armada, [uKey]: updated };
        }
      }
    });

    return clone;
  }, [targetCountryDetail, giftAmounts, totalUnitsToGift]);

  // Ringkasan power
  const playerInitialSummary = useMemo(() => getArmadaPowerSummary(playerCountryDetail), [playerCountryDetail]);
  const playerSimulatedSummary = useMemo(() => getArmadaPowerSummary(simulatedPlayerDetail), [simulatedPlayerDetail]);

  const targetInitialSummary = useMemo(() => getArmadaPowerSummary(targetCountryDetail), [targetCountryDetail]);
  const targetSimulatedSummary = useMemo(() => getArmadaPowerSummary(simulatedTargetDetail), [simulatedTargetDetail]);

  const playerPowerBefore = playerInitialSummary?.totals?.totalPower || 0;
  const playerPowerAfter = playerSimulatedSummary?.totals?.totalPower || 0;
  const playerPowerDiff = playerPowerAfter - playerPowerBefore;

  const targetPowerBefore = targetInitialSummary?.totals?.totalPower || 0;
  const targetPowerAfter = targetSimulatedSummary?.totals?.totalPower || 0;
  const targetPowerDiff = targetPowerAfter - targetPowerBefore;

  // Handlers perubahan jumlah
  const handleAmountChange = (unit: UnitDefinition, val: number) => {
    const userMax = getUnitQuantity(playerCountryDetail, unit);
    const infraCap = targetInfraCapacities[unit.infraKey]?.remaining ?? 0;
    const currentUnitGift = giftAmounts[unit.key] || 0;
    const otherAllocatedInSameInfra = (allocatedByInfra[unit.infraKey] || 0) - currentUnitGift;
    const maxAvailableForThisUnit = Math.max(0, infraCap - otherAllocatedInSameInfra);

    const safeVal = Math.max(0, Math.min(val, userMax, maxAvailableForThisUnit));

    setGiftAmounts((prev) => ({
      ...prev,
      [unit.key]: safeVal,
    }));
  };

  const handleSetMaxForUnit = (unit: UnitDefinition) => {
    const userMax = getUnitQuantity(playerCountryDetail, unit);
    const infraCap = targetInfraCapacities[unit.infraKey]?.remaining ?? 0;
    const currentUnitGift = giftAmounts[unit.key] || 0;
    const otherAllocatedInSameInfra = (allocatedByInfra[unit.infraKey] || 0) - currentUnitGift;
    const maxAvailableForThisUnit = Math.max(0, infraCap - otherAllocatedInSameInfra);

    const maxToGift = Math.max(0, Math.min(userMax, maxAvailableForThisUnit));
    handleAmountChange(unit, maxToGift);
  };

  const handleReset = () => {
    setGiftAmounts({});
  };

  // Submit transfer bantuan militer
  const handleConfirmTransfer = () => {
    if (totalUnitsToGift <= 0 || isSubmitting) return;
    setIsSubmitting(true);

    try {
      // 1. Update Player Country Detail
      if (setPlayerCountryDetail) {
        setPlayerCountryDetail((prev: any) => {
          if (!prev) return prev;
          const next = { ...prev };
          const arm = next.armada ? { ...next.armada } : {};

          Object.entries(giftAmounts).forEach(([uKey, count]) => {
            if (count <= 0) return;
            if (uKey === 'barak') {
              const curr = getUnitQuantity(next, { key: 'barak', dataKey: 'pasukan_infanteri', label: '', matra: 'darat', infraKey: 'barak', infraLabel: '' });
              const updated = Math.max(0, curr - count);
              next.pasukan_infanteri = updated;
              if (next.armada) next.armada.pasukan_infanteri = updated;
            } else {
              const curr = Number(next[uKey] ?? arm[uKey] ?? 0);
              const updated = Math.max(0, curr - count);
              next[uKey] = updated;
              if (next.armada) next.armada[uKey] = updated;
            }
          });
          return next;
        });
      }

      // 2. Update Target Country Detail
      if (setTargetCountryDetail) {
        setTargetCountryDetail((prev: any) => {
          if (!prev) return prev;
          const next = { ...prev };
          const arm = next.armada ? { ...next.armada } : {};

          Object.entries(giftAmounts).forEach(([uKey, count]) => {
            if (count <= 0) return;
            if (uKey === 'barak') {
              const curr = getUnitQuantity(next, { key: 'barak', dataKey: 'pasukan_infanteri', label: '', matra: 'darat', infraKey: 'barak', infraLabel: '' });
              const updated = curr + count;
              next.pasukan_infanteri = updated;
              if (next.armada) next.armada.pasukan_infanteri = updated;
            } else {
              const curr = Number(next[uKey] ?? arm[uKey] ?? 0);
              const updated = curr + count;
              next[uKey] = updated;
              if (next.armada) next.armada[uKey] = updated;
            }
          });
          return next;
        });
      }

      // 3. Tingkatkan Hubungan Diplomatik secara matematis proporsional (bonus diplomasi)
      const relationBonus = Math.min(15, Math.max(1, Math.floor(Math.abs(targetPowerDiff) / 50000) || 1));
      setRelationModifier(playerName, targetName, relationBonus);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('country_relations_updated'));
      }

      setSuccessToast(`Berhasil mentransfer ${formatNumber(totalUnitsToGift)} unit pasukan ke ${targetName}! Hubungan meningkat +${relationBonus}.`);

      if (onConfirm) {
        onConfirm();
      }

      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 1200);
    } catch (e) {
      console.error('Error saat mentransfer pasukan:', e);
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      {/* Modal Container: Ukuran sama persis dengan modal detail negara */}
      <div className="bg-[#0F2424] border-2 sm:border-3 border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">

        {/* Background Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,255,170,0.05)_0%,transparent_100%)] pointer-events-none" />

        {/* HEADER MODAL */}
        <div className="px-6 sm:px-8 py-4 sm:py-5 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-2.5 bg-[#00FFAA]/10 rounded-xl border border-[#00FFAA]/30 shrink-0 flex items-center justify-center">
              <Sword className="h-6 w-6 text-[#00FFAA]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">
                Beri Bantuan Pasukan Militer
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-[#00FFAA]/70 font-semibold uppercase tracking-wider">
                  Transfer Pasukan ke Sekutu: <span className="text-[#00FFAA] font-bold">{targetName}</span>
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 sm:p-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#0A1A1A] text-[#00FFAA]/70 hover:text-[#00FFAA] hover:bg-[#00FFAA]/10 active:bg-[#00FFAA]/20 transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm"
            aria-label="Tutup modal beri tentara"
          >
            <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* RINGKASAN MILITARY POWER & PERBANDINGAN KOMPARATIF */}
        <div className="px-6 sm:px-8 py-3 bg-[#0A1A1A]/90 border-b border-[#00FFAA]/20 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10 shrink-0">
          {/* User Status */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="p-2 rounded-lg bg-[#00FFAA]/10 border border-[#00FFAA]/30">
              <Shield className="w-5 h-5 text-[#00FFAA]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#6B8A8A]">
                Power Militer {playerName} (Anda)
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-[#00FFAA] font-mono">
                  {formatNumber(playerPowerAfter)}
                </span>
                {playerPowerDiff < 0 && (
                  <span className="text-xs font-bold text-rose-400 flex items-center">
                    <TrendingDown className="w-3.5 h-3.5 mr-0.5 inline" />
                    {formatNumber(playerPowerDiff)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Indicator Panah Transfer */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F2424] border border-[#00FFAA]/30 text-xs font-bold text-[#00FFAA]">
            <span>Transfer Bantuan</span>
            <ArrowRight className="w-4 h-4 text-[#00FFAA]" />
          </div>

          {/* Target Status */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-start md:justify-end">
            <div className="flex flex-col items-start md:items-end">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#6B8A8A]">
                Power Militer {targetName} (Sekutu)
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-[#FFD700] font-mono">
                  {formatNumber(targetPowerAfter)}
                </span>
                {targetPowerDiff > 0 && (
                  <span className="text-xs font-bold text-emerald-400 flex items-center">
                    <TrendingUp className="w-3.5 h-3.5 mr-0.5 inline" />
                    +{formatNumber(targetPowerDiff)}
                  </span>
                )}
              </div>
            </div>
            <div className="p-2 rounded-lg bg-[#FFD700]/10 border border-[#FFD700]/30">
              <Shield className="w-5 h-5 text-[#FFD700]" />
            </div>
          </div>
        </div>

        {/* TAB PILIHAN MATRA: DARAT / LAUT / UDARA */}
        <div className="px-6 sm:px-8 py-2.5 bg-[#0F2424] border-b border-[#00FFAA]/20 flex items-center gap-2 relative z-10 shrink-0">
          {(['darat', 'laut', 'udara'] as ArmadaMatra[]).map((matra) => {
            const isActive = activeTab === matra;
            const Icon = matra === 'darat' ? Sword : matra === 'laut' ? Ship : Plane;
            const label = matra === 'darat' ? 'Angkatan Darat' : matra === 'laut' ? 'Angkatan Laut' : 'Angkatan Udara';

            // Hitung unit yang dipilih di matra ini
            const matraGiftCount = UNIT_CATALOG[matra].reduce((acc, u) => acc + (giftAmounts[u.key] || 0), 0);

            return (
              <button
                key={matra}
                onClick={() => setActiveTab(matra)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer border ${isActive
                    ? 'bg-[#00FFAA] text-[#0A1A1A] border-[#00FFAA] shadow-md shadow-[#00FFAA]/20'
                    : 'bg-[#0A1A1A] text-[#6B8A8A] hover:text-[#00FFAA] border-[#00FFAA]/20 hover:border-[#00FFAA]/40'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
                {matraGiftCount > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${isActive ? 'bg-[#0A1A1A] text-[#00FFAA]' : 'bg-[#00FFAA]/20 text-[#00FFAA]'
                    }`}>
                    {formatNumber(matraGiftCount)}
                  </span>
                )}
              </button>
            );
          })}

          {totalUnitsToGift > 0 && (
            <button
              onClick={handleReset}
              className="ml-auto text-xs font-bold text-rose-400 hover:text-rose-300 underline uppercase tracking-wider cursor-pointer"
            >
              Reset Semua
            </button>
          )}
        </div>

        {/* BODY UTAMA: DAFTAR UNIT DAN PERBANDINGAN SLOT */}
        <div className="flex-1 min-h-0 bg-[#0F2424] p-4 sm:p-6 overflow-y-auto space-y-3 relative z-10">
          {UNIT_CATALOG[activeTab].map((unit) => {
            const userStock = getUnitQuantity(playerCountryDetail, unit);
            const targetStock = getUnitQuantity(targetCountryDetail, unit);
            const infraCap = targetInfraCapacities[unit.infraKey] || { used: 0, total: 0, remaining: 0 };

            // Sisa slot efektif pada infrastruktur sekutu
            const currentGiftAmount = giftAmounts[unit.key] || 0;
            const otherAllocatedInSameInfra = (allocatedByInfra[unit.infraKey] || 0) - currentGiftAmount;
            const effectiveRemainingSlot = Math.max(0, infraCap.remaining - otherAllocatedInSameInfra);

            const isSlotFull = effectiveRemainingSlot <= 0 && currentGiftAmount <= 0;
            const isNoStock = userStock <= 0;

            return (
              <div
                key={unit.key}
                className="bg-[#0A1A1A] border border-[#00FFAA]/20 hover:border-[#00FFAA]/40 rounded-xl p-4 transition-all"
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">

                  {/* Kolom Info Unit & Perbandingan Pasukan */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-[#E0E0E0] uppercase tracking-wide">
                        {unit.label}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#0F2424] border border-[#00FFAA]/20 text-[#6B8A8A] uppercase">
                        {unit.infraLabel}
                      </span>
                    </div>

                    {/* Baris Statistik Perbandingan */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2.5">
                      {/* Pasukan Anda */}
                      <div className="bg-[#0F2424] p-2.5 rounded-lg border border-[#00FFAA]/15">
                        <span className="text-[9px] font-black uppercase text-[#6B8A8A] block">
                          Stok Anda
                        </span>
                        <span className="text-xs font-bold text-[#00FFAA] font-mono">
                          {formatNumber(userStock)} unit
                        </span>
                        {currentGiftAmount > 0 && (
                          <span className="text-[10px] font-bold text-rose-400 block">
                            (-{formatNumber(currentGiftAmount)})
                          </span>
                        )}
                      </div>

                      {/* Pasukan Sekutu */}
                      <div className="bg-[#0F2424] p-2.5 rounded-lg border border-[#00FFAA]/15">
                        <span className="text-[9px] font-black uppercase text-[#6B8A8A] block">
                          Pasukan Sekutu Saat Ini
                        </span>
                        <span className="text-xs font-bold text-[#E0E0E0] font-mono">
                          {formatNumber(targetStock)} unit
                        </span>
                        {currentGiftAmount > 0 && (
                          <span className="text-[10px] font-bold text-emerald-400 block">
                            (+{formatNumber(currentGiftAmount)})
                          </span>
                        )}
                      </div>

                      {/* Slot Tersisa di Sekutu */}
                      <div className="col-span-2 sm:col-span-1 bg-[#0F2424] p-2.5 rounded-lg border border-[#00FFAA]/15">
                        <span className="text-[9px] font-black uppercase text-[#6B8A8A] block">
                          Sisa Slot {unit.infraLabel} Sekutu
                        </span>
                        <span className={`text-xs font-bold font-mono ${effectiveRemainingSlot > 0 ? 'text-[#FFD700]' : 'text-rose-400'}`}>
                          {formatNumber(effectiveRemainingSlot)} slot tersisa
                        </span>
                        <span className="text-[9px] text-[#6B8A8A] block">
                          (Terpakai: {formatNumber(infraCap.used)} / {formatNumber(infraCap.total)})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Kolom Kontrol Input Beri Pasukan */}
                  <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1 bg-[#0F2424] p-1.5 rounded-xl border border-[#00FFAA]/30">
                      <button
                        onClick={() => handleAmountChange(unit, currentGiftAmount - (unit.key === 'barak' ? 1000 : 1))}
                        disabled={currentGiftAmount <= 0}
                        className="p-1.5 rounded-lg bg-[#0A1A1A] text-[#00FFAA] hover:bg-[#00FFAA]/20 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                        title="Kurangi 1 unit"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <input
                        type="number"
                        min={0}
                        max={Math.min(userStock, effectiveRemainingSlot + currentGiftAmount)}
                        value={currentGiftAmount === 0 ? '' : currentGiftAmount}
                        placeholder="0"
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          handleAmountChange(unit, Number.isNaN(val) ? 0 : val);
                        }}
                        className="w-24 sm:w-28 bg-[#0A1A1A] border border-[#00FFAA]/20 rounded-lg px-2.5 py-1 text-center font-mono font-black text-sm text-[#00FFAA] focus:outline-none focus:border-[#00FFAA]"
                      />

                      <button
                        onClick={() => handleAmountChange(unit, currentGiftAmount + (unit.key === 'barak' ? 1000 : 1))}
                        disabled={isNoStock || effectiveRemainingSlot <= 0 || currentGiftAmount >= userStock}
                        className="p-1.5 rounded-lg bg-[#0A1A1A] text-[#00FFAA] hover:bg-[#00FFAA]/20 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                        title="Tambah 1 unit"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Tombol Max */}
                    <button
                      onClick={() => handleSetMaxForUnit(unit)}
                      disabled={isNoStock || effectiveRemainingSlot <= 0}
                      className="px-3 py-2 bg-[#00FFAA]/10 hover:bg-[#00FFAA]/20 border border-[#00FFAA]/30 disabled:opacity-30 disabled:pointer-events-none rounded-xl text-center text-[#00FFAA] font-black text-[11px] uppercase tracking-wider transition-all cursor-pointer shrink-0"
                    >
                      Maksimal
                    </button>
                  </div>
                </div>

                {/* Warning jika slot sekutu habis */}
                {isSlotFull && (
                  <div className="mt-2.5 flex items-center gap-2 p-2 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-[11px]">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>
                      Kapasitas <strong>{unit.infraLabel}</strong> di {targetName} sudah penuh. Sekutu perlu membangun infrastruktur ini terlebih dahulu untuk menampung unit baru.
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* TOAST SUKSES */}
        {successToast && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 bg-emerald-900/90 border border-emerald-400 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs font-bold tracking-wide">{successToast}</span>
          </div>
        )}

        {/* FOOTER MODAL */}
        <div className="px-6 py-4 border-t border-[#00FFAA]/20 bg-[#0A1A1A] shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2 text-xs text-[#6B8A8A]">
            <Info className="w-4 h-4 text-[#00FFAA] shrink-0" />
            <span>
              Total unit yang akan dikirim: <strong className="text-[#00FFAA]">{formatNumber(totalUnitsToGift)} unit</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 sm:flex-initial px-6 py-2.5 bg-[#0F2424] hover:bg-[#163535] border border-[#00FFAA]/30 rounded-xl text-center text-[#E0E0E0] font-black text-xs tracking-wider uppercase transition-all cursor-pointer"
            >
              Batal
            </button>

            <button
              onClick={handleConfirmTransfer}
              disabled={totalUnitsToGift <= 0 || isSubmitting}
              className="flex-1 sm:flex-initial px-6 py-2.5 bg-[#00FFAA] hover:bg-[#00e699] disabled:opacity-30 disabled:pointer-events-none border border-[#00FFAA] rounded-xl text-center text-[#0A1A1A] font-black text-xs tracking-wider uppercase transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Memproses...</span>
              ) : (
                <>
                  <Sword className="w-4 h-4" />
                  <span>Kirim Pasukan</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}