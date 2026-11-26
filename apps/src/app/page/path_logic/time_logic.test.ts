import assert from "node:assert/strict";
import test from "node:test";
import {
  estimateEmbassyConstructionDays,
  estimateTravelTime,
  getTravelArrivalDateString,
  getEmbassyConstructionDaysFromDistance,
} from "./time_logic.ts";
import { getEffectiveEmbassyBuildTime } from "../bonus_logic/penelitian_bonus_logic/3_riset_diplomasi_intelijen/1_Manfaat Kedutaan.ts";

test("distance-based journeys use the fixed three-day duration", () => {
  const nearbyRoute = estimateTravelTime("Indonesia", "Malaysia", {
    durationByDistance: true,
  });
  const distantRoute = estimateTravelTime("Indonesia", "Amerika Serikat", {
    durationByDistance: true,
  });

  assert.equal(nearbyRoute?.days, 3);
  assert.equal(distantRoute?.days, 3);
});

test("routes without distance-based timing keep the existing three-day duration", () => {
  const route = estimateTravelTime("Indonesia", "Amerika Serikat");

  assert.equal(route?.days, 3);
});

test("travel arrival dates advance by whole simulation days across leap years", () => {
  assert.equal(getTravelArrivalDateString(new Date(2028, 1, 1), 3), "2028-02-04");
  assert.equal(getTravelArrivalDateString(new Date(Number.NaN), 3), null);
  assert.equal(getTravelArrivalDateString(new Date(2028, 1, 1), -1), null);
});

test("all diplomatic and military route kinds use the fixed three-day duration", () => {
  const kinds = [
    "spionase",
    "sabotase",
    "non-aggression-pact",
    "trade-agreement",
    "research-contract",
    "defense-alliance",
    "aid-delivery",
    "icbm",
    "serang",
    "serang-negara",
    "kudeta",
  ];

  for (const diplomacyKind of kinds) {
    const route = estimateTravelTime("Indonesia", "Amerika Serikat", { diplomacyKind });

    assert.ok(route);
    assert.equal(route.days, 3);
  }

  const nearbyRoute = estimateTravelTime("Indonesia", "Malaysia", {
    diplomacyKind: "non-aggression-pact",
  });
  const distantRoute = estimateTravelTime("Indonesia", "Amerika Serikat", {
    diplomacyKind: "non-aggression-pact",
  });
  assert.ok(nearbyRoute && distantRoute);
  assert.equal(nearbyRoute.days, 3);
  assert.equal(distantRoute.days, 3);
});

test("user military attacks use the fixed three-day duration", () => {
  for (const kind of ["serang", "serang-negara"]) {
    const route = estimateTravelTime("Indonesia", "Amerika Serikat", {
      diplomacyKind: kind,
    });

    assert.ok(route);
    assert.equal(route.days, 3);
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
