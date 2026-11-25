'use client';
import {
  Crosshair,
  Eye,
  Bomb,
  Radiation,
  UserX,
  Phone,
  MessageSquare
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { COUNTRIES_DATA } from '../../map_system/map-data';
import SerangNegaraModal from './1_serang_negara/serangNegaraModals';
import SeranganMasihBerlangsungModal from './1_serang_negara/SeranganMasihBerlangsungModal';
import PerangNuklirModal from './4_perang_nuklir/perangNuklirModals';
import { getReadyIcbmCount } from './4_perang_nuklir/IcbmTidakTersediaModal';
import { launchIcbmWarStrike } from '../../navigasi_menu/2_navigasi_bawah/6_pertahanan/5_icbm/modals_menu/3_perang_nuklir/icbmWarLogic';
import KudetaModal from './5_lakukan_kudeta/kudetaModals';
import MintaSerangNegaraModal from './6_minta_serang_negara/mintaSerangNegaraModals';
import StatusMintaSerangModal from './6_minta_serang_negara/statusMintaSerangModal';
import HinaModal from './7_hina/hinaModals';
import ProvinsiOperasiMiliter from '../1_informasi_umum/provinsi_logic/ProvinsiOperasiMiliter';
import SerangBelumSelesaiModals from '../../navigasi_menu/2_navigasi_bawah/6_pertahanan/1_serang_negara/modals_menu/SerangBelumSelesaiModals';
import { getActivePlayerAttack, usePlayerAttackStatus, type PlayerAttackStatus } from '../../navigasi_menu/2_navigasi_bawah/6_pertahanan/1_serang_negara/modals_menu/playerAttackStatus';
import KonfirmasiSpionaseModals from '../../navigasi_menu/2_navigasi_bawah/6_pertahanan/2_intelijen/modals_konfirmasi/konfirmasiSpionaseModals';
import KonfirmasiSabotaseModals from '../../navigasi_menu/2_navigasi_bawah/6_pertahanan/2_intelijen/modals_konfirmasi/konfirmasiSabotaseModals';
import ResultSpionaseModals from './2_spionase/ResultSpionaseModals';
import ResultSabotaseModals from './3_sabotase/ResultSabotaseModals';
import {
  resolveSpionaseOperation,
  type SpionaseOperationResult,
} from './2_spionase/logic/spionaseLogic';
import {
  resolveSabotaseOperation,
  type SabotaseOperationResult,
} from './3_sabotase/logic/sabotaseLogic';
import { consumePersonnel, getCovertPersonnel } from './covertPersonnelStorage';
import {
  consumeTravelFuel,
  getTravelFuelStatus,
} from '../../navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/fuelLogic/travelFuelLogic';
import { useTravelFuelQuote } from '../../navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/fuelLogic/useTravelFuelQuote';
import { useLanguage } from '@/app/page/paused_menu/terjemahan_paused_menu/languageLogic';

interface OperasiMiliterProps {
  countryName: string;
  selectedCity?: string | null;
  selectedCityId?: string | null;
  playerCountryDetail?: any;
  targetCountryDetail?: any;
  onCloseDetailModal?: () => void;
  onCloseCountryDetail?: () => void;
  onActionModalStateChange?: (isOpen: boolean) => void;
  isOccupiedProvince?: boolean;
  occupyingCountry?: string;
  provinceTension?: number;
  currentDate?: Date;
  actionDates?: Partial<Record<'serang' | 'spionase' | 'sabotase' | 'kudeta' | 'mintaSerang', string>>;
  onMilitaryActionLaunched?: (action: 'serang' | 'spionase' | 'sabotase' | 'kudeta') => boolean | void;
  updatePlayerCountryDetail?: (updater: (previous: Record<string, unknown> | null) => Record<string, unknown> | null) => void;
  currentNetBalance?: number;
  adjustNetBalance?: (delta: number) => void;
}

// Komponen tombol aksi (Persis sama dengan menu lainnya)
const ActionButton = ({ icon: Icon, label, onClick, className, iconClass, labelClass, isDimmed, title }: { icon: any, label: string, onClick?: () => void, className?: string, iconClass?: string, labelClass?: string, isDimmed?: boolean, title?: string }) => (
  <button
    onClick={onClick}
    title={title}
    className={`country-detail-action-card w-full ${className || 'bg-root-canvas border border-root-accent/20'} ${isDimmed ? 'opacity-75' : ''} rounded-xl p-5 lg:p-3 xl:p-5 flex flex-col items-center justify-center gap-3 lg:gap-2 xl:gap-3 ${className ? 'hover:border-amber-300 hover:bg-amber-400/10' : 'hover:border-root-accent/50 hover:bg-root-accent/10'} hover:shadow-md transition-all cursor-pointer group h-32 lg:h-24 xl:h-32`}
  >
    <Icon className={`h-8 w-8 lg:h-6 lg:w-6 xl:h-8 xl:w-8 ${iconClass || 'text-root-accent'} group-hover:scale-110 transition-transform`} />
    <span className={`text-xs lg:text-[10px] xl:text-xs font-black ${labelClass || 'text-root-accent'} uppercase tracking-wider text-center leading-tight`}>
      {label}
    </span>
  </button>
);

export default function OperasiMiliter({ countryName, selectedCity, selectedCityId, playerCountryDetail, targetCountryDetail, onCloseDetailModal, onCloseCountryDetail, onActionModalStateChange, isOccupiedProvince, occupyingCountry, provinceTension, currentDate, actionDates, onMilitaryActionLaunched, updatePlayerCountryDetail }: OperasiMiliterProps) {
  const { t, language } = useLanguage();
  const [isSerangOpen, setIsSerangOpen] = useState(false);
  const [isAttackInProgressModalOpen, setIsAttackInProgressModalOpen] = useState(false);
  const [blockedPlayerAttack, setBlockedPlayerAttack] = useState<{
    status: PlayerAttackStatus;
    requestedTarget: string;
  } | null>(null);
  const activePlayerAttack = usePlayerAttackStatus();
  const [isSpionaseOpen, setIsSpionaseOpen] = useState(false);
  const [isSabotaseOpen, setIsSabotaseOpen] = useState(false);
  const [isNuklirOpen, setIsNuklirOpen] = useState(false);
  const [isKudetaOpen, setIsKudetaOpen] = useState(false);
  const [isMintaSerangOpen, setIsMintaSerangOpen] = useState(false);
  const [isStatusMintaSerangOpen, setIsStatusMintaSerangOpen] = useState(false);
  const [isHinaOpen, setIsHinaOpen] = useState(false);
  const [spionaseResult, setSpionaseResult] = useState<SpionaseOperationResult | null>(null);
  const [sabotaseResult, setSabotaseResult] = useState<SabotaseOperationResult | null>(null);
  const pendingCovertOperationsRef = useRef(new Map<string, {
    operation: 'spionase' | 'sabotase';
    operationTarget?: string;
    successChance: number;
  }>());
  const playerCountryName = String(
    playerCountryDetail?.country ||
    playerCountryDetail?.nama_negara ||
    playerCountryDetail?.name_id ||
    playerCountryDetail?.name_en ||
    '',
  );
  const spionaseFuelQuote = useTravelFuelQuote(
    playerCountryName,
    countryName,
    'spionase',
    isSpionaseOpen,
  );
  const sabotaseFuelQuote = useTravelFuelQuote(
    playerCountryName,
    countryName,
    'sabotase',
    isSabotaseOpen,
  );
  const spionaseFuelStatus = getTravelFuelStatus(
    playerCountryDetail,
    spionaseFuelQuote.cost,
    spionaseFuelQuote.loading,
    spionaseFuelQuote.fallback,
  );
  const sabotaseFuelStatus = getTravelFuelStatus(
    playerCountryDetail,
    sabotaseFuelQuote.cost,
    sabotaseFuelQuote.loading,
    sabotaseFuelQuote.fallback,
  );
  const formatActionDate = (dateString?: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    if (Number.isNaN(date.getTime())) return dateString;
    const parts = new Intl.DateTimeFormat(language, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).formatToParts(date);
    const dayPart = parts.find(part => part.type === 'day')?.value || '';
    const monthPart = parts.find(part => part.type === 'month')?.value || '';
    const yearPart = parts.find(part => part.type === 'year')?.value || '';
    return `${dayPart} ${monthPart}, ${yearPart}`;
  };
  const datedActionClass = 'border border-amber-400/50 bg-amber-400/5 text-amber-300';
  const operationDateBadgeClass = 'absolute -top-6 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-sm border border-amber-400/30 bg-root-canvas px-2 py-1 text-[10px] font-bold tracking-wider text-amber-300 shadow-md';

  const isAnyMiliterModalActive = isSerangOpen || isAttackInProgressModalOpen || blockedPlayerAttack !== null || isSpionaseOpen || isSabotaseOpen || isNuklirOpen || isKudetaOpen || isMintaSerangOpen || isStatusMintaSerangOpen || isHinaOpen || !!spionaseResult || !!sabotaseResult;

  useEffect(() => {
    const handleCovertOperationResolved = (event: Event) => {
      const detail = (event as CustomEvent<{
        pathId?: string;
        kind?: string;
        targetCountry?: string;
        operationSucceeded?: boolean;
        losses?: SabotaseOperationResult['losses'];
        militaryReport?: SpionaseOperationResult['militaryReport'];
        economicReport?: SpionaseOperationResult['economicReport'];
      }>).detail;
      if (
        (detail?.kind !== 'spionase' && detail?.kind !== 'sabotase') ||
        !detail.pathId ||
        !detail.targetCountry ||
        typeof detail.operationSucceeded !== 'boolean'
      ) return;

      const covertInfo = pendingCovertOperationsRef.current.get(detail.pathId);
      if (!covertInfo || covertInfo.operation !== detail.kind) return;

      pendingCovertOperationsRef.current.delete(detail.pathId);
      if (detail.kind === 'spionase') {
        setSpionaseResult({
          operation: 'spionase',
          targetCountry: detail.targetCountry,
          operationTarget: covertInfo.operationTarget,
          successChance: covertInfo.successChance,
          succeeded: detail.operationSucceeded,
          militaryReport: detail.militaryReport,
          economicReport: detail.economicReport,
        });
      } else {
        setSabotaseResult({
          operation: 'sabotase',
          targetCountry: detail.targetCountry,
          operationTarget: covertInfo.operationTarget,
          successChance: covertInfo.successChance,
          succeeded: detail.operationSucceeded,
          losses: detail.losses,
        });
      }
    };

    window.addEventListener('neosantara_covert_operation_resolved', handleCovertOperationResolved);
    return () => window.removeEventListener('neosantara_covert_operation_resolved', handleCovertOperationResolved);
  }, []);

  const launchCovertOperation = (
    operation: 'spionase' | 'sabotase',
    operationTarget: string,
    personnelCount: number,
  ) => {
    const fuelQuote = operation === 'spionase' ? spionaseFuelQuote : sabotaseFuelQuote;
    const fuelStatus = operation === 'spionase' ? spionaseFuelStatus : sabotaseFuelStatus;
    const personnelType = operation === 'spionase' ? 'mataMata' : 'penyabot';
    const targetPersonnelCount = getCovertPersonnel()[personnelType];
    if (
      !playerCountryDetail ||
      !updatePlayerCountryDetail ||
      fuelQuote.cost === null ||
      !fuelStatus.ok ||
      !Number.isInteger(personnelCount) ||
      personnelCount < 1
    ) return;
    if (targetPersonnelCount < personnelCount) {
      alert(t("detail_negara_ai.military.insufficientPersonnel", {
        available: targetPersonnelCount,
        required: personnelCount,
      }));
      return;
    }

    const pathId = `covert-${operation}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const fuelUpdatedDetail = consumeTravelFuel(playerCountryDetail, fuelQuote.cost, {
      id: pathId,
      date: String(
        playerCountryDetail.currentDate ||
        playerCountryDetail.gameDate ||
        new Date().toISOString(),
      ).slice(0, 10),
      targetCountry: countryName,
      travelType: operation,
      amount: fuelQuote.cost,
    });
    if (fuelUpdatedDetail === playerCountryDetail || !consumePersonnel(personnelType, personnelCount)) return;

    updatePlayerCountryDetail(() => fuelUpdatedDetail);
    const result = operation === 'spionase'
      ? resolveSpionaseOperation(playerCountryDetail, operationTarget)
      : resolveSabotaseOperation(playerCountryDetail, operationTarget);
    pendingCovertOperationsRef.current.set(pathId, {
      operation,
      operationTarget,
      successChance: result.successChance,
    });
    window.dispatchEvent(new CustomEvent('neosantara_diplomacy_path', {
      detail: {
        pathId,
        kind: operation,
        senderCountry: playerCountryName,
        targetCountry: countryName,
        operationTarget,
        operationSucceeded: result.succeeded,
      },
    }));
    onMilitaryActionLaunched?.(operation);
    setIsSpionaseOpen(false);
    setIsSabotaseOpen(false);
  };

  const launchNuclearStrike = () => {
    const attackerCountry = String(
      playerCountryDetail?.country ||
      playerCountryDetail?.nama_negara ||
      playerCountryDetail?.name_id ||
      playerCountryDetail?.name_en ||
      ''
    ).trim();
    const attackerIso = String(playerCountryDetail?.iso || playerCountryDetail?.iso_code || '').toLowerCase();
    const targetIso = String(
      targetCountryDetail?.iso ||
      COUNTRIES_DATA.find(country => country.country.toLowerCase() === countryName.toLowerCase())?.iso ||
      ''
    ).toLowerCase();
    const dateString = currentDate instanceof Date && Number.isFinite(currentDate.getTime())
      ? currentDate.toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10);

    const result = launchIcbmWarStrike({
      attackerCountry,
      targetCountry: countryName,
      attackerIso,
      targetIso,
      currentDate: dateString,
      isPlayerAttacker: true,
    });

    if (!result.success) {
      window.dispatchEvent(new CustomEvent('neosantara_system_notification', {
        detail: {
          title: `❌ ${t("detail_negara_ai.military.icbmFailureTitle")}`,
          sender: t("detail_negara_ai.military.icbmCommandCenter"),
          message: t("detail_negara_ai.military.icbmFailureMessage"),
          date: dateString,
          type: 'peringkat',
        },
      }));
      return;
    }

    updatePlayerCountryDetail?.(previous => {
      if (!previous) return previous;
      const consumedCount = Math.max(0, Number(previous.icbm_consumed) || 0) + 1;
      const remainingCount = Math.max(
        0,
        Math.max(Number(previous.icbm_jumlah) || 0, Number(previous.icbm) || 0) - 1
      );
      return {
        ...previous,
        icbm_consumed: consumedCount,
        icbm_jumlah: remainingCount,
        icbm: remainingCount,
      };
    });

    if (onCloseCountryDetail) {
      onCloseCountryDetail();
    } else {
      onCloseDetailModal?.();
    }
    window.dispatchEvent(new CustomEvent('neosantara_system_notification', {
      detail: {
        title: `💥 ${t("detail_negara_ai.military.icbmLaunchTitle")}`,
        sender: t("detail_negara_ai.military.icbmCommandCenter"),
        message: t("detail_negara_ai.military.icbmLaunchMessage", {
          country: countryName,
        }),
        date: dateString,
        type: 'peringkat',
      },
    }));
  };

  useEffect(() => {
    if (onActionModalStateChange) {
      onActionModalStateChange(isAnyMiliterModalActive);
    }
  }, [isAnyMiliterModalActive, onActionModalStateChange]);

  const handleAction = (action: string) => {
    console.log(`Aksi militer: ${action} untuk ${countryName}`);
  };

  if (isOccupiedProvince) {
    return (
      <ProvinsiOperasiMiliter
        countryName={countryName}
        occupyingCountry={occupyingCountry || ''}
        provinceTension={provinceTension ?? 25}
        playerCountryDetail={playerCountryDetail || null}
        updatePlayerCountryDetail={updatePlayerCountryDetail || (() => undefined)}
      />
    );
  }

  return (
    <div className="space-y-6 lg:space-y-4 xl:space-y-6">
      {/* Grid Layout (1-2 kolom di ponsel portrait, 2-3 di landscape, 4 pada desktop) */}
      <div className="country-detail-action-grid grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 items-stretch gap-2.5 sm:gap-3 lg:gap-3 xl:gap-4 pt-3 sm:pt-4 lg:pt-4 xl:pt-6">
        <div className="relative w-full min-w-0">
          {actionDates?.serang && <div className={operationDateBadgeClass}>{formatActionDate(actionDates.serang)}</div>}
          <ActionButton icon={Crosshair} label={t('detail_negara_ai.actions.attack')} className={actionDates?.serang ? datedActionClass : undefined} iconClass={actionDates?.serang ? 'text-amber-300' : undefined} labelClass={actionDates?.serang ? 'text-amber-300' : undefined} onClick={() => {
            const activeAttack = getActivePlayerAttack();
            if (activeAttack) {
              setBlockedPlayerAttack({ status: activeAttack, requestedTarget: countryName });
              return;
            }
            if (actionDates?.serang) {
              setIsAttackInProgressModalOpen(true);
              return;
            }
            setIsSerangOpen(true);
          }} isDimmed={Boolean(activePlayerAttack)} title={activePlayerAttack ? t('detail_negara_ai.tooltips.attackInProgress', { country: activePlayerAttack.targetCountry }) : undefined} />
        </div>
        <div className="relative w-full min-w-0">
          {actionDates?.spionase && <div className={operationDateBadgeClass}>{formatActionDate(actionDates.spionase)}</div>}
          <ActionButton
            icon={Eye}
            label={t('detail_negara_ai.actions.espionage')}
            className={actionDates?.spionase ? datedActionClass : undefined}
            iconClass={actionDates?.spionase ? 'text-amber-300' : undefined}
            labelClass={actionDates?.spionase ? 'text-amber-300' : undefined}
            onClick={() => setIsSpionaseOpen(true)}
          />
        </div>
        <div className="relative w-full min-w-0">
          {actionDates?.sabotase && <div className={operationDateBadgeClass}>{formatActionDate(actionDates.sabotase)}</div>}
          <ActionButton
            icon={Bomb}
            label={t('detail_negara_ai.actions.sabotage')}
            className={actionDates?.sabotase ? datedActionClass : undefined}
            iconClass={actionDates?.sabotase ? 'text-amber-300' : undefined}
            labelClass={actionDates?.sabotase ? 'text-amber-300' : undefined}
            onClick={() => setIsSabotaseOpen(true)}
          />
        </div>
        <ActionButton icon={Radiation} label={t('detail_negara_ai.actions.nuclearWar')} onClick={() => { if (onCloseDetailModal) onCloseDetailModal(); setIsNuklirOpen(true); }} />
        
        <div className="relative w-full min-w-0">
          {actionDates?.kudeta && <div className={operationDateBadgeClass}>{formatActionDate(actionDates.kudeta)}</div>}
          <ActionButton
            icon={UserX}
            label={t('detail_negara_ai.actions.coup')}
            className={actionDates?.kudeta ? datedActionClass : undefined}
            iconClass={actionDates?.kudeta ? 'text-amber-300' : undefined}
            labelClass={actionDates?.kudeta ? 'text-amber-300' : undefined}
            isDimmed={Boolean(actionDates?.kudeta)}
            onClick={() => {
              if (actionDates?.kudeta) return;
              if (onCloseDetailModal) onCloseDetailModal();
              setIsKudetaOpen(true);
            }}
          />
        </div>
        <div className="relative w-full min-w-0">
          {actionDates?.mintaSerang && <div className={operationDateBadgeClass}>{formatActionDate(actionDates.mintaSerang)}</div>}
          <ActionButton
            icon={Phone}
            label={t('detail_negara_ai.actions.requestAttack')}
            className={actionDates?.mintaSerang ? datedActionClass : undefined}
            iconClass={actionDates?.mintaSerang ? 'text-amber-300' : undefined}
            labelClass={actionDates?.mintaSerang ? 'text-amber-300' : undefined}
            onClick={() => {
              if (actionDates?.mintaSerang) {
                setIsStatusMintaSerangOpen(true);
              } else {
                setIsMintaSerangOpen(true);
              }
            }}
          />
        </div>
        <ActionButton icon={MessageSquare} label={t('detail_negara_ai.actions.insult')} onClick={() => { if (onCloseDetailModal) onCloseDetailModal(); setIsHinaOpen(true); }} />
      </div>

      <SerangNegaraModal
        isOpen={isSerangOpen}
        countryName={countryName}
        selectedCity={selectedCity}
        selectedCityId={selectedCityId}
        playerCountryDetail={playerCountryDetail}
        targetCountryDetail={targetCountryDetail}
        isAttackInProgress={Boolean(actionDates?.serang)}
        onClose={() => setIsSerangOpen(false)}
        onCloseDetailModal={onCloseDetailModal}
        onAttackBlocked={() => setIsAttackInProgressModalOpen(true)}
        onPlayerAttackBlocked={(status, requestedTarget) => setBlockedPlayerAttack({ status, requestedTarget })}
        onAttackLaunched={() => onMilitaryActionLaunched?.('serang')}
        updatePlayerCountryDetail={updatePlayerCountryDetail}
        onConfirm={(actionType, targetCountry) => {
          setIsSerangOpen(false);
          if (onCloseDetailModal) onCloseDetailModal();
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('trigger_player_attack', {
                detail: {
                  actionType,
                  targetCountry
                }
              })
            );
          }
        }}
      />
      <SeranganMasihBerlangsungModal
        isOpen={isAttackInProgressModalOpen}
        countryName={countryName}
        onClose={() => setIsAttackInProgressModalOpen(false)}
      />
      <SerangBelumSelesaiModals
        isOpen={blockedPlayerAttack !== null}
        onClose={() => setBlockedPlayerAttack(null)}
        ongoingTarget={blockedPlayerAttack?.status.targetCountry ?? ''}
        ongoingCity={blockedPlayerAttack?.status.targetCityName}
        requestedTarget={blockedPlayerAttack?.requestedTarget}
      />
      <PerangNuklirModal
        isOpen={isNuklirOpen}
        countryName={countryName}
        availableIcbmCount={getReadyIcbmCount(playerCountryDetail, currentDate)}
        onClose={() => setIsNuklirOpen(false)}
        onConfirm={launchNuclearStrike}
      />
      <KudetaModal
        isOpen={isKudetaOpen}
        countryName={countryName}
        playerCountryDetail={playerCountryDetail}
        targetCountryDetail={targetCountryDetail}
        onClose={() => setIsKudetaOpen(false)}
        onConfirm={() => {
          const targetCountrySlug = String(targetCountryDetail?.country_slug || '');
          if (!playerCountryName || !targetCountrySlug || !onMilitaryActionLaunched) {
            console.error('Kudeta tidak dapat dijadwalkan karena data rute atau kalender operasi tidak tersedia.');
            return false;
          }
          if (onMilitaryActionLaunched('kudeta') === false) return false;
          if (typeof window === 'undefined') return false;

          window.dispatchEvent(new CustomEvent('neosantara_diplomacy_path', {
            detail: {
              pathId: `coup-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
              kind: 'kudeta',
              senderCountry: playerCountryName,
              targetCountry: countryName,
              targetCountrySlug,
            },
          }));
          return true;
        }}
      />
      <MintaSerangNegaraModal 
        isOpen={isMintaSerangOpen} 
        countryName={countryName} 
        isPuppet={targetCountryDetail?.isPuppet === true}
        onClose={() => setIsMintaSerangOpen(false)} 
        onConfirm={(selectedTargetCountry, targetCity, amount) => {
          setIsMintaSerangOpen(false);
          if (onCloseDetailModal) onCloseDetailModal();
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('trigger_requested_invasion', {
                detail: {
                  attackerCountry: countryName,       // Negara yang diminta menyerang (Rusia)
                  targetCountry: selectedTargetCountry, // Negara target sasaran yang dipilih di dropdown (Afganistan)
                  attackerCountrySlug: targetCountryDetail?.country_slug,
                  targetCityId: targetCity.cityId,
                  targetCityName: targetCity.name,
                  amount,
                  requestId: `requested-attack-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                }
              })
            );
          }
        }} 
      />
      <StatusMintaSerangModal
        isOpen={isStatusMintaSerangOpen}
        countryName={countryName}
        arrivalDate={actionDates?.mintaSerang || null}
        onClose={() => setIsStatusMintaSerangOpen(false)}
      />
      <HinaModal isOpen={isHinaOpen} countryName={countryName} onClose={() => setIsHinaOpen(false)} onConfirm={() => { console.log(`Hina -> ${countryName}`); }} />
      {typeof document !== 'undefined' && isSpionaseOpen && updatePlayerCountryDetail && createPortal(
        <KonfirmasiSpionaseModals
          isOpen={isSpionaseOpen}
          onClose={() => setIsSpionaseOpen(false)}
          targetCountry={{ countryName }}
          currentBudget={Number(playerCountryDetail?.anggaran ?? 0)}
          updatePlayerCountryDetail={updatePlayerCountryDetail}
          onRecruitModalVisibilityChange={() => undefined}
          travelFuelStatus={spionaseFuelStatus}
          onConfirm={(operationTarget, personnelCount) => {
            launchCovertOperation('spionase', operationTarget, personnelCount);
          }}
        />,
        document.body,
      )}
      {typeof document !== 'undefined' && isSabotaseOpen && updatePlayerCountryDetail && createPortal(
        <KonfirmasiSabotaseModals
          isOpen={isSabotaseOpen}
          onClose={() => setIsSabotaseOpen(false)}
          targetCountry={{ countryName }}
          currentBudget={Number(playerCountryDetail?.anggaran ?? 0)}
          updatePlayerCountryDetail={updatePlayerCountryDetail}
          onRecruitModalVisibilityChange={() => undefined}
          travelFuelStatus={sabotaseFuelStatus}
          onConfirm={(operationTarget, personnelCount) => {
            launchCovertOperation('sabotase', operationTarget, personnelCount);
          }}
        />,
        document.body,
      )}
      <ResultSpionaseModals
        result={spionaseResult}
        onClose={() => setSpionaseResult(null)}
      />
      <ResultSabotaseModals
        result={sabotaseResult}
        onClose={() => setSabotaseResult(null)}
      />
    </div>
  );
}