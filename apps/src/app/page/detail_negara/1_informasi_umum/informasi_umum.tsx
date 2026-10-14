"use client";
import React, { useEffect, useRef, useState } from 'react';
import { 
  Building2, 
  ShieldOff, 
  ShieldCheck, 
  Handshake, 
  FlaskConical, 
  Sword, 
  Phone, 
  Ban 
} from 'lucide-react';
// (useState moved into React import above)
import { getEmbassyButtonLabel, getEmbassyButtonClass } from './1_kedutaan_besar/logic/kedutaanBesarLogic';
import DestroyEmbassyModal from './1_kedutaan_besar/logic/DestroyEmbassyModal';
import BuildEmbassyModal from './1_kedutaan_besar/BuildEmbassyModal';
import EmbassyRelationRequirementModal from './1_kedutaan_besar/EmbassyRelationRequirementModal';
import DestroyPaktaModal from './2_pakta_non_agresi/DestroyPaktaModal';
import DestroyAliansiModal from './3_aliansi_pertahanan/DestroyAliansiModal';
import DestroyKontrakModal from './5_kontrak_penelitian/DestroyKontrakModal';
import { getTradeButtonLabel, getTradeButtonClass } from './4_perjanjian_dagang/logic/perjanjianDagangLogic';
import DestroyTradeModal from './4_perjanjian_dagang/logic/DestroyTradeModal';
import BuildTradeModal from './4_perjanjian_dagang/BuildTradeModal';
import PaktaNonAgresiModal from './2_pakta_non_agresi/paktaNonAgresiModals';
import AliansiPertahananModal from './3_aliansi_pertahanan/aliansiPertahananModals';
import KontrakPenelitianModal from './5_kontrak_penelitian/kontrakPenelitianModals';
import KirimPasukanModal from './6_kirim_pasukan/kirimPasukanModals';
import PanggilSekutuModal from './7_panggil_sekutu/panggilSekutuModals';
import BerikanSanksiModal from './8_berikan_sanksi/berikanSanksiModals';
import ProvinsiInformasiUmum from './provinsi_logic/ProvinsiInformasiUmum';
import type { NonAggressionPactPeriod } from '@/../../json/database_hubungan_antar_negara/relationsRegistry';
import { addRelationSanctionModifier, getRelationValue } from '@/../../json/database_hubungan_antar_negara/relationsRegistry';
import {
  addEconomicSanction,
  removeEconomicSanctions,
  ECONOMIC_SANCTION_REDUCTION_PER_ACTION,
} from '@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/1_resolusi_PBB/logic/3_economicEmbargoLogic';

import {
  getEffectiveEmbassyBuildTime,
  getEffectiveEmbassyCost,
  calculateSanctionReductionPercent,
  getTradeAgreementAcceptanceChancePercent,
  getNonAggressionPactAcceptanceChancePercent,
} from "@/app/page/bonus_logic";
import { estimateTravelTime } from '../../path_logic/time_logic';

interface InformasiUmumProps {
  countryName: string;
  playerCountryDetail?: any; // data negara pemain (dipassing dari MapPage)
  setPlayerCountryDetail?: (detail: any | ((prev: any) => any)) => void;
  currentNetBalance?: number;
  targetNetBalance?: number;
  adjustNetBalance?: (delta: number) => void;

  currentDate?: Date;
  autoBuildEmbassy?: boolean;
  isOccupiedProvince?: boolean;
  isAnnexedTerritory?: boolean;
  occupyingCountry?: string;
  playerReligion?: string;
  targetReligion?: string;
  updateTargetReligion?: (religion: string) => void | Promise<void>;
  playerIdeology?: string;
  targetIdeology?: string;
  updateTargetIdeology?: (ideology: string) => void | Promise<void>;
  provinceBudget?: number;
  provinceNetBalance?: number;
  provinceTension?: number;
  provinceData?: Record<string, unknown> | null;
  onCloseDetailModal?: () => void;
  onActionModalStateChange?: (isOpen: boolean) => void;
}

// Komponen tombol aksi
const ActionButton = ({ icon: Icon, label, onClick, className, iconClass, labelClass, disabled, keepOpacity, title }: { icon: any, label: string, onClick?: () => void, className?: string, iconClass?: string, labelClass?: string, disabled?: boolean, keepOpacity?: boolean, title?: string }) => {
  const base = `${className ?? 'bg-[#0A1A1A] border border-[#00FFAA]/20'} w-full min-w-0 rounded-xl p-5 lg:p-3 xl:p-5 flex flex-col items-center justify-center gap-3 lg:gap-2 xl:gap-3 transition-all group h-32 lg:h-24 xl:h-32`;
  const interactive = disabled 
    ? (keepOpacity ? 'cursor-not-allowed' : 'opacity-40 cursor-not-allowed pointer-events-none') 
    : 'hover:shadow-md hover:border-[#00FFAA]/50 hover:bg-[#00FFAA]/10 cursor-pointer';
  return (
    <button
      onClick={disabled ? undefined : onClick}
      aria-disabled={disabled}
      title={title}
      className={`${base} ${interactive}`}
    >
      <Icon className={`h-8 w-8 lg:h-6 lg:w-6 xl:h-8 xl:w-8 ${iconClass ?? 'text-[#00FFAA]'} ${disabled && !keepOpacity ? '' : 'group-hover:scale-110'} transition-transform`} />
      <span className={`text-xs lg:text-[10px] xl:text-xs font-black ${labelClass ?? 'text-[#00FFAA]'} uppercase tracking-wider text-center leading-tight`}>
        {label}
      </span>
    </button>
  );
};

export default function InformasiUmum({ countryName, playerCountryDetail, setPlayerCountryDetail, currentNetBalance: currentNetBalanceProp, targetNetBalance, adjustNetBalance, currentDate, autoBuildEmbassy, isOccupiedProvince, isAnnexedTerritory, occupyingCountry, playerReligion, targetReligion, updateTargetReligion, playerIdeology, targetIdeology, updateTargetIdeology, provinceBudget, provinceNetBalance, provinceTension, provinceData, onCloseDetailModal, onActionModalStateChange }: InformasiUmumProps) {
  const playerCountryName = playerCountryDetail?.country || playerCountryDetail?.nama || playerCountryDetail?.country_name || null;
  const [isDestroyModalOpen, setIsDestroyModalOpen] = useState(false);
  const [isBuildEmbassyModalOpen, setIsBuildEmbassyModalOpen] = useState(false);
  const [isEmbassyRelationRequirementModalOpen, setIsEmbassyRelationRequirementModalOpen] = useState(false);
  const autoBuildRequestRef = useRef<string | null>(null);
  const [embassyActive, setEmbassyActive] = useState<boolean>(false);
  const [isDestroyTradeModalOpen, setIsDestroyTradeModalOpen] = useState(false);
  const [isBuildTradeModalOpen, setIsBuildTradeModalOpen] = useState(false);
  const [tradeActive, setTradeActive] = useState<boolean>(() => getTradeButtonLabel(countryName, playerCountryName) === 'Putus Hubungan Dagang');
  const [isPaktaModalOpen, setIsPaktaModalOpen] = useState(false);
  const [isAliansiModalOpen, setIsAliansiModalOpen] = useState(false);
  const [isKontrakModalOpen, setIsKontrakModalOpen] = useState(false);
  const [paktaActive, setPaktaActive] = useState<boolean>(false);
  const [aliansiActive, setAliansiActive] = useState<boolean>(false);
  const [kontrakActive, setKontrakActive] = useState<boolean>(false);
  const [isDestroyPaktaOpen, setIsDestroyPaktaOpen] = useState(false);
  const [isDestroyAliansiOpen, setIsDestroyAliansiOpen] = useState(false);
  const [isDestroyKontrakOpen, setIsDestroyKontrakOpen] = useState(false);
  const [isKirimPasukanModalOpen, setIsKirimPasukanModalOpen] = useState(false);
  const [isPanggilSekutuModalOpen, setIsPanggilSekutuModalOpen] = useState(false);
  const [isBerikanSanksiModalOpen, setIsBerikanSanksiModalOpen] = useState(false);

  const isAnyModalActive = isDestroyModalOpen || isBuildEmbassyModalOpen || isEmbassyRelationRequirementModalOpen ||
    isDestroyTradeModalOpen || isBuildTradeModalOpen || isPaktaModalOpen || isAliansiModalOpen || isKontrakModalOpen ||
    isDestroyPaktaOpen || isDestroyAliansiOpen || isDestroyKontrakOpen || isKirimPasukanModalOpen || isPanggilSekutuModalOpen || isBerikanSanksiModalOpen;

  useEffect(() => {
    if (onActionModalStateChange) {
      onActionModalStateChange(isAnyModalActive);
    }
  }, [isAnyModalActive, onActionModalStateChange]);

  const handleAction = (action: string) => {
    // Fallback handler if needed; most actions open dedicated modals now.
    console.log(`Aksi dipilih: ${action} untuk negara ${countryName}`);
  };

  const getCurrentDateString = () => {
    const date = currentDate || new Date();
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');
  };

  const withDiplomacyNotification = (detail: Record<string, any>, title: string, message: string, value = 0) => ({
    ...detail,
    pending_notifications: [{
      id: `diplomacy-action-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      sender: `Kementerian Luar Negeri ${playerCountryName || 'Indonesia'}`,
      message,
      timestamp: getCurrentDateString(),
      type: 'peringkat' as const,
      value,
      isRead: false,
    }, ...(Array.isArray(detail.pending_notifications) ? detail.pending_notifications : [])],
  });
  const startDiplomacyPath = (
    kind: 'non-aggression-pact' | 'defense-alliance' | 'trade-agreement' | 'research-contract'
  ) => {
    window.dispatchEvent(new CustomEvent('neosantara_diplomacy_path', {
      detail: {
        pathId: `diplomacy-path-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        kind,
        senderCountry: playerCountryName || 'Indonesia',
        targetCountry: countryName,
      },
    }));
  };
  const getDiplomacyTravelArrival = () => {
    const senderCountry = playerCountryName || 'Indonesia';
    const travelEstimate = estimateTravelTime(senderCountry, countryName);
    if (!travelEstimate) {
      console.error('[Diplomacy] Unable to estimate route arrival date', { senderCountry, targetCountry: countryName });
      return null;
    }

    const arrivalDate = currentDate ? new Date(currentDate) : new Date();
    if (!Number.isFinite(arrivalDate.getTime())) {
      console.error('[Diplomacy] Invalid simulation date while estimating route arrival', { currentDate });
      return null;
    }
    arrivalDate.setHours(0, 0, 0, 0);
    arrivalDate.setDate(arrivalDate.getDate() + travelEstimate.days);

    return {
      date: [
        arrivalDate.getFullYear(),
        String(arrivalDate.getMonth() + 1).padStart(2, '0'),
        String(arrivalDate.getDate()).padStart(2, '0'),
      ].join('-'),
      days: travelEstimate.days,
    };
  };
  const startDiplomacyRatification = (
    kind: 'defense-alliance' | 'trade-agreement' | 'research-contract'
  ) => {
    const arrival = getDiplomacyTravelArrival();
    if (!arrival) return;
    setPlayerCountryDetail?.((prev: Record<string, unknown> | null) => {
      if (!prev) return prev;
      const ongoing = Array.isArray(prev.ongoingDiplomacyRatifications)
        ? prev.ongoingDiplomacyRatifications as Array<{ kind: string; targetCountry: string }>
        : [];
      const filtered = ongoing.filter(ratification =>
        !(ratification.kind === kind && normalizeDiplomaticPartner(ratification.targetCountry) === normCountryName)
      );
      return withDiplomacyNotification({
        ...prev,
        ongoingDiplomacyRatifications: [
          ...filtered,
          {
            id: `ratification-${kind}-${Date.now()}`,
            kind,
            targetCountry: countryName,
            startDate: getCurrentDateString(),
            endDate: arrival.date,
            durationDays: arrival.days,
          },
        ],
      }, 'Ratifikasi Diplomatik Dimulai', `Ratifikasi ${kind === 'defense-alliance' ? 'Aliansi Pertahanan' : kind === 'trade-agreement' ? 'Perjanjian Dagang' : 'Kontrak Penelitian'} dengan ${countryName} dimulai. Perjalanan diplomatik diperkirakan tiba pada ${arrival.date}.`);
    });
    startDiplomacyPath(kind);
  };

  const currentNetBalance = Number(currentNetBalanceProp ?? 0);
  const targetNetBalanceValue = Number(targetNetBalance ?? 0);
  const savedEconomicSanctions = playerCountryDetail?.economicSanctions;
  const targetSanctionEntry = savedEconomicSanctions &&
    typeof savedEconomicSanctions === 'object' &&
    !Array.isArray(savedEconomicSanctions)
    ? Object.entries(savedEconomicSanctions).find(
      ([name]) => name.trim().toLowerCase() === countryName.trim().toLowerCase()
    )
    : undefined;
  const isSanctionActive = Number(targetSanctionEntry?.[1]) > 0;
  const playerBudget = Number(playerCountryDetail?.anggaran) || currentNetBalance;
  const continentLabel = String(playerCountryDetail?.continent || playerCountryDetail?.region || playerCountryDetail?.benua || 'Lainnya');
  const playerEmbassies = Array.isArray(playerCountryDetail?.embassies) ? playerCountryDetail.embassies : [];
  const removedEmbassies = Array.isArray(playerCountryDetail?.removedEmbassies) ? playerCountryDetail.removedEmbassies : [];
  const removedTradePartners = Array.isArray(playerCountryDetail?.removedTradePartners) ? playerCountryDetail.removedTradePartners : [];
  const addedTradePartners = Array.isArray(playerCountryDetail?.addedTradePartners) ? playerCountryDetail.addedTradePartners : [];

  const embassyCost = getEffectiveEmbassyCost(10, playerCountryDetail);
  const minimumEmbassyRelation = 65;
  const embassyRelation = getRelationValue(
    playerCountryName || 'Indonesia',
    countryName,
    currentDate || undefined
  );
  const tradeAcceptanceChance = getTradeAgreementAcceptanceChancePercent(
    embassyRelation,
    playerCountryDetail
  );
  const normalizedPlayerIdeology = String(
    playerIdeology || playerCountryDetail?.ideology || playerCountryDetail?.ideologi || ''
  ).trim().toLocaleLowerCase('id-ID');
  const isTradeIdeologyRestricted = normalizedPlayerIdeology === 'komunisme' ||
    normalizedPlayerIdeology === 'sosialisme';
  const nonAggressionPactAcceptanceChance = getNonAggressionPactAcceptanceChancePercent(
    embassyRelation,
    playerCountryDetail
  );
  const embassyResultBudget = playerBudget - embassyCost;

  const embassyLabel = getEmbassyButtonLabel(countryName, playerCountryName, playerEmbassies, removedEmbassies, removedTradePartners);
  const hasUsableEmbassy = embassyActive && !isAnnexedTerritory;
  const embassyClass = getEmbassyButtonClass(countryName, playerCountryName, playerEmbassies, removedEmbassies, removedTradePartners);
  const embassyIconClass = embassyLabel === 'Hancurkan Kedutaan' ? 'text-[#00FFAA]' : undefined;
  const embassyLabelClass = embassyLabel === 'Hancurkan Kedutaan' ? 'text-[#00FFAA]' : undefined;

  // Extract active treaties from playerCountryDetail
  const nonAggressionPacts = Array.isArray(playerCountryDetail?.nonAggressionPacts) ? playerCountryDetail.nonAggressionPacts : [];
  const defenseAlliances = Array.isArray(playerCountryDetail?.defenseAlliances) ? playerCountryDetail.defenseAlliances : [];
  const researchContracts = Array.isArray(playerCountryDetail?.researchContracts) ? playerCountryDetail.researchContracts : [];

  const normalizeDiplomaticPartner = (name: unknown) => String(name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
  const normCountryName = normalizeDiplomaticPartner(countryName);
  const hasPaktaInDetail = nonAggressionPacts.some((p: string) => normalizeDiplomaticPartner(p) === normCountryName);
  const hasAliansiInDetail = defenseAlliances.some((p: string) => normalizeDiplomaticPartner(p) === normCountryName);
  const hasKontrakInDetail = researchContracts.some((p: string) => normalizeDiplomaticPartner(p) === normCountryName);

  const ongoingDiplomacyRatifications = Array.isArray(playerCountryDetail?.ongoingDiplomacyRatifications)
    ? playerCountryDetail.ongoingDiplomacyRatifications
    : [];
  const currentDiplomacyRatification = (kind: string) => ongoingDiplomacyRatifications.find(
    (ratification: any) =>
      ratification.kind === kind && normalizeDiplomaticPartner(ratification.targetCountry) === normCountryName
  );
  const allianceRatification = currentDiplomacyRatification('defense-alliance');
  const tradeRatification = currentDiplomacyRatification('trade-agreement');
  const researchRatification = currentDiplomacyRatification('research-contract');
  const isAllianceRatifying = hasUsableEmbassy && !!allianceRatification;
  const isTradeRatifying = hasUsableEmbassy && !!tradeRatification;
  const isResearchRatifying = hasUsableEmbassy && !!researchRatification;
  const hasTrade = getTradeButtonLabel(countryName, playerCountryName, removedTradePartners, addedTradePartners) === 'Putus Hubungan Dagang';
  const tradeIsActive = hasUsableEmbassy && !isTradeRatifying && (hasTrade || tradeActive);
  const tradeLabel = tradeIsActive ? 'Putus Hubungan Dagang' : 'Perjanjian Dagang';
  const tradeClass = getTradeButtonClass(countryName, playerCountryName, removedTradePartners, addedTradePartners);
  const tradeIconClass = tradeIsActive ? 'text-[#00FFAA]' : undefined;
  const tradeLabelClass = tradeIsActive ? 'text-[#00FFAA]' : undefined;

  const paktaIsActive = hasUsableEmbassy && (hasPaktaInDetail || paktaActive);
  const aliansiIsActive = hasUsableEmbassy && (hasAliansiInDetail || aliansiActive);
  const kontrakIsActive = hasUsableEmbassy && (hasKontrakInDetail || kontrakActive);

  // Local active states: sync initial values when country/player changes
  // Sync initial active states from logic at mount / when country changes
  // (we keep local state so user actions toggle UI immediately)
  useEffect(() => {
    if (isAnnexedTerritory) {
      setEmbassyActive(false);
      setIsBuildEmbassyModalOpen(false);
      setIsDestroyModalOpen(false);
      return;
    }
    const embassyLabelNow = getEmbassyButtonLabel(countryName, playerCountryName, playerEmbassies, removedEmbassies, removedTradePartners);
    const tradeLabelNow = getTradeButtonLabel(countryName, playerCountryName, removedTradePartners, addedTradePartners);
    setEmbassyActive(embassyLabelNow === 'Hancurkan Kedutaan');
    // Mark trade as active if registry indicates an existing trade agreement.
    setTradeActive(tradeLabelNow === 'Putus Hubungan Dagang');
    setPaktaActive(hasPaktaInDetail);
    setAliansiActive(hasAliansiInDetail);
    setKontrakActive(hasKontrakInDetail);
    setIsDestroyPaktaOpen(false);
    setIsDestroyAliansiOpen(false);
    setIsDestroyKontrakOpen(false);
    if (autoBuildEmbassy && !isAnnexedTerritory) {
      const requestKey = `${playerCountryName || ''}:${countryName}`;
      if (autoBuildRequestRef.current !== requestKey) {
        autoBuildRequestRef.current = requestKey;
        if (embassyRelation >= minimumEmbassyRelation) {
          if (onCloseDetailModal) onCloseDetailModal();
          setIsBuildEmbassyModalOpen(true);
        } else {
          if (onCloseDetailModal) onCloseDetailModal();
          setIsEmbassyRelationRequirementModalOpen(true);
        }
      }
    } else if (!autoBuildEmbassy) {
      autoBuildRequestRef.current = null;
    }
  }, [countryName, playerCountryName, playerEmbassies.length, removedEmbassies.length, removedTradePartners.length, addedTradePartners.length, nonAggressionPacts.length, defenseAlliances.length, researchContracts.length, autoBuildEmbassy, isAnnexedTerritory, embassyRelation]);

  // PERBAIKAN: Style tombol aktif dalam tema dark mode sci-fi
  const modernGreenBorderClass = 'border-2 border-[#00FFAA] bg-[#00FFAA]/20 text-[#00FFAA] hover:bg-[#00FFAA]/30';
  const inProgressBorderClass = 'border border-amber-400/50 bg-amber-400/5 text-amber-300';

  const handleEmbassyClick = () => {
    if (isAnnexedTerritory) return;
    if (embassyActive) {
      setIsDestroyModalOpen(true);
    } else if (embassyRelation < minimumEmbassyRelation) {
      setIsEmbassyRelationRequirementModalOpen(true);
    } else {
      setIsBuildEmbassyModalOpen(true);
    }
  };

  useEffect(() => {
    if (!embassyActive) {
      setTradeActive(false);
      setPaktaActive(false);
      setAliansiActive(false);
      setKontrakActive(false);
    }
  }, [embassyActive]);

  // Hitung status konstruksi kedutaan besar (Lama pembangunan: 60 Hari)
  const normTargetCountry = normCountryName;
  const ongoingEmbassyConstructions = Array.isArray(playerCountryDetail?.ongoingEmbassyConstructions)
    ? playerCountryDetail.ongoingEmbassyConstructions
    : [];
  const currentEmbassyConstruction = ongoingEmbassyConstructions.find(
    (c: any) => normalizeDiplomaticPartner(c.targetCountry) === normTargetCountry
  );
  const isEmbassyBuilding = !!currentEmbassyConstruction;
  const embassyEndDate = currentEmbassyConstruction?.endDate || null;
  const ongoingPactRatifications = Array.isArray(playerCountryDetail?.ongoingNonAggressionPactRatifications)
    ? playerCountryDetail.ongoingNonAggressionPactRatifications
    : [];
  const currentPactRatification = ongoingPactRatifications.find(
    (p: any) => normalizeDiplomaticPartner(p.targetCountry) === normTargetCountry
  );
  const isPactRatifying = hasUsableEmbassy && !!currentPactRatification;
  const pactEndDate = currentPactRatification?.endDate || null;
  const ratificationDate = (ratification: any) => ratification?.endDate
    ? formatBadgeDate(ratification.endDate)
    : null;

  // Format badge tanggal selesai (DD MMM, YYYY)
  const formatBadgeDate = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      const [y, m, d] = dateString.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      if (isNaN(date.getTime())) return dateString;
      const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
      const parts = new Intl.DateTimeFormat('id-ID', options).formatToParts(date);
      const day = parts.find((p) => p.type === 'day')?.value || '';
      const month = parts.find((p) => p.type === 'month')?.value || '';
      const year = parts.find((p) => p.type === 'year')?.value || '';
      return `${day} ${month}, ${year}`;
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Grid Layout 4-4 */}
      {isOccupiedProvince ? (
        <ProvinsiInformasiUmum
          countryName={countryName}
          occupyingCountry={occupyingCountry || playerCountryName || ''}
          playerReligion={playerReligion}
          targetReligion={targetReligion}
          updateTargetReligion={updateTargetReligion}
          playerIdeology={playerIdeology}
          targetIdeology={targetIdeology}
          updateTargetIdeology={updateTargetIdeology}
          provinceBudget={provinceBudget}
          provinceNetBalance={provinceNetBalance}
          provinceTension={provinceTension}
          currentDate={currentDate}
          provinceData={provinceData}
          playerCountryDetail={playerCountryDetail || null}
          taxedProvinces={Array.isArray(playerCountryDetail?.taxedProvinces) ? playerCountryDetail.taxedProvinces : []}
          updatePlayerCountryDetail={setPlayerCountryDetail}
          adjustPlayerNetBalance={adjustNetBalance}
        />

      ) : <div className="grid grid-cols-2 md:grid-cols-4 items-stretch gap-4 lg:gap-3 xl:gap-4 pt-6 lg:pt-4 xl:pt-6">
        
        {/* Tombol Kedutaan dengan Badge Tanggal Selesai */}
        {!isAnnexedTerritory && <div className="relative min-w-0">
          {isEmbassyBuilding && embassyEndDate && (
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 bg-[#0A1A1A] text-amber-300 text-[10px] font-bold px-2 py-1 border border-amber-400/30 rounded-sm shadow-md tracking-wider whitespace-nowrap">
              {formatBadgeDate(embassyEndDate)}
            </div>
          )}
          <ActionButton 
            icon={Building2} 
            label={
              isEmbassyBuilding 
                ? 'Dalam Pembangunan' 
                : embassyActive 
                  ? 'Hancurkan Kedutaan' 
                  : 'Bangun Kedutaan'
            } 
            onClick={handleEmbassyClick} 
            disabled={isEmbassyBuilding}
            keepOpacity={isEmbassyBuilding}
            className={
              isEmbassyBuilding
                ? inProgressBorderClass
                : embassyActive 
                  ? modernGreenBorderClass 
                  : embassyClass
            } 
            iconClass={isEmbassyBuilding ? 'text-amber-300' : embassyActive ? 'text-[#00FFAA]' : embassyIconClass}
            labelClass={isEmbassyBuilding ? 'text-amber-300' : embassyActive ? 'text-[#00FFAA]' : embassyLabelClass}
          />
        </div>}
        
        <div className="relative min-w-0">
          {isPactRatifying && pactEndDate && <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 bg-[#0A1A1A] text-amber-300 text-[10px] font-bold px-2 py-1 border border-amber-400/30 rounded-sm shadow-md tracking-wider whitespace-nowrap">{formatBadgeDate(pactEndDate)}</div>}
          <ActionButton icon={ShieldOff} label={isPactRatifying ? 'Dalam Ratifikasi' : paktaIsActive ? 'Putus Pakta Non Agresi' : 'Pakta Non Agresi'} onClick={() => { paktaIsActive ? setIsDestroyPaktaOpen(true) : setIsPaktaModalOpen(true); }} disabled={!hasUsableEmbassy || isPactRatifying} keepOpacity={isPactRatifying} className={isPactRatifying ? inProgressBorderClass : paktaIsActive ? modernGreenBorderClass : undefined} iconClass={isPactRatifying ? 'text-amber-300' : paktaIsActive ? 'text-[#00FFAA]' : undefined} labelClass={isPactRatifying ? 'text-amber-300' : paktaIsActive ? 'text-[#00FFAA]' : undefined} />
        </div>
        <div className="relative min-w-0">
          {isAllianceRatifying && ratificationDate(allianceRatification) && <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 bg-[#0A1A1A] text-amber-300 text-[10px] font-bold px-2 py-1 border border-amber-400/30 rounded-sm shadow-md tracking-wider whitespace-nowrap">{ratificationDate(allianceRatification)}</div>}
          <ActionButton icon={ShieldCheck} label={isAllianceRatifying ? 'Dalam Ratifikasi' : aliansiIsActive ? 'Putus Aliansi Pertahanan' : 'Aliansi Pertahanan'} onClick={() => { aliansiIsActive ? setIsDestroyAliansiOpen(true) : setIsAliansiModalOpen(true); }} disabled={!hasUsableEmbassy || isAllianceRatifying} keepOpacity={isAllianceRatifying} className={isAllianceRatifying ? inProgressBorderClass : aliansiIsActive ? modernGreenBorderClass : undefined} iconClass={isAllianceRatifying ? 'text-amber-300' : aliansiIsActive ? 'text-[#00FFAA]' : undefined} labelClass={isAllianceRatifying ? 'text-amber-300' : aliansiIsActive ? 'text-[#00FFAA]' : undefined} />
        </div>
        
        {/* PERBAIKAN: Tombol Perjanjian Dagang diubah menggunakan modernGreenBorderClass yang sama */}
        <div className="relative min-w-0">
          {isTradeRatifying && ratificationDate(tradeRatification) && <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 bg-[#0A1A1A] text-amber-300 text-[10px] font-bold px-2 py-1 border border-amber-400/30 rounded-sm shadow-md tracking-wider whitespace-nowrap">{ratificationDate(tradeRatification)}</div>}
          <ActionButton
            icon={Handshake}
            label={isTradeRatifying ? 'Dalam Ratifikasi' : tradeLabel}
            onClick={() => {
              if (tradeIsActive) {
                setIsDestroyTradeModalOpen(true);
              } else {
                setIsBuildTradeModalOpen(true);
              }
            }}
            className={isTradeRatifying ? inProgressBorderClass : tradeIsActive ? modernGreenBorderClass : tradeClass}
            disabled={!hasUsableEmbassy || isTradeRatifying || isTradeIdeologyRestricted}
            keepOpacity={isTradeRatifying}
            title={isTradeIdeologyRestricted ? 'Perjanjian dagang tidak tersedia untuk ideologi Komunisme atau Sosialisme.' : undefined}
            iconClass={isTradeRatifying ? 'text-amber-300' : tradeIsActive ? 'text-[#00FFAA]' : tradeIconClass}
            labelClass={isTradeRatifying ? 'text-amber-300' : tradeIsActive ? 'text-[#00FFAA]' : tradeLabelClass}
          />
        </div>
        
        <div className="relative min-w-0">
          {isResearchRatifying && ratificationDate(researchRatification) && <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 bg-[#0A1A1A] text-amber-300 text-[10px] font-bold px-2 py-1 border border-amber-400/30 rounded-sm shadow-md tracking-wider whitespace-nowrap">{ratificationDate(researchRatification)}</div>}
          <ActionButton icon={FlaskConical} label={isResearchRatifying ? 'Dalam Ratifikasi' : kontrakIsActive ? 'Putus Kontrak Penelitian' : 'Kontrak Penelitian'} onClick={() => { kontrakIsActive ? setIsDestroyKontrakOpen(true) : setIsKontrakModalOpen(true); }} disabled={!hasUsableEmbassy || isResearchRatifying} keepOpacity={isResearchRatifying} className={isResearchRatifying ? inProgressBorderClass : kontrakIsActive ? modernGreenBorderClass : undefined} iconClass={isResearchRatifying ? 'text-amber-300' : kontrakIsActive ? 'text-[#00FFAA]' : undefined} labelClass={isResearchRatifying ? 'text-amber-300' : kontrakIsActive ? 'text-[#00FFAA]' : undefined} />
        </div>
        <ActionButton icon={Sword} label="Kirim Pasukan" onClick={() => { setIsKirimPasukanModalOpen(true); }} disabled={!aliansiIsActive} />
        <ActionButton icon={Phone} label="Panggil Sekutu" onClick={() => { setIsPanggilSekutuModalOpen(true); }} disabled={!aliansiIsActive} />
        <ActionButton
          icon={Ban}
          label={isSanctionActive ? 'Cabut Sanksi' : 'Berikan Sanksi'}
          onClick={() => {
            if (isSanctionActive) {
              const previousCount = removeEconomicSanctions(countryName);
              if (setPlayerCountryDetail) {
                setPlayerCountryDetail((previous: Record<string, unknown> | null) => {
                  if (!previous) return previous;
                  const sanctions = previous.economicSanctions &&
                    typeof previous.economicSanctions === 'object' &&
                    !Array.isArray(previous.economicSanctions)
                    ? previous.economicSanctions as Record<string, number>
                    : {};
                  const remainingSanctions = Object.fromEntries(
                    Object.entries(sanctions).filter(
                      ([name]) => name.trim().toLowerCase() !== countryName.trim().toLowerCase()
                    )
                  );
                  return withDiplomacyNotification({ ...previous, economicSanctions: remainingSanctions }, 'Sanksi Ekonomi Dicabut', `Sanksi ekonomi terhadap ${countryName} telah dicabut.`);
                });
              }
              console.log(`Sanksi ekonomi terhadap ${countryName} dicabut. ${previousCount} sanksi dihapus; netto kas kembali tanpa pengurangan sanksi.`);
              return;
            }
            setIsBerikanSanksiModalOpen(true);
          }}
          className={isSanctionActive ? modernGreenBorderClass : undefined}
          iconClass={isSanctionActive ? 'text-[#00FFAA]' : undefined}
          labelClass={isSanctionActive ? 'text-[#00FFAA]' : undefined}
        />
      </div>}

      <DestroyEmbassyModal
        isOpen={isDestroyModalOpen && !isAnnexedTerritory}
        countryName={countryName}
        onClose={() => setIsDestroyModalOpen(false)}
        onConfirm={() => {
          setEmbassyActive(false);
          setTradeActive(false);
          setPaktaActive(false);
          setAliansiActive(false);
          setKontrakActive(false);
          removeEconomicSanctions(countryName);
          if (setPlayerCountryDetail) {
            setPlayerCountryDetail((prev: Record<string, unknown> | null) => {
              if (!prev) return prev;
              const existingEmbassies = Array.isArray(prev.embassies) ? prev.embassies : [];
              const existingRemovedEmbassies = Array.isArray(prev.removedEmbassies) ? prev.removedEmbassies : [];
              const existingRemovedTrade = Array.isArray(prev.removedTradePartners) ? prev.removedTradePartners : [];
              const existingAddedTrade = Array.isArray(prev.addedTradePartners) ? prev.addedTradePartners : [];
              const existingConstructions = Array.isArray(prev.ongoingEmbassyConstructions) ? prev.ongoingEmbassyConstructions : [];
              const existingPactRatifications = Array.isArray(prev.ongoingNonAggressionPactRatifications) ? prev.ongoingNonAggressionPactRatifications : [];
              const existingDiplomacyRatifications = Array.isArray(prev.ongoingDiplomacyRatifications) ? prev.ongoingDiplomacyRatifications : [];
              const existingPacts = Array.isArray(prev.nonAggressionPacts) ? prev.nonAggressionPacts : [];
              const existingPactHistory = Array.isArray(prev.nonAggressionPactHistory) ? prev.nonAggressionPactHistory : [];
              const existingAlliances = Array.isArray(prev.defenseAlliances) ? prev.defenseAlliances : [];
              const existingResearchContracts = Array.isArray(prev.researchContracts) ? prev.researchContracts : [];
              const sanctions = prev.economicSanctions && typeof prev.economicSanctions === 'object' && !Array.isArray(prev.economicSanctions)
                ? prev.economicSanctions as Record<string, number>
                : {};

              return withDiplomacyNotification({
                ...prev,
                embassies: existingEmbassies.filter(
                  (embassy: any) => normalizeDiplomaticPartner(typeof embassy === 'string' ? embassy : embassy?.mitra || embassy?.nama_negara) !== normCountryName
                ),
                ongoingEmbassyConstructions: existingConstructions.filter(
                  (construction: any) => normalizeDiplomaticPartner(construction.targetCountry) !== normCountryName
                ),
                ongoingNonAggressionPactRatifications: existingPactRatifications.filter(
                  (pact: any) => normalizeDiplomaticPartner(pact.targetCountry) !== normCountryName
                ),
                ongoingDiplomacyRatifications: existingDiplomacyRatifications.filter(
                  (ratification: any) => normalizeDiplomaticPartner(ratification.targetCountry) !== normCountryName
                ),
                nonAggressionPacts: existingPacts.filter(
                  (pact: unknown) => normalizeDiplomaticPartner(pact) !== normCountryName
                ),
                nonAggressionPactHistory: existingPactHistory.map((period: NonAggressionPactPeriod) =>
                  normalizeDiplomaticPartner(period.partner) === normCountryName && !period.endDate
                    ? { ...period, endDate: getCurrentDateString() }
                    : period
                ),
                defenseAlliances: existingAlliances.filter(
                  (partner: unknown) => normalizeDiplomaticPartner(partner) !== normCountryName
                ),
                researchContracts: existingResearchContracts.filter(
                  (partner: unknown) => normalizeDiplomaticPartner(partner) !== normCountryName
                ),
                addedTradePartners: existingAddedTrade.filter(
                  (partner: unknown) => normalizeDiplomaticPartner(partner) !== normCountryName
                ),
                removedEmbassies: Array.from(new Set([...existingRemovedEmbassies, countryName])),
                removedTradePartners: Array.from(new Set([...existingRemovedTrade, countryName])),
                economicSanctions: Object.fromEntries(
                  Object.entries(sanctions).filter(([partner]) => normalizeDiplomaticPartner(partner) !== normCountryName)
                ),
              }, 'Kedutaan Dihancurkan', `Kedutaan Besar di ${countryName} telah dihancurkan dan hubungan diplomatik terkait dihentikan.`);
            });
          }
          window.dispatchEvent(new CustomEvent('neosantara_cancel_diplomacy_path', {
            detail: { targetCountry: countryName }
          }));
          window.dispatchEvent(new CustomEvent('neosantara_cancel_non_aggression_pact_path', {
            detail: { targetCountry: countryName }
          }));
          console.log(`Kedutaan di ${countryName} dihancurkan.`);
        }}
      />

      <BuildEmbassyModal
        isOpen={isBuildEmbassyModalOpen && !isAnnexedTerritory}
        countryName={countryName}
        continent={continentLabel}
        currentBudget={currentNetBalance}
        cost={embassyCost}
        countryDetail={playerCountryDetail}
        onClose={() => setIsBuildEmbassyModalOpen(false)}
        onConfirm={() => {
          if (embassyRelation < minimumEmbassyRelation) {
            setIsEmbassyRelationRequirementModalOpen(true);
            return;
          }
          const effectiveDays = getEffectiveEmbassyBuildTime(60, playerCountryDetail);
          // Hitung Tanggal Selesai
          const baseDate = currentDate ? new Date(currentDate) : new Date();
          const endDateObj = new Date(baseDate);
          endDateObj.setDate(endDateObj.getDate() + effectiveDays);
          
          const endYear = endDateObj.getFullYear();
          const endMonth = String(endDateObj.getMonth() + 1).padStart(2, '0');
          const endDay = String(endDateObj.getDate()).padStart(2, '0');
          const endDateStr = `${endYear}-${endMonth}-${endDay}`;

          if (setPlayerCountryDetail) {
            setPlayerCountryDetail((prev: any) => {
              const existingConstructions = Array.isArray(prev?.ongoingEmbassyConstructions) ? prev.ongoingEmbassyConstructions : [];
              const normTarget = String(countryName || '').toLowerCase().trim();

              return withDiplomacyNotification({
                ...prev,
                ongoingEmbassyConstructions: [
                  ...existingConstructions.filter(
                    (c: any) => String(c.targetCountry || '').toLowerCase().trim() !== normTarget
                  ),
                  {
                    id: Date.now(),
                    targetCountry: countryName,
                    startDate: baseDate.toISOString(),
                    endDate: endDateStr,
                    durationDays: effectiveDays,
                    continent: continentLabel
                  }
                ]
              }, 'Pembangunan Kedutaan Dimulai', `Pembangunan Kedutaan Besar di ${countryName} dimulai dan dijadwalkan selesai pada ${endDateStr}.`);
            });
          }

          if (adjustNetBalance) {
            adjustNetBalance(-embassyCost);
          }
          console.log(`Konstruksi Kedutaan di ${countryName} dimulai. Estimasi selesai: ${endDateStr}`);
        }}
      />

      <EmbassyRelationRequirementModal
        isOpen={isEmbassyRelationRequirementModalOpen}
        countryName={countryName}
        currentRelation={embassyRelation}
        minimumRelation={minimumEmbassyRelation}
        onClose={() => setIsEmbassyRelationRequirementModalOpen(false)}
      />

      <DestroyTradeModal
        isOpen={isDestroyTradeModalOpen}
        countryName={countryName}
        onClose={() => setIsDestroyTradeModalOpen(false)}
        onConfirm={() => {
          setTradeActive(false);
          if (setPlayerCountryDetail) {
            setPlayerCountryDetail((prev: any) => {
              if (!prev) return prev;
              const normalizePartner = (name: unknown) => String(name || '').toLowerCase().trim();
              const existingRemovedTrade = Array.isArray(prev.removedTradePartners) ? prev.removedTradePartners : [];
              const existingAddedTrade = Array.isArray(prev.addedTradePartners) ? prev.addedTradePartners : [];
              return withDiplomacyNotification({
                ...prev,
                addedTradePartners: existingAddedTrade.filter(
                  (partner: string) => normalizePartner(partner) !== normalizePartner(countryName)
                ),
                removedTradePartners: Array.from(new Set([
                  ...existingRemovedTrade.filter(
                    (partner: string) => normalizePartner(partner) !== normalizePartner(countryName)
                  ),
                  countryName
                ])),
              }, 'Perjanjian Dagang Diakhiri', `Perjanjian dagang bilateral dengan ${countryName} telah diakhiri.`);
            });
          }
          console.log(`Perjanjian dagang dengan ${countryName} diputus.`);
        }}
      />


      <BuildTradeModal
        isOpen={isBuildTradeModalOpen}
        countryName={countryName}
        chancePercent={tradeAcceptanceChance}
        onClose={() => setIsBuildTradeModalOpen(false)}
        onConfirm={() => {
          if (Math.random() * 100 >= tradeAcceptanceChance) {
            if (setPlayerCountryDetail) {
              setPlayerCountryDetail((prev: any) => {
                if (!prev) return prev;
                const existingNotifications = Array.isArray(prev.pending_notifications)
                  ? prev.pending_notifications
                  : [];
                return {
                  ...prev,
                  pending_notifications: [{
                    id: `trade-offer-rejected-${Date.now()}`,
                    title: 'Penawaran Perjanjian Dagang Ditolak',
                    sender: `Pemerintah ${countryName}`,
                    message: `Negara ${countryName} menolak penawaran perjanjian dagang. Peluang penerimaan saat penawaran diajukan adalah ${Math.round(tradeAcceptanceChance)}%.`,
                    timestamp: getCurrentDateString(),
                    type: 'peringkat',
                    value: Math.round(tradeAcceptanceChance),
                    isRead: false,
                  }, ...existingNotifications],
                };
              });
            }
            return;
          }

          setTradeActive(false);
          startDiplomacyRatification('trade-agreement');
          console.log(`Ratifikasi perjanjian dagang dengan ${countryName} dimulai.`);
        }}
      />

      <PaktaNonAgresiModal
        isOpen={isPaktaModalOpen}
        countryName={countryName}
        chancePercent={nonAggressionPactAcceptanceChance}
        onClose={() => setIsPaktaModalOpen(false)}
        onConfirm={() => {
          if (Math.random() * 100 >= nonAggressionPactAcceptanceChance) {
            if (setPlayerCountryDetail) {
              setPlayerCountryDetail((prev: Record<string, unknown> | null) => {
                if (!prev) return prev;
                const existingNotifications = Array.isArray(prev.pending_notifications)
                  ? prev.pending_notifications
                  : [];
                return {
                  ...prev,
                  pending_notifications: [{
                    id: `non-aggression-pact-rejected-${Date.now()}`,
                    title: 'Penawaran Pakta Non-Agresi Ditolak',
                    sender: `Pemerintah ${countryName}`,
                    message: `Negara ${countryName} menolak penawaran Pakta Non-Agresi. Peluang penerimaan saat penawaran diajukan adalah ${Math.round(nonAggressionPactAcceptanceChance)}%.`,
                    timestamp: getCurrentDateString(),
                    type: 'peringkat',
                    value: Math.round(nonAggressionPactAcceptanceChance),
                    isRead: false,
                  }, ...existingNotifications],
                };
              });
            }
            return;
          }

          const arrival = getDiplomacyTravelArrival();
          if (!arrival) return;
          setPlayerCountryDetail?.((prev: Record<string, unknown> | null) => {
            if (!prev) return prev;
            const ongoing = Array.isArray(prev.ongoingNonAggressionPactRatifications) ? prev.ongoingNonAggressionPactRatifications : [];
            return withDiplomacyNotification({ ...prev, ongoingNonAggressionPactRatifications: [...ongoing.filter((p: any) => String(p.targetCountry || '').toLowerCase().trim() !== normCountryName), { id: `pact-${Date.now()}`, targetCountry: countryName, startDate: getCurrentDateString(), endDate: arrival.date, durationDays: arrival.days }] }, 'Ratifikasi Pakta Non-Agresi Dimulai', `Pakta Non-Agresi dengan ${countryName} sedang diratifikasi. Perjalanan diplomatik diperkirakan tiba pada ${arrival.date}.`);
          });
          startDiplomacyPath('non-aggression-pact');
          console.log(`Ratifikasi Pakta Non-Agresi dengan ${countryName} dimulai. Estimasi tiba: ${arrival.date} (${arrival.days} hari).`);
        }}
      />

      <DestroyPaktaModal
        isOpen={isDestroyPaktaOpen}
        countryName={countryName}
        onClose={() => setIsDestroyPaktaOpen(false)}
        onConfirm={() => {
          setPaktaActive(false);
          if (setPlayerCountryDetail) {
            setPlayerCountryDetail((prev: Record<string, unknown> | null) => {
              const existingPacts = Array.isArray(prev?.nonAggressionPacts)
                ? prev.nonAggressionPacts.filter((pact): pact is string => typeof pact === 'string')
                : [];
              const history = Array.isArray(prev?.nonAggressionPactHistory)
                ? prev.nonAggressionPactHistory as NonAggressionPactPeriod[]
                : [];
              return withDiplomacyNotification({
                ...(prev || {}),
                nonAggressionPacts: existingPacts.filter(pact => pact.toLowerCase().trim() !== normCountryName),
                nonAggressionPactHistory: history.map(period =>
                  period.partner.toLowerCase().trim() === normCountryName && !period.endDate
                    ? { ...period, endDate: getCurrentDateString() }
                    : period
                ),
              }, 'Pakta Non-Agresi Diakhiri', `Pakta Non-Agresi dengan ${countryName} telah diakhiri.`);
            });
          }
          console.log(`Pakta Non-Agresi dengan ${countryName} diputus.`);
        }}
      />

      <AliansiPertahananModal
        isOpen={isAliansiModalOpen}
        countryName={countryName}
        onClose={() => setIsAliansiModalOpen(false)}
        onConfirm={() => {
          setAliansiActive(false);
          startDiplomacyRatification('defense-alliance');
          console.log(`Ratifikasi aliansi pertahanan dengan ${countryName} dimulai.`);
        }}
      />

      <DestroyAliansiModal
        isOpen={isDestroyAliansiOpen}
        countryName={countryName}
        onClose={() => setIsDestroyAliansiOpen(false)}
        onConfirm={() => {
          setAliansiActive(false);
          if (setPlayerCountryDetail) {
            setPlayerCountryDetail((prev: any) => withDiplomacyNotification({
              ...prev,
              defenseAlliances: (prev?.defenseAlliances || []).filter((c: string) => String(c).toLowerCase().trim() !== normCountryName)
            }, 'Aliansi Pertahanan Diakhiri', `Aliansi Pertahanan dengan ${countryName} telah diakhiri.`));
          }
          console.log(`Aliansi Pertahanan dengan ${countryName} diputus.`);
        }}
      />

      <KontrakPenelitianModal
        isOpen={isKontrakModalOpen}
        countryName={countryName}
        onClose={() => setIsKontrakModalOpen(false)}
        onConfirm={() => {
          setKontrakActive(false);
          startDiplomacyRatification('research-contract');
          console.log(`Ratifikasi kontrak penelitian dengan ${countryName} dimulai.`);
        }}
      />

      <DestroyKontrakModal
        isOpen={isDestroyKontrakOpen}
        countryName={countryName}
        onClose={() => setIsDestroyKontrakOpen(false)}
        onConfirm={() => {
          setKontrakActive(false);
          if (setPlayerCountryDetail) {
            setPlayerCountryDetail((prev: any) => withDiplomacyNotification({
              ...prev,
              researchContracts: (prev?.researchContracts || []).filter((c: string) => String(c).toLowerCase().trim() !== normCountryName)
            }, 'Kontrak Penelitian Diakhiri', `Kontrak penelitian bersama ${countryName} telah diakhiri.`));
          }
          console.log(`Kontrak Penelitian dengan ${countryName} diputus.`);
        }}
      />

      <KirimPasukanModal
        isOpen={isKirimPasukanModalOpen}
        countryName={countryName}
        onClose={() => setIsKirimPasukanModalOpen(false)}
        onConfirm={() => {
          setPlayerCountryDetail?.((prev: Record<string, any> | null) => prev ? withDiplomacyNotification(prev, 'Pasukan Dikirim', `Perintah pengiriman pasukan ke ${countryName} telah dikonfirmasi.`) : prev);
          console.log(`Perintah kirim pasukan ke ${countryName} dikonfirmasi.`);
        }}
      />

      <PanggilSekutuModal
        isOpen={isPanggilSekutuModalOpen}
        countryName={countryName}
        onClose={() => setIsPanggilSekutuModalOpen(false)}
        onConfirm={() => {
          setPlayerCountryDetail?.((prev: Record<string, any> | null) => prev ? withDiplomacyNotification(prev, 'Sekutu Dipanggil', `Permintaan bantuan sekutu terkait ${countryName} telah dikirim.`) : prev);
          console.log(`Sekutu dipanggil terkait ${countryName}.`);
        }}
      />

      {(() => {
        const sanctionPercent = calculateSanctionReductionPercent(playerCountryDetail);
        return (
          <BerikanSanksiModal
            isOpen={isBerikanSanksiModalOpen}
            countryName={countryName}
            currentNetBalance={targetNetBalanceValue}
            reductionPercent={sanctionPercent}
            onClose={() => setIsBerikanSanksiModalOpen(false)}
            onConfirm={() => {
              const relationPenalty = Math.floor(Math.random() * 16) + 15;
              const sanctionCount = addEconomicSanction(countryName);
              const player = playerCountryName || 'Indonesia';
              const relationSanctionTotal = addRelationSanctionModifier(player, countryName, -relationPenalty);
              window.dispatchEvent(new CustomEvent('country_relations_updated'));
              if (setPlayerCountryDetail) {
                setPlayerCountryDetail((previous: Record<string, unknown> | null) => {
                  if (!previous) return previous;
                  const savedSanctions = previous.economicSanctions &&
                    typeof previous.economicSanctions === 'object' &&
                    !Array.isArray(previous.economicSanctions)
                    ? previous.economicSanctions as Record<string, number>
                    : {};
                  const savedRelationSanctions = previous.relationSanctionModifiers &&
                    typeof previous.relationSanctionModifiers === 'object' &&
                    !Array.isArray(previous.relationSanctionModifiers)
                    ? previous.relationSanctionModifiers as Record<string, number>
                    : {};
                  return withDiplomacyNotification({
                    ...previous,
                    economicSanctions: { ...savedSanctions, [countryName]: sanctionCount },
                    relationSanctionModifiers: { ...savedRelationSanctions, [countryName]: relationSanctionTotal },
                  }, 'Sanksi Ekonomi Diterapkan', `Sanksi ekonomi terhadap ${countryName} telah diterapkan. Hubungan bilateral berkurang ${relationPenalty} poin.`);
                });
              }
              console.log(`Sanksi terhadap ${countryName} diterapkan: hubungan -${relationPenalty}, netto kas -${sanctionPercent}% (sanksi ke-${sanctionCount}).`);
            }}
          />
        );
      })()}

    </div>
  );
}
