"use client";

import RootInfoModalHeader from '@/app/page/root_modals_design_menu/RootInfoModalHeader';
import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
import { createPortal } from "react-dom";
import { CheckCircle2, Bomb, XCircle } from "lucide-react";
import type { SabotaseOperationResult } from "./logic/sabotaseLogic";

interface ResultSabotaseModalsProps {
  result: SabotaseOperationResult | null;
  onClose: () => void;
}

export default function ResultSabotaseModals({
  result,
  onClose,
}: ResultSabotaseModalsProps) {
  if (!result) return null;

  const ResultIcon = result.succeeded ? CheckCircle2 : XCircle;
  const resultColor = result.succeeded ? "text-root-accent" : "text-rose-400";

  const modalContent = (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 font-sans"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sabotase-result-title"
    >
      <div className="modal-responsive-shell overflow-y-auto rounded-2xl border border-rose-500/30 bg-root-surface text-white shadow-2xl">
        <RootInfoModalHeader
          title="Hasil Operasi Sabotase"
          titleId="sabotase-result-header-title"
          onClose={onClose}
          icon={<Bomb className="text-rose-400" />}
          size="standard"
        />

        <div className="space-y-4 p-6 text-center">
          <ResultIcon className={`mx-auto h-14 w-14 ${resultColor}`} />
          <div>
            <h3
              id="sabotase-result-title"
              className={`text-xl font-black uppercase tracking-wide ${resultColor}`}
            >
              {result.succeeded ? "Aksi Sabotase Berhasil" : "Aksi Sabotase Gagal"}
            </h3>
            <p className="mt-2 text-sm text-root-text">
              {result.succeeded
                ? `Operasi sabotase${result.operationTarget ? ` (${result.operationTarget})` : ''} berhasil dilaksanakan di ${result.targetCountry}. Instalasi target telah berhasil diledakkan/dilumpuhkan.`
                : `Operasi sabotase${result.operationTarget ? ` (${result.operationTarget})` : ''} gagal dilaksanakan di ${result.targetCountry}. Tim penyabot digagalkan oleh sistem keamanan lawan.`}
            </p>
          </div>

          {result.succeeded && result.losses && result.losses.length > 0 && (
            <div className="mt-4 rounded-xl border border-rose-500/30 bg-root-canvas p-4 text-left">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-rose-500/20">
                <Bomb className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-black uppercase tracking-wider text-rose-400">
                  Kerugian Alutsista Fasilitas Musuh
                </span>
              </div>
              <p className="text-[11px] text-root-subtle mb-3 leading-relaxed">
                Sabotase berhasil melumpuhkan 5% fasilitas alutsista militer target. Rincian unit yang dihancurkan:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto no-scrollbar pr-1">
                {result.losses.map((loss) => (
                  <div
                    key={loss.unitKey}
                    className="flex items-center justify-between p-2 rounded-lg bg-root-surface border border-root-accent/10 text-xs"
                  >
                    <span className="font-semibold text-root-text capitalize truncate pr-2">
                      {loss.unitKey.replace(/_/g, ' ')}
                    </span>
                    <span className="font-mono font-bold text-rose-400 shrink-0">
                      -{loss.lostQuantity.toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs font-semibold text-root-subtle">
            Peluang keberhasilan saat operasi diluncurkan:{" "}
            <span className="font-black text-rose-400">{result.successChance}%</span>
          </p>
        </div>

        <div className="border-t border-rose-500/20 bg-root-canvas p-4">
          <SharedModalCloseButton
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-white transition-colors"
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
