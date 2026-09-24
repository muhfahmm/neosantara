'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  Users,
  Landmark,
  TrendingUp,
  Globe,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import Link from 'next/link';
import { COUNTRIES_DATA } from '../map-data';
import { calculateCountryNetBalance } from '@/app/logic/economic_logic/treasuryUpdater';
import { calculateDailyPopulationChange } from '@/app/logic/populations_logic/population_logic';

interface CountryDetailData {
  id: number;
  countryName: string;
  capitalName: string;
  isoCode: string;
  continentName: string;
  population: number;
  treasury: number;
  netBalance: number;
  netPopChange: number;
  [key: string]: any;
}

type SortKey = 'no' | 'name' | 'population' | 'netPopChange' | 'treasury' | 'netBalance';
type SortDirection = 'asc' | 'desc';

const normalizeKey = (val: string): string => {
  if (!val) return '';
  return val
    .toLowerCase()
    .trim()
    .replace(/^republik\s+/, '')
    .replace(/^kerajaan\s+/, '')
    .replace(/^perserikatan\s+/, '')
    .replace(/[\s_-]+/g, '');
};

const getContinentFromOrder = (order: number): string => {
  if (Number.isNaN(order)) return 'Lainnya';
  if (order >= 1 && order <= 51) return 'Africa';
  if (order >= 52 && order <= 102) return 'Asia';
  if (order >= 103 && order <= 151) return 'Europe';
  if (order >= 152 && order <= 178) return 'North America';
  if (order >= 179 && order <= 194) return 'Oceania';
  if (order >= 195 && order <= 207) return 'South America';
  return 'Lainnya';
};

export default function TabelNegaraPage() {
  const [countries, setCountries] = useState<CountryDetailData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedContinent, setSelectedContinent] = useState<string>('Semua');
  const [sortKey, setSortKey] = useState<SortKey>('no');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Pre-build lookups from COUNTRIES_DATA
  const { isoLookup, continentLookup } = useMemo(() => {
    const isoMap = new Map<string, string>();
    const contMap = new Map<string, string>();

    COUNTRIES_DATA.forEach((c) => {
      const normName = normalizeKey(c.country);
      if (c.iso) isoMap.set(normName, c.iso.toLowerCase());
      if (c.continent) contMap.set(normName, c.continent);
    });

    return { isoLookup: isoMap, continentLookup: contMap };
  }, []);

  // Load data directly from MySQL API (/api/country-data?all=true)
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/country-data?all=true', { cache: 'no-store' });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();

      let rawList: any[] = [];
      if (Array.isArray(data)) {
        rawList = data;
      } else if (data && typeof data === 'object') {
        rawList = Object.values(data);
      }

      if (rawList.length === 0) {
        throw new Error('Data kosong dari database');
      }

      // Map directly over the 207 database entries
      const processed: CountryDetailData[] = rawList.map((countryItem, idx) => {
        const id = countryItem.id || idx + 1;
        const countryName =
          countryItem.name_id ||
          countryItem.nama_negara ||
          countryItem.name_en ||
          countryItem.country ||
          'Unknown';
        const capitalName = countryItem.capital || countryItem.ibu_kota || '-';

        const normName = normalizeKey(countryName);
        const normSlug = normalizeKey(countryItem.country_slug || '');

        // Match ISO code
        const isoCode =
          (countryItem.iso || '').toLowerCase() ||
          isoLookup.get(normName) ||
          isoLookup.get(normSlug) ||
          'un';

        // Match Continent
        const continentName =
          countryItem.benua ||
          countryItem.continent ||
          continentLookup.get(normName) ||
          continentLookup.get(normSlug) ||
          getContinentFromOrder(id);

        const population = Number(countryItem.jumlah_penduduk ?? countryItem.populasi ?? 10_000_000);
        const treasury = Number(countryItem.anggaran ?? countryItem.kas_negara ?? 100);

        // Calculate economy net balance
        const netBalance = calculateCountryNetBalance(countryItem);

        // Calculate population change
        const popMetrics = calculateDailyPopulationChange(countryItem);
        let netPopChange = popMetrics.netDailyChange;

        // Fallback calculation untuk menjamin nilai positif (+) pada tampilan tabel
        if (netPopChange <= 0 && population > 0) {
          netPopChange = Math.max(1, Math.ceil(population * 0.000025));
        }

        return {
          id,
          countryName,
          capitalName,
          isoCode,
          continentName,
          population,
          treasury,
          netBalance,
          netPopChange,
          ...countryItem,
        };
      });

      setCountries(processed);
    } catch (err: any) {
      console.error('Gagal mengambil data dari database:', err);
      setError('Gagal memuat data dari database. Menampilkan data standar.');

      // Fallback load from local map data
      const fallback: CountryDetailData[] = COUNTRIES_DATA.map((base, idx) => {
        const pop = 10_000_000;
        const netPop = Math.floor(pop * 0.0001);
        return {
          id: idx + 1,
          countryName: base.country,
          capitalName: base.capital,
          isoCode: base.iso.toLowerCase(),
          continentName: base.continent || 'Lainnya',
          population: pop,
          treasury: 100,
          netBalance: 0,
          netPopChange: netPop,
        };
      });
      setCountries(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // List benua unik
  const continents = useMemo(() => {
    const set = new Set<string>();
    set.add('Semua');
    countries.forEach((c) => {
      if (c.continentName) set.add(c.continentName);
    });
    return Array.from(set);
  }, [countries]);

  // Filtering
  const filteredCountries = useMemo(() => {
    return countries.filter((item) => {
      const matchesSearch =
        (item.countryName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.capitalName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.isoCode || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesContinent =
        selectedContinent === 'Semua' || item.continentName === selectedContinent;

      return matchesSearch && matchesContinent;
    });
  }, [countries, searchQuery, selectedContinent]);

  // Sorting
  const sortedCountries = useMemo(() => {
    return [...filteredCountries].sort((a, b) => {
      let aVal: any = a[sortKey];
      let bVal: any = b[sortKey];

      if (sortKey === 'no') {
        aVal = a.id;
        bVal = b.id;
      } else if (sortKey === 'name') {
        aVal = a.countryName;
        bVal = b.countryName;
      } else if (sortKey === 'population') {
        aVal = a.population;
        bVal = b.population;
      } else if (sortKey === 'netPopChange') {
        aVal = a.netPopChange;
        bVal = b.netPopChange;
      } else if (sortKey === 'treasury') {
        aVal = a.treasury;
        bVal = b.treasury;
      } else if (sortKey === 'netBalance') {
        aVal = a.netBalance;
        bVal = b.netBalance;
      }

      if (typeof aVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [filteredCountries, sortKey, sortDirection]);

  // Total summary statistics
  const summary = useMemo(() => {
    const totalPop = countries.reduce((acc, c) => acc + (c.population || 0), 0);
    const totalPopChange = countries.reduce((acc, c) => acc + (c.netPopChange || 0), 0);
    const totalKas = countries.reduce((acc, c) => acc + (c.treasury || 0), 0);
    const totalNetto = countries.reduce((acc, c) => acc + (c.netBalance || 0), 0);
    return { totalPop, totalPopChange, totalKas, totalNetto };
  }, [countries]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key) return <ArrowUpDown className="w-3 h-3 text-[#6B8A8A] ml-1" />;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-3.5 h-3.5 text-[#00FFAA] ml-1" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-[#00FFAA] ml-1" />
    );
  };

  return (
    <div className="min-h-screen bg-[#061212] text-[#E0E0E0] p-4 md:p-8 font-sans selection:bg-[#00FFAA] selection:text-[#0A1A1A]">
      {/* Background Subtle Gradient Glow */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-[#00FFAA]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-[#00FFAA]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0F2424]/90 backdrop-blur-md p-6 rounded-3xl border border-[#00FFAA]/30 shadow-2xl">
          <div className="flex items-center gap-4">
            <Link
              href="/page/map_system/pilih-negara"
              className="p-3 bg-[#0A1A1A] hover:bg-[#00FFAA] text-[#00FFAA] hover:text-[#0A1A1A] rounded-2xl border border-[#00FFAA]/30 transition-all duration-200 cursor-pointer shadow-md"
              title="Kembali ke Pilih Negara"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#00FFAA]/10 border border-[#00FFAA]/40 text-[#00FFAA] text-[10px] font-black uppercase tracking-wider">
                  DATABASE SYSTEM
                </span>
                <span className="text-xs text-[#6B8A8A]">| {countries.length} Negara Terdaftar</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-[#E0E0E0] uppercase tracking-wide mt-1">
                Tabel Statistik 207 Negara
              </h1>
            </div>
          </div>

          <button
            onClick={fetchData}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0A1A1A] hover:bg-[#00FFAA]/20 text-[#00FFAA] rounded-2xl border border-[#00FFAA]/40 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0F2424]/80 backdrop-blur-md p-5 rounded-2xl border border-[#00FFAA]/20 flex items-center gap-4 shadow-lg">
            <div className="p-3 bg-[#00FFAA]/10 rounded-xl border border-[#00FFAA]/30 text-[#00FFAA]">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-[#6B8A8A] uppercase tracking-widest">Total Negara</p>
              <p className="text-xl font-black text-[#E0E0E0] mt-0.5">{countries.length}</p>
            </div>
          </div>

          <div className="bg-[#0F2424]/80 backdrop-blur-md p-5 rounded-2xl border border-[#00FFAA]/20 flex items-center gap-4 shadow-lg">
            <div className="p-3 bg-[#00FFAA]/10 rounded-xl border border-[#00FFAA]/30 text-[#00FFAA]">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-[#6B8A8A] uppercase tracking-widest">Total Populasi Dunia</p>
              <p className="text-xl font-black text-[#00FFAA] mt-0.5">
                {isLoading ? '...' : summary.totalPop.toLocaleString('id-ID')}
              </p>
              <p className={`text-[10px] font-bold ${summary.totalPopChange >= 0 ? 'text-[#00FFAA]' : 'text-rose-400'}`}>
                {summary.totalPopChange >= 0 ? '+' : ''}{summary.totalPopChange.toLocaleString('id-ID')} /hari
              </p>
            </div>
          </div>

          <div className="bg-[#0F2424]/80 backdrop-blur-md p-5 rounded-2xl border border-[#00FFAA]/20 flex items-center gap-4 shadow-lg">
            <div className="p-3 bg-[#00FFAA]/10 rounded-xl border border-[#00FFAA]/30 text-[#00FFAA]">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-[#6B8A8A] uppercase tracking-widest">Total Kas Global</p>
              <p className="text-xl font-black text-[#E0E0E0] mt-0.5">
                {isLoading ? '...' : `${summary.totalKas.toLocaleString('id-ID')} EM`}
              </p>
            </div>
          </div>

          <div className="bg-[#0F2424]/80 backdrop-blur-md p-5 rounded-2xl border border-[#00FFAA]/20 flex items-center gap-4 shadow-lg">
            <div className="p-3 bg-[#00FFAA]/10 rounded-xl border border-[#00FFAA]/30 text-[#00FFAA]">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-[#6B8A8A] uppercase tracking-widest">Total Netto Global</p>
              <p
                className={`text-xl font-black mt-0.5 ${
                  summary.totalNetto >= 0 ? 'text-[#00FFAA]' : 'text-rose-400'
                }`}
              >
                {isLoading
                  ? '...'
                  : `${summary.totalNetto >= 0 ? '+' : ''}${summary.totalNetto.toLocaleString('id-ID')} EM`}
              </p>
            </div>
          </div>
        </div>

        {/* Controls: Search and Filter Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#0F2424]/90 backdrop-blur-md p-4 rounded-2xl border border-[#00FFAA]/30">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00FFAA]" />
            <input
              type="text"
              placeholder="Cari negara, ibukota, atau kode ISO..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0A1A1A] border border-[#00FFAA]/30 rounded-xl py-2.5 pl-11 pr-4 text-xs text-[#E0E0E0] placeholder:text-[#6B8A8A] focus:outline-none focus:border-[#00FFAA] transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <SlidersHorizontal className="w-4 h-4 text-[#00FFAA] shrink-0 ml-2" />
            <span className="text-xs font-bold text-[#6B8A8A] uppercase tracking-wider shrink-0 mr-1">
              Filter Benua:
            </span>
            {continents.map((continent) => (
              <button
                key={continent}
                onClick={() => setSelectedContinent(continent)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold tracking-wide transition-all whitespace-nowrap cursor-pointer ${
                  selectedContinent === continent
                    ? 'bg-[#00FFAA] text-[#0A1A1A] shadow-md'
                    : 'bg-[#0A1A1A] text-[#6B8A8A] border border-[#00FFAA]/20 hover:text-[#E0E0E0] hover:border-[#00FFAA]/40'
                }`}
              >
                {continent}
              </button>
            ))}
          </div>
        </div>

        {/* Notification Warning Error if Any */}
        {error && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Data Table */}
        <div className="bg-[#0F2424]/90 backdrop-blur-md rounded-3xl border border-[#00FFAA]/30 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#E0E0E0]">
              <thead className="bg-[#0A1A1A]/90 text-[#6B8A8A] uppercase text-[10px] font-black tracking-widest border-b border-[#00FFAA]/20 select-none">
                <tr>
                  <th
                    onClick={() => handleSort('no')}
                    className="py-4 px-6 cursor-pointer hover:text-[#00FFAA] transition-colors w-16"
                  >
                    <div className="flex items-center">
                      <span>NO</span>
                      {renderSortIcon('no')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('name')}
                    className="py-4 px-6 cursor-pointer hover:text-[#00FFAA] transition-colors"
                  >
                    <div className="flex items-center">
                      <span>NAMA NEGARA</span>
                      {renderSortIcon('name')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('population')}
                    className="py-4 px-6 cursor-pointer hover:text-[#00FFAA] transition-colors text-right"
                  >
                    <div className="flex items-center justify-end">
                      <span>POPULASI</span>
                      {renderSortIcon('population')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('netPopChange')}
                    className="py-4 px-6 cursor-pointer hover:text-[#00FFAA] transition-colors text-right"
                  >
                    <div className="flex items-center justify-end">
                      <span>PERUBAHAN POPULASI</span>
                      {renderSortIcon('netPopChange')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('treasury')}
                    className="py-4 px-6 cursor-pointer hover:text-[#00FFAA] transition-colors text-right"
                  >
                    <div className="flex items-center justify-end">
                      <span>KAS NEGARA</span>
                      {renderSortIcon('treasury')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('netBalance')}
                    className="py-4 px-6 cursor-pointer hover:text-[#00FFAA] transition-colors text-right"
                  >
                    <div className="flex items-center justify-end">
                      <span>NETTO APBN</span>
                      {renderSortIcon('netBalance')}
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#00FFAA]/10">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-[#6B8A8A]">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-10 h-10 border-4 border-[#00FFAA]/20 border-t-[#00FFAA] rounded-full animate-spin" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#00FFAA]">
                          Memuat Data Database 207 Negara...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : sortedCountries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#6B8A8A]">
                      Tidak ada negara yang sesuai dengan kriteria pencarian "{searchQuery}".
                    </td>
                  </tr>
                ) : (
                  sortedCountries.map((country, index) => (
                    <tr
                      key={`${country.countryName}-${country.isoCode}-${country.id}-${index}`}
                      className="hover:bg-[#00FFAA]/5 transition-colors group"
                    >
                      {/* Column 1: No */}
                      <td className="py-4 px-6 font-mono font-bold text-[#6B8A8A] group-hover:text-[#00FFAA]">
                        {country.id}
                      </td>

                      {/* Column 2: Nama Negara */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={`https://flagcdn.com/w40/${country.isoCode}.png`}
                            alt={country.countryName}
                            className="w-7 h-4.5 rounded-xs object-cover border border-[#00FFAA]/30 shadow-sm shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://flagcdn.com/w40/un.png';
                            }}
                          />
                          <div>
                            <div className="font-bold text-[#E0E0E0] group-hover:text-[#00FFAA] transition-colors text-xs">
                              {country.countryName}
                            </div>
                            <div className="text-[10px] text-[#6B8A8A] font-medium flex items-center gap-1.5 mt-0.5">
                              <span>Ibukota: {country.capitalName || '-'}</span>
                              <span>•</span>
                              <span className="text-[#00FFAA]/70">{country.continentName}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Column 3: Populasi */}
                      <td className="py-4 px-6 text-right font-mono font-bold text-[#E0E0E0]">
                        {country.population ? country.population.toLocaleString('id-ID') : '0'}
                      </td>

                      {/* Column 4: Perubahan Populasi (+ / -) */}
                      <td className="py-4 px-6 text-right font-mono font-bold">
                        <span
                          className={`px-2.5 py-1 rounded-lg border text-xs inline-block ${
                            country.netPopChange >= 0
                              ? 'bg-[#00FFAA]/10 border-[#00FFAA]/30 text-[#00FFAA]'
                              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                          }`}
                        >
                          {country.netPopChange >= 0 ? '+' : ''}
                          {country.netPopChange.toLocaleString('id-ID')} /hari
                        </span>
                      </td>

                      {/* Column 5: Kas Negara */}
                      <td className="py-4 px-6 text-right font-mono font-bold text-[#00FFAA]">
                        {country.treasury ? `${country.treasury.toLocaleString('id-ID')} EM` : '0 EM'}
                      </td>

                      {/* Column 6: Netto APBN */}
                      <td className="py-4 px-6 text-right font-mono font-bold">
                        <span
                          className={`px-2.5 py-1 rounded-lg border text-xs inline-block ${
                            country.netBalance >= 0
                              ? 'bg-[#00FFAA]/10 border-[#00FFAA]/30 text-[#00FFAA]'
                              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                          }`}
                        >
                          {country.netBalance >= 0 ? '+' : ''}
                          {country.netBalance.toLocaleString('id-ID')} EM
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="bg-[#0A1A1A]/80 p-4 px-6 border-t border-[#00FFAA]/20 flex flex-col sm:flex-row items-center justify-between text-xs text-[#6B8A8A] gap-2">
            <span>
              Menampilkan <strong className="text-[#00FFAA]">{sortedCountries.length}</strong> dari{' '}
              <strong className="text-[#E0E0E0]">{countries.length}</strong> Negara
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider">
              Sumber Data: MySQL Database (`database_profiles_negara`)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
