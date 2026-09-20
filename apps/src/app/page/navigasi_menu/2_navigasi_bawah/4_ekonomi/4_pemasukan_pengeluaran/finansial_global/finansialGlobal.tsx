"use client";

import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { calculateGoldMiningDailyProduction } from '@/app/logic/economic_logic/goldIncome';
import { COUNTRIES_DATA } from '@/app/page/map_system/map-data';

interface FinansialGlobalProps {
  countryDetail: any;
}

export default function FinansialGlobal({ countryDetail }: FinansialGlobalProps) {
  const [allCountries, setAllCountries] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'net',
    direction: 'desc',
  });

  const formatNumber = (num: number) => num.toLocaleString('id-ID');

  const LEVEL_UP_COST = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];

  const calcTax = (rate: number) => {
    const base = 1000;
    return (rate / 100) * base;
  };

  const getDisplayName = (detail: any) =>
    detail?.name_id || detail?.nama_negara || detail?.country || detail?.country_name || detail?.__fileName || 'Unknown';

  const computeTaxValue = (detail: any) => {
    const incomeTax = detail?.income_tax ?? detail?.pajak?.penghasilan?.tarif ?? 15;
    const corporateTax = detail?.corporate ?? detail?.pajak?.korporasi?.tarif ?? 22;
    const vat = detail?.ppn ?? detail?.pajak?.ppn?.tarif ?? 10;
    const cigaretteTax = detail?.cigarette_tax ?? detail?.pajak?.bea_cukai?.tarif ?? 15;
    const environmentTax = detail?.environment_tax ?? detail?.pajak?.lingkungan?.tarif ?? 5;

    return (
      calcTax(incomeTax) +
      calcTax(corporateTax) +
      calcTax(vat) +
      calcTax(cigaretteTax) +
      calcTax(environmentTax)
    );
  };

  const computeGoldValue = (detail: any) => {
    if (typeof detail?.emas === 'number') {
      return calculateGoldMiningDailyProduction(detail);
    }
    if (typeof detail?.tambang_emas_daily === 'number') {
      return detail.tambang_emas_daily;
    }
    if (typeof detail?.gold_income === 'number') {
      return detail.gold_income;
    }
    return 0;
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
    if (!detail || typeof detail !== 'object') return 0;
    let computed = 0;
    for (const key of Object.keys(detail)) {
      if (key.startsWith('level_')) {
        const lvl = Number(detail[key]) || 1;
        computed += LEVEL_UP_COST[lvl] ?? 100;
      }
    }
    return computed;
  };

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const renderSortArrow = (key: string) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setAllCountries(null);
      try {
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

          setAllCountries(
            data.map((country) => {
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
            })
          );
        } else {
          setAllCountries([]);
        }
      } catch (e) {
        console.error('Error fetching debug data:', e);
        setAllCountries(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

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

    let rows = allCountries.map((country) => {
      const tax = computeTaxValue(country);
      const gold = computeGoldValue(country);
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

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      rows = rows.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.continent.toLowerCase().includes(q)
      );
    }

    if (rows.length === 0) {
      return (
        <tr>
          <td className="px-4 py-6 text-center text-sm text-[#333]" colSpan={7}>
            Tidak ada data yang cocok dengan pencarian "{searchQuery}".
          </td>
        </tr>
      );
    }

    const sortedRows = [...rows].sort((a, b) => {
      const key = sortConfig.key as keyof typeof a;
      const aVal = a[key];
      const bVal = b[key];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      } else {
        return sortConfig.direction === 'asc'
          ? (aVal as number) - (bVal as number)
          : (bVal as number) - (aVal as number);
      }
    });

    return sortedRows.map((row, index) => (
      <tr key={`${row.name}-${index}`} className={index % 2 === 0 ? 'bg-[#0F2424]' : 'bg-[#0A1A1A]'}>
        <td className="px-4 py-3 text-sm text-[#E0E0E0] font-semibold">{row.name}</td>
        <td className="px-4 py-3 text-sm text-[#6B8A8A]">{row.continent}</td>
        <td className="px-4 py-3 text-right text-[#E0E0E0] font-semibold">{formatNumber(row.tax)}</td>
        <td className="px-4 py-3 text-right text-[#E0E0E0] font-semibold">{row.buildingCount > 0 ? row.buildingCount : '-'}</td>
        <td className="px-4 py-3 text-right text-[#E0E0E0] font-semibold">{formatNumber(row.gold)}</td>
        <td className="px-4 py-3 text-right text-[#E0E0E0] font-semibold">{formatNumber(row.ministry)}</td>
        <td className={`px-4 py-3 text-right font-black ${row.net >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {row.net >= 0 ? '+' : ''}{formatNumber(row.net)}
        </td>
      </tr>
    ));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-[10px] text-[#00FFAA] font-black uppercase tracking-wider">APBN Semua Negara</div>
        <div className="relative">
          <input
            type="text"
            placeholder="Cari negara / benua..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-lg bg-[#0A1A1A] border border-[#00FFAA]/30 text-sm font-bold text-[#E0E0E0] outline-none focus:border-[#00FFAA] w-48 transition-all placeholder:text-[#6B8A8A]"
          />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B8A8A]" />
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-[#6B8A8A]">Loading data semua negara...</div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-[#0A1A1A] border border-[#00FFAA]/30">
          <div className="overflow-auto max-h-[60vh] custom-scrollbar">
            <table className="min-w-full table-auto border-separate border-spacing-0 text-left text-[#E0E0E0]">
              <thead>
                <tr className="bg-[#0A1A1A] text-[#00FFAA]">
                  <th
                    className="px-4 py-3 border-b border-[#00FFAA]/30 cursor-pointer hover:bg-[#0F2424] transition font-black uppercase text-xs"
                    onClick={() => handleSort('name')}
                  >
                    Nama Negara{renderSortArrow('name')}
                  </th>
                  <th
                    className="px-4 py-3 border-b border-[#00FFAA]/30 cursor-pointer hover:bg-[#0F2424] transition font-black uppercase text-xs"
                    onClick={() => handleSort('continent')}
                  >
                    Benua{renderSortArrow('continent')}
                  </th>
                  <th
                    className="px-4 py-3 border-b border-[#00FFAA]/30 text-right cursor-pointer hover:bg-[#0F2424] transition font-black uppercase text-xs"
                    onClick={() => handleSort('tax')}
                  >
                    Total Pajak{renderSortArrow('tax')}
                  </th>
                  <th
                    className="px-4 py-3 border-b border-[#00FFAA]/30 text-right cursor-pointer hover:bg-[#0F2424] transition font-black uppercase text-xs"
                    onClick={() => handleSort('buildingCount')}
                  >
                    Bangunan Emas{renderSortArrow('buildingCount')}
                  </th>
                  <th
                    className="px-4 py-3 border-b border-[#00FFAA]/30 text-right cursor-pointer hover:bg-[#0F2424] transition font-black uppercase text-xs"
                    onClick={() => handleSort('gold')}
                  >
                    Produksi Emas{renderSortArrow('gold')}
                  </th>
                  <th
                    className="px-4 py-3 border-b border-[#00FFAA]/30 text-right cursor-pointer hover:bg-[#0F2424] transition font-black uppercase text-xs"
                    onClick={() => handleSort('ministry')}
                  >
                    Pengeluaran{renderSortArrow('ministry')}
                  </th>
                  <th
                    className="px-4 py-3 border-b border-[#00FFAA]/30 text-right cursor-pointer hover:bg-[#0F2424] transition font-black uppercase text-xs"
                    onClick={() => handleSort('net')}
                  >
                    Net Balance Harian{renderSortArrow('net')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {renderAllRows()}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
