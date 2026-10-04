"use client";
import React, { useState, useMemo, useRef, useEffect } from "react";
import { ChevronDown, Bomb, Search } from "lucide-react";
import { COUNTRIES_DATA } from "@/app/page/map_system/map-data";

interface SabotaseModalProps {
	isOpen: boolean;
	countryName?: string | null;
	onClose: () => void;
	onConfirm: (targetCountry: string) => void;
}

export default function SabotaseModal({ isOpen, countryName, onClose, onConfirm }: SabotaseModalProps) {
	const [selectedCountry, setSelectedCountry] = useState<string>("");
	const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
	const [searchQuery, setSearchQuery] = useState<string>("");
	const dropdownRef = useRef<HTMLDivElement>(null);

	const countryList = useMemo(() => {
		const annexedStore = (typeof window !== 'undefined' ? (window as any).neosantara_annexed_countries : {}) || {};

		return [...COUNTRIES_DATA]
			.filter((c) => {
				const cNorm = (c.country || "").toLowerCase().trim();
				const raw = String(c.country || '').trim();
				const clean = cNorm.replace(/[^a-z0-9]/g, '');
				const iso = String(c.iso || '').toLowerCase().trim();

				if (annexedStore[raw] || annexedStore[cNorm] || (clean && annexedStore[clean])) return false;
				if (iso && (annexedStore[iso] || annexedStore[`iso_${iso}`])) return false;

				return true;
			})
			.sort((a, b) => a.country.localeCompare(b.country, "id"));
	}, []);

	useEffect(() => {
		if (isOpen) {
			if (countryList.length > 0) {
				const initial = countryName && countryList.some(c => c.country === countryName) 
					? countryName 
					: countryList[0].country;
				setSelectedCountry(initial);
			} else {
				setSelectedCountry("");
			}
			setIsDropdownOpen(false);
			setSearchQuery("");
		}
	}, [isOpen, countryName, countryList]);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
				setIsDropdownOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const filteredCountries = useMemo(() => {
		if (!searchQuery.trim()) return countryList;
		const q = searchQuery.toLowerCase().trim();
		return countryList.filter(c => 
			c.country.toLowerCase().includes(q) || (c.iso && c.iso.toLowerCase().includes(q))
		);
	}, [countryList, searchQuery]);

	if (!isOpen) return null;

	const selectedData = countryList.find((c) => c.country === selectedCountry) || countryList[0];

	const renderFlag = (iso?: string, name?: string) => {
		if (!iso || iso.length !== 2) {
			return <span className="w-6 h-4 rounded-sm bg-slate-300 flex items-center justify-center text-[9px]">🏳️</span>;
		}
		return (
			<img
				src={`https://flagcdn.com/w40/${iso.toLowerCase()}.png`}
				alt={name || iso}
				className="w-6 h-4 rounded-sm object-cover border border-black/20 shadow-sm shrink-0"
				onError={(e) => {
					(e.target as HTMLImageElement).src = "https://flagcdn.com/w40/un.png";
				}}
			/>
		);
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150 font-serif text-[#2a1c0e]">
			<div className="w-full max-w-[500px] bg-[#d9caad] border-4 border-[#7a6448] rounded-xl overflow-hidden shadow-2xl relative">
				
				{/* BANNER HEADER */}
				<div className="relative w-full h-11 bg-[#5c3a33] border-b-2 border-[#3d2520] flex items-center justify-center px-4">
					<div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs font-bold text-rose-300 uppercase tracking-wider">
						<Bomb className="w-4 h-4 animate-pulse text-rose-400" />
						Operasi Sabotase
					</div>
					<h3 className="text-sm sm:text-base font-black text-[#f2ebd9] tracking-wide uppercase drop-shadow-sm text-center">
						Sabotase Fasilitas Negara
					</h3>
				</div>

				<div className="p-5 space-y-4">
					<p className="text-xs sm:text-sm text-[#4a3520] font-sans text-center font-medium">
						Pilih negara target untuk melancarkan aksi sabotase rahasia:
					</p>

					{/* DROPDOWN SELECTOR DENGAN BENDERA & SEARCH */}
					<div className="relative" ref={dropdownRef}>
						<button
							type="button"
							onClick={() => setIsDropdownOpen(!isDropdownOpen)}
							className="w-full h-11 bg-[#542d27] hover:bg-[#3d1f1a] border-2 border-[#2b1410] rounded-md px-3 flex items-center justify-between text-white transition-colors shadow-inner cursor-pointer"
						>
							<div className="flex items-center gap-3 truncate">
								{renderFlag(selectedData?.iso, selectedData?.country)}
								<span className="font-sans font-bold text-sm tracking-wide truncate">
									{selectedData?.country || "Pilih Negara Target"}
								</span>
							</div>
							<ChevronDown className={`w-4 h-4 text-rose-200 transition-transform duration-200 shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
						</button>

						{isDropdownOpen && (
							<div className="absolute left-0 right-0 top-full mt-1 max-h-60 overflow-y-auto bg-[#e8deca] border-2 border-[#7a6448] rounded-md shadow-2xl z-50 divide-y divide-[#c7b799] font-sans">
								{/* INPUT SEARCH INSIDE DROPDOWN */}
								<div className="p-2 sticky top-0 bg-[#d9caad] border-b border-[#a89574] z-10">
									<div className="relative">
										<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#5c462b]" />
										<input
											type="text"
											placeholder="Cari negara..."
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											className="w-full bg-[#eee5d3] border border-[#968363] rounded px-8 py-1 text-xs text-[#2a1c0e] placeholder-[#70583b] outline-none"
										/>
									</div>
								</div>

								{filteredCountries.length === 0 ? (
									<div className="p-3 text-center text-xs text-[#70583b]">Tidak ada negara ditemukan</div>
								) : (
									filteredCountries.map((c) => (
										<button
											key={c.country}
											type="button"
											onClick={() => {
												setSelectedCountry(c.country);
												setIsDropdownOpen(false);
											}}
											className={`w-full px-3 py-2 flex items-center gap-3 text-left hover:bg-[#cbb894] transition-colors text-xs font-bold text-[#2a1c0e] ${
												selectedCountry === c.country ? 'bg-[#bfac87] border-l-4 border-rose-700' : ''
											}`}
										>
											{renderFlag(c.iso, c.country)}
											<span className="truncate flex-1">{c.country}</span>
											<span className="text-[10px] text-[#6b5338] font-mono uppercase bg-[#dbcdb2] px-1.5 py-0.5 rounded border border-[#a89574]">
												{c.iso?.toUpperCase()}
											</span>
										</button>
									))
								)}
							</div>
						)}
					</div>

					<div className="bg-[#c2b295] border-2 border-[#8c7657] rounded-md p-3 text-center space-y-1 font-sans">
						<div className="flex items-center justify-between text-xs font-bold text-[#3d2911]">
							<span>Tingkat Risiko Terungkap:</span>
							<span className="text-rose-800 font-black">40% (Sedang)</span>
						</div>
					</div>

					{/* ACTION BUTTONS */}
					<div className="flex gap-3 pt-1 font-sans">
						<button
							type="button"
							onClick={onClose}
							className="flex-1 h-10 bg-[#e0d4be] hover:bg-[#d1c2a7] border-2 border-[#8c7657] rounded-md text-[#3d2911] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
						>
							Batal
						</button>
						<button
							type="button"
							onClick={() => {
								if (selectedCountry) {
									onConfirm(selectedCountry);
									onClose();
								}
							}}
							className="flex-1 h-10 bg-[#542d27] hover:bg-[#3d1f1a] border-2 border-[#2b1410] rounded-md text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md"
						>
							Luncurkan Sabotase
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

