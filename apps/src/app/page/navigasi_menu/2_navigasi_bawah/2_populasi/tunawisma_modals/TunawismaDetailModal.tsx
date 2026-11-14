"use client"

import { useMemo } from "react";
import { AlertCircle, Home, Users, TrendingDown, MapPin, Building2, BookOpen, Coins, Scale } from "lucide-react";
import { calculateHomelessCount } from "@/app/logic/populations_logic/population_logic";
import { calculateTempatUmumScore } from "@/app/logic/kesejahteraanCalculator";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";

interface TunawismaDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail: any;
  selectedCountry: any;
  homelessCount?: number;
}

export default function TunawismaDetailModal({
  isOpen,
  onClose,
  countryDetail,
  selectedCountry,
  homelessCount: providedHomelessCount,
}: TunawismaDetailModalProps) {
  const metrics = useMemo(() => {
    if (!countryDetail) return null;

    const populasi = Number(countryDetail?.jumlah_penduduk) || 10_000_000;
    
    const homelessCount = providedHomelessCount !== undefined
      ? providedHomelessCount
      : calculateHomelessCount(populasi, 50, countryDetail);

    const homelessPercentage = (homelessCount / populasi) * 100;

    const housingMetrics = calculateTempatUmumScore(countryDetail);
    
    return {
      populasi,
      homelessCount,
      homelessPercentage,
      housingMetrics,
    };
  }, [countryDetail, providedHomelessCount]);

  if (!isOpen || !metrics) return null;

  const { homelessCount, homelessPercentage } = metrics;

  const getSeverity = (percentage: number) => {
    if (percentage >= 5) return { level: "KRITIS", color: "root-modal-util-35f302741d", bg: "root-modal-util-83883b44b2", border: "root-modal-util-e9a647a894" };
    if (percentage >= 3) return { level: "SERIUS", color: "root-modal-util-29a9a15f55", bg: "root-modal-util-c6ce0cab01", border: "root-modal-util-2bce93aa92" };
    if (percentage >= 1) return { level: "PERHATIAN", color: "root-modal-util-ce4daf63b9", bg: "root-modal-util-c305347ff1", border: "root-modal-util-99b83ad5ac" };
    return { level: "TERKONTROL", color: "root-modal-util-070a7f2c69", bg: "root-modal-util-09f1bb832f", border: "root-modal-util-c2db1cca90" };
  };

  const severity = getSeverity(homelessPercentage);

  return (
    <NotebookModalWrapper onClose={onClose}>
      <div className={"root-modal-util-4644119199"}>

        {/* ============ HEADER ============ */}
        <div className={"root-modal-util-9462ce2345"}>
          <div className={"root-modal-util-1117664efc"}>
            <div className={"root-modal-util-739d92b232"}>
              <AlertCircle className={"root-modal-util-d252947d10"} />
            </div>
            <div>
              <h2 className={`root-modal-util-6b4648c53a root-modal-util-c2385a463d`}>
                Tunawisma & Hunian
              </h2>
            </div>
          </div>

          <RootModalCloseButton onClick={onClose} />
        </div>

        {/* ============ CONTENT AREA ============ */}
        <div className={"root-modal-util-6717e88ecf"}>
          <div className={"root-modal-util-26941d2272 root-modal-enter root-modal-fade-in"}>

            {/* ============ MAIN STATS CARD ============ */}
            <div className={`root-modal-util-5f22e64f22 root-modal-util-d61de57126 `}>
              <div className={"root-modal-util-0ed89b79f0"}>
                
                {/* Jumlah Tunawisma */}
                <div className={"root-modal-util-a4ec20143c"}>
                  <p className={"root-modal-util-b17fb53f8c"}>
                    Jumlah Tunawisma
                  </p>
                  <div className={"root-modal-util-f3b36654a6"}>
                    {/* Angka lebih kecil dan warna netral */}
                    <span className={"root-modal-util-2a1909f579"}>
                      {homelessCount.toLocaleString('id-ID', { maximumFractionDigits: 2 })}
                    </span>
                    <span className={"root-modal-util-a8b304616a"}>JIWA</span>
                  </div>
                </div>

                {/* Persentase */}
                <div className={"root-modal-util-a4ec20143c"}>
                  <p className={"root-modal-util-b17fb53f8c"}>
                    Persentase Populasi
                  </p>
                  <div className={"root-modal-util-f3b36654a6"}>
                    {/* Persentase dibuat netral (putih/silver) tanpa efek glow hijau */}
                    <span className={"root-modal-util-2a1909f579"}>
                      {homelessPercentage.toFixed(2)}%
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div className={"root-modal-util-5f06f529bd"}>
                  <p className={"root-modal-util-b17fb53f8c"}>
                    Status Keparahan
                  </p>
                  <p className={`root-modal-util-6bfb12867d ${severity.color}`}>
                    {severity.level}
                  </p>
                </div>

              </div>
            </div>

            {/* ============ FAKTOR PENYEBAB ============ */}
            <div className={"root-modal-util-6f7e013d64"}>
              <h3 className={"root-modal-util-8c1ba2cf8a"}>
                <span className={"root-modal-util-308fa49d4e"}></span>
                Faktor Penyebab Tunawisma
              </h3>

              <div className={"root-modal-util-4b4270e9e8"}>
                {/* Faktor 1 */}
                <div className={`root-modal-util-04ab86eb09 root-modal-util-5f22e64f22 root-modal-util-1e9b17c1f9 `}>
                  <div className={"root-modal-util-9a23f0e987"}>
                    <Users className={"root-modal-util-839943bdc3"} />
                  </div>
                  <div>
                    <p className={"root-modal-util-2db64fa2d6"}>Pertumbuhan Populasi</p>
                    <p className={"root-modal-util-a51a6499e8"}>Laju populasi mendahului pasokan hunian</p>
                  </div>
                </div>

                {/* Faktor 2 */}
                <div className={`root-modal-util-04ab86eb09 root-modal-util-5f22e64f22 root-modal-util-1e9b17c1f9 `}>
                  <div className={"root-modal-util-9a23f0e987"}>
                    <Home className={"root-modal-util-839943bdc3"} />
                  </div>
                  <div>
                    <p className={"root-modal-util-2db64fa2d6"}>Keterbatasan Hunian</p>
                    <p className={"root-modal-util-a51a6499e8"}>Kurangnya unit rumah subsidi & apartemen</p>
                  </div>
                </div>

                {/* Faktor 3 */}
                <div className={`root-modal-util-04ab86eb09 root-modal-util-5f22e64f22 root-modal-util-1e9b17c1f9 `}>
                  <div className={"root-modal-util-9a23f0e987"}>
                    <TrendingDown className={"root-modal-util-839943bdc3"} />
                  </div>
                  <div>
                    <p className={"root-modal-util-2db64fa2d6"}>Tingkat Kemiskinan</p>
                    <p className={"root-modal-util-a51a6499e8"}>Daya beli perumahan warga rendah</p>
                  </div>
                </div>

                {/* Faktor 4 */}
                <div className={`root-modal-util-04ab86eb09 root-modal-util-5f22e64f22 root-modal-util-1e9b17c1f9 `}>
                  <div className={"root-modal-util-9a23f0e987"}>
                    <MapPin className={"root-modal-util-839943bdc3"} />
                  </div>
                  <div>
                    <p className={"root-modal-util-2db64fa2d6"}>Kesejahteraan Rendah</p>
                    <p className={"root-modal-util-a51a6499e8"}>Investasi fasilitas publik & bantuan minim</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ============ SOLUSI & REKOMENDASI ============ */}
            <div className={`root-modal-util-c7821331b6 root-modal-util-5f22e64f22`}>
              <h3 className={"root-modal-util-613de4dde9"}>
                <span className={"root-modal-util-308fa49d4e"}></span>
                Solusi & Rekomendasi
              </h3>
              <div className={"root-modal-util-fcddc39279"}>
                
                <div className={`root-modal-util-411bcda497 root-modal-util-5f22e64f22 root-modal-util-7759bd6d45 `}>
                  <div className={"root-modal-util-c8c37a0fc5"}>
                    <Building2 className={"root-modal-util-29f94a0f0e"} />
                  </div>
                  <div>
                    <p className={"root-modal-util-2db64fa2d6"}>Bangun Hunian Massal</p>
                    <p className={"root-modal-util-a51a6499e8"}>Perbanyak rumah subsidi dan apartemen rakyat</p>
                  </div>
                </div>

                <div className={`root-modal-util-411bcda497 root-modal-util-5f22e64f22 root-modal-util-7759bd6d45 `}>
                  <div className={"root-modal-util-c8c37a0fc5"}>
                    <BookOpen className={"root-modal-util-29f94a0f0e"} />
                  </div>
                  <div>
                    <p className={"root-modal-util-2db64fa2d6"}>Tingkatkan Kesejahteraan</p>
                    <p className={"root-modal-util-a51a6499e8"}>Perluas program lapangan kerja & layanan sosial</p>
                  </div>
                </div>

                <div className={`root-modal-util-411bcda497 root-modal-util-5f22e64f22 root-modal-util-7759bd6d45 `}>
                  <div className={"root-modal-util-c8c37a0fc5"}>
                    <Coins className={"root-modal-util-29f94a0f0e"} />
                  </div>
                  <div>
                    <p className={"root-modal-util-2db64fa2d6"}>Program Pembiayaan Ringan</p>
                    <p className={"root-modal-util-a51a6499e8"}>Subsidi bunga KPR & skema kepemilikan terjangkau</p>
                  </div>
                </div>

                <div className={`root-modal-util-411bcda497 root-modal-util-5f22e64f22 root-modal-util-7759bd6d45 `}>
                  <div className={"root-modal-util-c8c37a0fc5"}>
                    <Scale className={"root-modal-util-29f94a0f0e"} />
                  </div>
                  <div>
                    <p className={"root-modal-util-2db64fa2d6"}>Pemerataan Pembangunan</p>
                    <p className={"root-modal-util-a51a6499e8"}>Distribusi kawasan permukiman produktif</p>
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