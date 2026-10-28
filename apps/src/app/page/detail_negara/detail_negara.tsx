'use client';

import { useState, useEffect, useLayoutEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, Globe, Landmark, Shield, Users, Banknote, Scale, Home, Handshake, Flame, Hammer } from 'lucide-react';
import { COUNTRIES_DATA } from '../map_system/map-data';
import countryPaths from '../map_system/country-paths.json';
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
import { getProvinceReligionOverride } from './1_informasi_umum/provinsi_logic/1_informasi_umum/2_tugaskan_misionaris';
import { getProvinceIdeologyOverride } from './1_informasi_umum/provinsi_logic/1_informasi_umum/5_tanamkan_ideologi';
import { getProvinceRebellionChance } from './1_informasi_umum/provinsi_logic/ketegangan_provinsi/1_pemberontakan';
import { getProvinceDemonstrationChance } from './1_informasi_umum/provinsi_logic/ketegangan_provinsi/2_demonstrasi';
import { getCountryProfileSummary } from '@/lib/countryProfileSummaryRegistry';

// Import 3 komponen terpisah
import InformasiUmum from "./1_informasi_umum/informasi_umum";
import Geopolitik from "./2_geopolitik/geopolitik";
import OperasiMiliter from "./3_operasi_militer/operasi_militer";
import DevelopingAIBuilding from "./4_developing_ai_building";

interface CountryDetailModalProps {
  isOpen: boolean;
  countryName: string | null;
  selectedCity?: string | null;
  onClose: () => void;
  countryDetail?: any; // Data detail negara dari API (negara yang sedang dimainkan)
  metadata?: Record<string, unknown>;
  setCountryDetail?: (detail: any | ((prev: any) => any)) => void;
  currentDate?: Date; // Tanggal terkini dari TimeController
  playerNetBalanceAdjustment?: number;
  adjustPlayerNetBalance?: (delta: number) => void;
  autoBuildEmbassy?: boolean;
  initialDevelopingBuildingKey?: string;
  initialDevelopingTab?: string;
}

const normalizeCountryKey = (value: unknown) => String(value || '').toLowerCase().trim();

interface AnnexationInfo {
  attackerCountry?: string;
  attackerIso?: string;
  isPbbOccupied?: boolean;
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

export function CountryDetailModal({
  isOpen,
  countryName,
  selectedCity,
  onClose,
  countryDetail,
  metadata = {},
  setCountryDetail,
  currentDate,
  playerNetBalanceAdjustment = 0,
  adjustPlayerNetBalance,
  autoBuildEmbassy,
  initialDevelopingBuildingKey,
  initialDevelopingTab,
}: CountryDetailModalProps) {
  // State untuk menu tab
  const [activeTab, setActiveTab] = useState<"informasi" | "geopolitik" | "militer" | "developing_ai_building">("informasi");
  const [annexationRevision, setAnnexationRevision] = useState(0);
  const [relationRevision, setRelationRevision] = useState(0);
  const [profileSummaryRevision, setProfileSummaryRevision] = useState(0);
  const [militaryActionDates, setMilitaryActionDates] = useState<Record<string, string>>({});

  // State untuk menyembunyikan tampilan modal Detail Negara saat salah satu modal aksi dibuka
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  useLayoutEffect(() => {
    document.body.classList.toggle('neosantara-action-modal-open', isOpen && isActionModalOpen);
    return () => document.body.classList.remove('neosantara-action-modal-open');
  }, [isActionModalOpen, isOpen]);

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

  const recordMilitaryAction = (action: 'serang' | 'spionase' | 'sabotase') => {
    const actionDate = currentDate ? new Date(currentDate) : new Date();
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
    const handleRequestedInvasionArrival = (event: Event) => {
      const detail = (event as CustomEvent<{
        attackerCountry?: string;
        targetCountry?: string;
        arrivalDate?: string;
      }>).detail;
      if (
        !detail?.attackerCountry ||
        !detail.arrivalDate ||
        normalizeCountryKey(detail.attackerCountry) !== normalizeCountryKey(countryName)
      ) {
        return;
      }
      setMilitaryActionDates(previous => ({
        ...previous,
        [`${normalizeCountryKey(countryName)}:minta_serang`]: detail.arrivalDate!,
      }));
    };

    window.addEventListener('requested_invasion_arrival_scheduled', handleRequestedInvasionArrival);
    return () => window.removeEventListener('requested_invasion_arrival_scheduled', handleRequestedInvasionArrival);
  }, [countryName]);

  useEffect(() => {
    const refreshProfileSummaries = () => setProfileSummaryRevision(revision => revision + 1);
    window.addEventListener('country_profile_summaries_ready', refreshProfileSummaries);
    return () => window.removeEventListener('country_profile_summaries_ready', refreshProfileSummaries);
  }, []);

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
      if (liveNpc) {
        setFetchedDetail((prev: any) => (prev ? {
          ...prev,
          anggaran: liveNpc.anggaran,
          jumlah_penduduk: liveNpc.jumlah_penduduk,
        } : prev));
      }
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
  const annexedInfo = getAnnexedInfo(
    [countryName, mapData?.country, detailData?.name_id, detailData?.country, detailData?.country_slug],
    mapData?.iso || detailData?.iso
  );
  const isPlayerOccupiedProvince = Boolean(
    annexedInfo?.attackerCountry &&
    normalizeCountryKey(annexedInfo.attackerCountry) === normalizeCountryKey(playerCountryName)
  );
  const isAnnexedTerritory = Boolean(annexedInfo?.attackerCountry);
  const occupyingCountry = annexedInfo?.attackerCountry || '';
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
    return getRelationValue(relationPlayerCountryName, relationCountryName);
  }, [relationPlayerCountryName, relationCountryName, relationRevision, countryName]);

  if (!isOpen || !countryName) return null;
  if (typeof document === "undefined") return null;

  const displayCountryName = annexedInfo ? `Provinsi ${countryName}` : countryName;

  // Wilayah tetap menggunakan nama dan ibukota aslinya, tetapi memakai bendera penguasa.
  const originalIso = mapData?.iso || detailData?.iso || "";
  let displayIso = originalIso;
  const countryCapital = mapData?.capital || detailData?.capital || "Data tidak tersedia";
  const isTargetingCity = Boolean(selectedCity && selectedCity.trim() !== "");
  const displayCapital = (isTargetingCity ? selectedCity : countryCapital) || "Data tidak tersedia";
  const capitalCardLabel = isTargetingCity && selectedCity?.toLowerCase().trim() !== countryCapital.toLowerCase().trim()
    ? "Kota"
    : "Ibukota";

  const attackerCountryName = annexedInfo?.attackerCountry;
  if (attackerCountryName) {
    const attackerData = COUNTRIES_DATA?.find(
      (c) => c.country?.toLowerCase().trim() === attackerCountryName.toLowerCase().trim()
    );
    if (attackerData?.iso) {
      displayIso = attackerData.iso;
    } else if (annexedInfo.attackerIso) {
      displayIso = annexedInfo.attackerIso;
    }
  }
  const provinceTensionStatus = provinceTensionValue <= 25
    ? 'Sangat Stabil'
    : provinceTensionValue <= 40
      ? 'Stabil'
      : provinceTensionValue <= 65
        ? 'Netral'
        : provinceTensionValue <= 80
          ? 'Panas'
          : 'Sangat Panas';
  const isDevelopingAIBuildingTab = activeTab === "developing_ai_building";

  // Fungsi Helper untuk bendera di Header
  const renderFlagHeader = (iso: string | undefined, altName: string) => {
    if (!iso || iso.length !== 2) return null;
    return (
      <div className="w-8 h-5 rounded-sm overflow-hidden border border-[#00FFAA]/30 flex-shrink-0 shadow-sm bg-[#0A1A1A] relative flex items-center justify-center">
        <img
          src={`https://flagcdn.com/w80/${iso.toLowerCase()}.png`}
          alt={altName}
          className="w-full h-full object-cover absolute inset-0"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      </div>
    );
  };

  return createPortal(
    <div className={`fixed inset-0 z-[100000000] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent ${isDevelopingAIBuildingTab ? 'pointer-events-auto' : 'pointer-events-none'} ${isActionModalOpen || isDevelopingAIBuildingTab ? '!p-0' : ''}`}>
      <div
        style={{ display: isActionModalOpen ? 'none' : undefined }}
        className={`bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[940px] xl:max-w-[1040px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl ${isDevelopingAIBuildingTab ? '!max-w-none !h-[100dvh] !max-h-none !rounded-none !border-none !p-0' : ''}`}>

        {/* Background Glow Texture */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,255,170,0.05)_0%,transparent_100%)] pointer-events-none" />

        {/* HEADER Modal */}
        <div className="px-6 sm:px-8 py-3.5 sm:py-4 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-3 sm:gap-4">

            {/* 1. Icon Globe */}
            <div className="p-2 sm:p-2.5 lg:p-2 bg-[#00FFAA]/10 rounded-xl border border-[#00FFAA]/30 shrink-0 flex items-center justify-center">
              <Globe className="h-6 w-6 lg:h-5 lg:w-5 xl:h-6 xl:w-6 text-[#00FFAA]" />
            </div>

            {/* 2. Judul & Subjudul */}
            <div>
              {/* Judul Utama */}
              <h2 className="text-xl sm:text-2xl lg:text-xl xl:text-2xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">
                DETAIL NEGARA
              </h2>

              <div className="flex items-center gap-2 mt-1">
                {renderFlagHeader(displayIso, displayCountryName)}
                {annexedInfo && renderFlagHeader(originalIso, countryName)}

                {/* 👈 TAMBAHKAN BENDERA PBB DI SINI */}
                {annexedInfo?.isPbbOccupied && (
                  <div className="w-8 h-5 rounded-sm overflow-hidden border border-[#00FFAA]/30 flex-shrink-0 shadow-sm bg-[#0A1A1A] relative flex items-center justify-center">
                    <img
                      src="https://flagcdn.com/w80/un.png"
                      alt="PBB"
                      className="w-full h-full object-cover absolute inset-0"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                )}

                <p className="text-xs text-[#00FFAA]/70 font-semibold uppercase tracking-wider">
                  {displayCountryName}, {displayCapital}
                </p>
              </div>
            </div>

          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5"
          >
            <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* DATA RINGKASAN */}
        <div className="px-6 sm:px-8 py-3 lg:px-3 lg:py-1.5 xl:px-8 xl:py-3 bg-[#0A1A1A]/80 border-b border-[#00FFAA]/20 flex items-center gap-6 sm:gap-8 lg:gap-3 xl:gap-8 relative z-10 overflow-x-auto lg:overflow-x-hidden shrink-0 no-scrollbar">
          <div className="flex items-center gap-6 lg:grid lg:grid-cols-6 lg:gap-3 lg:w-full lg:min-w-0 xl:gap-6">
            {/* Hubungan */}
            <div className="flex min-w-0 items-center gap-2 lg:gap-1.5">
              <div className="p-1.5 lg:p-1 xl:p-1.5 bg-[#00FFAA]/10 rounded-lg border border-[#00FFAA]/20 text-[#00FFAA]">
                {isPlayerOccupiedProvince
                  ? <Flame className="h-4 w-4 lg:h-3.5 lg:w-3.5 xl:h-4 xl:w-4 text-orange-400" />
                  : <Handshake className="h-4 w-4 lg:h-3.5 lg:w-3.5 xl:h-4 xl:w-4 text-[#00FFAA]" />}
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="text-[9px] lg:text-[8px] xl:text-[9px] font-black text-[#00FFAA]/60 uppercase tracking-wider">
                  {isPlayerOccupiedProvince ? 'Ketegangan' : 'Hubungan'}
                </span>
                <span className={`text-[11px] lg:text-[9px] xl:text-[11px] font-extrabold uppercase ${isPlayerOccupiedProvince
                  ? 'text-emerald-400'
                  : relationValue >= 75
                    ? 'text-emerald-400'
                    : relationValue >= 50
                      ? 'text-[#00FFAA]'
                      : 'text-rose-400'
                  }`}>
                  {isPlayerOccupiedProvince
                    ? `${provinceTensionValue} · ${provinceTensionStatus}`
                    : relationValue}
                </span>
                {isPlayerOccupiedProvince && (
                  <span className="text-[8px] font-semibold normal-case text-[#B7D5CD]/75">
                    Demo {getProvinceDemonstrationChance(provinceTensionValue)}% · Pemberontakan {getProvinceRebellionChance(provinceTensionValue)}%
                  </span>
                )}
                {isPlayerOccupiedProvince && provinceReferendum?.status === 'pending' && (
                  <span className="text-[8px] font-bold normal-case text-amber-300">
                    Referendum berlangsung hingga {provinceReferendum.votingEndsAt}
                  </span>
                )}
                {isPlayerOccupiedProvince && provinceReferendum?.status === 'failed' && (
                  <span className="text-[8px] font-bold normal-case text-rose-300">
                    Hasil referendum gagal diproses
                  </span>
                )}
              </div>
            </div>

            {/* Ibukota / Kota */}
            <div className="flex min-w-0 items-center gap-2 lg:gap-1.5">
              <div className="p-1.5 lg:p-1 xl:p-1.5 bg-[#00FFAA]/10 rounded-lg border border-[#00FFAA]/20 text-[#00FFAA]">
                <Landmark className="h-4 w-4 lg:h-3.5 lg:w-3.5 xl:h-4 xl:w-4 text-[#00FFAA]" />
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="text-[9px] lg:text-[8px] xl:text-[9px] font-black text-[#00FFAA]/60 uppercase tracking-wider">{capitalCardLabel}</span>
                <span className="text-[11px] lg:text-[9px] xl:text-[11px] font-bold text-[#00FFAA] uppercase">
                  {displayCapital}
                </span>
              </div>
            </div>

            {/* Populasi */}
            <div className="flex min-w-0 items-center gap-2 lg:gap-1.5">
              <div className="p-1.5 lg:p-1 xl:p-1.5 bg-[#00FFAA]/10 rounded-lg border border-[#00FFAA]/20 text-[#00FFAA]">
                <Users className="h-4 w-4 lg:h-3.5 lg:w-3.5 xl:h-4 xl:w-4 text-[#00FFAA]" />
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="text-[9px] lg:text-[8px] xl:text-[9px] font-black text-[#00FFAA]/60 uppercase tracking-wider">Populasi</span>
                <div className="flex min-w-0 flex-wrap items-center gap-x-1 lg:gap-x-0.5">
                  <span className="text-[11px] lg:text-[9px] xl:text-[11px] font-bold text-[#00FFAA] uppercase">
                    {headerDetailData?.jumlah_penduduk
                      ? Number(headerDetailData.jumlah_penduduk).toLocaleString('id-ID', { maximumFractionDigits: 2 })
                      : isLoadingDetail
                        ? <span className="inline-block w-20 h-3 bg-[#00FFAA]/20 animate-pulse rounded" />
                        : '-'
                    }
                  </span>
                  {!isLoadingDetail && detailData && (
                    <span className={`text-[10px] lg:text-[8px] xl:text-[10px] font-black ${dailyNetPopulation >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ({dailyNetPopulation >= 0 ? `+${dailyNetPopulation.toLocaleString('id-ID', { maximumFractionDigits: 2 })}` : dailyNetPopulation.toLocaleString('id-ID', { maximumFractionDigits: 2 })})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Anggaran Negara */}
            <div className="flex min-w-0 items-center gap-2 lg:gap-1.5">
              <div className="p-1.5 lg:p-1 xl:p-1.5 bg-[#00FFAA]/10 rounded-lg border border-[#00FFAA]/20 text-[#00FFAA]">
                <Banknote className="h-4 w-4 lg:h-3.5 lg:w-3.5 xl:h-4 xl:w-4 text-[#00FFAA]" />
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="text-[9px] lg:text-[8px] xl:text-[9px] font-black text-[#00FFAA]/60 uppercase tracking-wider">Anggaran</span>
                <div className="flex min-w-0 flex-wrap items-center gap-x-1 lg:gap-x-0.5">
                  <span className="text-[11px] lg:text-[9px] xl:text-[11px] font-bold text-[#00FFAA] uppercase">
                    {headerDetailData?.anggaran !== undefined
                      ? `${Number(headerDetailData.anggaran).toLocaleString('id-ID', { maximumFractionDigits: 2 })} NEO`
                      : isLoadingDetail
                        ? <span className="inline-block w-16 h-3 bg-[#00FFAA]/20 animate-pulse rounded" />
                        : '-'
                    }
                  </span>
                  {!isLoadingDetail && detailData && (
                    <span className={`text-[10px] lg:text-[8px] xl:text-[10px] font-black ${targetEffectiveNetBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ({targetEffectiveNetBalance >= 0 ? `+${targetEffectiveNetBalance.toLocaleString('id-ID', { maximumFractionDigits: 2 })}` : targetEffectiveNetBalance.toLocaleString('id-ID', { maximumFractionDigits: 2 })})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Ideologi */}
            <div className="flex min-w-0 items-center gap-2 lg:gap-1.5">
              <div className="p-1.5 lg:p-1 xl:p-1.5 bg-[#00FFAA]/10 rounded-lg border border-[#00FFAA]/20 text-[#00FFAA]">
                <Scale className="h-4 w-4 lg:h-3.5 lg:w-3.5 xl:h-4 xl:w-4 text-[#00FFAA]" />
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="text-[9px] lg:text-[8px] xl:text-[9px] font-black text-[#00FFAA]/60 uppercase tracking-wider">Ideologi</span>
                <span className="text-[11px] lg:text-[9px] xl:text-[11px] font-bold text-[#00FFAA] uppercase">
                  {headerDetailData?.ideology
                    ? headerDetailData.ideology
                    : isLoadingDetail
                      ? <span className="inline-block w-20 h-3 bg-[#00FFAA]/20 animate-pulse rounded" />
                      : '-'
                  }
                </span>
              </div>
            </div>

            {/* Agama */}
            <div className="flex min-w-0 items-center gap-2 lg:gap-1.5">
              <div className="p-1.5 lg:p-1 xl:p-1.5 bg-[#00FFAA]/10 rounded-lg border border-[#00FFAA]/20 text-[#00FFAA]">
                <Home className="h-4 w-4 lg:h-3.5 lg:w-3.5 xl:h-4 xl:w-4 text-[#00FFAA]" />
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="text-[9px] lg:text-[8px] xl:text-[9px] font-black text-[#00FFAA]/60 uppercase tracking-wider">Agama</span>
                <span className="text-[11px] lg:text-[9px] xl:text-[11px] font-bold text-[#00FFAA] uppercase">
                  {headerDetailData?.religion
                    ? headerDetailData.religion
                    : isLoadingDetail
                      ? <span className="inline-block w-16 h-3 bg-[#00FFAA]/20 animate-pulse rounded" />
                      : '-'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BODY CONTENT */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 sm:p-8 lg:p-4 xl:p-8 bg-[#0F2424] relative z-10 no-scrollbar">
          <div className={`${isDevelopingAIBuildingTab ? 'w-full max-w-none' : 'max-w-4xl lg:max-w-[780px] xl:max-w-4xl mx-auto'}`}>

            {/* Menu 3 Tab Navigasi */}
            <div className="bg-[#0A1A1A] p-1 rounded-xl border border-[#00FFAA]/20 inline-flex mb-6 lg:mb-4 shadow-sm flex-wrap gap-1">
              <button
                onClick={() => setActiveTab("informasi")}
                className={`px-5 py-2.5 lg:px-3 lg:py-2 xl:px-5 xl:py-2.5 rounded-lg text-xs lg:text-[10px] xl:text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 ${activeTab === "informasi" ? "bg-[#00FFAA] text-[#0A1A1A] shadow-md shadow-[#00FFAA]/20" : "text-[#00FFAA]/60 hover:text-[#00FFAA]"
                  }`}
              >
                <Globe className="h-4 w-4 lg:h-3.5 lg:w-3.5 xl:h-4 xl:w-4" /> Informasi Umum
              </button>
              {!isPlayerOccupiedProvince && (
                <button
                  onClick={() => setActiveTab("geopolitik")}
                  className={`px-5 py-2.5 lg:px-3 lg:py-2 xl:px-5 xl:py-2.5 rounded-lg text-xs lg:text-[10px] xl:text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 ${activeTab === "geopolitik" ? "bg-[#00FFAA] text-[#0A1A1A] shadow-md shadow-[#00FFAA]/20" : "text-[#00FFAA]/60 hover:text-[#00FFAA]"
                    }`}
                >
                  <Landmark className="h-4 w-4 lg:h-3.5 lg:w-3.5 xl:h-4 xl:w-4" /> Geopolitik
                </button>
              )}
              <button
                onClick={() => setActiveTab("militer")}
                className={`px-5 py-2.5 lg:px-3 lg:py-2 xl:px-5 xl:py-2.5 rounded-lg text-xs lg:text-[10px] xl:text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 ${activeTab === "militer" ? "bg-[#00FFAA] text-[#0A1A1A] shadow-md shadow-[#00FFAA]/20" : "text-[#00FFAA]/60 hover:text-[#00FFAA]"
                  }`}
              >
                <Shield className="h-4 w-4 lg:h-3.5 lg:w-3.5 xl:h-4 xl:w-4" /> Operasi Militer
              </button>
              <button
                onClick={() => setActiveTab("developing_ai_building")}
                className={`hidden px-5 py-2.5 lg:px-3 lg:py-2 xl:px-5 xl:py-2.5 rounded-lg text-xs lg:text-[10px] xl:text-xs font-black uppercase tracking-widest transition-all cursor-pointer items-center gap-2 ${activeTab === "developing_ai_building" ? "bg-[#00FFAA] text-[#0A1A1A] shadow-md shadow-[#00FFAA]/20" : "text-[#00FFAA]/60 hover:text-[#00FFAA]"
                  }`}
              >
                <Hammer className="h-4 w-4 lg:h-3.5 lg:w-3.5 xl:h-4 xl:w-4" /> Progress Pembangunan
              </button>
            </div>

            {/* Render 3 Komponen Berdasarkan Active Tab */}
            {activeTab === "informasi" && (
              <InformasiUmum
                countryName={countryName}
                playerCountryDetail={countryDetail}
                setPlayerCountryDetail={setCountryDetail}
                currentNetBalance={playerEffectiveNetBalance}
                targetNetBalance={targetEffectiveNetBalance}
                adjustNetBalance={adjustPlayerNetBalance}
                currentDate={currentDate}
                autoBuildEmbassy={autoBuildEmbassy}
                isOccupiedProvince={isPlayerOccupiedProvince}
                isAnnexedTerritory={isAnnexedTerritory}
                occupyingCountry={occupyingCountry}
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
                countryName={countryName}
                playerCountryDetail={countryDetail}
                setPlayerCountryDetail={setCountryDetail}
                targetCountryDetail={detailData}
                setTargetCountryDetail={setFetchedDetail}
                onActionModalStateChange={setIsActionModalOpen}
              />
            )}

            {activeTab === "militer" && (
              <OperasiMiliter
                countryName={countryName}
                playerCountryDetail={countryDetail}
                targetCountryDetail={detailData}
                actionDates={{
                  serang: militaryActionDates[`${normalizeCountryKey(countryName)}:serang`],
                  spionase: militaryActionDates[`${normalizeCountryKey(countryName)}:spionase`],
                  sabotase: militaryActionDates[`${normalizeCountryKey(countryName)}:sabotase`],
                  mintaSerang: militaryActionDates[`${normalizeCountryKey(countryName)}:minta_serang`],
                }}
                onMilitaryActionLaunched={recordMilitaryAction}
                onCloseDetailModal={() => {
                  setIsActionModalOpen(true);
                  // Juga panggil onClose jika bukan sekadar hide (atau SerangNegaraModal onCloseDetailModal)
                }}
                onActionModalStateChange={(isOpen: boolean) => setIsActionModalOpen(isOpen)}
                isOccupiedProvince={isPlayerOccupiedProvince}
                occupyingCountry={occupyingCountry}
                provinceTension={provinceTensionValue}
                updatePlayerCountryDetail={setCountryDetail}
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
    </div>,
    document.body
  );
}