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
import { getCountryColor } from '../../menus/news/logic/1_berita_invasi/beritaInvasiLogic';
import { useLanguage } from '@/app/page/paused_menu/terjemahan_paused_menu/languageLogic';

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
  const base = 'bg-root-canvas border border-root-accent/20 rounded-xl p-5 lg:p-3 xl:p-5 flex flex-col items-center justify-center gap-3 lg:gap-2 xl:gap-3 transition-all group h-32 lg:h-24 xl:h-32';
  const interactive = disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'hover:shadow-md hover:border-root-accent/50 hover:bg-root-accent/10 cursor-pointer';
  return (
    <button
      onClick={disabled ? undefined : onClick}
      aria-disabled={disabled}
      className={`country-detail-action-card ${base} ${interactive}`}
    >
      <Icon className={`h-8 w-8 lg:h-6 lg:w-6 xl:h-8 xl:w-8 text-root-accent ${disabled ? '' : 'group-hover:scale-110'} transition-transform`} />
      <span className="text-xs lg:text-[10px] xl:text-xs font-black text-root-accent uppercase tracking-wider text-center leading-tight">
        {label}
      </span>
    </button>
  );
};

export default function Geopolitik({ countryName, playerCountryDetail, setPlayerCountryDetail, targetCountryDetail, setTargetCountryDetail, onActionModalStateChange }: GeopolitikProps) {
  const { t } = useLanguage();
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

  const openBerikanWilayahModal = () => {
    setIsBerikanWilayahOpen(true);
    onActionModalStateChange?.(true);
  };

  const closeBerikanWilayahModal = () => {
    setIsBerikanWilayahOpen(false);
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
  const cityOwners = typeof window === 'undefined'
    ? {}
    : (window as Window & { neosantara_city_owner?: Record<string, { ownerCountry?: string; countryIso?: string }> })
      .neosantara_city_owner || {};

  const playerKey = normalizeCountryName(playerCountryName);
  const hasAnnexedCountry = Object.values(annexedCountries).some(
    annexation => normalizeCountryName(annexation?.attackerCountry) === playerKey
  );
  const hasAnnexedCity = Object.values(cityOwners).some(city => {
    if (!city?.ownerCountry || normalizeCountryName(city.ownerCountry) !== playerKey) return false;
    const originalIso = String(city.countryIso || '').toLowerCase();
    const ownerCountryObj = COUNTRIES_DATA.find(
      c => normalizeCountryName(c.country) === playerKey
    );
    return ownerCountryObj?.iso?.toLowerCase() !== originalIso;
  });
  const hasAnnexedTerritory = hasAnnexedCountry || hasAnnexedCity;

  const transferAnnexedTerritory = (territoryName: string) => {
    if (!playerCountryName) {
      console.error(`Gagal memberikan wilayah ${territoryName}: data negara pemain tidak ditemukan.`);
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
    const recipientColor = (recipient?.country ? getCountryColor(recipient.country) : '') || recipient?.color || '#2e7d32';
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
    const territoryIsoLower = territory.iso.toLowerCase();
    const playerKey = normalizeCountryName(playerCountryName);
    const currentCityOwners = (gameWindow as Window & { neosantara_city_owner?: Record<string, any> }).neosantara_city_owner || {};

    const currentlyOwnedInAnnexed = Object.entries(currentAnnexed).some(
      ([key, annexation]) =>
        territoryAliases.has(normalizeCountryName(key)) &&
        normalizeCountryName(annexation?.attackerCountry) === playerKey
    );
    const currentlyOwnedInCities = Object.values(currentCityOwners).some(
      city => String(city?.countryIso || '').toLowerCase() === territoryIsoLower &&
        normalizeCountryName(city?.ownerCountry) === playerKey
    );

    if (!currentlyOwnedInAnnexed && !currentlyOwnedInCities) {
      console.error(`Gagal memberikan wilayah ${territoryName}: wilayah tidak lagi dikuasai ${playerCountryName}.`);
      return false;
    }

    const nextAnnexed = { ...currentAnnexed };
    // Jika belum tercatat di neosantara_annexed_countries (misal dianeksasi via kota), tambahkan record-nya
    nextAnnexed[territory.country] = {
      attackerCountry: recipient.country,
      attackerIso: recipient.iso.toLowerCase(),
      returnedToCountry: playerCountryName,
      returnedToIso: String(playerCountryDetail?.iso || '').toLowerCase() || undefined,
      returnedToColor: '#10b981',
    };
    nextAnnexed[territory.country.toLowerCase()] = nextAnnexed[territory.country];
    nextAnnexed[territoryIsoLower] = nextAnnexed[territory.country];
    nextAnnexed[`iso_${territoryIsoLower}`] = nextAnnexed[territory.country];

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

    // Perbarui juga neosantara_city_owner untuk kota-kota dari negara tersebut
    const nextCityOwners = { ...currentCityOwners };
    Object.entries(nextCityOwners).forEach(([cityId, city]) => {
      if (String(city?.countryIso || '').toLowerCase() === territoryIsoLower) {
        nextCityOwners[cityId] = {
          ...city,
          ownerCountry: recipient.country,
          ownerIso: recipient.iso.toLowerCase(),
          ownerColor: recipientColor,
        };
      }
    });
    (gameWindow as Window & { neosantara_city_owner?: Record<string, any> }).neosantara_city_owner = nextCityOwners;

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
    window.dispatchEvent(new Event('map_feature_colors_now'));
    window.dispatchEvent(new Event('map_feature_colors_dirty'));
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
      <div className="country-detail-action-grid grid grid-cols-2 md:grid-cols-4 items-stretch gap-4 lg:gap-3 xl:gap-4 pt-6 lg:pt-4 xl:pt-6">
        <ActionButton icon={Sword} label={t('detail_negara_ai.actions.giveTroops')} onClick={() => setIsBeriTentaraOpen(true)} disabled={!hasDefenseAlliance} />
        <ActionButton icon={Gift} label={t('detail_negara_ai.actions.giveGift')} onClick={() => setIsBeriHadiahOpen(true)} />
        <ActionButton icon={Heart} label={t('detail_negara_ai.actions.improveRelation')} onClick={() => setIsTingkatkanOpen(true)} />
        <ActionButton icon={Phone} label={t('detail_negara_ai.actions.requestHelp')} onClick={() => {
          setIsMintaBantuanOpen(true);
          onActionModalStateChange?.(true);
        }} />
        <ActionButton icon={Map} label={t('detail_negara_ai.actions.transferTerritory')} onClick={openBerikanWilayahModal} disabled={!hasAnnexedTerritory} />
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
      <BerikanWilayahModal isOpen={isBerikanWilayahOpen} countryName={countryName} playerCountryName={playerCountryName} onClose={closeBerikanWilayahModal} onConfirm={transferAnnexedTerritory} />
    </div>
  );
}