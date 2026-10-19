import React from 'react';
import { createPortal } from 'react-dom';
import { ShieldAlert, AlertTriangle, X } from 'lucide-react';

interface KonfirmasiAparatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  cost?: number;
}

export default function KonfirmasiAparatModal({
  isOpen,
  onClose,
  onConfirm,
  cost = 250000,
}: KonfirmasiAparatModalProps) {
  if (typeof window === 'undefined' || !isOpen) return null;

  return createPortal(
    // bg-black/80 dan backdrop-blur-sm telah dihapus
    <div className="fixed inset-0 z-[500000] flex items-center justify-center p-4 pointer-events-auto animate-fade-in font-sans">
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-gradient-to-b from-[#1A0A0E] via-[#120508] to-[#0A0304] border border-rose-500/50 shadow-[0_0_50px_rgba(244,63,94,0.25)] flex flex-col"
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-rose-500/30 flex items-center justify-between bg-rose-950/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl border border-rose-500/40 bg-rose-900/40 text-rose-400">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-black tracking-wider uppercase text-rose-300">
                🚨 KONFIRMASI OPERASI APARAT
              </h2>
              <p className="text-[10px] text-rose-400/80 uppercase font-semibold">Tindakan Keamanan & Penertiban Massa</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-left">
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-200 leading-relaxed space-y-2">
            <p className="font-medium">
              Anda akan mengerahkan aparat kepolisian dan militer untuk membubarkan massa. Tindakan ini akan menghabiskan kas negara sebesar <strong className="text-white font-black">{cost.toLocaleString('id-ID')} NEO</strong> dan mencoreng citra demokrasi.
            </p>
            <div className="pt-2 border-t border-rose-500/20 text-[11px] text-rose-300 flex items-start gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Peringatan: Berpotensi menimbulkan korban jiwa, kecaman internasional (HAM), atau eskalasi menjadi kerusuhan massal jika keamanan rendah!</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 text-center font-bold uppercase tracking-wider">
            Apakah Anda yakin ingin melanjutkan operasi ini?
          </p>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-rose-500/30 bg-[#0A0304] flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2 rounded-xl border border-rose-500 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(244,63,94,0.4)] cursor-pointer hover:scale-[1.02]"
          >
            Ya, Bubarkan!
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}