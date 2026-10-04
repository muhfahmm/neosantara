"use client";
import React, { useState, useMemo, useRef, useEffect } from "react";
import { ChevronDown, Coins, ArrowUp } from "lucide-react";
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

	// Dapatkan daftar negara terurut dan filter out target/penyerang yang sama
	const countryList = useMemo(() => {
		const annexedStore = (typeof window !== 'undefined' ? (window as any).neosantara_annexed_countries : {}) || {};

		return [...COUNTRIES_DATA]
			.filter((c) => {
				const cNorm = c.country.toLowerCase().trim();
				const targetNorm = (countryName || "").toLowerCase().trim();
				// Jangan masukkan negara yang sedang dibuka (target) atau yang sudah dianeksasi
				return cNorm !== targetNorm && !annexedStore[cNorm];
			})
			.sort((a, b) => a.country.localeCompare(b.country, "id"));
	}, [countryName]);

	// Inisialisasi pilihan default saat modal dibuka
	useEffect(() => {
		if (isOpen && countryList.length > 0) {
			if (!selectedCountry || !countryList.some((c) => c.country === selectedCountry)) {
				setSelectedCountry(countryList[0].country);
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

	const selectedData = countryList.find((c) => c.country === selectedCountry) || countryList[0];

	// Kalkulasi peluang kesuksesan sederhana berdasarkan jumlah pembayaran
	const successRate = Math.min(100, Math.floor((paymentAmount / 100000) * 100));

	const handleAddMoney = (amount: number) => {
		setPaymentAmount((prev) => Math.max(0, prev + amount));
	};

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
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
			<div className="w-full max-w-[540px] bg-[#d9caad] border-4 border-[#7a6448] rounded-xl overflow-hidden shadow-2xl font-serif text-[#2a1c0e] relative">
				
				{/* BANNER HEADER STILISASI WAR GAME */}
				<div className="relative w-full h-11 bg-[#4c5c52] border-b-2 border-[#33423a] flex items-center justify-center px-4">
					<div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs font-bold text-[#e6dbb8] uppercase tracking-wider">
						<span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
						Diplomasi Militer
					</div>
					<h3 className="text-sm sm:text-base font-black text-[#f2ebd9] tracking-wide uppercase drop-shadow-sm text-center">
						Minta untuk Menyerang suatu Negara
					</h3>
				</div>

				{/* IMAGE BANNER GAMBAR MILITER */}
				<div className="relative w-full h-36 sm:h-40 bg-[#1c2420] overflow-hidden border-b-2 border-[#7a6448]">
					<img
						src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80"
						alt="Operasi Militer"
						className="w-full h-full object-cover opacity-80 mix-blend-luminosity hover:scale-105 transition-transform duration-500"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-[#2a1c0e] via-transparent to-black/30 flex items-end p-3">
						<p className="text-xs text-[#eedebc] font-sans font-medium drop-shadow-md">
							Minta <span className="font-bold text-amber-300">{countryName || "Sekutu"}</span> melancarkan serangan terhadap sasaran pilihan Anda.
						</p>
					</div>
				</div>

				{/* BODY CONTAINER */}
				<div className="p-5 space-y-4 bg-[#d9caad]">
					
					<p className="text-xs sm:text-sm text-[#4a3520] font-sans text-center font-medium">
						Tetapkan jumlah yang bersedia Anda bayar untuk permintaan Anda
					</p>

					{/* ROW SELECTOR NEGARA + INPUT PEMBAYARAN */}
					<div className="flex flex-col sm:flex-row items-stretch gap-2.5">
						
						{/* CUSTOM DROPDOWN SELECTOR NEGARA DENGAN BENDERA */}
						<div className="relative flex-1" ref={dropdownRef}>
							<button
								type="button"
								onClick={() => setIsDropdownOpen(!isDropdownOpen)}
								className="w-full h-10 bg-[#3a6664] hover:bg-[#2d5250] border-2 border-[#233d3c] rounded-md px-3 flex items-center justify-between text-white transition-colors shadow-inner cursor-pointer"
							>
								<div className="flex items-center gap-2.5 truncate">
									{renderFlag(selectedData?.iso, selectedData?.country)}
									<span className="font-sans font-bold text-xs sm:text-sm tracking-wide truncate">
										{selectedData?.country || "Pilih Negara"}
									</span>
								</div>
								<ChevronDown className={`w-4 h-4 text-emerald-200 transition-transform duration-200 shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
							</button>

							{/* POPUP DROPDOWN MENU MENUJU LIST NEGARA */}
							{isDropdownOpen && (
								<div className="absolute left-0 right-0 top-full mt-1 max-h-56 overflow-y-auto bg-[#e8deca] border-2 border-[#7a6448] rounded-md shadow-2xl z-50 divide-y divide-[#c7b799] font-sans">
									{countryList.map((c) => (
										<button
											key={c.country}
											type="button"
											onClick={() => {
												setSelectedCountry(c.country);
												setIsDropdownOpen(false);
											}}
											className={`w-full px-3 py-2 flex items-center gap-3 text-left hover:bg-[#cbb894] transition-colors text-xs font-bold text-[#2a1c0e] ${
												selectedCountry === c.country ? 'bg-[#bfac87] border-l-4 border-emerald-700' : ''
											}`}
										>
											{renderFlag(c.iso, c.country)}
											<span className="truncate flex-1">{c.country}</span>
											<span className="text-[10px] text-[#6b5338] font-mono uppercase bg-[#dbcdb2] px-1.5 py-0.5 rounded border border-[#a89574]">
												{c.iso?.toUpperCase()}
											</span>
										</button>
									))}
								</div>
							)}
						</div>

						{/* INPUT JUMLAH UANG / EMAS */}
						<div className="flex items-center gap-1.5 bg-[#d0c0a3] border-2 border-[#8c7657] rounded-md px-2.5 h-10 shrink-0">
							<Coins className="w-4 h-4 text-amber-600 shrink-0" />
							<input
								type="number"
								min="0"
								value={paymentAmount || ""}
								onChange={(e) => setPaymentAmount(Math.max(0, parseInt(e.target.value) || 0))}
								className="w-24 sm:w-28 bg-transparent text-xs sm:text-sm font-sans font-bold text-[#2a1c0e] outline-none text-right"
								placeholder="0"
							/>
							<button
								type="button"
								onClick={() => handleAddMoney(1000)}
								className="h-7 px-2 bg-[#517565] hover:bg-[#3d594c] active:scale-95 text-white font-sans font-bold text-[11px] rounded border border-[#30473d] flex items-center gap-0.5 transition-all cursor-pointer shadow-sm"
								title="Tambah 1.000"
							>
								<ArrowUp className="w-3 h-3 text-emerald-200" />
								+1k
							</button>
						</div>

					</div>

					{/* STATUS BAR PELUANG KESUKSESAN */}
					<div className="bg-[#c2b295] border-2 border-[#8c7657] rounded-md p-3 text-center space-y-1.5 font-sans">
						<div className="flex items-center justify-between text-xs font-bold text-[#3d2911]">
							<span>Peluang kesuksesan:</span>
							<span className={`font-black ${successRate > 50 ? 'text-emerald-800' : successRate > 20 ? 'text-amber-800' : 'text-rose-800'}`}>
								{successRate}%
							</span>
						</div>
						<div className="w-full h-2.5 bg-[#a39377] rounded-full overflow-hidden border border-[#7a6448]">
							<div
								className="h-full bg-gradient-to-r from-amber-600 via-emerald-600 to-emerald-500 transition-all duration-300"
								style={{ width: `${successRate}%` }}
							/>
						</div>
					</div>

					{/* FOOTER BUTTONS ACTION */}
					<div className="flex gap-3 pt-2 font-sans">
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
									onConfirm(selectedCountry, paymentAmount);
									onClose();
								}
							}}
							className="flex-1 h-10 bg-[#366158] hover:bg-[#284841] border-2 border-[#1e3631] rounded-md text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md"
						>
							Sarankan
						</button>
					</div>

				</div>

			</div>
		</div>
	);
}

