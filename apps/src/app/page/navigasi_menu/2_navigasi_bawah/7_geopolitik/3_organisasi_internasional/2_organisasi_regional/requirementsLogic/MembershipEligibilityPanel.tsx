"use client";

import React from "react";
import { MembershipEligibility } from "./membershipEligibility";

interface MembershipEligibilityPanelProps {
  eligibility: MembershipEligibility;
}

export default function MembershipEligibilityPanel({ eligibility }: MembershipEligibilityPanelProps) {
  if (eligibility.requirements.length === 0) return null;

  return (
    <section className="w-full rounded-xl border border-root-accent/20 bg-root-canvas p-4 shadow-sm">
      <h4 className="mb-3 text-xs font-black uppercase tracking-wider text-root-accent">
        Syarat Keanggotaan
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
              <p className="text-xs font-semibold text-root-body">{item.requirement}</p>
              <div className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${statusClass}`}>
                <span aria-hidden="true" className="font-black">{statusMark}</span>
                <div>
                  <p>{item.reason}</p>
                  {item.detail && <p className="mt-1 font-semibold">{item.detail}</p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {eligibility.loading && (
        <p role="status" className="mt-3 text-[11px] text-root-subtle">Memuat data negara untuk verifikasi syarat...</p>
      )}
      {eligibility.error && (
        <p role="alert" className="mt-3 text-[11px] text-rose-400">{eligibility.error}</p>
      )}
    </section>
  );
}
