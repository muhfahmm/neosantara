import { members as interpol_Members } from "./1_organisasi_PBB/1_Interpol/memberInterpol";
import { members as who_Members } from "./1_organisasi_PBB/2_Organisasi_Kesehatan_Dunia_(WHO)/memberWHO";
import { members as unesco_Members } from "./1_organisasi_PBB/3_UNESCO/memberUNESCO";
import { members as wto_Members } from "./1_organisasi_PBB/4_Organisasi_Perdagangan_Dunia_(WTO)/memberWTO";
import { members as ilo_Members } from "./1_organisasi_PBB/5_Organisasi_Buruh_Internasional_(ILO)/memberILO";
import { members as fao_Members } from "./1_organisasi_PBB/6_Organisasi_Pangan_dan_Pertanian_(FAO)/memberFAO";
import { members as imo_Members } from "./1_organisasi_PBB/7_Organisasi_Maritim_Internasional_(IMO)/memberIMO";
import { members as itu_Members } from "./1_organisasi_PBB/8_Organisasi_Telekomunikasi_Internasional_(ITU)/memberITU";
import { members as wmo_Members } from "./1_organisasi_PBB/9_Organisasi_Meteorologi_Dunia_(WMO)/memberWMO";

import { members as asean_Members } from "./2_organisasi_regional/1_Perhimpunan_Bangsa-Bangsa_Asia_Tenggara_(ASEAN)/memberASEAN";
import { members as eu_Members } from "./2_organisasi_regional/2_Uni_Eropa_(EU)/memberEU";
import { members as arab_league_Members } from "./2_organisasi_regional/3_Liga_Arab/memberLigaArab";
import { members as au_Members } from "./2_organisasi_regional/4_Uni_Afrika_(AU)/memberAU";
import { members as oic_Members } from "./2_organisasi_regional/5_Organisasi_Kerja_Sama_Islam_(OKI)/memberOKI";
import { members as brics_Members } from "./2_organisasi_regional/6_BRICS_(Brasil_Rusia_India_China_Afrika_Selatan)/memberBRICS";
import { members as nato_Members } from "./2_organisasi_regional/7_Pakta_Pertahanan_Atlantik_Utara_(NATO)/memberNATO";
import { members as opec_Members } from "./2_organisasi_regional/8_Organisasi_Negara-Negara_Pengekspor_Minyak_Bumi_(OPEC)/memberOPEC";
import { members as g20_Members } from "./2_organisasi_regional/9_Kelompok_Duapuluh_(G20)/memberG20";

export const OrganizationMembers: Record<string, string[]> = {
  interpol: interpol_Members,
  who: who_Members,
  unesco: unesco_Members,
  wto: wto_Members,
  ilo: ilo_Members,
  fao: fao_Members,
  imo: imo_Members,
  itu: itu_Members,
  wmo: wmo_Members,
  asean: asean_Members,
  eu: eu_Members,
  arab_league: arab_league_Members,
  au: au_Members,
  oic: oic_Members,
  brics: brics_Members,
  nato: nato_Members,
  opec: opec_Members,
  g20: g20_Members,
};

const orgNameToKeyMap: Record<string, string[]> = {
  // PBB
  "Interpol": interpol_Members,
  "Organisasi Kesehatan Dunia (WHO)": who_Members,
  "UNESCO": unesco_Members,
  "Organisasi Perdagangan Dunia (WTO)": wto_Members,
  "Organisasi Buruh Internasional (ILO)": ilo_Members,
  "Organisasi Pangan dan Pertanian (FAO)": fao_Members,
  "Organisasi Maritim Internasional (IMO)": imo_Members,
  "Organisasi Telekomunikasi Internasional (ITU)": itu_Members,
  "Organisasi Meteorologi Dunia (WMO)": wmo_Members,

  // Regional
  "Perhimpunan Bangsa-Bangsa Asia Tenggara (ASEAN)": asean_Members,
  "Uni Eropa (EU)": eu_Members,
  "Liga Arab": arab_league_Members,
  "Uni Afrika (AU)": au_Members,
  "Organisasi Kerja Sama Islam (OKI)": oic_Members,
  "BRICS (Brasil, Rusia, India, China, Afrika Selatan)": brics_Members,
  "Pakta Pertahanan Atlantik Utara (NATO)": nato_Members,
  "Organisasi Negara-Negara Pengekspor Minyak Bumi (OPEC)": opec_Members,
  "Kelompok Duapuluh (G20)": g20_Members,
};

const EXPELLED_COUNTRIES_KEY = 'neosantara_expelled_organization_countries';
export const ORGANIZATION_MEMBERSHIP_UPDATED_EVENT = 'international_organization_membership_updated';

function normalizeCountryName(countryName: string): string {
  return countryName.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function getExpelledCountryNames(): Set<string> {
  if (typeof window === 'undefined') return new Set();

  let storedCountries: string | null;
  try {
    storedCountries = window.localStorage.getItem(EXPELLED_COUNTRIES_KEY);
  } catch (error) {
    console.error('Failed to read expelled organization countries:', error);
    throw new Error('Tidak dapat membaca data pengeluaran organisasi.', { cause: error });
  }

  if (!storedCountries) return new Set();

  try {
    const parsed: unknown = JSON.parse(storedCountries);
    if (!Array.isArray(parsed) || !parsed.every(country => typeof country === 'string')) {
      throw new Error('Data pengeluaran organisasi tidak valid.');
    }
    return new Set(parsed.map(normalizeCountryName));
  } catch (error) {
    console.error('Failed to parse expelled organization countries:', error);
    throw new Error('Data pengeluaran organisasi rusak.', { cause: error });
  }
}

export function clearExpelledOrganizationCountries(): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.removeItem(EXPELLED_COUNTRIES_KEY);
  } catch (error) {
    console.error('Failed to clear expelled organization countries:', error);
    throw new Error('Tidak dapat mengatur ulang keanggotaan organisasi internasional.', { cause: error });
  }
  window.dispatchEvent(new CustomEvent(ORGANIZATION_MEMBERSHIP_UPDATED_EVENT));
}

export function expelCountryFromOrganizations(countryName: string): string[] {
  const normalizedCountry = normalizeCountryName(countryName);
  if (!normalizedCountry) return [];
  if (typeof window === 'undefined') {
    throw new Error('Pengeluaran keanggotaan organisasi hanya dapat dilakukan di browser.');
  }

  const organizations = Object.entries(OrganizationMembers)
    .filter(([, members]) => members.some(member => normalizeCountryName(member) === normalizedCountry))
    .map(([organization]) => organization);

  if (organizations.length === 0) return [];

  const expelledCountries = getExpelledCountryNames();
  if (!expelledCountries.has(normalizedCountry)) {
    expelledCountries.add(normalizedCountry);
    try {
      window.localStorage.setItem(EXPELLED_COUNTRIES_KEY, JSON.stringify([...expelledCountries]));
    } catch (error) {
      console.error(`Failed to expel ${countryName} from international organizations:`, error);
      throw new Error(`Tidak dapat mengeluarkan ${countryName} dari organisasi internasional.`, { cause: error });
    }
  }

  window.dispatchEvent(new CustomEvent(ORGANIZATION_MEMBERSHIP_UPDATED_EVENT, {
    detail: { country: countryName, organizations }
  }));
  return organizations;
}

export function getOrgMembers(orgName: string): { country: string; status: string }[] {
  if (!orgName) return [];
  
  let list = orgNameToKeyMap[orgName];

  if (!list) {
    const norm = orgName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const entry = Object.entries(orgNameToKeyMap).find(([k]) => k.toLowerCase().replace(/[^a-z0-9]/g, '') === norm);
    if (entry) {
      list = entry[1];
    }
  }

  if (!list || !Array.isArray(list)) return [];

  const expelledCountries = getExpelledCountryNames();
  return list.map((item) => {
    const rawCountry = typeof item === 'string' ? item : (item as any).country || '';
    const formattedCountry = rawCountry
      .split(' ')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return {
      country: formattedCountry,
      status: 'Anggota',
    };
  }).filter(member => !expelledCountries.has(normalizeCountryName(member.country)));
}
