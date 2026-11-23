import { COUNTRIES_DATA } from "@/app/page/map_system/map-data";
import { getCurrentGameDateString } from "@/app/logic/gameSessionState";
import { getRelationValue } from "../../../../../../../../../../json/4_database_hubungan_antar_negara/relationsRegistry";
import type { CountryProfile } from "@/../../json/semua_fitur_negara/0_profiles";
import { createInboxNotificationText, getDefaultInboxText } from "@/app/page/menus/inbox/logic/notificationMessage";
import type { NotificationMessage } from "@/app/page/menus/inbox/logic/1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic";

/* ------------------------------------------------------------------ */
/* Tipe                                                                */
/* ------------------------------------------------------------------ */

export type CouncilRegion =
  | "Afrika"
  | "Asia-Pasifik"
  | "Amerika Latin & Karibia"
  | "Eropa Barat"
  | "Eropa Timur";

export interface SecurityCouncilMember {
  name: string;
  iso: string;
  region: CouncilRegion;
  cohort: "A" | "B";
  termStartYear: number;
  termEndYear: number;
  vetoUsed: boolean;
  vetoUsedOn?: string;
}

export interface ElectionCandidate {
  name: string;
  iso: string;
  slug: string;
  region: CouncilRegion;
  score: number;
  votes: number;
  campaignCount: number;
  contributionScore: number;
}

export interface ElectionHistoryItem {
  year: number;
  cohort: "A" | "B";
  winners: string[];
  winnerIsos?: string[];
  votes: Record<string, number>;
}

/** Catatan masa jabatan terakhir sebuah negara yang SUDAH selesai / dicopot. */
export interface PastTerm {
  iso: string;
  termEndYear: number;
}

export interface SecurityCouncilElectionState {
  schemaVersion: number;
  /** Penanda sesi halaman. State dari sesi lain (refresh / keluar game) dianggap basi dan di-reset. */
  sessionId?: string;
  year: number;
  nextElectionYear: number;
  cohort: "A" | "B";
  phase: "nomination" | "campaign" | "voting" | "completed";
  scheduleStage: number;
  nominees: ElectionCandidate[];
  members: SecurityCouncilMember[];
  /** Turunan (derived): dihitung ulang dari pastTerms, tidak dipercaya dari storage. */
  recentlyServedIsos: string[];
  /** Sumber kebenaran untuk negara yang sudah pernah menjabat. */
  pastTerms: PastTerm[];
  history: ElectionHistoryItem[];
  permanentBonuses: Record<string, { reputation: number; softPower: number }>;
}

export interface ElectionCountry {
  name: string;
  iso: string;
  slug: string;
  region: CouncilRegion;
  profile: CountryProfile | null;
}

/* ------------------------------------------------------------------ */
/* Konstanta                                                           */
/* ------------------------------------------------------------------ */

export const SECURITY_COUNCIL_ELECTION_STATE_KEY = "neosantara_pbb_security_council_election";

const SCHEMA_VERSION = 2;

/* ------------------------------------------------------------------ */
/* Sesi game: state hanya berlaku selama sesi halaman yang sama        */
/* ------------------------------------------------------------------ */

const createSessionId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

// Dibuat ulang setiap halaman dimuat (refresh) sehingga data lama di localStorage otomatis basi.
let currentSessionId = createSessionId();

export function isElectionStateFromCurrentSession(existing: unknown): boolean {
  return isRecord(existing) && existing.sessionId === currentSessionId;
}

/**
 * Panggil saat pemain keluar ke menu utama / memulai game baru TANPA refresh halaman.
 * Menghapus data tersimpan dan membuat sesi baru sehingga roster kembali ke default.
 */
export function resetSecurityCouncilElectionSession(): void {
  currentSessionId = createSessionId();
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SECURITY_COUNCIL_ELECTION_STATE_KEY);
    window.dispatchEvent(new CustomEvent("pbb_security_council_roster_updated"));
  } catch (error) {
    console.error("Gagal mereset state pemilu Dewan Keamanan:", error);
  }
}

/**
 * Negara tidak boleh dicalonkan jika masa jabatan terakhirnya berakhir pada
 * tahun >= (tahunPemilu - COOLING_OFF_YEARS). Anggota yang MASIH menjabat
 * selalu diblokir terpisah lewat daftar members.
 */
export const COOLING_OFF_YEARS = 1;

export const COHORT_SEATS: Record<"A" | "B", Partial<Record<CouncilRegion, number>>> = {
  A: {
    Afrika: 2,
    "Asia-Pasifik": 1,
    "Amerika Latin & Karibia": 1,
    "Eropa Barat": 1,
  },
  B: {
    Afrika: 1,
    "Asia-Pasifik": 1,
    "Amerika Latin & Karibia": 1,
    "Eropa Barat": 1,
    "Eropa Timur": 1,
  },
};

export const PERMANENT_SECURITY_COUNCIL_MEMBERS = [
  { name: "Amerika Serikat", iso: "us" },
  { name: "Inggris", iso: "gb" },
  { name: "Perancis", iso: "fr" },
  { name: "Rusia", iso: "ru" },
  { name: "China", iso: "cn" },
];

const INITIAL_MEMBERS: Omit<SecurityCouncilMember, "termStartYear" | "termEndYear">[] = [
  { name: "Afrika Selatan", iso: "za", region: "Afrika", cohort: "A", vetoUsed: false },
  { name: "Mesir", iso: "eg", region: "Afrika", cohort: "A", vetoUsed: false },
  { name: "India", iso: "in", region: "Asia-Pasifik", cohort: "A", vetoUsed: false },
  { name: "Meksiko", iso: "mx", region: "Amerika Latin & Karibia", cohort: "A", vetoUsed: false },
  { name: "Australia", iso: "au", region: "Eropa Barat", cohort: "A", vetoUsed: false },
  { name: "Kenya", iso: "ke", region: "Afrika", cohort: "B", vetoUsed: false },
  { name: "Indonesia", iso: "id", region: "Asia-Pasifik", cohort: "B", vetoUsed: false },
  { name: "Brazil", iso: "br", region: "Amerika Latin & Karibia", cohort: "B", vetoUsed: false },
  { name: "Jerman", iso: "de", region: "Eropa Barat", cohort: "B", vetoUsed: false },
  { name: "Polandia", iso: "pl", region: "Eropa Timur", cohort: "B", vetoUsed: false },
];

const NON_MEMBER_TERRITORIES = new Set([
  "hong kong", "makau", "taiwan", "kosovo", "vatikan", "gibraltar",
  "kepulauan faroe", "bermuda", "greenland", "puerto rico", "guam",
  "samoa amerika", "tahiti", "mayotte", "reunion", "guadeloupe",
  "martinique", "bonaire sint eustatius dan saba", "palestina",
]);

const EASTERN_EUROPE = new Set([
  "albania", "armenia", "azerbaijan", "belarus", "bosnia dan hercegovina",
  "bulgaria", "ceko", "georgia", "hungaria", "kroasia", "latvia", "lithuania",
  "makedonia utara", "moldova", "montenegro", "rumania", "republik rumania",
  "republik serbia", "rusia", "slowakia", "slovenia", "ukraina",
]);

const WESTERN_EUROPE_EXCEPTIONS = new Set([
  "amerika serikat", "kanada", "israel", "australia", "selandia baru",
]);

const VALID_PHASES: SecurityCouncilElectionState["phase"][] = [
  "nomination", "campaign", "voting", "completed",
];

/* ------------------------------------------------------------------ */
/* Helper umum                                                         */
/* ------------------------------------------------------------------ */

export const normalizeName = (value: string) =>
  value.toLocaleLowerCase("id-ID").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ").trim();

const normalizeSlug = (value: string) => normalizeName(value).replace(/\s+/g, "-");

const toIso = (value: string) => value.trim().toLowerCase();

const getCohortForYear = (electionYear: number): "A" | "B" =>
  electionYear % 2 === 0 ? "A" : "B";

function hash(value: string): number {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

/* ------------------------------------------------------------------ */
/* Anggota tetap & kelayakan                                           */
/* ------------------------------------------------------------------ */

export function isPermanentSecurityCouncilMember(iso: string): boolean {
  const normalizedIso = toIso(iso);
  return PERMANENT_SECURITY_COUNCIL_MEMBERS.some(member => member.iso === normalizedIso);
}

/**
 * Tidak layak jika: anggota tetap, sedang menjabat (members), atau baru saja
 * selesai menjabat (recentlyServedIsos).
 */
export function isIneligibleElectionCandidate(
  members: SecurityCouncilMember[],
  iso: string,
  recentlyServedIsos: string[] = [],
): boolean {
  const normalizedIso = toIso(iso);
  return isPermanentSecurityCouncilMember(normalizedIso) ||
    members.some(member => toIso(member.iso) === normalizedIso) ||
    recentlyServedIsos.some(memberIso => toIso(memberIso) === normalizedIso);
}

/** Gabungkan catatan masa jabatan; per negara hanya akhir jabatan TERBARU yang dipakai. */
function mergePastTerms(...lists: PastTerm[][]): PastTerm[] {
  const latest = new Map<string, number>();
  lists.flat().forEach(term => {
    if (!term || typeof term.iso !== "string" || !Number.isFinite(term.termEndYear)) return;
    const iso = toIso(term.iso);
    if (!iso) return;
    latest.set(iso, Math.max(latest.get(iso) ?? -Infinity, term.termEndYear));
  });
  return [...latest].map(([iso, termEndYear]) => ({ iso, termEndYear }));
}

/** Negara yang selesai menjabat dalam jendela cooling-off sebelum pemilu `electionYear`. */
export function getRecentlyServedIsos(electionYear: number, pastTerms: PastTerm[]): string[] {
  return [...new Set(
    pastTerms
      .filter(term => term.termEndYear >= electionYear - COOLING_OFF_YEARS)
      .map(term => toIso(term.iso))
  )];
}

/**
 * Migrasi data lama (tanpa pastTerms): susun ulang dari history.
 * Pemenang pemilu tahun Y menjabat Y+1 s/d Y+2. Anggota awal berakhir
 * pada pemilu pertama kohortnya.
 */
function reconstructPastTerms(history: ElectionHistoryItem[]): PastTerm[] {
  if (history.length === 0) return [];
  const nameToIso = new Map(
    getSecurityCouncilElectionCandidateCountries().map(country => [normalizeName(country.name), country.iso])
  );
  const terms: PastTerm[] = [];
  history.forEach(item => {
    const isos = item.winnerIsos?.length
      ? item.winnerIsos
      : item.winners
        .map(name => nameToIso.get(normalizeName(name)))
        .filter((iso): iso is string => Boolean(iso));
    isos.forEach(iso => terms.push({ iso, termEndYear: item.year + 2 }));
  });
  const first = history[0];
  INITIAL_MEMBERS.forEach(member => {
    terms.push({
      iso: member.iso,
      termEndYear: first.year + (member.cohort === first.cohort ? 0 : 1),
    });
  });
  return mergePastTerms(terms);
}

/* ------------------------------------------------------------------ */
/* Data negara                                                         */
/* ------------------------------------------------------------------ */

function getRegion(name: string, continent: string): CouncilRegion | null {
  const normalized = normalizeName(name);
  if (EASTERN_EUROPE.has(normalized)) return "Eropa Timur";
  if (WESTERN_EUROPE_EXCEPTIONS.has(normalized)) return "Eropa Barat";
  if (continent === "Africa") return "Afrika";
  if (continent === "Asia" || continent === "Oceania") return "Asia-Pasifik";
  if (continent === "North America" || continent === "South America") {
    return "Amerika Latin & Karibia";
  }
  if (continent === "Europe") return "Eropa Barat";
  return null;
}

function getElectionCountries(
  profiles: CountryProfile[],
  includeNonMemberTerritories: boolean
): ElectionCountry[] {
  const profilesByName = new Map(
    profiles.map(profile => [normalizeName(profile.name_id), profile])
  );
  return COUNTRIES_DATA.flatMap(country => {
    const normalizedName = normalizeName(country.country);
    if (!includeNonMemberTerritories && NON_MEMBER_TERRITORIES.has(normalizedName)) return [];
    const region = getRegion(country.country, country.continent);
    if (!region) return [];
    const profile = profilesByName.get(normalizedName) || null;
    return [{
      name: country.country,
      iso: toIso(country.iso),
      slug: profile?.country_slug || normalizeSlug(country.country),
      region,
      profile,
    }];
  });
}

export function getEligibleUNMemberCountries(profiles: CountryProfile[] = []): ElectionCountry[] {
  return getElectionCountries(profiles, false);
}

export function getSecurityCouncilElectionCandidateCountries(
  profiles: CountryProfile[] = []
): ElectionCountry[] {
  return getElectionCountries(profiles, true);
}

/* ------------------------------------------------------------------ */
/* Pembuatan & normalisasi state                                       */
/* ------------------------------------------------------------------ */

export function createInitialElectionState(year: number): SecurityCouncilElectionState {
  const electionYear = year + 1;
  const cohort = getCohortForYear(electionYear);
  const members: SecurityCouncilMember[] = INITIAL_MEMBERS.map(member => {
    const termEndYear = electionYear + (member.cohort === cohort ? 0 : 1);
    return {
      ...member,
      termStartYear: Math.min(year, termEndYear - 1),
      termEndYear,
    };
  });
  return {
    schemaVersion: SCHEMA_VERSION,
    sessionId: currentSessionId,
    year: electionYear,
    nextElectionYear: electionYear,
    cohort,
    phase: "nomination",
    scheduleStage: 0,
    nominees: [],
    members,
    recentlyServedIsos: [],
    pastTerms: [],
    history: [],
    permanentBonuses: {},
  };
}

function sanitizeMembers(
  raw: unknown,
  fallback: SecurityCouncilMember[]
): SecurityCouncilMember[] | null {
  if (!Array.isArray(raw) || raw.length !== 10) return null;
  const result: SecurityCouncilMember[] = [];
  for (let index = 0; index < raw.length; index += 1) {
    const member = raw[index] as Partial<SecurityCouncilMember> | null;
    if (
      !member ||
      typeof member.name !== "string" ||
      typeof member.iso !== "string" ||
      typeof member.region !== "string" ||
      (member.cohort !== "A" && member.cohort !== "B")
    ) return null;
    result.push({
      name: member.name,
      iso: toIso(member.iso),
      region: member.region as CouncilRegion,
      cohort: member.cohort,
      termStartYear: Number.isFinite(member.termStartYear)
        ? Number(member.termStartYear)
        : fallback[index].termStartYear,
      termEndYear: Number.isFinite(member.termEndYear)
        ? Number(member.termEndYear)
        : fallback[index].termEndYear,
      vetoUsed: Boolean(member.vetoUsed),
      vetoUsedOn: typeof member.vetoUsedOn === "string" ? member.vetoUsedOn : undefined,
    });
  }
  return result;
}

const isValidHistoryItem = (item: unknown): item is ElectionHistoryItem =>
  isRecord(item) &&
  Number.isInteger(item.year) &&
  (item.cohort === "A" || item.cohort === "B") &&
  Array.isArray(item.winners) &&
  isRecord(item.votes);

const isValidCandidate = (item: unknown): item is ElectionCandidate =>
  isRecord(item) &&
  typeof item.name === "string" &&
  typeof item.iso === "string" &&
  typeof item.slug === "string" &&
  typeof item.region === "string";

/** Isi ulang kandidat pemenang pada data lama agar tetap tampil di hasil. */
function backfillWinnerNominees(
  nominees: ElectionCandidate[],
  members: SecurityCouncilMember[],
  history: ElectionHistoryItem[]
): ElectionCandidate[] {
  const last = history.at(-1);
  if (!last) return nominees;
  const winnerIsos = new Set((last.winnerIsos || []).map(toIso));
  if (winnerIsos.size === 0) {
    const winnerNames = new Set(last.winners.map(normalizeName));
    members.forEach(member => {
      if (winnerNames.has(normalizeName(member.name))) winnerIsos.add(toIso(member.iso));
    });
  }
  const result = [...nominees];
  members.forEach(member => {
    const iso = toIso(member.iso);
    if (!winnerIsos.has(iso) || result.some(candidate => toIso(candidate.iso) === iso)) return;
    const slug = normalizeSlug(member.name);
    result.push({
      name: member.name,
      iso,
      slug,
      region: member.region,
      score: 0,
      votes: last.votes[slug] || 0,
      campaignCount: 0,
      contributionScore: 0,
    });
  });
  return result;
}

export function normalizeElectionState(existing: unknown, year: number): SecurityCouncilElectionState {
  const fallback = createInitialElectionState(year);
  if (!isRecord(existing)) return fallback;
  const raw = existing as Partial<SecurityCouncilElectionState>;
  // State dari sesi/halaman lain (mis. sebelum refresh) tidak dipakai → kembali ke default.
  if (raw.sessionId !== currentSessionId) return fallback;

  const storedMembers = sanitizeMembers(raw.members, fallback.members);
  if (!storedMembers) return fallback;

  const history = Array.isArray(raw.history) ? raw.history.filter(isValidHistoryItem) : [];
  const phase = VALID_PHASES.includes(raw.phase as SecurityCouncilElectionState["phase"])
    ? (raw.phase as SecurityCouncilElectionState["phase"])
    : "nomination";
  const scheduleStage = Number.isInteger(raw.scheduleStage) ? Number(raw.scheduleStage) : 0;
  const storedNominees = Array.isArray(raw.nominees) ? raw.nominees.filter(isValidCandidate) : [];
  const permanentBonuses = isRecord(raw.permanentBonuses)
    ? (raw.permanentBonuses as SecurityCouncilElectionState["permanentBonuses"])
    : {};

  let storedYear = Number.isInteger(raw.year)
    ? Number(raw.year)
    : Number.isInteger(raw.nextElectionYear)
      ? Number(raw.nextElectionYear)
      : year + 1;

  // Migrasi: pemilu awal yang belum berjalan tetapi jadwalnya terlanjur terlalu jauh.
  let members = storedMembers;
  const initialTermYear = Math.min(...storedMembers.map(member => member.termStartYear));
  const isUnstartedInitial =
    phase === "nomination" && scheduleStage === 0 &&
    history.length === 0 && storedNominees.length === 0;
  if (isUnstartedInitial && Number.isFinite(initialTermYear) && storedYear > initialTermYear + 1) {
    storedYear = initialTermYear + 1;
    const cohort = getCohortForYear(storedYear);
    members = storedMembers.map(member => {
      const termEndYear = storedYear + (member.cohort === cohort ? 0 : 1);
      return { ...member, termStartYear: Math.min(initialTermYear, termEndYear - 1), termEndYear };
    });
  }

  // pastTerms: pakai yang tersimpan hanya jika skema sudah baru, selain itu rekonstruksi.
  const pastTerms = raw.schemaVersion === SCHEMA_VERSION && Array.isArray(raw.pastTerms)
    ? mergePastTerms(raw.pastTerms)
    : reconstructPastTerms(history);

  const storedNext = Number.isInteger(raw.nextElectionYear)
    ? Number(raw.nextElectionYear)
    : storedYear + 1;

  // Pemilu sebelumnya selesai dan tahun pemilu berikutnya sudah tiba → siklus baru.
  if (phase === "completed" && year >= storedNext) {
    return {
      schemaVersion: SCHEMA_VERSION,
      sessionId: currentSessionId,
      year: storedNext,
      nextElectionYear: storedNext,
      cohort: getCohortForYear(storedNext),
      phase: "nomination",
      scheduleStage: 0,
      nominees: [],
      members,
      recentlyServedIsos: getRecentlyServedIsos(storedNext, pastTerms),
      pastTerms,
      history,
      permanentBonuses,
    };
  }

  const recentlyServedIsos = getRecentlyServedIsos(storedYear, pastTerms);
  const nominees = phase === "completed"
    ? backfillWinnerNominees(storedNominees, members, history)
    : storedNominees.filter(candidate =>
      !isIneligibleElectionCandidate(members, candidate.iso, recentlyServedIsos));

  return {
    schemaVersion: SCHEMA_VERSION,
    sessionId: currentSessionId,
    year: storedYear,
    nextElectionYear: phase === "completed" ? storedNext : storedYear,
    cohort: getCohortForYear(storedYear),
    phase,
    scheduleStage,
    nominees,
    members,
    recentlyServedIsos,
    pastTerms,
    history,
    permanentBonuses,
  };
}

/* ------------------------------------------------------------------ */
/* Storage & roster                                                    */
/* ------------------------------------------------------------------ */

export function getCurrentElectionYear(): number {
  const year = Number(getCurrentGameDateString().slice(0, 4));
  return Number.isFinite(year) && year > 0 ? year : new Date().getFullYear();
}

function saveElectionState(state: SecurityCouncilElectionState) {
  localStorage.setItem(SECURITY_COUNCIL_ELECTION_STATE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent("pbb_security_council_roster_updated"));
}

export function getStoredCouncilMembers(): SecurityCouncilMember[] {
  const currentYear = getCurrentElectionYear();
  const fallbackMembers = () => createInitialElectionState(currentYear).members;
  if (typeof window === "undefined") return fallbackMembers();
  try {
    const raw = localStorage.getItem(SECURITY_COUNCIL_ELECTION_STATE_KEY);
    if (!raw) return fallbackMembers();
    return normalizeElectionState(JSON.parse(raw), currentYear).members;
  } catch (error) {
    console.error("Gagal membaca roster Dewan Keamanan PBB:", error);
    return fallbackMembers();
  }
}

export function getCouncilVoteMultiplier(countryIso: string, year = getCurrentElectionYear()): number {
  const member = getStoredCouncilMembers().find(candidate => toIso(candidate.iso) === toIso(countryIso));
  return member && year >= member.termStartYear && year <= member.termEndYear ? 1.5 : 1;
}

export function getCouncilRoster() {
  return [
    ...PERMANENT_SECURITY_COUNCIL_MEMBERS,
    ...getStoredCouncilMembers().map(({ name, iso }) => ({ name, iso })),
  ];
}

export function isLimitedVetoAvailable(countryIso: string, resolutionId?: string): boolean {
  const member = getStoredCouncilMembers().find(candidate => toIso(candidate.iso) === toIso(countryIso));
  const currentYear = getCurrentElectionYear();
  return Boolean(
    member &&
    currentYear >= member.termStartYear &&
    currentYear <= member.termEndYear &&
    (!member.vetoUsed || member.vetoUsedOn === resolutionId)
  );
}

export function markLimitedVetoUsed(countryIso: string, resolutionId: string): SecurityCouncilElectionState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SECURITY_COUNCIL_ELECTION_STATE_KEY);
    if (!raw) return null;
    const state = normalizeElectionState(JSON.parse(raw), getCurrentElectionYear());
    const members = state.members.map(member =>
      toIso(member.iso) === toIso(countryIso)
        ? { ...member, vetoUsed: true, vetoUsedOn: resolutionId }
        : member
    );
    const updated = { ...state, members };
    saveElectionState(updated);
    return updated;
  } catch (error) {
    console.error("Gagal menyimpan penggunaan hak veto anggota tidak tetap:", error);
    return null;
  }
}

export function expelCountryFromSecurityCouncil(countryNameOrIso: string): SecurityCouncilMember | null {
  if (typeof window === "undefined") return null;
  const currentYear = getCurrentElectionYear();
  const searchKey = normalizeName(countryNameOrIso);
  const searchIso = toIso(countryNameOrIso);
  const matches = (name: string, iso: string) =>
    normalizeName(name) === searchKey || toIso(iso) === searchIso;

  try {
    const raw = localStorage.getItem(SECURITY_COUNCIL_ELECTION_STATE_KEY);
    const state = normalizeElectionState(raw ? JSON.parse(raw) : null, currentYear);
    const nominees = state.nominees.filter(candidate => !matches(candidate.name, candidate.iso));
    const memberIndex = state.members.findIndex(member => matches(member.name, member.iso));

    if (memberIndex === -1) {
      if (nominees.length !== state.nominees.length) saveElectionState({ ...state, nominees });
      return null;
    }

    const removed = state.members[memberIndex];
    // Negara yang dicopot dianggap sudah menjabat → ikut terkena cooling-off.
    const pastTerms = mergePastTerms(state.pastTerms, [{ iso: removed.iso, termEndYear: currentYear }]);
    const recent = new Set(getRecentlyServedIsos(state.year, pastTerms));
    const occupied = new Set([
      ...PERMANENT_SECURITY_COUNCIL_MEMBERS.map(member => member.iso),
      ...state.members.map(member => toIso(member.iso)),
    ]);
    const pool = getEligibleUNMemberCountries([])
      .filter(country => !occupied.has(country.iso) && !matches(country.name, country.iso));
    const ranked = (list: ElectionCountry[]) =>
      [...list].sort((a, b) =>
        hash(`${currentYear}_replace_${a.iso}`) - hash(`${currentYear}_replace_${b.iso}`) ||
        a.iso.localeCompare(b.iso));

    // Prioritas: sekawasan & belum cooling-off → sekawasan → siapa pun yang belum cooling-off → siapa pun.
    const replacement =
      ranked(pool.filter(c => c.region === removed.region && !recent.has(c.iso)))[0] ||
      ranked(pool.filter(c => c.region === removed.region))[0] ||
      ranked(pool.filter(c => !recent.has(c.iso)))[0] ||
      ranked(pool)[0];
    if (!replacement) return null;

    const members = [...state.members];
    members[memberIndex] = {
      name: replacement.name,
      iso: replacement.iso,
      region: removed.region,
      cohort: removed.cohort,
      termStartYear: removed.termStartYear,
      termEndYear: removed.termEndYear,
      vetoUsed: false,
    };

    saveElectionState({
      ...state,
      members,
      nominees,
      pastTerms,
      recentlyServedIsos: getRecentlyServedIsos(state.year, pastTerms),
    });
    return removed;
  } catch (error) {
    console.error("Gagal mencopot anggota tidak tetap Dewan Keamanan:", error);
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Skor kandidat                                                       */
/* ------------------------------------------------------------------ */

function numberOrDiplomaticScore(value: unknown): number {
  if (typeof value === "number") return Math.max(0, Math.min(100, value));
  const normalized = String(value || "").toLowerCase();
  if (normalized.includes("sangat baik")) return 100;
  if (normalized.includes("baik")) return 75;
  if (normalized.includes("buruk")) return 25;
  return 50;
}

function averageBilateralScore(country: ElectionCountry, voters: ElectionCountry[], year: number): number {
  if (voters.length === 0) return 50;
  return voters.reduce(
    (total, voter) => total + getRelationValue(voter.name, country.name, year),
    0
  ) / voters.length;
}

function candidateBaseScore(
  country: ElectionCountry,
  voters: ElectionCountry[],
  year: number,
  bonus: { reputation: number; softPower: number } | undefined
): number {
  const profile = country.profile;
  const reputation = numberOrDiplomaticScore(profile?.reputasi_diplomatik) + (bonus?.reputation || 0);
  const influence = profile?.pengaruh_global || 0;
  const contribution = Math.max(0, Math.min(100,
    profile?.kontribusi_pbb ??
    ((profile?.misi_perdamaian || 0) + (profile?.bantuan_kemanusiaan || 0)) / 2
  ));
  const softPower = (profile?.kekuatan_lunak || 0) + (bonus?.softPower || 0);
  const bilateral = averageBilateralScore(country, voters, year);
  return Math.max(0, Math.min(100,
    (reputation * 0.30) +
    (influence * 0.25) +
    (contribution * 0.20) +
    (softPower * 0.15) +
    (bilateral * 0.10)
  ));
}

const toCandidate = (country: ElectionCountry, score: number): ElectionCandidate => ({
  name: country.name,
  iso: country.iso,
  slug: country.slug,
  region: country.region,
  score,
  votes: 0,
  campaignCount: 0,
  contributionScore: 0,
});

/* ------------------------------------------------------------------ */
/* Tahapan pemilu                                                      */
/* ------------------------------------------------------------------ */

export function addPlayerNomination(
  state: SecurityCouncilElectionState,
  player: ElectionCountry,
  voters: ElectionCountry[]
): SecurityCouncilElectionState {
  if (
    state.phase !== "nomination" ||
    isIneligibleElectionCandidate(state.members, player.iso, state.recentlyServedIsos) ||
    state.nominees.some(candidate => candidate.slug === player.slug)
  ) return state;
  if (!(COHORT_SEATS[state.cohort][player.region] || 0)) return state;

  const score = candidateBaseScore(player, voters, state.year, state.permanentBonuses[player.slug]);
  return { ...state, nominees: [...state.nominees, toCandidate(player, score)] };
}

export function beginElectionCampaign(
  state: SecurityCouncilElectionState,
  countries: ElectionCountry[],
  voters: ElectionCountry[]
): SecurityCouncilElectionState {
  if (state.phase !== "nomination") return state;

  const blocked = (iso: string) =>
    isIneligibleElectionCandidate(state.members, iso, state.recentlyServedIsos);
  const nominees = state.nominees.filter(candidate => !blocked(candidate.iso));
  // Kandidat NPC hanya boleh berasal dari anggota PBB (bukan wilayah non-anggota).
  const memberIsos = new Set(voters.map(voter => voter.iso));

  (Object.keys(COHORT_SEATS[state.cohort]) as CouncilRegion[]).forEach(region => {
    const seats = COHORT_SEATS[state.cohort][region] || 0;
    const occupied = new Set(nominees.filter(candidate => candidate.region === region).map(candidate => candidate.slug));
    const pool = countries
      .filter(country =>
        country.region === region &&
        memberIsos.has(country.iso) &&
        !blocked(country.iso) &&
        !occupied.has(country.slug)
      )
      .map(country => ({
        country,
        score: candidateBaseScore(country, voters, state.year, state.permanentBonuses[country.slug]),
        selectionRank: hash(`${state.year}_${state.cohort}_${region}_${country.iso}`),
      }))
      .sort((a, b) => a.selectionRank - b.selectionRank || a.country.iso.localeCompare(b.country.iso))
      .slice(0, Math.max(seats * 3, seats + 1))
      .sort((a, b) => b.score - a.score || a.country.iso.localeCompare(b.country.iso));
    nominees.push(...pool.map(({ country, score }) => toCandidate(country, score)));
  });

  return { ...state, nominees, phase: "campaign" };
}

export function campaignForCandidate(
  state: SecurityCouncilElectionState,
  playerSlug: string
): SecurityCouncilElectionState {
  if (state.phase !== "campaign") return state;
  const nominees = state.nominees.filter(candidate =>
    !isIneligibleElectionCandidate(state.members, candidate.iso, state.recentlyServedIsos));
  let changed = nominees.length !== state.nominees.length;
  const updatedNominees = nominees.map(candidate => {
    if (candidate.slug !== playerSlug || candidate.campaignCount >= 3) return candidate;
    changed = true;
    return {
      ...candidate,
      campaignCount: candidate.campaignCount + 1,
      contributionScore: candidate.contributionScore + 25,
      score: Math.min(100, candidate.score + 5),
    };
  });
  return changed ? { ...state, nominees: updatedNominees } : state;
}

function calculateElectionVotes(
  state: SecurityCouncilElectionState,
  voters: ElectionCountry[]
): ElectionCandidate[] {
  const nominees = state.nominees
    .filter(candidate =>
      !isIneligibleElectionCandidate(state.members, candidate.iso, state.recentlyServedIsos))
    .map(candidate => ({ ...candidate, votes: 0 }));
  const voteCounts = new Map<string, number>(nominees.map(candidate => [candidate.slug, 0]));
  const votableNominees = nominees.filter(candidate => COHORT_SEATS[state.cohort][candidate.region]);
  const regions = [...new Set(votableNominees.map(candidate => candidate.region))];

  voters.forEach(voter => {
    regions.forEach(region => {
      const seats = COHORT_SEATS[state.cohort][region] || 0;
      votableNominees
        .filter(candidate => candidate.region === region)
        .map(candidate => ({
          candidate,
          score:
            (candidate.score * 0.55) +
            (getRelationValue(voter.name, candidate.name, state.year) * 0.45) +
            ((hash(`${state.year}_${voter.iso}_${candidate.iso}`) % 2001) / 100),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, seats)
        .forEach(({ candidate }) => {
          voteCounts.set(candidate.slug, (voteCounts.get(candidate.slug) || 0) + 1);
        });
    });
  });

  return nominees.map(candidate => ({ ...candidate, votes: voteCounts.get(candidate.slug) || 0 }));
}

export function updateElectionVoteTally(
  state: SecurityCouncilElectionState,
  voters: ElectionCountry[],
  day: number
): SecurityCouncilElectionState {
  if (state.phase !== "voting" || voters.length !== 193 || day < 25 || day > 30) return state;
  const votingDaysElapsed = Math.min(6, Math.max(1, Math.floor(day) - 24));
  const voterCount = Math.ceil(voters.length * votingDaysElapsed / 6);
  const participatingVoters = [...voters]
    .sort((a, b) =>
      hash(`${state.year}_${a.iso}_ballot`) - hash(`${state.year}_${b.iso}_ballot`) ||
      a.iso.localeCompare(b.iso))
    .slice(0, voterCount);
  return { ...state, nominees: calculateElectionVotes(state, participatingVoters) };
}

export function resolveElection(
  state: SecurityCouncilElectionState,
  voters: ElectionCountry[]
): SecurityCouncilElectionState {
  if ((state.phase !== "campaign" && state.phase !== "voting") || voters.length !== 193) return state;

  const updatedNominees = calculateElectionVotes(state, voters);
  const winners: ElectionCandidate[] = [];

  (Object.keys(COHORT_SEATS[state.cohort]) as CouncilRegion[]).forEach(region => {
    const seats = COHORT_SEATS[state.cohort][region] || 0;
    const regionWinners = updatedNominees
      .filter(candidate => candidate.region === region)
      .sort((a, b) => b.votes - a.votes || b.score - a.score || a.iso.localeCompare(b.iso))
      .slice(0, seats);

    // Jika kandidat kurang dari jumlah kursi, isi kursi kosong agar roster tetap 10 anggota.
    const missing = seats - regionWinners.length;
    if (missing > 0) {
      const taken = new Set(regionWinners.map(candidate => candidate.iso));
      const fillers = voters
        .filter(voter =>
          voter.region === region &&
          !taken.has(voter.iso) &&
          !isIneligibleElectionCandidate(state.members, voter.iso, state.recentlyServedIsos))
        .sort((a, b) =>
          hash(`${state.year}_fill_${a.iso}`) - hash(`${state.year}_fill_${b.iso}`) ||
          a.iso.localeCompare(b.iso))
        .slice(0, missing)
        .map(voter => toCandidate(voter, 0));
      updatedNominees.push(...fillers);
      regionWinners.push(...fillers);
    }
    winners.push(...regionWinners);
  });

  // Anggota yang masa jabatannya habis tahun ini → dicatat ke pastTerms (INI inti perbaikan bug).
  const departing = state.members.filter(member => member.termEndYear <= state.year);
  const remaining = state.members.filter(member => member.termEndYear > state.year);
  const pastTerms = mergePastTerms(
    state.pastTerms,
    departing.map(member => ({ iso: member.iso, termEndYear: member.termEndYear }))
  );

  const newMembers: SecurityCouncilMember[] = winners.map(winner => ({
    name: winner.name,
    iso: winner.iso,
    region: winner.region,
    cohort: state.cohort,
    termStartYear: state.year + 1,
    termEndYear: state.year + 2,
    vetoUsed: false,
  }));

  const historyItem: ElectionHistoryItem = {
    year: state.year,
    cohort: state.cohort,
    winners: winners.map(winner => winner.name),
    winnerIsos: winners.map(winner => toIso(winner.iso)),
    votes: Object.fromEntries(updatedNominees.map(candidate => [candidate.slug, candidate.votes])),
  };

  const permanentBonuses = { ...state.permanentBonuses };
  winners.forEach(winner => {
    permanentBonuses[winner.slug] = {
      reputation: (permanentBonuses[winner.slug]?.reputation || 0) + 25,
      softPower: (permanentBonuses[winner.slug]?.softPower || 0) + 15,
    };
  });

  const nextElectionYear = state.year + 1;
  return {
    ...state,
    phase: "completed",
    scheduleStage: 4,
    nextElectionYear,
    nominees: updatedNominees,
    members: [...remaining, ...newMembers],
    pastTerms,
    recentlyServedIsos: getRecentlyServedIsos(nextElectionYear, pastTerms),
    history: [...state.history, historyItem],
    permanentBonuses,
  };
}

/* ------------------------------------------------------------------ */
/* Jadwal otomatis                                                     */
/* ------------------------------------------------------------------ */

const ELECTION_SCHEDULE = [
  { day: 1, stage: 1, titleKey: "nominationTitle", messageKey: "nominationMessage" },
  { day: 15, stage: 2, titleKey: "campaignTitle", messageKey: "campaignMessage" },
  { day: 25, stage: 3, titleKey: "votingTitle", messageKey: "votingMessage" },
  { day: 30, stage: 4, titleKey: "resultsTitle", messageKey: "resultsMessage" },
] as const;

export interface ElectionScheduleResult {
  state: SecurityCouncilElectionState;
  notifications: NotificationMessage[];
  error?: string;
}

function createElectionScheduleNotification(
  year: number,
  stage: number,
  dateStr: string,
  election?: SecurityCouncilElectionState
): NotificationMessage {
  const schedule = ELECTION_SCHEDULE[stage - 1];
  const translationPrefix = "side_inbox.notificationMessages.securityCouncilElection";
  const titleKey = `${translationPrefix}.${schedule.titleKey}`;
  const messageKey = `${translationPrefix}.${schedule.messageKey}`;
  const winners = election?.history.at(-1)?.winners.join(", ") ||
    getDefaultInboxText(`${translationPrefix}.noResults`);
  return {
    id: `pbb-security-election-${year}-${stage}`,
    title: getDefaultInboxText(titleKey),
    titleKey,
    sender: getDefaultInboxText(`${translationPrefix}.sender`),
    senderKey: `${translationPrefix}.sender`,
    ...createInboxNotificationText(messageKey, {
      year,
      winners,
      startYear: year + 1,
      endYear: year + 2,
    }),
    timestamp: dateStr,
    type: "peringkat",
    value: 0,
    hideValue: true,
    isRead: false,
    priority: "critical",
  };
}

/** Baca state dari localStorage (satu-satunya sumber kebenaran). Null jika kosong / dari sesi lain. */
export function readStoredElectionState(): SecurityCouncilElectionState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SECURITY_COUNCIL_ELECTION_STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return isElectionStateFromCurrentSession(parsed)
      ? normalizeElectionState(parsed, getCurrentElectionYear())
      : null;
  } catch (error) {
    console.error("Gagal membaca state pemilu Dewan Keamanan:", error);
    return null;
  }
}

/** Tulis state ke localStorage lalu beri tahu panel / komponen lain. */
export function persistElectionState(state: SecurityCouncilElectionState): void {
  if (typeof window === "undefined") return;
  try {
    const serialized = JSON.stringify(state);
    if (localStorage.getItem(SECURITY_COUNCIL_ELECTION_STATE_KEY) === serialized) return;
    localStorage.setItem(SECURITY_COUNCIL_ELECTION_STATE_KEY, serialized);
    window.dispatchEvent(new CustomEvent("pbb_security_council_election_updated"));
  } catch (error) {
    console.error("Gagal menyimpan state pemilu Dewan Keamanan:", error);
  }
}

/**
 * Inisialisasi state pemilu untuk `year`.
 * Prioritas: localStorage sesi ini -> data tersimpan (`saved`, mis. dari countryDetail) -> default.
 * Data dari sesi lain (sebelum refresh) otomatis diabaikan oleh normalizeElectionState.
 */
export function loadSecurityCouncilElectionState(
  year: number,
  saved?: unknown
): SecurityCouncilElectionState {
  return normalizeElectionState(readStoredElectionState() ?? saved, year);
}

/**
 * Maju MAKSIMAL SATU tahap per panggilan.
 * Jika tanggal game melompati bulan Juni, tahap nominasi -> kampanye -> voting -> hasil
 * berjalan di panggilan/hari berurutan, sehingga daftar kandidat sempat tampil sebelum hasil.
 * localStorage dipakai sebagai sumber kebenaran tunggal (argumen `existing` hanya cadangan).
 */
export function tickSecurityCouncilElectionSchedule(
  dateStr: string,
  existing: unknown,
  profiles: CountryProfile[]
): ElectionScheduleResult | null {
  const date = new Date(`${dateStr}T00:00:00`);
  if (!Number.isFinite(date.getTime())) return null;

  const year = date.getFullYear();
  const source = readStoredElectionState() ??
    (isElectionStateFromCurrentSession(existing) ? existing : null);
  let state = normalizeElectionState(source, year);
  if (!source) {
    persistElectionState(state);
    return { state, notifications: [] };
  }
  if (state.phase === "completed") {
    persistElectionState(state); // menyimpan hasil rollover tahun baru bila ada
    return null;
  }

  const electionOverdue = year > state.year || (year === state.year && date.getMonth() > 5);
  const isElectionMonth = year === state.year && date.getMonth() === 5;
  if (!electionOverdue && !isElectionMonth) return null;

  const targetStage = electionOverdue
    ? ELECTION_SCHEDULE.length
    : ELECTION_SCHEDULE.reduce(
      (stage, item) => (date.getDate() >= item.day ? item.stage : stage),
      0
    );
  if (targetStage === 0) return null;

  const notifications: NotificationMessage[] = [];
  const nextStage = state.scheduleStage + 1;
  const isVotingPeriod = isElectionMonth && date.getDate() >= 25 && date.getDate() <= 30;
  const willResolve = nextStage === ELECTION_SCHEDULE.length && nextStage <= targetStage;
  const voters = willResolve || isVotingPeriod ? getEligibleUNMemberCountries(profiles) : null;

  if (voters && (voters.length !== 193 || voters.filter(country => country.profile).length !== 193)) {
    const profiledVoters = voters.filter(country => country.profile).length;
    return {
      state,
      notifications,
      error: `Pemilihan belum dapat dihitung: tersedia ${profiledVoters} profil dari 193 negara pemilih.`,
    };
  }

  if (nextStage <= targetStage) {
    if (nextStage === 1) {
      state = { ...state, phase: "nomination", nominees: [] };
    } else if (nextStage === 2) {
      state = beginElectionCampaign(
        state,
        getSecurityCouncilElectionCandidateCountries(profiles),
        getEligibleUNMemberCountries(profiles)
      );
      if (state.phase !== "campaign") {
        return { state, notifications, error: "Kampanye pemilihan tidak dapat dimulai dari tahap nominasi." };
      }
    } else if (nextStage === 3) {
      if (state.phase !== "campaign") {
        return { state, notifications, error: "Pemungutan suara ditunda karena tahap kampanye belum selesai." };
      }
      state = { ...state, phase: "voting" };
    } else if (nextStage === 4) {
      state = resolveElection(state, voters || []);
      if (state.phase !== "completed") {
        return { state, notifications, error: "Hasil pemilihan Dewan Keamanan gagal dihitung." };
      }
    }

    state = { ...state, scheduleStage: nextStage };
    const notificationDate =
      `${state.year}-06-${String(ELECTION_SCHEDULE[nextStage - 1].day).padStart(2, "0")}`;
    notifications.push(createElectionScheduleNotification(state.year, nextStage, notificationDate, state));
  }

  if (isVotingPeriod && state.phase === "voting") {
    state = updateElectionVoteTally(state, voters || [], date.getDate());
  }

  persistElectionState(state);
  return { state, notifications };
}