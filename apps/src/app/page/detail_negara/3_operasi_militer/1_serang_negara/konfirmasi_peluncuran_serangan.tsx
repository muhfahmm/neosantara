"use client";

import { ShieldAlert, Swords } from "lucide-react";

interface KonfirmasiPeluncuranSeranganProps {
	playerName: string;
	playerIso: string;
	playerPower: number;
	targetName: string;
	targetIso: string;
	targetPower: number;
	onBack: () => void;
	onConfirm: () => void;
}

export default function KonfirmasiPeluncuranSerangan({
	playerName,
	playerIso,
	playerPower,
	targetName,
	targetIso,
	targetPower,
	onBack,
	onConfirm,
}: KonfirmasiPeluncuranSeranganProps) {
	return (
		<div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
			<div className="w-full max-w-[700px] bg-[#0d161a] border-2 border-[#00FFAA]/40 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,255,170,0.2)] font-sans text-white relative">
				<div className="bg-[#14232a] border-b border-[#00FFAA]/20 px-6 py-4 flex items-center justify-between">
					<div className="flex items-center gap-2.5">
						<Swords className="w-5 h-5 text-[#00FFAA]" />
						<h3 className="text-base font-black text-[#00FFAA] tracking-wider uppercase">
							KOMANDO OPERASI MILITER
						</h3>
					</div>
					<button
						type="button"
						onClick={onBack}
						className="text-[#6B8A8A] hover:text-[#00FFAA] font-black text-sm cursor-pointer transition-colors"
						aria-label="Kembali ke konfirmasi serangan"
					>
						✕
					</button>
				</div>

				<div className="p-6 sm:p-8 space-y-8">
					<div className="flex items-center justify-between bg-[#111e24] border border-[#00FFAA]/20 rounded-xl p-5 sm:p-6">
						<div className="flex flex-col items-center gap-2 flex-1 min-w-0">
							<img
								src={`https://flagcdn.com/w80/${playerIso}.png`}
								alt={playerName}
								className="w-16 h-10 rounded object-cover border border-black/30 shadow-md"
							/>
							<span className="text-sm font-black uppercase text-[#00FFAA] text-center">{playerName}</span>
							<span className="text-xs text-emerald-400 font-mono">Skor Militer: {playerPower}</span>
						</div>

						<div className="px-4 flex flex-col items-center">
							<span className="text-3xl font-black text-amber-400 italic tracking-tighter">VS</span>
						</div>

						<div className="flex flex-col items-center gap-2 flex-1 min-w-0">
							<img
								src={`https://flagcdn.com/w80/${targetIso}.png`}
								alt={targetName}
								className="w-16 h-10 rounded object-cover border border-black/30 shadow-md"
							/>
							<span className="text-sm font-black uppercase text-rose-400 text-center">{targetName}</span>
							<span className="text-xs text-rose-400 font-mono">Skor Militer: {targetPower}</span>
						</div>
					</div>

					<div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-5 flex items-start gap-4">
						<ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
						<p className="text-sm text-[#b8cbd0] font-medium leading-relaxed">
							Menyerang <strong>{targetName}</strong> secara langsung adalah agresi militer terbuka. Jika menang, Anda dapat melakukan <strong className="text-[#00FFAA]">Aneksasi</strong> untuk memperluas peta wilayah negara Anda!
						</p>
					</div>

					<div className="flex flex-col sm:flex-row gap-3 pt-1">
						<button
							type="button"
							onClick={onBack}
							className="flex-1 py-3.5 bg-[#17272e] hover:bg-[#1f343d] border border-[#00FFAA]/20 rounded-xl text-sm font-black uppercase tracking-wider text-[#8ab0b8] transition-all cursor-pointer"
						>
							Batal
						</button>
						<button
							type="button"
							onClick={onConfirm}
							className="flex-1 py-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-black uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_20px_rgba(225,29,72,0.4)] flex items-center justify-center gap-2"
						>
							<Swords className="w-5 h-5" /> Lancarkan Serangan
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
