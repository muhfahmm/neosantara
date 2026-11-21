'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '@/app/page/paused_menu/terjemahan_paused_menu/languageLogic';
import {
  Trophy, Award, CheckCircle2, Lock, Sparkles, Gem, Coins,
  Smile, Users2, Zap, Landmark, Building2, Microscope,
  Briefcase, Globe, HeartHandshake, Shield, Siren, Filter
} from 'lucide-react';

export type AchievementCategory =
  | 'kepuasan'
  | 'populasi'
  | 'produksi'
  | 'ekonomi'
  | 'pembangunan'
  | 'penelitian'
  | 'kementerian'
  | 'geopolitik'
  | 'sosial_budaya'
  | 'pertahanan'
  | 'tanggap_darurat';

export interface AchievementItem {
  id: string;
  category: AchievementCategory;
  icon: React.ElementType;
  accent: string;
  maxProgress: number;
  reward: {
    gems?: number;
    neo?: number;
    titleBadge?: string;
  };
  computeProgress: (countryDetail: any) => { current: number; isUnlocked: boolean };
}

const ACHIEVEMENT_DEFINITIONS: AchievementItem[] = [
  // Kepuasan & Kesejahteraan
  {
    id: 'negara_sejahtera',
    category: 'kepuasan',
    icon: Smile,
    accent: '#10b981',
    maxProgress: 100,
    reward: { gems: 150, neo: 50000000 },
    computeProgress: (cd) => {
      const kepuasan = cd?.kepuasan ?? cd?.satisfaction ?? 75;
      const current = Math.min(100, Math.round(kepuasan));
      return { current, isUnlocked: kepuasan >= 80 };
    },
  },
  {
    id: 'kebahagiaan_merata',
    category: 'kepuasan',
    icon: Award,
    accent: '#34d399',
    maxProgress: 5,
    reward: { gems: 100, neo: 30000000 },
    computeProgress: (cd) => {
      const sectors = cd?.sectorsSatisfaction || {};
      const count = Object.values(sectors).filter((v: any) => Number(v) >= 70).length;
      const current = Math.min(5, count > 0 ? count : 3);
      return { current, isUnlocked: current >= 5 };
    },
  },
  {
    id: 'rumah_untuk_semua',
    category: 'kepuasan',
    icon: Building2,
    accent: '#059669',
    maxProgress: 1,
    reward: { gems: 120, neo: 40000000 },
    computeProgress: (cd) => {
      const tunawisma = cd?.tunawisma ?? 0;
      const isUnlocked = tunawisma === 0;
      return { current: isUnlocked ? 1 : 0, isUnlocked };
    },
  },

  // Populasi
  {
    id: 'layanan_untuk_semua',
    category: 'populasi',
    icon: Users2,
    accent: '#3b82f6',
    maxProgress: 4,
    reward: { gems: 150, neo: 60000000 },
    computeProgress: (cd) => {
      let met = 2;
      if (cd?.listrikDefisit === 0) met++;
      if (cd?.panganSurplus) met++;
      return { current: Math.min(4, met), isUnlocked: met >= 4 };
    },
  },
  {
    id: 'penduduk_sehat',
    category: 'populasi',
    icon: Users2,
    accent: '#60a5fa',
    maxProgress: 100,
    reward: { gems: 100, neo: 35000000 },
    computeProgress: (cd) => {
      const health = cd?.healthIndex ?? 85;
      return { current: Math.min(100, health), isUnlocked: health >= 80 };
    },
  },
  {
    id: 'pertumbuhan_terjaga',
    category: 'populasi',
    icon: Users2,
    accent: '#2563eb',
    maxProgress: 1,
    reward: { gems: 120, neo: 45000000 },
    computeProgress: (cd) => {
      const pop = cd?.population ?? 1000000;
      const isUnlocked = pop >= 1500000;
      return { current: isUnlocked ? 1 : 0, isUnlocked };
    },
  },

  // Produksi & Konsumsi
  {
    id: 'mandiri_energi',
    category: 'produksi',
    icon: Zap,
    accent: '#f59e0b',
    maxProgress: 100,
    reward: { gems: 200, neo: 80000000 },
    computeProgress: (cd) => {
      const defisit = cd?.listrikDefisit ?? 0;
      return { current: defisit === 0 ? 100 : 50, isUnlocked: defisit === 0 };
    },
  },
  {
    id: 'lumbung_pangan',
    category: 'produksi',
    icon: Zap,
    accent: '#fbbf24',
    maxProgress: 1,
    reward: { gems: 180, neo: 70000000 },
    computeProgress: (cd) => {
      const surplus = cd?.panganSurplus ?? true;
      return { current: surplus ? 1 : 0, isUnlocked: Boolean(surplus) };
    },
  },
  {
    id: 'rantai_produksi_lengkap',
    category: 'produksi',
    icon: Zap,
    accent: '#d97706',
    maxProgress: 8,
    reward: { gems: 250, neo: 100000000 },
    computeProgress: (cd) => {
      const prods = Object.keys(cd?.buildings || cd?.produksi || {}).length;
      const current = Math.min(8, prods > 0 ? prods : 4);
      return { current, isUnlocked: current >= 8 };
    },
  },

  // Ekonomi
  {
    id: 'anggaran_sehat',
    category: 'ekonomi',
    icon: Landmark,
    accent: '#10b981',
    maxProgress: 6,
    reward: { gems: 200, neo: 90000000 },
    computeProgress: (cd) => {
      const surplusStreak = cd?.budgetSurplusMonths ?? 4;
      const current = Math.min(6, surplusStreak);
      return { current, isUnlocked: current >= 6 };
    },
  },
  {
    id: 'bebas_utang',
    category: 'ekonomi',
    icon: Landmark,
    accent: '#059669',
    maxProgress: 1,
    reward: { gems: 300, neo: 150000000 },
    computeProgress: (cd) => {
      const loans = cd?.activeLoans ?? 0;
      return { current: loans === 0 ? 1 : 0, isUnlocked: loans === 0 };
    },
  },
  {
    id: 'mitra_dagang_dunia',
    category: 'ekonomi',
    icon: Landmark,
    accent: '#34d399',
    maxProgress: 5,
    reward: { gems: 150, neo: 60000000 },
    computeProgress: (cd) => {
      const tradePartners = cd?.tradePartnersCount ?? (cd?.tradeDeals?.length || 3);
      const current = Math.min(5, tradePartners);
      return { current, isUnlocked: current >= 5 };
    },
  },
  {
    id: 'daya_beli_terjaga',
    category: 'ekonomi',
    icon: Landmark,
    accent: '#6ee7b7',
    maxProgress: 100,
    reward: { gems: 120, neo: 50000000 },
    computeProgress: (cd) => {
      const purchasingPower = cd?.purchasingPower ?? 82;
      return { current: Math.min(100, purchasingPower), isUnlocked: purchasingPower >= 80 };
    },
  },

  // Pembangunan
  {
    id: 'pembangun_bangsa',
    category: 'pembangunan',
    icon: Building2,
    accent: '#8b5cf6',
    maxProgress: 20,
    reward: { gems: 200, neo: 75000000 },
    computeProgress: (cd) => {
      const bldCount = Object.values(cd?.buildings || {}).reduce((acc: number, v: any) => acc + (Number(v) || 0), 0);
      const current = Math.min(20, bldCount > 0 ? bldCount : 12);
      return { current, isUnlocked: current >= 20 };
    },
  },
  {
    id: 'kota_terhubung',
    category: 'pembangunan',
    icon: Building2,
    accent: '#a78bfa',
    maxProgress: 4,
    reward: { gems: 150, neo: 50000000 },
    computeProgress: (cd) => {
      const transTypes = cd?.transportationBuiltCount ?? 2;
      const current = Math.min(4, transTypes);
      return { current, isUnlocked: current >= 4 };
    },
  },
  {
    id: 'pelayanan_publik_lengkap',
    category: 'pembangunan',
    icon: Building2,
    accent: '#7c3aed',
    maxProgress: 6,
    reward: { gems: 180, neo: 65000000 },
    computeProgress: (cd) => {
      const pubCount = cd?.publicServicesCount ?? 4;
      const current = Math.min(6, pubCount);
      return { current, isUnlocked: current >= 6 };
    },
  },

  // Penelitian
  {
    id: 'negeri_inovatif',
    category: 'penelitian',
    icon: Microscope,
    accent: '#06b6d4',
    maxProgress: 10,
    reward: { gems: 220, neo: 85000000 },
    computeProgress: (cd) => {
      const resCount = cd?.completedResearches?.length ?? 6;
      const current = Math.min(10, resCount);
      return { current, isUnlocked: current >= 10 };
    },
  },
  {
    id: 'lompatan_teknologi',
    category: 'penelitian',
    icon: Microscope,
    accent: '#22d3ee',
    maxProgress: 3,
    reward: { gems: 250, neo: 95000000 },
    computeProgress: (cd) => {
      const tier3Count = cd?.highTierResearchCount ?? 1;
      const current = Math.min(3, tier3Count);
      return { current, isUnlocked: current >= 3 };
    },
  },
  {
    id: 'riset_untuk_rakyat',
    category: 'penelitian',
    icon: Microscope,
    accent: '#0891b2',
    maxProgress: 5,
    reward: { gems: 150, neo: 55000000 },
    computeProgress: (cd) => {
      const socialRes = cd?.welfareResearchesCount ?? 3;
      const current = Math.min(5, socialRes);
      return { current, isUnlocked: current >= 5 };
    },
  },

  // Kementerian
  {
    id: 'kabinet_andal',
    category: 'kementerian',
    icon: Briefcase,
    accent: '#f97316',
    maxProgress: 5,
    reward: { gems: 160, neo: 60000000 },
    computeProgress: (cd) => {
      const minCount = cd?.appointedMinistersCount ?? 5;
      const current = Math.min(5, minCount);
      return { current, isUnlocked: current >= 5 };
    },
  },
  {
    id: 'pemerintahan_profesional',
    category: 'kementerian',
    icon: Briefcase,
    accent: '#fb923c',
    maxProgress: 3,
    reward: { gems: 200, neo: 80000000 },
    computeProgress: (cd) => {
      const upgradedMin = cd?.upgradedMinistriesCount ?? 2;
      const current = Math.min(3, upgradedMin);
      return { current, isUnlocked: current >= 3 };
    },
  },
  {
    id: 'layanan_siaga',
    category: 'kementerian',
    icon: Briefcase,
    accent: '#ea580c',
    maxProgress: 100,
    reward: { gems: 140, neo: 50000000 },
    computeProgress: (cd) => {
      const readiness = cd?.emergencyReadiness ?? 85;
      return { current: Math.min(100, readiness), isUnlocked: readiness >= 80 };
    },
  },

  // Geopolitik & Diplomasi
  {
    id: 'diplomat_ulung',
    category: 'geopolitik',
    icon: Globe,
    accent: '#3b82f6',
    maxProgress: 5,
    reward: { gems: 180, neo: 70000000 },
    computeProgress: (cd) => {
      const emb = cd?.embassiesCount ?? (cd?.embassies?.length || 3);
      const current = Math.min(5, emb);
      return { current, isUnlocked: current >= 5 };
    },
  },
  {
    id: 'tetangga_bersahabat',
    category: 'geopolitik',
    icon: Globe,
    accent: '#60a5fa',
    maxProgress: 3,
    reward: { gems: 150, neo: 55000000 },
    computeProgress: (cd) => {
      const treaties = cd?.treatiesCount ?? 2;
      const current = Math.min(3, treaties);
      return { current, isUnlocked: current >= 3 };
    },
  },
  {
    id: 'jaringan_global',
    category: 'geopolitik',
    icon: Globe,
    accent: '#1d4ed8',
    maxProgress: 4,
    reward: { gems: 220, neo: 80000000 },
    computeProgress: (cd) => {
      const orgs = cd?.joinedOrganizationsCount ?? 2;
      const current = Math.min(4, orgs);
      return { current, isUnlocked: current >= 4 };
    },
  },
  {
    id: 'suara_dunia',
    category: 'geopolitik',
    icon: Globe,
    accent: '#2563eb',
    maxProgress: 3,
    reward: { gems: 250, neo: 90000000 },
    computeProgress: (cd) => {
      const unVotes = cd?.unResolutionsParticipated ?? 2;
      const current = Math.min(3, unVotes);
      return { current, isUnlocked: current >= 3 };
    },
  },

  // Sosial & Budaya
  {
    id: 'masyarakat_harmonis',
    category: 'sosial_budaya',
    icon: HeartHandshake,
    accent: '#ec4899',
    maxProgress: 100,
    reward: { gems: 160, neo: 60000000 },
    computeProgress: (cd) => {
      const tol = cd?.toleranceScore ?? 85;
      return { current: Math.min(100, tol), isUnlocked: tol >= 80 };
    },
  },
  {
    id: 'identitas_nasional',
    category: 'sosial_budaya',
    icon: HeartHandshake,
    accent: '#f43f5e',
    maxProgress: 1,
    reward: { gems: 140, neo: 45000000 },
    computeProgress: (cd) => {
      const setDoctrine = Boolean(cd?.doktrin || cd?.ideology);
      return { current: setDoctrine ? 1 : 0, isUnlocked: setDoctrine };
    },
  },
  {
    id: 'kebijakan_inklusif',
    category: 'sosial_budaya',
    icon: HeartHandshake,
    accent: '#db2777',
    maxProgress: 100,
    reward: { gems: 150, neo: 50000000 },
    computeProgress: (cd) => {
      const civilScore = cd?.civilFreedomScore ?? 80;
      return { current: Math.min(100, civilScore), isUnlocked: civilScore >= 75 };
    },
  },

  // Pertahanan
  {
    id: 'penjaga_negeri',
    category: 'pertahanan',
    icon: Shield,
    accent: '#ef4444',
    maxProgress: 10,
    reward: { gems: 220, neo: 85000000 },
    computeProgress: (cd) => {
      const militaryUnits = cd?.militaryPower ?? 8;
      const current = Math.min(10, militaryUnits);
      return { current, isUnlocked: current >= 10 };
    },
  },
  {
    id: 'mata_dan_telinga_negara',
    category: 'pertahanan',
    icon: Shield,
    accent: '#f87171',
    maxProgress: 3,
    reward: { gems: 180, neo: 65000000 },
    computeProgress: (cd) => {
      const spySuccess = cd?.intelOperationsSuccess ?? 1;
      const current = Math.min(3, spySuccess);
      return { current, isUnlocked: current >= 3 };
    },
  },
  {
    id: 'wilayah_terkelola',
    category: 'pertahanan',
    icon: Shield,
    accent: '#b91c1c',
    maxProgress: 1,
    reward: { gems: 250, neo: 100000000 },
    computeProgress: (cd) => {
      const hasAnnexed = (cd?.annexedTerritories?.length || 0) > 0;
      const isUnlocked = !hasAnnexed || Boolean(cd?.annexedStabilized);
      return { current: isUnlocked ? 1 : 0, isUnlocked };
    },
  },
  {
    id: 'kesiapan_strategis',
    category: 'pertahanan',
    icon: Shield,
    accent: '#dc2626',
    maxProgress: 1,
    reward: { gems: 300, neo: 120000000 },
    computeProgress: (cd) => {
      const hasDefenseHQ = Boolean(cd?.buildings?.markas_pertahanan || cd?.hasDefenseTech);
      return { current: hasDefenseHQ ? 1 : 0, isUnlocked: hasDefenseHQ };
    },
  },

  // Tanggap Darurat
  {
    id: 'tanggap_bencana',
    category: 'tanggap_darurat',
    icon: Siren,
    accent: '#eab308',
    maxProgress: 3,
    reward: { gems: 180, neo: 70000000 },
    computeProgress: (cd) => {
      const disasterResolved = cd?.disasterResolvedCount ?? 1;
      const current = Math.min(3, disasterResolved);
      return { current, isUnlocked: current >= 3 };
    },
  },
  {
    id: 'krisis_teratasi',
    category: 'tanggap_darurat',
    icon: Siren,
    accent: '#ca8a04',
    maxProgress: 2,
    reward: { gems: 200, neo: 80000000 },
    computeProgress: (cd) => {
      const epidemicHandled = cd?.epidemicHandledCount ?? 1;
      const current = Math.min(2, epidemicHandled);
      return { current, isUnlocked: current >= 2 };
    },
  },
  {
    id: 'negara_tangguh',
    category: 'tanggap_darurat',
    icon: Siren,
    accent: '#a16207',
    maxProgress: 1,
    reward: { gems: 250, neo: 90000000 },
    computeProgress: (cd) => {
      const resilient = cd?.postCrisisRestored ?? true;
      return { current: resilient ? 1 : 0, isUnlocked: Boolean(resilient) };
    },
  },
];

const LOCAL_STORAGE_ACHIEVEMENTS_KEY = 'neosantara_achievements_state';

interface AchievementState {
  claimed: Record<string, boolean>;
}

interface PencapaianModalsProps {
  countryDetail?: any;
  setCountryDetail?: (updater: any) => void;
}

export function PencapaianContent({ countryDetail, setCountryDetail }: PencapaianModalsProps) {
  const { t } = useLanguage();
  const [filterStatus, setFilterStatus] = useState<'all' | 'locked' | 'unlocked'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load state from localStorage or countryDetail
  const [achievementState, setAchievementState] = useState<AchievementState>(() => {
    if (typeof window === 'undefined') return { claimed: {} };
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_ACHIEVEMENTS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return { claimed: countryDetail?.achievementsClaimed || {} };
  });

  const saveAchievementState = (nextState: AchievementState) => {
    setAchievementState(nextState);
    try {
      localStorage.setItem(LOCAL_STORAGE_ACHIEVEMENTS_KEY, JSON.stringify(nextState));
    } catch {}
    if (setCountryDetail) {
      setCountryDetail((prev: any) => ({
        ...prev,
        achievementsClaimed: nextState.claimed,
      }));
    }
  };

  // Evaluate all achievements
  const evaluatedAchievements = useMemo(() => {
    return ACHIEVEMENT_DEFINITIONS.map((def) => {
      const { current, isUnlocked } = def.computeProgress(countryDetail);
      const isClaimed = Boolean(achievementState.claimed[def.id]);
      const isReadyToClaim = isUnlocked && !isClaimed;
      return {
        ...def,
        currentProgress: current,
        isUnlocked,
        isClaimed,
        isReadyToClaim,
      };
    });
  }, [countryDetail, achievementState]);

  const totalUnlocked = useMemo(() => {
    return evaluatedAchievements.filter((a) => a.isUnlocked).length;
  }, [evaluatedAchievements]);

  const totalClaimable = useMemo(() => {
    return evaluatedAchievements.filter((a) => a.isReadyToClaim).length;
  }, [evaluatedAchievements]);

  // Filtered list
  const filteredList = useMemo(() => {
    return evaluatedAchievements.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (filterStatus === 'unlocked' && !item.isUnlocked) {
        return false;
      }
      if (filterStatus === 'locked' && item.isUnlocked) {
        return false;
      }
      return true;
    });
  }, [evaluatedAchievements, selectedCategory, filterStatus]);

  const handleClaim = (item: typeof evaluatedAchievements[0]) => {
    if (!item.isReadyToClaim) return;

    const nextState: AchievementState = {
      ...achievementState,
      claimed: {
        ...achievementState.claimed,
        [item.id]: true,
      },
    };
    saveAchievementState(nextState);

    // Apply reward to countryDetail
    if (setCountryDetail) {
      setCountryDetail((prev: any) => {
        const next = { ...prev };
        if (item.reward.gems) {
          next.gems = (next.gems || 0) + item.reward.gems;
        }
        if (item.reward.neo) {
          next.uangKas = (next.uangKas || 0) + item.reward.neo;
        }
        return next;
      });
    }

    const title = t(`side_pencapaian.items.${item.id}.title`) || item.id;
    const rewardText = [
      item.reward.gems ? `${item.reward.gems} Gems` : null,
      item.reward.neo ? `${item.reward.neo.toLocaleString('id-ID')} NEO` : null,
    ].filter(Boolean).join(' + ');

    const toast = (t('side_pencapaian.claimedToast') || '🎉 Selamat! Hadiah {title} diklaim: {reward}')
      .replace('{title}', title)
      .replace('{reward}', rewardText);

    setToastMessage(toast);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const categories = [
    { id: 'all', label: t('side_pencapaian.categories.all') },
    { id: 'kepuasan', label: t('side_pencapaian.categories.kepuasan') },
    { id: 'populasi', label: t('side_pencapaian.categories.populasi') },
    { id: 'produksi', label: t('side_pencapaian.categories.produksi') },
    { id: 'ekonomi', label: t('side_pencapaian.categories.ekonomi') },
    { id: 'pembangunan', label: t('side_pencapaian.categories.pembangunan') },
    { id: 'penelitian', label: t('side_pencapaian.categories.penelitian') },
    { id: 'kementerian', label: t('side_pencapaian.categories.kementerian') },
    { id: 'geopolitik', label: t('side_pencapaian.categories.geopolitik') },
    { id: 'sosial_budaya', label: t('side_pencapaian.categories.sosial_budaya') },
    { id: 'pertahanan', label: t('side_pencapaian.categories.pertahanan') },
    { id: 'tanggap_darurat', label: t('side_pencapaian.categories.tanggap_darurat') },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-root-canvas overflow-hidden">
      {/* HEADER / TOOLBAR FILTER */}
      <div className="shrink-0 p-3 sm:p-4 border-b border-root-accent/20 bg-root-surface/50 space-y-3">
        {/* Status bar */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400 shrink-0" />
            <h2 className="text-sm font-black text-root-text uppercase tracking-wider">
              {t('side_pencapaian.title')}
            </h2>
            <span className="rounded-full bg-root-accent/15 border border-root-accent/30 px-2 py-0.5 text-[10px] font-black text-root-accent">
              {totalUnlocked} / {ACHIEVEMENT_DEFINITIONS.length} {t('side_pencapaian.totalUnlocked')}
            </span>
          </div>

          {/* Quick status filters */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase transition-colors ${
                filterStatus === 'all'
                  ? 'bg-root-accent text-root-accent-ink'
                  : 'bg-root-surface border border-root-accent/20 text-root-subtle hover:text-root-text'
              }`}
            >
              {t('side_pencapaian.filterAll')}
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('unlocked')}
              className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase transition-colors ${
                filterStatus === 'unlocked'
                  ? 'bg-root-accent text-root-accent-ink'
                  : 'bg-root-surface border border-root-accent/20 text-root-subtle hover:text-root-text'
              }`}
            >
              {t('side_pencapaian.filterUnlocked')}
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('locked')}
              className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase transition-colors ${
                filterStatus === 'locked'
                  ? 'bg-root-accent text-root-accent-ink'
                  : 'bg-root-surface border border-root-accent/20 text-root-subtle hover:text-root-text'
              }`}
            >
              {t('side_pencapaian.filterLocked')}
            </button>
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'border-root-accent bg-root-accent/20 text-root-accent shadow-sm'
                    : 'border-root-accent/15 bg-root-surface text-root-subtle hover:border-root-accent/40 hover:text-root-text'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TOAST FEEDBACK */}
      {toastMessage && (
        <div className="m-3 p-3 rounded-xl border border-emerald-400/50 bg-emerald-500/15 text-xs font-black text-emerald-300 shadow-lg animate-fadeIn flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ACHIEVEMENT CARDS LIST */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 custom-scrollbar space-y-2.5">
        {filteredList.map((item) => {
          const Icon = item.icon;
          const title = t(`side_pencapaian.items.${item.id}.title`) || item.id;
          const description = t(`side_pencapaian.items.${item.id}.description`) || '';
          const categoryName = t(`side_pencapaian.categories.${item.category}`) || item.category;
          const pct = Math.min(100, Math.round((item.currentProgress / item.maxProgress) * 100));

          return (
            <div
              key={item.id}
              className={`rounded-xl border p-3.5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                item.isClaimed
                  ? 'border-emerald-500/30 bg-root-surface/60 opacity-90'
                  : item.isReadyToClaim
                  ? 'border-amber-400/60 bg-amber-500/10 shadow-md ring-1 ring-amber-400/30'
                  : item.isUnlocked
                  ? 'border-root-accent/30 bg-root-surface'
                  : 'border-root-accent/15 bg-root-surface/40 opacity-75'
              }`}
            >
              {/* Left Details */}
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                  style={{
                    backgroundColor: item.isUnlocked ? `${item.accent}20` : 'rgba(100,100,100,0.1)',
                    borderColor: item.isUnlocked ? `${item.accent}50` : 'rgba(100,100,100,0.2)',
                  }}
                >
                  {item.isClaimed ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : item.isUnlocked ? (
                    <Icon className="h-5 w-5" style={{ color: item.accent }} />
                  ) : (
                    <Lock className="h-4 w-4 text-root-subtle" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[9px] font-black uppercase tracking-wider text-root-subtle">
                      {categoryName}
                    </span>
                    {item.isClaimed && (
                      <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 text-[8px] font-black uppercase">
                        {t('side_pencapaian.rewardClaimed')}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xs font-black text-root-text tracking-wide mt-0.5 truncate">
                    {title}
                  </h3>
                  <p className="text-[11px] text-root-subtle mt-0.5 line-clamp-2">
                    {description}
                  </p>

                  {/* Progress Bar */}
                  <div className="mt-2.5 space-y-1">
                    <div className="flex items-center justify-between text-[9px] font-semibold text-root-subtle">
                      <span>{t('side_pencapaian.progress')}</span>
                      <span>
                        {item.currentProgress} / {item.maxProgress} ({pct}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-root-canvas rounded-full overflow-hidden border border-root-accent/15">
                      <div
                        className="h-full transition-all duration-500 rounded-full"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: item.isUnlocked ? item.accent : 'var(--root-accent)',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Reward & Action */}
              <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-root-accent/10">
                {/* Rewards preview */}
                <div className="flex items-center gap-1.5">
                  {item.reward.gems && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-cyan-500/10 border border-cyan-500/30 px-1.5 py-0.5 text-[9px] font-bold text-cyan-300">
                      <Gem className="h-2.5 w-2.5 text-cyan-400" />
                      +{item.reward.gems}
                    </span>
                  )}
                  {item.reward.neo && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 text-[9px] font-bold text-amber-300">
                      <Coins className="h-2.5 w-2.5 text-amber-400" />
                      +{(item.reward.neo / 1000000).toFixed(0)}M
                    </span>
                  )}
                </div>

                {/* Claim Button */}
                {item.isReadyToClaim ? (
                  <button
                    type="button"
                    onClick={() => handleClaim(item)}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1"
                  >
                    <Sparkles className="h-3 w-3" />
                    {t('side_pencapaian.rewardReady')}
                  </button>
                ) : item.isClaimed ? (
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {t('side_pencapaian.rewardClaimed')}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-root-subtle flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    {t('side_pencapaian.rewardLocked')}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {filteredList.length === 0 && (
          <div className="p-8 text-center text-root-subtle text-xs">
            Tidak ada pencapaian yang sesuai dengan filter.
          </div>
        )}
      </div>
    </div>
  );
}

export default PencapaianContent;
