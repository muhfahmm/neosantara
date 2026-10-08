"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Send, X, CheckCircle, ShieldCheck, FileText, Globe, Loader2, Clock, AlertTriangle } from "lucide-react";
import {
  getApplicationForOrg,
  submitOrgApplication,
  OrgApplication,
} from "./orgMembershipLogic";
import { getDaysElapsed, formatDate } from "@/app/logic/production_logic";

interface PermohonanKeanggotaanModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgName: string;
  countryName: string;
  orgIcon?: React.ElementType;
  onSubmitted?: () => void;
}

export default function PermohonanKeanggotaanModal({
  isOpen,
  onClose,
  orgName,
  countryName,
  orgIcon: Icon = Globe,
  onSubmitted,
}: PermohonanKeanggotaanModalProps) {
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState("");
  const [currentApp, setCurrentApp] = useState<OrgApplication | undefined>(undefined);

  const getCurrentDateStr = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("neosantara_current_game_date") || formatDate(new Date());
    }
    return formatDate(new Date());
  };

  const currentDateStr = getCurrentDateStr();

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      const app = getApplicationForOrg(countryName, orgName);
      setCurrentApp(app);
    }
  }, [isOpen, orgName, countryName]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      const app = submitOrgApplication(countryName, orgName, currentDateStr);
      setCurrentApp(app);
      setSubmitting(false);
      if (onSubmitted) {
        onSubmitted();
      }
    }, 1000);
  };

  const daysElapsed = currentApp ? getDaysElapsed(currentApp.submissionDate, currentDateStr) : 0;
  const remainingDays = Math.max(0, 30 - daysElapsed);

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-[#00FFAA]/40 bg-[#051111] shadow-[0_0_50px_rgba(0,255,170,0.15)] flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-[#00FFAA]/20 bg-[#0A1A1A] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#0F2424] border border-[#00FFAA]/30 text-[#00FFAA]">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-wide text-[#00FFAA]">
                Permohonan Keanggotaan
              </h3>
              <p className="text-[11px] font-bold text-[#6B8A8A]">
                {orgName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#6B8A8A] hover:bg-[#0F2424] hover:text-[#00FFAA] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-5 text-xs text-[#E0E0E0]">
          {currentApp?.status === "pending" ? (
            <div className="py-4 text-center space-y-3">
              <div className="mx-auto w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Clock className="w-8 h-8 animate-pulse" />
              </div>
              <h4 className="text-sm font-black text-amber-400 uppercase tracking-wider">
                Permohonan Sedang Ditinjau (30 Hari)
              </h4>
              <p className="text-xs text-[#8AA4A4] max-w-sm mx-auto leading-relaxed">
                Permohonan keanggotaan negara <span className="text-[#00FFAA] font-bold">{countryName}</span> sedang diproses oleh Dewan Anggota <span className="text-[#00FFAA] font-bold">{orgName}</span>.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2 text-[11px]">
                <div className="p-3 rounded-xl bg-[#0A1A1A] border border-[#00FFAA]/20">
                  <span className="text-[#6B8A8A] block">Masa Peninjauan</span>
                  <span className="font-extrabold text-[#00FFAA] text-sm">{remainingDays} Hari Lagi</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0A1A1A] border border-[#00FFAA]/20">
                  <span className="text-[#6B8A8A] block">Peluang Penerimaan</span>
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
                Selamat! Permohonan keanggotaan negara <span className="text-[#00FFAA] font-bold">{countryName}</span> di <span className="text-[#00FFAA] font-bold">{orgName}</span> resmi disetujui (Peluang Penerimaan: {currentApp.approvalRate}%). Seluruh bonus keanggotaan kini telah aktif.
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
                Permohonan keanggotaan negara <span className="text-[#00FFAA] font-bold">{countryName}</span> sebelumnya ditolak oleh dewan anggota. Anda dapat mencoba mengajukan permohonan keanggotaan kembali.
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-[#00FFAA]/20 bg-[#0A1A1A] p-4 space-y-2">
                <div className="flex items-center gap-2 text-[#00FFAA] font-bold">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Ringkasan Pengajuan Permohonan</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-[#00FFAA]/10">
                  <div>
                    <span className="text-[#6B8A8A] block">Negara Pemohon:</span>
                    <span className="font-bold text-[#E0E0E0]">{countryName || "Indonesia"}</span>
                  </div>
                  <div>
                    <span className="text-[#6B8A8A] block">Organisasi Target:</span>
                    <span className="font-bold text-[#00FFAA]">{orgName}</span>
                  </div>
                  <div>
                    <span className="text-[#6B8A8A] block">Waktu Proses:</span>
                    <span className="font-bold text-amber-400">30 Hari Simu</span>
                  </div>
                  <div>
                    <span className="text-[#6B8A8A] block">Estimasi Penerimaan:</span>
                    <span className="font-bold text-emerald-400">Tinggi (65% - 90%)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#8AA4A4]">
                  <FileText className="h-3.5 w-3.5 text-[#00FFAA]" />
                  <span>Catatan Diplomasi / Lampiran Surat Resmi (Opsional):</span>
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tuliskan pernyataan komitmen dan diplomasi negara Anda..."
                  className="w-full rounded-xl bg-[#0A1A1A] border border-[#00FFAA]/20 p-3 text-xs text-[#E0E0E0] placeholder-[#6B8A8A] focus:border-[#00FFAA] focus:outline-none custom-scrollbar"
                />
              </div>
            </>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-end gap-3 border-t border-[#00FFAA]/20 bg-[#0A1A1A] px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] px-5 py-2 text-xs font-bold text-[#6B8A8A] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all cursor-pointer uppercase tracking-wider"
          >
            {currentApp?.status === "pending" || currentApp?.status === "accepted" ? "Tutup" : "Batal"}
          </button>
          {(!currentApp || currentApp.status === "rejected") && (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-6 py-2 text-xs font-black text-[#0A1A1A] transition-all shadow-md cursor-pointer uppercase tracking-wider disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-[#0A1A1A]" />
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
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}