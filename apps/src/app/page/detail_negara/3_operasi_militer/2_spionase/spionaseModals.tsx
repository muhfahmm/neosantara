import React, { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Eye, Search } from "lucide-react";
import { COUNTRIES_DATA } from "@/app/page/map_system/map-data";
import { getCovertOperationSuccessChance } from "../covertOperationLogic";

interface SpionaseModalProps {
	isOpen: boolean;
	countryName?: string | null;
	playerCountryDetail?: Record<string, unknown> | null;
	onClose: () => void;
	onConfirm: (targetCountry: string) => void;
}

export default function SpionaseModal({ isOpen, countryName, playerCountryDetail, onClose, onConfirm }: SpionaseModalProps) {
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

	const successChance = getCovertOperationSuccessChance("spionase", playerCountryDetail);
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

	const modalContent = (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 font-sans text-white pointer-events-auto">
			<div className="w-full max-w-[480px] bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden shadow-2xl relative">
				
				{/* BANNER HEADER */}
				<div className="relative w-full h-12 bg-[#0A1A1A] border-b border-[#00FFAA]/20 flex items-center justify-between px-5">
					<div className="flex items-center gap-2 text-xs font-bold text-[#00FFAA] uppercase tracking-wider">
						<Eye className="w-4 h-4 text-[#00FFAA] animate-pulse" />
						Operasi Intelijen
					</div>
					<h3 className="text-sm font-black text-[#00FFAA] tracking-wide uppercase drop-shadow-sm text-center">
						Spionase Intelijen Negara
					</h3>
				</div>

				<div className="p-5 space-y-4">
					<p className="text-xs sm:text-sm text-[#E0E0E0] text-center font-medium">
						Pilih negara target untuk melancarkan operasi spionase rahasia:
					</p>

					{/* DROPDOWN SELECTOR DENGAN BENDERA & SEARCH */}
					<div className="relative" ref={dropdownRef}>
						<button
							type="button"
							onClick={() => setIsDropdownOpen(!isDropdownOpen)}
							className="w-full h-11 bg-[#0A1A1A] hover:bg-[#142A2A] border border-[#00FFAA]/30 rounded-xl px-3 flex items-center justify-between text-white transition-colors cursor-pointer"
						>
							<div className="flex items-center gap-3 truncate">
								{renderFlag(selectedData?.iso, selectedData?.country)}
								<span className="font-bold text-sm tracking-wide truncate text-[#00FFAA]">
									{selectedData?.country || "Pilih Negara Target"}
								</span>
							</div>
							<ChevronDown className={`w-4 h-4 text-[#00FFAA] transition-transform duration-200 shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
						</button>

						{isDropdownOpen && (
							<div className="absolute left-0 right-0 top-full mt-1 max-h-60 overflow-y-auto bg-[#0A1A1A] border border-[#00FFAA]/30 rounded-xl shadow-2xl z-50 divide-y divide-[#00FFAA]/10">
								{/* INPUT SEARCH INSIDE DROPDOWN */}
								<div className="p-2 sticky top-0 bg-[#0F2424] border-b border-[#00FFAA]/20 z-10">
									<div className="relative">
										<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B8A8A]" />
										<input
											type="text"
											placeholder="Cari negara..."
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											className="w-full bg-[#0A1A1A] border border-[#00FFAA]/20 rounded-lg px-8 py-1.5 text-xs text-[#E0E0E0] placeholder-[#6B8A8A] outline-none focus:border-[#00FFAA]"
										/>
									</div>
								</div>

								{filteredCountries.length === 0 ? (
									<div className="p-3 text-center text-xs text-[#6B8A8A]">Tidak ada negara ditemukan</div>
								) : (
									filteredCountries.map((c) => (
										<button
											key={c.country}
											type="button"
											onClick={() => {
												setSelectedCountry(c.country);
												setIsDropdownOpen(false);
											}}
											className={`w-full px-3 py-2 flex items-center gap-3 text-left hover:bg-[#00FFAA]/10 transition-colors text-xs font-bold text-[#E0E0E0] ${
												selectedCountry === c.country ? 'bg-[#00FFAA]/20 text-[#00FFAA] border-l-4 border-[#00FFAA]' : ''
											}`}
										>
											{renderFlag(c.iso, c.country)}
											<span className="truncate flex-1">{c.country}</span>
											<span className="text-[10px] text-[#6B8A8A] font-mono uppercase bg-[#0A1A1A] px-1.5 py-0.5 rounded border border-[#00FFAA]/20">
												{c.iso?.toUpperCase()}
											</span>
										</button>
									))
								)}
							</div>
						)}
					</div>

					<div className="bg-[#0A1A1A] border border-[#00FFAA]/20 rounded-xl p-3 text-center space-y-1">
						<div className="flex items-center justify-between text-xs font-bold text-[#6B8A8A]">
							<span>Peluang Keberhasilan:</span>
							<span className="text-[#00FFAA] font-black">{successChance}%</span>
						</div>
					</div>

					{/* ACTION BUTTONS */}
					<div className="flex gap-3 pt-1">
						<button
							type="button"
							onClick={onClose}
							className="flex-1 h-10 bg-[#0A1A1A] hover:bg-[#142A2A] border border-[#00FFAA]/30 rounded-xl text-[#E0E0E0] font-black text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
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
							className="flex-1 h-10 bg-[#00FFAA] hover:bg-[#00e699] border border-[#00FFAA] rounded-xl text-[#0A1A1A] font-black text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md"
						>
							Luncurkan Spionase
						</button>
					</div>
				</div>
			</div>
		</div>
	);

	if (typeof window !== "undefined") {
		return createPortal(modalContent, document.body);
	}

	return modalContent;
}
