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
  getEligibleUNMemberCountries,
  getStoredCouncilMembers,
  getCouncilVoteMultiplier,
  isLimitedVetoAvailable,
  normalizeElectionState,
  resolveElection,
  tickSecurityCouncilElectionSchedule,
} = electionModule.exports;
const eligibleCountries = getEligibleUNMemberCountries(profiles);

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

  const nextElection = normalizeElectionState(result.state, 2029);
  assert.equal(nextElection.year, 2029);
  assert.equal(nextElection.cohort, "B");
  assert.deepEqual(nextElection.members, result.state.members);
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
