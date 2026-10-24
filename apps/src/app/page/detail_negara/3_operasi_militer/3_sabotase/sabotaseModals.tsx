import React, { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Bomb, Search, X } from "lucide-react";
import { COUNTRIES_DATA } from "@/app/page/map_system/map-data";
import { getCovertOperationSuccessChance } from "../covertOperationLogic";

interface SabotaseModalProps {
	isOpen: boolean;
	countryName?: string | null;
	playerCountryDetail?: Record<string, unknown> | null;
	onClose: () => void;
	onConfirm: (targetCountry: string) => void;
}

export default function SabotaseModal({ isOpen, countryName, playerCountryDetail, onClose, onConfirm }: SabotaseModalProps) {
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

	const successChance = getCovertOperationSuccessChance("sabotase", playerCountryDetail);
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
		// 🔥 PERBAIKAN: Menghapus bg-black/60 agar tidak ada backdrop
		<div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 font-sans text-white pointer-events-none">
			{/* Container Modal Lebih Lebar dan Panjang */}
			<div className="w-full max-w-2xl min-h-[450px] flex flex-col bg-[#0F2424] border border-rose-500/40 rounded-2xl p-6 sm:p-8 shadow-[0_0_40px_rgba(225,29,72,0.15)] relative pointer-events-auto">
				
				{/* HEADER */}
				<div className="flex items-center justify-between mb-6 border-b border-rose-500/20 pb-4">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-[#0A1A1A] rounded-lg border border-rose-500/30 shrink-0">
							<Bomb className="h-5 w-5 text-rose-400 animate-pulse" />
						</div>
						<h3 className="text-xl sm:text-2xl font-black text-rose-400 tracking-wide uppercase">
							Sabotase Fasilitas Negara
						</h3>
					</div>
					<button
						onClick={onClose}
						className="p-1.5 rounded-lg text-[#6B8A8A] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				{/* BODY CONTENT */}
				<div className="flex-1 flex flex-col">
					<p className="text-sm sm:text-base text-[#E0E0E0] mb-4 leading-relaxed">
						Pilih negara target untuk melancarkan aksi sabotase rahasia:
					</p>

					{/* DROPDOWN SELECTOR DENGAN BENDERA & SEARCH */}
					<div className="relative mb-4" ref={dropdownRef}>
						<button
							type="button"
							onClick={() => setIsDropdownOpen(!isDropdownOpen)}
							className="w-full h-12 bg-[#0A1A1A] hover:bg-[#1f1515] border border-rose-500/40 rounded-xl px-4 flex items-center justify-between text-white transition-colors cursor-pointer"
						>
							<div className="flex items-center gap-3 truncate">
								{renderFlag(selectedData?.iso, selectedData?.country)}
								<span className="font-bold text-sm tracking-wide truncate text-rose-300">
									{selectedData?.country || "Pilih Negara Target"}
								</span>
							</div>
							<ChevronDown className={`w-5 h-5 text-rose-400 transition-transform duration-200 shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
						</button>

						{isDropdownOpen && (
							<div className="absolute left-0 right-0 top-full mt-2 max-h-60 overflow-y-auto bg-[#0A1A1A] border border-rose-500/40 rounded-xl shadow-2xl z-50 divide-y divide-rose-500/15">
								{/* INPUT SEARCH INSIDE DROPDOWN */}
								<div className="p-2 sticky top-0 bg-[#0F2424] border-b border-rose-500/30 z-10">
									<div className="relative">
										<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B8A8A]" />
										<input
											type="text"
											placeholder="Cari negara..."
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											className="w-full bg-[#0A1A1A] border border-rose-500/30 rounded-lg px-9 py-2 text-sm text-[#E0E0E0] placeholder-[#6B8A8A] outline-none focus:border-rose-400"
										/>
									</div>
								</div>

								{filteredCountries.length === 0 ? (
									<div className="p-4 text-center text-sm text-[#6B8A8A]">Tidak ada negara ditemukan</div>
								) : (
									filteredCountries.map((c) => (
										<button
											key={c.country}
											type="button"
											onClick={() => {
												setSelectedCountry(c.country);
												setIsDropdownOpen(false);
											}}
											className={`w-full px-4 py-2.5 flex items-center gap-3 text-left hover:bg-rose-500/10 transition-colors text-sm font-bold text-[#E0E0E0] ${
												selectedCountry === c.country ? 'bg-rose-500/20 text-rose-300 border-l-4 border-rose-500' : ''
											}`}
										>
											{renderFlag(c.iso, c.country)}
											<span className="truncate flex-1">{c.country}</span>
											<span className="text-[10px] text-[#6B8A8A] font-mono uppercase bg-[#0A1A1A] px-1.5 py-0.5 rounded border border-rose-500/20">
												{c.iso?.toUpperCase()}
											</span>
										</button>
									))
								)}
							</div>
						)}
					</div>

					<div className="bg-[#0A1A1A] border border-rose-500/20 rounded-xl p-4 inline-block">
						<div className="flex items-center justify-between gap-8 text-sm font-bold text-[#6B8A8A]">
							<span>Peluang Keberhasilan:</span>
							<span className="text-rose-400 font-black text-lg">{successChance}%</span>
						</div>
					</div>
				</div>

				{/* FOOTER ACTIONS (Diperkecil) */}
				<div className="flex flex-col sm:flex-row gap-3 justify-end mt-6 pt-4 border-t border-rose-500/20">
					<button
						type="button"
						onClick={onClose}
						className="w-full sm:w-auto px-6 bg-[#0A1A1A] hover:bg-[#142A2A] border border-[#00FFAA]/30 rounded-xl py-2 text-center text-[#E0E0E0] font-black text-[11px] sm:text-xs tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md"
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
						className="w-full sm:w-auto px-6 bg-rose-600 hover:bg-rose-700 border border-rose-500 rounded-xl py-2 text-center text-white font-black text-[11px] sm:text-xs tracking-widest uppercase transition-all duration-150 cursor-pointer shadow hover:shadow-md active:scale-[0.98]"
					>
						Luncurkan Sabotase
					</button>
				</div>
			</div>
		</div>
	);

	if (typeof window !== "undefined") {
		return createPortal(modalContent, document.body);
	}

	return modalContent;
}