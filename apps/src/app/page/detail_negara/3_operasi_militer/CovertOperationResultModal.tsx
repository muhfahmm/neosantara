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
  const resultColor = result.succeeded ? "text-[#00FFAA]" : "text-rose-400";

  const modalContent = (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 font-sans"
      role="dialog"
      aria-modal="true"
      aria-labelledby="covert-operation-result-title"
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[#00FFAA]/30 bg-[#0F2424] text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#00FFAA]/20 bg-[#0A1A1A] px-5 py-4">
          <div className="flex items-center gap-3">
            <OperationIcon className="h-5 w-5 text-[#00FFAA]" />
            <h2 className="text-sm font-black uppercase tracking-wider text-[#00FFAA]">
              Hasil Operasi {operationName}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup hasil operasi"
            className="rounded-lg p-1.5 text-[#6B8A8A] transition-colors hover:text-[#00FFAA]"
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
            <p className="mt-2 text-sm text-[#E0E0E0]">
              {result.succeeded
                ? `Operasi ${operationName.toLowerCase()} berhasil dilaksanakan di ${result.targetCountry}.`
                : `Operasi ${operationName.toLowerCase()} gagal dilaksanakan di ${result.targetCountry}.`}
            </p>
          </div>
          <p className="text-xs font-semibold text-[#6B8A8A]">
            Peluang keberhasilan saat operasi diluncurkan:{" "}
            <span className="font-black text-[#00FFAA]">{result.successChance}%</span>
          </p>
        </div>

        <div className="border-t border-[#00FFAA]/20 bg-[#0A1A1A] p-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-[#00FFAA] px-4 py-2.5 text-xs font-black uppercase tracking-widest text-[#0A1A1A] transition-colors hover:bg-[#00e699]"
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
