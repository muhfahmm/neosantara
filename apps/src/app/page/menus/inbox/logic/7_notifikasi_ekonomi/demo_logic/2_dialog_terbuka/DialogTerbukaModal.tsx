import React from 'react';
import { X, MessageSquare, Construction, ShieldAlert, Sparkles } from 'lucide-react';

interface DialogTerbukaModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail?: any;
}

export default function DialogTerbukaModal({ isOpen, onClose }: DialogTerbukaModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-gradient-to-b from-[#0F1E24] to-[#081014] border border-[#00FFAA]/30 shadow-[0_0_50px_rgba(0,255,170,0.15)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#00FFAA]/20 bg-[#00FFAA]/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#00FFAA]/20 text-[#00FFAA] border border-[#00FFAA]/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-wider">
                Forum Dialog Terbuka
              </h3>
              <p className="text-xs text-slate-400">Negosiasi & Mediasi Massa Demonstran</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center text-center space-y-4">
          <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-amber-500/10 border-2 border-dashed border-amber-500/40 text-amber-400">
            <Construction className="w-12 h-12 animate-pulse" />
            <Sparkles className="w-5 h-5 absolute top-2 right-2 text-amber-300 animate-spin" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/30">
              SEDANG DALAM PENGEMBANGAN
            </span>
            <h4 className="text-lg font-bold text-white">
              Ruang Mediasi dan Negosiasi Nasional
            </h4>
            <p className="text-xs text-slate-300 max-w-sm leading-relaxed">
              Fitur dialog interaktif, tuntutan tertulis perwakilan massa demonstran, dan opsi kompromi kebijakan saat ini sedang dipersiapkan dan akan segera hadir pada pembaruan mendatang.
            </p>
          </div>

          <div className="w-full p-3 rounded-xl bg-slate-900/60 border border-slate-700/50 text-[11px] text-slate-400 flex items-center gap-2 text-left">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <span>Pemerintah telah mendengarkan aspirasi demonstran. Forum resmi akan segera difasilitasi oleh kementerian terkait.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-black/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#00FFAA] hover:bg-[#00FFAA]/90 text-black text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,255,170,0.3)] hover:scale-[1.02]"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
