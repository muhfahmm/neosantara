"use client";

import { AlertTriangle, Info, ShieldAlert, Star, TrendingDown } from "lucide-react";
import {
  countLowSatisfactionSectors,
  calculateKeterbukaanScore,
} from "@/app/logic/kepuasanCalculator";
import { getDecayMultiplierFromSatisfaction } from "@/app/logic/peringkatCalculator";
import { applyKementerianKebudayaanDecayMultiplierBonus } from "@/app/page/bonus_logic";
import NotebookModalWrapper from "../NotebookModalWrapper";
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
    ? "root-modal-util-edbfd1c508"
    : presidentRating >= 40
      ? "root-modal-util-ce4daf63b9"
      : "root-modal-util-35f302741d";

  return (
    <NotebookModalWrapper onClose={onClose}>
      <div className={"root-modal-util-d3c57b9316"}>
        <div className={"root-modal-util-c5a2828bc0"}>
          <div className={"root-modal-util-1117664efc"}>
            <div className={"root-modal-util-7ed7897617"}>
              <Star className={"root-modal-util-5f45eb7841"} />
            </div>
            <div>
              <h2 className={"root-modal-util-db32311dd9"}>
                Peringkat Presiden
              </h2>
              <p className={"root-modal-util-738a0e9e27"}>
                Rincian penyebab perubahan nilai peringkat
              </p>
            </div>
          </div>
          <RootModalCloseButton onClick={onClose} />
        </div>

        <div className={"root-modal-util-496f68e303"}>
          <section className={`root-modal-util-c2f11b060e root-modal-util-5f22e64f22 root-modal-util-6ae984d4c0 `}>

            <div className={"root-modal-util-e20f2b9b36"}>
              <div>
                <p className={"root-modal-util-149d168639"}>
                  Nilai saat ini
                </p>
                <p className={`root-modal-util-bf9b09e569 ${ratingColor}`}>
                  {Math.round(presidentRating)}
                  <span className={"root-modal-util-be8f7b97d6"}>/100</span>
                </p>
              </div>
              <div className={"root-modal-util-440d1dcd57"}>
                <p className={"root-modal-util-79f0d0bec1"}>Decay terhitung</p>
                <p className={"root-modal-util-a9ce546982"}>
                  {finalMultiplier.toFixed(2)} counter/bulan
                </p>
              </div>
            </div>
            <p className={"root-modal-util-671b937750"}>
              Estimasi normal: kepuasan {Math.round(satisfaction)}, keterbukaan {opennessScore}, {lowSectorCount} sektor rendah,
              dan bonus Kebudayaan. Belum termasuk counter, krisis aktif, atau tekanan defisit layanan.
            </p>
          </section>

          <section className={"root-modal-util-6ed543e2fb"}>
            <h3 className={"root-modal-util-4cf7f34e06"}>
              <span className={"root-modal-util-ec6ebdb191"} />
              Semua sumber penurunan langsung
            </h3>
            <div className={"root-modal-util-0166cc080d"}>
              {PENALTY_SECTIONS.map((section) => (
                <article
                  key={section.title}
                  className={`root-modal-util-5f22e64f22 root-modal-util-d01275d2de `}
                >
                  <div className={"root-modal-util-b2a6b67335"}>
                    <TrendingDown className={"root-modal-util-2a8e7abc3f"} />
                    <div>
                      <h4 className={"root-modal-util-7dd2565582"}>
                        {section.title}
                      </h4>
                      <p className={"root-modal-util-cda0a4a71d"}>{section.amount}</p>
                    </div>
                  </div>
                  <p className={"root-modal-util-6b81033f61"}>{section.detail}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={`root-modal-util-5f22e64f22 root-modal-util-72b4ea9f47 `}>
            <h3 className={"root-modal-util-b499deba0a"}>
              <AlertTriangle className={"root-modal-util-a7e4e66fa3"} />
              Faktor decay dan catatan implementasi
            </h3>
            <ul className={"root-modal-util-220919c901"}>
              <li><strong className={"root-modal-util-ac56fca21e"}>Multiplier kepuasan:</strong> ≤25: 0,10 · ≤40: 0,30 · ≤65: 0,60 · ≤80: 0,85 · &gt;80: 1,00.</li>
              <li>
                <strong className={"root-modal-util-ac56fca21e"}>Arah saat ini:</strong> kepuasan/sektor/keterbukaan rendah dan bonus
                Kebudayaan mengecilkan multiplier, sehingga memperlambat decay. Penalti sektor tetap berlaku.
              </li>
              <li>
                <strong className={"root-modal-util-ac56fca21e"}>Krisis ≥30 hari:</strong> bencana/wabah aktif memaksa multiplier 1,00,
                termasuk event yang sudah ditolak.
              </li>
              <li>
                <strong className={"root-modal-util-ac56fca21e"}>Save lama:</strong> threshold lama bisa terbaca sebagai multiplier dan
                mengubah progres counter.
              </li>
            </ul>
          </section>

          <section className={`root-modal-util-5f22e64f22 root-modal-util-d36a8a639f `}>
            <h3 className={"root-modal-util-1a38f80d7a"}>
              <Info className={"root-modal-util-a7e4e66fa3"} />
              Dampak yang perlu dibedakan
            </h3>
            <div className={"root-modal-util-220919c901"}>
              <p>Penalti listrik 1–3 poin tertulis di notifikasi, tetapi helper penerapannya belum tersambung. Dampak tidak langsung lewat kepuasan/sektor masih mungkin.</p>
              <p>Reputasi diplomatik berbeda dari peringkat. Kepuasan turun tidak langsung memotong peringkat.</p>
            </div>
          </section>

          <section className={`root-modal-util-5f22e64f22 root-modal-util-e61ab2a7d6 `}>
            <div className={"root-modal-util-7b6566b31a"}>
              <ShieldAlert className={"root-modal-util-16249c4e4c"} />
              <p>Rentang nilai 0–100; nilai ≤1 dapat memicu kudeta. Bonus: penuhi tuntutan demo +10, tangani bencana/wabah +5, respons polisi +2.</p>
            </div>
          </section>
        </div>
      </div>
    </NotebookModalWrapper>
  );
}