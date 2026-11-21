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
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

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
];

export default function RingkasanPeringkatModal({
  isOpen,
  onClose,
  presidentRating,
  countryDetail,
  metadata = {},
}: RingkasanPeringkatModalProps) {
  const { t } = useLanguage();
  if (!isOpen) return null;

  const penaltySections = [0, 1, 2, 3, 4, 5].map((idx) => ({
    title: t(`satisfaction_statistics.rankingModal.penalties.${idx}.title`),
    amount: t(`satisfaction_statistics.rankingModal.penalties.${idx}.amount`),
    detail: t(`satisfaction_statistics.rankingModal.penalties.${idx}.detail`),
  }));

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
                {t("satisfaction_statistics.rankingModal.title")}
              </h2>
              <p className={"root-modal-util-738a0e9e27"}>
                {t("satisfaction_statistics.rankingModal.subtitle")}
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
                  {t("satisfaction_statistics.rankingModal.currentScore")}
                </p>
                <p className={`root-modal-util-bf9b09e569 ${ratingColor}`}>
                  {Math.round(presidentRating)}
                  <span className={"root-modal-util-be8f7b97d6"}>/100</span>
                </p>
              </div>
              <div className={"root-modal-util-440d1dcd57"}>
                <p className={"root-modal-util-79f0d0bec1"}>{t("satisfaction_statistics.rankingModal.calculatedDecay")}</p>
                <p className={"root-modal-util-a9ce546982"}>
                  {t("satisfaction_statistics.rankingModal.counterPerMonth", { value: finalMultiplier.toFixed(2) })}
                </p>
              </div>
            </div>
            <p className={"root-modal-util-671b937750"}>
              {t("satisfaction_statistics.rankingModal.normalEstimate", {
                satisfaction: Math.round(satisfaction),
                openness: opennessScore,
                lowSectors: lowSectorCount,
              })}
            </p>
          </section>

          <section className={"root-modal-util-6ed543e2fb"}>
            <h3 className={"root-modal-util-4cf7f34e06"}>
              <span className={"root-modal-util-ec6ebdb191"} />
              {t("satisfaction_statistics.rankingModal.allDirectSources")}
            </h3>
            <div className={"root-modal-util-0166cc080d"}>
              {penaltySections.map((section) => (
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
              {t("satisfaction_statistics.rankingModal.decayFactorsTitle")}
            </h3>
            <ul className={"root-modal-util-220919c901"}>
              <li><strong className={"root-modal-util-ac56fca21e"}>{t("satisfaction_statistics.rankingModal.satisfactionMultiplierLabel")}</strong> {t("satisfaction_statistics.rankingModal.satisfactionMultiplierText")}</li>
              <li>
                <strong className={"root-modal-util-ac56fca21e"}>{t("satisfaction_statistics.rankingModal.currentDirectionLabel")}</strong> {t("satisfaction_statistics.rankingModal.currentDirectionText")}
              </li>
              <li>
                <strong className={"root-modal-util-ac56fca21e"}>{t("satisfaction_statistics.rankingModal.crisisLabel")}</strong> {t("satisfaction_statistics.rankingModal.crisisText")}
              </li>
              <li>
                <strong className={"root-modal-util-ac56fca21e"}>{t("satisfaction_statistics.rankingModal.oldSaveLabel")}</strong> {t("satisfaction_statistics.rankingModal.oldSaveText")}
              </li>
            </ul>
          </section>

          <section className={`root-modal-util-5f22e64f22 root-modal-util-d36a8a639f `}>
            <h3 className={"root-modal-util-1a38f80d7a"}>
              <Info className={"root-modal-util-a7e4e66fa3"} />
              {t("satisfaction_statistics.rankingModal.distinguishableImpactsTitle")}
            </h3>
            <div className={"root-modal-util-220919c901"}>
              <p>{t("satisfaction_statistics.rankingModal.distinguishableImpactsP1")}</p>
              <p>{t("satisfaction_statistics.rankingModal.distinguishableImpactsP2")}</p>
            </div>
          </section>

          <section className={`root-modal-util-5f22e64f22 root-modal-util-e61ab2a7d6 `}>
            <div className={"root-modal-util-7b6566b31a"}>
              <ShieldAlert className={"root-modal-util-16249c4e4c"} />
              <p>{t("satisfaction_statistics.rankingModal.rangeNote")}</p>
            </div>
          </section>
        </div>
      </div>
    </NotebookModalWrapper>
  );
}