import { COUNTRIES_DATA } from "@/app/page/map_system/map-data";
import { getRelationValue } from "@/../../json/database_hubungan_antar_negara/relationsRegistry";
import type { CountryProfile } from "@/../../json/semua_fitur_negara/0_profiles";
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

export function getEligibleUNMemberCountries(
  profiles: CountryProfile[] = []
): ElectionCountry[] {
  const profilesByName = new Map(
    profiles.map(profile => [normalizeName(profile.name_id), profile])
  );
  return COUNTRIES_DATA.flatMap(country => {
    const normalizedName = normalizeName(country.country);
    if (NON_MEMBER_TERRITORIES.has(normalizedName)) return [];
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

export function createInitialElectionState(year: number): SecurityCouncilElectionState {
  const electionYear = year + 2;
  const cohort: "A" | "B" = electionYear % 2 === 0 ? "A" : "B";
  return {
    year: electionYear,
    nextElectionYear: electionYear,
    cohort,
    phase: "nomination",
    scheduleStage: 0,
    nominees: [],
    members: INITIAL_MEMBERS.map(member => ({
      ...member,
      termStartYear: year - (member.cohort === cohort ? 2 : 1),
      termEndYear: year - (member.cohort === cohort ? 1 : 0),
    })),
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
  if (!Array.isArray(state.members) || state.members.length !== 10) return fallback;
  const hasScheduledElectionYear = Number.isInteger(state.nextElectionYear);
  const nextElectionYear = hasScheduledElectionYear
    ? Number(state.nextElectionYear)
    : state.phase === "completed" && Number.isInteger(state.year)
      ? (state.year as number) + 1
      : year + 2;
  if (state.phase === "completed" && year >= nextElectionYear) {
    const next = createInitialElectionState(nextElectionYear - 2);
    return {
      ...next,
      members: state.members.map(member => ({
        ...member,
        termStartYear: Number.isFinite(member.termStartYear) ? member.termStartYear : nextElectionYear - 2,
      })),
      history: Array.isArray(state.history) ? state.history : [],
      permanentBonuses: state.permanentBonuses || {},
    };
  }
  const electionYear = hasScheduledElectionYear && Number.isInteger(state.year) && state.year! >= year
    ? state.year!
    : nextElectionYear;
  const cohort: "A" | "B" = electionYear % 2 === 0 ? "A" : "B";
  return {
      ...fallback,
      ...state,
      year: electionYear,
      nextElectionYear,
      cohort,
      members: state.members.map(member => ({
        ...member,
        termStartYear: Number.isFinite(member.termStartYear) ? member.termStartYear : year - 1,
      })),
      nominees: hasScheduledElectionYear && Array.isArray(state.nominees) ? state.nominees : [],
      scheduleStage: hasScheduledElectionYear && Number.isInteger(state.scheduleStage) ? state.scheduleStage : 0,
      phase: hasScheduledElectionYear ? state.phase || "nomination" : "nomination",
      history: Array.isArray(state.history) ? state.history : [],
      permanentBonuses: state.permanentBonuses || {},
  } as SecurityCouncilElectionState;
}

export function getStoredCouncilMembers(): SecurityCouncilMember[] {
  const currentYear = getCurrentElectionYear();
  if (typeof window === "undefined") {
    return INITIAL_MEMBERS.map(member => ({
      ...member,
      termStartYear: currentYear - 1,
      termEndYear: currentYear,
    }));
  }
  try {
    const raw = localStorage.getItem(SECURITY_COUNCIL_ELECTION_STATE_KEY);
    if (!raw) return INITIAL_MEMBERS.map(member => ({
      ...member,
      termStartYear: currentYear - 1,
      termEndYear: currentYear,
    }));
    const parsed = JSON.parse(raw) as Partial<SecurityCouncilElectionState>;
    if (!Array.isArray(parsed.members) || parsed.members.length !== 10) {
      throw new Error("Data anggota tidak tetap Dewan Keamanan tidak valid.");
    }
    return parsed.members.map(member => ({
      ...member,
      termStartYear: Number.isFinite(member.termStartYear) ? member.termStartYear : currentYear - 1,
    }));
  } catch (error) {
    console.error("Gagal membaca roster Dewan Keamanan PBB:", error);
    return INITIAL_MEMBERS.map(member => ({
      ...member,
      termStartYear: currentYear - 1,
      termEndYear: currentYear,
    }));
  }
}

export function getCurrentElectionYear(): number {
  if (typeof window !== "undefined") {
    const currentDate = localStorage.getItem("neosantara_current_game_date");
    const currentYear = Number(currentDate?.slice(0, 4));
    if (Number.isFinite(currentYear) && currentYear > 0) return currentYear;
    try {
      const save = localStorage.getItem("presiden_simulator_load_save");
      if (save) {
        const savedYear = Number(JSON.parse(save)?.game_date?.slice(0, 4));
        if (Number.isFinite(savedYear) && savedYear > 0) return savedYear;
      }
    } catch (error) {
      console.error("Gagal membaca tahun simulasi untuk status Dewan Keamanan:", error);
    }
  }
  return new Date().getFullYear();
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
  if (state.phase !== "nomination" || state.nominees.some(candidate => candidate.slug === player.slug)) return state;
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
  const nominees = [...state.nominees];
  (Object.keys(COHORT_SEATS[state.cohort]) as CouncilRegion[]).forEach(region => {
    const seats = COHORT_SEATS[state.cohort][region] || 0;
    const occupied = nominees.filter(candidate => candidate.region === region).map(candidate => candidate.slug);
    const npcNominees = countries
      .filter(country =>
        country.region === region &&
        !occupied.includes(country.slug) &&
        !state.members.some(member => member.iso === country.iso && member.cohort !== state.cohort)
      )
      .map(country => ({
        country,
        score: candidateBaseScore(country, voters, state.year, state.permanentBonuses[country.slug]),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.max(seats * 3, seats + 1))
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
  let found = false;
  const nominees = state.nominees.map(candidate => {
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
  return found ? { ...state, nominees } : state;
}

export function resolveElection(
  state: SecurityCouncilElectionState,
  voters: ElectionCountry[]
): SecurityCouncilElectionState {
  if ((state.phase !== "campaign" && state.phase !== "voting") || voters.length !== 193) return state;
  const candidateScores = new Map<string, number>();
  const voteCounts = new Map<string, number>();
  const nominees = state.nominees.map(candidate => {
    candidateScores.set(candidate.slug, candidate.score);
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

  const updatedNominees = nominees.map(candidate => ({
    ...candidate,
    votes: voteCounts.get(candidate.slug) || 0,
  }));
  const winners: ElectionCandidate[] = [];
  (Object.keys(COHORT_SEATS[state.cohort]) as CouncilRegion[]).forEach(region => {
    const seats = COHORT_SEATS[state.cohort][region] || 0;
    winners.push(...updatedNominees
      .filter(candidate => candidate.region === region)
      .sort((a, b) => b.votes - a.votes || (candidateScores.get(b.slug) || 0) - (candidateScores.get(a.slug) || 0))
      .slice(0, seats));
  });

  const replacedMembers = state.members.filter(member => member.cohort !== state.cohort);
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
    history: [...state.history, historyItem],
    permanentBonuses,
  };
}

const ELECTION_SCHEDULE = [
  { day: 1, stage: 1, title: "NOMINASI PEMILIHAN DK PBB DIBUKA" },
  { day: 15, stage: 2, title: "KAMPANYE DIPLOMATIK PEMILIHAN DK PBB DIMULAI" },
  { day: 25, stage: 3, title: "SIDANG PEMUNGUTAN SUARA ANGGOTA TIDAK TETAP DK PBB" },
  { day: 30, stage: 4, title: "HASIL PEMILIHAN ANGGOTA TIDAK TETAP DK PBB" },
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
  const notices: Record<number, string> = {
    1: `Sidang Majelis Umum PBB untuk memilih 5 dari 10 anggota tidak tetap Dewan Keamanan dibuka. Nominasi berlangsung hingga 14 Juni. Lokasi: Markas Besar PBB, New York.`,
    2: `Kampanye diplomatik telah dimulai. Negara kandidat dapat menyelesaikan kampanye hingga 24 Juni. Sidang pemungutan suara dijadwalkan pada 25 Juni di Markas Besar PBB, New York.`,
    3: `Sidang Majelis Umum PBB untuk pemungutan suara 5 kursi anggota tidak tetap dimulai. Pemungutan suara berlangsung hingga 30 Juni di Markas Besar PBB, New York.`,
    4: `Hasil pemilihan anggota tidak tetap Dewan Keamanan PBB tahun ${year}: ${election?.history.at(-1)?.winners.join(", ") || "hasil belum tersedia"}. Masa jabatan dimulai 1 Januari ${year + 1} dan berlangsung selama 2 tahun.`,
  };
  return {
    id: `pbb-security-election-${year}-${stage}`,
    title: `🗳️ ${schedule.title}`,
    sender: "Sekretariat Majelis Umum Perserikatan Bangsa-Bangsa",
    message: notices[stage],
    timestamp: dateStr,
    type: "peringkat",
    value: stage,
    isRead: false,
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
  if (date.getMonth() !== 5 || year !== state.year) return null;
  const targetStage = ELECTION_SCHEDULE.reduce(
    (stage, item) => date.getDate() >= item.day ? item.stage : stage,
    0
  );
  const notifications: NotificationMessage[] = [];

  while (state.scheduleStage < targetStage) {
    const nextStage = state.scheduleStage + 1;
    if (nextStage === 1) {
      state = { ...state, phase: "nomination", nominees: [] };
    } else if (nextStage === 2) {
      const countries = getEligibleUNMemberCountries(profiles);
      state = beginElectionCampaign(state, countries, countries);
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
      const voters = getEligibleUNMemberCountries(profiles);
      const profiledVoters = voters.filter(country => country.profile).length;
      if (voters.length !== 193 || profiledVoters !== 193) {
        return {
          state,
          notifications,
          error: `Pemilihan belum dapat dihitung: tersedia ${profiledVoters} profil dari 193 negara pemilih.`,
        };
      }
      state = resolveElection(state, voters);
      if (state.phase !== "completed") {
        return { state, notifications, error: "Hasil pemilihan Dewan Keamanan gagal dihitung." };
      }
    }

    state = { ...state, scheduleStage: nextStage };
    notifications.push(createElectionScheduleNotification(year, nextStage, dateStr, state));
  }

  return { state, notifications };
}
