"use client";
import React, { useEffect, useMemo, useState } from "react";
import { X, Tag, Loader2 } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail: any;
  setCountryDetail: (detail: any) => void;
}

export default function HargaModal({ isOpen, onClose, countryDetail, setCountryDetail }: ModalProps) {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subsidyActive, setSubsidyActive] = useState(false);

  const countryName = countryDetail?.country || "";
  const anggaran = countryDetail?.anggaran || 0;
  const kepuasan = countryDetail?.kepuasan || 65.0;

  const priceOptions = useMemo(() => [10000, 25000, 50000, 75000, 100000], []);

  // --- Fungsi menghitung indeks kepuasan berdasarkan keterjangkauan ---
  const calculateSatisfaction = (currentPrices: Record<string, number>, subsidized: boolean) => {
    const entries = Object.entries(currentPrices).filter(([key]) => key.startsWith("harga_"));
    if (entries.length === 0) return 50; // default jika tidak ada data

    const minPrice = 10000;  // harga termurah yang tersedia
    const maxPrice = 100000; // harga termahal yang tersedia
    let totalScore = 0;

    for (const [, value] of entries) {
      // Skor 100 jika harga <= minPrice, 0 jika harga >= maxPrice, linier di antaranya
      let score = 100 - ((value - minPrice) / (maxPrice - minPrice)) * 100;
      score = Math.min(100, Math.max(0, score));
      totalScore += score;
    }

    let avgScore = totalScore / entries.length;
    if (subsidized) avgScore = Math.min(100, avgScore + 5); // bonus subsidi
    return Math.round(avgScore);
  };

  // --- Load data ---
  useEffect(() => {
    if (!isOpen || !countryName) return;

    if (countryDetail?.harga && Object.keys(countryDetail.harga).length > 0) {
      setPrices(countryDetail.harga);
      setSubsidyActive(countryDetail?.subsidyActive || false);
      return;
    }

    const loadPrices = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/price-data?country=${encodeURIComponent(countryName)}`);
        const data = await res.json();
        if (data?.prices) {
          const defaultPrices = data.prices;
          setPrices(defaultPrices);
          setCountryDetail({
            ...countryDetail,
            harga: defaultPrices,
            subsidyActive: false,
          });
        } else {
          setPrices({});
        }
      } catch (err) {
        console.error("Failed to load price data", err);
        setError("Gagal memuat data harga dari database.");
      } finally {
        setLoading(false);
      }
    };

    loadPrices();
  }, [isOpen, countryName, countryDetail?.harga]);

  if (!isOpen) return null;

  const satisfaction = calculateSatisfaction(prices, subsidyActive);

  const handlePriceChange = (key: string, value: number) => {
    const updatedPrices = { ...prices, [key]: value };
    setPrices(updatedPrices);
    const newSatisfaction = calculateSatisfaction(updatedPrices, subsidyActive);
    setCountryDetail({
      ...countryDetail,
      harga: updatedPrices,
      ...(key === 'harga_beras' ? { price_rice: value } : {}),
      ...(key === 'harga_minyak_goreng' ? { price_fuel: value } : {}),
      satisfaction: {
        ...(countryDetail?.satisfaction || {}),
        price: newSatisfaction,
      },
    });
  };

  const handleSubsidize = () => {
    if (anggaran < 20000000) {
      alert("Kas negara tidak mencukupi untuk membiayai subsidi!");
      return;
    }
    setSubsidyActive(true);
    const newKepuasan = Math.min(100, kepuasan + 5.0);
    const newSatisfaction = calculateSatisfaction(prices, true);
    setCountryDetail({
      ...countryDetail,
      anggaran: anggaran - 20000000,
      kepuasan: newKepuasan,
      subsidyActive: true,
      satisfaction: {
        ...(countryDetail?.satisfaction || {}),
        price: newSatisfaction,
      }
    });
    alert("Beras & Minyak Goreng disubsidi penuh (+5.0% Kepuasan Rakyat)!");
  };

  const priceEntries = Object.entries(prices).filter(([key]) => key.startsWith("harga_"));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto">

        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 gap-2 shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1 sm:p-1.5 bg-[#0F2424] rounded-lg border border-[#00FFAA]/30 shrink-0">
              <Tag className="h-4 w-4 sm:h-5 sm:w-5 text-[#00FFAA]" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">Kontrol Harga Barang Pokok</h2>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm">
            <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-[#0F2424] relative z-10 custom-scrollbar">
          <p className="text-[11px] lg:text-xs text-[#6B8A8A] font-semibold leading-relaxed mb-4 lg:mb-6">
            Stabilkan harga bahan pangan pokok beras, minyak goreng, dan daging di pasar domestik agar inflasi terjaga dan daya beli rakyat kelas bawah tetap aman.
          </p>

          <div className="bg-[#0A1A1A] border border-[#00FFAA]/30 p-3 lg:p-4 rounded-xl mb-4 lg:mb-6">
            <div className="flex justify-between text-xs font-bold text-[#E0E0E0] mb-2">
              <span className="text-[#6B8A8A]">Tingkat Inflasi Sembako:</span>
              <span className="text-rose-400 font-bold">+ 4.8% (Tinggi)</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-[#E0E0E0]">
              <span className="text-[#6B8A8A]">Kas Anggaran Negara:</span>
              <span>{anggaran.toLocaleString("id-ID")} EM</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-[#E0E0E0] mt-1">
              <span className="text-[#6B8A8A]">Status Subsidi:</span>
              <span className={subsidyActive ? "text-emerald-400" : "text-rose-400"}>
                {subsidyActive ? "AKTIF" : "NONAKTIF"}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-[#00FFAA] mb-6">
              <Loader2 className="h-4 w-4 animate-spin text-[#00FFAA]" />
              Memuat data harga negara...
            </div>
          ) : null}

          {error ? <p className="text-sm text-rose-400 mb-4">{error}</p> : null}

          <div className="space-y-3 lg:space-y-4 mb-4 lg:mb-6">
            {priceEntries.length === 0 ? (
              <p className="text-sm text-[#6B8A8A]">Belum ada data harga yang tersedia untuk negara ini.</p>
            ) : (
              priceEntries.map(([key, value]) => (
                <div key={key} className="bg-[#0A1A1A] border border-[#00FFAA]/30 rounded-xl p-3 lg:p-4">
                  <div className="flex items-center justify-between mb-2.5 lg:mb-3">
                    <div>
                      <p className="text-xs lg:text-sm font-black text-[#00FFAA] uppercase">{key.replace("harga_", "").replace(/_/g, " ")}</p>
                      <p className="text-[11px] lg:text-xs text-[#6B8A8A]">
                        Nilai saat ini: <span className="font-bold text-[#E0E0E0]">{Number(value).toLocaleString("id-ID")}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 lg:gap-2">
                    {priceOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => handlePriceChange(key, option)}
                        className={`px-2.5 lg:px-3 py-1.5 lg:py-2 rounded-lg border text-[10px] lg:text-xs font-black uppercase transition cursor-pointer ${
                          value === option
                            ? "bg-[#00FFAA] text-[#0A1A1A] border-[#00FFAA] font-bold"
                            : "bg-[#0F2424] text-[#E0E0E0] border-[#00FFAA]/30 hover:border-[#00FFAA]"
                        }`}
                      >
                        {option.toLocaleString("id-ID")}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={handleSubsidize}
            disabled={subsidyActive || anggaran < 20000000}
            className={`w-full py-2.5 lg:py-3 rounded-xl border text-[11px] lg:text-xs font-black uppercase transition-all ${
              subsidyActive || anggaran < 20000000
                ? "bg-[#0A1A1A] text-[#6B8A8A] border-gray-800 cursor-not-allowed"
                : "cursor-pointer bg-[#00FFAA] text-[#0A1A1A] hover:bg-[#00FFAA]/80 border-[#00FFAA]"
            }`}
          >
            {subsidyActive ? "Subsidi Telah Diberikan" : "Sponsori Subsidi Pasar (20.000.000 EM)"}
          </button>

          {/* ---- INDEKS KEPUASAN RAKYAT (HARGA) ---- */}
          <div className="mt-4 lg:mt-6 p-4 lg:p-5 rounded-xl border border-[#00FFAA]/30 bg-[#0A1A1A]">
            <div className="flex justify-between items-center">
              <span className="text-[11px] lg:text-xs font-black text-[#00FFAA] uppercase tracking-widest">
                Indeks Kepuasan Rakyat (Harga Pokok)
              </span>
              <span className="text-xl lg:text-2xl font-black text-[#00FFAA]">
                {satisfaction} / 100
              </span>
            </div>
            <div className="w-full h-2.5 lg:h-3 bg-[#0F2424] border border-[#00FFAA]/20 rounded-full mt-2.5 lg:mt-3 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#00FFAA] transition-all duration-200"
                style={{ width: `${satisfaction}%` }}
              />
            </div>
            <p className="text-[10px] text-[#E0E0E0] font-bold mt-2.5 lg:mt-3">
              {satisfaction >= 80
                ? "✅ Harga pokok sangat terjangkau, rakyat puas."
                : satisfaction >= 50
                ? "⚠️ Harga masih cukup tinggi, perlu intervensi."
                : "🔴 Harga terlalu mahal, rakyat kesulitan."}
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] text-[#6B8A8A]">
              <div>Rata-rata skor keterjangkauan: <span className="font-bold text-[#E0E0E0]">{satisfaction}%</span></div>
              <div>Status subsidi: <span className="font-bold text-[#E0E0E0]">{subsidyActive ? "AKTIF (+5 poin)" : "Tidak"}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}