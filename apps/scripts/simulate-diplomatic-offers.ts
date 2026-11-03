import {
  DIPLOMATIC_OFFER_CONFIG,
  createEmptyDiplomaticOfferState,
  getDiplomaticOfferResearchBonuses,
  getEmbassyCandidates,
  getEmbassyChance,
  getOfferChances,
  isDiplomaticInteractionBlocked,
  isEmbassyBuildRelationAllowed,
  normalizeDiplomaticOfferState,
  recordEmbassyOfferRejection,
  rollMonthlyOffer,
  type DiplomaticOfferCandidate,
  type DiplomaticOfferContext,
  type DiplomaticOfferKind,
  type EmbassyOfferCandidate,
} from "../src/app/page/map_system/diplomaticOfferLogic";

const offerKinds: DiplomaticOfferKind[] = [
  "trade-agreement",
  "non-aggression",
  "research-contract",
  "defense-alliance",
];
const candidatesByType: Record<DiplomaticOfferKind, DiplomaticOfferCandidate[]> = {
  "trade-agreement": Array.from({ length: 20 }, (_, index) => ({
    countryName: `Trade Partner ${index}`,
    relationScore: 50,
  })),
  "non-aggression": Array.from({ length: 20 }, (_, index) => ({
    countryName: `NAP Partner ${index}`,
    relationScore: 50,
  })),
  "research-contract": Array.from({ length: 20 }, (_, index) => ({
    countryName: `Research Partner ${index}`,
    relationScore: 50,
  })),
  "defense-alliance": Array.from({ length: 20 }, (_, index) => ({
    countryName: `Alliance Partner ${index}`,
    relationScore: 90,
  })),
};

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function monthKey(monthIndex: number): string {
  const year = 2000 + Math.floor(monthIndex / 12);
  const month = (monthIndex % 12) + 1;
  return `${year}-${String(month).padStart(2, "0")}`;
}

function makeRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x1_0000_0000;
  };
}

const baselineContext: DiplomaticOfferContext = {
  month: "2000-01",
  state: createEmptyDiplomaticOfferState(),
  candidatesByType,
  pendingOffers: [],
  researchBonusPercent: {},
};
const baselineChances = getOfferChances(baselineContext);
assert(baselineChances["trade-agreement"] === 15, "Trade weight should start at 15.");
assert(baselineChances["non-aggression"] === 10, "NAP weight should start at 10.");
assert(baselineChances["research-contract"] === 8, "Research weight should start at 8.");
assert(
  Math.abs(baselineChances["defense-alliance"] - 3.75) < 0.001,
  "Alliance weight at relation 90 should follow the relation multiplier."
);

const researchBonuses = getDiplomaticOfferResearchBonuses({
  completed_research: [
    "perjanjian_dagang",
    "pakta_non_agresi",
    "bonus_organisasi_pbb",
    "aliansi_pertahanan",
  ],
  research_levels: {
    perjanjian_dagang: 5,
    pakta_non_agresi: 5,
    bonus_organisasi_pbb: 5,
    aliansi_pertahanan: 5,
  },
});
const boostedChances = getOfferChances({
  ...baselineContext,
  researchBonusPercent: researchBonuses,
});
assert(boostedChances["trade-agreement"] === 17.25, "Trade research bonus should multiply its weight.");
assert(boostedChances["non-aggression"] === 11.5, "NAP research bonus should multiply its weight.");
assert(boostedChances["research-contract"] === 9.2, "Research contract bonus should multiply its weight.");

const noAllianceContext: DiplomaticOfferContext = {
  ...baselineContext,
  candidatesByType: {
    ...candidatesByType,
    "defense-alliance": [{ countryName: "Low relation", relationScore: 80 }],
  },
};
assert(getOfferChances(noAllianceContext)["defense-alliance"] === 0, "Alliance must require relation > 80.");

const poorResearchRelationContext: DiplomaticOfferContext = {
  ...baselineContext,
  candidatesByType: {
    ...candidatesByType,
    "research-contract": [{ countryName: "Poor relation", relationScore: 39 }],
  },
};
assert(
  getOfferChances(poorResearchRelationContext)["research-contract"] === 0,
  "Research offers must require relation of at least 40."
);

const pendingContext: DiplomaticOfferContext = {
  ...baselineContext,
  candidatesByType: {
    ...candidatesByType,
    "trade-agreement": [{ countryName: "Pending partner", relationScore: 50 }],
  },
  pendingOffers: [{ kind: "trade-agreement", countryName: "Pending partner" }],
};
assert(getOfferChances(pendingContext)["trade-agreement"] === 0, "Pending offers must not be duplicated.");

const typeCooldownContext: DiplomaticOfferContext = {
  ...baselineContext,
  month: "2000-02",
  state: {
    ...createEmptyDiplomaticOfferState(),
    lastOfferByType: { "trade-agreement": "2000-01" },
  },
};
assert(
  getOfferChances(typeCooldownContext)["trade-agreement"] === 0,
  "Type cooldown must block the month after an offer."
);

assert(getEmbassyChance(40) === 0, "Embassy offers must be unavailable below relation 41.");
assert(getEmbassyChance(41) === 10, "Neutral embassy chance should be 10%.");
assert(getEmbassyChance(65) === 10, "Relation 65 should remain in the neutral tier.");
assert(getEmbassyChance(66) === 25, "Good embassy chance should be 25%.");
assert(getEmbassyChance(80) === 25, "Relation 80 should remain in the good tier.");
assert(getEmbassyChance(81) === 50, "Very good embassy chance should be 50%.");
assert(getEmbassyChance(100) === 50, "Very good embassy chance should cap at 50%.");
assert(isEmbassyBuildRelationAllowed("AI", 41), "AI embassy builds should allow relation 41.");
assert(!isEmbassyBuildRelationAllowed("AI", 40), "AI embassy builds should reject relation below 41.");
assert(isEmbassyBuildRelationAllowed("USER", 65), "User embassy builds should allow relation 65.");
assert(!isEmbassyBuildRelationAllowed("USER", 64), "User embassy builds should reject relation below 65.");
assert(
  isDiplomaticInteractionBlocked({
    playerUnderEmbargo: false,
    partnerUnderEmbargo: true,
    bilateralWar: false,
  }) &&
    isDiplomaticInteractionBlocked({
      playerUnderEmbargo: false,
      partnerUnderEmbargo: false,
      bilateralWar: true,
    }),
  "An embargo or bilateral war must block diplomacy."
);

const singleEmbassyCandidate: EmbassyOfferCandidate = {
  countryName: "Embassy AI",
  relationScore: 50,
  hasEmbassy: false,
  hasPendingOffer: false,
  hasOngoingConstruction: false,
};
const embassyCooldownState = recordEmbassyOfferRejection(
  createEmptyDiplomaticOfferState(),
  singleEmbassyCandidate.countryName,
  "2000-01"
);
for (let month = 1; month <= 5; month += 1) {
  const monthContext = {
    ...baselineContext,
    month: monthKey(month),
    state: embassyCooldownState,
    embassyCandidates: [singleEmbassyCandidate],
  };
  assert(getEmbassyCandidates(monthContext).length === 0, "Embassy rejection cooldown must last six game months.");
}
assert(
  getEmbassyCandidates({
    ...baselineContext,
    month: "2000-07",
    state: embassyCooldownState,
    embassyCandidates: [singleEmbassyCandidate],
  }).length === 1,
  "Embassy rejection cooldown should end after six months."
);

for (const invalidCandidate of [
  { ...singleEmbassyCandidate, relationScore: 40 },
  { ...singleEmbassyCandidate, hasEmbassy: true },
  { ...singleEmbassyCandidate, hasPendingOffer: true },
  { ...singleEmbassyCandidate, hasOngoingConstruction: true },
]) {
  assert(
    getEmbassyCandidates({ ...baselineContext, embassyCandidates: [invalidCandidate] }).length === 0,
    "An ineligible embassy candidate was not filtered."
  );
}

const blockedContext: DiplomaticOfferContext = {
  ...baselineContext,
  diplomacyBlocked: true,
  embassyCandidates: [singleEmbassyCandidate],
};
assert(
  getOfferChances(blockedContext)["trade-agreement"] === 0 &&
    getEmbassyCandidates(blockedContext).length === 0,
  "Player embargo must block all diplomatic offers."
);
assert(
  getOfferChances({
    ...baselineContext,
    blockedCountryNames: ["Trade Partner 0"],
  })["trade-agreement"] === 15,
  "Blocking one country must not suppress eligible partners of the same offer type."
);
assert(
  getEmbassyCandidates({
    ...baselineContext,
    blockedCountryNames: [singleEmbassyCandidate.countryName],
    embassyCandidates: [singleEmbassyCandidate],
  }).length === 0,
  "A country in bilateral war or under embargo must not make an embassy offer."
);
assert(
  getEmbassyCandidates({
    ...baselineContext,
    embassyCandidates: [singleEmbassyCandidate],
    pendingOffers: [{ kind: "embassy", countryName: singleEmbassyCandidate.countryName }],
  }).length === 0,
  "An embassy offer must not be duplicated while pending."
);
assert(
  normalizeDiplomaticOfferState({}).lastEmbassyRejectionByCountry &&
    Object.keys(normalizeDiplomaticOfferState({}).lastEmbassyRejectionByCountry).length === 0,
  "Legacy saves should default embassy rejection history to an empty map."
);

const weightedEmbassyCandidates: EmbassyOfferCandidate[] = [
  singleEmbassyCandidate,
  { ...singleEmbassyCandidate, countryName: "Embassy AI 1", relationScore: 90 },
];
const weightedEmbassyContext: DiplomaticOfferContext = {
  ...baselineContext,
  embassyCandidates: weightedEmbassyCandidates,
};
const weightedEmbassyChoiceValues = [0, 0.2];
const weightedEmbassyChoice = rollMonthlyOffer(
  weightedEmbassyContext,
  () => weightedEmbassyChoiceValues.shift() ?? 0
);
assert(
  weightedEmbassyChoice.offer?.kind === "embassy" &&
    weightedEmbassyChoice.offer.countryName === weightedEmbassyCandidates[1].countryName,
  "Embassy senders must be selected by relation-weighted chance."
);

const countryCooldownContext: DiplomaticOfferContext = {
  ...baselineContext,
  month: "2000-03",
  state: {
    ...createEmptyDiplomaticOfferState(),
    lastOfferByCountry: { "trade partner 0": "2000-01" },
  },
};
const countryCooldownOffer = rollMonthlyOffer(countryCooldownContext, () => 0);
assert(
  countryCooldownOffer.offer?.countryName !== "Trade Partner 0",
  "A country on cooldown must not be selected."
);

const embassyCandidatesFor = (relations: readonly number[]): EmbassyOfferCandidate[] =>
  relations.map((relationScore, index) => ({
    countryName: `Embassy AI ${index}`,
    relationScore,
    hasEmbassy: false,
    hasPendingOffer: false,
    hasOngoingConstruction: false,
  }));
const scenarios = [
  { name: "Sparse (1 neutral)", candidates: embassyCandidatesFor([50]), seed: 0x5eed1235 },
  { name: "Dense (10 very good)", candidates: embassyCandidatesFor(Array(10).fill(85)), seed: 0x5eed1236 },
  { name: "Mixed tiers (2/3/2)", candidates: embassyCandidatesFor([50, 60, 70, 75, 80, 85, 95]), seed: 0x5eed1237 },
];

const denseContext: DiplomaticOfferContext = {
  ...baselineContext,
  embassyCandidates: scenarios[1].candidates,
};
const cappedSuccess = rollMonthlyOffer(denseContext, () => 0.349999);
assert(cappedSuccess.offer?.kind === "embassy", "Embassy roll should succeed below the monthly cap.");
const cappedFailureValues = [0.350001, 0.5];
const cappedFailure = rollMonthlyOffer(denseContext, () => cappedFailureValues.shift() ?? 0.5);
assert(cappedFailure.offer === null, "Embassy chance must not exceed the 35% monthly cap.");

interface SimulationSummary {
  name: string;
  offersPerKind: Record<DiplomaticOfferKind, number>;
  embassyOffersByCountry: Map<string, number>;
  totalOffers: number;
  embassyOffers: number;
  noOfferMonths: number;
  monthsWithMultipleOffers: number;
  otherOffersPerYear: number;
  totalOffersPerYear: number;
  noOfferPercent: number;
}

function runSimulation(
  name: string,
  embassyCandidates: readonly EmbassyOfferCandidate[],
  seed: number
): SimulationSummary {
  const rng = makeRandom(seed);
  let state = createEmptyDiplomaticOfferState();
  const offersPerKind: Record<DiplomaticOfferKind, number> = {
    "trade-agreement": 0,
    "non-aggression": 0,
    "research-contract": 0,
    "defense-alliance": 0,
  };
  const embassyOffersByCountry = new Map<string, number>();
  const previousCountryOffers = new Map<string, number>();
  const previousTypeOffers = new Map<DiplomaticOfferKind, number>();
  let embassyOffers = 0;
  let noOfferMonths = 0;
  let monthsWithMultipleOffers = 0;

  for (let month = 0; month < 10_000; month += 1) {
    const context: DiplomaticOfferContext = {
      ...baselineContext,
      month: monthKey(month),
      state,
      embassyCandidates,
    };
    const result = rollMonthlyOffer(context, rng);
    state = result.state;

    if (!result.offer) {
      noOfferMonths += 1;
    } else {
      const { kind, countryName } = result.offer;
      if (kind === "embassy") {
        embassyOffers += 1;
        embassyOffersByCountry.set(
          countryName,
          (embassyOffersByCountry.get(countryName) || 0) + 1
        );
        const sender = embassyCandidates.find(candidate => candidate.countryName === countryName);
        assert(Boolean(sender && getEmbassyChance(sender.relationScore) > 0), "An ineligible embassy AI made an offer.");
      } else {
        offersPerKind[kind] += 1;
        if (kind === "defense-alliance") {
          const sender = candidatesByType[kind].find(candidate => candidate.countryName === countryName);
          assert(Boolean(sender && sender.relationScore > 80), "An alliance offer was made at relation <= 80.");
        }
        const lastTypeMonth = previousTypeOffers.get(kind);
        if (lastTypeMonth !== undefined) {
          assert(
            month - lastTypeMonth >= DIPLOMATIC_OFFER_CONFIG.offers[kind].cooldownMonths,
            `Type cooldown failed for ${kind}.`
          );
        }
        previousTypeOffers.set(kind, month);
      }

      const lastCountryMonth = previousCountryOffers.get(countryName);
      if (lastCountryMonth !== undefined) {
        assert(
          month - lastCountryMonth >= DIPLOMATIC_OFFER_CONFIG.countryCooldownMonths,
          `Country cooldown failed for ${countryName}.`
        );
      }
      previousCountryOffers.set(countryName, month);
    }

    const duplicateResult = rollMonthlyOffer({ ...context, state: result.state }, rng);
    if (duplicateResult.offer) monthsWithMultipleOffers += 1;
    assert(duplicateResult.offer === null, "More than one monthly offer was produced.");
  }

  const regularOffers = offerKinds.reduce((total, kind) => total + offersPerKind[kind], 0);
  const totalOffers = regularOffers + embassyOffers;
  return {
    name,
    offersPerKind,
    embassyOffersByCountry,
    totalOffers,
    embassyOffers,
    noOfferMonths,
    monthsWithMultipleOffers,
    otherOffersPerYear: regularOffers * 12 / 10_000,
    totalOffersPerYear: totalOffers * 12 / 10_000,
    noOfferPercent: noOfferMonths * 100 / 10_000,
  };
}

const baseline = runSimulation("Baseline (no embassy)", [], 0x5eed1234);
assert(baseline.monthsWithMultipleOffers === 0, "Baseline produced multiple offers in one month.");
assert(
  baseline.offersPerKind["trade-agreement"] > baseline.offersPerKind["non-aggression"],
  "Trade frequency should exceed NAP."
);
assert(
  baseline.offersPerKind["non-aggression"] > baseline.offersPerKind["research-contract"],
  "NAP frequency should exceed research."
);
assert(
  baseline.offersPerKind["research-contract"] > baseline.offersPerKind["defense-alliance"],
  "Research frequency should exceed alliance."
);
assert(baseline.totalOffersPerYear >= 3.4 && baseline.totalOffersPerYear <= 4.2, "Baseline annual pacing is outside the expected range.");
assert(baseline.noOfferPercent >= 64 && baseline.noOfferPercent <= 70, "Baseline no-offer months are outside the 64–70% target.");

const summaries = scenarios.map(scenario =>
  runSimulation(scenario.name, scenario.candidates, scenario.seed)
);
assert(
  summaries.every(summary => summary.monthsWithMultipleOffers === 0),
  "At least one embassy scenario produced multiple monthly offers."
);

console.log("Deterministic simulations: 10,000 months per scenario; standard offers eligible; no research bonuses");
console.log("| Scenario | Embassy offers/year | Other offers/year | Total offers/year | No-offer months | >1 offer months |");
console.log("|---|---:|---:|---:|---:|---:|");
for (const summary of [baseline, ...summaries]) {
  console.log(
    `| ${summary.name} | ${(summary.embassyOffers * 12 / 10_000).toFixed(3)} | ${summary.otherOffersPerYear.toFixed(3)} | ${summary.totalOffersPerYear.toFixed(3)} | ${summary.noOfferPercent.toFixed(2)}% | ${summary.monthsWithMultipleOffers} |`
  );
}
console.log("| Tier | Relation score | Chance per eligible AI/month |");
console.log("|---|---:|---:|");
console.log(`| Netral | 41–65 | ${getEmbassyChance(50)}% |`);
console.log(`| Baik | 66–80 | ${getEmbassyChance(70)}% |`);
console.log(`| Sangat Baik | 81–100 | ${getEmbassyChance(90)}% |`);

console.log("| Scenario | Other offers/year before | Other offers/year after | Reduction |");
console.log("|---|---:|---:|---:|");
for (const summary of summaries) {
  const reduction = baseline.otherOffersPerYear > 0
    ? 100 * (1 - summary.otherOffersPerYear / baseline.otherOffersPerYear)
    : 0;
  console.log(
    `| ${summary.name} | ${baseline.otherOffersPerYear.toFixed(3)} | ${summary.otherOffersPerYear.toFixed(3)} | ${reduction.toFixed(2)}% |`
  );
}
console.log("Eligibility, rejection cooldown, country/type cooldowns, priority cap, and single-offer assertions: passed");
