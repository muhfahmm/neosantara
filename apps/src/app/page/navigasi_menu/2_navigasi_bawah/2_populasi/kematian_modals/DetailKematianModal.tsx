"use client";

import React, { useState, useEffect } from "react";
import { Users, Heart, Shield, Home, HeartPulse, Utensils, AlertTriangle, ArrowUpRight, Skull } from "lucide-react";
import { fetchBuildingMetadata } from "@/lib/buildingMetadata";

import {
  calculateGeneralSatisfaction,
  calculateLifeExpectancy,
  calculateSecurityLevel,
  calculateDailyDeaths,
} from "@/app/logic/populations_logic/population_logic";
import { calculatePanganScore, calculateKesehatanScore, calculatePenegakanHukumScore } from "@/app/logic/kepuasanCalculator";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";
// Import dari logic yang baru dibuat
import { calculateKeamananLogic } from "./logic/keamananLogic";
import { calculateKesehatanLogic } from "./logic/kesehatanLogic";
import { calculateTunawismaLogic } from "./logic/tunawismaLogic";
import { calculateKriminalitasLogic } from "./logic/kriminalitasLogic";
import NotebookModalWrapper from "../../NotebookModalWrapper";

interface DetailKematianModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail?: any;
  selectedCountry?: any;
  dailyDeaths?: number;
  homelessCount?: number; // Data tunawisma dari induk
  onOpenTempatUmum?: (tabId: string) => void;
  onOpenIndustriPangan?: () => void;
  onOpenArmada?: (tabId: 'aktif' | 'infrastruktur' | 'polisi') => void;
}

export default function DetailKematianModal({
  isOpen,
  onClose,
  countryDetail,
  selectedCountry,
  dailyDeaths: propsDailyDeaths,
  homelessCount: propsHomelessCount,
  onOpenTempatUmum,
  onOpenIndustriPangan,
  onOpenArmada,
}: DetailKematianModalProps) {

  // Fetch building metadata agar rumus Pangan identik 100% dengan IndeksKesejahteraanModal
  const [metadata, setMetadata] = useState<any>(null);
  useEffect(() => {
    if (!isOpen) return;
    fetchBuildingMetadata().then((data) => setMetadata(data || {}));
  }, [isOpen]);

  if (!isOpen) return null;

  const populasi = countryDetail?.jumlah_penduduk || 10_000_000;

  const countryName = selectedCountry?.country?.toLowerCase?.() || "";

  const detailWithDefaults = { ...countryDetail };
  const kepuasanUmum = calculateGeneralSatisfaction(detailWithDefaults);
  const lifeExpectancy = calculateLifeExpectancy(detailWithDefaults, kepuasanUmum);
  const securityLevel = calculateSecurityLevel(detailWithDefaults, kepuasanUmum);

  const storedFood = countryDetail?.satisfaction?.food;
  const indeksKetahananPangan = (!metadata || Object.keys(metadata).length === 0)
    ? (storedFood !== undefined && storedFood !== null ? Math.round(Number(storedFood)) : calculatePanganScore(countryDetail, undefined))
    : calculatePanganScore(countryDetail, metadata);

  // Hitung dengan logic terpusat
  const keamananRes = calculateKeamananLogic(countryDetail, populasi);
  const kesehatanRes = calculateKesehatanLogic(countryDetail, populasi);
  const tunawismaRes = calculateTunawismaLogic(countryDetail, populasi, propsHomelessCount);
  const kriminalitasRes = calculateKriminalitasLogic(countryDetail, populasi);

  const tingkatKeamanan = keamananRes.tingkatKeamanan;
  const homelessCount = tunawismaRes.homelessCount;
  const jumlahRumahSakit = kesehatanRes.jumlahRumahSakit;
  const tingkatKriminalitas = kriminalitasRes.tingkatKriminalitas;

  const harapanHidup = Math.round(calculateLifeExpectancy(detailWithDefaults, kepuasanUmum));
  const lifeExpectancyFactor = Math.max(0.8, 1.2 - (0.005 * (harapanHidup - 50)));
  const securityFactor = keamananRes.securityFactor;
  const homelessRatio = homelessCount / populasi;
  const homelessFactor = tunawismaRes.homelessFactor;
  const hospitalRatio = kesehatanRes.kesehatanRatio;
  const healthFactor = kesehatanRes.healthFactor;
  const foodSecurityFactor = Math.max(0.5, 1.2 - (0.005 * indeksKetahananPangan));
  const crimeFactor = kriminalitasRes.crimeFactor;

  const dailyDeaths = propsDailyDeaths !== undefined
    ? propsDailyDeaths
    : calculateDailyDeaths(populasi, lifeExpectancy, securityLevel, detailWithDefaults);

  const formatNumber = (num: number) => num.toLocaleString('id-ID', { maximumFractionDigits: 2 });
  const countryDisplayName = selectedCountry?.country || "Indonesia";

  return (
    <>
      <NotebookModalWrapper onClose={onClose}>

        {/* Header */}
        <div className={"satisfaction-modal-header root-modal-util-9462ce2345"}>
          <div className={"satisfaction-modal-header-main root-modal-util-020752a5a2 no-scrollbar"}>
            <div className={"root-modal-util-08dfbca033"}>
              <div className={"root-modal-util-739d92b232"}>
                <Users className={"root-modal-util-d252947d10"} />
              </div>
              <h2 className={"root-modal-util-6b4648c53a root-modal-util-c2385a463d"}>
                Rincian Angka Kematian
              </h2>
            </div>
          </div>
          <RootModalCloseButton onClick={onClose} />
        </div>

        {/* Body */}
        <div className={"root-modal-util-888ddfb0c3 custom-scrollbar"}>
          <div className={"root-modal-util-3e7ce58d64"}>
            
            {/* Ringkasan Utama */}
            <div className={`root-modal-util-79099565c4 root-modal-util-5f22e64f22`}>
              <div className={"root-modal-util-d27e953630"}>
                <div>
                  <p className={"root-modal-util-dfcde80191"}>Kematian Harian</p>
                  <p className={"root-modal-util-c007ff74a3"}>-{formatNumber(dailyDeaths)}</p>
                </div>
                <div className={"root-modal-util-52dfb88ae5"}>
                  <Skull className={"root-modal-util-c280e1e65c"} />
                </div>
              </div>
            </div>

            {/* Breakdown Faktor */}
            <div className={"root-modal-util-69ff2269b4"}>
              {/* 1. Harapan Hidup */}
              <div className={`root-modal-util-e0535830e3 root-modal-util-5f22e64f22 root-modal-util-3988af3ab2 `}>
                <div className={"root-modal-util-6a00a25d56"}>
                  <div className={"root-modal-util-d8b10b3e0e"}>
                    <Heart className={"root-modal-util-e443a49d4d"} />
                  </div>
                  <h4 className={"root-modal-util-37591e0638"}>Harapan Hidup</h4>
                </div>
                <div className={"root-modal-util-0e44f76651"}>
                  <span className={"root-modal-util-b6bf3be5ae"}>{harapanHidup} tahun</span>
                  <span className={"root-modal-util-d661690b23"}>× {lifeExpectancyFactor.toFixed(2)}</span>
                </div>
                <p className={"root-modal-util-ab6dcb44a2 [overflow-wrap:anywhere]"}>Semakin tinggi harapan hidup, semakin rendah angka kematian.</p>
              </div>

              {/* 2. Keamanan */}
              <div className={`root-modal-util-e0535830e3 root-modal-util-5f22e64f22 root-modal-util-3988af3ab2 `}>
                <div className={"root-modal-util-6a00a25d56"}>
                  <div className={"root-modal-util-d8b10b3e0e"}>
                    <Shield className={"root-modal-util-e443a49d4d"} />
                  </div>
                  <h4 className={"root-modal-util-37591e0638"}>Tingkat Keamanan</h4>
                </div>
                <div className={"root-modal-util-0e44f76651"}>
                  <span className={"root-modal-util-b6bf3be5ae"}>{tingkatKeamanan}%</span>
                  <span className={"root-modal-util-d661690b23"}>× {securityFactor.toFixed(2)}</span>
                </div>
                <p className={"root-modal-util-ab6dcb44a2 [overflow-wrap:anywhere]"}>Lingkungan aman mengurangi kematian akibat kriminalitas dan kecelakaan.</p>
              </div>

              {/* 3. Tunawisma */}
              <div className={`root-modal-util-e0535830e3 root-modal-util-5f22e64f22 root-modal-util-3988af3ab2 `}>
                <div className={"root-modal-util-6a00a25d56"}>
                  <div className={"root-modal-util-d8b10b3e0e"}>
                    <Home className={"root-modal-util-e443a49d4d"} />
                  </div>
                  <h4 className={"root-modal-util-37591e0638"}>Tunawisma</h4>
                </div>
                <div className={"root-modal-util-0e44f76651"}>
                  <span className={"root-modal-util-b6bf3be5ae"}>{formatNumber(homelessCount)} jiwa ({ (homelessRatio * 100).toFixed(2)}%)</span>
                  <span className={"root-modal-util-d661690b23"}>× {homelessFactor.toFixed(2)}</span>
                </div>
                <p className={"root-modal-util-ab6dcb44a2 [overflow-wrap:anywhere]"}>Setiap 1% populasi tunawisma meningkatkan kematian sebesar 5%.</p>
              </div>

              {/* 4. Kesehatan */}
              <div 
                className={`root-modal-util-e0535830e3 root-modal-util-5f22e64f22 root-modal-util-c8bb89f962 `}
                onClick={() => onOpenTempatUmum?.('kesehatan')}
              >
                <div className={"root-modal-util-6a00a25d56"}>
                  <div className={"root-modal-util-d8b10b3e0e"}>
                    <HeartPulse className={"root-modal-util-e443a49d4d"} />
                  </div>
                  <h4 className={"root-modal-util-37591e0638"}>Fasilitas Kesehatan</h4>
                </div>
                <div className={"root-modal-util-0e44f76651"}>
                  <span className={"root-modal-util-b6bf3be5ae"}>{calculateKesehatanScore(countryDetail)} POIN <span className={"root-modal-util-be43bc36b5"}>(rasio {hospitalRatio.toFixed(2)})</span></span>
                  <span className={"root-modal-util-d661690b23"}>× {healthFactor.toFixed(2)}</span>
                </div>
                <p className={"root-modal-util-ab6dcb44a2 [overflow-wrap:anywhere]"}>Ketersediaan RS yang cukup menurunkan kematian akibat penyakit yang dapat diobati.</p>
              </div>

              {/* 5. Ketahanan Pangan */}
              <div 
                className={`root-modal-util-e0535830e3 root-modal-util-5f22e64f22 root-modal-util-c8bb89f962 `}
                onClick={() => onOpenIndustriPangan?.()}
              >
                <div className={"root-modal-util-6a00a25d56"}>
                  <div className={"root-modal-util-d8b10b3e0e"}>
                    <Utensils className={"root-modal-util-e443a49d4d"} />
                  </div>
                  <h4 className={"root-modal-util-37591e0638"}>Ketahanan Pangan</h4>
                </div>
                <div className={"root-modal-util-0e44f76651"}>
                  <span className={"root-modal-util-b6bf3be5ae"}>{indeksKetahananPangan} POIN</span>
                  <span className={"root-modal-util-d661690b23"}>× {foodSecurityFactor.toFixed(2)}</span>
                </div>
                <p className={"root-modal-util-ab6dcb44a2 [overflow-wrap:anywhere]"}>Ketersediaan pangan yang cukup mengurangi kematian akibat malnutrisi.</p>
              </div>

              {/* 6. Kriminalitas */}
              <div 
                className={`root-modal-util-e0535830e3 root-modal-util-5f22e64f22 root-modal-util-c8bb89f962 `}
                onClick={() => onOpenArmada?.('polisi')}
              >
                <div className={"root-modal-util-6a00a25d56"}>
                  <div className={"root-modal-util-d8b10b3e0e"}>
                    <AlertTriangle className={"root-modal-util-e443a49d4d"} />
                  </div>
                  <h4 className={"root-modal-util-37591e0638"}>Penegakan Hukum & Kriminalitas</h4>
                </div>
                <div className={"root-modal-util-0e44f76651"}>
                  <span className={"root-modal-util-b6bf3be5ae"}>{calculatePenegakanHukumScore(countryDetail)} POIN</span>
                  <span className={"root-modal-util-d661690b23"}>× {crimeFactor.toFixed(2)}</span>
                </div>
                <p className={"root-modal-util-ab6dcb44a2 [overflow-wrap:anywhere]"}>Skor kepuasan penegakan hukum dari Indeks Kesejahteraan.</p>
              </div>

            </div>
          </div>
        </div>
      </NotebookModalWrapper>
    </>
  );
}