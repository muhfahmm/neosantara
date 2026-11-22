import { COUNTRIES_DATA } from "@/app/page/map_system/map-data";
import { getCurrentGameDateString } from "@/app/logic/gameSessionState";
import { getRelationValue } from "../../../../../../../../../../json/4_database_hubungan_antar_negara/relationsRegistry";
import type { CountryProfile } from "@/../../json/semua_fitur_negara/0_profiles";
import { createInboxNotificationText, getDefaultInboxText } from "@/app/page/menus/inbox/logic/notificationMessage";
import type { NotificationMessage } from "@/app/page/menus/inbox/logic/1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic";

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

export interface SecurityCouncilElectionState {
  year: number;
  nextElectionYear: number;
  cohort: "A" | "B";
  phase: "nomination" | "campaign" | "voting" | "completed";
  scheduleStage: number;
  nominees: ElectionCandidate[];
  members: SecurityCouncilMember[];
  recentlyServedIsos: string[];
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

export const SECURITY_COUNCIL_ELECTION_STATE_KEY = "neosantara_pbb_security_council_election";

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

export function isPermanentSecurityCouncilMember(iso: string): boolean {
  const normalizedIso = iso.toLowerCase();
  return PERMANENT_SECURITY_COUNCIL_MEMBERS.some(member => member.iso === normalizedIso);
}

export function isIneligibleElectionCandidate(
  members: SecurityCouncilMember[],
  iso: string,
  recentlyServedIsos: string[] = [],
): boolean {
  const normalizedIso = iso.trim().toLowerCase();
  return isPermanentSecurityCouncilMember(normalizedIso) ||
    members.some(member => member.iso.trim().toLowerCase() === normalizedIso) ||
    recentlyServedIsos.some(memberIso => memberIso.trim().toLowerCase() === normalizedIso);
}

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
  "hong kong",
  "makau",
  "taiwan",
  "kosovo",
  "vatikan",
  "gibraltar",
  "kepulauan faroe",
  "bermuda",
  "greenland",
  "puerto rico",
  "guam",
  "samoa amerika",
  "tahiti",
  "mayotte",
  "reunion",
  "guadeloupe",
  "martinique",
  "bonaire sint eustatius dan saba",
  "palestina",
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

const normalizeName = (value: string) =>
  value.toLocaleLowerCase("id-ID").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ").trim();

const normalizeSlug = (value: string) => normalizeName(value).replace(/\s+/g, "-");

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
    return [{
      name: country.country,
      iso: country.iso.toLowerCase(),
      slug: profilesByName.get(normalizedName)?.country_slug || normalizeSlug(country.country),
      region,
      profile: profilesByName.get(normalizedName) || null,
    }];
  });
}

export function getEligibleUNMemberCountries(
  profiles: CountryProfile[] = []
): ElectionCountry[] {
  return getElectionCountries(profiles, false);
}

export function getSecurityCouncilElectionCandidateCountries(
  profiles: CountryProfile[] = []
): ElectionCountry[] {
  return getElectionCountries(profiles, true);
}

function getRecentlyServedIsos(
  electionYear: number,
  history: ElectionHistoryItem[],
  members: SecurityCouncilMember[],
): string[] {
  const previousElectionYear = electionYear - 1;
  const previousCohort = previousElectionYear % 2 === 0 ? "A" : "B";
  const servedDuringPreviousYear = members
    .filter(member =>
      member.termStartYear <= previousElectionYear &&
      member.termEndYear >= previousElectionYear
    )
    .map(member => member.iso.toLowerCase());
  const previousRosterElection = history.find(item =>
    item.year === electionYear - 3 && item.cohort === previousCohort
  );
  let departedIsos: string[];
  if (previousRosterElection) {
    const recentlyServed = new Set(
      (previousRosterElection.winnerIsos || [])
        .filter(iso => typeof iso === "string")
        .map(iso => iso.toLowerCase())
    );
    if (recentlyServed.size === 0) {
      const countryIsos = new Map(
        getSecurityCouncilElectionCandidateCountries()
          .map(country => [normalizeName(country.name), country.iso])
      );
      previousRosterElection.winners.forEach(name => {
        const iso = countryIsos.get(normalizeName(name));
        if (iso) recentlyServed.add(iso);
      });
    }
    departedIsos = [...recentlyServed];
  } else {
    departedIsos = INITIAL_MEMBERS
      .filter(member => member.cohort === previousCohort)
      .map(member => member.iso.toLowerCase());
  }

  return [...new Set([...servedDuringPreviousYear, ...departedIsos])];
}

export function createInitialElectionState(year: number): SecurityCouncilElectionState {
  const electionYear = year + 1;
  const cohort: "A" | "B" = electionYear % 2 === 0 ? "A" : "B";
  const members = INITIAL_MEMBERS.map(member => {
    const termEndYear = electionYear + (member.cohort === cohort ? 0 : 1);
    return {
      ...member,
      termStartYear: Math.min(year, termEndYear - 1),
      termEndYear,
    };
  });
  return {
    year: electionYear,
    nextElectionYear: electionYear,
    cohort,
    phase: "nomination",
    scheduleStage: 0,
    nominees: [],
    members,
    recentlyServedIsos: getRecentlyServedIsos(electionYear, [], members),
    history: [],
    permanentBonuses: {},
  };
}

export function normalizeElectionState(
  existing: unknown,
  year: number
): SecurityCouncilElectionState {
  const fallback = createInitialElectionState(year);
  if (!existing || typeof existing !== "object") return fallback;
  const state = existing as Partial<SecurityCouncilElectionState>;
  const storedMembers = state.members;
  if (!Array.isArray(storedMembers) || storedMembers.length !== 10) return fallback;
  const hasElectionYear = Number.isInteger(state.year);
  const hasNextElectionYear = Number.isInteger(state.nextElectionYear);
  const history = Array.isArray(state.history) ? state.history : [];
  const storedElectionYear = hasElectionYear
    ? Number(state.year)
    : Number(state.nextElectionYear) || year + 1;
  const initialTermYear = Math.min(...storedMembers
    .map(member => member.termStartYear)
    .filter((termYear): termYear is number => Number.isInteger(termYear)));
  const isUnstartedInitialElection =
    (state.phase || "nomination") === "nomination" &&
    (state.scheduleStage || 0) === 0 &&
    history.length === 0 &&
    (!Array.isArray(state.nominees) || state.nominees.length === 0);
  const migrateInitialSchedule = isUnstartedInitialElection &&
    Number.isFinite(initialTermYear) &&
    storedElectionYear > initialTermYear + 1;
  const electionYear = migrateInitialSchedule ? initialTermYear + 1 : storedElectionYear;
  const cohort: "A" | "B" = electionYear % 2 === 0 ? "A" : "B";
  const members = migrateInitialSchedule
    ? storedMembers.map(member => {
      const termEndYear = electionYear + (member.cohort === cohort ? 0 : 1);
      return {
        ...member,
        termStartYear: Math.min(initialTermYear, termEndYear - 1),
        termEndYear,
      };
    })
    : storedMembers;
  const storedRecentlyServedIsos = !migrateInitialSchedule && Array.isArray(state.recentlyServedIsos)
    ? [...new Set(state.recentlyServedIsos
      .filter((iso): iso is string => typeof iso === "string")
      .map(iso => iso.toLowerCase()))]
    : [];
  const getRecentlyServedForYear = (targetYear: number) => [...new Set([
    ...storedRecentlyServedIsos,
    ...getRecentlyServedIsos(targetYear, history, members),
  ])];
  const recentlyServedIsos = getRecentlyServedForYear(electionYear);
  const nextElectionYear = state.phase === "completed"
    ? hasNextElectionYear
      ? Number(state.nextElectionYear)
      : electionYear + 1
    : electionYear;
  if (state.phase === "completed" && year >= nextElectionYear) {
    const next = createInitialElectionState(nextElectionYear - 1);
    return {
      ...next,
      members: members.map((member, index) => {
        const defaultMember = next.members[index];
        return {
          ...member,
          termStartYear: Number.isFinite(member.termStartYear)
            ? member.termStartYear
            : defaultMember.termStartYear,
          termEndYear: Number.isFinite(member.termEndYear)
            ? member.termEndYear
            : defaultMember.termEndYear,
        };
      }),
      recentlyServedIsos: getRecentlyServedForYear(nextElectionYear),
      history,
      permanentBonuses: state.permanentBonuses || {},
    };
  }
  const nominees = Array.isArray(state.nominees)
    ? state.phase === "completed"
      ? [...state.nominees]
      : state.nominees.filter(candidate =>
        !isIneligibleElectionCandidate(members, candidate.iso, recentlyServedIsos))
    : [];
  if (state.phase === "completed") {
    const completedElection = history.at(-1);
    if (completedElection) {
      const winnerIsos = new Set(
        (completedElection.winnerIsos || []).map(iso => iso.trim().toLowerCase())
      );
      if (winnerIsos.size === 0) {
        const winnerNames = new Set(completedElection.winners.map(normalizeName));
        members.forEach(member => {
          if (winnerNames.has(normalizeName(member.name))) {
            winnerIsos.add(member.iso.trim().toLowerCase());
          }
        });
      }
      if (winnerIsos.size > 0) {
        const countriesByIso = new Map(
          getSecurityCouncilElectionCandidateCountries()
            .map(country => [country.iso.toLowerCase(), country])
        );
        members.forEach(member => {
          const iso = member.iso.trim().toLowerCase();
          if (
            !winnerIsos.has(iso) ||
            nominees.some(candidate => candidate.iso.trim().toLowerCase() === iso)
          ) return;
          const country = countriesByIso.get(iso);
          const slug = country?.slug || normalizeSlug(member.name);
          nominees.push({
            name: member.name,
            iso,
            slug,
            region: member.region,
            score: 0,
            votes: completedElection.votes[slug] || 0,
            campaignCount: 0,
            contributionScore: 0,
          });
        });
      }
    }
  }
  return {
    ...fallback,
    ...state,
    year: electionYear,
    nextElectionYear,
    cohort,
    members: members.map((member, index) => {
      const defaultMember = fallback.members[index];
      return {
        ...member,
        termStartYear: Number.isFinite(member.termStartYear)
          ? member.termStartYear
          : defaultMember.termStartYear,
        termEndYear: Number.isFinite(member.termEndYear)
          ? member.termEndYear
          : defaultMember.termEndYear,
      };
    }),
    nominees,
    recentlyServedIsos,
    scheduleStage: Number.isInteger(state.scheduleStage) ? state.scheduleStage : 0,
    phase: state.phase || "nomination",
    history,
    permanentBonuses: state.permanentBonuses || {},
  } as SecurityCouncilElectionState;
}

function getDefaultCouncilMembers(year: number): SecurityCouncilMember[] {
  return createInitialElectionState(year).members;
}

export function getStoredCouncilMembers(): SecurityCouncilMember[] {
  const currentYear = getCurrentElectionYear();
  if (typeof window === "undefined") {
    return getDefaultCouncilMembers(currentYear);
  }
  try {
    const raw = localStorage.getItem(SECURITY_COUNCIL_ELECTION_STATE_KEY);
    if (!raw) return getDefaultCouncilMembers(currentYear);
    const parsed = JSON.parse(raw) as Partial<SecurityCouncilElectionState>;
    if (
      !Array.isArray(parsed.members) ||
      parsed.members.length !== 10 ||
      parsed.members.some(member =>
        !member ||
        typeof member.name !== "string" ||
        typeof member.iso !== "string" ||
        typeof member.region !== "string" ||
        (member.cohort !== "A" && member.cohort !== "B")
      )
    ) {
      throw new Error("Data anggota tidak tetap Dewan Keamanan tidak valid.");
    }
    return normalizeElectionState(parsed, currentYear).members;
  } catch (error) {
    console.error("Gagal membaca roster Dewan Keamanan PBB:", error);
    return getDefaultCouncilMembers(currentYear);
  }
}

export function getCurrentElectionYear(): number {
  const year = Number(getCurrentGameDateString().slice(0, 4));
  return Number.isFinite(year) && year > 0 ? year : new Date().getFullYear();
}

export function getCouncilVoteMultiplier(countryIso: string, year = getCurrentElectionYear()): number {
  const member = getStoredCouncilMembers().find(
    candidate => candidate.iso.toLowerCase() === countryIso.toLowerCase()
  );
  return member && year >= member.termStartYear && year <= member.termEndYear ? 1.5 : 1;
}

export function getCouncilRoster() {
  return [
    ...PERMANENT_SECURITY_COUNCIL_MEMBERS,
    ...getStoredCouncilMembers().map(({ name, iso }) => ({ name, iso })),
  ];
}

export function isLimitedVetoAvailable(countryIso: string, resolutionId?: string): boolean {
  const member = getStoredCouncilMembers().find(
    candidate => candidate.iso.toLowerCase() === countryIso.toLowerCase()
  );
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
    const state = JSON.parse(raw) as SecurityCouncilElectionState;
    const members = state.members.map(member =>
      member.iso.toLowerCase() === countryIso.toLowerCase()
        ? { ...member, vetoUsed: true, vetoUsedOn: resolutionId }
        : member
    );
    const updated = { ...state, members };
    localStorage.setItem(SECURITY_COUNCIL_ELECTION_STATE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("pbb_security_council_roster_updated"));
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
  const searchIso = countryNameOrIso.toLowerCase().trim();

  try {
    const raw = localStorage.getItem(SECURITY_COUNCIL_ELECTION_STATE_KEY);
    const state = normalizeElectionState(raw ? JSON.parse(raw) : null, currentYear);
    
    // Cari apakah negara tersebut saat ini menjabat sebagai Anggota Tidak Tetap
    const memberIndex = state.members.findIndex(m =>
      normalizeName(m.name) === searchKey || m.iso.toLowerCase() === searchIso
    );

    if (memberIndex === -1) {
      // Periksa juga jika ada di nominees/kandidat kampanye, hapus dari nominasi
      if (state.nominees.some(n => normalizeName(n.name) === searchKey || n.iso.toLowerCase() === searchIso)) {
        const filteredNominees = state.nominees.filter(n =>
          normalizeName(n.name) !== searchKey && n.iso.toLowerCase() !== searchIso
        );
        const updatedState = { ...state, nominees: filteredNominees };
        localStorage.setItem(SECURITY_COUNCIL_ELECTION_STATE_KEY, JSON.stringify(updatedState));
        window.dispatchEvent(new CustomEvent("pbb_security_council_roster_updated"));
      }
      return null;
    }

    const removedMember = state.members[memberIndex];
    const region = removedMember.region;
    const cohort = removedMember.cohort;

    // Cari negara pengganti dari kawasan (region) yang sama untuk mengisi sisa masa jabatan
    const eligibleCountries = getEligibleUNMemberCountries([]);
    const occupiedIsos = new Set([
      ...PERMANENT_SECURITY_COUNCIL_MEMBERS.map(p => p.iso.toLowerCase()),
      ...state.members.map(m => m.iso.toLowerCase())
    ]);

    const replacementCandidate = eligibleCountries.find(c =>
      c.region === region &&
      !occupiedIsos.has(c.iso.toLowerCase()) &&
      normalizeName(c.name) !== searchKey &&
      c.iso.toLowerCase() !== searchIso
    );

    const replacementMember: SecurityCouncilMember = replacementCandidate
      ? {
          name: replacementCandidate.name,
          iso: replacementCandidate.iso,
          region,
          cohort,
          termStartYear: removedMember.termStartYear,
          termEndYear: removedMember.termEndYear,
          vetoUsed: false,
        }
      : {
          name: "Swiss",
          iso: "ch",
          region: "Eropa Barat",
          cohort,
          termStartYear: removedMember.termStartYear,
          termEndYear: removedMember.termEndYear,
          vetoUsed: false,
        };

    const newMembers = [...state.members];
    newMembers[memberIndex] = replacementMember;

    // Bersihkan juga dari calon nominasi jika ada
    const newNominees = state.nominees.filter(n =>
      normalizeName(n.name) !== searchKey && n.iso.toLowerCase() !== searchIso
    );

    const updatedState: SecurityCouncilElectionState = {
      ...state,
      members: newMembers,
      nominees: newNominees,
    };

    localStorage.setItem(SECURITY_COUNCIL_ELECTION_STATE_KEY, JSON.stringify(updatedState));
    window.dispatchEvent(new CustomEvent("pbb_security_council_roster_updated"));

    return removedMember;
  } catch (error) {
    console.error("Gagal mencopot anggota tidak tetap Dewan Keamanan:", error);
    return null;
  }
}

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

function hash(value: string): number {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
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
  const eligibleSeats = COHORT_SEATS[state.cohort][player.region] || 0;
  if (!eligibleSeats) return state;
  const bonus = state.permanentBonuses[player.slug];
  const nominees = state.nominees.filter(candidate => candidate.region !== player.region);
  const regional = state.nominees.filter(candidate => candidate.region === player.region);
  const updatedCandidate: ElectionCandidate = {
    name: player.name,
    iso: player.iso,
    slug: player.slug,
    region: player.region,
    score: candidateBaseScore(player, voters, state.year, bonus),
    votes: 0,
    campaignCount: 0,
    contributionScore: 0,
  };
  return { ...state, nominees: [...nominees, ...regional, updatedCandidate] };
}

export function beginElectionCampaign(
  state: SecurityCouncilElectionState,
  countries: ElectionCountry[],
  voters: ElectionCountry[]
): SecurityCouncilElectionState {
  if (state.phase !== "nomination") return state;
  const nominees = state.nominees.filter(candidate =>
    !isIneligibleElectionCandidate(state.members, candidate.iso, state.recentlyServedIsos));
  (Object.keys(COHORT_SEATS[state.cohort]) as CouncilRegion[]).forEach(region => {
    const seats = COHORT_SEATS[state.cohort][region] || 0;
    const occupied = nominees.filter(candidate => candidate.region === region).map(candidate => candidate.slug);
    const nomineePool = countries
      .filter(country =>
        country.region === region &&
        !isIneligibleElectionCandidate(state.members, country.iso, state.recentlyServedIsos) &&
        !occupied.includes(country.slug)
      )
      .map(country => ({
        country,
        score: candidateBaseScore(country, voters, state.year, state.permanentBonuses[country.slug]),
        selectionRank: hash(`${state.year}_${state.cohort}_${region}_${country.iso}`),
      }))
      .sort((a, b) => a.selectionRank - b.selectionRank || a.country.iso.localeCompare(b.country.iso))
      .slice(0, Math.max(seats * 3, seats + 1))
      .sort((a, b) => b.score - a.score || a.country.iso.localeCompare(b.country.iso));
    const npcNominees = nomineePool
      .map(({ country, score }) => ({
        name: country.name,
        iso: country.iso,
        slug: country.slug,
        region,
        score,
        votes: 0,
        campaignCount: 0,
        contributionScore: 0,
      }));
    nominees.push(...npcNominees);
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
  const removedIneligibleNominees = nominees.length !== state.nominees.length;
  let found = false;
  const updatedNominees = nominees.map(candidate => {
    if (candidate.slug !== playerSlug || candidate.campaignCount >= 3) return candidate;
    found = true;
    const campaignCount = candidate.campaignCount + 1;
    return {
      ...candidate,
      campaignCount,
      contributionScore: candidate.contributionScore + 25,
      score: Math.min(100, candidate.score + 5),
    };
  });
  return found || removedIneligibleNominees
    ? { ...state, nominees: updatedNominees }
    : state;
}

function calculateElectionVotes(
  state: SecurityCouncilElectionState,
  voters: ElectionCountry[]
): ElectionCandidate[] {
  const voteCounts = new Map<string, number>();
  const nominees = state.nominees
    .filter(candidate =>
      !isIneligibleElectionCandidate(state.members, candidate.iso, state.recentlyServedIsos))
    .map(candidate => {
      voteCounts.set(candidate.slug, 0);
      return { ...candidate, votes: 0 };
    });

  voters.forEach(voter => {
    const candidatesByRegion = nominees.filter(candidate =>
      COHORT_SEATS[state.cohort][candidate.region]
    );
    const regions = [...new Set(candidatesByRegion.map(candidate => candidate.region))];
    regions.forEach(region => {
      const seats = COHORT_SEATS[state.cohort][region] || 0;
      const ranked = candidatesByRegion
        .filter(candidate => candidate.region === region)
        .map(candidate => ({
          candidate,
          score:
            (candidate.score * 0.55) +
            (getRelationValue(voter.name, candidate.name, state.year) * 0.45) +
            ((hash(`${state.year}_${voter.iso}_${candidate.iso}`) % 2001) / 100),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, seats);
      ranked.forEach(({ candidate }) => {
        voteCounts.set(candidate.slug, (voteCounts.get(candidate.slug) || 0) + 1);
      });
    });
  });

  return nominees.map(candidate => ({
    ...candidate,
    votes: voteCounts.get(candidate.slug) || 0,
  }));
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
      a.iso.localeCompare(b.iso)
    )
    .slice(0, voterCount);
  return {
    ...state,
    nominees: calculateElectionVotes(state, participatingVoters),
  };
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
    winners.push(...updatedNominees
      .filter(candidate => candidate.region === region)
      .sort((a, b) => b.votes - a.votes || b.score - a.score)
      .slice(0, seats));
  });

  const recentlyServedIsos = state.members.map(member => member.iso.toLowerCase());
  const replacedMembers = state.members.filter(member => member.termEndYear > state.year);
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
    winnerIsos: winners.map(winner => winner.iso.toLowerCase()),
    votes: Object.fromEntries(updatedNominees.map(candidate => [candidate.slug, candidate.votes])),
  };
  const members = [...replacedMembers, ...newMembers];
  const permanentBonuses = { ...state.permanentBonuses };
  winners.forEach(winner => {
    permanentBonuses[winner.slug] = {
      reputation: (permanentBonuses[winner.slug]?.reputation || 0) + 25,
      softPower: (permanentBonuses[winner.slug]?.softPower || 0) + 15,
    };
  });
  return {
    ...state,
    phase: "completed",
    scheduleStage: 4,
    nextElectionYear: state.year + 1,
    nominees: updatedNominees,
    members,
    recentlyServedIsos,
    history: [...state.history, historyItem],
    permanentBonuses,
  };
}

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
  const messageParams = {
    year,
    winners,
    startYear: year + 1,
    endYear: year + 2,
  };
  return {
    id: `pbb-security-election-${year}-${stage}`,
    title: getDefaultInboxText(titleKey),
    titleKey,
    sender: getDefaultInboxText(`${translationPrefix}.sender`),
    senderKey: `${translationPrefix}.sender`,
    ...createInboxNotificationText(messageKey, messageParams),
    timestamp: dateStr,
    type: "peringkat",
    value: 0,
    hideValue: true,
    isRead: false,
    priority: "critical",
  };
}

export function tickSecurityCouncilElectionSchedule(
  dateStr: string,
  existing: unknown,
  profiles: CountryProfile[]
): ElectionScheduleResult | null {
  const date = new Date(`${dateStr}T00:00:00`);
  if (!Number.isFinite(date.getTime())) return null;

  const year = date.getFullYear();
  let state = normalizeElectionState(existing, year);
  if (!existing) return { state, notifications: [] };
  if (state.phase === "completed") return null;

  const electionOverdue = year > state.year ||
    (year === state.year && date.getMonth() > 5);
  const isElectionMonth = year === state.year && date.getMonth() === 5;
  if (!electionOverdue && !isElectionMonth) return null;
  const targetStage = electionOverdue
    ? ELECTION_SCHEDULE.length
    : ELECTION_SCHEDULE.reduce(
      (stage, item) => date.getDate() >= item.day ? item.stage : stage,
      0
    );
  if (targetStage === 0) return null;

  const notifications: NotificationMessage[] = [];
  const isVotingPeriod = isElectionMonth && date.getDate() >= 25 && date.getDate() <= 30;
  const voters = targetStage === ELECTION_SCHEDULE.length || isVotingPeriod
    ? getEligibleUNMemberCountries(profiles)
    : null;
  if (voters && (voters.length !== 193 || voters.filter(country => country.profile).length !== 193)) {
    const profiledVoters = voters.filter(country => country.profile).length;
    return {
      state,
      notifications,
      error: `Pemilihan belum dapat dihitung: tersedia ${profiledVoters} profil dari 193 negara pemilih.`,
    };
  }

  while (state.scheduleStage < targetStage) {
    const nextStage = state.scheduleStage + 1;
    if (nextStage === 1) {
      state = { ...state, phase: "nomination", nominees: [] };
    } else if (nextStage === 2) {
      const candidates = getSecurityCouncilElectionCandidateCountries(profiles);
      const voters = getEligibleUNMemberCountries(profiles);
      state = beginElectionCampaign(state, candidates, voters);
      if (state.phase !== "campaign") {
        return {
          state,
          notifications,
          error: "Kampanye pemilihan tidak dapat dimulai dari tahap nominasi.",
        };
      }
    } else if (nextStage === 3) {
      if (state.phase !== "campaign") {
        return {
          state,
          notifications,
          error: "Pemungutan suara ditunda karena tahap kampanye belum selesai.",
        };
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

  return { state, notifications };
}
