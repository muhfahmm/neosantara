"use client";

import React, { useEffect } from "react";
import { Info } from "lucide-react";
import { getKerjaSamaOrganisasiRegionalBonusPercent } from "@/app/page/bonus_logic/penelitian_bonus_logic/3_riset_diplomasi_intelijen/4_Kerja Sama Organisasi Regional";
import NotebookModalWrapper from "@/app/page/navigasi_menu/2_navigasi_bawah/NotebookModalWrapper";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";
import MembershipEligibilityPanel from "./2_organisasi_regional/requirementsLogic/MembershipEligibilityPanel";
import {
  EligibilityCountry,
  useOrgMembershipEligibility,
} from "./2_organisasi_regional/requirementsLogic/membershipEligibility";
import { useGeopoliticsMenuTranslation } from "@/app/page/paused_menu/terjemahan_paused_menu/useGeopoliticsMenuTranslation";

interface OrgIntlInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgName: string;
  orgIcon: React.ElementType;
  isMember: boolean;
  countryDetail?: Record<string, unknown> | null;
  selectedCountry?: EligibilityCountry | null;
}

const ORGANIZATION_KEYS: Record<string, string> = {
  "Interpol": "interpol",
  "Organisasi Kesehatan Dunia (WHO)": "who",
  "UNESCO": "unesco",
  "Organisasi Perdagangan Dunia (WTO)": "wto",
  "Organisasi Buruh Internasional (ILO)": "ilo",
  "Organisasi Pangan dan Pertanian (FAO)": "fao",
  "Organisasi Maritim Internasional (IMO)": "imo",
  "Organisasi Telekomunikasi Internasional (ITU)": "itu",
  "Organisasi Meteorologi Dunia (WMO)": "wmo",
  "Perhimpunan Bangsa-Bangsa Asia Tenggara (ASEAN)": "asean",
  "Uni Eropa (EU)": "eu",
  "Liga Arab": "arabLeague",
  "Uni Afrika (AU)": "africanUnion",
  "Organisasi Kerja Sama Islam (OKI)": "oic",
  "BRICS (Brasil, Rusia, India, China, Afrika Selatan)": "brics",
  "Pakta Pertahanan Atlantik Utara (NATO)": "nato",
  "Organisasi Negara-Negara Pengekspor Minyak Bumi (OPEC)": "opec",
  "Kelompok Duapuluh (G20)": "g20",
};

export default function OrgIntlInfoModal({
  isOpen,
  onClose,
  orgName,
  orgIcon: OrgIcon,
  isMember,
  countryDetail,
  selectedCountry,
}: OrgIntlInfoModalProps) {
  const { organizations } = useGeopoliticsMenuTranslation();
  const eligibility = useOrgMembershipEligibility(orgName, selectedCountry, countryDetail, isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === "undefined") return null;

  const orgKey = ORGANIZATION_KEYS[orgName] || "default";
  const benefitValues: Record<string, Record<string, number>> = {
    interpol: { value: -5 }, who: { value: -5 }, unesco: { value: 5 }, wto: { sell: 15, buy: -10 },
    ilo: { value: 10 }, fao: { value: 10 }, imo: { value: 10 }, itu: { value: 5 }, wmo: { value: -5 },
    asean: { value: 10 }, eu: { value: 10 }, arabLeague: { value: 5 }, africanUnion: { value: 10 },
    oic: { value: 10 }, brics: { value: 10 }, nato: { value: 15 }, opec: { value: 20 }, g20: { value: 20 },
  };
  const baseBenefitValues = benefitValues[orgKey] || {};
  const researchBonusPercent = isMember
    ? getKerjaSamaOrganisasiRegionalBonusPercent(countryDetail)
    : 0;
  const adjustedBenefitValues = Object.fromEntries(
    Object.entries(baseBenefitValues).map(([key, value]) => [
      key,
      Number((value * (1 + researchBonusPercent / 100)).toFixed(2)),
    ])
  );
  const hasBenefit = Boolean(baseBenefitValues.value !== undefined || baseBenefitValues.sell !== undefined);
  const benefitParams = Object.fromEntries(
    Object.entries(adjustedBenefitValues).map(([key, value]) => [
      key,
      orgKey === "arabLeague" && key === "value" ? String(value) : `${value > 0 ? "+" : ""}${value}`,
    ])
  );

  return (
    <NotebookModalWrapper
      onClose={onClose}
      compact
      contentSized
      frameClassName="menu-info-content-sized-frame organization-info-content-sized-frame"
      zIndexClass="z-[250]"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="organization-info-title"
        className="flex max-h-[var(--modal-max-height)] min-w-0 flex-col overflow-hidden font-sans"
      >
        <header className="flex items-center justify-between border-b border-root-accent/30 bg-root-canvas px-3 py-2 sm:px-5 sm:py-2.5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="rounded-lg border border-root-accent/30 bg-root-accent/10 p-2 text-root-accent">
              <OrgIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-root-accent">
                <Info className="h-3 w-3" />
                {organizations("info.title")}
              </div>
              <h2 id="organization-info-title" className="text-[length:var(--modal-font-title)] font-bold leading-tight text-root-text">{organizations(`organizationNames.${orgKey}`)}</h2>
            </div>
          </div>
          <div className="ml-3">
            <RootModalCloseButton onClick={onClose} />
          </div>
        </header>

        <div className="organization-info-content space-y-5 bg-root-surface p-4 sm:p-6">
          <section>
            <h3 className="mb-2 text-xs font-black uppercase tracking-widest text-root-accent">{organizations("info.about")}</h3>
            <p className="text-sm leading-relaxed text-root-body">{organizations(`organizationInfo.${orgKey}.description`)}</p>
          </section>
          {eligibility.requirements.length > 0 && <MembershipEligibilityPanel eligibility={eligibility} orgName={orgName} />}
          <section className="rounded-xl border border-root-accent/20 bg-root-canvas p-4">
            <h3 className="mb-2 text-xs font-black uppercase tracking-widest text-root-accent">{organizations("info.focus")}</h3>
            <p className="text-sm leading-relaxed text-root-body">{organizations(`organizationInfo.${orgKey}.focus`)}</p>
          </section>
          {hasBenefit && (
            <section className="flex items-center justify-between rounded-xl border border-root-modal-positive-border bg-root-modal-positive-bg p-4">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-root-modal-positive">{organizations("info.membershipBenefit")}</h3>
                {isMember && researchBonusPercent > 0 && (
                  <p className="mt-1 text-[11px] font-semibold text-root-body">
                    {organizations("info.researchBonus", { percent: researchBonusPercent })}
                  </p>
                )}
                {!isMember && (
                  <p className="mt-1 text-[11px] font-semibold text-root-subtle">{organizations("info.benefitInactive")}</p>
                )}
              </div>
              <span className="text-right text-sm font-black text-root-modal-positive">{organizations(`benefits.${orgKey}`, benefitParams)}</span>
            </section>
          )}
        </div>
      </section>
    </NotebookModalWrapper>
  );
}