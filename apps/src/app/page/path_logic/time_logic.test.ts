import assert from "node:assert/strict";
import test from "node:test";
import {
  estimateEmbassyConstructionDays,
  estimateTravelTime,
  getEmbassyConstructionDaysFromDistance,
} from "./time_logic.ts";
import {
  CONTINENT_TRAVEL_DAYS,
  getFallbackTravelDaysFromDistance,
  getTravelDaysBetweenContinents,
  type SupportedContinent,
} from "./continentTravelTime.ts";
import { getEffectiveEmbassyBuildTime } from "../bonus_logic/penelitian_bonus_logic/3_riset_diplomasi_intelijen/1_Manfaat Kedutaan.ts";

test("distance-based journeys use the configured origin and destination continents", () => {
  const nearbyRoute = estimateTravelTime("Indonesia", "Malaysia", {
    durationByDistance: true,
  });
  const distantRoute = estimateTravelTime("Indonesia", "Amerika Serikat", {
    durationByDistance: true,
  });

  assert.equal(nearbyRoute?.days, 60);
  assert.equal(distantRoute?.days, 150);
});

test("routes without distance-based timing keep the existing three-day duration", () => {
  const route = estimateTravelTime("Indonesia", "Amerika Serikat");

  assert.equal(route?.days, 3);
});

test("diplomatic and military routes use the continent-pair schedule", () => {
  const kinds = [
    "spionase",
    "sabotase",
    "non-aggression-pact",
    "trade-agreement",
    "research-contract",
    "defense-alliance",
    "aid-delivery",
  ];

  for (const diplomacyKind of kinds) {
    const route = estimateTravelTime("Indonesia", "Amerika Serikat", { diplomacyKind });

    assert.ok(route);
    assert.equal(
      route.days,
      getTravelDaysBetweenContinents(route.originContinent, route.destinationContinent),
    );
  }

  const nearbyRoute = estimateTravelTime("Indonesia", "Malaysia", {
    diplomacyKind: "non-aggression-pact",
  });
  const distantRoute = estimateTravelTime("Indonesia", "Amerika Serikat", {
    diplomacyKind: "non-aggression-pact",
  });
  assert.ok(nearbyRoute && distantRoute);
  assert.equal(nearbyRoute.days, 60);
  assert.equal(distantRoute.days, 150);
});

test("continent-pair schedule includes every directed route", () => {
  const continents = Object.keys(CONTINENT_TRAVEL_DAYS) as SupportedContinent[];
  const expectedSchedule: typeof CONTINENT_TRAVEL_DAYS = {
    Asia: {
      Asia: 60,
      Afrika: 120,
      Eropa: 90,
      Oceania: 100,
      "Amerika Selatan": 170,
      "Amerika Utara": 150,
    },
    Afrika: {
      Asia: 120,
      Afrika: 60,
      Eropa: 80,
      Oceania: 140,
      "Amerika Selatan": 130,
      "Amerika Utara": 130,
    },
    Eropa: {
      Asia: 90,
      Afrika: 80,
      Eropa: 60,
      Oceania: 150,
      "Amerika Selatan": 120,
      "Amerika Utara": 90,
    },
    Oceania: {
      Asia: 100,
      Afrika: 140,
      Eropa: 150,
      Oceania: 60,
      "Amerika Selatan": 160,
      "Amerika Utara": 140,
    },
    "Amerika Selatan": {
      Asia: 170,
      Afrika: 130,
      Eropa: 120,
      Oceania: 160,
      "Amerika Selatan": 60,
      "Amerika Utara": 80,
    },
    "Amerika Utara": {
      Asia: 150,
      Afrika: 130,
      Eropa: 90,
      Oceania: 140,
      "Amerika Selatan": 80,
      "Amerika Utara": 60,
    },
  };

  assert.deepEqual(CONTINENT_TRAVEL_DAYS, expectedSchedule);
  assert.equal(continents.length, 6);
  for (const origin of continents) {
    for (const destination of continents) {
      const days = getTravelDaysBetweenContinents(origin, destination);
      assert.ok(days >= 60 && days <= 170);
      assert.equal(days, CONTINENT_TRAVEL_DAYS[origin][destination]);
    }
  }
});

test("user military attacks use distance-based travel days", () => {
  for (const kind of ["serang", "serang-negara"]) {
    const route = estimateTravelTime("Indonesia", "Amerika Serikat", {
      diplomacyKind: kind,
    });

    assert.ok(route);
    assert.equal(
      route.days,
      getTravelDaysBetweenContinents(route.originContinent, route.destinationContinent),
    );
  }
});

test("fallback travel duration remains bounded for routes without continent data", () => {
  assert.equal(getFallbackTravelDaysFromDistance(0), 60);
  assert.equal(getFallbackTravelDaysFromDistance(Math.PI * 6371), 170);
  assert.throws(() => getFallbackTravelDaysFromDistance(-1), RangeError);
});

test("embassy construction duration scales with distance and stays within 60 to 120 days", () => {
  const minimum = getEmbassyConstructionDaysFromDistance(0);
  const maximum = getEmbassyConstructionDaysFromDistance(Math.PI * 6371);
  const nearby = estimateEmbassyConstructionDays("Indonesia", "Malaysia");
  const distant = estimateEmbassyConstructionDays("Indonesia", "Amerika Serikat");

  assert.equal(minimum, 60);
  assert.equal(maximum, 120);
  assert.ok(nearby !== null && nearby >= 60 && nearby <= 120);
  assert.ok(distant !== null && distant >= 60 && distant <= 120);
  assert.ok(distant > nearby!);
});

test("embassy construction distance rejects invalid values", () => {
  assert.throws(() => getEmbassyConstructionDaysFromDistance(-1), RangeError);
  assert.throws(() => getEmbassyConstructionDaysFromDistance(Number.NaN), RangeError);
});

test("embassy research discounts cannot reduce construction below 60 days", () => {
  const researchDetail = {
    completed_research: ["manfaat_kedutaan"],
    research_levels: { manfaat_kedutaan: 5 },
  };

  assert.equal(getEffectiveEmbassyBuildTime(60, researchDetail), 60);
  assert.equal(getEffectiveEmbassyBuildTime(120, researchDetail), 102);
});
