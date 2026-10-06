import { Flag } from 'lucide-react';
import { getIsoForCountryName } from '@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/pbbCountryIso';
import { calculateNetBalanceWithEconomicEmbargo } from '@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/1_resolusi_PBB/logic/3_economicEmbargoLogic';
import countryPaths from '../../../../map_system/country-paths.json';
import type { ProvinceAction, ProvinceActionEventDetail } from '../provinceActionTypes';

export const ANNEXED_AGGREGATE_KEYS = [
  'barak', 'gudang_senjata', 'hangar_tank', 'pangkalan_udara', 'pangkalan_laut',
  'pasukan_infanteri', 'tank_tempur_utama', 'apc_ifv', 'artileri_berat', 'sistem_peluncur_roket', 'pertahanan_udara_mobile', 'kendaraan_taktis',
  'kapal_induk', 'kapal_induk_nuklir', 'kapal_destroyer', 'kapal_korvet', 'kapal_selam_nuklir', 'kapal_selam_regular', 'kapal_ranjau', 'kapal_logistik',
  'jet_tempur_siluman', 'jet_tempur_interceptor', 'pesawat_pengebom', 'helikopter_serang', 'pesawat_pengintai', 'drone_intai_uav', 'drone_kamikaze', 'pesawat_angkut',
  'pembangkit_listrik_tenaga_gas', 'pembangkit_listrik_tenaga_nuklir', 'pembangkit_listrik_tenaga_uap', 'pembangkit_listrik_tenaga_surya', 'pembangkit_listrik_tenaga_angin', 'pembangkit_listrik_tenaga_air', 'pembangkit_listrik_tenaga_geotermal',
  'emas', 'uranium', 'batu_bara', 'minyak_bumi', 'gas_alam', 'garam', 'litium', 'logam_tanah_jarang', 'bijih_besi',
  'pabrik_mesin_mobil', 'semen_beton', 'pabrik_mesin_motor', 'pabrik_semikonduktor', 'kayu',
  'ayam_unggas', 'sapi_perah', 'sapi_potong', 'domba_kambing',
  'padi', 'gandum', 'jagung', 'sayur', 'umbi', 'kedelai', 'kelapa_sawit', 'kopi', 'teh', 'kakao', 'tebu', 'karet',
  'udang', 'mutiara', 'ikan', 'air_mineral', 'gula', 'roti', 'pengolahan_daging', 'mie_instan', 'minyak_goreng', 'susu', 'beras',
  'jalur_sepeda', 'jalan_raya', 'terminal_bus', 'stasiun_kereta_api', 'kereta_bawah_tanah', 'pelabuhan', 'bandara', 'helipad',
  'prasekolah', 'dasar', 'menengah', 'lanjutan', 'universitas', 'lembaga_pendidikan', 'laboratorium', 'observatorium', 'pusat_penelitian', 'pusat_pengembangan', 'literasi',
  'rumah_sakit_besar', 'rumah_sakit_kecil', 'pusat_diagnostik', 'pusat_bantuan_hukum', 'pengadilan', 'kejaksaan', 'pos_polisi', 'armada_mobil_polisi', 'akademi_polisi',
  'kolam_renang', 'sirkuit_balap', 'stadion', 'stadion_internasional', 'gym', 'golf', 'esports', 'gokart',
  'mall', 'hotel', 'pusat_grosir_tekstil', 'bioskop', 'teater', 'rumah_subsidi', 'apartemen', 'mansion'
];

export interface AnnexedContribution {
  targetData: Record<string, any>;
  netBalance: number;
}

interface ReleaseAnnexedProvinceContext {
  detail: ProvinceActionEventDetail;
  contributionCache: Record<string, AnnexedContribution>;
  updateCountryDetail: (updater: (previous: Record<string, unknown> | null) => Record<string, unknown> | null) => void;
  adjustPlayerNetBalance: (delta: number) => void;
  updateCountryColorOverrides: (updater: (previous: Record<string, string>) => Record<string, string>) => void;
}

const normalizeName = (value: string) => value.toLowerCase().trim();

export async function releaseAnnexedProvince({
  detail,
  contributionCache,
  updateCountryDetail,
  adjustPlayerNetBalance,
  updateCountryColorOverrides
}: ReleaseAnnexedProvinceContext): Promise<string> {
  const targetCountry = detail.targetCountry;
  const currentPlayerCountry = detail.occupyingCountry;
  const targetNorm = normalizeName(targetCountry);
  const countryIso = getIsoForCountryName(targetCountry).toLowerCase();
  const aliases = new Set([targetNorm, countryIso, `iso_${countryIso}`].filter(Boolean));
  const gameWindow = window as Window & {
    neosantara_annexed_countries?: Record<string, { attackerCountry?: string; attackerIso?: string }>;
    neosantara_country_color_overrides?: Record<string, string>;
  };
  const annexedCountries = gameWindow.neosantara_annexed_countries || {};
  const annexedInfo = Object.entries(annexedCountries).find(([key]) => aliases.has(normalizeName(key)))?.[1];

  if (!annexedInfo?.attackerCountry || normalizeName(annexedInfo.attackerCountry) !== normalizeName(currentPlayerCountry)) {
    throw new Error(`${targetCountry} tidak tercatat sebagai wilayah aneksasi ${currentPlayerCountry}.`);
  }

  let contribution = contributionCache[targetNorm];
  if (!contribution) {
    const targetRelPath = Object.entries(countryPaths as Record<string, string>)
      .find(([name]) => normalizeName(name) === targetNorm)?.[1];
    if (!targetRelPath) {
      throw new Error(`Data negara ${targetCountry} tidak ditemukan.`);
    }

    const response = await fetch(`/api/country-data?path=${encodeURIComponent(targetRelPath)}`);
    if (!response.ok) {
      throw new Error(`Gagal memuat data ${targetCountry} (${response.status}).`);
    }
    const targetData = await response.json();
    if (targetData?.error) {
      throw new Error(String(targetData.error));
    }
    contribution = {
      targetData,
      netBalance: calculateNetBalanceWithEconomicEmbargo(targetData, targetCountry)
    };
  }

  const targetData = contribution.targetData;
  const nextAnnexedCountries = Object.fromEntries(
    Object.entries(annexedCountries).filter(([key]) => !aliases.has(normalizeName(key)))
  );
  const currentOverrides = gameWindow.neosantara_country_color_overrides || {};
  const nextOverrides = Object.fromEntries(
    Object.entries(currentOverrides).filter(([key]) => !aliases.has(normalizeName(key)))
  ) as Record<string, string>;

  try {
    localStorage.setItem('neosantara_annexed_countries', JSON.stringify(nextAnnexedCountries));
    localStorage.setItem('neosantara_country_color_overrides', JSON.stringify(nextOverrides));
  } catch (error) {
    throw new Error(`Gagal menyimpan status kemerdekaan wilayah: ${error instanceof Error ? error.message : 'penyimpanan browser gagal.'}`);
  }

  updateCountryDetail(previous => {
    if (!previous) return previous;

    const totalPopulation = Number(previous.jumlah_penduduk || previous.populasi || 0);
    const targetPopulation = Number(targetData.jumlah_penduduk || targetData.populasi || 0);
    const remainingPopulation = Math.max(0, totalPopulation - targetPopulation);
    const restoredFields: Record<string, number> = {};
    const getNumericValue = (data: Record<string, unknown>, key: string) => {
      const directValue = data[key];
      if (directValue !== undefined) return Number(directValue);
      for (const nestedKey of ['armada', 'pertahanan']) {
        const nestedData = data[nestedKey];
        if (typeof nestedData === 'object' && nestedData !== null && key in nestedData) {
          return Number((nestedData as Record<string, unknown>)[key]);
        }
      }
      return 0;
    };

    ANNEXED_AGGREGATE_KEYS.forEach(key => {
      const currentValue = getNumericValue(previous, key);
      const annexedValue = Number(targetData[key] ?? targetData?.armada?.[key] ?? targetData?.pertahanan?.[key] ?? 0);
      if (currentValue > 0 || annexedValue > 0) {
        restoredFields[key] = Math.max(0, currentValue - annexedValue);
      }
    });

    const weightedFields: Record<string, number> = {};
    ['harapan_hidup', 'indeks_kesehatan', 'indeks_korupsi', 'indeks_keamanan'].forEach(key => {
      const currentValue = Number(previous[key]);
      const annexedValue = Number(targetData[key]);
      if (Number.isFinite(currentValue) && Number.isFinite(annexedValue) && remainingPopulation > 0) {
        weightedFields[key] = Math.round(
          (currentValue * totalPopulation - annexedValue * targetPopulation) / remainingPopulation
        );
      }
    });

    const reverseWeightedValue = (currentValue: number, annexedValue: number) => remainingPopulation > 0
      ? Math.round((currentValue * totalPopulation - annexedValue * targetPopulation) / remainingPopulation)
      : currentValue;
    const currentSatisfaction = Number(previous.kepuasan ?? previous.kepuasan_masyarakat ?? 75);
    const annexedSatisfaction = Number(targetData.kepuasan ?? targetData.kepuasan_masyarakat ?? 70);
    const currentWelfare = Number(previous.kesejahteraan ?? previous.kesejahteraan_masyarakat ?? 75);
    const annexedWelfare = Number(targetData.kesejahteraan ?? targetData.kesejahteraan_masyarakat ?? 70);

    return {
      ...previous,
      ...restoredFields,
      ...weightedFields,
      provinceTensions: Object.fromEntries(
        Object.entries(
          previous.provinceTensions && typeof previous.provinceTensions === 'object'
            ? previous.provinceTensions as Record<string, unknown>
            : {}
        ).filter(([name]) => !aliases.has(normalizeName(name)))
      ),
      provinceReferendums: Object.fromEntries(
        Object.entries(
          previous.provinceReferendums && typeof previous.provinceReferendums === 'object'
            ? previous.provinceReferendums as Record<string, unknown>
            : {}
        ).filter(([name]) => !aliases.has(normalizeName(name)))
      ),
      embassies: (Array.isArray(previous.embassies) ? previous.embassies : []).filter((embassy: unknown) => {
        const embassyName = typeof embassy === 'string'
          ? embassy
          : typeof embassy === 'object' && embassy !== null && 'mitra' in embassy
            ? String((embassy as { mitra?: unknown }).mitra || '')
            : '';
        return normalizeName(embassyName) !== targetNorm;
      }),
      removedEmbassies: Array.from(new Set([
        ...(Array.isArray(previous.removedEmbassies) ? previous.removedEmbassies : [])
          .filter((name: unknown) => normalizeName(String(name)) !== targetNorm),
        targetCountry
      ])),
      ongoingEmbassyConstructions: (Array.isArray(previous.ongoingEmbassyConstructions)
        ? previous.ongoingEmbassyConstructions
        : []).filter((construction: { targetCountry?: string }) =>
          normalizeName(construction.targetCountry || '') !== targetNorm
        ),
      jumlah_penduduk: remainingPopulation,
      populasi: remainingPopulation,
      anggaran: Math.max(0, Number(previous.anggaran || 0) - Number(targetData.anggaran || 0)),
      kepuasan: reverseWeightedValue(currentSatisfaction, annexedSatisfaction),
      kepuasan_masyarakat: reverseWeightedValue(currentSatisfaction, annexedSatisfaction),
      kesejahteraan: reverseWeightedValue(currentWelfare, annexedWelfare),
      kesejahteraan_masyarakat: reverseWeightedValue(currentWelfare, annexedWelfare)
    };
  });

  if (contribution.netBalance > 0) {
    adjustPlayerNetBalance(-contribution.netBalance);
  }

  gameWindow.neosantara_annexed_countries = nextAnnexedCountries;
  gameWindow.neosantara_country_color_overrides = nextOverrides;
  updateCountryColorOverrides(previous => Object.fromEntries(
    Object.entries(previous).filter(([key]) => !aliases.has(normalizeName(key)))
  ));
  delete contributionCache[targetNorm];
  window.dispatchEvent(new CustomEvent('map_territory_color_updated', {
    detail: { targetCountry, released: true }
  }));

  return `${targetCountry} telah merdeka. Status aneksasi dicabut, statistik wilayah dikembalikan dari negara, dan warna peta dipulihkan.`;
}

const action: ProvinceAction = {
  id: 'beri_kemerdekaan',
  label: 'Beri Kemerdekaan',
  description: 'Mengakhiri aneksasi dan mengembalikan wilayah ini menjadi negara merdeka.',
  icon: Flag
};

export default action;
