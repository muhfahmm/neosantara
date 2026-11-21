"use client";
import RootInfoModalHeader from '@/app/page/root_modals_design_menu/RootInfoModalHeader';
import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
import React from "react";
import { createPortal } from "react-dom";
import { PhoneForwarded, Clock, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

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
	const { t } = useLanguage();
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
			<div className="modal-responsive-shell overflow-y-auto rounded-2xl border border-root-accent/30 bg-root-surface text-white shadow-2xl relative pointer-events-auto">
				<RootInfoModalHeader
					title={t("detail_negara_ai.military.attackMandateActiveTitle")}
					onClose={onClose}
					icon={<PhoneForwarded />}
					size="standard"
				/>

				{/* Body Content */}
				<div className="space-y-5 p-5 sm:p-6">
					<div className="flex items-start gap-3 rounded-xl bg-amber-400/10 border border-amber-400/20 p-4">
						<AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
						<p className="text-sm leading-relaxed text-[#d5e3e6]">
							{t("detail_negara_ai.military.attackMandatePrefix")}{" "}
							<strong className="text-white">{countryName || t("detail_negara_ai.military.thisCountry")}</strong> {t("detail_negara_ai.military.attackMandateSuffix")}
						</p>
					</div>

					{arrivalDate && (
						<div className="flex items-center gap-3 rounded-xl bg-[#111e24] border border-root-accent/20 px-4 py-3 text-xs text-[#b8cbd0]">
							<Clock className="h-4 w-4 text-root-accent shrink-0" />
							<span>
								{t("detail_negara_ai.military.estimatedArrival")}:{" "}
								<strong className="text-amber-300 font-mono text-sm ml-1">
									{formatArrivalDate(arrivalDate)}
								</strong>
							</span>
						</div>
					)}

					<p className="text-xs leading-relaxed text-[#8ab0b8]">
						{t("detail_negara_ai.military.attackMandateNote")}
					</p>

					{/* Action Button */}
					<div className="pt-2">
						<SharedModalCloseButton
							type="button"
							onClick={onClose}
							className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 py-3 text-sm font-black uppercase tracking-wider text-[#0d161a] transition-all cursor-pointer shadow-md active:scale-[0.99]"
						 appearance="custom">
							{t("detail_negara_ai.common.close")}
						</SharedModalCloseButton>
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