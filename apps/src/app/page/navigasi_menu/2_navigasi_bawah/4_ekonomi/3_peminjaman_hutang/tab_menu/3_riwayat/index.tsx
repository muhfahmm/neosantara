"use client";
import React, { useState } from "react";
import { renderFlag, LoanRecord } from "../utils";
import { Info } from "lucide-react";

interface RiwayatProps {
  loanHistory: LoanRecord[];
  kasNegara: number;
  setPendingPaymentLoan: (loan: LoanRecord) => void;
  setPenaltyInfoLoan?: (loan: LoanRecord | null) => void;
  setGeneralPenaltyOpen?: (v: boolean) => void;
}

export default function Riwayat({ loanHistory, kasNegara, setPendingPaymentLoan, setPenaltyInfoLoan, setGeneralPenaltyOpen }: RiwayatProps) {
  const [historySubTab, setHistorySubTab] = useState<"active" | "paid">("active");
  const activeLoans = loanHistory.filter((loan) => loan.status !== "Lunas");
  const paidLoans = loanHistory.filter((loan) => loan.status === "Lunas");

  // 🔥 FUNGSI UNTUK MENGUBAH FORMAT TANGGAL 1/1/2026 MENJADI 1 Jan 2026
  const formatReturnDate = (dateString: string) => {
    if (!dateString) return "-";
    const parts = dateString.split('/');
    if (parts.length !== 3) return dateString;

    const day = parts[0];
    const monthIndex = parseInt(parts[1], 10);
    const year = parts[2];

    // 12 bulan dalam 3 huruf (Bahasa Indonesia)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    const monthName = monthNames[monthIndex - 1] || '???';

    return `${day} ${monthName} ${year}`;
  };

  return (
    <div>
      <div className="bg-[#e4dac3]/40 p-1 rounded-xl border border-[#C4B49C]/40 inline-flex mb-4 shadow-sm">
        <button
          onClick={() => setHistorySubTab("active")}
          className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
            historySubTab === "active" ? "bg-[#5c3c10] text-[#FAF6EE] shadow-md" : "text-[#8b7e66] hover:text-[#5c3c10]"
          }`}
        >
          Hutang Aktif ({activeLoans.length})
        </button>
        <button
          onClick={() => setHistorySubTab("paid")}
          className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
            historySubTab === "paid" ? "bg-[#5c3c10] text-[#FAF6EE] shadow-md" : "text-[#8b7e66] hover:text-[#5c3c10]"
          }`}
        >
          Sudah Lunas ({paidLoans.length})
        </button>
      </div>

      <div className="overflow-x-auto border border-[#C4B49C]/30 rounded-xl bg-[#FAF6EE]/50 shadow-sm">
        <table className="w-full text-xs">
          <thead className="bg-[#efe7d8] border-b-2 border-[#C4B49C]/40 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left font-black text-[#5c3c10] uppercase tracking-wider">Negara</th>
              <th className="px-4 py-3 text-left font-black text-[#5c3c10] uppercase tracking-wider">Pokok Pinjaman</th>
              <th className="px-4 py-3 text-left font-black text-[#5c3c10] uppercase tracking-wider">Bunga Awal</th>
              <th className="px-4 py-3 text-left font-black text-emerald-700 uppercase tracking-wider">Sudah Dibayar</th>
              <th className="px-4 py-3 text-left font-black text-rose-600 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <span>Denda</span>
                  <button
                    onClick={() => setGeneralPenaltyOpen?.(true)}
                    className="p-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 transition-all cursor-pointer"
                    title="Penjelasan Denda"
                    aria-label="Penjelasan Denda"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>
              </th>
              <th className="px-4 py-3 text-left font-black text-[#5c3c10] uppercase tracking-wider">Total Saat Ini</th>
              <th className="px-4 py-3 text-left font-black text-[#5c3c10] uppercase tracking-wider">Jatuh Tempo</th>
              <th className="px-4 py-3 text-left font-black text-[#5c3c10] uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C4B49C]/20">
            {historySubTab === "active" ? (
              activeLoans.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm font-bold text-[#8b7e66]">
                    Tidak ada hutang aktif.
                  </td>
                </tr>
              ) : (
                activeLoans.map((pinjam) => (
                  <tr key={pinjam.id} className="hover:bg-[#e4dac3]/20 transition-colors">
                    <td className="px-4 py-3 font-bold text-[#5c3c10]">
                      <div className="flex items-center gap-2">
                        {renderFlag(pinjam.iso, pinjam.source)}
                        <span>{pinjam.source}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold text-[#5c3c10]">{pinjam.amount?.toLocaleString('id-ID')} EM</td>
                    <td className="px-4 py-3 font-bold text-red-600">{pinjam.interest}%</td>
                    <td className="px-4 py-3 font-bold text-emerald-700">+{(pinjam.paidAmount || 0).toLocaleString('id-ID')} EM</td>
                    <td className="px-4 py-3 font-bold text-rose-600 flex items-center gap-3">
                      <span>+{(pinjam.accumulatedPenalty || 0).toLocaleString('id-ID')} EM</span>
                      <button
                        onClick={() => setPenaltyInfoLoan?.(pinjam)}
                        className="p-2 rounded-full bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 transition-all cursor-pointer"
                        title="Detail Denda"
                        aria-label="Detail Denda"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="px-4 py-3 font-bold text-[#5c3c10]">{(pinjam.totalRepayment || 0).toLocaleString('id-ID')} EM</td>
                    
                    {/* 🔥 BAGIAN INI DIUBAH */}
                    <td className="px-4 py-3 font-bold text-[#5c3c10]">
                      {formatReturnDate(pinjam.returnDate)}
                    </td>

                    <td className="px-4 py-3">
                      <button
                        onClick={() => setPendingPaymentLoan(pinjam)}
                        disabled={pinjam.totalRepayment <= 0 || kasNegara <= 0}
                        className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          pinjam.totalRepayment <= 0 || kasNegara <= 0
                            ? 'bg-[#e4dac3]/50 text-[#8b7e66] cursor-not-allowed'
                            : 'bg-[#5c3c10] text-[#FAF6EE] hover:bg-[#8b7e66]'
                        }`}
                      >
                        Bayar
                      </button>
                    </td>
                  </tr>
                ))
              )
            ) : paidLoans.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-sm font-bold text-[#8b7e66]">
                  Belum ada pinjaman yang dilunasi.
                </td>
              </tr>
            ) : (
              paidLoans.map((pinjam) => (
                <tr key={pinjam.id} className="bg-emerald-50/40 hover:bg-emerald-100/60 transition-colors">
                  <td className="px-4 py-3 font-bold text-[#5c3c10]">
                    <div className="flex items-center gap-2">
                      {renderFlag(pinjam.iso, pinjam.source)}
                      <span>{pinjam.source}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800 text-[8px] font-black uppercase">Lunas</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold text-[#5c3c10]">{pinjam.amount?.toLocaleString('id-ID')} EM</td>
                  <td className="px-4 py-3 font-bold text-[#5c3c10]">{pinjam.interest}%</td>
                  <td className="px-4 py-3 font-bold text-emerald-700">+{(pinjam.paidAmount || 0).toLocaleString('id-ID')} EM</td>
                  <td className="px-4 py-3 font-bold text-[#5c3c10]">+{(pinjam.accumulatedPenalty || 0).toLocaleString('id-ID')} EM</td>
                  <td className="px-4 py-3 font-bold text-emerald-700">{(pinjam.totalRepayment || 0).toLocaleString('id-ID')} EM</td>

                  {/* 🔥 BAGIAN INI JUGA DIUBAH UNTUK TABEL LUNAS */}
                  <td className="px-4 py-3 font-bold text-[#5c3c10]">
                    {formatReturnDate(pinjam.returnDate)}
                  </td>

                  <td className="px-4 py-3">
                    <span className="text-[8px] font-bold text-emerald-700 uppercase">Selesai</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}