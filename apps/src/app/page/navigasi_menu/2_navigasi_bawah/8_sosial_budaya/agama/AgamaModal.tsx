"use client"
import RootTable from "@/app/page/root_modals_design_menu/RootTable";
import RootModalCloseButton from '@/app/page/root_modals_design_menu/RootModalCloseButton';
import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Star, Globe, MoonStar, Church, Sun, CircleDot, Atom, Check } from "lucide-react";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import RootModalTabs from "@/app/page/root_modals_design_menu/RootModalTabs";
import MenuInfoButton from "../../MenuInfoButton";
import { COUNTRIES_DATA } from "../../../../map_system/map-data";
import { fetchAllCountryProfilesFromDb, type CountryProfile } from "@/../../json/semua_fitur_negara/0_profiles/index";

// 🔥 IMPOR MODAL KONFIRMASI DAN GAGAL
import AgamaConfirmModal from "./KonfirmasiPerubahanAgamaModal";
import AgamaGagalModal from "./DanaTidakCukupAgamaModal";

// 🔥 IMPOR LOGIKA DARI FILE LOGIKA (Pastikan file logikaPergantian.ts memiliki attemptChangeReligion dan RELIGION_CHANGE_COST)
import { attemptChangeReligion, RELIGION_CHANGE_COST } from "./logic/logikaPergantian";
import {
  generateReligionChangeNotification,
  type ReligionChangeNotification,
} from "@/app/page/menus/inbox/logic/10_sosial_budaya/1_notifikasi_agama/religionChangeLogic";
import {
  createPendingSocialCulturalChange,
  formatSocialCulturalChangeDate,
  isPendingSocialCulturalChange,
  SOCIAL_CULTURAL_CHANGE_DELAY_DAYS,
  type PendingSocialCulturalChange,
} from "@/app/page/menus/inbox/logic/10_sosial_budaya/socialCulturalChangeLogic";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDebt?: () => void;
  countryDetail: any;
  setCountryDetail?: (detail: any | ((prev: any) => any)) => void;
  onNotification?: (notification: ReligionChangeNotification) => void;
}

const RELIGION_OPTIONS = [
  'Islam', 'Katolik', 'Protestan', 'Kristen Ortodoks', 'Hindu', 'Buddha', 'Yahudi', 'Shinto', 'Ateisme',
];

const getReligionImage = (religionName: string) => {
  const index = RELIGION_OPTIONS.indexOf(religionName);
  return index >= 0
    ? `/images/game/interface/sub-tabs/sosial-budaya/agama/agama-asset-${String(index + 1).padStart(2, '0')}.svg`
    : null;
};

const RELIGION_BONUSES: Record<string, string> = {
  'Islam': 'Jumlah makanan dan sumber daya: +10%',
  'Katolik': 'Pengaruh Suara Negara di PBB: +10',
  'Protestan': 'Harga jual: +5%, Harga beli: -5%',
  'Kristen Ortodoks': 'Penerimaan Pajak Penghasilan Pribadi: +5%',
  'Hindu': 'Laju Pertumbuhan Populasi: +8%',
  'Buddha': 'Penerimaan Pajak Lingkungan: +10%',
  'Yahudi': 'Waktu pembangunan pabrik dan tambang: -10%',
  'Shinto': 'Produksi Kelistrikan: +10%',
  'Ateisme': 'Kecepatan Riset Sains: +15%',
};

const RELIGION_ICONS: Record<string, React.ReactNode> = {
  'Islam': <MoonStar className="w-5 h-5" />,
  'Katolik': <Church className="w-5 h-5" />,
  'Protestan': <Church className="w-5 h-5" />,
  'Kristen Ortodoks': <Church className="w-5 h-5" />,
  'Hindu': <Sun className="w-5 h-5" />,
  'Buddha': <CircleDot className="w-5 h-5" />,
  'Yahudi': <Star className="w-5 h-5" />,
  'Shinto': <Globe className="w-5 h-5" />,
  'Ateisme': <Atom className="w-5 h-5" />,
};

export default function AgamaModal({ isOpen, onClose, onOpenDebt, countryDetail, setCountryDetail, onNotification }: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"agama" | "dunia">("agama");
  const [selectedReligion, setSelectedReligion] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // 🔥 STATE UNTUK MODAL KONFIRMASI & GAGAL
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCurrentReligionInfoOpen, setIsCurrentReligionInfoOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const [worldReligions, setWorldReligions] = useState<{ country: string; religion: string }[]>([]);
  const [countryProfiles, setCountryProfiles] = useState<CountryProfile[]>([]);
  const [sortMode, setSortMode] = useState<"default" | "unavailable-last" | "az" | "za">("default");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    let isCurrent = true;
    fetchAllCountryProfilesFromDb().then((profiles) => {
      if (isCurrent) setCountryProfiles(profiles);
    });
    return () => {
      isCurrent = false;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const profileLookup = new Map<string, string>();
    for (const p of countryProfiles) {
      profileLookup.set(p.name_id.toLowerCase().trim(), p.religion);
    }

    const annexedStore = (typeof window !== 'undefined' ? (window as any).neosantara_annexed_countries : {}) || {};

    const data = COUNTRIES_DATA
      .filter((c) => {
        const raw = String(c.country || '').trim();
        const norm = raw.toLowerCase();
        const clean = norm.replace(/[^a-z0-9]/g, '');
        const iso = String(c.iso || '').toLowerCase().trim();

        if (annexedStore[raw] || annexedStore[norm] || (clean && annexedStore[clean])) return false;
        if (iso && (annexedStore[iso] || annexedStore[`iso_${iso}`])) return false;
        return true;
      })
      .map((c) => {
        const countryNameLower = c.country.toLowerCase().trim();
        if (
          countryDetail?.country &&
          c.country.toLowerCase().trim() === countryDetail.country.toLowerCase().trim() &&
          countryDetail?.religion
        ) {
          return { country: c.country, religion: countryDetail.religion };
        }
        const profileReligion = profileLookup.get(countryNameLower);
        return { country: c.country, religion: profileReligion || 'Belum tersedia' };
      });
    setWorldReligions(data);
  }, [isOpen, countryDetail, countryProfiles]);

  const sortedWorldReligions = useMemo(() => {
    if (sortMode === "default") return worldReligions;
    return [...worldReligions].sort((a, b) => {
      const aUnav = a.religion === 'Belum tersedia';
      const bUnav = b.religion === 'Belum tersedia';

      if (sortMode === "unavailable-last") {
        if (aUnav && !bUnav) return 1;
        if (!aUnav && bUnav) return -1;
        return a.religion.localeCompare(b.religion);
      }
      const compare = a.religion.localeCompare(b.religion);
      return sortMode === "az" ? compare : -compare;
    });
  }, [worldReligions, sortMode]);

  const cycleSortMode = () => {
    setSortMode((prev) => {
      if (prev === "default") return "unavailable-last";
      if (prev === "unavailable-last") return "az";
      if (prev === "az") return "za";
      return "default";
    });
  };

  if (!isOpen || !mounted) return null;
  const userCountry = worldReligions.find((item) =>
    item.country.toLowerCase().trim() === countryDetail?.country?.toLowerCase().trim()
  );
  const userReligion = userCountry?.religion || countryDetail?.religion;
  const sameReligionCount = userReligion && userReligion !== "Belum tersedia" && worldReligions.length > 0
    ? worldReligions.filter((item) =>
      item.religion.toLowerCase().trim() === userReligion.toLowerCase().trim()
    ).length
    : null;
  const religion = countryDetail?.religion || "Mayoritas Muslim";
  const anggaran = Number(countryDetail?.anggaran) || 0;
  const pendingSocialChanges: PendingSocialCulturalChange[] = Array.isArray(countryDetail?.pending_social_cultural_changes)
    ? countryDetail.pending_social_cultural_changes.filter(isPendingSocialCulturalChange)
    : [];
  const pendingReligionChange = pendingSocialChanges.find(change => change.type === 'religion');

  const handleSelectReligion = (religionName: string) => {
    setSelectedReligion(religionName);
    if (religionName.toLowerCase().trim() === religion.toLowerCase().trim()) {
      setIsCurrentReligionInfoOpen(true);
      return;
    }
    setIsCurrentReligionInfoOpen(false);
    setIsConfirmOpen(true);
  };

  const handleChange = (isInstant: boolean) => {
    if (!selectedReligion || isSaving) return;
    const pendingChanges: PendingSocialCulturalChange[] = Array.isArray(countryDetail?.pending_social_cultural_changes)
      ? countryDetail.pending_social_cultural_changes
      : [];
    const canceledPendingChange = isInstant && pendingChanges.some((change) => change.type === 'religion');
    if (!isInstant && pendingChanges.some((change) => change.type === 'religion')) {
      setFeedback({
        type: "error",
        message: "Perubahan agama lain masih menunggu penyelesaian. Tunggu hingga selesai sebelum menjadwalkan perubahan baru.",
      });
      setIsConfirmOpen(false);
      return;
    }

    const result = attemptChangeReligion(anggaran);
    if (!result.success) {
      setIsConfirmOpen(false);
      setShowErrorModal(true);
      return;
    }

    setIsSaving(true);
    const oldReligion = countryDetail?.religion || "Islam";
    const dateStr = countryDetail?.current_date || new Date().toISOString().split('T')[0];
    let scheduledChange: PendingSocialCulturalChange | null = null;
    if (!isInstant) {
      try {
        scheduledChange = createPendingSocialCulturalChange('religion', oldReligion, selectedReligion, dateStr);
      } catch (error) {
        setFeedback({
          type: "error",
          message: error instanceof Error ? error.message : "Tanggal perubahan agama tidak valid.",
        });
        setIsConfirmOpen(false);
        setIsSaving(false);
        return;
      }
    }
    const notification = isInstant
      ? generateReligionChangeNotification(oldReligion, selectedReligion, dateStr)
      : scheduledChange
        ? generateReligionChangeNotification(oldReligion, selectedReligion, dateStr, scheduledChange.endDate)
        : null;

    if (notification) onNotification?.(notification);
    setCountryDetail?.((prev: Record<string, unknown> | null) => {
      const currentPendingChanges: PendingSocialCulturalChange[] = Array.isArray(prev?.pending_social_cultural_changes)
        ? prev.pending_social_cultural_changes
        : [];
      const nextPendingChanges = scheduledChange
        ? [...currentPendingChanges, scheduledChange]
        : isInstant
          ? currentPendingChanges.filter((change) => change.type !== 'religion')
          : currentPendingChanges;
      const currentNotifications = Array.isArray(prev?.pending_notifications) ? prev.pending_notifications : [];
      return {
        ...(prev || {}),
        ...(isInstant ? { religion: selectedReligion } : {}),
        anggaran: result.newAnggaran,
        ...(notification ? { pending_notifications: [notification, ...currentNotifications] } : {}),
        ...(scheduledChange || isInstant ? { pending_social_cultural_changes: nextPendingChanges } : {}),
        message: isInstant
          ? `Agama negara langsung diubah ke ${selectedReligion}.${canceledPendingChange ? ' Jadwal perubahan sebelumnya dibatalkan.' : ''} Biaya perubahan ${RELIGION_CHANGE_COST.toLocaleString('id-ID', { maximumFractionDigits: 2 })} NEO.`
          : `Perubahan agama ke ${selectedReligion} dijadwalkan dalam ${SOCIAL_CULTURAL_CHANGE_DELAY_DAYS} hari. Biaya ${RELIGION_CHANGE_COST.toLocaleString('id-ID', { maximumFractionDigits: 2 })} NEO telah dipotong.`,
      };
    });
    setFeedback({
      type: "success",
      message: isInstant
        ? `Agama berhasil diubah seketika menjadi ${selectedReligion}.${canceledPendingChange ? ' Jadwal perubahan sebelumnya dibatalkan.' : ''} Biaya ${RELIGION_CHANGE_COST.toLocaleString('id-ID', { maximumFractionDigits: 2 })} NEO telah dipotong.`
        : `Perubahan agama menjadi ${selectedReligion} dijadwalkan selesai dalam ${SOCIAL_CULTURAL_CHANGE_DELAY_DAYS} hari. Biaya ${RELIGION_CHANGE_COST.toLocaleString('id-ID', { maximumFractionDigits: 2 })} NEO telah dipotong.`,
    });
    setIsConfirmOpen(false);
    setIsSaving(false);
  };

  return createPortal(
    <>
      {/* 🔥 RENDER KONFIRMASI & GAGAL MODAL */}
      <AgamaConfirmModal
        isOpen={isConfirmOpen || isCurrentReligionInfoOpen}
        isInfoMode={isCurrentReligionInfoOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setIsCurrentReligionInfoOpen(false);
        }}
        onInstantChange={() => handleChange(true)}
        onConfirm={() => handleChange(false)}
        title={selectedReligion || ''}
        icon={selectedReligion ? RELIGION_ICONS[selectedReligion] : <Globe className="w-5 h-5" />}
        bonusText={selectedReligion ? RELIGION_BONUSES[selectedReligion] || 'Tidak ada bonus spesifik' : ''}
        cost={RELIGION_CHANGE_COST}
      />
      <AgamaGagalModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        onBorrow={onOpenDebt}
        cost={RELIGION_CHANGE_COST}
        currentMoney={anggaran}
      />

      {/* MODAL UTAMA AGAMA */}
      {!isConfirmOpen && !isCurrentReligionInfoOpen && !showErrorModal && (
      <NotebookModalWrapper onClose={onClose}>
        <div className="root-modal-util-52b6b298fe">
          <div className="satisfaction-modal-header root-modal-util-4450f1d9ee">
            <div className="satisfaction-modal-header-main root-modal-util-935108d13c no-scrollbar">
              <div className="root-modal-util-c7c918256f">
                <div className="root-modal-util-acd42b9a36">
                  <Star aria-hidden="true" className="root-modal-util-ea2c28151c animate-spin" style={{ animationDuration: '12s' }} />
                </div>
                <div>
                  <h2 className="root-modal-util-6b4648c53a root-modal-util-c2385a463d">
                    Agama & Kebebasan Berkeyakinan
                  </h2>
                </div>
              </div>
            </div>
            <div className="root-modal-util-6cfc7e6ab3">
              <MenuInfoButton
                title="Agama & Kepercayaan"
                description="Pilih dan kelola agama atau kepercayaan negara, lalu tinjau persebarannya di dunia. Setiap pilihan memiliki bonus tersendiri dan perubahan agama memerlukan biaya serta konfirmasi."
              />
              <RootModalCloseButton onClick={onClose} />
            </div>
          </div>

          <div className="satisfaction-modal-summary root-modal-util-6614545ce3">
            <div className="root-modal-util-6cfc7e6ab3 flex-wrap">
              <Star aria-hidden="true" className="root-modal-util-00f4ec4a9a" />
              <span className="root-modal-util-14d6efe9ef root-modal-util-614c0c7dff">Agama Saat Ini:</span>
              <span className="root-modal-util-04f32edb66 root-modal-util-4457a4d3a8">{religion}</span>
              <span className="root-modal-util-14d6efe9ef root-modal-util-614c0c7dff">Anggaran:</span>
              <span className="root-modal-util-04f32edb66 root-modal-util-4457a4d3a8">{anggaran.toLocaleString('id-ID', { maximumFractionDigits: 2 })} NEO</span>
            </div>
            <div className="satisfaction-modal-summary-controls">
              <RootModalTabs
                className="satisfaction-modal-tabs"
                items={[
                  {
                    label: "Agama & Kebebasan Berkeyakinan",
                    isActive: activeTab === "agama",
                    onClick: () => setActiveTab("agama"),
                    onPointerDown: () => setActiveTab("agama"),
                  },
                  {
                    label: "Agama Dunia",
                    isActive: activeTab === "dunia",
                    onClick: () => setActiveTab("dunia"),
                    onPointerDown: () => setActiveTab("dunia"),
                  },
                ]}
              />
            </div>
          </div>

          <div className="satisfaction-modal-content satisfaction-modal-content-body root-modal-enter root-modal-fade-in root-modal-util-9c12d57a09 root-modal-util-90f9f3a7db flex min-h-0 flex-col">
            {activeTab === "agama" && (
              <div className="space-y-6">
                <div className="root-modal-util-8230f2ccb3">
                  <div className="root-modal-util-7ccf491d2f">
                    <Star aria-hidden="true" className="root-modal-util-79b40bc7fa" />
                  </div>
                  <h3 className="root-modal-util-9361ef65fc root-modal-util-cdb3e20c19">Pilih Agama Baru</h3>
                  <div className="root-modal-util-d43b1ea5a7" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {RELIGION_OPTIONS.map((r) => {
                    const isActive = String(countryDetail?.religion || '').toLowerCase() === String(r).toLowerCase();
                    const isSelected = String(selectedReligion || '').toLowerCase() === String(r).toLowerCase();
                    const isScheduled = pendingReligionChange?.toValue.toLowerCase() === r.toLowerCase();

                    return (
                      <div key={r} className="relative">
                        {isScheduled && pendingReligionChange && (
                          <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20 bg-root-canvas text-root-accent text-[10px] font-bold px-2 py-1 border border-root-accent/30 rounded-sm shadow-md tracking-wider whitespace-nowrap">
                            {formatSocialCulturalChangeDate(pendingReligionChange.endDate)}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleSelectReligion(r)}
                          className={`group flex w-full items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer text-left ${isActive
                              ? 'border-root-accent bg-root-accent/15 shadow-md'
                              : 'border-root-accent/20 bg-root-canvas hover:border-root-accent/50 hover:bg-root-accent/5'
                            }`}
                        >
                          <div className={`relative w-14 h-16 flex-shrink-0 rounded-md flex items-center justify-center shadow-lg border-b-[4px] bg-[#051111] border-root-accent/40`}>
                            {getReligionImage(r) ? (
                              <Image src={getReligionImage(r)!} alt="" aria-hidden="true" width={56} height={64} className="h-full w-full object-contain p-1" />
                            ) : (
                              <div className="text-root-accent">{RELIGION_ICONS[r] || <Globe className="w-5 h-5" />}</div>
                            )}
                          </div>

                        <div className="flex-1 flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            {isActive && <Check className="w-4 h-4 text-root-accent font-bold" />}
                            <span className={`text-sm font-bold ${isActive ? 'text-root-accent' : 'text-root-text'}`}>
                              {r}
                            </span>
                          </div>
                          <p className="text-xs text-root-subtle mt-1 leading-tight">
                            {RELIGION_BONUSES[r] || 'Tidak ada bonus spesifik'}
                          </p>
                          <span className="text-[10px] font-semibold text-root-accent mt-1">
                            Waktu perubahan: {SOCIAL_CULTURAL_CHANGE_DELAY_DAYS} hari (pilihan Ubah)
                          </span>
                        </div>
                        </button>
                      </div>
                    );
                  })}
                </div>

                {feedback && (
                  <div role={feedback.type === 'error' ? 'alert' : 'status'} className={`mt-6 p-4 rounded-xl border ${
                    feedback.type === 'success'
                      ? 'border-root-accent/30 bg-root-accent/10 text-root-accent'
                      : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                  }`}>{feedback.message}</div>
                )}
              </div>
            )}

            {activeTab === "dunia" && (
              <div className="flex min-h-0 flex-1 flex-col gap-4">
                <div className="root-modal-util-8230f2ccb3">
                  <div className="root-modal-util-7ccf491d2f">
                    <Globe aria-hidden="true" className="root-modal-util-79b40bc7fa" />
                  </div>
                  <h4 className="root-modal-util-9361ef65fc">Daftar Agama Seluruh Negara ({worldReligions.length} Negara)</h4>
                  <div className="root-modal-util-d43b1ea5a7" />
                  {sameReligionCount !== null && (
                    <span className="text-xs font-bold text-root-accent bg-root-accent/10 rounded-full px-2.5 py-1 whitespace-nowrap">
                      {sameReligionCount}/212 seagama
                    </span>
                  )}
                </div>
                <div className="min-h-0 flex-1 overflow-auto border border-root-accent/20 rounded-xl bg-root-canvas shadow-sm custom-scrollbar">
                  <RootTable className="w-full text-xs text-left border-collapse">
                    <thead className="bg-[#051111] border-b border-root-accent/20 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 font-bold text-root-accent uppercase tracking-wider w-12 text-center">No</th>
                        <th className="px-4 py-3 font-bold text-root-accent uppercase tracking-wider">Negara</th>
                        <th onClick={cycleSortMode} className="px-4 py-3 font-bold text-root-accent uppercase tracking-wider cursor-pointer hover:bg-root-accent/10 transition-colors">
                          Agama
                          <span className="ml-2 text-[10px] text-root-subtle">
                            {sortMode === "default" && "↕"}
                            {sortMode === "unavailable-last" && "↑↓"}
                            {sortMode === "az" && "↑"}
                            {sortMode === "za" && "↓"}
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-root-accent/10">
                      {sortedWorldReligions.map((item, idx) => {
                        const isUserCountry = countryDetail?.country &&
                          item.country.toLowerCase().trim() === countryDetail.country.toLowerCase().trim();
                        return (
                          <tr key={idx} className={`transition-colors ${isUserCountry ? 'bg-root-accent/15 hover:bg-root-accent/25 border-l-4 border-l-root-accent' : 'hover:bg-root-accent/5'}`}>
                            <td className={`px-4 py-2.5 text-center font-bold ${isUserCountry ? 'text-root-accent' : 'text-root-subtle'}`}>{idx + 1}</td>
                            <td className={`px-4 py-2.5 font-bold ${isUserCountry ? 'text-root-accent' : 'text-root-text'}`}>
                              {item.country}
                            </td>
                            <td className={`px-4 py-2.5 ${isUserCountry ? 'text-root-accent' : 'text-root-text'}`}>
                              {item.religion === 'Belum tersedia' ? (
                                <span className="text-root-subtle italic font-medium">Belum tersedia</span>
                              ) : (
                                <div className="flex items-center gap-2 font-bold">
                                  {getReligionImage(item.religion) ? (
                                    <Image src={getReligionImage(item.religion)!} alt="" aria-hidden="true" width={24} height={24} className="h-6 w-6 object-contain" />
                                  ) : (
                                    RELIGION_ICONS[item.religion] || <Globe className="w-4 h-4 text-root-accent" />
                                  )}
                                  {item.religion}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </RootTable>
                </div>
              </div>
            )}
          </div>
        </div>
      </NotebookModalWrapper>
      )}
    </>,
    document.body
  );
}