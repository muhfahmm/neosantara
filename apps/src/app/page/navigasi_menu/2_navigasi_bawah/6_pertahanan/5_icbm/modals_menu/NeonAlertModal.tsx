"use client";
import React from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

export type NeonAlertVariant = "error" | "success" | "info";

interface NeonAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  variant?: NeonAlertVariant;
  buttonLabel?: string;
}

const VARIANTS = {
  error: { color: "#FF2D55", Icon: AlertTriangle, title: "Peringatan" },
  success: { color: "#00FFAA", Icon: CheckCircle2, title: "Berhasil" },
  info: { color: "#38BDF8", Icon: Info, title: "Informasi" },
} as const;

export default function NeonAlertModal({
  isOpen,
  onClose,
  title,
  message,
  variant = "error",
  buttonLabel = "Mengerti",
}: NeonAlertModalProps) {
  if (!isOpen) return null;
  const { color, Icon, title: defaultTitle } = VARIANTS[variant];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 pointer-events-auto">
      <div
        className="w-full max-w-md rounded-2xl bg-[#061312] font-sans overflow-hidden"
        style={{ border: `2px solid ${color}`, boxShadow: `0 0 28px ${color}55, inset 0 0 24px ${color}14` }}
      >
        <div className="px-6 py-5 flex items-center justify-between border-b" style={{ borderColor: `${color}33` }}>
          <div className="flex items-center gap-3">
            <Icon className="h-6 w-6" style={{ color, filter: `drop-shadow(0 0 6px ${color})` }} />
            <h3 className="text-lg font-black uppercase tracking-wide" style={{ color }}>
              {title || defaultTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="p-2 rounded-lg border text-[#6B8A8A] hover:text-white transition-all cursor-pointer"
            style={{ borderColor: `${color}55` }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-6 py-6">
          <p className="text-sm leading-relaxed text-[#D6F5EC]">{message}</p>
        </div>
        <div className="px-6 py-4 flex justify-end border-t" style={{ borderColor: `${color}33` }}>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-[#04100F] transition-all active:scale-95 hover:brightness-110 cursor-pointer"
            style={{ background: color, boxShadow: `0 0 16px ${color}88` }}
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
