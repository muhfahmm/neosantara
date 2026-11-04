"use client";

import { createPortal } from "react-dom";
import { CheckCircle2, Eye, Bomb, XCircle, X } from "lucide-react";
import type { CovertOperationResult } from "./covertOperationLogic";

interface CovertOperationResultModalProps {
  result: CovertOperationResult | null;
  onClose: () => void;
}

export default function CovertOperationResultModal({
  result,
  onClose,
}: CovertOperationResultModalProps) {
  if (!result) return null;

  const operationName = result.operation === "spionase" ? "Spionase" : "Sabotase";
  const OperationIcon = result.operation === "spionase" ? Eye : Bomb;
  const ResultIcon = result.succeeded ? CheckCircle2 : XCircle;
  const resultColor = result.succeeded ? "text-root-accent" : "text-rose-400";

  const modalContent = (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center  p-4 font-sans"
      role="dialog"
      aria-modal="true"
      aria-labelledby="covert-operation-result-title"
    >
      <div className="w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl border border-root-accent/30 bg-root-surface text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-root-accent/20 bg-root-canvas px-5 py-4">
          <div className="flex items-center gap-3">
            <OperationIcon className="h-5 w-5 text-root-accent" />
            <h2 className="text-sm font-black uppercase tracking-wider text-root-accent">
              Hasil Operasi {operationName}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup hasil operasi"
            className="rounded-lg p-1.5 text-root-subtle transition-colors hover:text-root-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-6 text-center">
          <ResultIcon className={`mx-auto h-14 w-14 ${resultColor}`} />
          <div>
            <h3
              id="covert-operation-result-title"
              className={`text-xl font-black uppercase tracking-wide ${resultColor}`}
            >
              {result.succeeded ? "Operasi Berhasil" : "Operasi Gagal"}
            </h3>
            <p className="mt-2 text-sm text-root-text">
              {result.succeeded
                ? `Operasi ${operationName.toLowerCase()} berhasil dilaksanakan di ${result.targetCountry}.`
                : `Operasi ${operationName.toLowerCase()} gagal dilaksanakan di ${result.targetCountry}.`}
            </p>
          </div>
          <p className="text-xs font-semibold text-root-subtle">
            Peluang keberhasilan saat operasi diluncurkan:{" "}
            <span className="font-black text-root-accent">{result.successChance}%</span>
          </p>
        </div>

        <div className="border-t border-root-accent/20 bg-root-canvas p-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-root-accent px-4 py-2.5 text-xs font-black uppercase tracking-widest text-root-canvas transition-colors hover:bg-[#00e699]"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );

  return typeof window !== "undefined"
    ? createPortal(modalContent, document.body)
    : modalContent;
}