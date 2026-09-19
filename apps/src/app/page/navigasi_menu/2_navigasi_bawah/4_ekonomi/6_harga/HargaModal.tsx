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
      <div className="bg-[#FAF6EE] border-2 sm:border-3 border-[#C4B49C] rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.03)_0%,transparent_100%)] pointer-events-none" />

        <div className="px-8 py-6 border-b-2 border-[#C4B49C]/30 flex items-center justify-between bg-[#FAF6EE] relative z-10">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#5c3c10]/10 rounded-xl border border-[#5c3c10]/20">
                <Tag className="h-6 w-6 text-[#5c3c10]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#5c3c10] tracking-tight leading-none uppercase">Kontrol Harga Barang Pokok</h2>
              </div>
            </div>
          </div>

          <button onClick={onClose} className="p-2 sm:p-2.5 rounded-xl border-2 border-[#C4B49C] bg-transparent text-[#8b7e66] hover:text-[#5c3c10] hover:bg-black/5 active:bg-black/10 transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-[#FAF6EE]/40 relative z-10 no-scrollbar">
          <p className="text-xs text-[#8b7e66] font-semibold leading-relaxed mb-6">
            Stabilkan harga bahan pangan pokok beras, minyak goreng, dan daging di pasar domestik agar inflasi terjaga dan daya beli rakyat kelas bawah tetap aman.
          </p>

          <div className="bg-[#e4dac3]/20 border border-[#C4B49C]/30 p-4 rounded-xl mb-6">
            <div className="flex justify-between text-xs font-bold text-[#5c3c10] mb-2">
              <span>Tingkat Inflasi Sembako:</span>
              <span className="text-rose-700 font-bold">+ 4.8% (Tinggi)</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-[#5c3c10]">
              <span>Kas Anggaran Negara:</span>
              <span>{anggaran.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-[#5c3c10] mt-1">
              <span>Status Subsidi:</span>
              <span className={subsidyActive ? "text-emerald-700" : "text-rose-700"}>
                {subsidyActive ? "AKTIF" : "NONAKTIF"}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-[#5c3c10] mb-6">
              <Loader2 className="h-4 w-4 animate-spin" />
              Memuat data harga negara...
            </div>
          ) : null}

          {error ? <p className="text-sm text-rose-700 mb-4">{error}</p> : null}

          <div className="space-y-4 mb-6">
            {priceEntries.length === 0 ? (
              <p className="text-sm text-[#8b7e66]">Belum ada data harga yang tersedia untuk negara ini.</p>
            ) : (
              priceEntries.map(([key, value]) => (
                <div key={key} className="bg-white/70 border border-[#C4B49C]/30 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-black text-[#5c3c10] uppercase">{key.replace("harga_", "").replace(/_/g, " ")}</p>
                      <p className="text-xs text-[#8b7e66]">
                        Nilai saat ini: <span className="font-black text-[#5c3c10]">{Number(value).toLocaleString("id-ID")}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {priceOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => handlePriceChange(key, option)}
                        className={`px-3 py-2 rounded-lg border text-xs font-black uppercase transition cursor-pointer ${
                          value === option
                            ? "bg-[#5c3c10] text-[#FAF6EE] border-[#5c3c10] shadow-sm"
                            : "bg-[#FAF6EE] text-[#5c3c10] border-[#C4B49C] hover:bg-[#e4dac3]"
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
            className={`w-full py-3 rounded-xl text-[#5c3c10] border-2 border-[#1e2f3d]/15 shadow-sm text-xs font-black uppercase cursor-pointer ${
              subsidyActive || anggaran < 20000000
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-b from-[#ffe07d] via-[#fcae1e] to-[#c77a00]"
            }`}
          >
            {subsidyActive ? "Subsidi Telah Diberikan" : "Sponsori Subsidi Pasar (20.000.000 EM)"}
          </button>

          {/* ---- INDEKS KEPUASAN RAKYAT (HARGA) ---- */}
          <div className="mt-6 p-5 rounded-xl border-3 border-[#5c3c10]/40 bg-gradient-to-r from-amber-50 to-amber-100/70 shadow-md">
            <div className="flex justify-between items-center">
              <span className="text-sm font-black text-[#5c3c10] uppercase tracking-widest">
                Indeks Kepuasan Rakyat (Harga Pokok)
              </span>
              <span className="text-3xl font-black text-amber-700">
                {satisfaction} / 100
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-200"
                style={{ width: `${satisfaction}%` }}
              />
            </div>
            <p className="text-[10px] text-amber-700 font-bold mt-3">
              {satisfaction >= 80
                ? "✅ Harga pokok sangat terjangkau, rakyat puas."
                : satisfaction >= 50
                ? "⚠️ Harga masih cukup tinggi, perlu intervensi."
                : "🔴 Harga terlalu mahal, rakyat kesulitan."}
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] text-amber-800/80">
              <div>Rata-rata skor keterjangkauan: <span className="font-bold">{satisfaction}%</span></div>
              <div>Status subsidi: <span className="font-bold">{subsidyActive ? "AKTIF (+5 poin)" : "Tidak"}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}