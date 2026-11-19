"use client";

import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Send, CheckCircle, ShieldCheck, Globe, Loader2, Clock, AlertTriangle } from "lucide-react";
import NotebookModalWrapper, { APPLICATION_MODAL_VISIBILITY_EVENT } from "@/app/page/navigasi_menu/2_navigasi_bawah/NotebookModalWrapper";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";
import { getApplicationForOrg, submitOrgApplication } from "./orgMembershipLogic";
import type { OrgApplication, OrganizationApplicationType } from "./orgMembershipLogic";
import { getDaysElapsed, formatDate } from "@/app/logic/production_logic";
import { getCurrentGameDateString } from "@/app/logic/gameSessionState";
import DanaTidakCukupOrganisasiModal from "./DanaTidakCukupOrganisasiModal";

interface PermohonanKeanggotaanModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgName: string;
  countryName: string;
  orgIcon?: React.ElementType;
  organizationType: OrganizationApplicationType;
  onSubmitted?: () => void;
  canSubmit?: boolean | null;
  currentBudget: number;
  setCountryDetail?: (
    detail: Record<string, unknown> | ((previous: Record<string, unknown>) => Record<string, unknown>)
  ) => void;
}

export default function PermohonanKeanggotaanModal({
  isOpen,
  onClose,
  orgName,
  countryName,
  orgIcon: Icon = Globe,
  organizationType,
  onSubmitted,
  canSubmit = true,
  currentBudget,
  setCountryDetail,
}: PermohonanKeanggotaanModalProps) {
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentApp, setCurrentApp] = useState<OrgApplication | undefined>(undefined);
  const [isInsufficientFundsOpen, setIsInsufficientFundsOpen] = useState(false);
  const submissionStarted = useRef(false);
  const applicationFee = organizationType === "pbb" ? 1_000_000 : 500_000;

  const getCurrentDateStr = () => {
    return getCurrentGameDateString() || formatDate(new Date());
  };

  const currentDateStr = getCurrentDateStr();

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      submissionStarted.current = false;
      const app = getApplicationForOrg(countryName, orgName);
      setCurrentApp(app);
    }
  }, [isOpen, orgName, countryName]);

  useEffect(() => {
    if (!isOpen) return;

    window.dispatchEvent(new CustomEvent(APPLICATION_MODAL_VISIBILITY_EVENT, { detail: { isOpen: true } }));
    return () => {
      window.dispatchEvent(new CustomEvent(APPLICATION_MODAL_VISIBILITY_EVENT, { detail: { isOpen: false } }));
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = () => {
    if (canSubmit !== true || submissionStarted.current) return;
    if (currentBudget < applicationFee) {
      setIsInsufficientFundsOpen(true);
      return;
    }
    if (!setCountryDetail) {
      console.error("Cannot submit organization application: country budget updater is unavailable.");
      return;
    }
    submissionStarted.current = true;
    setCountryDetail((previous) => ({
      ...previous,
      anggaran: currentBudget - applicationFee,
    }));
    setSubmitting(true);
    setTimeout(() => {
      const app = submitOrgApplication(countryName, orgName, currentDateStr, undefined, organizationType);
      setCurrentApp(app);
      setSubmitting(false);
      if (onSubmitted) {
        onSubmitted();
      }
    }, 1000);
  };

  const daysElapsed = currentApp ? getDaysElapsed(currentApp.submissionDate, currentDateStr) : 0;
  const remainingDays = Math.max(0, 30 - daysElapsed);

  const modalContent = !isInsufficientFundsOpen ? (
    <NotebookModalWrapper
      onClose={onClose}
      compact
      contentSized
      frameClassName="menu-info-content-sized-frame organization-info-content-sized-frame"
      hideWhenApplicationModalOpen={false}
      zIndexClass="z-[250]"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="membership-application-title"
        className="flex max-h-[var(--modal-max-height)] min-w-0 flex-col overflow-hidden font-sans"
      >
        <header className="flex items-center justify-between border-b border-root-accent/30 bg-root-canvas px-3 py-2 sm:px-5 sm:py-2.5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="rounded-lg border border-root-accent/30 bg-root-accent/10 p-2 text-root-accent">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-root-accent">
                Permohonan Keanggotaan
              </div>
              <h2 id="membership-application-title" className="text-[length:var(--modal-font-title)] font-bold leading-tight text-root-text">
                {orgName}
              </h2>
            </div>
          </div>
          <div className="ml-3">
            <RootModalCloseButton onClick={onClose} />
          </div>
        </header>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-root-surface p-4 text-xs text-root-text sm:p-6">
          {currentApp?.status === "pending" ? (
            <div className="py-4 text-center space-y-3">
              <div className="mx-auto w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Clock className="w-8 h-8 animate-pulse" />
              </div>
              <h4 className="text-sm font-black text-amber-400 uppercase tracking-wider">
                Permohonan Sedang Ditinjau (30 Hari)
              </h4>
              <p className="text-xs text-[#8AA4A4] max-w-sm mx-auto leading-relaxed">
                Permohonan keanggotaan negara <span className="text-root-accent font-bold">{countryName}</span> sedang diproses oleh Dewan Anggota <span className="text-root-accent font-bold">{orgName}</span>.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2 text-[11px]">
                <div className="p-3 rounded-xl bg-root-canvas border border-root-accent/20">
                  <span className="text-root-subtle block">Masa Peninjauan</span>
                  <span className="font-extrabold text-root-accent text-sm">{remainingDays} Hari Lagi</span>
                </div>
                <div className="p-3 rounded-xl bg-root-canvas border border-root-accent/20">
                  <span className="text-root-subtle block">Peluang Penerimaan</span>
                  <span className="font-extrabold text-emerald-400 text-sm">{currentApp.approvalRate}%</span>
                </div>
              </div>
            </div>
          ) : currentApp?.status === "accepted" ? (
            <div className="py-4 text-center space-y-3">
              <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-black text-emerald-400 uppercase tracking-wider">
                Permohonan Diterima!
              </h4>
              <p className="text-xs text-[#8AA4A4] max-w-sm mx-auto leading-relaxed">
                Selamat! Permohonan keanggotaan negara <span className="text-root-accent font-bold">{countryName}</span> di <span className="text-root-accent font-bold">{orgName}</span> resmi disetujui (Peluang Penerimaan: {currentApp.approvalRate}%). Seluruh bonus keanggotaan kini telah aktif.
              </p>
            </div>
          ) : currentApp?.status === "rejected" ? (
            <div className="py-4 text-center space-y-3">
              <div className="mx-auto w-14 h-14 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-black text-rose-400 uppercase tracking-wider">
                Permohonan Ditolak
              </h4>
              <p className="text-xs text-[#8AA4A4] max-w-sm mx-auto leading-relaxed">
                Permohonan keanggotaan negara <span className="text-root-accent font-bold">{countryName}</span> sebelumnya ditolak oleh dewan anggota. Anda dapat mencoba mengajukan permohonan keanggotaan kembali.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-root-accent/20 bg-root-canvas p-4 space-y-2">
              <div className="flex items-center gap-2 text-root-accent font-bold">
                <ShieldCheck className="h-4 w-4" />
                <span>Ringkasan Pengajuan Permohonan</span>
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-root-accent/10 pt-1 text-[11px]">
                <div>
                  <span className="text-root-subtle block">Negara Pemohon:</span>
                  <span className="font-bold text-root-text">{countryName || "Indonesia"}</span>
                </div>
                <div>
                  <span className="text-root-subtle block">Organisasi Target:</span>
                  <span className="font-bold text-root-accent">{orgName}</span>
                </div>
                <div>
                  <span className="text-root-subtle block">Waktu Proses:</span>
                  <span className="font-bold text-amber-400">30 Hari Simu</span>
                </div>
                <div>
                  <span className="text-root-subtle block">Estimasi Penerimaan:</span>
                  <span className="font-bold text-emerald-400">Tinggi (65% - 90%)</span>
                </div>
                <div>
                  <span className="text-root-subtle block">Biaya Pengajuan:</span>
                  <span className="font-bold text-amber-400">
                    {applicationFee.toLocaleString("id-ID")} NEO
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <footer className="flex items-center justify-end gap-3 border-t border-root-accent/20 bg-root-canvas px-4 py-3 sm:px-6 sm:py-4">
          <SharedModalCloseButton
            onClick={onClose}
            className="rounded-xl border border-root-accent/30 bg-root-surface px-5 py-2 text-xs font-bold text-root-subtle hover:bg-root-accent hover:text-root-canvas transition-all cursor-pointer uppercase tracking-wider"
           appearance="custom">
            {currentApp?.status === "pending" || currentApp?.status === "accepted" ? "Tutup" : "Batal"}
          </SharedModalCloseButton>
          {(!currentApp || currentApp.status === "rejected") && (
            <button
              onClick={handleSubmit}
              disabled={submitting || canSubmit !== true}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-6 py-2 text-xs font-black text-root-canvas transition-all shadow-md cursor-pointer uppercase tracking-wider disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-root-canvas" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Kirim Permohonan
                </>
              )}
            </button>
          )}
        </footer>
      </section>
    </NotebookModalWrapper>
  ) : null;

  return (
    <>
      {createPortal(modalContent, document.body)}
      <DanaTidakCukupOrganisasiModal
        isOpen={isInsufficientFundsOpen}
        onClose={() => setIsInsufficientFundsOpen(false)}
        requiredCost={applicationFee}
        currentBudget={currentBudget}
      />
    </>
  );
}