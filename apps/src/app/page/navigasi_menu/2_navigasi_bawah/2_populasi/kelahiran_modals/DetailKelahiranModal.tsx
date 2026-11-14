"use client";

import React from "react";
import { Users, HeartPulse, GraduationCap, Banknote, Activity, TrendingUp, Sparkles } from "lucide-react";

import {
  calculateGeneralSatisfaction,
  calculateDailyBirths,
  calculateDailyDeaths,
  calculateLifeExpectancy,
  calculateSecurityLevel,
} from "@/app/logic/populations_logic/population_logic";

import { calculateKesehatanScore, calculatePendidikanScore } from "@/app/logic/kesejahteraanCalculator";
import { calculateKesehatanLogic } from "../kematian_modals/logic/kesehatanLogic";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";

interface DetailKelahiranModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail?: any;
  selectedCountry?: any;
  dailyBirths?: number;
  dailyDeaths?: number;
  netDailyChange?: number;
  onOpenTempatUmum?: (tabId: string) => void;
}

export default function DetailKelahiranModal({
  isOpen,
  onClose,
  countryDetail,
  selectedCountry,
  dailyBirths: propsDailyBirths,
  dailyDeaths: propsDailyDeaths,
  netDailyChange: propsNetDailyChange,
  onOpenTempatUmum,
}: DetailKelahiranModalProps) {
  if (!isOpen) return null;

  const populasi = countryDetail?.jumlah_penduduk || 10_000_000;
  const countryName = selectedCountry?.country?.toLowerCase?.() || "";

  const detailWithDefaults = { ...countryDetail };
  const kepuasanUmum = calculateGeneralSatisfaction(detailWithDefaults);
  const programInsentifAnak = countryDetail?.program_insentif_anak ?? false;

  // Kesehatan & Pendidikan
  const kesehatanMetrics = calculateKesehatanScore(countryDetail);
  const kesehatanScore = typeof kesehatanMetrics === "object" ? kesehatanMetrics.score : kesehatanMetrics;

  const pendidikanMetrics = calculatePendidikanScore(countryDetail);
  const pendidikanScore = typeof pendidikanMetrics === "object" ? pendidikanMetrics.score : pendidikanMetrics;

  const kesehatanRes = calculateKesehatanLogic(countryDetail, populasi);
  const hospitalRatio = kesehatanRes.kesehatanRatio;
  const healthFactor = 0.7 + 0.3 * hospitalRatio;

  const eduKeys = ["prasekolah", "dasar", "menengah", "lanjutan", "universitas", "lembaga_pendidikan", "laboratorium", "observatorium", "pusat_penelitian", "pusat_pengembangan"];
  const totalEducation = eduKeys.reduce((sum, key) => sum + (Number(countryDetail?.[key]) || 0), 0);
  const idealEducation = Math.ceil(populasi / 50000) || 1;
  const educationRatio = Math.min(1, totalEducation / idealEducation);
  const tingkatPendidikan = educationRatio;
  const educationFactor = 1.1 - (0.3 * tingkatPendidikan);

  // Kelahiran & Kematian
  const dailyBirths = propsDailyBirths !== undefined ? propsDailyBirths : calculateDailyBirths(
    populasi, kepuasanUmum, 0, 0, 0, programInsentifAnak, 0, tingkatPendidikan, detailWithDefaults
  );

  const lifeExpectancy = calculateLifeExpectancy(detailWithDefaults, kepuasanUmum);
  const securityLevel = calculateSecurityLevel(detailWithDefaults, kepuasanUmum);
  const dailyDeaths = propsDailyDeaths !== undefined ? propsDailyDeaths : calculateDailyDeaths(populasi, lifeExpectancy, securityLevel, detailWithDefaults);

  const netDailyChange = propsNetDailyChange !== undefined ? propsNetDailyChange : (dailyBirths - dailyDeaths);
  const welfareFactor = 0.75;

  const formatNumber = (num: number) => num.toLocaleString('id-ID', { maximumFractionDigits: 2 });

  return (
    <NotebookModalWrapper onClose={onClose}>
      <div className={"root-modal-util-4644119199"}>

        {/* ============ HEADER (DISAMAKAN DENGAN MODAL KEPENDUDUKAN) ============ */}
        <div className={"root-modal-util-9462ce2345"}>
          <div className={"root-modal-util-1117664efc"}>
            <div className={"root-modal-util-170d7abee6"}>
              <Users className={"root-modal-util-d252947d10"} />
            </div>
            <div>
              {/* Font size dinaikkan kembali ke text-base sm:text-xl */}
              <h2 className={`root-modal-util-6b4648c53a root-modal-util-c2385a463d`}>
                Rincian Pertumbuhan Penduduk
              </h2>
            </div>
          </div>

          <RootModalCloseButton onClick={onClose} />
        </div>

        {/* ============ BODY (TETAP COMPACT & RESPONSIF) ============ */}
        <div className={"root-modal-util-6717e88ecf"}>
          <div className={"root-modal-util-6f7e013d64"}>

            {/* ============ RINGKASAN UTAMA ============ */}
            <div className={`root-modal-util-45d5e12daf root-modal-util-5f22e64f22 root-modal-util-2cd02d11d1`}>
              
              <div className={"root-modal-util-6fe0d227d8"}>
                <div className={"root-modal-util-3b4c716cd4"}>
                  <p className={"root-modal-util-7e8539efb1"}>
                    <TrendingUp className={"root-modal-util-904147d153"} />
                    Pertumbuhan Bersih Harian
                  </p>
                  <p className={`root-modal-util-5d0413e9d7 ${netDailyChange >= 0 ? "root-modal-util-edbfd1c508" : "root-modal-util-35f302741d"}`}>
                    {netDailyChange >= 0 ? '+' : ''}{formatNumber(netDailyChange)}
                    <span className={"root-modal-util-f03f2f1c1c"}>/hr</span>
                  </p>
                </div>
                <div className={"root-modal-util-b103ddc4d4"}>
                  <Activity className={"root-modal-util-bf480b1526"} />
                </div>
              </div>

              <div className={"root-modal-util-690873d574"}>
                <div className={`root-modal-util-80cbb31289 root-modal-util-5f22e64f22 root-modal-util-4164c8e312 `}>
                  <p className={"root-modal-util-fc7a6578ee"}>Kelahiran</p>
                  <p className={"root-modal-util-84fffb88af"}>
                    +{formatNumber(dailyBirths)}
                  </p>
                </div>
                <div className={`root-modal-util-80cbb31289 root-modal-util-5f22e64f22 root-modal-util-804966dce1 `}>
                  <p className={"root-modal-util-83c4565cad"}>Kematian</p>
                  <p className={"root-modal-util-ed8a4a668a"}>
                    -{formatNumber(dailyDeaths)}
                  </p>
                </div>
              </div>
            </div>

            {/* ============ BREAKDOWN FAKTOR ============ */}
            <div>
              <div className={"root-modal-util-c6ef2c9467"}>
                <div className={"root-modal-util-61c79d0ef6"}>
                  <Sparkles className={"root-modal-util-997485ae46"} />
                </div>
                <h3 className={"root-modal-util-00229c2359"}>
                  Faktor yang Memengaruhi
                </h3>
                <div className={"root-modal-util-0c271612cb"} />
              </div>

              <div className={"root-modal-util-4d27ab2ea5"}>
                {/* 1. Populasi Dasar */}
                <div className={`group root-modal-util-4deab89164 root-modal-util-5f22e64f22 root-modal-util-b3a0d27412 `}>
                  <div className={"root-modal-util-41681120cf"}>
                    <div className={"root-modal-util-bff539c149"}>
                      <Users className={"root-modal-util-904147d153"} />
                    </div>
                    <h4 className={"root-modal-util-0c50473147"}>Populasi Dasar</h4>
                  </div>
                  <p className={"root-modal-util-30d65ce7e4"}>
                    {formatNumber(populasi)} <span className={"root-modal-util-021a1c8cb3"}>jiwa</span>
                  </p>
                </div>

                {/* 2. Kesejahteraan */}
                <div className={`group root-modal-util-4deab89164 root-modal-util-5f22e64f22 root-modal-util-b3a0d27412 `}>
                  <div className={"root-modal-util-41681120cf"}>
                    <div className={"root-modal-util-bff539c149"}>
                      <Banknote className={"root-modal-util-904147d153"} />
                    </div>
                    <h4 className={"root-modal-util-0c50473147"}>Kesejahteraan</h4>
                  </div>
                  <div className={"root-modal-util-0edaa2882b"}>
                    <span className={"root-modal-util-30d65ce7e4"}>
                      {countryDetail?.kesejahteraan !== undefined ? Math.round(Number(countryDetail.kesejahteraan)) : 50} <span className={"root-modal-util-021a1c8cb3"}>INDX</span>
                    </span>
                    <span className={"root-modal-util-ec349ffbf1"}>
                      × {welfareFactor.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* 3. Fasilitas Kesehatan (clickable) */}
                <div
                  className={`group root-modal-util-4deab89164 root-modal-util-5f22e64f22 root-modal-util-d0c179737a `}
                  onClick={() => onOpenTempatUmum?.('kesehatan')}
                >
                  <div className={"root-modal-util-1de6c9c32e"}>
                    <div className={"root-modal-util-41681120cf"}>
                      <div className={"root-modal-util-abcb8e04f7"}>
                        <HeartPulse className={"root-modal-util-904147d153"} />
                      </div>
                      <h4 className={"root-modal-util-0c50473147"}>Fasilitas Kesehatan</h4>
                    </div>
                    <span className={"root-modal-util-abed0b4e4b"}>Buka →</span>
                  </div>
                  <div className={"root-modal-util-0edaa2882b"}>
                    <span className={"root-modal-util-30d65ce7e4"}>
                      {kesehatanScore} <span className={"root-modal-util-021a1c8cb3"}>POIN</span>
                    </span>
                    <span className={"root-modal-util-64adb8e57f"}>(rasio {hospitalRatio.toFixed(2)})</span>
                    <span className={"root-modal-util-ec349ffbf1"}>
                      × {healthFactor.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* 4. Tingkat Pendidikan (clickable) */}
                <div
                  className={`group root-modal-util-4deab89164 root-modal-util-5f22e64f22 root-modal-util-d0c179737a `}
                  onClick={() => onOpenTempatUmum?.('pendidikan')}
                >
                  <div className={"root-modal-util-1de6c9c32e"}>
                    <div className={"root-modal-util-41681120cf"}>
                      <div className={"root-modal-util-abcb8e04f7"}>
                        <GraduationCap className={"root-modal-util-904147d153"} />
                      </div>
                      <h4 className={"root-modal-util-0c50473147"}>Tingkat Pendidikan</h4>
                    </div>
                    <span className={"root-modal-util-abed0b4e4b"}>Buka →</span>
                  </div>
                  <div className={"root-modal-util-0edaa2882b"}>
                    <span className={"root-modal-util-30d65ce7e4"}>
                      {pendidikanScore} <span className={"root-modal-util-021a1c8cb3"}>POIN</span>
                    </span>
                    <span className={"root-modal-util-64adb8e57f"}>(rasio {educationRatio.toFixed(2)})</span>
                    <span className={"root-modal-util-ec349ffbf1"}>
                      × {educationFactor.toFixed(2)}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </NotebookModalWrapper>
  );
}