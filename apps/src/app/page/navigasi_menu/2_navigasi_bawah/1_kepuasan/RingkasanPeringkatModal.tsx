"use client";

import { AlertTriangle, Info, ShieldAlert, Star, TrendingDown } from "lucide-react";
import {
  countLowSatisfactionSectors,
  calculateKeterbukaanScore,
} from "@/app/logic/kepuasanCalculator";
import { getDecayMultiplierFromSatisfaction } from "@/app/logic/peringkatCalculator";
import { applyKementerianKebudayaanDecayMultiplierBonus } from "@/app/page/bonus_logic";
import NotebookModalWrapper from "../NotebookModalWrapper";
import { rootBorderRadius } from "@/app/page/root_modals_design_menu/rootBorderRadius";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";

interface RingkasanPeringkatModalProps {
  isOpen: boolean;
  onClose: () => void;
  presidentRating: number;
  countryDetail: Record<string, any> | null;
  metadata?: Record<string, any>;
}

const PENALTY_SECTIONS = [
  {
    title: "Decay otomatis seiring waktu",
    amount: "Counter bulat = poin berkurang",
    detail: "Counter bertambah tiap bulan sesuai multiplier. Beberapa bulan sekaligus bisa menurunkan beberapa poin.",
  },
  {
    title: "Sektor kepuasan rendah",
    amount: "−2 per sektor, setiap 6 bulan (maksimal −10)",
    detail:
      "Ambang <25 untuk 9 sektor: pajak, harga, pangan, listrik, hunian, layanan publik, kesehatan, hukum, keterbukaan. Nilai awal layanan publik (11), kesehatan (12), dan hukum (5) sudah di bawah ambang.",
  },
  {
    title: "Demonstrasi yang belum ditangani",
    amount: "−1 per demonstrasi per hari simulasi",
    detail: "Dihitung selama demo berstatus aktif, diabaikan, atau belum berstatus; tidak berlaku untuk demo selesai/kerusuhan.",
  },
  {
    title: "Pembubaran demonstrasi dengan aparat",
    amount: "−2 / −5 / −5 / −10 / −20; dapat bertambah −5",
    detail: "Urutan metode: water cannon, gas air mata, jam malam, Brimob, militer. Kegagalan yang memicu kerusuhan menambah −5.",
  },
  {
    title: "Menolak bantuan bencana atau wabah",
    amount: "−4 per penolakan",
    detail: "Dikenakan saat bantuan pada notifikasi bencana alam atau wabah ditolak/diabaikan.",
  },
  {
    title: "Bencana atau wabah kedaluwarsa tanpa penanganan",
    amount: "−1 per kejadian",
    detail: "Sekali saat event berakhir tanpa penanganan maupun penolakan tercatat.",
  },
  {
    title: "Skandal korupsi baru",
    amount: "−1 ringan / −2 sedang / −4 berat",
    detail: "Dikenakan saat skandal baru muncul pada proses bulanan; skandal lama tidak mengulang penalti.",
  },
];

export default function RingkasanPeringkatModal({
  isOpen,
  onClose,
  presidentRating,
  countryDetail,
  metadata = {},
}: RingkasanPeringkatModalProps) {
  if (!isOpen) return null;

  const satisfaction = Number(countryDetail?.kepuasan ?? 50);
  const lowSectorCount = countLowSatisfactionSectors(countryDetail, metadata);
  const opennessScore = calculateKeterbukaanScore(countryDetail);
  const baseMultiplier = getDecayMultiplierFromSatisfaction(
    satisfaction,
    opennessScore,
    0,
    lowSectorCount,
  );
  const finalMultiplier = applyKementerianKebudayaanDecayMultiplierBonus(
    baseMultiplier,
    countryDetail,
  );
  const ratingColor = presidentRating >= 60
    ? "text-emerald-400"
    : presidentRating >= 40
      ? "text-yellow-400"
      : "text-rose-400";

  return (
    <NotebookModalWrapper onClose={onClose}>
      <div className="flex h-full flex-col overflow-hidden rounded-xl border border-root-accent/20 bg-root-canvas shadow-[0_0_30px_rgba(0,255,170,0.15)]">
        <div className="relative z-10 flex shrink-0 items-center justify-between gap-2 rounded-t-2xl border-b border-root-accent/20 bg-root-canvas px-4 py-2.5 sm:px-6 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="shrink-0 rounded-lg border border-root-accent/30 bg-root-surface p-1.5 shadow-[0_0_10px_rgba(0,255,170,0.2)]">
              <Star className="h-4 w-4 fill-root-accent text-root-accent sm:h-5 sm:w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold uppercase leading-none tracking-tight text-root-accent drop-shadow-[0_0_8px_rgba(0,255,170,0.5)] sm:text-xl">
                Peringkat Presiden
              </h2>
              <p className="mt-1 text-[9px] font-semibold text-root-subtle sm:text-[10px]">
                Rincian penyebab perubahan nilai peringkat
              </p>
            </div>
          </div>
          <RootModalCloseButton onClick={onClose} />
        </div>

        <div className="relative z-10 flex-1 space-y-4 overflow-y-auto bg-root-canvas/80 p-3 sm:space-y-5 sm:p-5 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-root-canvas [&::-webkit-scrollbar-thumb]:bg-root-accent [&::-webkit-scrollbar-track]:bg-root-canvas">
          <section className={`relative overflow-hidden ${rootBorderRadius.card} border border-root-accent/30 bg-root-surface p-4 shadow-[inset_0_0_20px_rgba(0,255,170,0.03)] sm:p-5`}>

            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="mb-1 text-[10px] font-black uppercase tracking-wider text-root-subtle sm:text-xs">
                  Nilai saat ini
                </p>
                <p className={`text-3xl font-black tracking-tight sm:text-4xl ${ratingColor}`}>
                  {Math.round(presidentRating)}
                  <span className="ml-1 text-sm font-bold text-root-subtle">/100</span>
                </p>
              </div>
              <div className="rounded-lg border border-root-accent/20 bg-root-canvas px-3 py-2 text-right">
                <p className="text-[9px] font-black uppercase tracking-wider text-root-subtle">Decay terhitung</p>
                <p className="mt-1 text-sm font-black text-root-accent">
                  {finalMultiplier.toFixed(2)} counter/bulan
                </p>
              </div>
            </div>
            <p className="relative z-10 mt-3 text-[10px] leading-relaxed text-[#A7C2C2] sm:text-xs">
              Estimasi normal: kepuasan {Math.round(satisfaction)}, keterbukaan {opennessScore}, {lowSectorCount} sektor rendah,
              dan bonus Kebudayaan. Belum termasuk counter, krisis aktif, atau tekanan defisit layanan.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-root-accent sm:text-sm">
              <span className="inline-block h-3 w-1 rounded-full bg-root-accent" />
              Semua sumber penurunan langsung
            </h3>
            <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 sm:gap-3">
              {PENALTY_SECTIONS.map((section) => (
                <article
                  key={section.title}
                  className={`${rootBorderRadius.card} border border-root-accent/20 bg-root-surface p-3 sm:p-4`}
                >
                  <div className="mb-2 flex items-start gap-2">
                    <TrendingDown className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                    <div>
                      <h4 className="text-[10px] font-black uppercase leading-relaxed text-root-text sm:text-xs">
                        {section.title}
                      </h4>
                      <p className="mt-0.5 text-[10px] font-black text-rose-300 sm:text-xs">{section.amount}</p>
                    </div>
                  </div>
                  <p className="text-[10px] leading-relaxed text-[#A7C2C2] sm:text-xs">{section.detail}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={`${rootBorderRadius.card} border border-amber-400/30 bg-amber-400/5 p-3 sm:p-4`}>
            <h3 className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-amber-300 sm:text-xs">
              <AlertTriangle className="h-4 w-4" />
              Faktor decay dan catatan implementasi
            </h3>
            <ul className="space-y-2 text-[10px] leading-relaxed text-[#D2DADA] sm:text-xs">
              <li><strong className="text-amber-200">Multiplier kepuasan:</strong> ≤25: 0,10 · ≤40: 0,30 · ≤65: 0,60 · ≤80: 0,85 · &gt;80: 1,00.</li>
              <li>
                <strong className="text-amber-200">Arah saat ini:</strong> kepuasan/sektor/keterbukaan rendah dan bonus
                Kebudayaan mengecilkan multiplier, sehingga memperlambat decay. Penalti sektor tetap berlaku.
              </li>
              <li>
                <strong className="text-amber-200">Krisis ≥30 hari:</strong> bencana/wabah aktif memaksa multiplier 1,00,
                termasuk event yang sudah ditolak.
              </li>
              <li>
                <strong className="text-amber-200">Save lama:</strong> threshold lama bisa terbaca sebagai multiplier dan
                mengubah progres counter.
              </li>
            </ul>
          </section>

          <section className={`${rootBorderRadius.card} border border-sky-400/25 bg-sky-400/5 p-3 sm:p-4`}>
            <h3 className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-sky-300 sm:text-xs">
              <Info className="h-4 w-4" />
              Dampak yang perlu dibedakan
            </h3>
            <div className="space-y-2 text-[10px] leading-relaxed text-[#D2DADA] sm:text-xs">
              <p>Penalti listrik 1–3 poin tertulis di notifikasi, tetapi helper penerapannya belum tersambung. Dampak tidak langsung lewat kepuasan/sektor masih mungkin.</p>
              <p>Reputasi diplomatik berbeda dari peringkat. Kepuasan turun tidak langsung memotong peringkat.</p>
            </div>
          </section>

          <section className={`${rootBorderRadius.card} border border-root-accent/15 bg-root-surface/70 p-3 text-[10px] leading-relaxed text-[#8FAAAA] sm:p-4 sm:text-xs`}>
            <div className="flex items-start gap-2">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-root-accent" />
              <p>Rentang nilai 0–100; nilai ≤1 dapat memicu kudeta. Bonus: penuhi tuntutan demo +10, tangani bencana/wabah +5, respons polisi +2.</p>
            </div>
          </section>
        </div>
      </div>
    </NotebookModalWrapper>
  );
}