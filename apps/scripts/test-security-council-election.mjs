import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import test from "node:test";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const sourcePath = fileURLToPath(new URL(
  "../src/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/2_keamanan_PBB/logika_anggota_tidak_tetap/securityCouncilElection.ts",
  import.meta.url
));
const source = await readFile(sourcePath, "utf8");
const countriesData = [];
const addCountries = (count, continent, prefix) => {
  for (let index = 0; index < count; index += 1) {
    countriesData.push({
      country: `${prefix} ${index + 1}`,
      iso: `x${String(countriesData.length).padStart(3, "0")}`,
      continent,
    });
  }
};

addCountries(50, "Africa", "Test Africa");
addCountries(40, "Asia", "Test Asia");
addCountries(10, "Oceania", "Test Oceania");
addCountries(25, "North America", "Test North America");
addCountries(20, "South America", "Test South America");
addCountries(33, "Europe", "Test Western Europe");
[
  "Albania",
  "Armenia",
  "Azerbaijan",
  "Belarus",
  "Bosnia dan Hercegovina",
  "Bulgaria",
  "Ceko",
  "Georgia",
  "Hungaria",
  "Kroasia",
  "Latvia",
  "Lithuania",
  "Moldova",
  "Montenegro",
  "Rumania",
].forEach(country => countriesData.push({
  country,
  iso: `x${String(countriesData.length).padStart(3, "0")}`,
  continent: "Europe",
}));
countriesData.push({
  country: "Taiwan",
  iso: "tw",
  continent: "Asia",
});

const countrySlug = value => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const profiles = countriesData.map(country => ({
  name_id: country.country,
  country_slug: countrySlug(country.country),
  reputasi_diplomatik: 50,
  pengaruh_global: 50,
  kontribusi_pbb: 50,
  kekuatan_lunak: 50,
}));

let gameDate = "2026-11-22";
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
    esModuleInterop: true,
  },
}).outputText;
const electionModule = { exports: {} };
const mockRequire = specifier => {
  if (specifier === "@/app/page/map_system/map-data") return { COUNTRIES_DATA: countriesData };
  if (specifier === "@/app/logic/gameSessionState") {
    return { getCurrentGameDateString: () => gameDate };
  }
  if (specifier === "@/app/page/menus/inbox/logic/notificationMessage") {
    return {
      createInboxNotificationText: (messageKey, messageParams) => ({
        message: messageKey,
        messageKey,
        messageParams,
        messageParamKeys: {},
      }),
      getDefaultInboxText: key => key,
    };
  }
  if (specifier.endsWith("/relationsRegistry")) {
    return { getRelationValue: () => 50 };
  }
  throw new Error(`Unexpected dependency in election test: ${specifier}`);
};
new Function("require", "module", "exports", compiled)(
  mockRequire,
  electionModule,
  electionModule.exports
);
const {
  createInitialElectionState,
  addPlayerNomination,
  beginElectionCampaign,
  campaignForCandidate,
  getEligibleUNMemberCountries,
  getSecurityCouncilElectionCandidateCountries,
  loadSecurityCouncilElectionState,
  getStoredCouncilMembers,
  getCouncilVoteMultiplier,
  isPermanentSecurityCouncilMember,
  isLimitedVetoAvailable,
  normalizeElectionState,
  resolveElection,
  SECURITY_COUNCIL_ELECTION_STATE_KEY,
  updateElectionVoteTally,
  tickSecurityCouncilElectionSchedule,
} = electionModule.exports;
const eligibleCountries = getEligibleUNMemberCountries(profiles);
const electionCandidates = getSecurityCouncilElectionCandidateCountries(profiles);

test("permanent Security Council members cannot nominate or enter the candidate pool", () => {
  const initial = createInitialElectionState(2026);
  const permanentCountry = {
    name: "Amerika Serikat",
    iso: "us",
    slug: "amerika-serikat",
    region: "Eropa Barat",
    profile: null,
  };

  assert.equal(isPermanentSecurityCouncilMember("US"), true);
  assert.equal(isPermanentSecurityCouncilMember("id"), false);
  assert.equal(addPlayerNomination(initial, permanentCountry, eligibleCountries), initial);
  const activeMember = {
    name: initial.members[0].name,
    iso: initial.members[0].iso,
    slug: initial.members[0].iso,
    region: initial.members[0].region,
    profile: null,
  };
  assert.equal(addPlayerNomination(initial, activeMember, eligibleCountries), initial);

  const campaign = beginElectionCampaign(
    initial,
    [permanentCountry, activeMember, ...electionCandidates],
    eligibleCountries
  );
  assert.equal(campaign.phase, "campaign");
  assert.ok(campaign.nominees.every(candidate => candidate.iso !== "us"));
  assert.ok(campaign.nominees.every(candidate => candidate.iso !== activeMember.iso));
  assert.equal(electionCandidates.length, 194);
  assert.ok(electionCandidates.some(country => country.iso === "tw"));

  const legacyPermanentNomination = {
    ...permanentCountry,
    votes: 0,
    campaignCount: 0,
    contributionScore: 0,
    score: 100,
  };
  assert.deepEqual(normalizeElectionState({
    ...initial,
    nominees: [legacyPermanentNomination, {
      ...activeMember,
      votes: 0,
      campaignCount: 0,
      contributionScore: 0,
      score: 100,
    }],
  }, initial.year).nominees, []);
  const results = resolveElection({
    ...initial,
    phase: "voting",
    nominees: [legacyPermanentNomination, {
      ...activeMember,
      votes: 0,
      campaignCount: 0,
      contributionScore: 0,
      score: 100,
    }],
  }, eligibleCountries);
  assert.ok(results.nominees.every(candidate => candidate.iso !== "us"));
  assert.ok(results.nominees.every(candidate => candidate.iso !== activeMember.iso));
  assert.ok(results.history.at(-1).winners.every(name => name !== permanentCountry.name));
  assert.ok(results.history.at(-1).winners.every(name => name !== activeMember.name));
});

const localStorageValues = new Map();
globalThis.localStorage = {
  getItem: key => localStorageValues.get(key) ?? null,
  setItem: (key, value) => localStorageValues.set(key, String(value)),
  removeItem: key => localStorageValues.delete(key),
};
globalThis.window = {};

test("saved election state is restored instead of replaced by fallback state", () => {
  const fallback = createInitialElectionState(2026);
  const saved = {
    ...fallback,
    phase: "campaign",
    scheduleStage: 1,
    members: fallback.members.map((member, index) =>
      index === 0 ? { ...member, name: "Persisted member" } : member
    ),
  };
  localStorageValues.set(SECURITY_COUNCIL_ELECTION_STATE_KEY, JSON.stringify(saved));

  const restored = loadSecurityCouncilElectionState(2026, fallback);
  assert.equal(restored.phase, "campaign");
  assert.equal(restored.scheduleStage, 1);
  assert.equal(restored.members[0].name, "Persisted member");

  localStorageValues.set(
    SECURITY_COUNCIL_ELECTION_STATE_KEY,
    JSON.stringify(createInitialElectionState(2025))
  );
  assert.equal(loadSecurityCouncilElectionState(2026, fallback).year, fallback.year);
  localStorageValues.clear();
});

test("saved state from an earlier browser session falls back to the default roster", () => {
  const fallback = createInitialElectionState(2026);
  localStorageValues.set(SECURITY_COUNCIL_ELECTION_STATE_KEY, JSON.stringify({
    ...fallback,
    sessionId: "previous-browser-session",
    members: fallback.members.map((member, index) =>
      index === 0 ? { ...member, name: "Stale member" } : member
    ),
  }));

  assert.deepEqual(
    loadSecurityCouncilElectionState(2026, fallback).members.map(member => member.iso),
    ["za", "eg", "in", "mx", "au", "ke", "id", "br", "de", "pl"]
  );
  localStorageValues.clear();
});

test("new-game schedule and initial cohort terms remain fixed", () => {
  const initial = createInitialElectionState(2026);
  assert.equal(initial.year, 2027);
  assert.equal(initial.nextElectionYear, 2027);
  assert.equal(initial.cohort, "B");
  assert.equal(eligibleCountries.length, 193);
  assert.equal(electionCandidates.length, 194);
  assert.deepEqual(
    new Set(initial.recentlyServedIsos),
    new Set(initial.members.map(member => member.iso))
  );

  for (const member of initial.members) {
    assert.equal(member.termStartYear, 2026);
    assert.equal(member.termEndYear, member.cohort === "B" ? 2027 : 2028);
  }
  assert.equal(normalizeElectionState(initial, 2027).year, 2027);
  assert.equal(tickSecurityCouncilElectionSchedule("2026-06-30", initial, profiles), null);
  const firstElection = tickSecurityCouncilElectionSchedule("2027-06-30", initial, profiles);
  assert.ok(firstElection);
  assert.equal(firstElection.state.phase, "completed");
});

test("legacy unstarted elections migrate to one year after the initial roster", () => {
  const initial = createInitialElectionState(2026);
  const legacyState = {
    ...initial,
    year: 2028,
    nextElectionYear: 2028,
    cohort: "A",
    members: initial.members.map(member => ({
      ...member,
      termEndYear: member.cohort === "A" ? 2028 : 2029,
    })),
  };
  const migrated = normalizeElectionState(legacyState, 2026);

  assert.equal(migrated.year, 2027);
  assert.equal(migrated.cohort, "B");
  assert.ok(migrated.members.filter(member => member.cohort === "B")
    .every(member => member.termEndYear === 2027));
  assert.ok(migrated.members.filter(member => member.cohort === "A")
    .every(member => member.termEndYear === 2028));
});

test("a new game in 2027 schedules cohort A for 2028", () => {
  const initial = createInitialElectionState(2027);
  assert.equal(initial.year, 2028);
  assert.equal(initial.cohort, "A");
});

test("automatic candidate pools vary by election year and remain deterministic", () => {
  const firstPool = beginElectionCampaign(
    createInitialElectionState(2026),
    eligibleCountries,
    eligibleCountries
  ).nominees.map(candidate => candidate.slug);
  const nextPool = beginElectionCampaign(
    createInitialElectionState(2027),
    eligibleCountries,
    eligibleCountries
  ).nominees.map(candidate => candidate.slug);
  const repeatedPool = beginElectionCampaign(
    createInitialElectionState(2026),
    eligibleCountries,
    eligibleCountries
  ).nominees.map(candidate => candidate.slug);

  assert.notDeepEqual(firstPool, nextPool);
  assert.deepEqual(firstPool, repeatedPool);
});

test("daily voting tallies grow until all voters have participated", () => {
  const campaign = beginElectionCampaign(
    createInitialElectionState(2026),
    eligibleCountries,
    eligibleCountries
  );
  const voting = { ...campaign, phase: "voting" };
  let previousVotes = 0;

  for (let day = 25; day <= 30; day += 1) {
    const updated = updateElectionVoteTally(voting, eligibleCountries, day);
    const totalVotes = updated.nominees.reduce((total, candidate) => total + candidate.votes, 0);
    assert.ok(totalVotes > previousVotes);
    previousVotes = totalVotes;
    if (day === 30) {
      const finalResult = resolveElection(voting, eligibleCountries);
      assert.deepEqual(updated.nominees, finalResult.nominees);
    }
  }
});

test("scheduled voting updates daily and completes automatically on June 30", () => {
  const initial = createInitialElectionState(2026);
  const nomination = tickSecurityCouncilElectionSchedule("2027-06-01", initial, profiles);
  assert.ok(nomination);
  const campaign = tickSecurityCouncilElectionSchedule("2027-06-15", nomination.state, profiles);
  assert.ok(campaign);

  let state = campaign.state;
  let previousVotes = 0;
  for (let day = 25; day < 30; day += 1) {
    const result = tickSecurityCouncilElectionSchedule(`2027-06-${day}`, state, profiles);
    assert.ok(result);
    assert.equal(result.error, undefined);
    assert.equal(result.state.phase, "voting");
    const totalVotes = result.state.nominees.reduce((total, candidate) => total + candidate.votes, 0);
    assert.ok(totalVotes > previousVotes);
    previousVotes = totalVotes;
    state = result.state;
  }

  const results = tickSecurityCouncilElectionSchedule("2027-06-30", state, profiles);
  assert.ok(results);
  assert.equal(results.state.phase, "completed");
  assert.equal(results.notifications.length, 1);
  assert.equal(results.notifications[0].timestamp, "2027-06-30");

  const formerMember = campaign.state.members.find(member =>
    member.cohort === campaign.state.cohort
  );
  const formerCountry = {
    name: formerMember.name,
    iso: formerMember.iso,
    slug: countrySlug(formerMember.name),
    region: formerMember.region,
    profile: null,
  };
  const nextElection = normalizeElectionState(results.state, results.state.nextElectionYear);
  assert.ok(nextElection.recentlyServedIsos.includes(formerMember.iso));
  assert.equal(addPlayerNomination(nextElection, formerCountry, eligibleCountries), nextElection);
  const staleCampaign = campaignForCandidate({
    ...nextElection,
    phase: "campaign",
    nominees: [{
      ...formerCountry,
      score: 100,
      votes: 0,
      campaignCount: 0,
      contributionScore: 0,
    }],
  }, formerCountry.slug);
  assert.deepEqual(staleCampaign.nominees, []);
});

test("fallback roster is active in its current and following election years", () => {
  gameDate = "2026-11-22";
  localStorageValues.clear();
  const fallbackMembers = createInitialElectionState(2026).members;

  delete globalThis.window;
  assert.deepEqual(getStoredCouncilMembers(), fallbackMembers);
  globalThis.window = {};
  assert.deepEqual(getStoredCouncilMembers(), fallbackMembers);

  for (const year of [2026, 2027, 2028]) {
    gameDate = `${year}-11-22`;
    assert.equal(getCouncilVoteMultiplier("za", year), 1.5);
    assert.equal(getCouncilVoteMultiplier("ke", year), 1.5);
    assert.equal(isLimitedVetoAvailable("za"), true);
    assert.equal(isLimitedVetoAvailable("ke"), true);
  }
});

test("completed election preserves the other cohort and prepares next year's election", () => {
  const initial = createInitialElectionState(2026);
  const nominees = [
    ["Candidate Africa", "ca1", "Afrika"],
    ["Candidate Asia", "ca3", "Asia-Pasifik"],
    ["Candidate Latin", "ca4", "Amerika Latin & Karibia"],
    ["Candidate Europe", "ca5", "Eropa Barat"],
    ["Candidate Eastern Europe", "ca6", "Eropa Timur"],
  ].map(([name, slug, region]) => ({
    name,
    iso: slug,
    slug,
    region,
    score: 80,
    votes: 0,
    campaignCount: 0,
    contributionScore: 0,
  }));
  const completed = resolveElection(
    { ...initial, phase: "campaign", nominees },
    eligibleCountries
  );

  assert.equal(completed.phase, "completed");
  assert.equal(completed.history.at(-1).winnerIsos.length, 5);
  assert.ok(completed.history.at(-1).winnerIsos.every(iso =>
    !initial.members.some(member => member.iso === iso)
  ));
  const winnerIsos = new Set(completed.history.at(-1).winnerIsos);
  const persistedResults = {
    ...completed,
    nominees: completed.nominees.filter(candidate => !winnerIsos.has(candidate.iso)),
  };
  const reloadedResults = normalizeElectionState(persistedResults, completed.year);
  assert.equal(reloadedResults.phase, "completed");
  assert.deepEqual(
    new Set(reloadedResults.nominees
      .filter(candidate => winnerIsos.has(candidate.iso))
      .map(candidate => candidate.iso)),
    winnerIsos
  );
  assert.equal(completed.nextElectionYear, 2028);
  assert.equal(completed.members.filter(member => member.cohort === "A").length, 5);
  assert.equal(completed.members.filter(member => member.cohort === "B").length, 5);
  assert.ok(completed.members.filter(member => member.cohort === "B")
    .every(member => member.termStartYear === 2028 && member.termEndYear === 2029));
  assert.ok(completed.members.filter(member => member.cohort === "A")
    .every(member => member.termEndYear === 2028));

  const nextElection = normalizeElectionState(completed, 2029);
  assert.equal(nextElection.year, 2028);
  assert.equal(nextElection.cohort, "A");
  assert.deepEqual(nextElection.members, completed.members);
  assert.equal(nextElection.history.length, 1);
});

test("election replaces seats by term end year rather than cohort label", () => {
  const initial = createInitialElectionState(2026);
  const expiringMember = initial.members.find(member =>
    member.cohort === initial.cohort
  );
  const continuingMember = initial.members.find(member =>
    member.cohort !== initial.cohort
  );
  const members = initial.members.map(member => {
    if (member.iso === expiringMember.iso) return { ...member, cohort: "B" };
    if (member.iso === continuingMember.iso) return { ...member, cohort: "A" };
    return member;
  });
  const nominees = beginElectionCampaign(
    initial,
    eligibleCountries,
    eligibleCountries
  ).nominees;
  const completed = resolveElection(
    { ...initial, members, phase: "campaign", nominees },
    eligibleCountries
  );

  assert.equal(completed.history.at(-1).winnerIsos.length, 5);
  assert.ok(!completed.members.some(member => member.iso === expiringMember.iso));
  assert.ok(completed.members.some(member => member.iso === continuingMember.iso));
});

test("countries whose terms ended last year cannot nominate again", () => {
  const initial = createInitialElectionState(2026);
  const nominees = [
    ["Candidate Africa 1", "ca1", "Afrika"],
    ["Candidate Africa 2", "ca2", "Afrika"],
    ["Candidate Asia", "ca3", "Asia-Pasifik"],
    ["Candidate Latin", "ca4", "Amerika Latin & Karibia"],
    ["Candidate Europe", "ca5", "Eropa Barat"],
  ].map(([name, slug, region]) => ({
    name,
    iso: slug,
    slug,
    region,
    score: 80,
    votes: 0,
    campaignCount: 0,
    contributionScore: 0,
  }));
  const previouslyServed = initial.members.filter(member =>
    member.cohort === initial.cohort
  );
  const allPreviousMembers = initial.members;
  const completed = resolveElection(
    { ...initial, phase: "campaign", nominees },
    eligibleCountries
  );
  const nextElection = normalizeElectionState(completed, completed.nextElectionYear);
  const formerMember = previouslyServed[0];
  const formerCountry = {
    name: formerMember.name,
    iso: formerMember.iso,
    slug: countrySlug(formerMember.name),
    region: formerMember.region,
    profile: null,
  };

  assert.deepEqual(
    new Set(completed.recentlyServedIsos),
    new Set(allPreviousMembers.map(member => member.iso))
  );
  assert.equal(addPlayerNomination(nextElection, formerCountry, eligibleCountries), nextElection);
  assert.ok(!beginElectionCampaign(
    nextElection,
    [formerCountry, ...electionCandidates],
    eligibleCountries
  ).nominees.some(candidate => candidate.iso === formerMember.iso));

  const staleCampaignState = {
    ...nextElection,
    phase: "campaign",
    nominees: [{
      ...formerCountry,
      score: 100,
      votes: 0,
      campaignCount: 0,
      contributionScore: 0,
    }],
  };
  const campaign = campaignForCandidate(staleCampaignState, formerCountry.slug);
  assert.deepEqual(campaign.nominees, []);
});

test("legacy election history restores the prior year's ineligible members", () => {
  const initial = createInitialElectionState(2030);
  const legacyState = normalizeElectionState({
    ...initial,
    recentlyServedIsos: undefined,
    history: [{
      year: 2028,
      cohort: "A",
      winners: ["Taiwan"],
      votes: {},
    }],
  }, 2031);
  const taiwan = electionCandidates.find(country => country.iso === "tw");

  assert.ok(taiwan);
  assert.ok(legacyState.recentlyServedIsos.includes("tw"));
  assert.equal(addPlayerNomination(legacyState, taiwan, eligibleCountries), legacyState);
});

test("missed election completes sequentially and emits each stage notification", () => {
  const initial = createInitialElectionState(2026);
  const result = tickSecurityCouncilElectionSchedule("2029-11-22", initial, profiles);

  assert.ok(result);
  assert.equal(result.error, undefined);
  assert.equal(result.state.phase, "completed");
  assert.equal(result.state.year, 2027);
  assert.equal(result.state.nextElectionYear, 2028);
  assert.equal(result.notifications.length, 4);
  assert.deepEqual(
    result.notifications.map(notification => notification.timestamp),
    ["2027-06-01", "2027-06-15", "2027-06-25", "2027-06-30"]
  );
  assert.deepEqual(
    result.notifications.map(notification => notification.titleKey),
    [
      "side_inbox.notificationMessages.securityCouncilElection.nominationTitle",
      "side_inbox.notificationMessages.securityCouncilElection.campaignTitle",
      "side_inbox.notificationMessages.securityCouncilElection.votingTitle",
      "side_inbox.notificationMessages.securityCouncilElection.resultsTitle",
    ]
  );
  assert.ok(result.notifications.every(notification =>
    notification.priority === "critical" &&
    notification.hideValue === true &&
    notification.isRead === false
  ));

  const nextElection = normalizeElectionState(result.state, 2029);
  assert.equal(nextElection.year, 2028);
  assert.equal(nextElection.cohort, "A");
  assert.deepEqual(nextElection.members, result.state.members);
});

test("election notifications are emitted only on the four June stage dates", () => {
  const initial = createInitialElectionState(2026);
  const nomination = tickSecurityCouncilElectionSchedule("2027-06-01", initial, profiles);
  assert.ok(nomination);
  assert.deepEqual(nomination.notifications.map(notification => notification.timestamp), ["2027-06-01"]);

  const nominationStillOpen = tickSecurityCouncilElectionSchedule("2027-06-14", nomination.state, profiles);
  assert.ok(nominationStillOpen);
  assert.deepEqual(nominationStillOpen.notifications, []);

  const campaign = tickSecurityCouncilElectionSchedule("2027-06-15", nominationStillOpen.state, profiles);
  assert.ok(campaign);
  assert.deepEqual(campaign.notifications.map(notification => notification.timestamp), ["2027-06-15"]);

  const campaignStillOpen = tickSecurityCouncilElectionSchedule("2027-06-24", campaign.state, profiles);
  assert.ok(campaignStillOpen);
  assert.deepEqual(campaignStillOpen.notifications, []);

  const voting = tickSecurityCouncilElectionSchedule("2027-06-25", campaignStillOpen.state, profiles);
  assert.ok(voting);
  assert.deepEqual(voting.notifications.map(notification => notification.timestamp), ["2027-06-25"]);

  const results = tickSecurityCouncilElectionSchedule("2027-06-30", voting.state, profiles);
  assert.ok(results);
  assert.deepEqual(results.notifications.map(notification => notification.timestamp), ["2027-06-30"]);
});

test("missed election with incomplete voter data returns an error without advancing", () => {
  const initial = createInitialElectionState(2026);
  const result = tickSecurityCouncilElectionSchedule("2029-11-22", initial, []);

  assert.ok(result);
  assert.match(result.error, /0 profil dari 193/);
  assert.equal(result.state.year, initial.year);
  assert.equal(result.state.nextElectionYear, initial.nextElectionYear);
  assert.equal(result.state.scheduleStage, initial.scheduleStage);
  assert.deepEqual(result.notifications, []);
});

test("corrupt stored roster falls back to valid initial terms", () => {
  gameDate = "2026-11-22";
  const originalConsoleError = console.error;
  console.error = () => {};
  try {
    for (const corruptState of [
      "{invalid",
      JSON.stringify({ members: Array.from({ length: 10 }, () => ({})) }),
    ]) {
      localStorageValues.set("neosantara_pbb_security_council_election", corruptState);
      assert.deepEqual(getStoredCouncilMembers(), createInitialElectionState(2026).members);
    }
  } finally {
    console.error = originalConsoleError;
    localStorageValues.clear();
  }
});
