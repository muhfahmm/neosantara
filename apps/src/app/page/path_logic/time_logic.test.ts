import assert from "node:assert/strict";
import test from "node:test";
import {
  estimateEmbassyConstructionDays,
  estimateTravelTime,
  getEmbassyConstructionDaysFromDistance,
} from "./time_logic.ts";
import {
  getDistanceBasedTravelDays,
  MAX_DISTANCE_BASED_TRAVEL_DAYS,
  MAX_ROUTE_DISTANCE_KM,
  MIN_DISTANCE_BASED_TRAVEL_DAYS,
} from "./distanceBasedTravelTime.ts";
import { getEffectiveEmbassyBuildTime } from "../bonus_logic/penelitian_bonus_logic/3_riset_diplomasi_intelijen/1_Manfaat Kedutaan.ts";

test("distance-based journeys take at least three game days and scale by distance", () => {
  const nearbyRoute = estimateTravelTime("Indonesia", "Malaysia", {
    durationByDistance: true,
  });
  const distantRoute = estimateTravelTime("Indonesia", "Amerika Serikat", {
    durationByDistance: true,
  });

  assert.equal(nearbyRoute?.days, 3);
  assert.ok(distantRoute);
  assert.equal(distantRoute.days, Math.ceil(distantRoute.distanceKm / 1000));
  assert.ok(distantRoute.days > nearbyRoute!.days);
});

test("routes without distance-based timing keep the existing three-day duration", () => {
  const route = estimateTravelTime("Indonesia", "Amerika Serikat");

  assert.equal(route?.days, 3);
});

test("diplomatic operations use 120 to 180 days based on distance", () => {
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
    assert.equal(route.days, getDistanceBasedTravelDays(route.distanceKm));
    assert.ok(route.days >= MIN_DISTANCE_BASED_TRAVEL_DAYS);
    assert.ok(route.days <= MAX_DISTANCE_BASED_TRAVEL_DAYS);
  }

  const nearbyRoute = estimateTravelTime("Indonesia", "Malaysia", {
    diplomacyKind: "non-aggression-pact",
  });
  const distantRoute = estimateTravelTime("Indonesia", "Amerika Serikat", {
    diplomacyKind: "non-aggression-pact",
  });
  assert.ok(nearbyRoute && distantRoute);
  assert.ok(distantRoute.days > nearbyRoute.days);
});

test("distance-based travel duration stays within its configured limits", () => {
  assert.equal(getDistanceBasedTravelDays(0), MIN_DISTANCE_BASED_TRAVEL_DAYS);
  assert.equal(
    getDistanceBasedTravelDays(MAX_ROUTE_DISTANCE_KM),
    MAX_DISTANCE_BASED_TRAVEL_DAYS,
  );
  assert.throws(() => getDistanceBasedTravelDays(-1), RangeError);
});

test("user military attacks use distance-based travel days", () => {
  for (const kind of ["serang", "serang-negara"]) {
    const route = estimateTravelTime("Indonesia", "Amerika Serikat", {
      diplomacyKind: kind,
    });

    assert.ok(route);
    assert.equal(route.days, getDistanceBasedTravelDays(route.distanceKm));
    assert.ok(route.days >= MIN_DISTANCE_BASED_TRAVEL_DAYS);
    assert.ok(route.days <= MAX_DISTANCE_BASED_TRAVEL_DAYS);
  }
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
