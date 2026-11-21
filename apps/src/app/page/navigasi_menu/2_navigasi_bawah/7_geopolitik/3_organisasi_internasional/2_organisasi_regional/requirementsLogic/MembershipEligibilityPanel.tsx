"use client";

import React from "react";
import { MembershipEligibility } from "./membershipEligibility";
import { useGeopoliticsMenuTranslation } from "@/app/page/paused_menu/terjemahan_paused_menu/useGeopoliticsMenuTranslation";

interface MembershipEligibilityPanelProps {
  eligibility: MembershipEligibility;
  orgName: string;
}

const ORGANIZATION_KEYS: Record<string, string> = {
  "Perhimpunan Bangsa-Bangsa Asia Tenggara (ASEAN)": "asean",
  "Uni Eropa (EU)": "eu",
  "Pakta Pertahanan Atlantik Utara (NATO)": "nato",
  "Organisasi Negara-Negara Pengekspor Minyak Bumi (OPEC)": "opec",
  "BRICS (Brasil, Rusia, India, China, Afrika Selatan)": "brics",
  "Kelompok Duapuluh (G20)": "g20",
  "Organisasi Kerja Sama Islam (OKI)": "oic",
  "Liga Arab": "arabLeague",
  "Uni Afrika (AU)": "africanUnion",
};

function countryFromReason(reason: string): string {
  return reason.match(/Negara kamu \((.*?)\)/)?.[1] || "";
}

export default function MembershipEligibilityPanel({ eligibility, orgName }: MembershipEligibilityPanelProps) {
  const { organizations } = useGeopoliticsMenuTranslation();
  if (eligibility.requirements.length === 0) return null;
  const orgKey = ORGANIZATION_KEYS[orgName] || "default";

  const getRequirement = (id: string) => organizations(`eligibility.requirements.${id}.${orgKey}`);
  const getReason = (item: MembershipEligibility["requirements"][number]) => {
    const country = countryFromReason(item.reason);
    if (item.id === "geography") {
      const state = item.passed === null ? "unknown" : item.passed ? "eligible" : "ineligible";
      return organizations(`eligibility.reasons.geography.${orgKey}.${state}`, { country });
    }
    if (item.id === "oil-production") {
      const value = item.reason.match(/(?:sebesar |nilai produksi: )([\d.,]+)/)?.[1] || "";
      const state = item.passed === null ? "unknown" : item.passed ? "eligible" : "ineligible";
      return organizations(`eligibility.reasons.oil.${state}`, { country, value });
    }
    if (item.id === "diplomacy") {
      if (item.passed === null) {
        return organizations(item.reason.startsWith("Mengambil skor")
          ? "eligibility.reasons.diplomacy.loading"
          : "eligibility.reasons.diplomacy.unknown");
      }
      const china = item.detail?.match(/China: ([^;]+)/)?.[1] || "";
      const russia = item.detail?.match(/Rusia: ([^.]+)/)?.[1] || "";
      return organizations(`eligibility.reasons.diplomacy.${item.passed ? "eligible" : "ineligible"}`, { china, russia });
    }
    if (item.id === "gdp-ranking") {
      const rank = item.detail?.match(/: (\d+) dari/)?.[1] || "";
      const total = item.detail?.match(/dari (\d+) negara/)?.[1] || "";
      const state = item.passed === null ? "unknown" : item.passed ? "eligible" : "ineligible";
      return organizations(`eligibility.reasons.gdp.${state}`, { country, rank, total });
    }
    if (item.id === "religion") {
      const religion = item.reason.match(/adalah (.*?), bukan Islam/)?.[1] || "";
      const state = item.passed === null ? "unknown" : item.passed ? "eligible" : "ineligible";
      return organizations(`eligibility.reasons.religion.${state}`, { country, religion });
    }
    return organizations("eligibility.reasons.default");
  };

  return (
    <section className="w-full rounded-xl border border-root-accent/20 bg-root-canvas p-4 shadow-sm">
      <h4 className="mb-3 text-xs font-black uppercase tracking-wider text-root-accent">
        {organizations("eligibility.title")}
      </h4>
      <div className="space-y-3">
        {eligibility.requirements.map((item) => {
          const statusClass = item.passed === true
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
            : item.passed === false
              ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
              : "border-amber-500/30 bg-amber-500/10 text-amber-300";
          const statusMark = item.passed === true ? "✓" : item.passed === false ? "✗" : "?";
          return (
            <div key={item.id} className="space-y-1.5">
              <p className="text-xs font-semibold text-root-body">{getRequirement(item.id)}</p>
              <div className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${statusClass}`}>
                <span aria-hidden="true" className="font-black">{statusMark}</span>
                <div>
                  <p>{getReason(item)}</p>
                  {item.id === "diplomacy" && item.detail && (
                    <p className="mt-1 font-semibold">
                      {organizations("eligibility.reasons.diplomacy.details", {
                        china: item.detail.match(/China: ([^;]+)/)?.[1] || "",
                        russia: item.detail.match(/Rusia: ([^.]+)/)?.[1] || "",
                      })}
                    </p>
                  )}
                  {item.id === "gdp-ranking" && item.detail && (
                    <p className="mt-1 font-semibold">
                      {organizations("eligibility.reasons.gdp.details", {
                        rank: item.detail.match(/: (\d+) dari/)?.[1] || "",
                        total: item.detail.match(/dari (\d+) negara/)?.[1] || "",
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {eligibility.loading && (
        <p role="status" className="mt-3 text-[11px] text-root-subtle">{organizations("eligibility.loading")}</p>
      )}
      {eligibility.error && (
        <p role="alert" className="mt-3 text-[11px] text-rose-400">{organizations("eligibility.error")}</p>
      )}
    </section>
  );
}
