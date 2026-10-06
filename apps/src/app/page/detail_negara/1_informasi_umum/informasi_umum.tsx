"use client";
import React, { useEffect, useState } from 'react';
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
import { getEmbassyButtonLabel, getEmbassyButtonClass, playerHasEmbassyOrTradePartners } from './1_kedutaan_besar/logic/kedutaanBesarLogic';
import DestroyEmbassyModal from './1_kedutaan_besar/logic/DestroyEmbassyModal';
import BuildEmbassyModal from './1_kedutaan_besar/BuildEmbassyModal';
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

interface InformasiUmumProps {
  countryName: string;
  playerCountryDetail?: any; // data negara pemain (dipassing dari MapPage)
  setPlayerCountryDetail?: (detail: any | ((prev: any) => any)) => void;
  currentNetBalance?: number;
  adjustNetBalance?: (delta: number) => void;
  currentDate?: Date;
  autoBuildEmbassy?: boolean;
  isOccupiedProvince?: boolean;
  occupyingCountry?: string;
}

// Komponen tombol aksi
const ActionButton = ({ icon: Icon, label, onClick, className, iconClass, labelClass, disabled, keepOpacity }: { icon: any, label: string, onClick?: () => void, className?: string, iconClass?: string, labelClass?: string, disabled?: boolean, keepOpacity?: boolean }) => {
  const base = `${className ?? 'bg-[#0A1A1A] border border-[#00FFAA]/20'} w-full min-w-0 rounded-xl p-5 flex flex-col items-center justify-center gap-3 transition-all group h-32`;
  const interactive = disabled 
    ? (keepOpacity ? 'cursor-not-allowed' : 'opacity-40 cursor-not-allowed pointer-events-none') 
    : 'hover:shadow-md hover:border-[#00FFAA]/50 hover:bg-[#00FFAA]/10 cursor-pointer';
  return (
    <button
      onClick={disabled ? undefined : onClick}
      aria-disabled={disabled}
      className={`${base} ${interactive}`}
    >
      <Icon className={`h-8 w-8 ${iconClass ?? 'text-[#00FFAA]'} ${disabled && !keepOpacity ? '' : 'group-hover:scale-110'} transition-transform`} />
      <span className={`text-xs font-black ${labelClass ?? 'text-[#00FFAA]'} uppercase tracking-wider text-center leading-tight`}>
        {label}
      </span>
    </button>
  );
};

export default function InformasiUmum({ countryName, playerCountryDetail, setPlayerCountryDetail, currentNetBalance: currentNetBalanceProp, adjustNetBalance, currentDate, autoBuildEmbassy, isOccupiedProvince, occupyingCountry }: InformasiUmumProps) {
  const playerCountryName = playerCountryDetail?.country || playerCountryDetail?.nama || playerCountryDetail?.country_name || null;
  const [isDestroyModalOpen, setIsDestroyModalOpen] = useState(false);
  const [isBuildEmbassyModalOpen, setIsBuildEmbassyModalOpen] = useState<boolean>(() => !!autoBuildEmbassy);
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

  const handleAction = (action: string) => {
    // Fallback handler if needed; most actions open dedicated modals now.
    console.log(`Aksi dipilih: ${action} untuk negara ${countryName}`);
  };

  const currentNetBalance = Number(currentNetBalanceProp ?? 0);
  const playerBudget = Number(playerCountryDetail?.anggaran) || currentNetBalance;
  const continentLabel = String(playerCountryDetail?.continent || playerCountryDetail?.region || playerCountryDetail?.benua || 'Lainnya');
  const playerEmbassies = Array.isArray(playerCountryDetail?.embassies) ? playerCountryDetail.embassies : [];
  const removedEmbassies = Array.isArray(playerCountryDetail?.removedEmbassies) ? playerCountryDetail.removedEmbassies : [];
  const removedTradePartners = Array.isArray(playerCountryDetail?.removedTradePartners) ? playerCountryDetail.removedTradePartners : [];
  const addedTradePartners = Array.isArray(playerCountryDetail?.addedTradePartners) ? playerCountryDetail.addedTradePartners : [];

  const getEmbassyCost = (continent?: string | null): number => {
    switch (String(continent || 'Lainnya').trim().toLowerCase()) {
      case 'asia':
        return 5;
      case 'afrika':
      case 'africa':
        return 4;
      case 'amerika utara':
      case 'north america':
        return 6;
      case 'amerika selatan':
      case 'south america':
        return 5;
      case 'eropa':
      case 'europe':
        return 7;
      case 'oceania':
      case 'australia':
        return 3;
      case 'antartika':
      case 'antarctica':
        return 2;
      default:
        return 5;
    }
  };

  const embassyCost = getEmbassyCost(continentLabel);
  const embassyResultBudget = playerBudget - embassyCost;

  const embassyLabel = getEmbassyButtonLabel(countryName, playerCountryName, playerEmbassies, removedEmbassies, removedTradePartners);
  const embassyClass = getEmbassyButtonClass(countryName, playerCountryName, playerEmbassies, removedEmbassies, removedTradePartners);
  const embassyIconClass = embassyLabel === 'Hancurkan Kedutaan' ? 'text-[#00FFAA]' : undefined;
  const embassyLabelClass = embassyLabel === 'Hancurkan Kedutaan' ? 'text-[#00FFAA]' : undefined;

  const hasTrade = getTradeButtonLabel(countryName, playerCountryName, removedTradePartners, addedTradePartners) === 'Putus Hubungan Dagang';
  const tradeIsActive = hasTrade || tradeActive;
  const tradeLabel = tradeIsActive ? 'Putus Hubungan Dagang' : 'Perjanjian Dagang';
  const tradeClass = getTradeButtonClass(countryName, playerCountryName, removedTradePartners, addedTradePartners);
  const tradeIconClass = tradeIsActive ? 'text-[#00FFAA]' : undefined;
  const tradeLabelClass = tradeIsActive ? 'text-[#00FFAA]' : undefined;

  // Extract active treaties from playerCountryDetail
  const nonAggressionPacts = Array.isArray(playerCountryDetail?.nonAggressionPacts) ? playerCountryDetail.nonAggressionPacts : [];
  const defenseAlliances = Array.isArray(playerCountryDetail?.defenseAlliances) ? playerCountryDetail.defenseAlliances : [];
  const researchContracts = Array.isArray(playerCountryDetail?.researchContracts) ? playerCountryDetail.researchContracts : [];

  const normCountryName = String(countryName || '').toLowerCase().trim();
  const hasPaktaInDetail = nonAggressionPacts.some((p: string) => String(p).toLowerCase().trim() === normCountryName);
  const hasAliansiInDetail = defenseAlliances.some((p: string) => String(p).toLowerCase().trim() === normCountryName);
  const hasKontrakInDetail = researchContracts.some((p: string) => String(p).toLowerCase().trim() === normCountryName);

  const paktaIsActive = hasPaktaInDetail || paktaActive;
  const aliansiIsActive = hasAliansiInDetail || aliansiActive;
  const kontrakIsActive = hasKontrakInDetail || kontrakActive;

  // Local active states: sync initial values when country/player changes
  // Sync initial active states from logic at mount / when country changes
  // (we keep local state so user actions toggle UI immediately)
  useEffect(() => {
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
    if (autoBuildEmbassy) {
      setIsBuildEmbassyModalOpen(true);
    }
  }, [countryName, playerCountryName, playerEmbassies.length, removedEmbassies.length, removedTradePartners.length, addedTradePartners.length, nonAggressionPacts.length, defenseAlliances.length, researchContracts.length, autoBuildEmbassy]);

  // PERBAIKAN: Style tombol aktif dalam tema dark mode sci-fi
  const modernGreenBorderClass = 'border-2 border-[#00FFAA] bg-[#00FFAA]/20 text-[#00FFAA] hover:bg-[#00FFAA]/30';

  const handleEmbassyClick = () => {
    if (embassyActive) {
      setIsDestroyModalOpen(true);
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
  const normTargetCountry = String(countryName || '').toLowerCase().trim();
  const ongoingEmbassyConstructions = Array.isArray(playerCountryDetail?.ongoingEmbassyConstructions)
    ? playerCountryDetail.ongoingEmbassyConstructions
    : [];
  const currentEmbassyConstruction = ongoingEmbassyConstructions.find(
    (c: any) => String(c.targetCountry || '').toLowerCase().trim() === normTargetCountry
  );
  const isEmbassyBuilding = !!currentEmbassyConstruction;
  const embassyEndDate = currentEmbassyConstruction?.endDate || null;

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
        <ProvinsiInformasiUmum countryName={countryName} occupyingCountry={occupyingCountry || playerCountryName || ''} />
      ) : <div className="grid grid-cols-2 md:grid-cols-4 items-stretch gap-4 pt-6">
        
        {/* Tombol Kedutaan dengan Badge Tanggal Selesai */}
        <div className="relative min-w-0">
          {isEmbassyBuilding && embassyEndDate && (
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 bg-[#0A1A1A] text-[#00FFAA] text-[10px] font-bold px-2 py-1 border border-[#00FFAA]/30 rounded-sm shadow-md tracking-wider whitespace-nowrap">
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
                ? 'border border-[#00FFAA]/40 bg-[#0A1A1A] text-[#00FFAA]'
                : embassyActive 
                  ? modernGreenBorderClass 
                  : embassyClass
            } 
            iconClass={embassyActive || isEmbassyBuilding ? 'text-[#00FFAA]' : embassyIconClass}
            labelClass={embassyActive || isEmbassyBuilding ? 'text-[#00FFAA]' : embassyLabelClass}
          />
        </div>
        
        <ActionButton icon={ShieldOff} label={paktaIsActive ? 'Putus Pakta Non Agresi' : 'Pakta Non Agresi'} onClick={() => paktaIsActive ? setIsDestroyPaktaOpen(true) : setIsPaktaModalOpen(true)} disabled={!embassyActive} className={paktaIsActive ? modernGreenBorderClass : undefined} iconClass={paktaIsActive ? 'text-[#00FFAA]' : undefined} labelClass={paktaIsActive ? 'text-[#00FFAA]' : undefined} />
        <ActionButton icon={ShieldCheck} label={aliansiIsActive ? 'Putus Aliansi Pertahanan' : 'Aliansi Pertahanan'} onClick={() => aliansiIsActive ? setIsDestroyAliansiOpen(true) : setIsAliansiModalOpen(true)} disabled={!embassyActive} className={aliansiIsActive ? modernGreenBorderClass : undefined} iconClass={aliansiIsActive ? 'text-[#00FFAA]' : undefined} labelClass={aliansiIsActive ? 'text-[#00FFAA]' : undefined} />
        
        {/* PERBAIKAN: Tombol Perjanjian Dagang diubah menggunakan modernGreenBorderClass yang sama */}
        <ActionButton
          icon={Handshake}
          label={tradeLabel}
          onClick={() => {
            if (tradeIsActive) {
              setIsDestroyTradeModalOpen(true);
            } else {
              setIsBuildTradeModalOpen(true);
            }
          }}
          className={tradeIsActive ? modernGreenBorderClass : tradeClass}
          disabled={!embassyActive}
          iconClass={tradeIsActive ? 'text-[#00FFAA]' : tradeIconClass}
          labelClass={tradeIsActive ? 'text-[#00FFAA]' : tradeLabelClass}
        />
        
        <ActionButton icon={FlaskConical} label={kontrakIsActive ? 'Putus Kontrak Penelitian' : 'Kontrak Penelitian'} onClick={() => kontrakIsActive ? setIsDestroyKontrakOpen(true) : setIsKontrakModalOpen(true)} disabled={!embassyActive} className={kontrakIsActive ? modernGreenBorderClass : undefined} iconClass={kontrakIsActive ? 'text-[#00FFAA]' : undefined} labelClass={kontrakIsActive ? 'text-[#00FFAA]' : undefined} />
        <ActionButton icon={Sword} label="Kirim Pasukan" onClick={() => setIsKirimPasukanModalOpen(true)} disabled={!embassyActive} />
        <ActionButton icon={Phone} label="Panggil Sekutu" onClick={() => setIsPanggilSekutuModalOpen(true)} disabled={!embassyActive} />
        <ActionButton icon={Ban} label="Berikan Sanksi" onClick={() => setIsBerikanSanksiModalOpen(true)} />
      </div>}

      <DestroyEmbassyModal
        isOpen={isDestroyModalOpen}
        countryName={countryName}
        onClose={() => setIsDestroyModalOpen(false)}
        onConfirm={() => {
          setEmbassyActive(false);
          setTradeActive(false);
          setPaktaActive(false);
          setAliansiActive(false);
          setKontrakActive(false);
          if (setPlayerCountryDetail) {
            setPlayerCountryDetail((prev: any) => {
              if (!prev) return prev;
              const existingEmbassies = Array.isArray(prev.embassies) ? prev.embassies : [];
              const existingRemovedEmbassies = Array.isArray(prev.removedEmbassies) ? prev.removedEmbassies : [];
              const existingRemovedTrade = Array.isArray(prev.removedTradePartners) ? prev.removedTradePartners : [];
              const existingConstructions = Array.isArray(prev.ongoingEmbassyConstructions) ? prev.ongoingEmbassyConstructions : [];
              const normTarget = String(countryName || '').toLowerCase().trim();

              return {
                ...prev,
                embassies: existingEmbassies.filter(
                  (embassy: any) => String(embassy.mitra || '').toLowerCase().trim() !== normTarget
                ),
                ongoingEmbassyConstructions: existingConstructions.filter(
                  (c: any) => String(c.targetCountry || '').toLowerCase().trim() !== normTarget
                ),
                removedEmbassies: Array.from(new Set([...existingRemovedEmbassies, countryName])),
                removedTradePartners: Array.from(new Set([...existingRemovedTrade, countryName])),
              };
            });
          }
          console.log(`Kedutaan di ${countryName} dihancurkan.`);
        }}
      />

      <BuildEmbassyModal
        isOpen={isBuildEmbassyModalOpen}
        countryName={countryName}
        continent={continentLabel}
        currentBudget={currentNetBalance}
        cost={embassyCost}
        onClose={() => setIsBuildEmbassyModalOpen(false)}
        onConfirm={() => {
          // Hitung Tanggal Selesai (60 Hari dari currentDate)
          const baseDate = currentDate ? new Date(currentDate) : new Date();
          const endDateObj = new Date(baseDate);
          endDateObj.setDate(endDateObj.getDate() + 60);
          
          const endYear = endDateObj.getFullYear();
          const endMonth = String(endDateObj.getMonth() + 1).padStart(2, '0');
          const endDay = String(endDateObj.getDate()).padStart(2, '0');
          const endDateStr = `${endYear}-${endMonth}-${endDay}`;

          if (setPlayerCountryDetail) {
            setPlayerCountryDetail((prev: any) => {
              const existingConstructions = Array.isArray(prev?.ongoingEmbassyConstructions) ? prev.ongoingEmbassyConstructions : [];
              const normTarget = String(countryName || '').toLowerCase().trim();

              return {
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
                    durationDays: 60,
                    continent: continentLabel
                  }
                ]
              };
            });
          }

          if (adjustNetBalance) {
            adjustNetBalance(-embassyCost);
          }
          console.log(`Konstruksi Kedutaan di ${countryName} dimulai. Estimasi selesai: ${endDateStr}`);
        }}
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
              const existingRemovedTrade = Array.isArray(prev.removedTradePartners) ? prev.removedTradePartners : [];
              return {
                ...prev,
                removedTradePartners: Array.from(new Set([...existingRemovedTrade, countryName])),
              };
            });
          }
          console.log(`Perjanjian dagang dengan ${countryName} diputus.`);
        }}
      />


      <BuildTradeModal
        isOpen={isBuildTradeModalOpen}
        countryName={countryName}
        onClose={() => setIsBuildTradeModalOpen(false)}
        onConfirm={() => {
          setTradeActive(true);
          console.log(`Perjanjian dagang dengan ${countryName} dijalin.`);
        }}
      />

      <PaktaNonAgresiModal
        isOpen={isPaktaModalOpen}
        countryName={countryName}
        onClose={() => setIsPaktaModalOpen(false)}
        onConfirm={() => {
          setPaktaActive(true);
          if (setPlayerCountryDetail) {
            setPlayerCountryDetail((prev: any) => ({
              ...prev,
              nonAggressionPacts: Array.from(new Set([...(prev?.nonAggressionPacts || []), countryName]))
            }));
          }
          console.log(`Pakta Non-Agresi dengan ${countryName} dijalin.`);
        }}
      />

      <DestroyPaktaModal
        isOpen={isDestroyPaktaOpen}
        countryName={countryName}
        onClose={() => setIsDestroyPaktaOpen(false)}
        onConfirm={() => {
          setPaktaActive(false);
          if (setPlayerCountryDetail) {
            setPlayerCountryDetail((prev: any) => ({
              ...prev,
              nonAggressionPacts: (prev?.nonAggressionPacts || []).filter((c: string) => String(c).toLowerCase().trim() !== normCountryName)
            }));
          }
          console.log(`Pakta Non-Agresi dengan ${countryName} diputus.`);
        }}
      />

      <AliansiPertahananModal
        isOpen={isAliansiModalOpen}
        countryName={countryName}
        onClose={() => setIsAliansiModalOpen(false)}
        onConfirm={() => {
          setAliansiActive(true);
          if (setPlayerCountryDetail) {
            setPlayerCountryDetail((prev: any) => ({
              ...prev,
              defenseAlliances: Array.from(new Set([...(prev?.defenseAlliances || []), countryName]))
            }));
          }
          console.log(`Aliansi Pertahanan dengan ${countryName} diajukan.`);
        }}
      />

      <DestroyAliansiModal
        isOpen={isDestroyAliansiOpen}
        countryName={countryName}
        onClose={() => setIsDestroyAliansiOpen(false)}
        onConfirm={() => {
          setAliansiActive(false);
          if (setPlayerCountryDetail) {
            setPlayerCountryDetail((prev: any) => ({
              ...prev,
              defenseAlliances: (prev?.defenseAlliances || []).filter((c: string) => String(c).toLowerCase().trim() !== normCountryName)
            }));
          }
          console.log(`Aliansi Pertahanan dengan ${countryName} diputus.`);
        }}
      />

      <KontrakPenelitianModal
        isOpen={isKontrakModalOpen}
        countryName={countryName}
        onClose={() => setIsKontrakModalOpen(false)}
        onConfirm={() => {
          setKontrakActive(true);
          if (setPlayerCountryDetail) {
            setPlayerCountryDetail((prev: any) => ({
              ...prev,
              researchContracts: Array.from(new Set([...(prev?.researchContracts || []), countryName]))
            }));
          }
          console.log(`Kontrak Penelitian dengan ${countryName} dimulai.`);
        }}
      />

      <DestroyKontrakModal
        isOpen={isDestroyKontrakOpen}
        countryName={countryName}
        onClose={() => setIsDestroyKontrakOpen(false)}
        onConfirm={() => {
          setKontrakActive(false);
          if (setPlayerCountryDetail) {
            setPlayerCountryDetail((prev: any) => ({
              ...prev,
              researchContracts: (prev?.researchContracts || []).filter((c: string) => String(c).toLowerCase().trim() !== normCountryName)
            }));
          }
          console.log(`Kontrak Penelitian dengan ${countryName} diputus.`);
        }}
      />

      <KirimPasukanModal
        isOpen={isKirimPasukanModalOpen}
        countryName={countryName}
        onClose={() => setIsKirimPasukanModalOpen(false)}
        onConfirm={() => {
          console.log(`Perintah kirim pasukan ke ${countryName} dikonfirmasi.`);
        }}
      />

      <PanggilSekutuModal
        isOpen={isPanggilSekutuModalOpen}
        countryName={countryName}
        onClose={() => setIsPanggilSekutuModalOpen(false)}
        onConfirm={() => {
          console.log(`Sekutu dipanggil terkait ${countryName}.`);
        }}
      />

      <BerikanSanksiModal
        isOpen={isBerikanSanksiModalOpen}
        countryName={countryName}
        onClose={() => setIsBerikanSanksiModalOpen(false)}
        onConfirm={() => {
          console.log(`Sanksi terhadap ${countryName} diterapkan.`);
        }}
      />

    </div>
  );
}