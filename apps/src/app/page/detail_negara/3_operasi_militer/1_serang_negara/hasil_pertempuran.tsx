"use client";

import { ArrowLeft, Flag, Skull, Swords, Trophy } from "lucide-react";

interface HasilPertempuranProps {
	isVictory: boolean;
	playerName: string;
	countryName: string;
	onClose: () => void;
	onSelectAction: (action: 'aneksasi' | 'jarah' | 'mundur') => void;
}

export default function HasilPertempuran({
	isVictory,
	playerName,
	countryName,
	onClose,
	onSelectAction,
}: HasilPertempuranProps) {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
			<div className="w-full max-w-[560px] bg-[#0d161a] border-2 border-[#00FFAA]/40 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,255,170,0.2)] font-sans text-white relative">
				<div className="bg-[#14232a] border-b border-[#00FFAA]/20 px-6 py-4 flex items-center justify-between">
					<div className="flex items-center gap-2.5">
						<Swords className="w-5 h-5 text-[#00FFAA]" />
						<h3 className="text-base font-black text-[#00FFAA] tracking-wider uppercase">
							LAPORAN HASIL PERTEMPURAN
						</h3>
					</div>
					<button
						onClick={onClose}
						className="text-[#6B8A8A] hover:text-[#00FFAA] font-black text-sm cursor-pointer transition-colors"
						aria-label="Tutup laporan hasil pertempuran"
					>
						✕
					</button>
				</div>

				<div className="p-6 space-y-6">
					{isVictory ? (
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

					{isVictory ? (
						<div className="space-y-3">
							<span className="text-[11px] font-black uppercase text-[#6B8A8A] tracking-wider block">
								PILIH ANEKSASI ATAU OPSI TAKTIS:
							</span>

							<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
								<button
									type="button"
									onClick={() => onSelectAction('aneksasi')}
									className="bg-gradient-to-b from-[#00FFAA]/20 to-[#00FFAA]/5 border-2 border-[#00FFAA] hover:border-amber-400 rounded-xl p-4 flex flex-col items-center justify-between text-center gap-2 hover:scale-[1.02] transition-all cursor-pointer group shadow-[0_0_15px_rgba(0,255,170,0.15)]"
								>
									<Flag className="w-7 h-7 text-[#00FFAA] group-hover:scale-110 transition-transform" />
									<div>
										<span className="text-xs font-black text-[#00FFAA] block uppercase">ANEKSASI</span>
										<span className="text-[10px] text-emerald-300/80 leading-tight block mt-1">
											Caplok & Integrasikan seluruh luas wilayah {countryName} menjadi warna {playerName}.
										</span>
									</div>
								</button>

								<button
									type="button"
									onClick={() => onSelectAction('jarah')}
									className="bg-[#14232a] border border-[#00FFAA]/30 hover:border-[#00FFAA] rounded-xl p-4 flex flex-col items-center justify-between text-center gap-2 hover:scale-[1.02] transition-all cursor-pointer group"
								>
									<Trophy className="w-7 h-7 text-amber-400 group-hover:scale-110 transition-transform" />
									<div>
										<span className="text-xs font-black text-amber-400 block uppercase">JARAH SDA</span>
										<span className="text-[10px] text-[#8ab0b8] leading-tight block mt-1">
											Rampas kas & sumber daya alam {countryName} tanpa mencaplok wilayah.
										</span>
									</div>
								</button>

								<button
									type="button"
									onClick={() => onSelectAction('mundur')}
									className="bg-[#14232a] border border-[#00FFAA]/30 hover:border-[#00FFAA] rounded-xl p-4 flex flex-col items-center justify-between text-center gap-2 hover:scale-[1.02] transition-all cursor-pointer group"
								>
									<ArrowLeft className="w-7 h-7 text-slate-400 group-hover:scale-110 transition-transform" />
									<div>
										<span className="text-xs font-black text-slate-300 block uppercase">MUNDUR</span>
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
								onClick={() => onSelectAction('mundur')}
								className="w-full py-3.5 bg-[#17272e] hover:bg-[#1f343d] border border-rose-500/40 rounded-xl text-xs font-black uppercase tracking-wider text-rose-300 transition-all cursor-pointer"
							>
								Mundur & Tutup Laporan
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
