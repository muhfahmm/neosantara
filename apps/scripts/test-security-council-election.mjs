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
  getEligibleUNMemberCountries,
  getSecurityCouncilElectionCandidateCountries,
  getStoredCouncilMembers,
  getCouncilVoteMultiplier,
  isPermanentSecurityCouncilMember,
  isLimitedVetoAvailable,
  normalizeElectionState,
  resolveElection,
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

test("new-game schedule and initial cohort terms remain fixed", () => {
  const initial = createInitialElectionState(2026);
  assert.equal(initial.year, 2028);
  assert.equal(initial.nextElectionYear, 2028);
  assert.equal(initial.cohort, "A");
  assert.equal(eligibleCountries.length, 193);
  assert.equal(electionCandidates.length, 194);

  for (const member of initial.members) {
    assert.equal(member.termStartYear, 2026);
    assert.equal(member.termEndYear, member.cohort === "A" ? 2028 : 2029);
  }
  assert.equal(normalizeElectionState(initial, 2027).year, 2028);
  assert.equal(tickSecurityCouncilElectionSchedule("2026-06-30", initial, profiles), null);
  assert.equal(tickSecurityCouncilElectionSchedule("2027-06-30", initial, profiles), null);
});

test("a new game in 2027 schedules cohort B for 2029", () => {
  const initial = createInitialElectionState(2027);
  assert.equal(initial.year, 2029);
  assert.equal(initial.cohort, "B");
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
  const nomination = tickSecurityCouncilElectionSchedule("2028-06-01", initial, profiles);
  assert.ok(nomination);
  const campaign = tickSecurityCouncilElectionSchedule("2028-06-15", nomination.state, profiles);
  assert.ok(campaign);

  let state = campaign.state;
  let previousVotes = 0;
  for (let day = 25; day < 30; day += 1) {
    const result = tickSecurityCouncilElectionSchedule(`2028-06-${day}`, state, profiles);
    assert.ok(result);
    assert.equal(result.error, undefined);
    assert.equal(result.state.phase, "voting");
    const totalVotes = result.state.nominees.reduce((total, candidate) => total + candidate.votes, 0);
    assert.ok(totalVotes > previousVotes);
    previousVotes = totalVotes;
    state = result.state;
  }

  const results = tickSecurityCouncilElectionSchedule("2028-06-30", state, profiles);
  assert.ok(results);
  assert.equal(results.state.phase, "completed");
  assert.equal(results.notifications.length, 1);
  assert.equal(results.notifications[0].timestamp, "2028-06-30");
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
  const completed = resolveElection(
    { ...initial, phase: "campaign", nominees },
    eligibleCountries
  );

  assert.equal(completed.phase, "completed");
  assert.equal(completed.nextElectionYear, 2029);
  assert.equal(completed.members.filter(member => member.cohort === "A").length, 5);
  assert.equal(completed.members.filter(member => member.cohort === "B").length, 5);
  assert.ok(completed.members.filter(member => member.cohort === "A")
    .every(member => member.termStartYear === 2029 && member.termEndYear === 2030));
  assert.ok(completed.members.filter(member => member.cohort === "B")
    .every(member => member.termEndYear === 2029));

  const nextElection = normalizeElectionState(completed, 2029);
  assert.equal(nextElection.year, 2029);
  assert.equal(nextElection.cohort, "B");
  assert.deepEqual(nextElection.members, completed.members);
  assert.equal(nextElection.history.length, 1);
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
  const recentlyServed = initial.members.filter(member => member.cohort === initial.cohort);
  const completed = resolveElection(
    { ...initial, phase: "campaign", nominees },
    eligibleCountries
  );
  const nextElection = normalizeElectionState(completed, completed.nextElectionYear);
  const formerMember = recentlyServed[0];
  const formerCountry = {
    name: formerMember.name,
    iso: formerMember.iso,
    slug: countrySlug(formerMember.name),
    region: formerMember.region,
    profile: null,
  };

  assert.deepEqual(
    new Set(completed.recentlyServedIsos),
    new Set(recentlyServed.map(member => member.iso))
  );
  assert.equal(addPlayerNomination(nextElection, formerCountry, eligibleCountries), nextElection);
  assert.ok(!beginElectionCampaign(
    nextElection,
    [formerCountry, ...electionCandidates],
    eligibleCountries
  ).nominees.some(candidate => candidate.iso === formerMember.iso));
});

test("legacy election history restores the prior year's ineligible members", () => {
  const initial = createInitialElectionState(2029);
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
  assert.equal(result.state.year, 2028);
  assert.equal(result.state.nextElectionYear, 2029);
  assert.equal(result.notifications.length, 4);
  assert.deepEqual(
    result.notifications.map(notification => notification.timestamp),
    ["2028-06-01", "2028-06-15", "2028-06-25", "2028-06-30"]
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
  assert.equal(nextElection.year, 2029);
  assert.equal(nextElection.cohort, "B");
  assert.deepEqual(nextElection.members, result.state.members);
});

test("election notifications are emitted only on the four June stage dates", () => {
  const initial = createInitialElectionState(2026);
  const nomination = tickSecurityCouncilElectionSchedule("2028-06-01", initial, profiles);
  assert.ok(nomination);
  assert.deepEqual(nomination.notifications.map(notification => notification.timestamp), ["2028-06-01"]);

  const nominationStillOpen = tickSecurityCouncilElectionSchedule("2028-06-14", nomination.state, profiles);
  assert.ok(nominationStillOpen);
  assert.deepEqual(nominationStillOpen.notifications, []);

  const campaign = tickSecurityCouncilElectionSchedule("2028-06-15", nominationStillOpen.state, profiles);
  assert.ok(campaign);
  assert.deepEqual(campaign.notifications.map(notification => notification.timestamp), ["2028-06-15"]);

  const campaignStillOpen = tickSecurityCouncilElectionSchedule("2028-06-24", campaign.state, profiles);
  assert.ok(campaignStillOpen);
  assert.deepEqual(campaignStillOpen.notifications, []);

  const voting = tickSecurityCouncilElectionSchedule("2028-06-25", campaignStillOpen.state, profiles);
  assert.ok(voting);
  assert.deepEqual(voting.notifications.map(notification => notification.timestamp), ["2028-06-25"]);

  const results = tickSecurityCouncilElectionSchedule("2028-06-30", voting.state, profiles);
  assert.ok(results);
  assert.deepEqual(results.notifications.map(notification => notification.timestamp), ["2028-06-30"]);
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
