"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MapPinned, X } from "lucide-react";
import { COUNTRIES_DATA } from '../../../map_system/map-data';

interface BerikanWilayahModalProps {
	isOpen: boolean;
	countryName?: string | null;
	playerCountryName?: string | null;
	onClose: () => void;
	onConfirm: (territoryName: string) => void;
}

// =====================================================================
// HELPER: Normalisasi nama negara
// =====================================================================
const normalizeCountryName = (name: unknown) =>
	String(name || '')
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]/g, '');

// =====================================================================
// HELPER: Cari canonical territory name dari COUNTRIES_DATA
// =====================================================================
const getCanonicalTerritoryName = (territoryName: string) => {
	const normalizedTerritory = normalizeCountryName(territoryName);
	return (
		COUNTRIES_DATA.find(
			(country) =>
				normalizeCountryName(country.country) === normalizedTerritory ||
				normalizeCountryName(country.iso) === normalizedTerritory ||
				normalizeCountryName(`iso_${country.iso}`) === normalizedTerritory
		)?.country || territoryName
	);
};

// =====================================================================
// HELPER: Cari ISO code dari nama wilayah
// =====================================================================
const getTerritoryIso = (territoryName: string): string | null => {
	const normalizedTerritory = normalizeCountryName(territoryName);
	const found = COUNTRIES_DATA.find(
		(country) =>
			normalizeCountryName(country.country) === normalizedTerritory ||
			normalizeCountryName(country.iso) === normalizedTerritory ||
			normalizeCountryName(`iso_${country.iso}`) === normalizedTerritory
	);
	return found?.iso || null;
};

// =====================================================================
// KOMPONEN UTAMA
// =====================================================================
export default function BerikanWilayahModal({
	isOpen,
	countryName,
	playerCountryName,
	onClose,
	onConfirm,
}: BerikanWilayahModalProps) {
	// ─── Ambil daftar wilayah aneksasi milik player ───
	const annexedTerritories = (() => {
		if (typeof window === 'undefined') return [];
		const annexedCountries =
			(window as Window & {
				neosantara_annexed_countries?: Record<string, { attackerCountry?: string }>;
			}).neosantara_annexed_countries || {};

		const territories = new Map<string, string>();
		Object.entries(annexedCountries).forEach(([territoryName, annexation]) => {
			const canonicalTerritoryName = getCanonicalTerritoryName(territoryName);
			const normalizedTerritory = normalizeCountryName(canonicalTerritoryName);

			if (
				normalizeCountryName(annexation?.attackerCountry) === normalizeCountryName(playerCountryName) &&
				normalizedTerritory &&
				!territories.has(normalizedTerritory)
			) {
				territories.set(normalizedTerritory, canonicalTerritoryName);
			}
		});

		return Array.from(territories.values()).sort((a, b) => a.localeCompare(b, 'id'));
	})();

	const [selectedTerritory, setSelectedTerritory] = useState('');
	const territorySignature = annexedTerritories.join('|');

	useEffect(() => {
		if (isOpen) setSelectedTerritory(annexedTerritories[0] || '');
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen, territorySignature]);

	if (!isOpen) return null;

	const modalContent = (
		<div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
			<div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">

				{/* ═══════════ HEADER ═══════════ */}
				<div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] gap-2 shrink-0 rounded-t-2xl">
					<div className="flex items-center gap-2 sm:gap-3">
						<div className="p-1 sm:p-1.5 bg-[#0F2424] rounded-lg border border-[#00FFAA]/30 shrink-0">
							<MapPinned className="h-4 w-4 sm:h-5 sm:w-5 text-[#00FFAA]" />
						</div>
						<h3 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">
							Konfirmasi Berikan Wilayah
						</h3>
					</div>

					<button
						onClick={onClose}
						className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm"
					>
						<span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
						<X className="h-4 w-4" />
					</button>
				</div>

				{/* ═══════════ BODY: LIST WILAYAH ═══════════ */}
				<div className="flex-1 min-h-0 bg-[#0F2424] relative z-10 p-6 sm:p-8 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
					{annexedTerritories.length === 0 ? (
						<div className="flex-1 flex items-center justify-center text-center">
							<p className="text-sm font-bold text-[#6B8A8A] uppercase tracking-wider">
								Tidak ada wilayah aneksasi
							</p>
						</div>
					) : (
						<div className="w-full max-w-2xl mx-auto flex flex-col gap-2">
							{annexedTerritories.map((territory) => {
								const iso = getTerritoryIso(territory);
								const isSelected = selectedTerritory === territory;

								return (
									<button
										key={territory}
										type="button"
										onClick={() => setSelectedTerritory(territory)}
										className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-black uppercase tracking-wide transition-all cursor-pointer flex items-center gap-3 ${
											isSelected
												? 'border-[#00FFAA] bg-[#00FFAA]/15 text-[#00FFAA]'
												: 'border-[#00FFAA]/20 bg-[#0A1A1A] text-[#B9D7D1] hover:border-[#00FFAA]/50 hover:bg-[#00FFAA]/5'
										}`}
									>
										{/* Bendera via flagcdn dengan fallback */}
										{iso ? (
											<img
												src={`https://flagcdn.com/w40/${iso.toLowerCase()}.png`}
												alt={territory}
												className="w-7 h-5 rounded-sm object-cover border border-[#00FFAA]/20 shrink-0"
												loading="lazy"
												decoding="async"
												onError={(e) => {
													(e.target as HTMLImageElement).src = 'https://flagcdn.com/w40/un.png';
												}}
											/>
										) : (
											<div className="w-7 h-5 rounded-sm bg-[#0F2424] border border-[#00FFAA]/20 shrink-0" />
										)}

										{/* Nama Wilayah */}
										<span className="truncate flex-1">{territory}</span>
									</button>
								);
							})}
						</div>
					)}
				</div>

				{/* ═══════════ FOOTER ═══════════ */}
				<div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-[#00FFAA]/20 bg-[#0A1A1A] shrink-0 rounded-b-2xl">
					<div className="flex gap-3 justify-end">
						<button
							onClick={onClose}
							className="px-6 py-3 bg-[#0F2424] hover:bg-[#163535] border border-[#00FFAA]/30 rounded-xl text-center text-[#E0E0E0] font-black text-xs tracking-wider uppercase transition-all cursor-pointer"
						>
							Batal
						</button>
						<button
							onClick={() => {
								if (selectedTerritory) {
									onConfirm(selectedTerritory);
									onClose();
								}
							}}
							disabled={!selectedTerritory}
							className="px-6 py-3 bg-amber-500 hover:bg-amber-400 border border-amber-500 rounded-xl text-center text-[#0A1A1A] font-black text-xs tracking-wider uppercase transition-all cursor-pointer shadow-md disabled:cursor-not-allowed disabled:opacity-40"
						>
							Berikan
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