"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MapPinned } from "lucide-react";
import RootInfoModalHeader from '@/app/page/root_modals_design_menu/RootInfoModalHeader';
import NotebookModalWrapper from '@/app/page/navigasi_menu/2_navigasi_bawah/NotebookModalWrapper';
import { COUNTRIES_DATA } from '../../../map_system/map-data';
import { useLanguage } from '@/app/page/paused_menu/terjemahan_paused_menu/languageLogic';

interface BerikanWilayahModalProps {
	isOpen: boolean;
	countryName?: string | null;
	playerCountryName?: string | null;
	onClose: () => void;
	onConfirm: (territoryName: string) => boolean;
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
	const { t } = useLanguage();
	// ─── Ambil daftar wilayah aneksasi milik player ───
	const annexedTerritories = (() => {
		if (typeof window === 'undefined') return [];
		const annexedCountries =
			(window as Window & {
				neosantara_annexed_countries?: Record<string, { attackerCountry?: string }>;
			}).neosantara_annexed_countries || {};
		const cityOwners =
			(window as Window & {
				neosantara_city_owner?: Record<string, { ownerCountry?: string; countryIso?: string }>;
			}).neosantara_city_owner || {};

		const territories = new Map<string, string>();
		const playerKey = normalizeCountryName(playerCountryName);
		const targetKey = normalizeCountryName(countryName);

		// 1. Cek dari neosantara_annexed_countries
		Object.entries(annexedCountries).forEach(([territoryName, annexation]) => {
			const canonicalTerritoryName = getCanonicalTerritoryName(territoryName);
			const normalizedTerritory = normalizeCountryName(canonicalTerritoryName);

			if (
				normalizeCountryName(annexation?.attackerCountry) === playerKey &&
				normalizedTerritory &&
				normalizedTerritory !== targetKey &&
				!territories.has(normalizedTerritory)
			) {
				territories.set(normalizedTerritory, canonicalTerritoryName);
			}
		});

		// 2. Cek dari neosantara_city_owner (misal player menganeksasi kota/provinsi)
		Object.values(cityOwners).forEach(city => {
			if (!city?.ownerCountry || normalizeCountryName(city.ownerCountry) !== playerKey) return;
			const origIso = String(city.countryIso || '').toLowerCase();
			const origCountry = COUNTRIES_DATA.find(c => c.iso.toLowerCase() === origIso);
			if (origCountry) {
				const canonicalTerritoryName = origCountry.country;
				const normalizedTerritory = normalizeCountryName(canonicalTerritoryName);
				if (
					normalizedTerritory &&
					normalizedTerritory !== playerKey &&
					normalizedTerritory !== targetKey &&
					!territories.has(normalizedTerritory)
				) {
					territories.set(normalizedTerritory, canonicalTerritoryName);
				}
			}
		});

		return Array.from(territories.values()).sort((a, b) => a.localeCompare(b, 'id'));
	})();

	const [selectedTerritory, setSelectedTerritory] = useState('');
	const [transferError, setTransferError] = useState('');
	const territorySignature = annexedTerritories.join('|');

	useEffect(() => {
		if (isOpen) {
			setSelectedTerritory(annexedTerritories[0] || '');
			setTransferError('');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen, territorySignature]);

	if (!isOpen) return null;

	const modalContent = (
		<NotebookModalWrapper
			onClose={onClose}
			zIndexClass="z-[100000001]"
		>
			<div role="dialog" aria-modal="true" aria-labelledby="give-territory-title" className="w-full flex flex-col p-4 sm:p-5 font-sans text-white">

				<RootInfoModalHeader
					title={t("detail_negara_ai.geopolitics.giveTerritoryTitle")}
					titleId="give-territory-title"
					onClose={onClose}
					icon={<MapPinned />}
					size="standard"
				/>

				{/* ═══════════ BODY: LIST WILAYAH ═══════════ */}
				<div className="flex-1 min-h-0 bg-root-surface relative z-10 p-6 sm:p-8 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
					{countryName && (
						<p className="text-center text-xs font-black uppercase tracking-wider text-root-accent">
							{t("detail_negara_ai.geopolitics.recipient")}: {countryName}
						</p>
					)}
					{transferError && (
						<p role="alert" className="text-center text-sm font-bold text-rose-400">
							{transferError}
						</p>
					)}
					{annexedTerritories.length === 0 ? (
						<div className="flex-1 flex items-center justify-center text-center">
							<p className="text-sm font-bold text-root-subtle uppercase tracking-wider">
								{t("detail_negara_ai.geopolitics.noAnnexedTerritories")}
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
										onClick={() => {
											setSelectedTerritory(territory);
											setTransferError('');
										}}
										className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-black uppercase tracking-wide transition-all cursor-pointer flex items-center gap-3 ${
											isSelected
												? 'border-root-accent bg-root-accent/15 text-root-accent'
												: 'border-root-accent/20 bg-root-canvas text-[#B9D7D1] hover:border-root-accent/50 hover:bg-root-accent/5'
										}`}
									>
										{/* Bendera via flagcdn dengan fallback */}
										{iso ? (
											<img
												src={`https://flagcdn.com/w40/${iso.toLowerCase()}.png`}
												alt={territory}
												className="w-7 h-5 rounded-sm object-cover border border-root-accent/20 shrink-0"
												loading="lazy"
												decoding="async"
												onError={(e) => {
													(e.target as HTMLImageElement).src = 'https://flagcdn.com/w40/un.png';
												}}
											/>
										) : (
											<div className="w-7 h-5 rounded-sm bg-root-surface border border-root-accent/20 shrink-0" />
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
				<div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-root-accent/20 bg-root-canvas shrink-0 rounded-b-2xl">
					<div className="flex gap-3 justify-end">
						<button
							onClick={onClose}
							className="px-6 py-3 bg-root-surface hover:bg-[#163535] border border-root-accent/30 rounded-xl text-center text-root-text font-black text-xs tracking-wider uppercase transition-all cursor-pointer"
						>
							{t("detail_negara_ai.common.cancel")}
						</button>
						<button
							onClick={() => {
								if (!selectedTerritory) return;
								if (onConfirm(selectedTerritory)) onClose();
								else setTransferError(t("detail_negara_ai.geopolitics.territoryTransferError"));
							}}
							disabled={!selectedTerritory}
							className="px-6 py-3 bg-amber-500 hover:bg-amber-400 border border-amber-500 rounded-xl text-center text-root-canvas font-black text-xs tracking-wider uppercase transition-all cursor-pointer shadow-md disabled:cursor-not-allowed disabled:opacity-40"
						>
							{t("detail_negara_ai.geopolitics.give")}
						</button>
					</div>
				</div>
			</div>
		</NotebookModalWrapper>
	);

	if (typeof window !== "undefined") {
		return createPortal(modalContent, document.body);
	}

	return modalContent;
}