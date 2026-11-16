import assert from "node:assert/strict";
import test from "node:test";
import { estimateTravelTime } from "./time_logic.ts";

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
