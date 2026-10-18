'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface TradeRejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerCountry: string;
  tradeType: 'jual' | 'beli'; // Tipe perdagangan yang ditolak
  reason?: 'closed_system' | 'high_centralization' | 'custom';
  customReason?: string;
}

/**
 * Modal penolakan tawaran perdagangan karena sistem ekonomi negara tertutup
 * Ditampilkan ketika user mencoba menerima trade offer tapi ekonomi tertutup
 */
export default function TradeRejectionModal({
  isOpen,
  onClose,
  partnerCountry,
  tradeType,
  reason = 'closed_system',
  customReason,
}: TradeRejectionModalProps) {
  if (!isOpen) return null;

  const isClosedEconomy = reason === 'closed_system';
  const isHighCentralization = reason === 'high_centralization';

  const getReasonDetails = () => {
    if (isClosedEconomy) {
      return {
        title: 'SISTEM EKONOMI TERTUTUP',
        description: `Negara Anda menganut sistem ekonomi tertutup. Perdagangan internasional dengan ${partnerCountry} tidak dapat dilakukan sampai sistem ekonomi diubah ke model yang lebih terbuka.`,
        recommendations: [
          'Ubah sistem ekonomi di menu Kebijakan Ekonomi',
          'Turunkan skor sentralisasi ekonomi hingga di bawah 85',
          'Pertimbangkan ideologi dan agama yang lebih liberal',
        ],
      };
    }

    if (isHighCentralization) {
      return {
        title: 'SENTRALISASI EKONOMI TERLALU TINGGI',
        description: `Perdagangan internasional dengan ${partnerCountry} tidak dapat dilakukan karena tingkat sentralisasi ekonomi Negara Anda terlalu tinggi (> 85). Kurangi kontrol pusat terhadap sektor-sektor ekonomi untuk membuka peluang perdagangan global.`,
        recommendations: [
          'Desentralisasi sektor-sektor ekonomi strategis',
          'Perkuat ekonomi lokal dan swasta di berbagai daerah',
          'Tinjau kembali kebijakan ekonomi yang terlalu tersentralisasi',
          'Pertimbangkan ideologi yang lebih liberal atau demokratis',
        ],
      };
    }

    return {
      title: 'PENOLAKAN PERJANJIAN PERDAGANGAN',
      description: customReason || 'Perjanjian perdagangan tidak dapat diterima saat ini.',
      recommendations: [],
    };
  };

  const details = getReasonDetails();

  return (
    <div className="fixed inset-0 z-[500000] flex items-center justify-center p-4 bg-transparent pointer-events-none">
      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-2xl bg-gradient-to-br from-[#0A1A1A] via-[#0F2424] to-[#0A1A1A] border border-red-500/30 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto">
        {/* Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-red-900/20 to-transparent border-b border-red-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/20 border border-red-500/40">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <h2 className="text-xl font-black text-red-400 uppercase tracking-wider">
              {details.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl border border-red-500/30 bg-red-900/20 text-red-400 hover:bg-red-900/40 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Penolakan Info */}
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/20">
              <p className="text-sm font-medium text-slate-200 leading-relaxed">
                <span className="text-red-400 font-bold">Perjanjian Ditolak: </span>
                {details.description}
              </p>
            </div>

            {/* Partner Info */}
            <div className="p-3 rounded-lg bg-[#0F2424] border border-slate-700/40 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">
                  Mitra Perdagangan
                </p>
                <p className="text-sm font-bold text-slate-100 mt-1">
                  {partnerCountry}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">
                  Tipe Perdagangan
                </p>
                <p className="text-sm font-bold text-amber-400 mt-1 uppercase">
                  {tradeType === 'jual' ? 'Penjualan' : 'Pembelian'}
                </p>
              </div>
            </div>
          </div>

          {/* Rekomendasi (jika ada) */}
          {details.recommendations.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                ✨ Saran untuk Membuka Ekonomi:
              </p>
              <div className="space-y-2">
                {details.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="flex gap-3 p-3 rounded-lg bg-slate-900/30 border border-slate-700/40"
                  >
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#00FFAA]/20 border border-[#00FFAA]/40 flex items-center justify-center mt-0.5">
                      <span className="text-[10px] font-bold text-[#00FFAA]">
                        {idx + 1}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed pt-0.5">
                      {rec}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Box - Status Sistem Ekonomi */}
          <div className="p-4 rounded-lg bg-blue-950/20 border border-blue-500/30">
            <p className="text-[10px] font-bold text-blue-300 uppercase tracking-wider mb-2">
              ℹ️ Informasi Sistem Ekonomi
            </p>
            <ul className="space-y-1.5 text-xs text-blue-200">
              <li>
                • Hanya negara dengan sistem ekonomi <span className="font-bold">TERBUKA</span> atau{' '}
                <span className="font-bold">LIBERAL</span> yang dapat melakukan perdagangan global
              </li>
              <li>
                • Perubahan sistem ekonomi dapat dilakukan di menu{' '}
                <span className="font-bold">Navigasi &gt; Kebijakan Ekonomi</span>
              </li>
              <li>
                • Skor sentralisasi ekonomi harus di bawah 85 untuk membuka perdagangan
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gradient-to-r from-red-900/10 to-transparent border-t border-red-500/20 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 text-xs font-black uppercase tracking-wider rounded-xl border border-red-500/40 bg-red-950/40 text-red-300 hover:bg-red-950/60 transition-all cursor-pointer flex items-center gap-2"
          >
            <X className="w-3 h-3" />
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );
}
