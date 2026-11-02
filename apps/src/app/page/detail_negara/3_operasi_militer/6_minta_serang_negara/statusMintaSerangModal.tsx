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
			<div className="w-full max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl border border-[#00FFAA]/30 bg-[#0F2424] text-white shadow-2xl relative pointer-events-auto">
				{/* Header */}
				<div className="flex items-center justify-between border-b border-amber-400/20 bg-[#0A1A1A] px-5 sm:px-6 py-4">
					<div className="flex items-center gap-3">
						<PhoneForwarded className="h-5 w-5 text-amber-400" />
						<h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-amber-300">
							Mandat Serangan Sedang Berjalan
						</h3>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="rounded-lg p-1.5 text-[#6B8A8A] transition-colors hover:text-amber-400 cursor-pointer"
						aria-label="Tutup"
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				{/* Body Content */}
				<div className="space-y-5 p-5 sm:p-6">
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
