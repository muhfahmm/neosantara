'use client';
import { 
  Sword, 
  Gift, 
  Heart, 
  Phone, 
  Map 
} from 'lucide-react';
import { useState } from 'react';
import BeriTentaraModal from './1_beri_tentara/beriTentaraModals';
import BeriHadiahModal from './2_beri_hadiah/beriHadiahModals';
import TingkatkanHubunganModal from './3_tingkatkan_hubungan/tingkatkanHubunganModals';
import MintaBantuanModal from './5_minta_bantuan/mintaBantuanModals';
import BerikanWilayahModal from './6_berikan_wilayah/berikanWilayahModals';
import { COUNTRIES_DATA } from '../../map_system/map-data';

interface GeopolitikProps {
  countryName: string;
  playerCountryDetail?: any;
  setPlayerCountryDetail?: (detail: any | ((prev: any) => any)) => void;
  targetCountryDetail?: any;
  setTargetCountryDetail?: (detail: any | ((prev: any) => any)) => void;
  onActionModalStateChange?: (isOpen: boolean) => void;
}

// Komponen tombol aksi agar kode lebih rapi (Persis sama dengan InformasiUmum)
const ActionButton = ({ icon: Icon, label, onClick, disabled }: { icon: any, label: string, onClick?: () => void, disabled?: boolean }) => {
  const base = 'bg-[#0A1A1A] border border-[#00FFAA]/20 rounded-xl p-5 lg:p-3 xl:p-5 flex flex-col items-center justify-center gap-3 lg:gap-2 xl:gap-3 transition-all group h-32 lg:h-24 xl:h-32';
  const interactive = disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'hover:shadow-md hover:border-[#00FFAA]/50 hover:bg-[#00FFAA]/10 cursor-pointer';
  return (
    <button
      onClick={disabled ? undefined : onClick}
      aria-disabled={disabled}
      className={`${base} ${interactive}`}
    >
      <Icon className={`h-8 w-8 lg:h-6 lg:w-6 xl:h-8 xl:w-8 text-[#00FFAA] ${disabled ? '' : 'group-hover:scale-110'} transition-transform`} />
      <span className="text-xs lg:text-[10px] xl:text-xs font-black text-[#00FFAA] uppercase tracking-wider text-center leading-tight">
        {label}
      </span>
    </button>
  );
};

export default function Geopolitik({ countryName, playerCountryDetail, setPlayerCountryDetail, targetCountryDetail, setTargetCountryDetail, onActionModalStateChange }: GeopolitikProps) {
  const [isBeriTentaraOpen, setIsBeriTentaraOpen] = useState(false);
  const [isBeriHadiahOpen, setIsBeriHadiahOpen] = useState(false);
  const [isTingkatkanOpen, setIsTingkatkanOpen] = useState(false);
  const [isMintaBantuanOpen, setIsMintaBantuanOpen] = useState(false);
  const [isBerikanWilayahOpen, setIsBerikanWilayahOpen] = useState(false);

  const handleAction = (action: string) => {
    console.log(`Aksi geopolitik: ${action} untuk ${countryName}`);
  };

  const closeAidRequestModal = () => {
    setIsMintaBantuanOpen(false);
    onActionModalStateChange?.(false);
  };

  const playerCountryName = playerCountryDetail?.country || playerCountryDetail?.nama || playerCountryDetail?.country_name || null;
  const normalizeCountryName = (name: unknown) => String(name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
  const hasDefenseAlliance = (Array.isArray(playerCountryDetail?.defenseAlliances)
    ? playerCountryDetail.defenseAlliances
    : []).some((partner: unknown) => normalizeCountryName(partner) === normalizeCountryName(countryName));
  const annexedCountries = typeof window === 'undefined'
    ? {}
    : (window as Window & { neosantara_annexed_countries?: Record<string, { attackerCountry?: string }> })
      .neosantara_annexed_countries || {};
  const hasAnnexedTerritory = Object.values(annexedCountries).some(
    annexation => normalizeCountryName(annexation?.attackerCountry) === normalizeCountryName(playerCountryName)
  );

  const transferAnnexedTerritory = (territoryName: string) => {
    if (!playerCountryName || !hasDefenseAlliance) {
      console.error(`Gagal memberikan wilayah ${territoryName}: negara tujuan bukan sekutu pertahanan.`);
      return false;
    }

    const recipient = COUNTRIES_DATA.find(
      country => normalizeCountryName(country.country) === normalizeCountryName(countryName) ||
        normalizeCountryName(country.iso) === normalizeCountryName(countryName)
    );
    const territory = COUNTRIES_DATA.find(
      country => normalizeCountryName(country.country) === normalizeCountryName(territoryName) ||
        normalizeCountryName(country.iso) === normalizeCountryName(territoryName)
    );
    const recipientColor = recipient?.color;
    if (!recipient?.iso || !recipientColor || !territory?.iso) {
      console.error(`Gagal memberikan wilayah ${territoryName}: data ISO atau warna negara tidak ditemukan.`);
      return false;
    }

    const gameWindow = window as Window & {
      neosantara_annexed_countries?: Record<string, {
        attackerCountry?: string;
        attackerIso?: string;
        returnedToCountry?: string;
        returnedToIso?: string;
        returnedToColor?: string;
      }>;
      neosantara_country_color_overrides?: Record<string, string>;
    };
    const currentAnnexed = gameWindow.neosantara_annexed_countries || {};
    const territoryAliases = new Set([
      normalizeCountryName(territory.country),
      normalizeCountryName(territory.iso),
      normalizeCountryName(`iso_${territory.iso}`),
    ]);
    const playerKey = normalizeCountryName(playerCountryName);
    const currentlyOwned = Object.entries(currentAnnexed).some(
      ([key, annexation]) =>
        territoryAliases.has(normalizeCountryName(key)) &&
        normalizeCountryName(annexation?.attackerCountry) === playerKey
    );
    if (!currentlyOwned) {
      console.error(`Gagal memberikan wilayah ${territoryName}: wilayah tidak lagi dikuasai ${playerCountryName}.`);
      return false;
    }

    const nextAnnexed = { ...currentAnnexed };
    Object.entries(nextAnnexed).forEach(([key, annexation]) => {
      if (
        territoryAliases.has(normalizeCountryName(key)) &&
        normalizeCountryName(annexation?.attackerCountry) === playerKey
      ) {
        nextAnnexed[key] = {
          attackerCountry: recipient.country,
          attackerIso: recipient.iso.toLowerCase(),
          returnedToCountry: playerCountryName,
          returnedToIso: String(playerCountryDetail?.iso || '').toLowerCase() || undefined,
          returnedToColor: '#10b981',
        };
      }
    });
    const nextOverrides = { ...(gameWindow.neosantara_country_color_overrides || {}) };
    Object.keys(nextOverrides).forEach(key => {
      if (territoryAliases.has(normalizeCountryName(key))) {
        nextOverrides[key] = recipientColor;
      }
    });
    [
      territory.country,
      territory.country.toLowerCase(),
      territory.iso.toLowerCase(),
      `iso_${territory.iso.toLowerCase()}`,
    ].forEach(key => {
      nextOverrides[key] = recipientColor;
    });

    gameWindow.neosantara_annexed_countries = nextAnnexed;
    gameWindow.neosantara_country_color_overrides = nextOverrides;
    window.dispatchEvent(new CustomEvent('map_territory_color_updated', {
      detail: {
        targetCountry: territory.country,
        newColor: recipientColor,
        attackerCountry: recipient.country,
        transferredFrom: playerCountryName,
      },
    }));
    return true;
  };

  const requestAid = async () => {
    if (!playerCountryName) return;
    try {
      const response = await fetch(`/api/sda-data?country=${encodeURIComponent(countryName)}`);
      const sda = response.ok ? await response.json() as Record<string, boolean> : null;
      const resourceKeys = Object.keys(sda || {}).filter(resource => typeof sda?.[resource] === 'boolean');
      const availableResources = resourceKeys.filter(resource => sda?.[resource] === true);
      if (availableResources.length === 0) {
        console.warn(`Bantuan dari ${countryName} tidak dapat dikirim karena SDA tidak tersedia.`);
        return;
      }

      const resourceKey = availableResources[Math.floor(Math.random() * availableResources.length)];
      const maximumAmount = Math.max(5000, Math.round((availableResources.length / resourceKeys.length) * 10) * 5000);
      const amount = (Math.floor(Math.random() * (maximumAmount / 5000)) + 1) * 5000;
      window.dispatchEvent(new CustomEvent('neosantara_diplomacy_path', {
        detail: {
          pathId: `aid-delivery-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          kind: 'aid-delivery',
          senderCountry: countryName,
          targetCountry: playerCountryName,
          resourceKey,
          amount,
        },
      }));
    } catch (error) {
      console.error('Gagal menyiapkan bantuan sekutu.', error);
    }
  };

  return (
    <div className="space-y-6 lg:space-y-4 xl:space-y-6">
      {/* Grid Layout 5 Tombol Aksi */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-3 xl:gap-4">
        <ActionButton icon={Sword} label="Beri Tentara" onClick={() => setIsBeriTentaraOpen(true)} disabled={!hasDefenseAlliance} />
        <ActionButton icon={Gift} label="Beri Hadiah" onClick={() => setIsBeriHadiahOpen(true)} />
        <ActionButton icon={Heart} label="Tingkatkan Hubungan" onClick={() => setIsTingkatkanOpen(true)} />
        <ActionButton icon={Phone} label="Minta Bantuan" onClick={() => {
          setIsMintaBantuanOpen(true);
          onActionModalStateChange?.(true);
        }} />
        <ActionButton icon={Map} label="Berikan Wilayah" onClick={() => setIsBerikanWilayahOpen(true)} disabled={!hasAnnexedTerritory || !hasDefenseAlliance} />
      </div>

      <BeriTentaraModal
        isOpen={isBeriTentaraOpen}
        countryName={countryName}
        playerCountryDetail={playerCountryDetail}
        setPlayerCountryDetail={setPlayerCountryDetail}
        targetCountryDetail={targetCountryDetail}
        setTargetCountryDetail={setTargetCountryDetail}
        onClose={() => setIsBeriTentaraOpen(false)}
        onConfirm={() => { console.log(`Beri Tentara -> ${countryName}`); }}
      />
      <BeriHadiahModal
        isOpen={isBeriHadiahOpen}
        countryName={countryName}
        playerCountryDetail={playerCountryDetail}
        setPlayerCountryDetail={setPlayerCountryDetail}
        onClose={() => setIsBeriHadiahOpen(false)}
        onConfirm={() => { console.log(`Beri Hadiah -> ${countryName}`); }}
      />
      <TingkatkanHubunganModal
        isOpen={isTingkatkanOpen}
        countryName={countryName}
        playerCountryDetail={playerCountryDetail}
        setPlayerCountryDetail={setPlayerCountryDetail}
        onClose={() => setIsTingkatkanOpen(false)}
        onConfirm={(amount, gained) => {
          console.log(`Tingkatkan Hubungan -> ${countryName} sebesar ${amount} NEO (+${gained} tingkat)`);
        }}
      />
      <MintaBantuanModal isOpen={isMintaBantuanOpen} countryName={countryName} onClose={closeAidRequestModal} onConfirm={requestAid} />
      <BerikanWilayahModal isOpen={isBerikanWilayahOpen} countryName={countryName} playerCountryName={playerCountryName} onClose={() => setIsBerikanWilayahOpen(false)} onConfirm={transferAnnexedTerritory} />
    </div>
  );
}
