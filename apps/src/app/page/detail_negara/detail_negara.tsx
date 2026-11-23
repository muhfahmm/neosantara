'use client';

import RootInfoModalHeader from '@/app/page/root_modals_design_menu/RootInfoModalHeader';
import { rootModalTypography } from '@/app/page/root_modals_design_menu/rootModalTypography';
import { getRelationTextColor, getRelationTier } from '@/app/logic/relationTiers';
import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { Globe, Landmark, Shield, Users, Banknote, Scale, Home, Handshake, Flame, Hammer } from 'lucide-react';
import { COUNTRIES_DATA } from '../map_system/map-data';
import { countryPaths } from '@/app/page/map_system/mapDataAssets';
import {
  calculateNetBalanceWithEconomicEmbargo,
  ECONOMIC_SANCTIONS_UPDATED_EVENT,
} from '@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/1_resolusi_PBB/logic/3_economicEmbargoLogic';
import {
  applyNpcCountrySimulationState,
  updateNpcCountrySimulationState,
  NPC_COUNTRY_SIMULATION_UPDATED_EVENT,
} from '@/app/logic/npc_country_simulation/npcCountrySimulation';
import { calculateCountryNetPopulation } from '@/app/logic/populations_logic/population_logic';
import { getRelationValue } from '../../../../../json/4_database_hubungan_antar_negara/relationsRegistry';
import { ORGANIZATION_MEMBERSHIP_UPDATED_EVENT } from '@/../../json/14_database_organisasi_internasional/organizationMembers';
import { isMemberOfNATO } from '@/app/page/bonus_logic/organisasi_bonus_logic/organisasi_regional/nato';
import { playerHasEmbassyWith } from './1_informasi_umum/1_kedutaan_besar/logic/kedutaanBesarLogic';
import { getProvinceReligionOverride } from './1_informasi_umum/provinsi_logic/1_informasi_umum/2_tugaskan_misionaris';
import { getProvinceIdeologyOverride } from './1_informasi_umum/provinsi_logic/1_informasi_umum/5_tanamkan_ideologi';
import { getProvinceRebellionChance } from './1_informasi_umum/provinsi_logic/ketegangan_provinsi/1_pemberontakan';
import { getProvinceDemonstrationChance } from './1_informasi_umum/provinsi_logic/ketegangan_provinsi/2_demonstrasi';
import { getCountryProfileSummary } from '@/lib/countryProfileSummaryRegistry';
import { estimateTravelTime } from '../path_logic/time_logic';
import NotebookModalWrapper from '../navigasi_menu/2_navigasi_bawah/NotebookModalWrapper';
import {
  getActiveRequestedAttackRequests,
  REQUESTED_ATTACK_REQUESTS_CHANGED_EVENT,
} from './3_operasi_militer/6_minta_serang_negara/requestedInvasionLogic';
import { useLanguage } from '@/app/page/paused_menu/terjemahan_paused_menu/languageLogic';

// Import 3 komponen terpisah
import InformasiUmum from "./1_informasi_umum/informasi_umum";
import Geopolitik from "./2_geopolitik/geopolitik";
import OperasiMiliter from "./3_operasi_militer/operasi_militer";
import DevelopingAIBuilding from "./4_developing_ai_building";

interface CountryDetailModalProps {
  isOpen: boolean;
  countryName: string | null;
  selectedCity?: string | null;
  selectedCityId?: string | null;
  onClose: () => void;
  countryDetail?: any; // Data detail negara dari API (negara yang sedang dimainkan)
  metadata?: Record<string, unknown>;
  setCountryDetail?: (detail: any | ((prev: any) => any)) => void;
  currentDate?: Date; // Tanggal terkini dari TimeController
  playerNetBalanceAdjustment?: number;
  adjustPlayerNetBalance?: (delta: number) => void;
  autoBuildEmbassy?: boolean;
  isBilateralWar?: boolean;
  onDiplomacyBlocked?: () => void;
  initialDevelopingBuildingKey?: string;
  initialDevelopingTab?: string;
}

const normalizeCountryKey = (value: unknown) => String(value || '').toLowerCase().trim();
const normalizeAlliancePartner = (value: unknown) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]/g, '');
const EMPTY_COUNTRY_RELATION_LIST: never[] = [];
const COUNTRY_SUMMARY_FONT_SIZE = 'text-[8px] lg:text-[9px] xl:text-[11px]';

interface AnnexationInfo {
  attackerCountry?: string;
  attackerIso?: string;
  isPbbOccupied?: boolean;
  pbbLiberationCountry?: string;
}

type AnnexedCountryStore = Record<string, AnnexationInfo>;

function getAnnexedCountryStore(): AnnexedCountryStore {
  if (typeof window === 'undefined') return {};
  return (window as Window & { neosantara_annexed_countries?: AnnexedCountryStore })
    .neosantara_annexed_countries || {};
}

function getAnnexedInfo(countryNames: unknown[], countryIso?: unknown) {
  const annexedStore = getAnnexedCountryStore();
  const lookupKeys = new Set(
    [...countryNames, countryIso]
      .map(normalizeCountryKey)
      .filter(Boolean)
  );

  return Object.entries(annexedStore).find(([key]) => lookupKeys.has(normalizeCountryKey(key)))?.[1];
}

// Kepemilikan kota parsial (aneksasi satu kota/provinsi) disimpan per cityId di neosantara_city_owner.
function getCityOwnerInfo(cityId?: string | null): AnnexationInfo | undefined {
  if (!cityId || typeof window === 'undefined') return undefined;
  const owner = (window as Window & {
    neosantara_city_owner?: Record<string, {
      ownerCountry?: string;
      ownerIso?: string;
      countryIso?: string;
      isPbbOccupied?: boolean;
      pbbLiberationCountry?: string;
    }>;
  }).neosantara_city_owner?.[cityId];
  if (!owner?.ownerCountry) return undefined;
  const originalIso = String(owner.countryIso || '').toLowerCase();
  const ownerCountry = COUNTRIES_DATA?.find(
    (c) => normalizeCountryKey(c.country) === normalizeCountryKey(owner.ownerCountry)
  );
  // Kota yang masih milik negara asalnya bukan wilayah aneksasi.
  if (ownerCountry?.iso && ownerCountry.iso.toLowerCase() === originalIso) return undefined;
  return {
    attackerCountry: owner.ownerCountry,
    attackerIso: owner.ownerIso,
    isPbbOccupied: owner.isPbbOccupied,
    pbbLiberationCountry: owner.pbbLiberationCountry,
  };
}

export function CountryDetailModal({
  isOpen,
  countryName,
  selectedCity,
  selectedCityId,
  onClose,
  countryDetail,
  metadata = {},
  setCountryDetail,
  currentDate,
  playerNetBalanceAdjustment = 0,
  adjustPlayerNetBalance,
  autoBuildEmbassy,
  isBilateralWar = false,
  onDiplomacyBlocked,
  initialDevelopingBuildingKey,
  initialDevelopingTab,
}: CountryDetailModalProps) {
  const { t } = useLanguage();
  // State untuk menu tab
  const [activeTab, setActiveTab] = useState<"informasi" | "geopolitik" | "militer" | "developing_ai_building">("informasi");
  const [annexationRevision, setAnnexationRevision] = useState(0);
  const [relationRevision, setRelationRevision] = useState(0);
  const [profileSummaryRevision, setProfileSummaryRevision] = useState(0);
  const [militaryActionDates, setMilitaryActionDates] = useState<Record<string, string>>({});

  useEffect(() => {
    const requesterCountry = countryDetail?.country ||
      countryDetail?.nama_negara ||
      countryDetail?.name_id;
    const refreshRequestedAttackDate = () => {
      const activeRequests = getActiveRequestedAttackRequests(
        countryName || '',
        typeof requesterCountry === 'string' ? requesterCountry : undefined
      );
      const latestArrivalDate = activeRequests
        .map(request => request.arrivalDate)
        .filter((date): date is string => typeof date === 'string')
        .sort()
        .at(-1);
      const actionDateKey = `${normalizeCountryKey(countryName)}:minta_serang`;
      setMilitaryActionDates(previous => {
        if (latestArrivalDate) {
          if (previous[actionDateKey] === latestArrivalDate) return previous;
          return { ...previous, [actionDateKey]: latestArrivalDate };
        }
        if (!(actionDateKey in previous)) return previous;
        const next = { ...previous };
        delete next[actionDateKey];
        return next;
      });
    };

    refreshRequestedAttackDate();
    window.addEventListener(REQUESTED_ATTACK_REQUESTS_CHANGED_EVENT, refreshRequestedAttackDate);
    window.addEventListener('storage', refreshRequestedAttackDate);
    return () => {
      window.removeEventListener(REQUESTED_ATTACK_REQUESTS_CHANGED_EVENT, refreshRequestedAttackDate);
      window.removeEventListener('storage', refreshRequestedAttackDate);
    };
  }, [countryDetail, countryName]);

  // State untuk menyembunyikan tampilan modal Detail Negara saat salah satu modal aksi dibuka
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  // State untuk data negara yang diklik
  const [fetchedDetail, setFetchedDetail] = useState<any>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // State statistik Netto PDB & Netto Populasi harian negara yang ditampilkan
  const [dailyNetBalance, setDailyNetBalance] = useState<number>(0);
  const [dailyNetPopulation, setDailyNetPopulation] = useState<number>(0);

  // Ref untuk melacak pergantian hari khusus di modal
  const prevModalUpdateDateRef = useRef<string | null>(null);

  // PERBAIKAN: Ref untuk mencegah fetch ulang data saat modal dibuka/tutup (Data tetap progresif)
  const fetchedRef = useRef<string | null>(null);
  const preserveActiveTabRef = useRef(false);
  const countryDetailRef = useRef(countryDetail);
  countryDetailRef.current = countryDetail;
  const natoPlayerCountryName = countryDetail?.country ||
    countryDetail?.nama_negara ||
    countryDetail?.name_id ||
    countryDetail?.name ||
    '';
  const playerEmbassies = Array.isArray(countryDetail?.embassies)
    ? countryDetail.embassies
    : EMPTY_COUNTRY_RELATION_LIST;
  const removedEmbassies = Array.isArray(countryDetail?.removedEmbassies)
    ? countryDetail.removedEmbassies
    : EMPTY_COUNTRY_RELATION_LIST;

  useEffect(() => {
    if (!natoPlayerCountryName || !setCountryDetail) return;

    const activateNatoEmbassyAlliances = () => {
      if (!isMemberOfNATO(natoPlayerCountryName)) return;

      const embassyPartners = COUNTRIES_DATA
        .filter((country) =>
          normalizeAlliancePartner(country.country) !== normalizeAlliancePartner(natoPlayerCountryName) &&
          playerHasEmbassyWith(
            country.country,
            playerEmbassies,
            natoPlayerCountryName,
            removedEmbassies
          )
        )
        .map((country) => country.country);

      if (embassyPartners.length === 0) return;

      setCountryDetail((previous: Record<string, unknown> | null) => {
        if (!previous) return previous;
        const existing = Array.isArray(previous.defenseAlliances) ? previous.defenseAlliances : [];
        const existingPartners = new Set(existing.map(normalizeAlliancePartner));
        const newPartners = embassyPartners.filter(
          (partner) => !existingPartners.has(normalizeAlliancePartner(partner))
        );
        if (newPartners.length === 0) return previous;

        return {
          ...previous,
          defenseAlliances: [...existing, ...newPartners],
        };
      });
    };

    const initialSync = window.setTimeout(activateNatoEmbassyAlliances, 0);
    window.addEventListener(ORGANIZATION_MEMBERSHIP_UPDATED_EVENT, activateNatoEmbassyAlliances);
    window.addEventListener('country_relations_updated', activateNatoEmbassyAlliances);
    return () => {
      window.clearTimeout(initialSync);
      window.removeEventListener(ORGANIZATION_MEMBERSHIP_UPDATED_EVENT, activateNatoEmbassyAlliances);
      window.removeEventListener('country_relations_updated', activateNatoEmbassyAlliances);
    };
  }, [natoPlayerCountryName, playerEmbassies, removedEmbassies, setCountryDetail]);

  useEffect(() => {
    if (!currentDate) return;
    const currentDateKey = [
      currentDate.getFullYear(),
      String(currentDate.getMonth() + 1).padStart(2, '0'),
      String(currentDate.getDate()).padStart(2, '0'),
    ].join('-');

    setMilitaryActionDates(previous => {
      let changed = false;
      const next = { ...previous };
      for (const [key, scheduledDate] of Object.entries(previous)) {
        if (scheduledDate && scheduledDate < currentDateKey) {
          delete next[key];
          changed = true;
        }
      }
      return changed ? next : previous;
    });
  }, [currentDate, countryName]);

  const recordMilitaryAction = (action: 'serang' | 'spionase' | 'sabotase') => {
    const actionDate = currentDate ? new Date(currentDate) : new Date();
    const attackerCountry = countryDetail?.country || 'Indonesia';
    const travelEstimate = estimateTravelTime(attackerCountry, countryName || '', {
      diplomacyKind: action,
    });
    if (!travelEstimate) {
      console.error('[CountryDetail] Unable to estimate operation arrival date', {
        action,
        attackerCountry,
        targetCountry: countryName,
      });
      return;
    }
    actionDate.setDate(actionDate.getDate() + travelEstimate.days);

    const dateString = [
      actionDate.getFullYear(),
      String(actionDate.getMonth() + 1).padStart(2, '0'),
      String(actionDate.getDate()).padStart(2, '0'),
    ].join('-');
    setMilitaryActionDates(previous => ({
      ...previous,
      [`${normalizeCountryKey(countryName)}:${action}`]: dateString,
    }));
  };

  useEffect(() => {
    const refreshProfileSummaries = () => setProfileSummaryRevision(revision => revision + 1);
    window.addEventListener('country_profile_summaries_ready', refreshProfileSummaries);
    return () => window.removeEventListener('country_profile_summaries_ready', refreshProfileSummaries);
  }, []);

  useEffect(() => {
    const handleMilitaryOperationResolved = (event: Event) => {
      const detail = (event as CustomEvent<{
        targetCountry?: string;
        actionType?: 'aneksasi' | 'jarah' | 'mundur';
      }>).detail;
      if (
        !detail?.targetCountry ||
        !['aneksasi', 'jarah', 'mundur'].includes(detail.actionType || '') ||
        normalizeCountryKey(detail.targetCountry) !== normalizeCountryKey(countryName)
      ) {
        return;
      }

      const actionDateKey = `${normalizeCountryKey(countryName)}:serang`;
      setMilitaryActionDates(previous => {
        if (!(actionDateKey in previous)) return previous;
        const next = { ...previous };
        delete next[actionDateKey];
        return next;
      });
    };

    window.addEventListener('military_operation_resolved', handleMilitaryOperationResolved);
    return () => window.removeEventListener('military_operation_resolved', handleMilitaryOperationResolved);
  }, [countryName]);

  useEffect(() => {
    const handleCovertArrival = (event: Event) => {
      const detail = (event as CustomEvent<{ targetCountry?: string; kind?: string }>).detail;
      if (!detail?.targetCountry || normalizeCountryKey(detail.targetCountry) !== normalizeCountryKey(countryName)) {
        return;
      }
      const kind = detail.kind;
      if (kind === 'spionase' || kind === 'sabotase') {
        const actionDateKey = `${normalizeCountryKey(countryName)}:${kind}`;
        setMilitaryActionDates(previous => {
          if (!(actionDateKey in previous)) return previous;
          const next = { ...previous };
          delete next[actionDateKey];
          return next;
        });
      }
    };

    window.addEventListener('neosantara_covert_operation_arrived', handleCovertArrival);
    return () => window.removeEventListener('neosantara_covert_operation_arrived', handleCovertArrival);
  }, [countryName]);

  useEffect(() => {
    const handleRequestedInvasionResolved = (event: Event) => {
      const detail = (event as CustomEvent<{
        attackerCountry?: string;
        targetCountry?: string;
        actionType?: string;
      }>).detail;
      if (
        !detail?.attackerCountry ||
        normalizeCountryKey(detail.attackerCountry) !== normalizeCountryKey(countryName)
      ) {
        return;
      }
      const actionDateKey = `${normalizeCountryKey(countryName)}:minta_serang`;
      const requesterCountry = countryDetail?.country ||
        countryDetail?.nama_negara ||
        countryDetail?.name_id;
      const activeRequests = getActiveRequestedAttackRequests(
        countryName || '',
        typeof requesterCountry === 'string' ? requesterCountry : undefined
      );
      const latestArrivalDate = activeRequests
        .map(request => request.arrivalDate)
        .filter((date): date is string => typeof date === 'string')
        .sort()
        .at(-1);
      setMilitaryActionDates(previous => {
        if (latestArrivalDate) {
          if (previous[actionDateKey] === latestArrivalDate) return previous;
          return { ...previous, [actionDateKey]: latestArrivalDate };
        }
        if (!(actionDateKey in previous)) return previous;
        const next = { ...previous };
        delete next[actionDateKey];
        return next;
      });
    };

    window.addEventListener('requested_invasion_resolved', handleRequestedInvasionResolved);
    return () => window.removeEventListener('requested_invasion_resolved', handleRequestedInvasionResolved);
  }, [countryDetail, countryName]);


  useEffect(() => {
    const refreshAnnexation = (event: Event) => {
      const detail = (event as CustomEvent<{
        attackerCountry?: string;
        transferredFrom?: string;
        targetCountry?: string;
        returnedTerritories?: string[];
        returnedToCountries?: string[];
      }>).detail;
      if (
        detail?.transferredFrom &&
        normalizeCountryKey(detail.attackerCountry) === normalizeCountryKey(countryName)
      ) {
        fetchedRef.current = null;
        preserveActiveTabRef.current = true;
      }
      if (
        Array.isArray(detail?.returnedTerritories) &&
        detail.returnedTerritories.length > 0 &&
        (
          normalizeCountryKey(detail.targetCountry) === normalizeCountryKey(countryName) ||
          detail.returnedToCountries?.some(
            returnedToCountry => normalizeCountryKey(returnedToCountry) === normalizeCountryKey(countryName)
          )
        )
      ) {
        fetchedRef.current = null;
        preserveActiveTabRef.current = true;
      }
      setAnnexationRevision(revision => revision + 1);
    };
    const refreshRelations = () => setRelationRevision(revision => revision + 1);
    window.addEventListener('map_territory_color_updated', refreshAnnexation);
    window.addEventListener('country_relations_updated', refreshRelations);
    return () => {
      window.removeEventListener('map_territory_color_updated', refreshAnnexation);
      window.removeEventListener('country_relations_updated', refreshRelations);
    };
  }, [countryName]);

  // Reset status hide ketika modal dibuka kembali atau negara berganti
  useEffect(() => {
    if (isOpen) {
      setIsActionModalOpen(false);
    } else {
      fetchedRef.current = null;
    }
  }, [isOpen, countryName]);

  useEffect(() => {
    if (!isOpen || !countryName) return;
    setActiveTab(
      initialDevelopingBuildingKey || initialDevelopingTab
        ? "developing_ai_building"
        : "informasi"
    );
  }, [isOpen, countryName, initialDevelopingBuildingKey, initialDevelopingTab]);

  // PERBAIKAN: Fetch data & Agregasi Kekaisaran saat pertama kali negara dibuka
  useEffect(() => {
    if (!isOpen || !countryName) return;

    // Jika sudah pernah fetch negara ini sebelumnya, jangan fetch lagi (mencegah reset data)
    if (fetchedRef.current === countryName) return;

    fetchedRef.current = countryName;

    setIsLoadingDetail(true);
    if (!preserveActiveTabRef.current) {
      setActiveTab(
        initialDevelopingBuildingKey || initialDevelopingTab
          ? "developing_ai_building"
          : "informasi"
      );
    }
    preserveActiveTabRef.current = false;
    prevModalUpdateDateRef.current = null;

    const loadDetail = async () => {
      // 1. Tentukan Pemimpin Kekaisaran (Leader) & Seluruh Anggota Kekaisaran (Empire Members)
      const annexedStore = getAnnexedCountryStore();
      const targetAnnexed = getAnnexedInfo([countryName]);
      const leaderCountry = targetAnnexed?.attackerCountry || countryName;

      const empireMembersSet = new Set<string>();
      empireMembersSet.add(normalizeCountryKey(leaderCountry));

      Object.entries(annexedStore).forEach(([key, val]) => {
        if (val?.attackerCountry && normalizeCountryKey(val.attackerCountry) === normalizeCountryKey(leaderCountry)) {
          const canonicalCountry = Object.keys(countryPaths as Record<string, string>).find(
            name => normalizeCountryKey(name) === normalizeCountryKey(key)
          );
          if (canonicalCountry) empireMembersSet.add(normalizeCountryKey(canonicalCountry));
        }
      });

      const empireMemberNames = Array.from(empireMembersSet);

      // 2. Fetch data untuk seluruh negara dalam kekaisaran ini secara paralel
      const memberDataList = await Promise.all(
        empireMemberNames.map(async (memberName) => {
          const currentCountryDetail = countryDetailRef.current;
          const currentPlayerCountry = normalizeCountryKey(
            currentCountryDetail?.country ||
            currentCountryDetail?.nama_negara ||
            currentCountryDetail?.name_id ||
            currentCountryDetail?.name
          );

          if (currentPlayerCountry && currentPlayerCountry === normalizeCountryKey(memberName)) {
            return currentCountryDetail;
          }

          const relPath = Object.entries(countryPaths as Record<string, string>).find(
            ([name]) => normalizeCountryKey(name) === normalizeCountryKey(memberName)
          )?.[1];

          if (!relPath) return null;

          try {
            const res = await fetch(`/api/country-data?path=${encodeURIComponent(relPath)}`);
            const data = applyNpcCountrySimulationState(await res.json());
            return data?.error ? null : data;
          } catch (e) {
            return null;
          }
        })
      );

      const validMembers = memberDataList.filter(Boolean);

      // Ambil data utama dari negara yang sedang dibuka (misal: Pakistan)
      const primaryData = validMembers.find(m =>
        normalizeCountryKey(m.country || m.nama_negara || m.name_id || m.name || m.country_slug) ===
        normalizeCountryKey(
          Object.keys(countryPaths as Record<string, string>).find(
            name => normalizeCountryKey(name) === normalizeCountryKey(countryName)
          ) || countryName
        )
      );

      if (!primaryData) {
        // Some map territories share another country's data file and have no standalone detail record.
        setIsLoadingDetail(false);
        return;
      }

      // Hitung akumulasi populasi, anggaran, militer, infra militer & bangunan umum dari seluruh anggota kekaisaran
      let totalPop = 0;
      let totalPopNet = 0;
      let totalAnggaran = 0;
      let totalNetBalance = 0;

      // Daftar kunci bangunan & unit militer untuk dijumlahkan
      const keysToAggregate = [
        // Infrastruktur Militer
        'barak', 'gudang_senjata', 'hangar_tank', 'pangkalan_udara', 'pangkalan_laut',
        // Unit Militer Darat
        'pasukan_infanteri', 'tank_tempur_utama', 'apc_ifv', 'artileri_berat', 'sistem_peluncur_roket', 'pertahanan_udara_mobile', 'kendaraan_taktis',
        // Unit Militer Laut
        'kapal_induk', 'kapal_induk_nuklir', 'kapal_destroyer', 'kapal_korvet', 'kapal_selam_nuklir', 'kapal_selam_regular', 'kapal_ranjau', 'kapal_logistik',
        // Unit Militer Udara
        'jet_tempur_siluman', 'jet_tempur_interceptor', 'pesawat_pengebom', 'helikopter_serang', 'pesawat_pengintai', 'drone_intai_uav', 'drone_kamikaze', 'pesawat_angkut',
        // Bangunan Umum (Kelistrikan, Industri, Hunian, dll)
        'pembangkit_listrik_tenaga_gas', 'pembangkit_listrik_tenaga_nuklir', 'pembangkit_listrik_tenaga_uap', 'pembangkit_listrik_tenaga_surya', 'pembangkit_listrik_tenaga_angin', 'pembangkit_listrik_tenaga_air', 'pembangkit_listrik_tenaga_geotermal',
        'tambang_batu_bara', 'tambang_minyak_bumi', 'tambang_gas_alam', 'tambang_uranium', 'tambang_biji_besi', 'tambang_emas', 'tambang_tembaga', 'tambang_bauksit', 'tambang_nikel', 'tambang_litium',
        'pabrik_baja', 'pabrik_semen', 'pabrik_pupuk', 'pabrik_kimia', 'pabrik_elektronik', 'pabrik_otomotif', 'pabrik_tekstil', 'pabrik_farmasi',
        'peternakan_sapi', 'peternakan_ayam', 'peternakan_kambing', 'peternakan-[#3b82f6]',
        'sawah_padi', 'perkebunan_jagung', 'perkebunan_gandum', 'perkebunan_kedelai', 'perkebunan_kelapa_sawit', 'perkebunan_tebu',
        'perikanan_tangkap', 'budidaya_ikan', 'budidaya_udang',
        'pengolahan_daging', 'pengolahan_susu', 'pengolahan_ikan', 'pengolahan_beras',
        'jalan_tol', 'pelabuhan_laut', 'bandar_udara', 'stasiun_kereta_api',
        'sekolah_dasar', 'sekolah_menengah', 'universitas',
        'puskesmas', 'rumah_sakit_umum', 'rumah_sakit_spesialis',
        'pos_polisi', 'kantor_polisi_sektor', 'mabes_polisi',
        'lapangan_olahraga', 'stadion_olahraga', 'taman_hiburan',
        'pasar_tradisional', 'pusat_perbelanjaan', 'kawasan_komersial',
        'perumahan_subsidi_rakyat', 'apartemen_modern_high_rise', 'kompleks_mansion_mewah'
      ];

      const aggregatedBuildings: Record<string, number> = {};

      validMembers.forEach(m => {
        const pop = Number(m.jumlah_penduduk || m.populasi || 0);
        const popNet = calculateCountryNetPopulation(m);
        const angg = Number(m.anggaran || 0);
        const netBal = calculateNetBalanceWithEconomicEmbargo(m, countryName);

        totalPop += pop;
        totalPopNet += popNet;
        totalAnggaran += angg;
        totalNetBalance += netBal;

        keysToAggregate.forEach(key => {
          const val = Number(m[key] ?? m?.armada?.[key] ?? m?.pertahanan?.[key] ?? 0);
          if (val > 0) {
            aggregatedBuildings[key] = (aggregatedBuildings[key] || 0) + val;
          }
        });
      });

      const combinedDetail = {
        ...primaryData,
        ...aggregatedBuildings,
        religion: getProvinceReligionOverride(countryName) || primaryData.religion,
        ideology: getProvinceIdeologyOverride(countryName) || primaryData.ideology,
        jumlah_penduduk: validMembers.length > 1 ? totalPop : primaryData.jumlah_penduduk,
        anggaran: validMembers.length > 1 ? totalAnggaran : primaryData.anggaran,
      };

      setFetchedDetail(combinedDetail);
      setDailyNetBalance(validMembers.length > 1 ? totalNetBalance : calculateNetBalanceWithEconomicEmbargo(primaryData, countryName));
      setDailyNetPopulation(validMembers.length > 1 ? totalPopNet : calculateCountryNetPopulation(primaryData));
      setIsLoadingDetail(false);
    };

    loadDetail();
  }, [isOpen, countryName, annexationRevision]);

  // PERBAIKAN: Logika Simulasi Update Kas & Populasi Harian (Tetap berjalan saat modal terbuka)
  useEffect(() => {
    if (!isOpen || !fetchedDetail || !currentDate) return;

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const currentDateStr = `${year}-${month}-${day}`;

    if (prevModalUpdateDateRef.current === null) {
      prevModalUpdateDateRef.current = currentDateStr;
      return;
    }

    if (prevModalUpdateDateRef.current === currentDateStr) return;

    prevModalUpdateDateRef.current = currentDateStr;

    // 1. Hitung Netto Anggaran Harian
    const netBalance = calculateNetBalanceWithEconomicEmbargo(fetchedDetail, countryName || undefined);
    setDailyNetBalance(netBalance);

    // 2. Hitung Perubahan Populasi Harian (Kelahiran - Kematian)
    const netPopulationChange = calculateCountryNetPopulation(fetchedDetail);
    setDailyNetPopulation(netPopulationChange);

    const currentPlayerCountry = normalizeCountryKey(
      countryDetail?.country ||
      countryDetail?.nama_negara ||
      countryDetail?.name_id ||
      countryDetail?.name
    );
    const isPlayer = currentPlayerCountry && currentPlayerCountry === normalizeCountryKey(countryName);

    if (isPlayer && countryDetail) {
      setFetchedDetail((prev: any) => (prev ? {
        ...prev,
        anggaran: countryDetail.anggaran,
        jumlah_penduduk: countryDetail.jumlah_penduduk,
      } : prev));
    } else if (fetchedDetail?.country_slug) {
      const liveNpc = applyNpcCountrySimulationState(fetchedDetail);
      const targetNetBalance = calculateNetBalanceWithEconomicEmbargo(liveNpc, countryName || undefined);
      const targetNetPopulation = calculateCountryNetPopulation(liveNpc);
      const currentAnggaran = Number(liveNpc.anggaran ?? fetchedDetail.anggaran ?? 0);
      const currentPopulasi = Number(liveNpc.jumlah_penduduk ?? fetchedDetail.jumlah_penduduk ?? 0);

      // Jika simulasi NPC belum selesai menghasilkan angka hari baru (anggaran masih persis sama dengan kemarin),
      // prediksikan secara instan (optimistic instant update) agar UI langsung terupdate tanpa jeda/delay
      const nextAnggaran = liveNpc.anggaran !== undefined && liveNpc.anggaran !== fetchedDetail.anggaran
        ? liveNpc.anggaran
        : currentAnggaran + targetNetBalance;
      const nextPopulasi = liveNpc.jumlah_penduduk !== undefined && liveNpc.jumlah_penduduk !== fetchedDetail.jumlah_penduduk
        ? liveNpc.jumlah_penduduk
        : currentPopulasi + targetNetPopulation;

      setFetchedDetail((prev: any) => (prev ? {
        ...prev,
        anggaran: nextAnggaran,
        jumlah_penduduk: nextPopulasi,
      } : prev));
    }
  }, [currentDate, fetchedDetail, isOpen, countryName, countryDetail]);

  useEffect(() => {
    if (!isOpen || !fetchedDetail?.country_slug) return;

    const refreshNpcDetail = () => {
      const updatedDetail = applyNpcCountrySimulationState(fetchedDetail);
      if (updatedDetail === fetchedDetail) return;
      setFetchedDetail(updatedDetail);
      setDailyNetBalance(calculateNetBalanceWithEconomicEmbargo(updatedDetail, countryName || undefined));
      setDailyNetPopulation(calculateCountryNetPopulation(updatedDetail));
    };

    window.addEventListener(NPC_COUNTRY_SIMULATION_UPDATED_EVENT, refreshNpcDetail);
    return () => window.removeEventListener(NPC_COUNTRY_SIMULATION_UPDATED_EVENT, refreshNpcDetail);
  }, [countryName, fetchedDetail, isOpen]);

  useEffect(() => {
    if (!isOpen || !fetchedDetail) return;
    const refreshNetBalance = () => {
      setDailyNetBalance(calculateNetBalanceWithEconomicEmbargo(fetchedDetail, countryName || undefined));
    };
    window.addEventListener(ECONOMIC_SANCTIONS_UPDATED_EVENT, refreshNetBalance);
    return () => window.removeEventListener(ECONOMIC_SANCTIONS_UPDATED_EVENT, refreshNetBalance);
  }, [countryName, fetchedDetail, isOpen]);


  // Hitung Netto PDB target negara yang ditampilkan di header dan summary
  const targetBaseNetBalance = fetchedDetail ? dailyNetBalance : 0;
  const targetEffectiveNetBalance = targetBaseNetBalance;

  // Hitung Netto PDB negara pemain yang digunakan untuk biaya kedutaan
  const playerBaseNetBalance = countryDetail ? calculateNetBalanceWithEconomicEmbargo(countryDetail) : 0;
  const playerEffectiveNetBalance = playerBaseNetBalance + playerNetBalanceAdjustment;

  // Ambil data dasar (iso, capital) dari COUNTRIES_DATA (sumber peta)
  const mapData = COUNTRIES_DATA?.find(
    (c) => c.country?.toLowerCase().trim() === countryName?.toLowerCase().trim()
  );

  // Jangan tampilkan identitas negara pemain saat data negara yang dipilih masih dimuat.
  const playerCountryName = countryDetail?.country || countryDetail?.nama_negara || countryDetail?.name_id || countryDetail?.name;
  const detailData = fetchedDetail || (
    normalizeCountryKey(playerCountryName) === normalizeCountryKey(countryName) ? countryDetail : null
  );
  const profileSummary = useMemo(
    () => getCountryProfileSummary(countryName),
    [countryName, profileSummaryRevision]
  );
  const headerDetailData = detailData || profileSummary;

  // Cek apakah negara ini telah dianeksasi oleh negara lain
  const cityOwnerInfo = getCityOwnerInfo(selectedCityId);
  const countryAnnexedInfo = getAnnexedInfo(
    [countryName, mapData?.country, detailData?.name_id, detailData?.country, detailData?.country_slug],
    mapData?.iso || detailData?.iso
  );
  const annexedInfo = cityOwnerInfo || countryAnnexedInfo;
  const isPlayerOccupiedProvince = Boolean(
    annexedInfo?.attackerCountry &&
    normalizeCountryKey(annexedInfo.attackerCountry) === normalizeCountryKey(playerCountryName)
  );
  const isPbbOccupied = annexedInfo?.isPbbOccupied === true;
  const canLiberatePbbOccupation = Boolean(
    countryAnnexedInfo?.isPbbOccupied &&
    countryAnnexedInfo.pbbLiberationCountry &&
    normalizeCountryKey(countryAnnexedInfo.pbbLiberationCountry) === normalizeCountryKey(playerCountryName)
  );
  const isAnnexedTerritory = Boolean(annexedInfo?.attackerCountry);
  const occupyingCountry = annexedInfo?.attackerCountry || '';
  const hasForeignTerritoryOwner = Boolean(
    occupyingCountry &&
    normalizeCountryKey(occupyingCountry) !== normalizeCountryKey(playerCountryName)
  );
  const cardCountryName = hasForeignTerritoryOwner && !isPbbOccupied
    ? occupyingCountry
    : countryName || '';
  const playerReligion = countryDetail?.religion || countryDetail?.agama_utama || countryDetail?.agama;
  const playerIdeology = countryDetail?.ideology || countryDetail?.ideologi;
  const targetIdeology = detailData?.ideology || detailData?.ideologi;
  const provinceTensionValue = (() => {
    const tensions = countryDetail?.provinceTensions;
    if (!tensions || typeof tensions !== 'object') return 25;
    const provinceEntry = Object.entries(tensions).find(
      ([name]) => normalizeCountryKey(name) === normalizeCountryKey(countryName)
    );
    const savedTension = Number(provinceEntry?.[1]);
    return Number.isFinite(savedTension) ? Math.min(100, Math.max(0, savedTension)) : 25;
  })();
  const provinceReferendum = (() => {
    const referendums = countryDetail?.provinceReferendums;
    if (!referendums || typeof referendums !== 'object') return null;
    const entry = Object.entries(referendums).find(
      ([name]) => normalizeCountryKey(name) === normalizeCountryKey(countryName)
    );
    return entry?.[1] && typeof entry[1] === 'object'
      ? entry[1] as { status?: string; votingEndsAt?: string }
      : null;
  })();
  const updateTargetReligion = async (religion: string) => {
    setFetchedDetail((previous: Record<string, unknown> | null) => previous
      ? { ...previous, religion }
      : previous
    );
  };
  const updateTargetIdeology = async (ideology: string) => {
    setFetchedDetail((previous: Record<string, unknown> | null) => previous
      ? { ...previous, ideology }
      : previous
    );
  };

  useEffect(() => {
    if (isPlayerOccupiedProvince && activeTab === 'geopolitik') {
      setActiveTab('informasi');
    }
  }, [isPlayerOccupiedProvince, activeTab]);

  // Hitung Hubungan berdasarkan penyerang jika dianeksasi (re-evaluate saat relationRevision bertambah)
  // Dipanggil sebelum conditional return agar urutan Hooks React selalu konsisten
  const relationPlayerCountryName = playerCountryName || "Indonesia";
  const relationCountryName = annexedInfo?.attackerCountry || countryName || "";
  const relationValue = useMemo(() => {
    if (!countryName) return 0;
    return getRelationValue(relationPlayerCountryName, relationCountryName, currentDate);
  }, [relationPlayerCountryName, relationCountryName, relationRevision, countryName, currentDate]);

  if (!isOpen || !countryName) return null;
  if (typeof document === "undefined") return null;

  const displayCountryName = isPlayerOccupiedProvince
    ? t('detail_negara_ai.annexedProvinceName', {
        name: cityOwnerInfo && selectedCity ? selectedCity : countryName,
      })
    : (isPbbOccupied ? countryName : annexedInfo?.attackerCountry || countryName);

  // Wilayah tetap menggunakan nama dan ibukota aslinya, tetapi memakai bendera penguasa.
  const originalIso = mapData?.iso || detailData?.iso || "";
  let displayIso = originalIso;
  const countryCapital = mapData?.capital || detailData?.capital || t('detail_negara_ai.unavailable');
  const isTargetingCity = Boolean(selectedCity && selectedCity.trim() !== "");
  const displayCapital = (isTargetingCity ? selectedCity : countryCapital) || t('detail_negara_ai.unavailable');
  const capitalCardLabel = isTargetingCity && selectedCity?.toLowerCase().trim() !== countryCapital.toLowerCase().trim()
    ? t('detail_negara_ai.city')
    : t('detail_negara_ai.capital');

  const attackerCountryName = annexedInfo?.attackerCountry;
  let rulerIso = "";
  if (attackerCountryName) {
    const attackerData = COUNTRIES_DATA?.find(
      (c) => c.country?.toLowerCase().trim() === attackerCountryName.toLowerCase().trim()
    );
    if (attackerData?.iso) {
      rulerIso = attackerData.iso;
    } else if (annexedInfo.attackerIso) {
      rulerIso = annexedInfo.attackerIso;
    }
    displayIso = rulerIso || originalIso;
  }

  // Tampilkan bendera negara asal di samping bendera penguasa jika wilayah ini dianeksasi
  const hasTerritoryAnnexation = Boolean(
    rulerIso &&
    originalIso &&
    rulerIso.toLowerCase() !== originalIso.toLowerCase()
  );
  const territoryOriginalIso = hasTerritoryAnnexation ? originalIso.toLowerCase() : null;

  const provinceTensionStatus = provinceTensionValue <= 25
    ? t('detail_negara_ai.tensionLevels.veryStable')
    : provinceTensionValue <= 40
      ? t('detail_negara_ai.tensionLevels.stable')
      : provinceTensionValue <= 65
        ? t('detail_negara_ai.tensionLevels.neutral')
        : provinceTensionValue <= 80
          ? t('detail_negara_ai.tensionLevels.hot')
          : t('detail_negara_ai.tensionLevels.veryHot');
  const isDevelopingAIBuildingTab = activeTab === "developing_ai_building";

  const headerFlagIcon = displayIso && displayIso.length === 2 ? (
    <div className="flex shrink-0 items-center gap-2">
      <Image
        src={`https://flagcdn.com/w80/${displayIso.toLowerCase()}.png`}
        alt={displayCountryName}
        width={80}
        height={53}
        unoptimized
        className="h-7 w-10 shrink-0 rounded-sm object-fill"
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
      {territoryOriginalIso && (
        <Image
          src={`https://flagcdn.com/w80/${territoryOriginalIso}.png`}
          alt={countryName || ''}
          width={80}
          height={53}
          unoptimized
          title={t('detail_negara_ai.originalTerritory', { country: countryName || '' })}
          className="h-7 w-10 shrink-0 rounded-sm object-fill"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      )}
    </div>
  ) : (
    <Globe />
  );

  const detailModalContent = (
      <div
        style={{ display: isActionModalOpen ? 'none' : undefined }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="country-detail-modal-title"
        className={`bg-root-surface border-none rounded-none overflow-hidden w-full h-full max-h-full flex flex-col relative font-sans pointer-events-auto shadow-none ${isDevelopingAIBuildingTab ? '!max-w-none !h-[100dvh] !max-h-none !rounded-none !border-none !p-0' : ''}`}>

        {/* Background Glow Texture */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,255,170,0.05)_0%,transparent_100%)] pointer-events-none" />

        <RootInfoModalHeader
          title={
            <span className="inline-flex min-w-0 items-baseline gap-2">
              <span className="truncate">{displayCountryName}</span>
              <span className="shrink-0 text-[0.7em] font-semibold normal-case text-root-text/80">
                {displayCapital}
              </span>
            </span>
          }
          titleId="country-detail-modal-title"
          onClose={onClose}
          icon={headerFlagIcon}
          iconContainerClassName="flex shrink-0 items-center"
          iconClassName=""
          size="standard"
        />

        {/* DATA RINGKASAN */}
        <div className="country-detail-summary px-3 sm:px-8 py-1.5 sm:py-3 lg:px-3 lg:py-1.5 xl:px-8 xl:py-3 bg-root-canvas/80 border-b border-root-accent/20 flex items-center gap-3 sm:gap-8 lg:gap-3 xl:gap-8 relative z-10 overflow-x-auto lg:overflow-x-hidden shrink-0 no-scrollbar">
          <div className="flex items-center gap-3 sm:gap-6 lg:grid lg:w-full lg:min-w-0 lg:grid-cols-[repeat(4,minmax(0,1fr))] lg:gap-3 xl:gap-6">
            {/* Hubungan */}
            <div className="flex min-w-0 items-center gap-1.5 sm:gap-2 lg:gap-1.5">
              <div className="p-1 sm:p-1.5 lg:p-1 xl:p-1.5 bg-root-accent/10 rounded-md sm:rounded-lg border border-root-accent/20 text-root-accent shrink-0 flex items-center justify-center">
                {isPlayerOccupiedProvince
                  ? <Flame className="h-2 w-2 lg:h-3.5 lg:w-3.5 xl:h-4 xl:w-4 text-orange-400" />
                  : <Handshake className="h-2 w-2 lg:h-3.5 lg:w-3.5 xl:h-4 xl:w-4 text-root-accent" />}
              </div>
              <div className="flex min-w-0 flex-col">
                <span className={`${COUNTRY_SUMMARY_FONT_SIZE} font-black text-root-accent/60 uppercase tracking-wider`}>
                  {isPlayerOccupiedProvince ? t('detail_negara_ai.tension') : t('detail_negara_ai.relation')}
                </span>
                <span className={`${COUNTRY_SUMMARY_FONT_SIZE} font-extrabold uppercase ${isPlayerOccupiedProvince ? 'text-emerald-400' : getRelationTextColor(relationValue)}`}>
                  {isPlayerOccupiedProvince
                    ? `${provinceTensionValue} · ${provinceTensionStatus}`
                    : relationValue}
                </span>
                {isPlayerOccupiedProvince && (
                  <span className={`${COUNTRY_SUMMARY_FONT_SIZE} font-semibold normal-case text-[#B7D5CD]/75`}>
                    {t('detail_negara_ai.demonstrationChance', { value: getProvinceDemonstrationChance(provinceTensionValue) })} · {t('detail_negara_ai.rebellionChance', { value: getProvinceRebellionChance(provinceTensionValue) })}
                  </span>
                )}
                {isPlayerOccupiedProvince && provinceReferendum?.status === 'pending' && (
                  <span className={`${COUNTRY_SUMMARY_FONT_SIZE} font-bold normal-case text-amber-300`}>
                    {t('detail_negara_ai.referendumPending', { date: provinceReferendum.votingEndsAt || '' })}
                  </span>
                )}
                {isPlayerOccupiedProvince && provinceReferendum?.status === 'failed' && (
                  <span className={`${COUNTRY_SUMMARY_FONT_SIZE} font-bold normal-case text-rose-300`}>
                    {t('detail_negara_ai.referendumFailed')}
                  </span>
                )}
              </div>
            </div>

            {/* Ibukota / Kota */}
            <div className="flex min-w-0 items-center gap-1.5 sm:gap-2 lg:gap-1.5">
              <div className="p-1 sm:p-1.5 lg:p-1 xl:p-1.5 bg-root-accent/10 rounded-md sm:rounded-lg border border-root-accent/20 text-root-accent shrink-0 flex items-center justify-center">
                <Landmark className="h-2 w-2 lg:h-3.5 lg:w-3.5 xl:h-4 xl:w-4 text-root-accent" />
              </div>
              <div className="flex min-w-0 flex-col">
                <span className={`${COUNTRY_SUMMARY_FONT_SIZE} font-black text-root-accent/60 uppercase tracking-wider`}>{capitalCardLabel}</span>
                <span className={`${COUNTRY_SUMMARY_FONT_SIZE} font-bold text-root-accent uppercase`}>
                  {displayCapital}
                </span>
              </div>
            </div>

            {/* Ideologi */}
            <div className="flex min-w-0 items-center gap-1.5 sm:gap-2 lg:gap-1.5">
              <div className="p-1 sm:p-1.5 lg:p-1 xl:p-1.5 bg-root-accent/10 rounded-md sm:rounded-lg border border-root-accent/20 text-root-accent shrink-0 flex items-center justify-center">
                <Scale className="h-2 w-2 lg:h-3.5 lg:w-3.5 xl:h-4 xl:w-4 text-root-accent" />
              </div>
              <div className="flex min-w-0 flex-col">
                <span className={`${COUNTRY_SUMMARY_FONT_SIZE} font-black text-root-accent/60 uppercase tracking-wider`}>{t('detail_negara_ai.ideology')}</span>
                <span className={`${COUNTRY_SUMMARY_FONT_SIZE} font-bold text-root-accent uppercase`}>
                  {headerDetailData?.ideology
                    ? headerDetailData.ideology
                    : isLoadingDetail
                      ? <span className="inline-block w-20 h-3 bg-root-accent/20 animate-pulse rounded" />
                      : '-'
                  }
                </span>
              </div>
            </div>

            {/* Agama */}
            <div className="flex min-w-0 items-center gap-1.5 sm:gap-2 lg:gap-1.5">
              <div className="p-1 sm:p-1.5 lg:p-1 xl:p-1.5 bg-root-accent/10 rounded-md sm:rounded-lg border border-root-accent/20 text-root-accent shrink-0 flex items-center justify-center">
                <Home className="h-2 w-2 lg:h-3.5 lg:w-3.5 xl:h-4 xl:w-4 text-root-accent" />
              </div>
              <div className="flex min-w-0 flex-col">
                <span className={`${COUNTRY_SUMMARY_FONT_SIZE} font-black text-root-accent/60 uppercase tracking-wider`}>{t('detail_negara_ai.religion')}</span>
                <span className={`${COUNTRY_SUMMARY_FONT_SIZE} font-bold text-root-accent uppercase`}>
                  {headerDetailData?.religion
                    ? headerDetailData.religion
                    : isLoadingDetail
                      ? <span className="inline-block w-16 h-3 bg-root-accent/20 animate-pulse rounded" />
                      : '-'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BODY CONTENT */}
        <div className="country-detail-modal-body flex-1 min-h-0 overflow-y-auto p-6 sm:p-8 lg:p-4 xl:p-8 bg-root-surface relative z-10 no-scrollbar">
          <div className={`${isDevelopingAIBuildingTab ? 'w-full max-w-none' : 'max-w-4xl lg:max-w-[780px] xl:max-w-4xl mx-auto'}`}>

            {/* Menu 3 Tab Navigasi */}
            <div className="country-detail-tabs bg-root-canvas p-1 rounded-xl border border-root-accent/20 inline-flex mb-6 lg:mb-4 shadow-sm flex-wrap gap-1">
              <button
                onClick={() => setActiveTab("informasi")}
                className={`country-detail-tab-button px-5 py-2.5 lg:px-3 lg:py-2 xl:px-5 xl:py-2.5 rounded-lg ${rootModalTypography.tab} transition-all cursor-pointer flex items-center gap-2 ${activeTab === "informasi" ? "bg-root-accent text-root-canvas shadow-md shadow-root-accent/20" : "text-root-accent/60 hover:text-root-accent"
                  }`}
              >
                <Globe className="country-detail-tab-icon h-4 w-4 lg:h-3.5 lg:w-3.5 xl:h-4 xl:w-4" /> {t('detail_negara_ai.tabs.general')}
              </button>
              {!isPlayerOccupiedProvince && (
                <button
                  onClick={() => setActiveTab("geopolitik")}
                  className={`country-detail-tab-button px-5 py-2.5 lg:px-3 lg:py-2 xl:px-5 xl:py-2.5 rounded-lg ${rootModalTypography.tab} transition-all cursor-pointer flex items-center gap-2 ${activeTab === "geopolitik" ? "bg-root-accent text-root-canvas shadow-md shadow-root-accent/20" : "text-root-accent/60 hover:text-root-accent"
                    }`}
                >
                  <Landmark className="country-detail-tab-icon h-4 w-4 lg:h-3.5 lg:w-3.5 xl:h-4 xl:w-4" /> {t('detail_negara_ai.tabs.geopolitics')}
                </button>
              )}
              <button
                onClick={() => setActiveTab("militer")}
                className={`country-detail-tab-button px-5 py-2.5 lg:px-3 lg:py-2 xl:px-5 xl:py-2.5 rounded-lg ${rootModalTypography.tab} transition-all cursor-pointer flex items-center gap-2 ${activeTab === "militer" ? "bg-root-accent text-root-canvas shadow-md shadow-root-accent/20" : "text-root-accent/60 hover:text-root-accent"
                  }`}
              >
                <Shield className="country-detail-tab-icon h-4 w-4 lg:h-3.5 lg:w-3.5 xl:h-4 xl:w-4" /> {t('detail_negara_ai.tabs.military')}
              </button>
              <button
                onClick={() => setActiveTab("developing_ai_building")}
                className={`country-detail-tab-button hidden px-5 py-2.5 lg:px-3 lg:py-2 xl:px-5 xl:py-2.5 rounded-lg ${rootModalTypography.tab} transition-all cursor-pointer items-center gap-2 ${activeTab === "developing_ai_building" ? "bg-root-accent text-root-canvas shadow-md shadow-root-accent/20" : "text-root-accent/60 hover:text-root-accent"
                  }`}
              >
                <Hammer className="country-detail-tab-icon h-4 w-4 lg:h-3.5 lg:w-3.5 xl:h-4 xl:w-4" /> {t('detail_negara_ai.tabs.constructionProgress')}
              </button>
            </div>

            {/* Render 3 Komponen Berdasarkan Active Tab */}
            {activeTab === "informasi" && (
              <InformasiUmum
                countryName={cardCountryName}
                playerCountryDetail={countryDetail}
                setPlayerCountryDetail={setCountryDetail}
                currentNetBalance={playerEffectiveNetBalance}
                targetNetBalance={targetEffectiveNetBalance}
                adjustNetBalance={adjustPlayerNetBalance}
                currentDate={currentDate}
                autoBuildEmbassy={autoBuildEmbassy}
                isBilateralWar={isBilateralWar}
                onDiplomacyBlocked={onDiplomacyBlocked}
                isOccupiedProvince={isPlayerOccupiedProvince}
                isAnnexedTerritory={isAnnexedTerritory && !hasForeignTerritoryOwner}
                occupyingCountry={occupyingCountry}
                isPbbOccupied={isPbbOccupied}
                canLiberatePbbOccupation={canLiberatePbbOccupation}
                playerReligion={playerReligion}
                targetReligion={detailData?.religion || detailData?.agama_utama || detailData?.agama}
                updateTargetReligion={updateTargetReligion}
                playerIdeology={playerIdeology}
                targetIdeology={targetIdeology}
                updateTargetIdeology={updateTargetIdeology}
                provinceBudget={Number(detailData?.anggaran)}
                provinceNetBalance={targetBaseNetBalance}
                provinceTension={provinceTensionValue}
                provinceData={detailData}
                onCloseDetailModal={() => setIsActionModalOpen(true)}
                onActionModalStateChange={setIsActionModalOpen}
              />
            )}

            {activeTab === "geopolitik" && (
              <Geopolitik
                countryName={cardCountryName}
                playerCountryDetail={countryDetail}
                setPlayerCountryDetail={setCountryDetail}
                targetCountryDetail={detailData}
                setTargetCountryDetail={setFetchedDetail}
                onActionModalStateChange={setIsActionModalOpen}
              />
            )}

            {activeTab === "militer" && (
              <OperasiMiliter
                countryName={cardCountryName}
                selectedCity={selectedCity}
                selectedCityId={selectedCityId}
                playerCountryDetail={countryDetail}
                targetCountryDetail={detailData}
                actionDates={{
                  serang: militaryActionDates[`${normalizeCountryKey(countryName)}:serang`],
                  spionase: militaryActionDates[`${normalizeCountryKey(countryName)}:spionase`],
                  sabotase: militaryActionDates[`${normalizeCountryKey(countryName)}:sabotase`],
                  mintaSerang: militaryActionDates[`${normalizeCountryKey(countryName)}:minta_serang`],
                }}
                onMilitaryActionLaunched={recordMilitaryAction}
                onCloseCountryDetail={onClose}
                onCloseDetailModal={() => {
                  setIsActionModalOpen(true);
                  // Juga panggil onClose jika bukan sekadar hide (atau SerangNegaraModal onCloseDetailModal)
                }}
                onActionModalStateChange={(isOpen: boolean) => setIsActionModalOpen(isOpen)}
                isOccupiedProvince={isPlayerOccupiedProvince}
                occupyingCountry={occupyingCountry}
                provinceTension={provinceTensionValue}
                currentDate={currentDate}
                updatePlayerCountryDetail={setCountryDetail}
                currentNetBalance={playerEffectiveNetBalance}
                adjustNetBalance={adjustPlayerNetBalance}
              />
            )}

            {activeTab === "developing_ai_building" && (
              <DevelopingAIBuilding
                key={`${initialDevelopingBuildingKey || ""}:${initialDevelopingTab || ""}`}
                countryDetail={detailData}
                metadata={metadata}
                initialBuildingKey={initialDevelopingBuildingKey}
                initialTab={initialDevelopingTab}
              />
            )}

          </div>
        </div>

      </div>
  );

  return createPortal(
    isDevelopingAIBuildingTab ? (
      <div className="fixed inset-0 z-[100000000] flex items-center justify-center pointer-events-auto">
        {detailModalContent}
      </div>
    ) : (
      <NotebookModalWrapper
        onClose={onClose}
        isHidden={isActionModalOpen}
        zIndexClass="z-[100000000]"
        frameClassName="country-detail-modal-frame"
      >
        {detailModalContent}
      </NotebookModalWrapper>
    ),
    document.body
  );
}