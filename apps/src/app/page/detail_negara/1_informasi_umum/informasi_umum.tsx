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
import DestroyPaktaModal from '../2_pakta_non_agresi/DestroyPaktaModal';
import DestroyAliansiModal from '../3_aliansi_pertahanan/DestroyAliansiModal';
import DestroyKontrakModal from '../5_kontrak_penelitian/DestroyKontrakModal';
import { getTradeButtonLabel, getTradeButtonClass } from './4_perjanjian_dagang/logic/perjanjianDagangLogic';
import DestroyTradeModal from './4_perjanjian_dagang/logic/DestroyTradeModal';
import BuildTradeModal from './4_perjanjian_dagang/BuildTradeModal';
import PaktaNonAgresiModal from './2_pakta_non_agresi/paktaNonAgresiModals';
import AliansiPertahananModal from './3_aliansi_pertahanan/aliansiPertahananModals';
import KontrakPenelitianModal from './5_kontrak_penelitian/kontrakPenelitianModals';
import KirimPasukanModal from './6_kirim_pasukan/kirimPasukanModals';
import PanggilSekutuModal from './7_panggil_sekutu/panggilSekutuModals';
import BerikanSanksiModal from './8_berikan_sanksi/berikanSanksiModals';

interface InformasiUmumProps {
  countryName: string;
  playerCountryDetail?: any; // data negara pemain (dipassing dari MapPage)
  setPlayerCountryDetail?: (detail: any | ((prev: any) => any)) => void;
  currentNetBalance?: number;
  adjustNetBalance?: (delta: number) => void;
}

// Komponen tombol aksi
const ActionButton = ({ icon: Icon, label, onClick, className, iconClass, labelClass, disabled }: { icon: any, label: string, onClick?: () => void, className?: string, iconClass?: string, labelClass?: string, disabled?: boolean }) => {
  const base = `${className ?? 'bg-[#0A1A1A] border border-[#00FFAA]/20'} rounded-xl p-5 flex flex-col items-center justify-center gap-3 transition-all group h-32`;
  const interactive = disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'hover:shadow-md hover:border-[#00FFAA]/50 hover:bg-[#00FFAA]/10 cursor-pointer';
  return (
    <button
      onClick={disabled ? undefined : onClick}
      aria-disabled={disabled}
      className={`${base} ${interactive}`}
    >
      <Icon className={`h-8 w-8 ${iconClass ?? 'text-[#00FFAA]'} ${disabled ? '' : 'group-hover:scale-110'} transition-transform`} />
      <span className={`text-xs font-black ${labelClass ?? 'text-[#00FFAA]'} uppercase tracking-wider text-center leading-tight`}>
        {label}
      </span>
    </button>
  );
};

export default function InformasiUmum({ countryName, playerCountryDetail, setPlayerCountryDetail, currentNetBalance: currentNetBalanceProp, adjustNetBalance }: InformasiUmumProps) {
  const playerCountryName = playerCountryDetail?.country || playerCountryDetail?.nama || playerCountryDetail?.country_name || null;
  const [isDestroyModalOpen, setIsDestroyModalOpen] = useState(false);
  const [isBuildEmbassyModalOpen, setIsBuildEmbassyModalOpen] = useState(false);
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
  const embassyIconClass = embassyLabel === 'Hancurkan Kedutaan' ? 'text-emerald-700' : undefined;
  const embassyLabelClass = embassyLabel === 'Hancurkan Kedutaan' ? 'text-emerald-700' : undefined;

  const hasTrade = getTradeButtonLabel(countryName, playerCountryName, removedTradePartners) === 'Putus Hubungan Dagang';
  const tradeIsActive = hasTrade || tradeActive;
  const tradeLabel = tradeIsActive ? 'Putus Hubungan Dagang' : 'Perjanjian Dagang';
  const tradeClass = getTradeButtonClass(countryName, playerCountryName, removedTradePartners);
  const tradeIconClass = tradeIsActive ? 'text-emerald-700' : undefined;
  const tradeLabelClass = tradeIsActive ? 'text-emerald-700' : undefined;

  // Local active states: sync initial values when country/player changes
  // Sync initial active states from logic at mount / when country changes
  // (we keep local state so user actions toggle UI immediately)
  useEffect(() => {
    const embassyLabelNow = getEmbassyButtonLabel(countryName, playerCountryName, playerEmbassies, removedEmbassies, removedTradePartners);
    const tradeLabelNow = getTradeButtonLabel(countryName, playerCountryName, removedTradePartners);
    setEmbassyActive(embassyLabelNow === 'Hancurkan Kedutaan');
    // Mark trade as active if registry indicates an existing trade agreement.
    setTradeActive(tradeLabelNow === 'Putus Hubungan Dagang');
    // Reset geopolitik actions per country view
    setPaktaActive(false);
    setAliansiActive(false);
    setKontrakActive(false);
    setIsDestroyPaktaOpen(false);
    setIsDestroyAliansiOpen(false);
    setIsDestroyKontrakOpen(false);
  }, [countryName, playerCountryName, playerEmbassies.length, removedEmbassies.length, removedTradePartners.length]);

  // PERBAIKAN: Ganti style hijau solid menjadi border hijau modern
  const modernGreenBorderClass = 'border-2 border-emerald-500 bg-transparent text-emerald-700 hover:bg-emerald-50 hover:border-emerald-600';

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

  return (
    <div className="space-y-6">
      {/* Grid Layout 4-4 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Tombol Kedutaan */}
        <ActionButton 
          icon={Building2} 
          label={embassyActive ? 'Hancurkan Kedutaan' : 'Bangun Kedutaan'} 
          onClick={handleEmbassyClick} 
          className={embassyActive ? modernGreenBorderClass : embassyClass} 
          iconClass={embassyActive ? 'text-emerald-700' : embassyIconClass}
          labelClass={embassyActive ? 'text-emerald-700' : embassyLabelClass}
        />
        
        <ActionButton icon={ShieldOff} label={paktaActive ? 'Putus Pakta Non Agresi' : 'Pakta Non Agresi'} onClick={() => paktaActive ? setIsDestroyPaktaOpen(true) : setIsPaktaModalOpen(true)} disabled={!embassyActive} className={paktaActive ? modernGreenBorderClass : undefined} iconClass={paktaActive ? 'text-emerald-700' : undefined} labelClass={paktaActive ? 'text-emerald-700' : undefined} />
        <ActionButton icon={ShieldCheck} label={aliansiActive ? 'Putus Aliansi Pertahanan' : 'Aliansi Pertahanan'} onClick={() => aliansiActive ? setIsDestroyAliansiOpen(true) : setIsAliansiModalOpen(true)} disabled={!embassyActive} className={aliansiActive ? modernGreenBorderClass : undefined} iconClass={aliansiActive ? 'text-emerald-700' : undefined} labelClass={aliansiActive ? 'text-emerald-700' : undefined} />
        
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
          iconClass={tradeIsActive ? 'text-emerald-700' : tradeIconClass}
          labelClass={tradeIsActive ? 'text-emerald-700' : tradeLabelClass}
        />
        
        <ActionButton icon={FlaskConical} label={kontrakActive ? 'Putus Kontrak Penelitian' : 'Kontrak Penelitian'} onClick={() => kontrakActive ? setIsDestroyKontrakOpen(true) : setIsKontrakModalOpen(true)} disabled={!embassyActive} className={kontrakActive ? modernGreenBorderClass : undefined} iconClass={kontrakActive ? 'text-emerald-700' : undefined} labelClass={kontrakActive ? 'text-emerald-700' : undefined} />
        <ActionButton icon={Sword} label="Kirim Pasukan" onClick={() => setIsKirimPasukanModalOpen(true)} disabled={!embassyActive} />
        <ActionButton icon={Phone} label="Panggil Sekutu" onClick={() => setIsPanggilSekutuModalOpen(true)} disabled={!embassyActive} />
        <ActionButton icon={Ban} label="Berikan Sanksi" onClick={() => setIsBerikanSanksiModalOpen(true)} />
      </div>

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
              const normTarget = String(countryName || '').toLowerCase().trim();

              return {
                ...prev,
                embassies: existingEmbassies.filter(
                  (embassy: any) => String(embassy.mitra || '').toLowerCase().trim() !== normTarget
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
          setEmbassyActive(true);
          if (setPlayerCountryDetail) {
            setPlayerCountryDetail((prev: any) => {
              const existingEmbassies = Array.isArray(prev?.embassies) ? prev.embassies : [];
              const existingRemovedEmbassies = Array.isArray(prev?.removedEmbassies) ? prev.removedEmbassies : [];
              const existingRemovedTrade = Array.isArray(prev?.removedTradePartners) ? prev.removedTradePartners : [];
              const normTarget = String(countryName || '').toLowerCase().trim();

              return {
                ...prev,
                embassies: [
                  ...existingEmbassies.filter(
                    (embassy: any) => String(embassy.mitra || '').toLowerCase().trim() !== normTarget
                  ),
                  {
                    id: Date.now(),
                    mitra: countryName,
                    type: 'Kedutaan Besar',
                    status: 'Aktif',
                    continent: continentLabel,
                    builtAt: new Date().toISOString(),
                  },
                ],
                removedEmbassies: existingRemovedEmbassies.filter(
                  (r: string) => String(r || '').toLowerCase().trim() !== normTarget
                ),
                removedTradePartners: existingRemovedTrade.filter(
                  (r: string) => String(r || '').toLowerCase().trim() !== normTarget
                ),
              };
            });
          }
          if (adjustNetBalance) {
            adjustNetBalance(-embassyCost);
          }
          console.log(`Kedutaan di ${countryName} dibangun.`);
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
          console.log(`Pakta Non-Agresi dengan ${countryName} dijalin.`);
        }}
      />

      <DestroyPaktaModal
        isOpen={isDestroyPaktaOpen}
        countryName={countryName}
        onClose={() => setIsDestroyPaktaOpen(false)}
        onConfirm={() => {
          setPaktaActive(false);
          console.log(`Pakta Non-Agresi dengan ${countryName} diputus.`);
        }}
      />

      <AliansiPertahananModal
        isOpen={isAliansiModalOpen}
        countryName={countryName}
        onClose={() => setIsAliansiModalOpen(false)}
        onConfirm={() => {
          setAliansiActive(true);
          console.log(`Aliansi Pertahanan dengan ${countryName} diajukan.`);
        }}
      />

      <DestroyAliansiModal
        isOpen={isDestroyAliansiOpen}
        countryName={countryName}
        onClose={() => setIsDestroyAliansiOpen(false)}
        onConfirm={() => {
          setAliansiActive(false);
          console.log(`Aliansi Pertahanan dengan ${countryName} diputus.`);
        }}
      />

      <KontrakPenelitianModal
        isOpen={isKontrakModalOpen}
        countryName={countryName}
        onClose={() => setIsKontrakModalOpen(false)}
        onConfirm={() => {
          setKontrakActive(true);
          console.log(`Kontrak Penelitian dengan ${countryName} dimulai.`);
        }}
      />

      <DestroyKontrakModal
        isOpen={isDestroyKontrakOpen}
        countryName={countryName}
        onClose={() => setIsDestroyKontrakOpen(false)}
        onConfirm={() => {
          setKontrakActive(false);
          console.log(`Kontrak Penelitian dengan ${countryName} dihentikan.`);
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