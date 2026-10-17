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
const EXPELLED_ORGANIZATION_MEMBERSHIPS_KEY = 'neosantara_expelled_organization_memberships_v1';
export const ORGANIZATION_MEMBERSHIP_UPDATED_EVENT = 'international_organization_membership_updated';

const UN_ORGANIZATION_NAMES = [
  "Interpol",
  "Organisasi Kesehatan Dunia (WHO)",
  "UNESCO",
  "Organisasi Perdagangan Dunia (WTO)",
  "Organisasi Buruh Internasional (ILO)",
  "Organisasi Pangan dan Pertanian (FAO)",
  "Organisasi Maritim Internasional (IMO)",
  "Organisasi Telekomunikasi Internasional (ITU)",
  "Organisasi Meteorologi Dunia (WMO)",
];

function normalizeCountryName(countryName: string): string {
  return countryName.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function normalizeOrganizationName(organizationName: string): string {
  return organizationName.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
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

function getExpelledOrganizationMemberships(): Record<string, string[]> {
  if (typeof window === 'undefined') return {};

  let storedMemberships: string | null;
  try {
    storedMemberships = window.localStorage.getItem(EXPELLED_ORGANIZATION_MEMBERSHIPS_KEY);
  } catch (error) {
    console.error('Failed to read expelled organization memberships:', error);
    throw new Error('Tidak dapat membaca data pengeluaran keanggotaan organisasi.', { cause: error });
  }

  if (!storedMemberships) return {};

  try {
    const parsed: unknown = JSON.parse(storedMemberships);
    if (
      parsed === null ||
      typeof parsed !== 'object' ||
      Array.isArray(parsed) ||
      !Object.values(parsed).every(value => Array.isArray(value) && value.every(item => typeof item === 'string'))
    ) {
      throw new Error('Data pengeluaran keanggotaan organisasi tidak valid.');
    }
    return parsed as Record<string, string[]>;
  } catch (error) {
    console.error('Failed to parse expelled organization memberships:', error);
    throw new Error('Data pengeluaran keanggotaan organisasi rusak.', { cause: error });
  }
}

export function clearExpelledOrganizationCountries(): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.removeItem(EXPELLED_COUNTRIES_KEY);
    window.localStorage.removeItem(EXPELLED_ORGANIZATION_MEMBERSHIPS_KEY);
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

export function expelCountryFromUNOrganizations(countryName: string): string[] {
  const normalizedCountry = normalizeCountryName(countryName);
  if (!normalizedCountry) return [];
  if (typeof window === 'undefined') {
    throw new Error('Pengeluaran keanggotaan organisasi hanya dapat dilakukan di browser.');
  }

  const organizations = UN_ORGANIZATION_NAMES.filter(orgName =>
    getOrgMembers(orgName, countryName).some(member =>
      normalizeCountryName(member.country) === normalizedCountry
    )
  );
  if (organizations.length === 0) return [];

  const expelledMemberships = getExpelledOrganizationMemberships();
  const countryMemberships = new Set(expelledMemberships[normalizedCountry] || []);
  organizations.forEach(orgName => countryMemberships.add(normalizeOrganizationName(orgName)));
  expelledMemberships[normalizedCountry] = [...countryMemberships];

  try {
    window.localStorage.setItem(
      EXPELLED_ORGANIZATION_MEMBERSHIPS_KEY,
      JSON.stringify(expelledMemberships)
    );
  } catch (error) {
    console.error(`Failed to expel ${countryName} from UN organizations:`, error);
    throw new Error(`Tidak dapat mengeluarkan ${countryName} dari organisasi PBB.`, { cause: error });
  }

  window.dispatchEvent(new CustomEvent(ORGANIZATION_MEMBERSHIP_UPDATED_EVENT, {
    detail: { country: countryName, organizations }
  }));
  return organizations;
}

export function getOrgMembers(orgName: string, playerCountryName?: string): { country: string; status: string }[] {
  if (!orgName) return [];
  
  let list = orgNameToKeyMap[orgName];

  if (!list) {
    const norm = orgName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const entry = Object.entries(orgNameToKeyMap).find(([k]) => k.toLowerCase().replace(/[^a-z0-9]/g, '') === norm);
    if (entry) {
      list = entry[1];
    }
  }

  const result: { country: string; status: string }[] = [];
  const expelledCountries = getExpelledCountryNames();
  const expelledMemberships = getExpelledOrganizationMemberships();
  const organizationExpelledCountry = (countryName: string) =>
    expelledCountries.has(normalizeCountryName(countryName)) ||
    (expelledMemberships[normalizeCountryName(countryName)] || [])
      .includes(normalizeOrganizationName(orgName));

  if (list && Array.isArray(list)) {
    list.forEach((item) => {
      const rawCountry = typeof item === 'string' ? item : (item as any).country || '';
      const formattedCountry = rawCountry
        .split(' ')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      if (!organizationExpelledCountry(formattedCountry)) {
        result.push({
          country: formattedCountry,
          status: 'Anggota',
        });
      }
    });
  }

  // Inject user country if they have accepted membership and aren't in the default static list
  if (playerCountryName) {
    const formattedPlayer = playerCountryName
      .split(' ')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const normPlayer = normalizeCountryName(playerCountryName);
    const alreadyExists = result.some(m => normalizeCountryName(m.country) === normPlayer);

    if (
      !alreadyExists &&
      !organizationExpelledCountry(playerCountryName) &&
      typeof window !== 'undefined'
    ) {
      try {
        const rawJoined = localStorage.getItem(`neosantara_user_joined_orgs_v1_${normPlayer.replace(/[^a-z0-9]/g, '')}`);
        if (rawJoined) {
          const joinedArray: string[] = JSON.parse(rawJoined);
          const normOrg = orgName.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
          
          // Alias map for short keys saved in joinedOrgs
          const keyAliases: Record<string, string[]> = {
            "interpol": ["interpol"],
            "organisasikesehatanduniawho": ["who", "organisasikesehatanduniawho"],
            "unesco": ["unesco"],
            "organisasiperdaganganduniawto": ["wto", "organisasiperdaganganduniawto"],
            "organisasiburuhinternasionalilo": ["ilo", "organisasiburuhinternasionalilo"],
            "organisasipangandanpertanianfao": ["fao", "organisasipangandanpertanianfao"],
            "organisasimaritiminternasionalimo": ["imo", "organisasimaritiminternasionalimo"],
            "organisasitelekomunikasiinternasionalitu": ["itu", "organisasitelekomunikasiinternasionalitu"],
            "organisasimeteorologiduniawmo": ["wmo", "organisasimeteorologiduniawmo"],
            "perhimpunanbangsabangsaasiatenggaraasean": ["asean", "perhimpunanbangsabangsaasiatenggaraasean"],
            "unieropaeu": ["eu", "unieropaeu"],
            "ligaarab": ["arab_league", "ligaarab"],
            "uniafrikaau": ["au", "uniafrikaau"],
            "organisasikerjasamaislamoki": ["oic", "oki", "organisasikerjasamaislamoki"],
            "bricsbrasilrusiaindiachinaafrikaselatan": ["brics", "bricsbrasilrusiaindiachinaafrikaselatan"],
            "paktapertahananatlantikutaranato": ["nato", "paktapertahananatlantikutaranato"],
            "organisasinegaranegarapengeksporminyakbumiopec": ["opec", "organisasinegaranegarapengeksporminyakbumiopec"],
            "kelompokduapuluhg20": ["g20", "kelompokduapuluhg20"]
          };

          const validKeys = keyAliases[normOrg] || [normOrg];
          const isJoined = joinedArray.some(j => validKeys.includes(j.toLowerCase().trim().replace(/[^a-z0-9]/g, '')));

          if (isJoined) {
            result.push({
              country: formattedPlayer,
              status: 'Anggota',
            });
          }
        }
      } catch (e) {
        console.error('Failed to parse joined orgs in getOrgMembers:', e);
      }
    }
  }

  return result;
}
