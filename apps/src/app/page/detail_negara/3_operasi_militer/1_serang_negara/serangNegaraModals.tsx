"use client";
import React, { useState } from "react";
import { ShieldAlert, Swords, Flag, Trophy, Skull, ArrowLeft } from "lucide-react";
import { COUNTRIES_DATA } from "@/app/page/map_system/map-data";
import { getCountryColor } from "@/app/page/menus/news/logic/1_berita_invasi/beritaInvasiLogic";

interface SerangNegaraModalProps {
	isOpen: boolean;
	countryName?: string | null;
	playerCountryDetail?: any;
	onClose: () => void;
	onConfirm: (actionType: 'aneksasi' | 'jarah' | 'mundur', targetCountry: string) => void;
}

export default function SerangNegaraModal({
	isOpen,
	countryName,
	playerCountryDetail,
	onClose,
	onConfirm,
}: SerangNegaraModalProps) {
	const [step, setStep] = useState<'konfirmasi' | 'hasil'>('konfirmasi');
	const [battleOutcome, setBattleOutcome] = useState<{
		isVictory: boolean;
		playerScore: number;
		targetScore: number;
	} | null>(null);

	if (!isOpen || !countryName) return null;

	const targetData = COUNTRIES_DATA.find(
		(c) => c.country.toLowerCase().trim() === countryName.toLowerCase().trim()
	);

	const playerName = playerCountryDetail?.country || 'China';
	const playerIso = (playerCountryDetail?.iso || 'cn').toLowerCase();
	const targetIso = (targetData?.iso || 'un').toLowerCase();

	// Perhitungan kekuatan militer kasar
	const playerPersonnel = Number(playerCountryDetail?.personel_aktif || 1200000);
	const targetBudget = Number((targetData as any)?.anggaran || 15000);
	const targetPersonnel = Math.floor(targetBudget * 10);

	const playerPower = Math.floor(playerPersonnel / 1000);
	const targetPower = Math.floor(targetPersonnel / 1000);

	const handleLaunchAttack = () => {
		// Evaluasi Kemenangan / Kekalahan berdasarkan kekuatan
		const randomBonus = Math.floor(Math.random() * 200) - 100;
		const playerTotal = playerPower + randomBonus;
		const targetTotal = targetPower;

		const isVictory = playerTotal >= targetTotal * 0.4; // Pemain militer kuat biasanya menang

		setBattleOutcome({
			isVictory,
			playerScore: Math.max(10, playerTotal),
			targetScore: Math.max(10, targetTotal),
		});
		setStep('hasil');
	};

	const handleCloseReset = () => {
		setStep('konfirmasi');
		setBattleOutcome(null);
		onClose();
	};

	const handleSelectAction = (action: 'aneksasi' | 'jarah' | 'mundur') => {
		onConfirm(action, countryName);
		handleCloseReset();
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
			<div className="w-full max-w-[560px] bg-[#0d161a] border-2 border-[#00FFAA]/40 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,255,170,0.2)] font-sans text-white relative">
				
				{/* HEADER MODAL */}
				<div className="bg-[#14232a] border-b border-[#00FFAA]/20 px-6 py-4 flex items-center justify-between">
					<div className="flex items-center gap-2.5">
						<Swords className="w-5 h-5 text-[#00FFAA]" />
						<h3 className="text-base font-black text-[#00FFAA] tracking-wider uppercase">
							{step === 'konfirmasi' ? 'KOMANDO OPERASI MILITER' : 'LAPORAN HASIL PERTEMPURAN'}
						</h3>
					</div>
					<button
						onClick={handleCloseReset}
						className="text-[#6B8A8A] hover:text-[#00FFAA] font-black text-sm cursor-pointer transition-colors"
					>
						✕
					</button>
				</div>

				{/* STEP 1: KONFIRMASI PENYERANGAN */}
				{step === 'konfirmasi' && (
					<div className="p-6 space-y-6">
						{/* VS BANNER NEGARA */}
						<div className="flex items-center justify-between bg-[#111e24] border border-[#00FFAA]/20 rounded-xl p-4">
							{/* PLAYER */}
							<div className="flex flex-col items-center gap-2 flex-1">
								<img
									src={`https://flagcdn.com/w80/${playerIso}.png`}
									alt={playerName}
									className="w-12 h-8 rounded object-cover border border-black/30 shadow-md"
								/>
								<span className="text-xs font-black uppercase text-[#00FFAA] text-center">
									{playerName}
								</span>
								<span className="text-[10px] text-emerald-400 font-mono">
									Skor Militer: {playerPower}
								</span>
							</div>

							<div className="px-3 flex flex-col items-center">
								<span className="text-xl font-black text-amber-400 italic tracking-tighter">VS</span>
							</div>

							{/* TARGET */}
							<div className="flex flex-col items-center gap-2 flex-1">
								<img
									src={`https://flagcdn.com/w80/${targetIso}.png`}
									alt={countryName}
									className="w-12 h-8 rounded object-cover border border-black/30 shadow-md"
								/>
								<span className="text-xs font-black uppercase text-rose-400 text-center">
									{countryName}
								</span>
								<span className="text-[10px] text-rose-400 font-mono">
									Skor Militer: {targetPower}
								</span>
							</div>
						</div>

						<div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-start gap-3">
							<ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
							<p className="text-xs text-[#b8cbd0] font-medium leading-relaxed">
								Menyerang <strong>{countryName}</strong> secara langsung adalah agresi militer terbuka. Jika menang, Anda dapat melakukan <strong className="text-[#00FFAA]">Aneksasi</strong> untuk memperluas peta wilayah negara Anda!
							</p>
						</div>

						{/* ACTION BUTTONS */}
						<div className="flex gap-3 pt-2">
							<button
								type="button"
								onClick={handleCloseReset}
								className="flex-1 py-3 bg-[#17272e] hover:bg-[#1f343d] border border-[#00FFAA]/20 rounded-xl text-xs font-black uppercase tracking-wider text-[#8ab0b8] transition-all cursor-pointer"
							>
								Batal
							</button>
							<button
								type="button"
								onClick={handleLaunchAttack}
								className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_20px_rgba(225,29,72,0.4)] flex items-center justify-center gap-2"
							>
								<Swords className="w-4 h-4" /> Lancarkan Serangan
							</button>
						</div>
					</div>
				)}

				{/* STEP 2: MODAL HASIL PERTEMPURAN & 3 OPSI (MUNDUR, JARAH, ANEKSASI) */}
				{step === 'hasil' && battleOutcome && (
					<div className="p-6 space-y-6">
						{/* VICTORY / DEFEAT BANNER */}
						{battleOutcome.isVictory ? (
							<div className="bg-gradient-to-r from-emerald-950/80 via-emerald-900/40 to-emerald-950/80 border-2 border-[#00FFAA]/60 rounded-xl p-5 text-center space-y-2 relative overflow-hidden">
								<div className="flex justify-center mb-1">
									<Trophy className="w-10 h-10 text-amber-400 animate-bounce" />
								</div>
								<h2 className="text-xl font-black text-[#00FFAA] uppercase tracking-wider">
									KEMENANGAN MUTLAK!
								</h2>
								<p className="text-xs text-emerald-200/90 font-medium">
									Pasukan Angkatan Bersenjata <span className="font-bold text-white">{playerName}</span> berhasil menembus benteng pertahanan musuh dan menguasai wilayah <span className="font-bold text-white">{countryName}</span>!
								</p>
							</div>
						) : (
							<div className="bg-gradient-to-r from-rose-950/80 via-rose-900/40 to-rose-950/80 border-2 border-rose-500/60 rounded-xl p-5 text-center space-y-2">
								<div className="flex justify-center mb-1">
									<Skull className="w-10 h-10 text-rose-400" />
								</div>
								<h2 className="text-xl font-black text-rose-400 uppercase tracking-wider">
									SERANGAN TERTAHAN!
								</h2>
								<p className="text-xs text-rose-200/90 font-medium">
									Pertahanan militer {countryName} terlalu tangguh. Pasukan garis depan terpaksa mengatur ulang posisi tempur.
								</p>
							</div>
						)}

						{/* PILIHAN 3 MENU TINDAKAN PERANG */}
						{battleOutcome.isVictory ? (
							<div className="space-y-3">
								<span className="text-[11px] font-black uppercase text-[#6B8A8A] tracking-wider block">
									PILIH ANEKSASI ATAU OPSI TAKTIS:
								</span>

								<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
									{/* OPSI 1: ANEKSASI (PERLUASAN WILAYAH) */}
									<button
										type="button"
										onClick={() => handleSelectAction('aneksasi')}
										className="bg-gradient-to-b from-[#00FFAA]/20 to-[#00FFAA]/5 border-2 border-[#00FFAA] hover:border-amber-400 rounded-xl p-4 flex flex-col items-center justify-between text-center gap-2 hover:scale-[1.02] transition-all cursor-pointer group shadow-[0_0_15px_rgba(0,255,170,0.15)]"
									>
										<Flag className="w-7 h-7 text-[#00FFAA] group-hover:scale-110 transition-transform" />
										<div>
											<span className="text-xs font-black text-[#00FFAA] block uppercase">
												ANEKSASI
											</span>
											<span className="text-[10px] text-emerald-300/80 leading-tight block mt-1">
												Caplok & Integrasikan seluruh luas wilayah {countryName} menjadi warna {playerName}.
											</span>
										</div>
									</button>

									{/* OPSI 2: JARAH */}
									<button
										type="button"
										onClick={() => handleSelectAction('jarah')}
										className="bg-[#14232a] border border-[#00FFAA]/30 hover:border-[#00FFAA] rounded-xl p-4 flex flex-col items-center justify-between text-center gap-2 hover:scale-[1.02] transition-all cursor-pointer group"
									>
										<Trophy className="w-7 h-7 text-amber-400 group-hover:scale-110 transition-transform" />
										<div>
											<span className="text-xs font-black text-amber-400 block uppercase">
												JARAH SDA
											</span>
											<span className="text-[10px] text-[#8ab0b8] leading-tight block mt-1">
												Rampas kas & sumber daya alam {countryName} tanpa mencaplok wilayah.
											</span>
										</div>
									</button>

									{/* OPSI 3: MUNDUR */}
									<button
										type="button"
										onClick={() => handleSelectAction('mundur')}
										className="bg-[#14232a] border border-[#00FFAA]/30 hover:border-[#00FFAA] rounded-xl p-4 flex flex-col items-center justify-between text-center gap-2 hover:scale-[1.02] transition-all cursor-pointer group"
									>
										<ArrowLeft className="w-7 h-7 text-slate-400 group-hover:scale-110 transition-transform" />
										<div>
											<span className="text-xs font-black text-slate-300 block uppercase">
												MUNDUR
											</span>
											<span className="text-[10px] text-[#8ab0b8] leading-tight block mt-1">
												Tarik mundur pasukan tanpa aksi lanjutan.
											</span>
										</div>
									</button>
								</div>
							</div>
						) : (
							<div className="pt-2">
								<button
									type="button"
									onClick={() => handleSelectAction('mundur')}
									className="w-full py-3.5 bg-[#17272e] hover:bg-[#1f343d] border border-rose-500/40 rounded-xl text-xs font-black uppercase tracking-wider text-rose-300 transition-all cursor-pointer"
								>
									Mundur & Tutup Laporan
								</button>
							</div>
						)}
					</div>
				)}

			</div>
		</div>
	);
}


