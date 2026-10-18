'use client';

import Image from 'next/image';
import { createPortal } from 'react-dom';
import { DEFENSE_UNIT_LABELS, getDefenseUnitCardImage } from '../navigasi_menu/2_navigasi_bawah/buildingCardImages';

export interface WarUnitLoss {
    unitKey: string;
    quantity: number;
}

export interface ResultModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    losses?: WarUnitLoss[];
    type?: 'success' | 'error' | 'info';
    onClose: () => void;
}

export default function ResultModal({
    isOpen,
    title,
    message,
    losses = [],
    type = 'success',
    onClose,
}: ResultModalProps) {
    if (typeof window === 'undefined' || !isOpen) return null;

    const isLosses = losses.length > 0;
    const isError = type === 'error';

    return createPortal(
        <div className="fixed inset-0 z-[500000] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent font-sans pointer-events-none animate-fadeIn">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="result-modal-title"
                className={`bg-[#0F2424] border-2 ${isError ? 'border-rose-500/40' : 'border-[#00FFAA]/40'} rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[940px] xl:max-w-[1040px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] shadow-2xl flex flex-col font-sans animate-in fade-in zoom-in-95 duration-200 pointer-events-auto`}
            >
                {/* Header */}
                <div className="px-6 sm:px-8 py-3.5 sm:py-4 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-lg border ${isError ? 'border-rose-500/30 bg-rose-950/40 text-rose-400' : 'border-[#00FFAA]/30 bg-[#0F2424] text-[#00FFAA]'}`}>
                            {isError ? (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                        <h2 className={`text-sm sm:text-base font-black tracking-wider uppercase ${isError ? 'text-rose-400' : 'text-[#00FFAA]'}`}>
                            {isError ? 'Pemberitahuan / Peringatan' : 'Konfirmasi & Hasil Operasi'}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Tutup modal"
                        className={`p-1.5 rounded-lg border ${isError ? 'border-rose-500/30 bg-rose-950/30 text-rose-400 hover:bg-rose-500 hover:text-white' : 'border-[#00FFAA]/30 bg-[#0F2424] text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A]'} transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1`}
                    >
                        <span className="text-[11px] font-bold uppercase tracking-wider pl-0.5">Tutup</span>
                        <span aria-hidden="true" className="text-base leading-none">×</span>
                    </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 min-h-0 p-6 sm:p-8 overflow-y-auto no-scrollbar">
                    <h3
                        id="result-modal-title"
                        className={`text-lg sm:text-xl font-black uppercase tracking-wide mb-3 ${isError ? 'text-rose-400' : 'text-[#E0E0E0]'}`}
                    >
                        {title}
                    </h3>
                    <p className="text-sm sm:text-base text-[#A0B0B0] leading-relaxed font-medium whitespace-pre-wrap">
                        {message}
                    </p>

                    {isLosses && (
                        <section aria-label="Rincian kerugian alutsista" className="mt-6 pt-5 border-t border-[#00FFAA]/15">
                            <h4 className="mb-3 text-xs sm:text-sm font-black uppercase tracking-wider text-[#00FFAA]">
                                Rincian Kerugian Alutsista
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {losses.map((loss) => {
                                    const imageKey = loss.unitKey === 'pasukan_infanteri' ? 'barak' : loss.unitKey;
                                    const image = getDefenseUnitCardImage(imageKey);
                                    const label = DEFENSE_UNIT_LABELS[loss.unitKey] || loss.unitKey.replace(/_/g, ' ');
                                    return (
                                        <article
                                            key={loss.unitKey}
                                            className="flex items-center gap-3 rounded-xl border border-[#00FFAA]/20 bg-[#0A1A1A] p-3 shadow-sm"
                                        >
                                            {image && (
                                                <Image
                                                    src={image}
                                                    alt={label}
                                                    width={56}
                                                    height={56}
                                                    className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 object-contain"
                                                />
                                            )}
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold uppercase leading-tight text-[#A0B0B0] truncate">{label}</p>
                                                <p className="text-lg font-black text-rose-400">
                                                    −{loss.quantity.toLocaleString('id-ID')}
                                                </p>
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B8A8A]">unit hilang</p>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </section>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="px-6 sm:px-8 py-3.5 sm:py-4 border-t border-[#00FFAA]/20 bg-[#0A1A1A] flex justify-end shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className={`min-w-28 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider cursor-pointer transition-all ${isError
                            ? 'bg-rose-500/20 border border-rose-500/50 text-rose-400 hover:bg-rose-500/30'
                            : 'bg-[#00FFAA] text-[#0A1A1A] hover:bg-[#00FFAA]/80 shadow-[0_0_15px_rgba(0,255,170,0.3)]'
                        }`}
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
