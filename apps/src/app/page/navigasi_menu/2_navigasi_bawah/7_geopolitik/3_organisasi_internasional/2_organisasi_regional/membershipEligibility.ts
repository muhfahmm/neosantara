"use client";

import { useEffect, useMemo, useState } from "react";
import {
  calculateActiveSubsidyCost,
  calculateGoldIncome,
  calculateTotalMinistryCostPerDay,
  calculateTotalTaxIncome,
  getCommercialTotalIncome,
  getTourismTotalIncome,
} from "@/app/logic/economic_logic/treasuryUpdater";
import { applyNpcCountrySimulationState } from "@/app/logic/npc_country_simulation/npcCountrySimulation";
import { COUNTRIES_DATA } from "@/app/page/map_system/map-data";
import {
  getRelationValue,
  hasBaseRelationDataForPair,
} from "../../../../../../../../../json/4_database_hubungan_antar_negara/relationsRegistry";
import {
  SOUTH_EAST_ASIA_ISO_CODES,
  WESTERN_ASIA_OR_NORTHERN_AFRICA_ISO_CODES,
} from "./countryRegions";

export interface EligibilityCountry {
  country?: string | null;
  iso?: string | null;
  continent?: string | null;
}

type CountryRecord = Record<string, unknown>;
export type RequirementPass = boolean | null;

export interface MembershipRequirementStatus {
  id: string;
  requirement: string;
  passed: RequirementPass;
  reason: string;
  detail?: string;
}

export interface MembershipEligibility {
  requirements: MembershipRequirementStatus[];
  canApply: RequirementPass;
  loading: boolean;
  error?: string;
}

type OrganizationKey = "asean" | "eu" | "nato" | "opec" | "brics" | "g20" | "oki" | "arabLeague" | "africanUnion";
type CountryDataState = {
  status: "idle" | "loading" | "loaded" | "error";
  countries: CountryRecord[];
  error?: string;
};

const EMPTY_COUNTRY_DATA: CountryDataState = { status: "idle", countries: [] };

function normalizeText(value: unknown): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function resolveOrganizationKey(orgName: string): OrganizationKey | null {
  const name = normalizeText(orgName);
  if (name.includes("asean")) return "asean";
  if (name.includes("unieropa") || name === "eu") return "eu";
  if (name.includes("nato")) return "nato";
  if (name.includes("opec")) return "opec";
  if (name.includes("brics")) return "brics";
  if (name.includes("g20")) return "g20";
  if (name.includes("oki") || name.includes("kerjasamaislam")) return "oki";
  if (name.includes("ligaarab")) return "arabLeague";
  if (name.includes("uniafrika") || name === "au") return "africanUnion";
  return null;
}

function getCountryName(selectedCountry: EligibilityCountry | null | undefined, countryDetail: CountryRecord | null | undefined): string {
  return String(
    selectedCountry?.country ??
    countryDetail?.country ??
    countryDetail?.name_id ??
    countryDetail?.nama_negara ??
    ""
  ).trim();
}

function getIsoCode(
  selectedCountry: EligibilityCountry | null | undefined,
  countryDetail: CountryRecord | null | undefined,
  countryName: string
): string {
  const supplied = String(selectedCountry?.iso ?? countryDetail?.iso ?? countryDetail?.iso2 ?? "").trim().toLowerCase();
  if (/^[a-z]{2}$/.test(supplied)) return supplied;

  const normalizedName = normalizeText(countryName);
  const found = COUNTRIES_DATA.find((country) => normalizeText(country.country) === normalizedName);
  return found?.iso?.toLowerCase() ?? "";
}

function getContinent(
  selectedCountry: EligibilityCountry | null | undefined,
  countryDetail: CountryRecord | null | undefined,
  countryIso: string,
  countryName: string
): string {
  const supplied = String(countryDetail?.continent ?? selectedCountry?.continent ?? "").trim().toLowerCase();
  if (supplied) return supplied;

  const found = COUNTRIES_DATA.find((country) =>
    country.iso.toLowerCase() === countryIso ||
    normalizeText(country.country) === normalizeText(countryName)
  );
  return String(found?.continent ?? "").trim().toLowerCase();
}

function makeRequirement(
  id: string,
  requirement: string,
  passed: RequirementPass,
  reason: string,
  detail?: string
): MembershipRequirementStatus {
  return { id, requirement, passed, reason, detail };
}

function checkAsean(countryName: string, countryIso: string): MembershipRequirementStatus {
  const requirement = "Hanya negara di kawasan Asia Tenggara yang dapat bergabung.";
  if (!countryIso) {
    return makeRequirement("geography", requirement, null, "Kode ISO negara tidak tersedia; region belum dapat diverifikasi.");
  }
  const passed = SOUTH_EAST_ASIA_ISO_CODES.has(countryIso);
  return makeRequirement(
    "geography",
    requirement,
    passed,
    passed
      ? `Negara kamu (${countryName}) berada di Asia Tenggara.`
      : `Negara kamu (${countryName}) tidak berada di Asia Tenggara.`
  );
}

function checkEuropeanUnion(countryName: string, continent: string): MembershipRequirementStatus {
  const requirement = "Hanya negara di kawasan Eropa yang dapat bergabung.";
  if (!continent) {
    return makeRequirement("geography", requirement, null, "Data benua negara ini belum tersedia.");
  }
  const passed = continent === "europe" || continent === "eropa";
  return makeRequirement(
    "geography",
    requirement,
    passed,
    passed
      ? `Negara kamu (${countryName}) berada di Eropa.`
      : `Negara kamu (${countryName}) tidak berada di Eropa.`
  );
}

function checkNato(countryName: string, continent: string): MembershipRequirementStatus {
  const requirement = "Hanya negara di Amerika Utara atau Eropa yang dapat bergabung.";
  if (!continent) {
    return makeRequirement("geography", requirement, null, "Data benua negara ini belum tersedia.");
  }
  const passed = ["north america", "amerika utara", "europe", "eropa"].includes(continent);
  return makeRequirement(
    "geography",
    requirement,
    passed,
    passed
      ? `Negara kamu (${countryName}) berada di Amerika Utara atau Eropa.`
      : `Negara kamu (${countryName}) tidak berada di Amerika Utara atau Eropa.`
  );
}

function checkOpec(countryName: string, production: number | null): MembershipRequirementStatus {
  const requirement = "Negara harus memiliki produksi minyak bumi.";
  if (production === null) {
    return makeRequirement("oil-production", requirement, null, "Data produksi minyak bumi negara ini belum tersedia.");
  }
  const passed = production > 0;
  return makeRequirement(
    "oil-production",
    requirement,
    passed,
    passed
      ? `Negara kamu (${countryName}) memiliki produksi minyak bumi sebesar ${production.toLocaleString("id-ID")}.`
      : `Negara kamu (${countryName}) tidak memiliki produksi minyak bumi (nilai produksi: ${production.toLocaleString("id-ID")}).`
  );
}

function checkBrics(countryName: string, relationDataRevision: number): MembershipRequirementStatus {
  const requirement = "Skor hubungan dengan China dan Rusia harus sama-sama di atas 50.";
  if (!countryName) {
    return makeRequirement("diplomacy", requirement, null, "Negara yang sedang dimainkan belum dapat diidentifikasi.");
  }
  const hasChinaScore = hasBaseRelationDataForPair(countryName, "China");
  const hasRussiaScore = hasBaseRelationDataForPair(countryName, "Rusia");
  const chinaScore = hasChinaScore ? getRelationValue(countryName, "China") : null;
  const russiaScore = hasRussiaScore ? getRelationValue(countryName, "Rusia") : null;
  const hasAllScores = hasChinaScore && hasRussiaScore;
  const hasFailingScore =
    chinaScore !== null && chinaScore <= 50 ||
    russiaScore !== null && russiaScore <= 50;
  const detail = `Hubungan dengan China: ${chinaScore ?? "belum tersedia"}; dengan Rusia: ${russiaScore ?? "belum tersedia"}.`;
  if (!hasAllScores && !hasFailingScore) {
    return makeRequirement(
      "diplomacy",
      requirement,
      null,
      relationDataRevision > 0
        ? "Data hubungan diplomatik China atau Rusia belum tersedia; kelayakan belum dapat dipastikan."
        : "Mengambil skor China dan Rusia dari tabel hubungan diplomatik.",
      detail
    );
  }
  const passed = hasAllScores &&
    chinaScore !== null && chinaScore > 50 &&
    russiaScore !== null && russiaScore > 50;
  return makeRequirement(
    "diplomacy",
    requirement,
    passed,
    passed
      ? `Skor hubungan dengan China (${chinaScore}) dan Rusia (${russiaScore}) keduanya di atas 50.`
      : `Syarat gagal: hubungan dengan China (${chinaScore ?? "belum tersedia"}) dan Rusia (${russiaScore ?? "belum tersedia"}) harus keduanya di atas 50.`,
    detail
  );
}

function getDisplayName(country: CountryRecord): string {
  return String(country.name_id ?? country.country ?? country.name_en ?? country.country_slug ?? "").trim();
}

function getTaxData(detail: CountryRecord): Record<string, number> {
  const tax = detail.pajak && typeof detail.pajak === "object"
    ? detail.pajak as Record<string, unknown>
    : null;
  const rate = (key: string) => {
    const value = tax?.[key];
    return value && typeof value === "object"
      ? Number((value as Record<string, unknown>).tarif) || 0
      : 0;
  };
  return tax
    ? {
        tarif_ppn: rate("ppn"),
        tarif_korporasi: rate("korporasi"),
        tarif_penghasilan: rate("penghasilan"),
        tarif_bea_cukai: rate("bea_cukai"),
        tarif_lingkungan: rate("lingkungan"),
      }
    : {
        tarif_ppn: Number(detail.ppn ?? detail.tarif_ppn) || 0,
        tarif_korporasi: Number(detail.corporate ?? detail.tarif_korporasi) || 0,
        tarif_penghasilan: Number(detail.income_tax ?? detail.tarif_penghasilan) || 0,
        tarif_bea_cukai: Number(detail.cigarette_tax ?? detail.tarif_bea_cukai) || 0,
        tarif_lingkungan: Number(detail.environment_tax ?? detail.tarif_lingkungan) || 0,
      };
}

function calculateNetPdb(detail: CountryRecord): number {
  const taxData = getTaxData(detail);
  const formattedDetail = {
    ...detail,
    pajak: detail.pajak || {
      ppn: { tarif: taxData.tarif_ppn ?? 10 },
      korporasi: { tarif: taxData.tarif_korporasi ?? 22 },
      penghasilan: { tarif: taxData.tarif_penghasilan ?? 15 },
      bea_cukai: { tarif: taxData.tarif_bea_cukai ?? 15 },
      lingkungan: { tarif: taxData.tarif_lingkungan ?? 5 },
    },
    income_tax: detail.income_tax ?? taxData.tarif_penghasilan,
    corporate: detail.corporate ?? taxData.tarif_korporasi,
    ppn: detail.ppn ?? taxData.tarif_ppn,
    cigarette_tax: detail.cigarette_tax ?? taxData.tarif_bea_cukai,
    environment_tax: detail.environment_tax ?? taxData.tarif_lingkungan,
  };
  const emas = typeof detail.emas === "number" ? detail.emas : 0;
  const tax = calculateTotalTaxIncome(formattedDetail);
  const gold = calculateGoldIncome({ ...detail, emas });
  const commercial = getCommercialTotalIncome(detail);
  const tourism = getTourismTotalIncome(detail);
  const governmentCost = calculateTotalMinistryCostPerDay({ ...detail });
  const subsidyCost = calculateActiveSubsidyCost(detail);
  return tax + gold + commercial + tourism - governmentCost - subsidyCost;
}

function getG20Rank(
  countries: CountryRecord[],
  countryName: string,
  countryIso: string,
  countryDetail: CountryRecord | null | undefined
): { rank: number; total: number } | null {
  const normalizedPlayerName = normalizeText(countryName);
  if (!normalizedPlayerName) return null;
  const rows = countries.map((rawCountry, index) => {
    const country = applyNpcCountrySimulationState(rawCountry) as CountryRecord;
    const name = getDisplayName(country);
    const isoMatches = countryIso && String(country.iso ?? "").toLowerCase() === countryIso;
    const isPlayer = normalizeText(name) === normalizedPlayerName || isoMatches;
    const detail = isPlayer && countryDetail ? countryDetail : country;
    return { name, iso: String(country.iso ?? "").toLowerCase(), netPdb: calculateNetPdb(detail), index };
  });
  const isPlayerRow = (row: typeof rows[number]) =>
    normalizeText(row.name) === normalizedPlayerName || Boolean(countryIso && row.iso === countryIso);
  const playerRowExists = rows.some(isPlayerRow);
  if (!playerRowExists || rows.length === 0) return null;

  rows.sort((a, b) => b.netPdb - a.netPdb || a.index - b.index);
  const rank = rows.findIndex(isPlayerRow) + 1;
  return rank > 0 ? { rank, total: rows.length } : null;
}

function checkG20(
  countryName: string,
  countryIso: string,
  countries: CountryRecord[],
  countryDetail: CountryRecord | null | undefined
): MembershipRequirementStatus {
  const requirement = "Negara harus masuk 20 besar PDB dunia.";
  const ranking = getG20Rank(countries, countryName, countryIso, countryDetail);
  if (!ranking) {
    return makeRequirement("gdp-ranking", requirement, null, "Peringkat PDB negara belum dapat dihitung dari data seluruh negara.");
  }
  const passed = ranking.rank <= 20;
  const detail = `Peringkat Netto PDB: ${ranking.rank} dari ${ranking.total} negara.`;
  return makeRequirement(
    "gdp-ranking",
    requirement,
    passed,
    passed
      ? `Negara kamu (${countryName}) masuk 20 besar Netto PDB dunia.`
      : `Negara kamu (${countryName}) berada di peringkat ${ranking.rank}; syaratnya peringkat 1–20.`,
    detail
  );
}

function checkOki(countryName: string, religion: string): MembershipRequirementStatus {
  const requirement = "Negara harus memiliki Islam sebagai agama utama.";
  if (!religion) {
    return makeRequirement("religion", requirement, null, "Data agama utama negara ini belum tersedia.");
  }
  const normalizedReligion = normalizeText(religion);
  const passed = normalizedReligion === "islam" ||
    normalizedReligion.startsWith("islam") ||
    normalizedReligion.startsWith("muslim");
  return makeRequirement(
    "religion",
    requirement,
    passed,
    passed
      ? `Agama utama negara kamu (${countryName}) adalah Islam.`
      : `Agama utama negara kamu (${countryName}) adalah ${religion}, bukan Islam.`
  );
}

function checkArabLeague(countryName: string, countryIso: string): MembershipRequirementStatus {
  const requirement = "Hanya negara di Timur Tengah atau Afrika Utara yang dapat bergabung.";
  if (!countryIso) {
    return makeRequirement("geography", requirement, null, "Kode ISO negara tidak tersedia; region belum dapat diverifikasi.");
  }
  const passed = WESTERN_ASIA_OR_NORTHERN_AFRICA_ISO_CODES.has(countryIso);
  return makeRequirement(
    "geography",
    requirement,
    passed,
    passed
      ? `Negara kamu (${countryName}) berada di kawasan Western Asia atau Northern Africa menurut UN M49.`
      : `Negara kamu (${countryName}) tidak berada di kawasan Western Asia atau Northern Africa menurut UN M49.`
  );
}

function checkAfricanUnion(countryName: string, continent: string): MembershipRequirementStatus {
  const requirement = "Hanya negara di Benua Afrika yang dapat bergabung.";
  if (!continent) {
    return makeRequirement("geography", requirement, null, "Data benua negara ini belum tersedia.");
  }
  const passed = continent === "africa" || continent === "afrika";
  return makeRequirement(
    "geography",
    requirement,
    passed,
    passed
      ? `Negara kamu (${countryName}) berada di Benua Afrika.`
      : `Negara kamu (${countryName}) tidak berada di Benua Afrika.`
  );
}

function getNumericValue(...values: unknown[]): number | null {
  for (const value of values) {
    if (typeof value !== "number" && typeof value !== "string") continue;
    if (String(value).trim() === "") continue;
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function findCountryProfile(countries: CountryRecord[], countryName: string, countryIso: string): CountryRecord | undefined {
  if (countryIso) {
    const byIso = countries.find((country) => String(country.iso ?? "").toLowerCase() === countryIso);
    if (byIso) return byIso;
  }
  const normalizedName = normalizeText(countryName);
  return countries.find((country) =>
    [country.name_id, country.country, country.name_en, country.country_slug]
      .some((value) => normalizeText(value) === normalizedName)
  );
}

function evaluateRequirements(
  key: OrganizationKey,
  selectedCountry: EligibilityCountry | null | undefined,
  countryDetail: CountryRecord | null | undefined,
  countries: CountryRecord[],
  countryDataReady: boolean,
  relationDataRevision: number
): MembershipRequirementStatus[] {
  const countryName = getCountryName(selectedCountry, countryDetail);
  const countryIso = getIsoCode(selectedCountry, countryDetail, countryName);
  const continent = getContinent(selectedCountry, countryDetail, countryIso, countryName);
  const profile = findCountryProfile(countries, countryName, countryIso);

  switch (key) {
    case "asean":
      return [checkAsean(countryName, countryIso)];
    case "eu":
      return [checkEuropeanUnion(countryName, continent)];
    case "nato":
      return [checkNato(countryName, continent)];
    case "opec":
      return [checkOpec(
        countryName,
        getNumericValue(countryDetail?.minyak_bumi, profile?.minyak_bumi)
      )];
    case "brics":
      return [checkBrics(countryName, relationDataRevision)];
    case "g20":
      return [countryDataReady
        ? checkG20(countryName, countryIso, countries, countryDetail)
        : makeRequirement(
            "gdp-ranking",
            "Negara harus masuk 20 besar PDB dunia.",
            null,
            "Peringkat PDB sedang dimuat."
          )];
    case "oki": {
      const religion = String(
        countryDetail?.religion ??
        countryDetail?.agama_utama ??
        profile?.religion ??
        profile?.agama_utama ??
        ""
      ).trim();
      return [checkOki(countryName, religion)];
    }
    case "arabLeague":
      return [checkArabLeague(countryName, countryIso)];
    case "africanUnion":
      return [checkAfricanUnion(countryName, continent)];
  }
}

export function useOrgMembershipEligibility(
  orgName: string,
  selectedCountry: EligibilityCountry | null | undefined,
  countryDetail: CountryRecord | null | undefined,
  enabled = true
): MembershipEligibility {
  const organizationKey = resolveOrganizationKey(orgName);
  const needsCountryData = organizationKey === "opec" || organizationKey === "oki" || organizationKey === "g20";
  const [countryData, setCountryData] = useState<CountryDataState>(EMPTY_COUNTRY_DATA);
  const [relationDataRevision, setRelationDataRevision] = useState(0);

  useEffect(() => {
    if (!enabled || !needsCountryData) return;

    let active = true;
    fetch("/api/country-data?all=true")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Data negara gagal dimuat (HTTP ${response.status}).`);
        }
        const data: unknown = await response.json();
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error("API tidak mengembalikan data seluruh negara.");
        }
        if (active) {
          setCountryData({ status: "loaded", countries: data as CountryRecord[] });
        }
      })
      .catch((error: unknown) => {
        if (!active) return;
        const message = error instanceof Error ? error.message : String(error);
        setCountryData({ status: "error", countries: [], error: message });
      });

    return () => {
      active = false;
    };
  }, [enabled, needsCountryData]);

  useEffect(() => {
    if (!enabled || organizationKey !== "brics" || typeof window === "undefined") return;
    const handleRelationsUpdated = () => setRelationDataRevision((revision) => revision + 1);
    window.addEventListener("country_relations_updated", handleRelationsUpdated);
    return () => window.removeEventListener("country_relations_updated", handleRelationsUpdated);
  }, [enabled, organizationKey]);

  const result = useMemo(() => {
    if (!organizationKey) {
      return { requirements: [], canApply: null };
    }
    const countryDataReady = countryData.status === "loaded";
    const requirements = evaluateRequirements(
      organizationKey,
      selectedCountry,
      countryDetail,
      countryData.countries,
      countryDataReady,
      relationDataRevision
    );
    const canApply = requirements.some((item) => item.passed === false)
      ? false
      : requirements.every((item) => item.passed === true)
        ? true
        : null;
    return { requirements, canApply };
  }, [organizationKey, selectedCountry, countryDetail, countryData, relationDataRevision]);

  return {
    ...result,
    loading: enabled && needsCountryData && countryData.status !== "loaded" && countryData.status !== "error",
    error: needsCountryData ? countryData.error : undefined,
  };
}
