"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getTravelOilCost,
  type TravelFuelRate,
  type TravelFuelType,
} from "./travelFuelLogic";

interface TravelFuelQuoteState {
  origin: string;
  target: string;
  rate: TravelFuelRate | null;
  fallback: boolean;
}

let hasWarnedAboutTravelFuelFallback = false;

const normalizeCountrySlug = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

function isTravelFuelRate(value: unknown): value is TravelFuelRate {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return typeof row.country_slug === "string" &&
    typeof row.target_country_slug === "string" &&
    typeof row.konsumsi_minyak === "number" &&
    Number.isFinite(row.konsumsi_minyak) &&
    row.konsumsi_minyak >= 0;
}

export function useTravelFuelQuote(
  playerCountry: string,
  targetCountry: string,
  travelType: TravelFuelType,
  isOpen: boolean,
) {
  const [state, setState] = useState<TravelFuelQuoteState | null>(null);

  useEffect(() => {
    if (!isOpen || !playerCountry || !targetCountry) {
      return;
    }

    const controller = new AbortController();
    const origin = normalizeCountrySlug(playerCountry);
    const target = normalizeCountrySlug(targetCountry);

    async function loadRate() {
      try {
        const query = new URLSearchParams({ origin, target });
        const response = await fetch(`/api/travel-fuel-data?${query}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Travel fuel query failed with status ${response.status}`);
        }

        const payload: unknown = await response.json();
        if (!isTravelFuelRate(payload)) {
          throw new Error("Invalid travel fuel rate response");
        }
        setState({ origin, target, rate: payload, fallback: false });
      } catch (error) {
        if (controller.signal.aborted) return;
        if (!hasWarnedAboutTravelFuelFallback) {
          console.warn(
            "[TravelFuel] Database rate unavailable; using the coordinate-based fallback.",
            error,
          );
          hasWarnedAboutTravelFuelFallback = true;
        }
        setState({ origin, target, rate: null, fallback: true });
      }
    }

    void loadRate();
    return () => controller.abort();
  }, [isOpen, playerCountry, targetCountry, travelType]);

  const origin = playerCountry ? normalizeCountrySlug(playerCountry) : "";
  const target = targetCountry ? normalizeCountrySlug(targetCountry) : "";
  const hasCurrentQuote = Boolean(
    state && state.origin === origin && state.target === target,
  );
  const loading = isOpen && Boolean(origin && target) && !hasCurrentQuote;

  const cost = useMemo(
    () => playerCountry && targetCountry
      ? getTravelOilCost(
        playerCountry,
        targetCountry,
        travelType,
        hasCurrentQuote ? state?.rate ?? null : null,
      )
      : null,
    [playerCountry, targetCountry, travelType, hasCurrentQuote, state?.rate],
  );

  return {
    cost,
    loading,
    fallback: !loading && (!hasCurrentQuote || state?.fallback === true),
  };
}
