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
import { COUNTRIES_DATA } from '../../map_system/map-data';
import SerangNegaraModal from './1_serang_negara/serangNegaraModals';
import SeranganMasihBerlangsungModal from './1_serang_negara/SeranganMasihBerlangsungModal';
import SpionaseModal from './2_spionase/spionaseModals';
import SabotaseModal from './3_sabotase/sabotaseModals';
import PerangNuklirModal from './4_perang_nuklir/perangNuklirModals';
import { getReadyIcbmCount } from './4_perang_nuklir/IcbmTidakTersediaModal';
import { launchIcbmWarStrike } from '../../navigasi_menu/2_navigasi_bawah/6_pertahanan/5_icbm/modals_menu/3_perang_nuklir/icbmWarLogic';
import KudetaModal from './5_lakukan_kudeta/kudetaModals';
import MintaSerangNegaraModal from './6_minta_serang_negara/mintaSerangNegaraModals';
import StatusMintaSerangModal from './6_minta_serang_negara/statusMintaSerangModal';
import HinaModal from './7_hina/hinaModals';
import ProvinsiOperasiMiliter from '../1_informasi_umum/provinsi_logic/ProvinsiOperasiMiliter';
import CovertOperationResultModal from './CovertOperationResultModal';
import { resolveCovertOperation, type CovertOperationResult, type CovertOperationType } from './covertOperationLogic';

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
  actionDates?: Partial<Record<'serang' | 'spionase' | 'sabotase' | 'mintaSerang', string>>;
  onMilitaryActionLaunched?: (action: 'serang' | 'spionase' | 'sabotase') => void;
  updatePlayerCountryDetail?: (updater: (previous: Record<string, unknown> | null) => Record<string, unknown> | null) => void;
}

// Komponen tombol aksi (Persis sama dengan menu lainnya)
const ActionButton = ({ icon: Icon, label, onClick, className, iconClass, labelClass }: { icon: any, label: string, onClick?: () => void, className?: string, iconClass?: string, labelClass?: string }) => (
  <button
    onClick={onClick}
    className={`w-full ${className || 'bg-[#0A1A1A] border border-[#00FFAA]/20'} rounded-xl p-5 lg:p-3 xl:p-5 flex flex-col items-center justify-center gap-3 lg:gap-2 xl:gap-3 ${className ? 'hover:border-amber-300 hover:bg-amber-400/10' : 'hover:border-[#00FFAA]/50 hover:bg-[#00FFAA]/10'} hover:shadow-md transition-all cursor-pointer group h-32 lg:h-24 xl:h-32`}
  >
    <Icon className={`h-8 w-8 lg:h-6 lg:w-6 xl:h-8 xl:w-8 ${iconClass || 'text-[#00FFAA]'} group-hover:scale-110 transition-transform`} />
    <span className={`text-xs lg:text-[10px] xl:text-xs font-black ${labelClass || 'text-[#00FFAA]'} uppercase tracking-wider text-center leading-tight`}>
      {label}
    </span>
  </button>
);

export default function OperasiMiliter({ countryName, selectedCity, selectedCityId, playerCountryDetail, targetCountryDetail, onCloseDetailModal, onCloseCountryDetail, onActionModalStateChange, isOccupiedProvince, occupyingCountry, provinceTension, currentDate, actionDates, onMilitaryActionLaunched, updatePlayerCountryDetail }: OperasiMiliterProps) {
  const [isSerangOpen, setIsSerangOpen] = useState(false);
  const [isAttackInProgressModalOpen, setIsAttackInProgressModalOpen] = useState(false);
  const [isSpionaseOpen, setIsSpionaseOpen] = useState(false);
  const [isSabotaseOpen, setIsSabotaseOpen] = useState(false);
  const [isNuklirOpen, setIsNuklirOpen] = useState(false);
  const [isKudetaOpen, setIsKudetaOpen] = useState(false);
  const [isMintaSerangOpen, setIsMintaSerangOpen] = useState(false);
  const [isStatusMintaSerangOpen, setIsStatusMintaSerangOpen] = useState(false);
  const [isHinaOpen, setIsHinaOpen] = useState(false);
  const [covertOperationResult, setCovertOperationResult] = useState<CovertOperationResult | null>(null);
  const pendingCovertOperationsRef = useRef(new Map<string, CovertOperationType>());
  const formatActionDate = (dateString?: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    if (Number.isNaN(date.getTime())) return dateString;
    const parts = new Intl.DateTimeFormat('id-ID', {
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
  const operationDateBadgeClass = 'absolute -top-6 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-sm border border-amber-400/30 bg-[#0A1A1A] px-2 py-1 text-[10px] font-bold tracking-wider text-amber-300 shadow-md';

  const isAnyMiliterModalActive = isSerangOpen || isAttackInProgressModalOpen || isSpionaseOpen || isSabotaseOpen || isNuklirOpen || isKudetaOpen || isMintaSerangOpen || isStatusMintaSerangOpen || isHinaOpen || !!covertOperationResult;

  useEffect(() => {
    const handleCovertOperationArrival = (event: Event) => {
      const path = (event as CustomEvent<{ pathId?: string; targetCountry?: string }>).detail;
      const operation = path?.pathId ? pendingCovertOperationsRef.current.get(path.pathId) : undefined;
      if (!path?.pathId || !operation || !path.targetCountry) return;

      pendingCovertOperationsRef.current.delete(path.pathId);
      const result = resolveCovertOperation(operation, playerCountryDetail);
      setCovertOperationResult({ operation, targetCountry: path.targetCountry, ...result });
    };

    window.addEventListener('neosantara_covert_operation_arrived', handleCovertOperationArrival);
    return () => window.removeEventListener('neosantara_covert_operation_arrived', handleCovertOperationArrival);
  }, [playerCountryDetail]);

  const launchCovertOperation = (operation: CovertOperationType, targetCountry: string) => {
    const pathId = `covert-${operation}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    pendingCovertOperationsRef.current.set(pathId, operation);
    window.dispatchEvent(new CustomEvent('neosantara_diplomacy_path', {
      detail: {
        pathId,
        kind: operation,
        senderCountry: playerCountryDetail?.country || playerCountryDetail?.nama_negara || playerCountryDetail?.name_id || playerCountryDetail?.name_en || countryName,
        targetCountry,
      },
    }));
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
          title: '❌ GAGAL MELUNCURKAN ICBM',
          sender: 'Pusat Komando Strategis Nuklir',
          message: result.message,
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
        title: '💥 SERANGAN RUDAL ICBM DILUNCURKAN',
        sender: 'Pusat Komando Strategis Nuklir',
        message: `Presiden! Satu unit Rudal Balistik Antarbenua (ICBM) berkepala nuklir telah berhasil diluncurkan menuju target sasaran di ${countryName}. Seluruh 210 negara dunia memberikan penalti hubungan diplomatik -5 poin atas peluncuran senjata pemusnah massal ini!`,
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
      {/* Grid Layout 4-4 (2 baris x 4 kolom pada desktop) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-3 xl:gap-4">
        <div className="relative w-full min-w-0">
          {actionDates?.serang && <div className={operationDateBadgeClass}>{formatActionDate(actionDates.serang)}</div>}
          <ActionButton icon={Crosshair} label="Serang Negara" className={actionDates?.serang ? datedActionClass : undefined} iconClass={actionDates?.serang ? 'text-amber-300' : undefined} labelClass={actionDates?.serang ? 'text-amber-300' : undefined} onClick={() => {
            if (actionDates?.serang) {
              setIsAttackInProgressModalOpen(true);
              return;
            }
            setIsSerangOpen(true);
          }} />
        </div>
        <div className="relative w-full min-w-0">
          {actionDates?.spionase && <div className={operationDateBadgeClass}>{formatActionDate(actionDates.spionase)}</div>}
          <ActionButton icon={Eye} label="Spionase" className={actionDates?.spionase ? datedActionClass : undefined} iconClass={actionDates?.spionase ? 'text-amber-300' : undefined} labelClass={actionDates?.spionase ? 'text-amber-300' : undefined} onClick={() => { if (onCloseDetailModal) onCloseDetailModal(); setIsSpionaseOpen(true); }} />
        </div>
        <div className="relative w-full min-w-0">
          {actionDates?.sabotase && <div className={operationDateBadgeClass}>{formatActionDate(actionDates.sabotase)}</div>}
          <ActionButton icon={Bomb} label="Sabotase" className={actionDates?.sabotase ? datedActionClass : undefined} iconClass={actionDates?.sabotase ? 'text-amber-300' : undefined} labelClass={actionDates?.sabotase ? 'text-amber-300' : undefined} onClick={() => { if (onCloseDetailModal) onCloseDetailModal(); setIsSabotaseOpen(true); }} />
        </div>
        <ActionButton icon={Radiation} label="Perang Nuklir" onClick={() => { if (onCloseDetailModal) onCloseDetailModal(); setIsNuklirOpen(true); }} />
        
        <ActionButton icon={UserX} label="Lakukan Kudeta" onClick={() => { if (onCloseDetailModal) onCloseDetailModal(); setIsKudetaOpen(true); }} />
        <div className="relative w-full min-w-0">
          {actionDates?.mintaSerang && <div className={operationDateBadgeClass}>{formatActionDate(actionDates.mintaSerang)}</div>}
          <ActionButton
            icon={Phone}
            label="Minta Menyerang Negara"
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
        <ActionButton icon={MessageSquare} label="Hina" onClick={() => { if (onCloseDetailModal) onCloseDetailModal(); setIsHinaOpen(true); }} />
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
        onAttackLaunched={() => onMilitaryActionLaunched?.('serang')}
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
      <SpionaseModal isOpen={isSpionaseOpen} countryName={countryName} playerCountryDetail={playerCountryDetail} onClose={() => setIsSpionaseOpen(false)} onConfirm={(target) => {
        onMilitaryActionLaunched?.('spionase');
        launchCovertOperation('spionase', target);
      }} />
      <SabotaseModal isOpen={isSabotaseOpen} countryName={countryName} playerCountryDetail={playerCountryDetail} onClose={() => setIsSabotaseOpen(false)} onConfirm={(target) => {
        onMilitaryActionLaunched?.('sabotase');
        launchCovertOperation('sabotase', target);
      }} />
      <PerangNuklirModal
        isOpen={isNuklirOpen}
        countryName={countryName}
        availableIcbmCount={getReadyIcbmCount(playerCountryDetail, currentDate)}
        onClose={() => setIsNuklirOpen(false)}
        onConfirm={launchNuclearStrike}
      />
      <KudetaModal isOpen={isKudetaOpen} countryName={countryName} onClose={() => setIsKudetaOpen(false)} onConfirm={() => { console.log(`Kudeta -> ${countryName}`); }} />
      <MintaSerangNegaraModal 
        isOpen={isMintaSerangOpen} 
        countryName={countryName} 
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
                  targetCityId: targetCity.cityId,
                  targetCityName: targetCity.name,
                  amount
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
      <CovertOperationResultModal
        result={covertOperationResult}
        onClose={() => setCovertOperationResult(null)}
      />
    </div>
  );
}