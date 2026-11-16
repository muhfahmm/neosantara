"use client";

import RootInfoModalHeader from '@/app/page/root_modals_design_menu/RootInfoModalHeader';
import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
import { createPortal } from "react-dom";
import { CheckCircle2, Eye, XCircle } from "lucide-react";
import type { SpionaseOperationResult } from "./logic/spionaseLogic";
import EconomicIntelReportPanel from "./EconomicIntelReportPanel";
import MilitaryIntelReportPanel from "./MilitaryIntelReportPanel";

interface ResultSpionaseModalsProps {
  result: SpionaseOperationResult | null;
  onClose: () => void;
}

export default function ResultSpionaseModals({
  result,
  onClose,
}: ResultSpionaseModalsProps) {
  if (!result) return null;

  const ResultIcon = result.succeeded ? CheckCircle2 : XCircle;
  const resultColor = result.succeeded ? "text-root-accent" : "text-rose-400";

  const modalContent = (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 font-sans"
      role="dialog"
      aria-modal="true"
      aria-labelledby="spionase-result-title"
    >
      <div className="modal-responsive-shell overflow-y-auto rounded-2xl border border-root-accent/30 bg-root-surface text-white shadow-2xl">
        <RootInfoModalHeader
          title="Hasil Operasi Spionase"
          titleId="spionase-result-header-title"
          onClose={onClose}
          icon={<Eye />}
          size="standard"
        />

        <div className="space-y-4 p-6 text-center">
          <ResultIcon className={`mx-auto h-14 w-14 ${resultColor}`} />
          <div>
            <h3
              id="spionase-result-title"
              className={`text-xl font-black uppercase tracking-wide ${resultColor}`}
            >
              {result.succeeded ? "Misi Spionase Berhasil" : "Misi Spionase Gagal"}
            </h3>
            <p className="mt-2 text-sm text-root-text">
              {result.succeeded
                ? `Operasi spionase${result.operationTarget ? ` (${result.operationTarget})` : ''} berhasil dilaksanakan di ${result.targetCountry}. Agen intelijen kami berhasil mengumpulkan informasi rahasia sasaran.`
                : `Operasi spionase${result.operationTarget ? ` (${result.operationTarget})` : ''} gagal dilaksanakan di ${result.targetCountry}. Agen intelijen terdeteksi oleh otoritas keamanan setempat.`}
            </p>
          </div>

          {result.succeeded && result.militaryReport && (
            <MilitaryIntelReportPanel report={result.militaryReport} />
          )}
          {result.succeeded && result.economicReport && (
            <EconomicIntelReportPanel report={result.economicReport} />
          )}

          <p className="text-xs font-semibold text-root-subtle">
            Peluang keberhasilan saat operasi diluncurkan:{" "}
            <span className="font-black text-root-accent">{result.successChance}%</span>
          </p>
        </div>

        <div className="border-t border-root-accent/20 bg-root-canvas p-4">
          <SharedModalCloseButton
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-root-accent px-4 py-2.5 text-xs font-black uppercase tracking-widest text-root-canvas transition-colors hover:bg-[#00e699]"
            appearance="custom"
          >
            Tutup
          </SharedModalCloseButton>
        </div>
      </div>
    </div>
  );

  return typeof window !== "undefined"
    ? createPortal(modalContent, document.body)
    : modalContent;
}
