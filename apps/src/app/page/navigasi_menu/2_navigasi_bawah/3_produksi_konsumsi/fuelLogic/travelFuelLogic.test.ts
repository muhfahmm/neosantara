import assert from "node:assert/strict";
import test from "node:test";
import {
  checkTravelFuel,
  consumeTravelFuel,
  getTravelOilConsumptionThisMonth,
  getTravelOilCost,
  type TravelFuelLogEntry,
} from "./travelFuelLogic.ts";

test("travel oil cost increases with distance", () => {
  const nearbyCost = getTravelOilCost("Indonesia", "Malaysia", "non-aggression-pact");
  const distantCost = getTravelOilCost("Indonesia", "Amerika Serikat", "non-aggression-pact");

  assert.notEqual(nearbyCost, null);
  assert.notEqual(distantCost, null);
  assert.ok(distantCost! > nearbyCost!);
});

test("minimum cost and per-travel-type multiplier are applied", () => {
  const rate = {
    country_slug: "indonesia",
    target_country_slug: "malaysia",
    konsumsi_minyak: 2400,
    multipliers: {
      "non-aggression-pact": 1.5,
      "research-contract": 2,
    },
  };

  assert.equal(getTravelOilCost("Indonesia", "Malaysia", "non-aggression-pact", rate), 3600);
  assert.equal(getTravelOilCost("Indonesia", "Malaysia", "research-contract", rate), 4800);
  assert.ok((getTravelOilCost("Indonesia", "Amerika Serikat", "trade-agreement") ?? 0) >= 2500);
});

test("military attacks use the route oil rate and record a single fuel charge", () => {
  const rate = {
    country_slug: "jepang",
    target_country_slug: "china",
    konsumsi_minyak: 6200,
  };
  const cost = getTravelOilCost("Jepang", "China", "military-attack", rate);
  assert.equal(cost, 6200);

  const countryDetail: Record<string, unknown> = { inventory_minyak_bumi: 10000 };
  const entry: TravelFuelLogEntry = {
    id: "military-attack-once",
    date: "2026-11-04",
    targetCountry: "China",
    travelType: "military-attack",
    amount: cost ?? 0,
  };
  const afterAttack = consumeTravelFuel(countryDetail, cost ?? 0, entry);
  const afterDuplicate = consumeTravelFuel(afterAttack, cost ?? 0, entry);

  assert.equal(afterAttack.inventory_minyak_bumi, 3800);
  assert.equal(afterDuplicate, afterAttack);
  assert.equal(getTravelOilConsumptionThisMonth(afterAttack, "2026-11-04"), 6200);
});

test("fuel checks reject insufficient stock and consumption cannot go negative", () => {
  const countryDetail = { inventory_minyak_bumi: 3000 };

  assert.deepEqual(checkTravelFuel(countryDetail, 3500), {
    ok: false,
    stock: 3000,
    remaining: 0,
  });
  const unchanged = consumeTravelFuel(countryDetail, 3500, {
    id: "too-expensive",
    date: "2026-11-04",
    targetCountry: "Malaysia",
    travelType: "trade-agreement",
    amount: 3500,
  });
  assert.equal(unchanged, countryDetail);

  const consumed = consumeTravelFuel(countryDetail, 2500, {
    id: "affordable",
    date: "2026-11-04",
    targetCountry: "Malaysia",
    travelType: "trade-agreement",
    amount: 2500,
  });
  assert.equal(consumed.inventory_minyak_bumi, 500);
});

test("a trip id can only consume fuel once; cancellation leaves stock unchanged", () => {
  const countryDetail = { inventory_minyak_bumi: 8000 };
  const entry: TravelFuelLogEntry = {
    id: "trip-once",
    date: "2026-11-04",
    targetCountry: "Malaysia",
    travelType: "non-aggression-pact",
    amount: 3000,
  };

  const afterFirstLaunch = consumeTravelFuel(countryDetail, 3000, entry);
  const afterDuplicateLaunch = consumeTravelFuel(afterFirstLaunch, 3000, entry);
  assert.equal(afterFirstLaunch.inventory_minyak_bumi, 5000);
  assert.equal(afterDuplicateLaunch, afterFirstLaunch);

  const cancelledBeforeConfirmation = { inventory_minyak_bumi: 8000 };
  assert.equal(cancelledBeforeConfirmation.inventory_minyak_bumi, 8000);
  assert.equal(getTravelOilConsumptionThisMonth(cancelledBeforeConfirmation, "2026-11-04"), 0);
});

test("travel fuel log and stock survive save/load serialization", () => {
  const initial: Record<string, unknown> = { inventory_minyak_bumi: 7000 };
  const saved = consumeTravelFuel(initial, 2500, {
    id: "saved-trip",
    date: "2026-11-04",
    targetCountry: "Malaysia",
    travelType: "defense-alliance",
    amount: 2500,
  });
  const loaded = JSON.parse(JSON.stringify(saved)) as typeof saved;

  assert.equal(loaded.inventory_minyak_bumi, 4500);
  assert.deepEqual(loaded.travelFuelLog, saved.travelFuelLog);
  assert.equal(getTravelOilConsumptionThisMonth(loaded, "2026-11-15"), 2500);
});
