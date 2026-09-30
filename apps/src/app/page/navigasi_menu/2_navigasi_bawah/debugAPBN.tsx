"use client";

import React, { useEffect, useState } from 'react';
import { X, Bug, Search } from 'lucide-react';
import {
  calculateTotalMinistryCostPerDay,
  calculateGoldIncome,
  calculateTotalTaxIncome,
} from '@/app/logic/economic_logic/treasuryUpdater';
import { COUNTRIES_DATA } from '@/app/page/map_system/map-data';
import { getDailyMinistryCost } from '@/app/logic/economic_logic/departments';

interface DebugAPBNProps {
  isOpen: boolean;
  onClose: () => void;
  countryName: string;
  countryDetail: any;
  taxIncome: number;
  goldIncome: number;
  ministryCost: number;
  netBalance: number;
  hasInteracted?: boolean;
  showAllCountries?: boolean;
}

// Global cache to avoid showing loading state when reopening the modal
let cachedAllCountries: any[] | null = null;
const cachedSingleCountries: Record<string, any> = {};
let cachedDataVersion: number | null = null;

export default function DebugAPBN({
  isOpen,
  onClose,
  countryName,
  countryDetail,
  taxIncome,
  goldIncome,
  ministryCost,
  netBalance,
  hasInteracted = false,
  showAllCountries = false,
}: DebugAPBNProps) {
  const [singleCountryDetail, setSingleCountryDetail] = useState<any | null>(null);
  const [allCountries, setAllCountries] = useState<any[] | null>(cachedAllCountries);
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState<string>(countryName || 'Negara');

  // State untuk sorting dan search
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'net',
    direction: 'desc',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const formatNumber = (num: number) => num.toLocaleString('id-ID');


  const calcTax = (rate: number) => {
    const base = 1000;
    return (rate / 100) * base;
  };

  const getDisplayName = (detail: any) =>
    detail?.name_id || detail?.nama_negara || detail?.country || detail?.country_name || detail?.__fileName || 'Unknown';

  const computeTaxValue = (detail: any) => {
    return calculateTotalTaxIncome(detail);
  };

  const computeTaxMonthly = (detail: any) => {
    return computeTaxValue(detail) * 30;
  };

  const computeGoldValue = (detail: any) => {
    return calculateGoldIncome(detail);
  };

  const computeGoldMonthly = (detail: any) => {
    return computeGoldValue(detail) * 30;
  };

  const normalizeContinent = (continent: any) => {
    if (typeof continent !== 'string') return 'Lainnya';
    const value = continent.trim().toLowerCase();
    if (value === 'asia') return 'Asia';
    if (value === 'africa' || value === 'afrika') return 'Africa';
    if (value === 'europe' || value === 'eropa') return 'Europe';
    if (value === 'north america' || value === 'amerika utara') return 'North America';
    if (value === 'south america' || value === 'amerika selatan') return 'South America';
    if (value === 'oceania' || value === 'oseania') return 'Oceania';
    return 'Lainnya';
  };

  const extractFileOrder = (fileName: any) => {
    if (typeof fileName !== 'string') return NaN;
    const match = fileName.match(/^(\d+)/);
    return match ? Number(match[1]) : NaN;
  };

  const getContinentFromOrder = (order: number) => {
    if (Number.isNaN(order)) return 'Lainnya';
    if (order >= 1 && order <= 51) return 'Africa';
    if (order >= 54 && order <= 102) return 'Asia';
    if (order >= 103 && order <= 151) return 'Europe';
    if (order >= 152 && order <= 178) return 'North America';
    if (order >= 179 && order <= 194) return 'Oceania';
    if (order >= 195 && order <= 207) return 'South America';
    return 'Lainnya';
  };

  const computeMinistryCost = (detail: any) => {
    return calculateTotalMinistryCostPerDay(detail);
  };

  // Handler sorting
  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  // Render indikator panah di header
  const renderSortArrow = (key: string) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
  };

  // Helper to fetch and process all countries data
  const fetchAndProcessAllCountries = async () => {
    const res = await fetch('/api/country-data?all=true', { cache: 'no-store' });
    const data = await res.json();
    if (!Array.isArray(data)) return null;
    const countryToContinentMap = new Map<string, string>();
    COUNTRIES_DATA.forEach((c) => {
      countryToContinentMap.set(c.country.toLowerCase(), c.continent);
    });
    return data.map((country) => {
      const name = getDisplayName(country);
      const listOrder = extractFileOrder(country.__fileName || country.filename || name);
      const continent = normalizeContinent(
        country.__continent ||
          country.continent ||
          countryToContinentMap.get(name.toLowerCase()) ||
          getContinentFromOrder(listOrder)
      );
      return { ...country, __displayName: name, continent, __fileOrder: listOrder };
    });
  };

  // Prefetch data in background on mount
  useEffect(() => {
    const prefetch = async () => {
      if (cachedAllCountries) return;
      try {
        const processed = await fetchAndProcessAllCountries();
        if (processed) {
          cachedAllCountries = processed;
        }
      } catch (e) {
        console.warn('Background prefetch failed:', e);
      }
    };
    prefetch();
  }, []);

  // Polling: detect file changes in 2_sektor_mineral_kritis while modal is open
  useEffect(() => {
    if (!isOpen || !showAllCountries) return;

    const poll = async () => {
      try {
        const res = await fetch('/api/country-data-version', { cache: 'no-store' });
        const { version } = await res.json();
        if (cachedDataVersion !== null && version !== cachedDataVersion) {
          // File changed — invalidate cache and silently refetch
          cachedDataVersion = version;
          cachedAllCountries = null;
          setIsRefreshing(true);
          try {
            const processed = await fetchAndProcessAllCountries();
            if (processed) {
              cachedAllCountries = processed;
              setAllCountries(processed);
            }
          } finally {
            setIsRefreshing(false);
          }
        } else {
          cachedDataVersion = version;
        }
      } catch (e) {
        // silently ignore polling errors
      }
    };

    // Poll immediately then every 3 seconds
    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [isOpen, showAllCountries]);

  useEffect(() => {
    if (!isOpen) return;
    let mounted = true;
    const load = async () => {
      setSearchQuery(''); // Reset search saat modal dibuka

      if (showAllCountries) {
        if (cachedAllCountries) {
          setAllCountries(cachedAllCountries);
          setDisplayName('Semua Negara');
          return;
        }
      } else {
        const countryKey = countryName || 'default';
        if (countryDetail) {
          setDisplayName(countryName || 'Negara');
          return;
        }
        if (cachedSingleCountries[countryKey]) {
          setSingleCountryDetail(cachedSingleCountries[countryKey]);
          setDisplayName(countryName || 'Negara');
          return;
        }
      }

      setLoading(true);
      setSingleCountryDetail(null);
      setAllCountries(null);
      setDisplayName(countryName || 'Negara');
      try {
        if (showAllCountries) {
          const res = await fetch('/api/country-data?all=true', { cache: 'no-store' });
          const data = await res.json();
          if (!mounted) return;
          if (data?.error) {
            console.warn('Failed loading all-country data:', data.error);
            setAllCountries(null);
          } else if (Array.isArray(data)) {
            const countryToContinentMap = new Map<string, string>();
            COUNTRIES_DATA.forEach((c) => {
              countryToContinentMap.set(c.country.toLowerCase(), c.continent);
            });

            const processed = data.map((country) => {
              const name = getDisplayName(country);
              const listOrder = extractFileOrder(country.__fileName || country.filename || name);
              const continent = normalizeContinent(
                country.__continent ||
                  country.continent ||
                  countryToContinentMap.get(name.toLowerCase()) ||
                  getContinentFromOrder(listOrder)
              );
              return {
                ...country,
                __displayName: name,
                continent,
                __fileOrder: listOrder,
              };
            });
            cachedAllCountries = processed;
            setAllCountries(processed);
            setDisplayName('Semua Negara');
          } else {
            setAllCountries([]);
          }
        } else if (!countryDetail) {
          const relPath = 'asia/54_afganistan.ts';
          const res = await fetch(`/api/country-data?path=${relPath}`, { cache: 'no-store' });
          const data = await res.json();
          if (!mounted) return;
          if (data?.error) {
            console.warn('Failed loading country data:', data.error);
            setSingleCountryDetail(null);
          } else {
            const countryKey = countryName || 'default';
            cachedSingleCountries[countryKey] = data;
            setSingleCountryDetail(data);
            setDisplayName(countryName || 'Negara');
          }
        }
      } catch (e) {
        console.error('Error fetching debug data:', e);
        if (showAllCountries) {
          setAllCountries(null);
        } else {
          setSingleCountryDetail(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [isOpen, countryDetail, showAllCountries, countryName]);

  if (!isOpen) return null;

  const detail = singleCountryDetail ?? countryDetail ?? {};

  // Use daily values to match the actual harian values displayed in Neraca Keuangan
  const finalComputedTaxIncome = hasInteracted
    ? (typeof taxIncome === 'number' ? taxIncome : computeTaxValue(detail))
    : computeTaxValue(detail);
  const finalComputedGoldIncome = hasInteracted
    ? (typeof goldIncome === 'number' ? goldIncome : computeGoldValue(detail))
    : computeGoldValue(detail);
  const finalComputedMinistry = hasInteracted
    ? (typeof ministryCost === 'number' ? ministryCost : computeMinistryCost(detail))
    : computeMinistryCost(detail);

  const finalComputedNet = hasInteracted
    ? (typeof netBalance === 'number' ? netBalance : finalComputedTaxIncome + finalComputedGoldIncome - finalComputedMinistry)
    : finalComputedTaxIncome + finalComputedGoldIncome - finalComputedMinistry;

  const taxBreakdown = [
    { label: 'Pajak Penghasilan', rate: detail?.income_tax ?? detail?.pajak?.penghasilan?.tarif ?? 0, value: calcTax(detail?.income_tax ?? detail?.pajak?.penghasilan?.tarif ?? 0) },
    { label: 'Pajak Korporasi', rate: detail?.corporate ?? detail?.pajak?.korporasi?.tarif ?? 0, value: calcTax(detail?.corporate ?? detail?.pajak?.korporasi?.tarif ?? 0) },
    { label: 'PPN', rate: detail?.ppn ?? detail?.pajak?.ppn?.tarif ?? 0, value: calcTax(detail?.ppn ?? detail?.pajak?.ppn?.tarif ?? 0) },
    { label: 'Cukai Rokok', rate: detail?.cigarette_tax ?? 0, value: calcTax(detail?.cigarette_tax ?? 0) },
    { label: 'Pajak Lingkungan', rate: detail?.environment_tax ?? 0, value: calcTax(detail?.environment_tax ?? 0) },
  ];

  const renderAllRows = () => {
    if (!allCountries || allCountries.length === 0) {
      return (
        <tr>
          <td className="px-4 py-6 text-center text-sm text-[#333]" colSpan={7}>
            Tidak ada data negara.
          </td>
        </tr>
      );
    }

    // Ambil data dan filter berdasarkan search
    let rows = allCountries.map((country) => {
      const tax = computeTaxValue(country);
      const gold = computeGoldValue(country); // NEO value
      const ministry = computeMinistryCost(country);
      const net = tax + gold - ministry;
      const continent = normalizeContinent(country.continent || getContinentFromOrder(country.__fileOrder));

      const hasEkstraksiData =
        country.uranium !== undefined ||
        country.batu_bara !== undefined ||
        country.minyak_bumi !== undefined ||
        country.gas_alam !== undefined;
      const buildingCount = hasEkstraksiData && typeof country.emas === 'number' ? country.emas : 0;

      return {
        name: country.__displayName || getDisplayName(country),
        continent,
        tax,
        gold,
        ministry,
        net,
        order: country.__fileOrder,
        buildingCount,
      };
    });

    // Filter berdasarkan searchQuery
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      rows = rows.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.continent.toLowerCase().includes(q)
      );
    }

    // Jika hasil kosong setelah filter
    if (rows.length === 0) {
      return (
        <tr>
          <td className="px-4 py-6 text-center text-sm text-[#333]" colSpan={7}>
            Tidak ada data yang cocok dengan pencarian "{searchQuery}".
          </td>
        </tr>
      );
    }

    // Sorting berdasarkan konfigurasi
    const sortedRows = [...rows].sort((a, b) => {
      const key = sortConfig.key as keyof typeof a;
      const aVal = a[key];
      const bVal = b[key];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      } else {
        // angka
        return sortConfig.direction === 'asc'
          ? (aVal as number) - (bVal as number)
          : (bVal as number) - (aVal as number);
      }
    });

    return sortedRows.map((row, index) => (
      <tr key={`${row.name}-${index}`} className={index % 2 === 0 ? 'bg-white/80' : 'bg-white/60'}>
        <td className="px-4 py-3 text-sm">{row.name}</td>
        <td className="px-4 py-3 text-sm text-slate-600">{row.continent}</td>
        <td className="px-4 py-3 text-right font-medium">{formatNumber(row.tax)}</td>
        <td className="px-4 py-3 text-right font-medium">{row.buildingCount > 0 ? row.buildingCount : '-'}</td>
        <td className="px-4 py-3 text-right font-medium">{formatNumber(row.gold)}</td>
        <td className="px-4 py-3 text-right font-medium">{formatNumber(row.ministry)}</td>
        <td className={`px-4 py-3 text-right font-black ${row.net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
          {row.net >= 0 ? '+' : ''}{formatNumber(row.net)}
        </td>
      </tr>
    ));
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#e6d8b9] border border-[#c4b49c] rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl text-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Bug className="w-5 h-5 text-[#5ea3b1]" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Debug APBN</h2>
                {showAllCountries && (
                  <span
                    title={isRefreshing ? 'Memperbarui data...' : 'Live update aktif'}
                    className={`inline-block w-2 h-2 rounded-full ${
                      isRefreshing ? 'bg-yellow-500 animate-ping' : 'bg-emerald-500'
                    }`}
                  />
                )}
              </div>
              <p className="text-sm text-black/60">{showAllCountries ? 'Semua 207 negara' : displayName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Cari negara / benua..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg bg-white/80 border border-[#c4b49c] text-sm outline-none focus:ring-2 focus:ring-[#5ea3b1] w-48 transition-all placeholder:text-[#8b7e66]"
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8b7e66]" />
            </div>
            {/* Tombol Tutup */}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/80 hover:bg-white transition text-black"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center">Loading...</div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-white/80 border border-[#d2c4a8]">
            <div className="overflow-auto max-h-[76vh]">
              <table className="min-w-full table-auto border-separate border-spacing-0 text-left">
                <thead>
                  <tr className="bg-[#e9dcc6]">
                    {/* Header dengan onClick untuk sorting */}
                    <th
                      className="px-4 py-3 border-b border-[#c4b49c] cursor-pointer hover:bg-[#ddd0b8] transition"
                      onClick={() => handleSort('name')}
                    >
                      Nama Negara{renderSortArrow('name')}
                    </th>
                    <th
                      className="px-4 py-3 border-b border-[#c4b49c] cursor-pointer hover:bg-[#ddd0b8] transition"
                      onClick={() => handleSort('continent')}
                    >
                      Benua{renderSortArrow('continent')}
                    </th>
                    <th
                      className="px-4 py-3 border-b border-[#c4b49c] text-right cursor-pointer hover:bg-[#ddd0b8] transition"
                      onClick={() => handleSort('tax')}
                    >
                      Total Pajak{renderSortArrow('tax')}
                    </th>
                    <th
                      className="px-4 py-3 border-b border-[#c4b49c] text-right cursor-pointer hover:bg-[#ddd0b8] transition"
                      onClick={() => handleSort('buildingCount')}
                    >
                      Bangunan Emas{renderSortArrow('buildingCount')}
                    </th>
                    <th
                      className="px-4 py-3 border-b border-[#c4b49c] text-right cursor-pointer hover:bg-[#ddd0b8] transition"
                      onClick={() => handleSort('gold')}
                    >
                      Produksi Emas{renderSortArrow('gold')}
                    </th>
                    <th
                      className="px-4 py-3 border-b border-[#c4b49c] text-right cursor-pointer hover:bg-[#ddd0b8] transition"
                      onClick={() => handleSort('ministry')}
                    >
                      Pengeluaran{renderSortArrow('ministry')}
                    </th>
                    <th
                      className="px-4 py-3 border-b border-[#c4b49c] text-right cursor-pointer hover:bg-[#ddd0b8] transition"
                      onClick={() => handleSort('net')}
                    >
                      Netto APBN{renderSortArrow('net')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {showAllCountries ? (
                    renderAllRows()
                  ) : (
                    <tr className="border-t border-[#e9dcc6] bg-white/80">
                      <td className="px-4 py-3">{getDisplayName(detail) || displayName}</td>
                      <td className="px-4 py-3 text-slate-600">-</td>
                      <td className="px-4 py-3 text-right font-medium">{formatNumber(finalComputedTaxIncome)}</td>
                      <td className="px-4 py-3 text-right font-medium">
                        {((detail?.uranium !== undefined ||
                          detail?.batu_bara !== undefined ||
                          detail?.minyak_bumi !== undefined ||
                          detail?.gas_alam !== undefined) &&
                          typeof detail?.emas === 'number')
                          ? detail.emas
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">{formatNumber(finalComputedGoldIncome)}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatNumber(finalComputedMinistry)}</td>
                      <td className={`px-4 py-3 text-right font-black ${finalComputedNet >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {finalComputedNet >= 0 ? '+' : ''}{formatNumber(finalComputedNet)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
