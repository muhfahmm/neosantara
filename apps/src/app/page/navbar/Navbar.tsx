// navbar
'use client';

import React from 'react';
import {
    Power, Users, Landmark, Save, RotateCcw, Smile, LayoutGrid, Star,
    Activity // ✅ TAMBAHAN: Import Activity agar error hilang
} from 'lucide-react';
import { calculateCountryNetBalance, formatCurrencyEM } from '@/app/logic/economic_logic/treasuryUpdater';
// 🔥 Import fungsi warna dari logic populasi
import { getNetPopulationChangeColor } from '@/app/logic/populations_logic/population_logic';
import { menuItems, subMenuItems } from '../navigasi_menu/navigationData';

interface Country {
    id: number;
    country: string;
    capital: string;
    iso: string;
    latitude: number;
    longitude: number;
    continent: string;
}

interface NavbarProps {
    selectedCountry: Country | null;
    countryDetail: any;
    netBalanceAdjustment?: number;
    netPopulationChange?: number;
    // 🔥 Data demografi harian
    dailyBirths?: number;
    dailyDeaths?: number;
    activeMenu?: string;
    onOpenGameMenu: () => void;
    onOpenSaveModal: () => void;
    onOpenRestartConfirm: () => void;
    onOpenKepuasan?: () => void;
    onOpenKesejahteraan?: () => void;
    presidentRating?: number;
    kesejahteraan?: number;
}

export function Navbar({
    selectedCountry,
    countryDetail,
    netBalanceAdjustment = 0,
    netPopulationChange = 0,
    dailyBirths = 0,
    dailyDeaths = 0,
    activeMenu = 'Peta Taktis',
    onOpenGameMenu,
    onOpenSaveModal,
    onOpenRestartConfirm,
    onOpenKepuasan,
    onOpenKesejahteraan,
    presidentRating = 50,
    kesejahteraan = 50,
}: NavbarProps) {
    const anggaran = Number(countryDetail?.anggaran) || 0;
    const netBalance = calculateCountryNetBalance(countryDetail) + netBalanceAdjustment;
    const netBalanceColor = netBalance >= 0 ? 'text-emerald-700' : 'text-rose-700';
    const netBalanceLabel = `${netBalance >= 0 ? '+ ' : '- '}${Math.abs(netBalance).toLocaleString('id-ID')}`;
    
    // Populasi logic
    const populasi = Number(countryDetail?.jumlah_penduduk) || 0;
    const netPopulationChangeColor = getNetPopulationChangeColor(netPopulationChange);
    const netPopulationLabel = `${netPopulationChange >= 0 ? '+ ' : '- '}${Math.abs(netPopulationChange).toLocaleString('id-ID')}`;

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

    return (
        <nav className="fixed top-3 left-0 right-0 z-70 pointer-events-none px-4 sm:px-8 flex items-center justify-between select-none bg-transparent border-none shadow-none">
            
            {/* 1. Left Side: Circular Menu & Selected Badge */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 relative z-20 pointer-events-auto bg-[#0F2424]/90 backdrop-blur-md border border-[#00FFAA]/30 p-1.5 rounded-2xl shadow-2xl">
                {/* Circle Power Button */}
                <div className="relative group shrink-0">
                    <button
                        onClick={onOpenGameMenu}
                        title="Game Menu"
                        className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full bg-[#0A1A1A] border-[2px] border-[#00FFAA]/40 text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all flex items-center justify-center cursor-pointer z-30"
                    >
                        <Power className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                    
                    <div className="absolute top-[38px] sm:top-[44px] left-1/2 -translate-x-1/2 bg-[#0F2424] border border-[#00FFAA]/30 px-2 py-1 text-[#00FFAA] text-[8px] sm:text-[10px] font-black tracking-wider uppercase rounded-md whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        Game Menu
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1 rounded-xl min-w-[120px] sm:min-w-[160px]">
                    {selectedCountry ? (
                        <img 
                            src={`https://flagcdn.com/w80/${selectedCountry.iso.toLowerCase()}.png`} 
                            className="w-6 h-4 sm:w-8 sm:h-5 rounded-sm object-cover border border-[#00FFAA]/30"
                            alt="flag"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://flagcdn.com/w80/un.png';
                            }}
                        />
                    ) : (
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#0A1A1A] border border-[#00FFAA]/30 flex items-center justify-center text-base sm:text-xl">🌐
                        </div>
                    )}
                    <div className="flex flex-col leading-tight">
                        <span className="text-[9px] sm:text-[12px] font-black text-[#E0E0E0] tracking-tight uppercase">
                            {selectedCountry ? selectedCountry.country : 'Main Simulation'}
                        </span>
                        <span className="text-[7px] sm:text-[10px] font-bold text-[#6B8A8A] uppercase tracking-widest">
                            {selectedCountry ? selectedCountry.capital : 'Global Map'}
                        </span>
                    </div>
                </div>
            </div>

            {/* 2. Center: Live Stats Items */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 sm:gap-4 lg:gap-6 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth z-10 pointer-events-auto bg-[#0F2424]/90 backdrop-blur-md border border-[#00FFAA]/30 px-4 sm:px-6 py-2 rounded-2xl shadow-2xl">
                <div className="flex items-center gap-1 sm:gap-4 lg:gap-6 min-w-max">
                    
                    {/* 🔥 POPULASI DENGAN TOOLTIP DEMOGRAFI */}
                    <div className="group relative flex-shrink-0">
                        <StatusItem 
                            icon={<Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#00FFAA]" />} 
                            label="POPULASI" 
                            value={
                                <span className="flex items-center gap-1 sm:gap-2 text-[#E0E0E0]">
                                    <span>{populasi.toLocaleString('id-ID')}</span>
                                    <span className={`${netPopulationChange >= 0 ? 'text-[#00FFAA]' : 'text-rose-400'} text-[8px] sm:text-[11px] font-black`}>
                                        ({netPopulationLabel})
                                    </span>
                                </span>
                            } 
                        />
                        {/* Tooltip Rincian Demografi Harian */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max bg-[#0F2424] border border-[#00FFAA]/30 rounded-xl p-3 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none">
                            <p className="text-[10px] font-black text-[#00FFAA] uppercase tracking-wider mb-1.5 border-b border-[#00FFAA]/20 pb-1.5 text-center">Rincian Demografi</p>
                            <div className="grid grid-cols-2 gap-x-6 text-[11px] font-bold text-[#E0E0E0]">
                                <span className="text-[#00FFAA] text-center">Lahir: +{dailyBirths.toLocaleString('id-ID')}</span>
                                <span className="text-rose-400 text-center">Mati: -{dailyDeaths.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="mt-1.5 pt-1.5 border-t border-[#00FFAA]/20 text-[10px] text-[#6B8A8A] text-center">
                                Pertumbuhan Bersih: <span className={`font-bold ${netPopulationChange >= 0 ? 'text-[#00FFAA]' : 'text-rose-400'}`}>{netPopulationLabel}</span>
                            </div>
                        </div>
                    </div>

                    <StatusItem
                        icon={<Landmark className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#00FFAA]" />}
                        label="KAS NEGARA"
                        value={countryDetail ? (
                            <span className="flex items-center gap-1 sm:gap-2 text-[#E0E0E0]">
                                <span className={anggaran < 0 ? 'text-rose-400 font-black' : ''}>{formatCurrencyEM(anggaran)}</span>
                                <span className={`${netBalance >= 0 ? 'text-[#00FFAA]' : 'text-rose-400'} text-[8px] sm:text-[11px] font-black`}>
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
                            icon={<Smile className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#00FFAA]" />} 
                            label="KEPUASAN" 
                            value={`${countryDetail?.kepuasan !== undefined ? Math.round(countryDetail.kepuasan) : 50}%`} 
                            color={getKepuasanColor(countryDetail?.kepuasan ?? 50)} 
                        />
                    </button>

                    <StatusItem 
                        icon={<Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-[#00FFAA] text-[#00FFAA]" />} 
                        label="PERINGKAT" 
                        value={`${presidentRating}/100`} 
                        color={getPresidentRatingColor(presidentRating)} 
                    />

                    <button 
                        onClick={onOpenKesejahteraan}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        title="Klik untuk melihat detail kesejahteraan"
                    >
                        <StatusItem
                            icon={<Activity className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#00FFAA]" />}
                            label="KESEJAHTERAAN"
                            value={`${kesejahteraan}/100`}
                            color={getKesejahteraanColorClass(kesejahteraan)}
                        />
                    </button>
                </div>
            </div>

            {/* 3. Right Side: Save & Restart Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 relative z-20 pointer-events-auto bg-[#0F2424]/90 backdrop-blur-md border border-[#00FFAA]/30 p-1.5 rounded-2xl shadow-2xl">
                <button
                    onClick={onOpenSaveModal}
                    title="Simpan Game"
                    className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-xl border border-[#00FFAA]/30 bg-[#0A1A1A] text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all cursor-pointer"
                >
                    <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                
                <button
                    onClick={onOpenRestartConfirm}
                    title="Atur Ulang Game"
                    className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-xl border border-[#00FFAA]/30 bg-[#0A1A1A] text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all cursor-pointer"
                >
                    <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
            </div>
        </nav>
    );
}

// StatusItem
function StatusItem({ icon, label, value, color = "text-[#E0E0E0]" }: { icon: React.ReactNode, label: string, value: React.ReactNode, color?: string }) {
    return (
        <div className="flex items-center gap-1.5 sm:gap-4 flex-shrink-0">
            <div className="p-1 sm:p-2 bg-[#0F2424] rounded-lg sm:rounded-xl text-[#00FFAA] border border-[#00FFAA]/20">
                {icon}
            </div>
            <div className="flex flex-col">
                <span className="text-[6px] sm:text-[10px] font-black text-[#6B8A8A] tracking-widest uppercase leading-none mb-0.5 sm:mb-1.5">
                    {label}
                </span>
                <span className={`text-[9px] sm:text-[13px] font-black tracking-tighter uppercase leading-none whitespace-nowrap ${color}`}>
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