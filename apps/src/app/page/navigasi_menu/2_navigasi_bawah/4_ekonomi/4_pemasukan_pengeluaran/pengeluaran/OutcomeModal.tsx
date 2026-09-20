"use client"
import React, { useState } from "react";
import { X, BarChart3, ArrowDownRight } from "lucide-react";

interface OutcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail: any;
  setCountryDetail: (detail: any) => void;
}

interface OutcomeItem {
  label: string;
  amount: number;
  color: string;
  description?: string;
}

// Department data dari KementerianModal - LENGKAP: 15 Kementerian + 5 Keamanan + 2 Layanan = 22 total
const ALL_DEPARTMENTS = [
  // KEMENTERIAN (15 total)
  { id: "infrastruktur", baseIncomeCost: 100 },
  { id: "pendidikan", baseIncomeCost: 100 },
  { id: "sains", baseIncomeCost: 100 },
  { id: "kesehatan", baseIncomeCost: 100 },
  { id: "olahraga", baseIncomeCost: 100 },
  { id: "kehakiman", baseIncomeCost: 100 },
  { id: "pertahanan", baseIncomeCost: 100 },
  { id: "luar-negeri", baseIncomeCost: 100 },
  { id: "kebudayaan", baseIncomeCost: 100 },
  { id: "pariwisata", baseIncomeCost: 100 },
  { id: "lingkungan", baseIncomeCost: 100 },
  { id: "perumahan", baseIncomeCost: 100 },
  { id: "pembangunan", baseIncomeCost: 100 },
  { id: "perdagangan", baseIncomeCost: 100 },
  { id: "keuangan", baseIncomeCost: 100 },
  
  // KEAMANAN (5 total)
  { id: "dinas-keamanan", baseIncomeCost: 100 },
  { id: "polisi", baseIncomeCost: 100 },
  { id: "garda-nasional", baseIncomeCost: 100 },
  { id: "komandan-angkatan-darat", baseIncomeCost: 100 },
  { id: "komandan-armada", baseIncomeCost: 100 },
  
  // LAYANAN (2 total)
  { id: "layanan-darurat", baseIncomeCost: 100 },
  { id: "bank-sentral", baseIncomeCost: 100 }
];

const LEVEL_UP_COST = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];

const calculateMinistryDailyIncome = (level: number, _baseIncomeCost: number) => {
  return LEVEL_UP_COST[level] ?? 100;
};

const calculateTotalMinistryCost = (countryDetail: any) => {
  let totalCost = 0;
  
  for (const dept of ALL_DEPARTMENTS) {
    const level = countryDetail[`level_${dept.id}`] ?? 1;
    const dailyCost = calculateMinistryDailyIncome(level, dept.baseIncomeCost);
    totalCost += dailyCost;
  }
  
  return totalCost;
};

const getMinistryIncomeByName = (name: string, countryDetail: any) => {
  const dept = ALL_DEPARTMENTS.find(d => d.id === name);
  if (!dept) return 0;
  const level = countryDetail[`level_${name}`] ?? 1;
  return calculateMinistryDailyIncome(level, dept.baseIncomeCost);
};

export default function OutcomeModal({ isOpen, onClose, countryDetail, setCountryDetail }: OutcomeModalProps) {
  if (!isOpen) return null;

  // Calculate ministry daily cost (per hari) dari SEMUA 22 department
  const ministryDailyCost = calculateTotalMinistryCost(countryDetail);
  
  // Konversi ke bulanan (30 hari) - INI adalah total pengeluaran Dewan Kabinet
  const ministryCostPerMonth = ministryDailyCost * 30;

  // Initialize budget sliders - ambil dari countryDetail atau gunakan ministryCostPerMonth sebagai default
  const [budgets, setBudgets] = useState({
    military: countryDetail?.military_budget ?? ministryCostPerMonth,
    subsidy: countryDetail?.subsidy_budget ?? ministryCostPerMonth,
    education: countryDetail?.education_budget ?? ministryCostPerMonth,
    health: countryDetail?.health_budget ?? ministryCostPerMonth,
    infrastructure: countryDetail?.infrastructure_budget ?? ministryCostPerMonth,
    asn_salary: countryDetail?.asn_salary_budget ?? ministryCostPerMonth,
    debt_interest: countryDetail?.debt_interest_budget || 0
  });

  const handleBudgetChange = (key: string, value: number) => {
    const newBudgets = { ...budgets, [key]: value };
    setBudgets(newBudgets);

    // Update countryDetail with new budgets
    setCountryDetail({
      ...countryDetail,
      military_budget: newBudgets.military,
      subsidy_budget: newBudgets.subsidy,
      education_budget: newBudgets.education,
      health_budget: newBudgets.health,
      infrastructure_budget: newBudgets.infrastructure,
      asn_salary_budget: newBudgets.asn_salary,
      debt_interest_budget: newBudgets.debt_interest
    });
  };

  // Build outcome items dynamically
  const outcomeItems: OutcomeItem[] = [
    { label: "Pemeliharaan Militer", amount: budgets.military, color: "text-red-700", description: "Pengaruh: Stabilitas Keamanan" },
    { label: "Beban Subsidi Publik", amount: budgets.subsidy, color: "text-orange-700", description: "Pengaruh: Approval Rating" },
    { label: "Anggaran Pendidikan", amount: budgets.education, color: "text-amber-700", description: "Pengaruh: Kualitas SDM" },
    { label: "Anggaran Kesehatan", amount: budgets.health, color: "text-yellow-700", description: "Pengaruh: Kepuasan & Kesejahteraan" },
    { label: "Anggaran Infrastruktur", amount: budgets.infrastructure, color: "text-lime-700", description: "Pengaruh: Produktivitas Ekonomi" },
    { label: "Gaji ASN/Birokrasi", amount: budgets.asn_salary, color: "text-green-700", description: "Fixed Cost, Scaling" },
    { label: "Biaya Operasional Dewan Kabinet", amount: ministryCostPerMonth, color: "text-blue-700", description: "Total Pengeluaran Semua Ministry" }
  ];

  if (budgets.debt_interest > 0) {
    outcomeItems.push({
      label: "Cicilan Utang + Bunga",
      amount: budgets.debt_interest,
      color: "text-rose-900",
      description: "Cicilan Obligasi"
    });
  }

  const totalOutcome = outcomeItems.reduce((sum, item) => sum + item.amount, 0);
  const anggaran = countryDetail?.anggaran || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl w-full max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] overflow-hidden relative font-sans pointer-events-auto flex flex-col">
        <div className="px-6 py-4 border-b border-[#00FFAA]/30 flex items-center justify-between bg-[#0A1A1A] relative z-10 flex-shrink-0">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#0F2424] rounded-xl border border-[#00FFAA]/30">
                <BarChart3 className="h-6 w-6 text-[#00FFAA]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">Alokasi Pengeluaran Negara</h2>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 sm:p-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-[#0F2424] relative z-10 custom-scrollbar">
          <div className="space-y-6 max-w-4xl">
            <p className="text-xs text-[#6B8A8A] font-semibold leading-relaxed">
              Atur alokasi anggaran pengeluaran negara. Setiap kategori memiliki pengaruh berbeda terhadap stabilitas ekonomi dan kesejahteraan rakyat.
            </p>

            {/* Budget Sliders */}
            <div className="space-y-6">
              {/* Pemeliharaan Militer */}
              <div className="bg-[#0A1A1A] border border-[#00FFAA]/30 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-black text-[#00FFAA] uppercase">Pemeliharaan Militer</h4>
                    <p className="text-[10px] text-[#6B8A8A] mt-1">Pengaruh: Stabilitas Keamanan</p>
                  </div>
                  <span className="text-sm font-black text-rose-400">- {budgets.military.toLocaleString("id-ID")} EM</span>
                </div>
                <input
                  type="range"
                  min="1000000"
                  max="20000000"
                  value={budgets.military}
                  onChange={(e) => handleBudgetChange("military", parseInt(e.target.value))}
                  className="w-full accent-[#00FFAA] cursor-pointer"
                />
                <p className="text-[10px] text-[#6B8A8A]">1M - 20M EM</p>
              </div>

              {/* Beban Subsidi Publik */}
              <div className="bg-[#0A1A1A] border border-[#00FFAA]/30 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-black text-[#00FFAA] uppercase">Beban Subsidi Publik</h4>
                    <p className="text-[10px] text-[#6B8A8A] mt-1">Pengaruh: Approval Rating</p>
                  </div>
                  <span className="text-sm font-black text-amber-400">- {budgets.subsidy.toLocaleString("id-ID")} EM</span>
                </div>
                <input
                  type="range"
                  min="1000000"
                  max="25000000"
                  value={budgets.subsidy}
                  onChange={(e) => handleBudgetChange("subsidy", parseInt(e.target.value))}
                  className="w-full accent-[#00FFAA] cursor-pointer"
                />
                <p className="text-[10px] text-[#6B8A8A]">1M - 25M EM</p>
              </div>

              {/* Anggaran Pendidikan */}
              <div className="bg-[#0A1A1A] border border-[#00FFAA]/30 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-black text-[#00FFAA] uppercase">Anggaran Pendidikan</h4>
                    <p className="text-[10px] text-[#6B8A8A] mt-1">Pengaruh: Kualitas SDM & Produktivitas (Jangka Panjang)</p>
                  </div>
                  <span className="text-sm font-black text-amber-300">- {budgets.education.toLocaleString("id-ID")} EM</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15000000"
                  value={budgets.education}
                  onChange={(e) => handleBudgetChange("education", parseInt(e.target.value))}
                  className="w-full accent-[#00FFAA] cursor-pointer"
                />
                <p className="text-[10px] text-[#6B8A8A]">0 - 15M EM</p>
              </div>

              {/* Anggaran Kesehatan */}
              <div className="bg-[#0A1A1A] border border-[#00FFAA]/30 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-black text-[#00FFAA] uppercase">Anggaran Kesehatan</h4>
                    <p className="text-[10px] text-[#6B8A8A] mt-1">Pengaruh: Kepuasan Rakyat & Pencegahan Wabah</p>
                  </div>
                  <span className="text-sm font-black text-yellow-400">- {budgets.health.toLocaleString("id-ID")} EM</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="12000000"
                  value={budgets.health}
                  onChange={(e) => handleBudgetChange("health", parseInt(e.target.value))}
                  className="w-full accent-[#00FFAA] cursor-pointer"
                />
                <p className="text-[10px] text-[#6B8A8A]">0 - 12M EM</p>
              </div>

              {/* Anggaran Infrastruktur */}
              <div className="bg-[#0A1A1A] border border-[#00FFAA]/30 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-black text-[#00FFAA] uppercase">Anggaran Infrastruktur</h4>
                    <p className="text-[10px] text-[#6B8A8A] mt-1">Pengaruh: Produktivitas Ekonomi (Jangka Panjang)</p>
                  </div>
                  <span className="text-sm font-black text-emerald-400">- {budgets.infrastructure.toLocaleString("id-ID")} EM</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20000000"
                  value={budgets.infrastructure}
                  onChange={(e) => handleBudgetChange("infrastructure", parseInt(e.target.value))}
                  className="w-full accent-[#00FFAA] cursor-pointer"
                />
                <p className="text-[10px] text-[#6B8A8A]">0 - 20M EM</p>
              </div>

              {/* Gaji ASN/Birokrasi */}
              <div className="bg-[#0A1A1A] border border-[#00FFAA]/30 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-black text-[#00FFAA] uppercase">Gaji ASN/Birokrasi</h4>
                    <p className="text-[10px] text-[#6B8A8A] mt-1">Fixed Cost, Scaling dengan Jumlah Pegawai</p>
                  </div>
                  <span className="text-sm font-black text-emerald-400">- {budgets.asn_salary.toLocaleString("id-ID")} EM</span>
                </div>
                <input
                  type="range"
                  min="1000000"
                  max="10000000"
                  value={budgets.asn_salary}
                  onChange={(e) => handleBudgetChange("asn_salary", parseInt(e.target.value))}
                  className="w-full accent-[#00FFAA] cursor-pointer"
                />
                <p className="text-[10px] text-[#6B8A8A]">1M - 10M EM</p>
              </div>

              {/* Biaya Operasional Dewan Kabinet - Read Only */}
              <div className="bg-[#0A1A1A] border border-[#00FFAA]/30 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-black text-[#00FFAA] uppercase">Biaya Operasional Dewan Kabinet</h4>
                    <p className="text-[10px] text-[#6B8A8A] mt-1">Total Pengeluaran Semua Ministry (Otomatis)</p>
                  </div>
                  <span className="text-sm font-black text-[#00FFAA]">- {ministryCostPerMonth.toLocaleString("id-ID")} EM</span>
                </div>
                <p className="text-[10px] text-[#6B8A8A] italic">Dihitung otomatis dari level semua kementerian, keamanan, dan layanan. Tidak bisa diatur manual.</p>
                <div className="bg-[#0F2424] border border-[#00FFAA]/20 rounded p-2">
                  <p className="text-[10px] text-[#E0E0E0] font-semibold">
                    📊 Breakdown: {ministryCostPerMonth.toLocaleString("id-ID")} = {(ministryCostPerMonth / 30).toLocaleString("id-ID", { maximumFractionDigits: 0 })} × 30
                  </p>
                </div>
              </div>

              {/* Cicilan Utang - Only if debt exists */}
              {budgets.debt_interest > 0 && (
                <div className="bg-[#0A1A1A] border border-[#00FFAA]/30 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-black text-[#00FFAA] uppercase">Cicilan Utang + Bunga</h4>
                      <p className="text-[10px] text-[#6B8A8A] mt-1">Cicilan Obligasi (Otomatis)</p>
                    </div>
                    <span className="text-sm font-black text-rose-400">- {budgets.debt_interest.toLocaleString("id-ID")} EM</span>
                  </div>
                  <p className="text-[10px] text-[#6B8A8A] italic">Cicilan utang otomatis, tidak bisa diatur</p>
                </div>
              )}
            </div>

            {/* Total Summary */}
            <div className="bg-[#0A1A1A] border border-[#00FFAA]/30 p-6 rounded-xl space-y-4 mt-8">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-[#00FFAA] uppercase tracking-widest">Total Pengeluaran</span>
                <span className="text-2xl font-black text-rose-400">- {totalOutcome.toLocaleString("id-ID")} EM</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-[#00FFAA]/20">
                <span className="text-xs font-bold text-[#6B8A8A] uppercase">Total Saldo Kas Negara:</span>
                <span className="text-lg font-black text-[#00FFAA]">{anggaran.toLocaleString("id-ID")} EM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
