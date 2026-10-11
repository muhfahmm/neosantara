"use client";
import React, { useState, useMemo, useRef, useEffect } from "react";
import { ChevronDown, Coins, ArrowUp, Swords, X } from "lucide-react";
import { COUNTRIES_DATA } from "@/app/page/map_system/map-data";

interface MintaSerangNegaraModalProps {
	isOpen: boolean;
	countryName?: string | null;
	onClose: () => void;
	onConfirm: (targetCountryName: string, paymentAmount: number) => void;
}

export default function MintaSerangNegaraModal({
	isOpen,
	countryName,
	onClose,
	onConfirm,
}: MintaSerangNegaraModalProps) {
	const [selectedCountry, setSelectedCountry] = useState<string>("");
	const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
	const [paymentAmount, setPaymentAmount] = useState<number>(0);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Dapatkan daftar negara terurut dan filter out target/penyerang yang sama serta negara yang dianeksasi
	const countryList = useMemo(() => {
		const annexedStore = (typeof window !== 'undefined' ? (window as any).neosantara_annexed_countries : {}) || {};

		return [...COUNTRIES_DATA]
			.filter((c) => {
				const cNorm = (c.country || "").toLowerCase().trim();
				const targetNorm = (countryName || "").toLowerCase().trim();
				if (cNorm === targetNorm) return false;

				const raw = String(c.country || '').trim();
				const clean = cNorm.replace(/[^a-z0-9]/g, '');
				const iso = String(c.iso || '').toLowerCase().trim();

				if (annexedStore[raw] || annexedStore[cNorm] || (clean && annexedStore[clean])) return false;
				if (iso && (annexedStore[iso] || annexedStore[`iso_${iso}`])) return false;

				return true;
			})
			.sort((a, b) => a.country.localeCompare(b.country, "id"));
	}, [countryName]);

	// Inisialisasi pilihan default saat modal dibuka & reset jika negara terpilih sudah dianeksasi
	useEffect(() => {
		if (isOpen) {
			if (countryList.length > 0) {
				if (!selectedCountry || !countryList.some((c) => c.country === selectedCountry)) {
					setSelectedCountry(countryList[0].country);
				}
			} else {
				setSelectedCountry("");
			}
			setPaymentAmount(0);
			setIsDropdownOpen(false);
		}
	}, [isOpen, countryList]);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
				setIsDropdownOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	if (!isOpen) return null;

	const selectedData = countryList.find((c) => c.country === selectedCountry) || countryList[0] || null;

	// Kalkulasi peluang kesuksesan sederhana berdasarkan jumlah pembayaran
	const successRate = Math.min(100, Math.floor((paymentAmount / 100000) * 100));

	const handleAddMoney = (amount: number) => {
		setPaymentAmount((prev) => Math.max(0, prev + amount));
	};

	const renderFlag = (iso?: string, name?: string) => {
		if (!iso || iso.length !== 2) {
			return <span className="w-6 h-4 rounded-sm bg-[#0A1A1A] border border-[#00FFAA]/20 flex items-center justify-center text-[9px]">🏳️</span>;
		}
		return (
			<img
				src={`https://flagcdn.com/w40/${iso.toLowerCase()}.png`}
				alt={name || iso}
				className="w-6 h-4 rounded-sm object-cover border border-[#00FFAA]/20 shadow-sm shrink-0"
				onError={(e) => {
					(e.target as HTMLImageElement).src = "https://flagcdn.com/w40/un.png";
				}}
			/>
		);
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
			<div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">

				{/* Header */}
				<div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] gap-2 shrink-0 rounded-t-2xl">
					<div className="flex items-center gap-2 sm:gap-3">
						<div className="p-1 sm:p-1.5 bg-[#0F2424] rounded-lg border border-[#00FFAA]/30 shrink-0">
							<Swords className="h-4 w-4 sm:h-5 sm:w-5 text-[#00FFAA]" />
						</div>
						<div className="flex flex-col">
							<h3 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">
								Minta Serang Negara
							</h3>
							<p className="text-[10px] sm:text-xs text-[#6B8A8A] font-semibold mt-1">
								Diplomasi Militer · Target: <span className="text-[#E0E0E0] font-bold">{countryName || "Sekutu"}</span>
							</p>
						</div>
					</div>

					<button
						onClick={onClose}
						className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm shrink-0"
					>
						<span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
						<X className="h-4 w-4" />
					</button>
				</div>

				{/* Body */}
				<div className="flex-1 min-h-0 bg-[#0F2424] relative z-10 p-4 sm:p-6 lg:p-8 flex flex-col gap-4">

					{/* Info Banner */}
					<div className="p-3 sm:p-4 rounded-xl bg-[#0A1A1A] border border-[#00FFAA]/20 shrink-0">
						<p className="text-[11px] sm:text-xs text-[#E0E0E0] leading-relaxed">
							Minta <strong className="text-[#00FFAA] font-bold">{countryName || "Sekutu"}</strong> melancarkan serangan terhadap sasaran pilihan Anda. Tetapkan jumlah yang bersedia Anda bayar untuk permintaan tersebut.
						</p>
					</div>

					{/* Row: Dropdown Negara + Input Pembayaran */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-3 shrink-0">

						{/* Dropdown Negara */}
						<div>
							<label className="block text-[10px] sm:text-xs font-black text-[#00FFAA] uppercase tracking-wider mb-2">
								Negara Target
							</label>
							<div className="relative" ref={dropdownRef}>
								<button
									type="button"
									onClick={() => setIsDropdownOpen(!isDropdownOpen)}
									className="w-full h-11 bg-[#0A1A1A] hover:bg-[#00FFAA]/5 border border-[#00FFAA]/40 hover:border-[#00FFAA] rounded-xl px-3 flex items-center justify-between text-white transition-all cursor-pointer"
								>
									<div className="flex items-center gap-2.5 truncate">
										{renderFlag(selectedData?.iso, selectedData?.country)}
										<span className="font-sans font-bold text-xs sm:text-sm tracking-wide truncate text-[#E0E0E0]">
											{selectedData?.country || "Pilih Negara"}
										</span>
									</div>
									<ChevronDown className={`w-4 h-4 text-[#00FFAA] transition-transform duration-200 shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
								</button>

								{/* Dropdown menu */}
								{isDropdownOpen && (
									<div className="absolute left-0 right-0 top-full mt-1 max-h-56 overflow-y-auto bg-[#0A1A1A] border border-[#00FFAA]/40 rounded-xl shadow-2xl z-50 divide-y divide-[#00FFAA]/10 custom-scrollbar">
										{countryList.map((c) => (
											<button
												key={c.country}
												type="button"
												onClick={() => {
													setSelectedCountry(c.country);
													setIsDropdownOpen(false);
												}}
												className={`w-full px-3 py-2 flex items-center gap-3 text-left hover:bg-[#00FFAA]/10 transition-colors text-xs font-bold text-[#E0E0E0] cursor-pointer ${
													selectedCountry === c.country ? 'bg-[#00FFAA]/10 border-l-4 border-[#00FFAA]' : ''
												}`}
											>
												{renderFlag(c.iso, c.country)}
												<span className="truncate flex-1">{c.country}</span>
												<span className="text-[10px] text-[#6B8A8A] font-mono uppercase bg-[#0F2424] px-1.5 py-0.5 rounded border border-[#00FFAA]/20">
													{c.iso?.toUpperCase()}
												</span>
											</button>
										))}
									</div>
								)}
							</div>
						</div>

						{/* Input Pembayaran */}
						<div>
							<label className="block text-[10px] sm:text-xs font-black text-[#00FFAA] uppercase tracking-wider mb-2">
								Jumlah Pembayaran (NEO)
							</label>
							<div className="flex items-center gap-2 bg-[#0A1A1A] border border-[#00FFAA]/40 rounded-xl px-3 h-11">
								<Coins className="w-4 h-4 text-[#00FFAA] shrink-0" />
								<input
									type="number"
									min="0"
									value={paymentAmount || ""}
									onChange={(e) => setPaymentAmount(Math.max(0, parseInt(e.target.value) || 0))}
									className="flex-1 bg-transparent text-sm font-sans font-black text-[#E0E0E0] outline-none placeholder-[#6B8A8A]"
									placeholder="0"
								/>
								<button
									type="button"
									onClick={() => handleAddMoney(1000)}
									className="h-8 px-2.5 bg-[#00FFAA] hover:bg-[#00e699] active:scale-95 text-[#0A1A1A] font-sans font-black text-[11px] rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-md shrink-0"
									title="Tambah 1.000"
								>
									<ArrowUp className="w-3 h-3" />
									+1k
								</button>
							</div>
						</div>
					</div>

					{/* Success Rate Bar */}
					<div className="bg-[#0A1A1A] border border-[#00FFAA]/30 rounded-xl p-3 sm:p-4 shrink-0">
						<div className="flex items-center justify-between text-xs font-black text-[#6B8A8A] uppercase tracking-wider mb-2.5">
							<span>Peluang Kesuksesan</span>
							<span className={`font-black text-sm ${successRate > 50 ? 'text-emerald-400' : successRate > 20 ? 'text-amber-400' : 'text-rose-400'}`}>
								{successRate}%
							</span>
						</div>
						<div className="w-full h-2.5 bg-[#0F2424] rounded-full overflow-hidden border border-[#00FFAA]/20">
							<div
								className="h-full bg-gradient-to-r from-amber-500 via-[#00FFAA] to-emerald-400 transition-all duration-300"
								style={{ width: `${successRate}%` }}
							/>
						</div>
						<p className="text-[10px] text-[#6B8A8A] font-semibold mt-2.5">
							Peluang meningkat seiring besarnya pembayaran. Minimum efektif: 20.000 NEO untuk hasil yang berarti.
						</p>
					</div>

					{/* Spacer */}
					<div className="flex-1" />
				</div>

				{/* Footer */}
				<div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-[#00FFAA]/20 bg-[#0A1A1A] shrink-0 rounded-b-2xl">
					<div className="flex gap-3 justify-end">
						<button
							type="button"
							onClick={onClose}
							className="px-6 py-3 bg-[#0F2424] hover:bg-[#163535] border border-[#00FFAA]/30 rounded-xl text-center text-[#E0E0E0] font-black text-xs tracking-wider uppercase transition-all cursor-pointer"
						>
							Batal
						</button>
						<button
							type="button"
							disabled={!selectedCountry}
							onClick={() => {
								if (selectedCountry) {
									onConfirm(selectedCountry, paymentAmount);
									onClose();
								}
							}}
							className={`px-6 py-3 rounded-xl text-center font-black text-xs tracking-wider uppercase transition-all shadow-md ${
								selectedCountry
									? "bg-[#00FFAA] hover:bg-[#00e699] text-[#0A1A1A] border border-[#00FFAA] cursor-pointer"
									: "bg-gray-700 text-gray-400 border border-gray-600 cursor-not-allowed opacity-50"
							}`}
						>
							Sarankan
						</button>
					</div>
				</div>

			</div>
		</div>
	);
}