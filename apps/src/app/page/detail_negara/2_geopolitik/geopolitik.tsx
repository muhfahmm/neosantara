'use client';
import { 
  Sword, 
  Gift, 
  Heart, 
  Flag, 
  Phone, 
  Map 
} from 'lucide-react';
import { useState } from 'react';
import { playerHasEmbassyOrTradePartners } from '../1_informasi_umum/1_kedutaan_besar/logic/kedutaanBesarLogic';
import BeriTentaraModal from './1_beri_tentara/beriTentaraModals';
import BeriHadiahModal from './2_beri_hadiah/beriHadiahModals';
import TingkatkanHubunganModal from './3_tingkatkan_hubungan/tingkatkanHubunganModals';
import DukungKemerdekaanModal from './4_dukung_kemerdekaan/dukungKemerdekaanModals';
import MintaBantuanModal from './5_minta_bantuan/mintaBantuanModals';
import BerikanWilayahModal from './6_berikan_wilayah/berikanWilayahModals';

interface GeopolitikProps {
  countryName: string;
  playerCountryDetail?: any;
}

// Komponen tombol aksi agar kode lebih rapi (Persis sama dengan InformasiUmum)
const ActionButton = ({ icon: Icon, label, onClick, disabled }: { icon: any, label: string, onClick?: () => void, disabled?: boolean }) => {
  const base = 'bg-[#0A1A1A] border border-[#00FFAA]/20 rounded-xl p-5 flex flex-col items-center justify-center gap-3 transition-all group h-32';
  const interactive = disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'hover:shadow-md hover:border-[#00FFAA]/50 hover:bg-[#00FFAA]/10 cursor-pointer';
  return (
    <button
      onClick={disabled ? undefined : onClick}
      aria-disabled={disabled}
      className={`${base} ${interactive}`}
    >
      <Icon className={`h-8 w-8 text-[#00FFAA] ${disabled ? '' : 'group-hover:scale-110'} transition-transform`} />
      <span className="text-xs font-black text-[#00FFAA] uppercase tracking-wider text-center leading-tight">
        {label}
      </span>
    </button>
  );
};

export default function Geopolitik({ countryName, playerCountryDetail }: GeopolitikProps) {
  const [isBeriTentaraOpen, setIsBeriTentaraOpen] = useState(false);
  const [isBeriHadiahOpen, setIsBeriHadiahOpen] = useState(false);
  const [isTingkatkanOpen, setIsTingkatkanOpen] = useState(false);
  const [isDukungKemerdekaanOpen, setIsDukungKemerdekaanOpen] = useState(false);
  const [isMintaBantuanOpen, setIsMintaBantuanOpen] = useState(false);
  const [isBerikanWilayahOpen, setIsBerikanWilayahOpen] = useState(false);

  const handleAction = (action: string) => {
    console.log(`Aksi geopolitik: ${action} untuk ${countryName}`);
  };

  const playerCountryName = playerCountryDetail?.country || playerCountryDetail?.nama || playerCountryDetail?.country_name || null;
  const playerEmbassies = Array.isArray(playerCountryDetail?.embassies) ? playerCountryDetail.embassies : [];
  const removedEmbassies = Array.isArray(playerCountryDetail?.removedEmbassies) ? playerCountryDetail.removedEmbassies : [];
  const removedTradePartners = Array.isArray(playerCountryDetail?.removedTradePartners) ? playerCountryDetail.removedTradePartners : [];
  const embassyExists = playerHasEmbassyOrTradePartners(countryName, playerCountryName, playerEmbassies, removedEmbassies, removedTradePartners);

  return (
    <div className="space-y-6">
      {/* Grid Layout 4-4 (2 baris x 4 kolom pada desktop) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ActionButton icon={Sword} label="Beri Tentara" onClick={() => setIsBeriTentaraOpen(true)} disabled={!embassyExists} />
        <ActionButton icon={Gift} label="Beri Hadiah" onClick={() => setIsBeriHadiahOpen(true)} />
        <ActionButton icon={Heart} label="Tingkatkan Hubungan" onClick={() => setIsTingkatkanOpen(true)} />
        <ActionButton icon={Flag} label="Dukung Kemerdekaan" onClick={() => setIsDukungKemerdekaanOpen(true)} />
        
        <ActionButton icon={Phone} label="Minta Bantuan" onClick={() => setIsMintaBantuanOpen(true)} />
        <ActionButton icon={Map} label="Berikan Wilayah" onClick={() => setIsBerikanWilayahOpen(true)} />
      </div>

      <BeriTentaraModal isOpen={isBeriTentaraOpen} countryName={countryName} onClose={() => setIsBeriTentaraOpen(false)} onConfirm={() => { console.log(`Beri Tentara -> ${countryName}`); }} />
      <BeriHadiahModal isOpen={isBeriHadiahOpen} countryName={countryName} onClose={() => setIsBeriHadiahOpen(false)} onConfirm={() => { console.log(`Beri Hadiah -> ${countryName}`); }} />
      <TingkatkanHubunganModal isOpen={isTingkatkanOpen} countryName={countryName} onClose={() => setIsTingkatkanOpen(false)} onConfirm={() => { console.log(`Tingkatkan Hubungan -> ${countryName}`); }} />
      <DukungKemerdekaanModal isOpen={isDukungKemerdekaanOpen} countryName={countryName} onClose={() => setIsDukungKemerdekaanOpen(false)} onConfirm={() => { console.log(`Dukung Kemerdekaan -> ${countryName}`); }} />
      <MintaBantuanModal isOpen={isMintaBantuanOpen} countryName={countryName} onClose={() => setIsMintaBantuanOpen(false)} onConfirm={() => { console.log(`Minta Bantuan -> ${countryName}`); }} />
      <BerikanWilayahModal isOpen={isBerikanWilayahOpen} countryName={countryName} onClose={() => setIsBerikanWilayahOpen(false)} onConfirm={() => { console.log(`Berikan Wilayah -> ${countryName}`); }} />
    </div>
  );
}