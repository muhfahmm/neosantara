"use client"
import React from "react";
import { X } from "lucide-react";
import { PartnerOffer } from "../PerdaganganModal";

import { COUNTRIES_DATA } from "../../../../../map_system/map-data";

interface TawaranPembelianTableProps {
  offers: PartnerOffer[];
  onAcceptOffer: (offer: PartnerOffer) => void;
  onClose: () => void;
  currentDate: Date; // <--- TAMBAHAN: Ambil tanggal simulasi saat ini
}

// Helper formatting
const formatLabel = (key: string) => key.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase());

const getFlagEmoji = (countryName: string) => {
  const matched = COUNTRIES_DATA.find(c => c.country.toLowerCase().trim() === countryName.toLowerCase().trim());
  if (!matched || !matched.iso) return "";
  const codePoints = matched.iso.toUpperCase().split('').map(c => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

export default function TawaranPembelianTable({ offers, onAcceptOffer, onClose, currentDate }: TawaranPembelianTableProps) {
  return (
    <div className="mb-8 border border-[#00FFAA]/30 rounded-xl overflow-hidden animate-in fade-in zoom-in duration-300 bg-[#0F2424]">
      <div className="bg-[#0A1A1A] px-6 py-3 flex justify-between items-center text-[#00FFAA] text-xs font-black uppercase tracking-wider border-b border-[#00FFAA]/20">
        <span>Tawaran Khusus dari Mitra Dagang</span>
        <button onClick={onClose} className="hover:text-rose-400 transition-colors cursor-pointer">
          <X className="h-4 w-4" />
        </button>
      </div>
      <table className="w-full text-left">
        <thead>
          <tr className="bg-[#0A1A1A] border-b border-[#00FFAA]/20">
            <th className="px-4 py-2.5 text-[10px] font-black text-[#00FFAA] uppercase tracking-wider">Mitra</th>
            <th className="px-4 py-2.5 text-[10px] font-black text-[#00FFAA] uppercase tracking-wider">Produk</th>
            <th className="px-4 py-2.5 text-[10px] font-black text-[#00FFAA] uppercase tracking-wider">Kuantitas</th>
            <th className="px-4 py-2.5 text-[10px] font-black text-[#00FFAA] uppercase tracking-wider">Harga/Unit</th>
            <th className="px-4 py-2.5 text-[10px] font-black text-[#00FFAA] uppercase tracking-wider">Total Biaya</th>
            <th className="px-4 py-2.5 text-[10px] font-black text-[#00FFAA] uppercase tracking-wider text-center">Aksi</th>
          </tr>
        </thead>
        <tbody className="bg-[#0F2424] divide-y divide-[#00FFAA]/10">
          {offers.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-xs text-[#6B8A8A] font-semibold">
                Belum ada tawaran masuk saat ini.
              </td>
            </tr>
          ) : (
            offers.map((offer) => {
              // Logika pengecekan apakah tawaran sudah melewati 30 hari
              const offerEndDate = new Date(offer.validUntil);
              const isExpired = currentDate > offerEndDate;

              return (
                <tr key={offer.id} className="hover:bg-[#00FFAA]/5 transition-colors">
                  <td className="px-4 py-3 text-xs font-semibold text-[#E0E0E0] flex items-center gap-3">
                    {(() => {
                      const matched = COUNTRIES_DATA.find(c => c.country.toLowerCase().trim() === offer.partnerName.toLowerCase().trim());
                      const iso = matched?.iso;
                      if (!iso || iso.length !== 2) {
                        return (
                          <div className="w-8 h-5 rounded-sm bg-[#0A1A1A] border border-[#00FFAA]/20 flex-shrink-0" />
                        );
                      }
                      return (
                        <div className="w-8 h-5 rounded-sm overflow-hidden border border-[#00FFAA]/30 flex-shrink-0 bg-[#0A1A1A] relative">
                          <img
                            src={`https://flagcdn.com/w80/${iso.toLowerCase()}.png`}
                            alt={offer.partnerName}
                            className="w-full h-full object-cover absolute inset-0"
                          />
                        </div>
                      );
                    })()}
                    <span>{offer.partnerName}</span>
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-[#00FFAA]">{formatLabel(offer.productKey)}</td>
                  <td className="px-4 py-3 text-xs font-semibold text-[#E0E0E0]">{offer.quantity.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs text-[#6B8A8A]">{offer.pricePerUnit.toLocaleString("id-ID")} EM</td>
                  <td className="px-4 py-3 text-xs font-bold text-[#00FFAA]">{offer.totalPrice.toLocaleString("id-ID")} EM</td>
                  <td className="px-4 py-3 flex justify-center">
                    {!isExpired ? (
                      <button
                        onClick={() => onAcceptOffer(offer)}
                        className="px-3 py-1.5 rounded bg-[#00FFAA] hover:bg-[#00FFAA]/80 text-[#0A1A1A] text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Terima
                      </button>
                    ) : (
                      <span className="px-3 py-1.5 rounded bg-[#0A1A1A] text-[#6B8A8A] text-[10px] font-bold uppercase cursor-not-allowed border border-[#6B8A8A]/30">
                        Kadaluwarsa
                      </span>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}