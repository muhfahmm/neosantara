"use client";

import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
import { ShieldAlert, Swords, X } from "lucide-react";

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
		<div className="fixed inset-0 z-[70] flex items-center justify-center  p-4 animate-in fade-in duration-200">
			<div className="modal-responsive-shell overflow-y-auto bg-root-surface border border-root-accent/30 rounded-2xl shadow-2xl font-sans text-white relative">
				<div className="bg-root-canvas border-b border-root-accent/20 px-5 sm:px-6 py-4 flex items-center justify-between">
					<div className="flex items-center gap-2.5">
						<Swords className="w-5 h-5 text-root-accent" />
						<h3 className="text-base font-black text-root-accent tracking-wider uppercase">
							KOMANDO OPERASI MILITER
						</h3>
					</div>
					<SharedModalCloseButton
						type="button"
						onClick={onBack}
						className="rounded-lg p-1.5 text-root-subtle hover:text-root-accent cursor-pointer transition-colors"
						aria-label="Tutup konfirmasi serangan"
					 appearance="custom">
						<X className="h-4 w-4" />
					</SharedModalCloseButton>
				</div>

				<div className="p-5 sm:p-6 space-y-6">
					<div className="flex items-center justify-between bg-[#111e24] border border-root-accent/20 rounded-xl p-5 sm:p-6">
						<div className="flex flex-col items-center gap-2 flex-1 min-w-0">
							<img
								src={`https://flagcdn.com/w80/${playerIso}.png`}
								alt={playerName}
								className="w-16 h-10 rounded object-cover border border-black/30 shadow-md"
							/>
							<span className="text-sm font-black uppercase text-root-accent text-center">{playerName}</span>
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
							Menyerang <strong>{targetName}</strong> secara langsung adalah agresi militer terbuka. Jika menang, Anda dapat melakukan <strong className="text-root-accent">Aneksasi</strong> untuk memperluas peta wilayah negara Anda!
						</p>
					</div>

					<div className="flex flex-col sm:flex-row gap-3 pt-1">
						<button
							type="button"
							onClick={onBack}
							className="flex-1 py-3.5 bg-[#17272e] hover:bg-[#1f343d] border border-root-accent/20 rounded-xl text-sm font-black uppercase tracking-wider text-[#8ab0b8] transition-all cursor-pointer"
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