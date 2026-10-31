"use client";
import React from "react";
import { createPortal } from "react-dom";
import { PhoneForwarded, X, Clock, AlertTriangle } from "lucide-react";

interface StatusMintaSerangModalProps {
	isOpen: boolean;
	countryName?: string | null;
	arrivalDate?: string | null;
	onClose: () => void;
}

export default function StatusMintaSerangModal({
	isOpen,
	countryName,
	arrivalDate,
	onClose,
}: StatusMintaSerangModalProps) {
	if (!isOpen) return null;

	const formatArrivalDate = (dateString?: string | null) => {
		if (!dateString) return "-";
		const [year, month, day] = dateString.split("-").map(Number);
		const date = new Date(year, month - 1, day);
		if (Number.isNaN(date.getTime())) return dateString;
		const parts = new Intl.DateTimeFormat("id-ID", {
			day: "numeric",
			month: "long",
			year: "numeric",
		}).formatToParts(date);
		const dayPart = parts.find((part) => part.type === "day")?.value || "";
		const monthPart = parts.find((part) => part.type === "month")?.value || "";
		const yearPart = parts.find((part) => part.type === "year")?.value || "";
		return `${dayPart} ${monthPart} ${yearPart}`;
	};

	const modalContent = (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 font-sans text-white pointer-events-none">
			<div className="w-full max-w-lg overflow-hidden rounded-2xl border-2 border-amber-400/50 bg-[#0d161a] text-white shadow-[0_0_40px_rgba(245,158,11,0.2)] relative pointer-events-auto">
				{/* Header */}
				<div className="flex items-center justify-between border-b border-amber-400/20 bg-[#14232a] px-6 py-4">
					<div className="flex items-center gap-3">
						<PhoneForwarded className="h-6 w-6 text-amber-400" />
						<h3 className="text-base font-black uppercase tracking-wider text-amber-300">
							Mandat Serangan Sedang Berjalan
						</h3>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="rounded-lg p-2 text-[#8ab0b8] transition-colors hover:bg-white/5 hover:text-white cursor-pointer"
						aria-label="Tutup"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				{/* Body Content */}
				<div className="space-y-5 p-6">
					<div className="flex items-start gap-3 rounded-xl bg-amber-400/10 border border-amber-400/20 p-4">
						<AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
						<p className="text-sm leading-relaxed text-[#d5e3e6]">
							Anda telah menginstruksikan komando militer{" "}
							<strong className="text-white">{countryName || "negara ini"}</strong> untuk
							melancarkan operasi militer. Operasi saat ini sedang aktif berlangsung di lapangan.
						</p>
					</div>

					{arrivalDate && (
						<div className="flex items-center gap-3 rounded-xl bg-[#111e24] border border-[#00FFAA]/20 px-4 py-3 text-xs text-[#b8cbd0]">
							<Clock className="h-4 w-4 text-[#00FFAA] shrink-0" />
							<span>
								Estimasi waktu tiba / penyelesaian operasi:{" "}
								<strong className="text-amber-300 font-mono text-sm ml-1">
									{formatArrivalDate(arrivalDate)}
								</strong>
							</span>
						</div>
					)}

					<p className="text-xs leading-relaxed text-[#8ab0b8]">
						Negara ini tidak dapat menerima mandat serangan baru hingga operasi militer yang sedang
						berjalan diselesaikan atau ditarik mundur.
					</p>

					{/* Action Button */}
					<div className="pt-2">
						<button
							type="button"
							onClick={onClose}
							className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 py-3 text-sm font-black uppercase tracking-wider text-[#0d161a] transition-all cursor-pointer shadow-md active:scale-[0.99]"
						>
							Tutup
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

