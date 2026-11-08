// navbar
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
    Power, Users, Landmark, Save, RotateCcw, Smile, LayoutGrid, Star,
    Activity
} from 'lucide-react';
import { formatCurrencyEM } from '@/app/logic/economic_logic/treasuryUpdater';
import { calculateNetBalanceWithEconomicEmbargo } from '@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/1_resolusi_PBB/logic/3_economicEmbargoLogic';
import {
    calculateDailyPopulationChange,
    calculateDailyPopulationChangeInRust,
    type PopulationDailyMetrics,
} from '@/app/logic/populations_logic/population_logic';
import { calculateKepuasan } from '@/app/logic/kepuasanCalculator';
import { menuItems, subMenuItems } from '../navigasi_menu/navigationData';
import { FpsMonitoring, type FpsMonitorWasmModule } from '../paused_menu/4_settings/fpsMonitoring';
import { AttackDebugButton } from '@/app/debug/AttackDebugButton';
import { useViewportMode } from '@/app/hooks/useViewportMode';

interface Country {
    id: number;
    country: string;
    capital: string;
    iso: string;
    latitude?: number;
    longitude?: number;
    lat?: number;
    lng?: number;
    continent: string;
    color?: string;
}

interface NavbarProps {
    selectedCountry: Country | null;
    countryDetail: any;
    metadata?: any;
    netBalanceAdjustment?: number;
    currentDate?: Date;
    activeMenu?: string;
    onOpenGameMenu: () => void;
    onOpenSaveModal: () => void;
    onOpenRestartConfirm: () => void;
    onOpenKepuasan?: () => void;
    onOpenPeringkat?: () => void;
    onOpenKesejahteraan?: () => void;
    onOpenPopulasi?: () => void;
    presidentRating?: number;
    kesejahteraan?: number;
    wasmModuleRef: React.RefObject<FpsMonitorWasmModule | null>;
}

export function Navbar({
    selectedCountry,
    countryDetail,
    metadata,
    netBalanceAdjustment = 0,
    currentDate,
    activeMenu = 'Peta Taktis',
    onOpenGameMenu,
    onOpenSaveModal,
    onOpenRestartConfirm,
    onOpenKepuasan,
    onOpenPeringkat,
    onOpenKesejahteraan,
    onOpenPopulasi,
    presidentRating = 50,
    kesejahteraan = 50,
    wasmModuleRef,
}: NavbarProps) {
    const [mapZoom, setMapZoom] = useState(1);
    const anggaran = Number(countryDetail?.anggaran) || 0;
    const countryName = selectedCountry?.country || countryDetail?.country || countryDetail?.nama_negara || '';
    const netBalance =
        calculateNetBalanceWithEconomicEmbargo(countryDetail, countryName) +
        netBalanceAdjustment -
        (Number(countryDetail?.minister_recruitment_expense_pending) || 0);
    const netBalanceColor = netBalance >= 0 ? 'text-emerald-700' : 'text-rose-700';
    const netBalanceLabel = `${netBalance >= 0 ? '+ ' : '- '}${Math.abs(netBalance).toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;
    
    const [populationMetricsResult, setPopulationMetricsResult] = useState<{
        countryName: typeof countryName;
        metrics: PopulationDailyMetrics;
    } | null>(null);

    useEffect(() => {
        if (!countryDetail) return;

        let isCurrentRequest = true;
        void calculateDailyPopulationChangeInRust(countryDetail, countryName, metadata, currentDate)
            .then(metrics => {
                if (isCurrentRequest) {
                    setPopulationMetricsResult({
                        countryName,
                        metrics,
                    });
                }
            })
            .catch(error => {
                console.error('Rust population food-metrics calculation failed; using TypeScript fallback:', error);
                if (isCurrentRequest) {
                    try {
                        setPopulationMetricsResult({
                            countryName,
                            metrics: calculateDailyPopulationChange(
                                countryDetail,
                                countryName,
                                metadata,
                                currentDate,
                            ),
                        });
                    } catch (fallbackError) {
                        console.error('TypeScript population-metrics fallback failed:', fallbackError);
                    }
                }
            });

        return () => {
            isCurrentRequest = false;
        };
    }, [countryDetail, countryName, metadata, currentDate]);

    const populationMetrics =
        populationMetricsResult &&
        countryDetail &&
        populationMetricsResult.countryName === countryName
            ? populationMetricsResult.metrics
            : null;

    const populasi = countryDetail
        ? Number(countryDetail.jumlah_penduduk) || 10_000_000
        : 0;
    const netDailyChange = populationMetrics?.netDailyChange ?? 0;
    const dailyBirths = populationMetrics?.dailyBirths ?? 0;
    const dailyDeaths = populationMetrics?.dailyDeaths ?? 0;
    const netPopulationLabel = `${netDailyChange >= 0 ? '+ ' : '- '}${Math.abs(netDailyChange).toLocaleString('id-ID', { maximumFractionDigits: 2 })}`;
    const kepuasanScore = useMemo(
        () => calculateKepuasan(countryDetail, metadata),
        [countryDetail, metadata],
    );

    // Function to get active menu information
    const getActiveMenuInfo = () => {
        if (activeMenu === 'Peta Taktis') {
            return {
                title: 'Peta Taktis',
                icon: LayoutGrid,
                isMainMenu: true,
                mainCategory: null,
                subItems: []
            };
        }

        // Check if activeMenu is a main menu item
        const mainMenuItem = menuItems.find(item => item.id === activeMenu);
        if (mainMenuItem && subMenuItems[activeMenu]) {
            return {
                title: mainMenuItem.label,
                icon: mainMenuItem.icon,
                isMainMenu: true,
                mainCategory: mainMenuItem,
                subItems: subMenuItems[activeMenu]
            };
        }

        // Check if activeMenu is a sub-menu item
        for (const [mainId, subs] of Object.entries(subMenuItems)) {
            const subItem = subs.find((sub: any) => activeMenu.startsWith(sub.id));
            if (subItem) {
                const mainItem = menuItems.find(item => item.id === mainId);
                return {
                    title: subItem.label,
                    icon: subItem.icon,
                    isMainMenu: false,
                    mainCategory: mainItem,
                    subItems: subs
                };
            }
        }

        // Default fallback
        return {
            title: 'Peta Taktis',
            icon: LayoutGrid,
            isMainMenu: true,
            mainCategory: null,
            subItems: []
        };
    };

    const activeMenuInfo = getActiveMenuInfo();

    useEffect(() => {
        const updateMapZoom = () => {
            const camera = (window as Window & {
                __neosantara_map_camera?: { scale?: number };
            }).__neosantara_map_camera;
            if (typeof camera?.scale === 'number' && Number.isFinite(camera.scale)) {
                setMapZoom(camera.scale);
            }
        };

        updateMapZoom();
        window.addEventListener('neosantara_map_camera', updateMapZoom);
        return () => window.removeEventListener('neosantara_map_camera', updateMapZoom);
    }, []);

    const viewportMode = useViewportMode();
    const isLandscapePhone = viewportMode === 'landscapePhone';
    const isPortraitPhone = viewportMode === 'portraitPhone';
    const isMobile = isLandscapePhone || isPortraitPhone;

    return (
        <nav
            style={{
                paddingTop: 'calc(var(--safe-top) + 0.35rem)',
                paddingLeft: 'calc(var(--safe-left) + 0.5rem)',
                paddingRight: 'calc(var(--safe-right) + 0.5rem)',
            }}
            className="fixed top-0 left-0 right-0 z-[201] pointer-events-none flex flex-col md:flex-row items-center justify-between select-none bg-transparent border-none shadow-none gap-1 sm:gap-2"
        >
            {/* Mode Landscape Phone: Tata letak kompak 1 baris, max-height ~38px, tanpa tombol Save/Restart/Zoom */}
            {isLandscapePhone ? (
                <div className="w-full flex items-center justify-between pointer-events-auto bg-root-surface/95 border border-root-accent/30 rounded-xl px-2 py-1 shadow-lg h-[38px]">
                    {/* Sisi Kiri: Power + Bendera Negara */}
                    <div className="flex items-center gap-1.5 shrink-0">
                        <button
                            onClick={onOpenGameMenu}
                            data-tutorial="game-menu"
                            title="Game Menu"
                            className="w-7 h-7 rounded-full bg-root-canvas border border-root-accent/40 text-root-accent flex items-center justify-center cursor-pointer active:scale-95"
                        >
                            <Power className="w-3.5 h-3.5" />
                        </button>
                        {selectedCountry ? (
                            <img
                                src={`https://flagcdn.com/w80/${selectedCountry.iso.toLowerCase()}.png`}
                                className="w-5 h-3.5 rounded-sm object-cover border border-root-accent/30"
                                alt={selectedCountry.country}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://flagcdn.com/w80/un.png';
                                }}
                            />
                        ) : (
                            <span className="text-xs">🌐</span>
                        )}
                        <span className="text-[10px] font-black text-root-text uppercase tracking-tight max-w-[85px] truncate">
                            {selectedCountry ? selectedCountry.country : 'Main'}
                        </span>
                    </div>

                    {/* Ringkasan angka lengkap seperti versi desktop */}
                    <div className="grid min-w-0 flex-1 grid-cols-[1.35fr_1.2fr_repeat(3,minmax(0,0.65fr))] items-center gap-x-1 overflow-hidden px-1">
                        <MobileStatusItem
                            icon={<Users className="h-2.5 w-2.5" />}
                            label="POPULASI"
                            value={populasi.toLocaleString('id-ID', { maximumFractionDigits: 2 })}
                            change={netPopulationLabel}
                            onClick={onOpenPopulasi}
                        />
                        <MobileStatusItem
                            icon={<Landmark className="h-2.5 w-2.5" />}
                            label="KAS NEGARA"
                            value={countryDetail ? formatCurrencyEM(anggaran) : '-'}
                            change={countryDetail ? netBalanceLabel : undefined}
                            valueColor={anggaran < 0 ? 'text-rose-400' : undefined}
                        />
                        <MobileStatusItem
                            icon={<Smile className="h-2.5 w-2.5" />}
                            label="KEPUASAN"
                            value={`${Math.round(kepuasanScore)}%`}
                            valueColor={getKepuasanColor(kepuasanScore)}
                            onClick={onOpenKepuasan}
                        />
                        <MobileStatusItem
                            icon={<Star className="h-2.5 w-2.5 fill-root-accent" />}
                            label="PERINGKAT"
                            value={`${presidentRating}/100`}
                            valueColor={getPresidentRatingColor(presidentRating)}
                            onClick={onOpenPeringkat}
                        />
                        <MobileStatusItem
                            icon={<Activity className="h-2.5 w-2.5" />}
                            label="SEJAHTERA"
                            value={`${kesejahteraan}/100`}
                            valueColor={getKesejahteraanColorClass(kesejahteraan)}
                            onClick={onOpenKesejahteraan}
                        />
                    </div>

                    {/* Sisi Kanan: Status ringkas zoom */}
                    <div className="shrink-0 text-[9px] font-black text-root-accent bg-root-canvas border border-root-accent/30 rounded px-1.5 py-0.5">
                        {mapZoom.toFixed(1)}x
                    </div>
                </div>
            ) : isPortraitPhone ? (
                /* Mode Portrait Phone: Dua baris ringkas */
                <div className="w-full flex flex-col gap-1 pointer-events-auto">
                    {/* Baris 1: Menu + Negara + Zoom */}
                    <div className="flex items-center justify-between bg-root-surface/95 border border-root-accent/30 rounded-xl px-2.5 py-1 shadow-lg h-[36px]">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onOpenGameMenu}
                                title="Game Menu"
                                className="w-7 h-7 rounded-full bg-root-canvas border border-root-accent/40 text-root-accent flex items-center justify-center cursor-pointer active:scale-95"
                            >
                                <Power className="w-3.5 h-3.5" />
                            </button>
                            {selectedCountry && (
                                <img
                                    src={`https://flagcdn.com/w80/${selectedCountry.iso.toLowerCase()}.png`}
                                    className="w-5 h-3.5 rounded-sm object-cover border border-root-accent/30"
                                    alt={selectedCountry.country}
                                />
                            )}
                            <span className="text-xs font-black text-root-text uppercase tracking-tight truncate max-w-[140px]">
                                {selectedCountry ? selectedCountry.country : 'Main Simulation'}
                            </span>
                        </div>
                        <div className="text-[10px] font-black text-root-accent bg-root-canvas border border-root-accent/30 rounded px-2 py-0.5">
                            {mapZoom.toFixed(1)}x
                        </div>
                    </div>

                    {/* Baris 2: Angka lengkap dengan label dan perubahan harian */}
                    <div className="grid grid-cols-6 items-center gap-x-1 gap-y-1 bg-root-surface/95 border border-root-accent/30 rounded-xl px-2 py-1 shadow-lg">
                        <MobileStatusItem
                            className="col-span-3"
                            icon={<Users className="h-2.5 w-2.5" />}
                            label="POPULASI"
                            value={populasi.toLocaleString('id-ID', { maximumFractionDigits: 2 })}
                            change={netPopulationLabel}
                            onClick={onOpenPopulasi}
                        />
                        <MobileStatusItem
                            className="col-span-3"
                            icon={<Landmark className="h-2.5 w-2.5" />}
                            label="KAS NEGARA"
                            value={countryDetail ? formatCurrencyEM(anggaran) : '-'}
                            change={countryDetail ? netBalanceLabel : undefined}
                            valueColor={anggaran < 0 ? 'text-rose-400' : undefined}
                        />
                        <MobileStatusItem
                            className="col-span-2"
                            icon={<Smile className="h-2.5 w-2.5" />}
                            label="KEPUASAN"
                            value={`${Math.round(kepuasanScore)}%`}
                            valueColor={getKepuasanColor(kepuasanScore)}
                            onClick={onOpenKepuasan}
                        />
                        <MobileStatusItem
                            className="col-span-2"
                            icon={<Star className="h-2.5 w-2.5 fill-root-accent" />}
                            label="PERINGKAT"
                            value={`${presidentRating}/100`}
                            valueColor={getPresidentRatingColor(presidentRating)}
                            onClick={onOpenPeringkat}
                        />
                        <MobileStatusItem
                            className="col-span-2"
                            icon={<Activity className="h-2.5 w-2.5" />}
                            label="SEJAHTERA"
                            value={`${kesejahteraan}/100`}
                            valueColor={getKesejahteraanColorClass(kesejahteraan)}
                            onClick={onOpenKesejahteraan}
                        />
                    </div>
                </div>
            ) : (
                /* Mode Desktop / Default: Tampilan asli tidak berubah sama sekali */
                <>
                    {/* 1. Left Side: Circular Menu & Selected Badge */}
                    <div className="flex items-stretch gap-2 2xl:gap-2 shrink-0 relative z-20 pointer-events-auto">
                        <div className="flex items-center gap-2 2xl:gap-3 bg-root-surface border border-root-accent/30 p-1 lg:p-1.5 rounded-2xl shadow-2xl">
                            {/* Circle Power Button */}
                            <div className="relative group shrink-0">
                                <button
                                    onClick={onOpenGameMenu}
                                    data-tutorial="game-menu"
                                    title="Game Menu"
                                    className="w-8 h-8 lg:w-9 lg:h-9 2xl:w-10 2xl:h-10 rounded-full bg-root-canvas border-[2px] border-root-accent/40 text-root-accent hover:bg-root-accent hover:text-root-canvas transition-all flex items-center justify-center cursor-pointer z-30"
                                >
                                    <Power className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />
                                </button>
                                
                                <div className="absolute top-[38px] lg:top-[42px] 2xl:top-[44px] left-1/2 -translate-x-1/2 bg-root-surface border border-root-accent/30 px-2 py-1 text-root-accent text-[8px] sm:text-[10px] font-black tracking-wider uppercase rounded-md whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    Game Menu
                                </div>
                            </div>
                            <div data-tutorial="negara-terpilih" className="flex items-center gap-2 2xl:gap-3 px-2 2xl:px-3 py-0.5 sm:py-1 rounded-xl min-w-[110px] lg:min-w-[130px] 2xl:min-w-[160px]">
                                {selectedCountry ? (
                                    <img 
                                        src={`https://flagcdn.com/w80/${selectedCountry.iso.toLowerCase()}.png`} 
                                        className="w-6 h-4 lg:w-7 lg:h-4.5 2xl:w-8 2xl:h-5 rounded-sm object-cover border border-root-accent/30"
                                        alt="flag"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://flagcdn.com/w80/un.png';
                                        }}
                                    />
                                ) : (
                                    <div className="w-6 h-6 lg:w-7 lg:h-7 2xl:w-8 2xl:h-8 rounded-full bg-root-canvas border border-root-accent/30 flex items-center justify-center text-sm lg:text-base 2xl:text-xl">🌐
                                    </div>
                                )}
                                <div className="flex flex-col leading-tight">
                                    <span className="text-[10px] lg:text-[11px] 2xl:text-[12px] font-black text-root-text tracking-tight uppercase">
                                        {selectedCountry ? selectedCountry.country : 'Main Simulation'}
                                    </span>
                                    <span className="text-[8px] lg:text-[9px] 2xl:text-[10px] font-bold text-root-subtle uppercase tracking-widest">
                                        {selectedCountry ? selectedCountry.capital : 'Global Map'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <FpsMonitoring wasmModuleRef={wasmModuleRef} />
                    </div>

                    {/* 2. Center: Live Stats Items */}
                    <div data-tutorial="navbar-ringkasan" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2.5 lg:gap-3.5 xl:gap-5 2xl:gap-3 overflow-hidden z-10 pointer-events-auto bg-root-surface border border-root-accent/30 px-3.5 lg:px-4.5 xl:px-5.5 2xl:px-4 py-1.5 2xl:py-2 rounded-2xl shadow-2xl">
                        <div className="flex items-center gap-2.5 lg:gap-3.5 xl:gap-5 2xl:gap-3 min-w-max">
                            
                            {/* POPULASI */}
                            <button
                                onClick={onOpenPopulasi}
                                className="group relative flex-shrink-0 cursor-pointer text-left hover:opacity-85 transition-opacity"
                                title="Klik untuk membuka Ringkasan Kependudukan"
                            >
                                <StatusItem 
                                    icon={<Users className="w-3 h-3 2xl:w-3.5 2xl:h-3.5 text-root-accent" />}
                                    label="POPULASI" 
                                    value={
                                        <span className="flex items-center gap-1 text-root-text">
                                            <span className="tabular-nums">{populasi.toLocaleString('id-ID', { maximumFractionDigits: 2 })}</span>
                                            <span className={`${netDailyChange >= 0 ? 'text-root-accent' : 'text-rose-400'} tabular-nums text-[9px] lg:text-[10px] 2xl:text-[11px] font-black`}>
                                                ({netPopulationLabel})
                                            </span>
                                        </span>
                                    } 
                                />
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max bg-root-surface border border-root-accent/30 rounded-xl p-3 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none">
                                    <p className="text-[10px] font-black text-root-accent uppercase tracking-wider mb-1.5 border-b border-root-accent/20 pb-1.5 text-center">Rincian Demografi</p>
                                    <div className="grid grid-cols-2 gap-x-6 text-[11px] font-bold text-root-text">
                                        <span className="text-root-accent text-center">Lahir: +{dailyBirths.toLocaleString('id-ID', { maximumFractionDigits: 2 })}</span>
                                        <span className="text-rose-400 text-center">Mati: -{dailyDeaths.toLocaleString('id-ID', { maximumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="mt-1.5 pt-1.5 border-t border-root-accent/20 text-[10px] text-root-subtle text-center">
                                        Pertumbuhan Bersih: <span className={`font-bold ${netDailyChange >= 0 ? 'text-root-accent' : 'text-rose-400'}`}>{netPopulationLabel}</span>
                                    </div>
                                </div>
                            </button>

                            <StatusItem
                                icon={<Landmark className="w-3 h-3 2xl:w-3.5 2xl:h-3.5 text-root-accent" />}
                                label="KAS NEGARA"
                                value={countryDetail ? (
                                    <span className="flex items-center gap-1 text-root-text tabular-nums">
                                        <span className={anggaran < 0 ? 'text-rose-400 font-black' : ''}>{formatCurrencyEM(anggaran)}</span>
                                        <span className={`${netBalance >= 0 ? 'text-root-accent' : 'text-rose-400'} text-[9px] lg:text-[10px] 2xl:text-[11px] font-black`}>
                                            ({netBalanceLabel})
                                        </span>
                                    </span>
                                ) : (
                                    '-'
                                )}
                            />

                            <button 
                                onClick={onOpenKepuasan}
                                className="cursor-pointer hover:opacity-80 transition-opacity"
                                title="Klik untuk melihat detail kepuasan"
                            >
                                <StatusItem 
                                    icon={<Smile className="w-3 h-3 2xl:w-3.5 2xl:h-3.5 text-root-accent" />}
                                    label="KEPUASAN" 
                                    value={`${Math.round(kepuasanScore)}%`}
                                    color={getKepuasanColor(kepuasanScore)}
                                />
                            </button>

                            <button
                                onClick={onOpenPeringkat}
                                className="cursor-pointer transition-opacity hover:opacity-80"
                                title="Klik untuk melihat detail peringkat"
                            >
                                <StatusItem
                                    icon={<Star className="w-3 h-3 2xl:w-3.5 2xl:h-3.5 fill-root-accent text-root-accent" />}
                                    label="PERINGKAT"
                                    value={`${presidentRating}/100`}
                                    color={getPresidentRatingColor(presidentRating)}
                                />
                            </button>

                            <button 
                                onClick={onOpenKesejahteraan}
                                className="cursor-pointer hover:opacity-80 transition-opacity"
                                title="Klik untuk melihat detail kesejahteraan"
                            >
                                <StatusItem
                                    icon={<Activity className="w-3 h-3 2xl:w-3.5 2xl:h-3.5 text-root-accent" />}
                                    label="KESEJAHTERAAN"
                                    value={`${kesejahteraan}/100`}
                                    color={getKesejahteraanColorClass(kesejahteraan)}
                                />
                            </button>
                        </div>
                    </div>

                    {/* 3. Right Side: Save & Restart Buttons */}
                    <div className="flex items-center gap-1.5 2xl:gap-1.5 shrink-0 relative z-20 pointer-events-auto bg-root-surface border border-root-accent/30 p-1 lg:p-1.5 rounded-2xl shadow-2xl">
                        <AttackDebugButton selectedCountry={selectedCountry} countryDetail={countryDetail} />
                        <div
                            role="status"
                            aria-label={`Zoom peta ${mapZoom.toFixed(1)} kali`}
                            title="Tingkat zoom peta"
                            className="flex h-8 min-w-[48px] flex-col items-center justify-center rounded-lg border border-root-accent/20 bg-root-canvas px-1.5 lg:h-9 lg:min-w-[54px] 2xl:h-10"
                        >
                            <span className="text-[7px] font-bold leading-none tracking-wider text-root-subtle">ZOOM</span>
                            <span className="text-[10px] font-black leading-tight tabular-nums text-root-accent lg:text-[11px]">
                                {mapZoom.toFixed(1)}x
                            </span>
                        </div>
                        <button
                            onClick={onOpenSaveModal}
                            data-tutorial="tombol-simpan"
                            title="Simpan Game"
                            className="flex items-center justify-center w-8 h-8 lg:w-9 lg:h-9 2xl:w-10 2xl:h-10 rounded-xl border border-root-accent/30 bg-root-canvas text-root-accent hover:bg-root-accent hover:text-root-canvas transition-all cursor-pointer"
                        >
                            <Save className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />
                        </button>
                        
                        <button
                            onClick={onOpenRestartConfirm}
                            title="Atur Ulang Game"
                            className="flex items-center justify-center w-8 h-8 lg:w-9 lg:h-9 2xl:w-10 2xl:h-10 rounded-xl border border-root-accent/30 bg-root-canvas text-root-accent hover:bg-root-accent hover:text-root-canvas transition-all cursor-pointer"
                        >
                            <RotateCcw className="w-3.5 h-3.5 2xl:w-4 2xl:h-4" />
                        </button>
                    </div>
                </>
            )}
        </nav>
    );
}

function MobileStatusItem({
    icon,
    label,
    value,
    change,
    valueColor = 'text-root-text',
    className = '',
    onClick,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    change?: string;
    valueColor?: string;
    className?: string;
    onClick?: () => void;
}) {
    const content = (
        <>
            <span className="flex min-w-0 items-center gap-1 text-[8px] font-black uppercase tracking-wide text-root-subtle">
                <span className="shrink-0 text-root-accent">{icon}</span>
                <span className="truncate">{label}</span>
            </span>
            <span className="flex min-w-0 items-center gap-1 whitespace-nowrap text-[10px] font-black tabular-nums leading-none">
                <span className={valueColor}>{value}</span>
                {change && (
                    <span className={change.startsWith('-') ? 'text-rose-400' : 'text-root-accent'}>
                        ({change})
                    </span>
                )}
            </span>
        </>
    );
    const classNames = `flex min-w-0 flex-col items-start justify-center gap-0.5 text-left leading-none ${className}`;

    return onClick ? (
        <button type="button" onClick={onClick} className={`${classNames} active:opacity-75`}>
            {content}
        </button>
    ) : (
        <div className={classNames}>{content}</div>
    );
}

// StatusItem
function StatusItem({ icon, label, value, color = "text-root-text" }: { icon: React.ReactNode, label: string, value: React.ReactNode, color?: string }) {
    return (
        <div className="flex items-center gap-1.5 lg:gap-2 2xl:gap-4 flex-shrink-0">
            <div className="p-1 lg:p-1.5 2xl:p-2 bg-root-surface rounded-lg 2xl:rounded-xl text-root-accent border border-root-accent/20">
                {icon}
            </div>
            <div className="flex flex-col">
                <span className="text-[7px] lg:text-[8px] xl:text-[9px] 2xl:text-[10px] font-black text-root-subtle tracking-widest uppercase leading-none mb-0.5 2xl:mb-1.5">
                    {label}
                </span>
                <span className={`text-[10px] lg:text-[11px] xl:text-[12px] 2xl:text-[13px] font-black tracking-tighter uppercase leading-none whitespace-nowrap ${color}`}>
                    {value}
                </span>
            </div>
        </div>
    );
}

function getKepuasanColor(kepuasan: number): string {
    if (kepuasan >= 75) return 'text-green-700 font-black';
    if (kepuasan >= 66) return 'text-green-600';
    if (kepuasan >= 41) return 'text-yellow-600';
    if (kepuasan >= 25) return 'text-red-600';
    return 'text-red-700 font-black';
}

function getPresidentRatingColor(rating: number): string {
    if (rating >= 80) return 'text-green-700 font-black';
    if (rating >= 60) return 'text-green-600';
    if (rating >= 40) return 'text-yellow-600';
    if (rating >= 20) return 'text-red-600';
    return 'text-red-700 font-black';
}

function getKesejahteraanColorClass(score: number): string {
    if (score >= 81) return 'text-emerald-700 font-black';
    if (score >= 61) return 'text-emerald-600';
    if (score >= 41) return 'text-yellow-600';
    if (score >= 21) return 'text-orange-600';
    return 'text-red-700 font-black';
}