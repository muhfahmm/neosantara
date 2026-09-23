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
import { useState } from 'react';
import SerangNegaraModal from './1_serang_negara/serangNegaraModals';
import SpionaseModal from './2_spionase/spionaseModals';
import SabotaseModal from './3_sabotase/sabotaseModals';
import PerangNuklirModal from './4_perang_nuklir/perangNuklirModals';
import KudetaModal from './5_lakukan_kudeta/kudetaModals';
import MintaSerangNegaraModal from './6_minta_serang_negara/mintaSerangNegaraModals';
import HinaModal from './7_hina/hinaModals';

interface OperasiMiliterProps {
  countryName: string;
  playerCountryDetail?: any;
}

// Komponen tombol aksi (Persis sama dengan menu lainnya)
const ActionButton = ({ icon: Icon, label, onClick }: { icon: any, label: string, onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="bg-[#0A1A1A] border border-[#00FFAA]/20 rounded-xl p-5 flex flex-col items-center justify-center gap-3 hover:shadow-md hover:border-[#00FFAA]/50 hover:bg-[#00FFAA]/10 transition-all cursor-pointer group h-32"
  >
    <Icon className="h-8 w-8 text-[#00FFAA] group-hover:scale-110 transition-transform" />
    <span className="text-xs font-black text-[#00FFAA] uppercase tracking-wider text-center leading-tight">
      {label}
    </span>
  </button>
);

export default function OperasiMiliter({ countryName }: OperasiMiliterProps) {
  const [isSerangOpen, setIsSerangOpen] = useState(false);
  const [isSpionaseOpen, setIsSpionaseOpen] = useState(false);
  const [isSabotaseOpen, setIsSabotaseOpen] = useState(false);
  const [isNuklirOpen, setIsNuklirOpen] = useState(false);
  const [isKudetaOpen, setIsKudetaOpen] = useState(false);
  const [isMintaSerangOpen, setIsMintaSerangOpen] = useState(false);
  const [isHinaOpen, setIsHinaOpen] = useState(false);

  const handleAction = (action: string) => {
    console.log(`Aksi militer: ${action} untuk ${countryName}`);
  };

  return (
    <div className="space-y-6">
      {/* Grid Layout 4-4 (2 baris x 4 kolom pada desktop) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ActionButton icon={Crosshair} label="Serang Negara" onClick={() => setIsSerangOpen(true)} />
        <ActionButton icon={Eye} label="Spionase" onClick={() => setIsSpionaseOpen(true)} />
        <ActionButton icon={Bomb} label="Sabotase" onClick={() => setIsSabotaseOpen(true)} />
        <ActionButton icon={Radiation} label="Perang Nuklir" onClick={() => setIsNuklirOpen(true)} />
        
        <ActionButton icon={UserX} label="Lakukan Kudeta" onClick={() => setIsKudetaOpen(true)} />
        <ActionButton icon={Phone} label="Minta Menyerang Negara" onClick={() => setIsMintaSerangOpen(true)} />
        <ActionButton icon={MessageSquare} label="Hina" onClick={() => setIsHinaOpen(true)} />
      </div>

      <SerangNegaraModal isOpen={isSerangOpen} countryName={countryName} onClose={() => setIsSerangOpen(false)} onConfirm={() => { console.log(`Serang -> ${countryName}`); }} />
      <SpionaseModal isOpen={isSpionaseOpen} countryName={countryName} onClose={() => setIsSpionaseOpen(false)} onConfirm={() => { console.log(`Spionase -> ${countryName}`); }} />
      <SabotaseModal isOpen={isSabotaseOpen} countryName={countryName} onClose={() => setIsSabotaseOpen(false)} onConfirm={() => { console.log(`Sabotase -> ${countryName}`); }} />
      <PerangNuklirModal isOpen={isNuklirOpen} countryName={countryName} onClose={() => setIsNuklirOpen(false)} onConfirm={() => { console.log(`Nuklir -> ${countryName}`); }} />
      <KudetaModal isOpen={isKudetaOpen} countryName={countryName} onClose={() => setIsKudetaOpen(false)} onConfirm={() => { console.log(`Kudeta -> ${countryName}`); }} />
      <MintaSerangNegaraModal isOpen={isMintaSerangOpen} countryName={countryName} onClose={() => setIsMintaSerangOpen(false)} onConfirm={() => { console.log(`Minta Serang -> ${countryName}`); }} />
      <HinaModal isOpen={isHinaOpen} countryName={countryName} onClose={() => setIsHinaOpen(false)} onConfirm={() => { console.log(`Hina -> ${countryName}`); }} />
    </div>
  );
}