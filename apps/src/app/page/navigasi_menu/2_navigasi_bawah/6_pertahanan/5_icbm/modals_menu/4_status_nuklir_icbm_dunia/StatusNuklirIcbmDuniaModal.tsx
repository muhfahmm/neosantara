"use client"
import React, { useMemo, useState, useEffect } from "react";
import { X, Search, Rocket, ShieldAlert, Globe } from "lucide-react";
import NotebookModalWrapper from "../../../../NotebookModalWrapper";
import {
  getNpcCountrySimulationSnapshot,
  NPC_COUNTRY_SIMULATION_UPDATED_EVENT,
} from "@/app/logic/npc_country_simulation/npcCountrySimulation";

export interface DatabaseIcbmRow {
  country_id: number;
  country_slug: string;
  country_name: string;
  iso: string;
  icbm_status: boolean;
  icbm_jumlah: number;
  in_progress_icbm?: number;
  has_nuclear_program?: boolean;
  nuclear_program_status?: 'AKTIF' | 'RISET' | 'BELUM AKTIF';
}

interface StatusNuklirIcbmDuniaModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail?: any;
  currentDate?: string | Date;
  prefetchedAllCountries?: any[];
}

const formatNumber = (value: unknown) => {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric.toLocaleString("id-ID", { maximumFractionDigits: 0 }) : "0";
};

export default function StatusNuklirIcbmDuniaModal({
  isOpen,
  onClose,
  countryDetail,
  currentDate,
  prefetchedAllCountries,
}: StatusNuklirIcbmDuniaModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [icbmList, setIcbmList] = useState<DatabaseIcbmRow[]>([]);
  const [isLoadingIcbm, setIsLoadingIcbm] = useState(false);
  const [simulationVersion, setSimulationVersion] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const handleSimulationUpdate = () => {
      setSimulationVersion((v) => v + 1);
    };
    window.addEventListener(NPC_COUNTRY_SIMULATION_UPDATED_EVENT, handleSimulationUpdate);
    return () => {
      window.removeEventListener(NPC_COUNTRY_SIMULATION_UPDATED_EVENT, handleSimulationUpdate);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoadingIcbm(true);
    fetch('/api/icbm-data')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setIcbmList(data);
        }
      })
      .catch((err) => {
        console.error('Gagal mengambil data ICBM:', err);
      })
      .finally(() => {
        setIsLoadingIcbm(false);
      });
  }, [isOpen]);

  const parseDateLocal = (dateValue: string | Date | null | undefined) => {
    if (!dateValue) return null;
    const dateObj = typeof dateValue === 'string' ? new Date(`${dateValue}T00:00:00`) : dateValue;
    return dateObj instanceof Date && !isNaN(dateObj.getTime()) ? dateObj : null;
  };

  const getDurationDaysLocal = (start: string | Date | null | undefined, end: string | Date | null | undefined) => {
    const startDate = parseDateLocal(start);
    const endDate = parseDateLocal(end);
    if (!startDate || !endDate) return 0;
    const diff = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const addDaysLocal = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const calculatePlayerReadyIcbm = () => {
    const baseExisting = Math.max(
      Number(countryDetail?.icbm_jumlah || 0),
      Number(countryDetail?.icbm || 0)
    );

    const task = countryDetail?.icbmBuildTask;
    if (!task) return baseExisting;

    const quantity = Math.max(0, Number(task.quantity) || 0);
    const startDate = parseDateLocal(task.startDate);
    const endDate = parseDateLocal(task.endDate);
    const totalDurationDays = getDurationDaysLocal(startDate, endDate);

    let currDateObj: Date | null = null;
    if (currentDate) {
      currDateObj = parseDateLocal(currentDate);
    } else if (typeof window !== 'undefined' && (window as any).neosantara_current_date) {
      currDateObj = parseDateLocal((window as any).neosantara_current_date);
    }

    if (!currDateObj) {
      currDateObj = new Date();
    }

    let completedCount = 0;
    if (startDate && quantity > 0) {
      const unitDurationDays = quantity > 0 ? Math.max(1, Math.round(totalDurationDays / quantity)) : 0;
      for (let i = 0; i < quantity; i++) {
        const entryEndDate = addDaysLocal(startDate, unitDurationDays * (i + 1));
        if (entryEndDate && currDateObj && entryEndDate <= currDateObj) {
          completedCount++;
        }
      }
    }

    const deliveredFromTask = Number(task.deliveredUnits || 0);
    const activeCompleted = Math.max(deliveredFromTask, completedCount);
    const effectiveReady = Math.max(baseExisting, activeCompleted);
    const consumed = Math.max(0, Number(countryDetail?.icbm_consumed || 0));
    return Math.max(0, effectiveReady - consumed);
  };

  const mergedIcbmOwners = useMemo(() => {
    const mapBySlug = new Map<string, DatabaseIcbmRow>();

    const selectedCountryName = String(
      countryDetail?.country || countryDetail?.nama_negara || countryDetail?.name_id || countryDetail?.name_en || ""
    ).toLowerCase().trim();
    const playerSlug = String(countryDetail?.country_slug || "").toLowerCase().trim();
    const playerIso = String(countryDetail?.iso || countryDetail?.iso_code || "").toLowerCase().trim();

    const checkIsPlayer = (slug: string, name: string, iso: string) => {
      const s = String(slug || '').toLowerCase().trim();
      const n = String(name || '').toLowerCase().trim();
      const i = String(iso || '').toLowerCase().trim();

      if (playerSlug && s && playerSlug === s) return true;
      if (selectedCountryName && n && selectedCountryName === n) return true;
      if (playerIso && i && playerIso === i) return true;
      return false;
    };

    const calculatedPlayerTotal = calculatePlayerReadyIcbm();
    const hasPlayerActiveProgram = Boolean(countryDetail?.programNuklirActive);
    const isPlayerResearching = Boolean(
      !hasPlayerActiveProgram &&
      Array.isArray(countryDetail?.ongoingConstructions) &&
      countryDetail.ongoingConstructions.some((c: any) => c.buildingKey === "program_nuklir")
    );

    let userFoundInDefault = false;
    for (const item of icbmList) {
      if (item.icbm_status) {
        const itemSlug = item.country_slug.toLowerCase().trim();
        const isUser = checkIsPlayer(itemSlug, item.country_name, item.iso);

        if (isUser) {
          userFoundInDefault = true;
          const playerHasNuclear = hasPlayerActiveProgram || calculatedPlayerTotal > 0 || isPlayerResearching;
          mapBySlug.set(itemSlug, {
            ...item,
            icbm_jumlah: calculatedPlayerTotal,
            icbm_status: calculatedPlayerTotal > 0,
            has_nuclear_program: playerHasNuclear,
            nuclear_program_status: (hasPlayerActiveProgram || calculatedPlayerTotal > 0) ? 'AKTIF' : isPlayerResearching ? 'RISET' : 'BELUM AKTIF',
          });
        } else {
          mapBySlug.set(itemSlug, {
            ...item,
            has_nuclear_program: true,
            nuclear_program_status: 'AKTIF',
          });
        }
      }
    }

    if (!userFoundInDefault && playerSlug) {
      const playerHasNuclear = hasPlayerActiveProgram || calculatedPlayerTotal > 0 || isPlayerResearching;
      mapBySlug.set(playerSlug, {
        country_id: Number(countryDetail?.id) || 999,
        country_slug: playerSlug,
        country_name: countryDetail?.country || countryDetail?.nama_negara || "Negara Pemain",
        iso: countryDetail?.iso || "ID",
        icbm_status: calculatedPlayerTotal > 0,
        icbm_jumlah: calculatedPlayerTotal,
        has_nuclear_program: playerHasNuclear,
        nuclear_program_status: (hasPlayerActiveProgram || calculatedPlayerTotal > 0) ? 'AKTIF' : isPlayerResearching ? 'RISET' : 'BELUM AKTIF',
      });
    }

    const simSnapshot = getNpcCountrySimulationSnapshot();
    const simCountriesMap = simSnapshot?.countries || {};

    const currDateObj = currentDate
      ? parseDateLocal(currentDate)
      : (typeof window !== 'undefined' && (window as any).neosantara_current_date)
        ? parseDateLocal((window as any).neosantara_current_date)
        : new Date();

    const processedSlugs = new Set<string>();

    const evaluateNpcNuclear = (npcSlug: string, fallbackMeta?: any) => {
      if (!npcSlug || processedSlugs.has(npcSlug)) return;
      if (checkIsPlayer(npcSlug, fallbackMeta?.name_id || fallbackMeta?.nama_negara || fallbackMeta?.country || "", fallbackMeta?.iso || "")) {
        return;
      }
      processedSlugs.add(npcSlug);

      const liveState = (simCountriesMap[npcSlug] || {}) as Record<string, any>;
      const npcIcbmStatus = Boolean(liveState.icbm_status);
      const npcIcbmCount = Number(liveState.icbm_jumlah ?? 0);
      let npcNuclearActive = Boolean(liveState.programNuklirActive);

      const npcNuclearQueue = Array.isArray(liveState.ai_nuclear_queue) ? liveState.ai_nuclear_queue : [];
      const ongoingList = Array.isArray(liveState.ongoingConstructions) ? liveState.ongoingConstructions : [];

      let isNpcResearchingNuclear = false;

      if (!npcNuclearActive) {
        const programOngoing = ongoingList.find((c: any) => c.buildingKey === "program_nuklir");
        const programQueue = npcNuclearQueue.find((q: any) => q.type === "program_nuklir");

        const targetDateStr = programOngoing?.endDate || programQueue?.completionDate;
        if (targetDateStr && currDateObj) {
          const targetDateObj = parseDateLocal(targetDateStr);
          if (targetDateObj && targetDateObj <= currDateObj) {
            npcNuclearActive = true;
          } else {
            isNpcResearchingNuclear = true;
          }
        } else if (programOngoing || programQueue) {
          isNpcResearchingNuclear = true;
        }
      }

      const existing = mapBySlug.get(npcSlug);
      const isDefaultNuclear = Boolean(existing && existing.icbm_jumlah > 0);
      if (isDefaultNuclear) {
        npcNuclearActive = true;
        isNpcResearchingNuclear = false;
      }

      // Hitung unit ICBM dari antrean NPC yang sedang dibangun atau sudah selesai bertahap
      let npcQueueDelivered = 0;
      let npcQueueInProgress = 0;
      const icbmTask = liveState.icbmBuildTask;
      const icbmQueue = npcNuclearQueue.filter((q: any) => q.type === "icbm");

      if (icbmTask && icbmTask.startDate) {
        const qty = Math.max(0, Number(icbmTask.quantity) || 0);
        const sDate = parseDateLocal(icbmTask.startDate);
        const eDate = parseDateLocal(icbmTask.endDate);
        const totalDur = getDurationDaysLocal(sDate, eDate);
        if (icbmTask.completed) {
          npcQueueDelivered = qty;
        } else if (sDate && qty > 0) {
          const unitDur = Math.max(1, Math.round(totalDur / qty));
          let finished = 0;
          for (let i = 0; i < qty; i++) {
            const dueDate = addDaysLocal(sDate, unitDur * (i + 1));
            if (dueDate && currDateObj && dueDate <= currDateObj) {
              finished++;
            }
          }
          const deliveredSaved = Number(icbmTask.deliveredUnits || 0);
          npcQueueDelivered = Math.max(deliveredSaved, finished);
          npcQueueInProgress = Math.max(0, qty - npcQueueDelivered);
        }
      } else if (icbmQueue.length > 0) {
        for (const q of icbmQueue) {
          const qty = Math.max(0, Number(q.quantity) || 0);
          const sDate = parseDateLocal(q.startDate);
          const eDate = parseDateLocal(q.completionDate);
          const totalDur = getDurationDaysLocal(sDate, eDate);
          if (eDate && currDateObj && eDate <= currDateObj) {
            npcQueueDelivered += qty;
          } else if (sDate && qty > 0) {
            const unitDur = Math.max(1, Math.round(totalDur / qty));
            let finished = 0;
            for (let i = 0; i < qty; i++) {
              const dueDate = addDaysLocal(sDate, unitDur * (i + 1));
              if (dueDate && currDateObj && dueDate <= currDateObj) {
                finished++;
              }
            }
            npcQueueDelivered += finished;
            npcQueueInProgress += Math.max(0, qty - finished);
          } else {
            npcQueueInProgress += qty;
          }
        }
      }

      const baseDefaultCount = Number(existing?.icbm_jumlah || 0);
      const totalIcbmCurrent = Math.max(
        npcIcbmCount,
        baseDefaultCount + npcQueueDelivered
      );

      if (npcNuclearActive || isNpcResearchingNuclear || (npcIcbmStatus && totalIcbmCurrent > 0) || isDefaultNuclear || npcQueueInProgress > 0) {
        const hasNuclear = npcNuclearActive || isNpcResearchingNuclear || Boolean(existing?.has_nuclear_program);
        const progStatus: 'AKTIF' | 'RISET' | 'BELUM AKTIF' =
          (npcNuclearActive || isDefaultNuclear || existing?.nuclear_program_status === 'AKTIF')
            ? 'AKTIF'
            : isNpcResearchingNuclear
              ? 'RISET'
              : 'BELUM AKTIF';

        mapBySlug.set(npcSlug, {
          country_id: Number(liveState.id || fallbackMeta?.id || existing?.country_id || 0),
          country_slug: npcSlug,
          country_name: String(fallbackMeta?.name_id || fallbackMeta?.nama_negara || fallbackMeta?.country || liveState.name_id || liveState.nama_negara || liveState.country || existing?.country_name || npcSlug),
          iso: String(fallbackMeta?.iso || liveState.iso || existing?.iso || ""),
          icbm_status: totalIcbmCurrent > 0 || Boolean(existing?.icbm_status),
          icbm_jumlah: totalIcbmCurrent,
          in_progress_icbm: npcQueueInProgress,
          has_nuclear_program: hasNuclear,
          nuclear_program_status: progStatus,
        });
      }
    };

    if (Array.isArray(prefetchedAllCountries)) {
      for (const npc of prefetchedAllCountries) {
        const npcSlug = String(npc.country_slug || npc.slug || "").toLowerCase().trim();
        if (npcSlug) {
          evaluateNpcNuclear(npcSlug, npc);
        }
      }
    }

    for (const slug of Object.keys(simCountriesMap)) {
      evaluateNpcNuclear(slug.toLowerCase().trim());
    }

    return Array.from(mapBySlug.values());
  }, [icbmList, countryDetail, prefetchedAllCountries, currentDate, simulationVersion]);

  const filteredIcbmOwners = useMemo(() => {
    let list = mergedIcbmOwners.filter(
      (item) => (item.icbm_status && item.icbm_jumlah > 0) || item.has_nuclear_program
    );

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      list = list.filter((item) =>
        item.country_name.toLowerCase().includes(query) ||
        item.country_slug.toLowerCase().includes(query) ||
        item.iso.toLowerCase().includes(query)
      );
    }

    return list.sort((a, b) => {
      if (b.icbm_jumlah !== a.icbm_jumlah) {
        return b.icbm_jumlah - a.icbm_jumlah;
      }
      if (a.has_nuclear_program !== b.has_nuclear_program) {
        return a.has_nuclear_program ? -1 : 1;
      }
      return a.country_name.localeCompare(b.country_name, 'id');
    });
  }, [mergedIcbmOwners, searchQuery, countryDetail]);

  if (!isOpen) return null;

  return (
    <NotebookModalWrapper onClose={onClose}>
      <div className="flex h-full flex-col overflow-hidden">
        
        {/* Header Modal */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/30 flex flex-wrap items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0 gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-[#0F2424] rounded-xl border border-[#00FFAA]/30">
              <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-[#00FFAA] animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">Status Nuklir & ICBM Dunia</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B8A8A] mt-1">
                Daftar negara berkemampuan Nuklir & ICBM global ({filteredIcbmOwners.length} negara)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-xs justify-end">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#00FFAA]/60" />
              <input
                type="text"
                placeholder="Cari negara nuklir / ICBM..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0F2424] border border-[#00FFAA]/30 rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#00FFAA] placeholder-[#6B8A8A] focus:outline-none focus:border-[#00FFAA] transition-all"
              />
            </div>

            <button 
              onClick={onClose} 
              className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm shrink-0"
            >
              <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 bg-[#0F2424] custom-scrollbar flex flex-col gap-4">
          <div className="overflow-hidden border border-[#00FFAA]/20 rounded-2xl bg-[#0A1A1A] shadow-inner flex flex-col flex-1">
            <div className="overflow-y-auto custom-scrollbar flex-1">
              <table className="w-full text-xs">
                <thead className="bg-[#0A1A1A] text-[#00FFAA] border-b border-[#00FFAA]/20 sticky top-0 z-10">
                  <tr>
                    <th className="sticky top-0 z-10 bg-[#0A1A1A] px-3 py-2.5 text-left text-[9px] sm:text-[10px] font-black uppercase tracking-wider whitespace-nowrap">No</th>
                    <th className="sticky top-0 z-10 bg-[#0A1A1A] px-3 py-2.5 text-left text-[9px] sm:text-[10px] font-black uppercase tracking-wider whitespace-nowrap">Negara</th>
                    <th className="sticky top-0 z-10 bg-[#0A1A1A] px-3 py-2.5 text-center text-[9px] sm:text-[10px] font-black uppercase tracking-wider whitespace-nowrap">Kode ISO</th>
                    <th className="sticky top-0 z-10 bg-[#0A1A1A] px-3 py-2.5 text-center text-[9px] sm:text-[10px] font-black uppercase tracking-wider whitespace-nowrap">Program Nuklir</th>
                    <th className="sticky top-0 z-10 bg-[#0A1A1A] px-3 py-2.5 text-center text-[9px] sm:text-[10px] font-black uppercase tracking-wider whitespace-nowrap">Status ICBM</th>
                    <th className="sticky top-0 z-10 bg-[#0A1A1A] px-3 py-2.5 text-right text-[9px] sm:text-[10px] font-black uppercase tracking-wider whitespace-nowrap">Jumlah ICBM</th>
                    <th className="sticky top-0 z-10 bg-[#0A1A1A] px-3 py-2.5 text-center text-[9px] sm:text-[10px] font-black uppercase tracking-wider whitespace-nowrap">Level Ancaman</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#00FFAA]/10 text-xs font-bold text-[#E0E0E0]">
                  {isLoadingIcbm ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-[#00FFAA]">
                        Memuat data negara berkemampuan Nuklir & ICBM...
                      </td>
                    </tr>
                  ) : filteredIcbmOwners.length > 0 ? (
                    filteredIcbmOwners.map((row, idx) => {
                      const selectedCountryName = countryDetail?.country || countryDetail?.nama_negara || countryDetail?.name_id || countryDetail?.name_en || "Negara";
                      const isUserCountry = row.country_name.toLowerCase().trim() === selectedCountryName.toLowerCase().trim() ||
                                            row.country_slug.toLowerCase().trim() === (countryDetail?.country_slug || "").toLowerCase().trim();

                      return (
                        <tr 
                          key={row.country_id || row.country_slug}
                          className={`transition-colors ${
                            isUserCountry
                              ? 'bg-[#00FFAA]/10 border-l-4 border-l-[#00FFAA]'
                              : 'hover:bg-[#0F2424]'
                          }`}
                        >
                          <td className="px-3 py-2.5 text-[#6B8A8A]">#{idx + 1}</td>
                          <td className="px-3 py-2.5 font-black text-[#E0E0E0] flex items-center gap-2">
                            <Rocket className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span>{row.country_name}</span>
                            {isUserCountry && <span className="text-[10px] text-[#00FFAA] ml-1 font-bold">(Anda)</span>}
                          </td>
                          <td className="px-3 py-2.5 text-center uppercase tracking-widest text-[#6B8A8A] font-mono">
                            {row.iso}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            {row.nuclear_program_status === 'AKTIF' || (!row.nuclear_program_status && row.has_nuclear_program) ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#00FFAA]/20 text-[#00FFAA] border border-[#00FFAA]/40">
                                AKTIF
                              </span>
                            ) : row.nuclear_program_status === 'RISET' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/40 animate-pulse">
                                DALAM RISET
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#6B8A8A]/10 text-[#6B8A8A] border border-[#6B8A8A]/20">
                                BELUM AKTIF
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            {row.icbm_status && row.icbm_jumlah > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                <ShieldAlert className="w-3 h-3" />
                                AKTIF
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#6B8A8A]/10 text-[#6B8A8A] border border-[#6B8A8A]/20">
                                BELUM ADA
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-right font-black text-[#00FFAA] text-sm whitespace-nowrap">
                            {formatNumber(row.icbm_jumlah)}{" "}
                            {Boolean(row.in_progress_icbm && row.in_progress_icbm > 0) && (
                              <span className="text-[11px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-1.5 py-0.5 rounded-full ml-1" title="Sedang dalam proses perakitan">
                                +{row.in_progress_icbm}
                              </span>
                            )}
                            <span className="text-[10px] font-normal text-[#6B8A8A] ml-1">Unit</span>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#0A1A1A] border border-[#00FFAA]/30 text-[#00FFAA]">
                              {row.icbm_jumlah >= 300 ? 'Level V (Superpower)' : row.icbm_jumlah >= 10 ? 'Level III (Regional)' : row.icbm_jumlah > 0 ? 'Level II (Terkonfirmasi)' : 'Level I (Riset Nuklir)'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-[#6B8A8A]">
                        Data negara berkemampuan nuklir belum ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </NotebookModalWrapper>
  );
}
