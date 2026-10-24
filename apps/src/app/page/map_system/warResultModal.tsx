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
        <div className="fixed inset-0 z-[500000] flex items-center justify-center p-4 pointer-events-auto font-sans">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="result-modal-title"
                className={`bg-[#0F2424] border ${isError ? 'border-rose-500/40' : 'border-[#00FFAA]/40'} rounded-2xl overflow-hidden w-full max-w-md max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] pointer-events-auto shadow-lg flex flex-col font-sans`}
            >
                {/* Header */}
                <div className="px-4 sm:px-5 lg:px-6 py-3 sm:py-3.5 lg:py-4 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] shrink-0">
                    <div className="flex items-center gap-2 lg:gap-3">
                        <div className={`p-1.5 lg:p-2 rounded-lg border ${isError ? 'border-rose-500/30 bg-rose-950/40 text-rose-400' : 'border-[#00FFAA]/30 bg-[#0F2424] text-[#00FFAA]'}`}>
                            {isError ? (
                                <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                        <h2 className={`text-xs sm:text-sm lg:text-base font-black tracking-wider uppercase ${isError ? 'text-rose-400' : 'text-[#00FFAA]'}`}>
                            {isError ? 'Laporan Kekalahan Pertempuran' : '⚔️ Laporan Hasil Pertempuran & Perang'}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Tutup modal"
                        className={`p-1.5 lg:p-2 rounded-lg border ${isError ? 'border-rose-500/30 bg-rose-950/30 text-rose-400 hover:bg-rose-500 hover:text-white' : 'border-[#00FFAA]/30 bg-[#0F2424] text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A]'} transition-all cursor-pointer font-bold text-xs uppercase flex items-center justify-center w-7 h-7 lg:w-8 lg:h-8`}
                    >
                        <span aria-hidden="true" className="text-lg lg:text-xl leading-none">×</span>
                    </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 min-h-0 p-4 sm:p-5 lg:p-6 overflow-y-auto">
                    <h3
                        id="result-modal-title"
                        className={`text-base sm:text-lg lg:text-xl font-black uppercase tracking-wide mb-3 lg:mb-4 ${isError ? 'text-rose-400' : 'text-[#E0E0E0]'}`}
                    >
                        {title}
                    </h3>
                    <p className="text-xs sm:text-sm lg:text-base text-[#A0B0B0] leading-relaxed font-medium whitespace-pre-wrap">
                        {message}
                    </p>

                    {isLosses && (
                        <section aria-label="Rincian kerugian alutsista" className="mt-5 lg:mt-6 pt-4 lg:pt-5 border-t border-[#00FFAA]/15">
                            <h4 className="mb-3 lg:mb-4 text-xs sm:text-sm lg:text-base font-black uppercase tracking-wider text-[#00FFAA]">
                                Rincian Kerugian Alutsista
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 lg:gap-3">
                                {losses.map((loss) => {
                                    const imageKey = loss.unitKey === 'pasukan_infanteri' ? 'barak' : loss.unitKey;
                                    const image = getDefenseUnitCardImage(imageKey);
                                    const label = DEFENSE_UNIT_LABELS[loss.unitKey] || loss.unitKey.replace(/_/g, ' ');
                                    return (
                                        <article
                                            key={loss.unitKey}
                                            className="flex items-center gap-2.5 lg:gap-3 rounded-lg border border-[#00FFAA]/20 bg-[#0A1A1A] p-2.5 lg:p-3 shadow-sm"
                                        >
                                            {image && (
                                                <Image
                                                    src={image}
                                                    alt={label}
                                                    width={40}
                                                    height={40}
                                                    className="h-9 w-9 lg:h-11 lg:w-11 shrink-0 object-contain"
                                                />
                                            )}
                                            <div className="min-w-0">
                                                <p className="text-xs lg:text-sm font-bold uppercase leading-tight text-[#A0B0B0] truncate">{label}</p>
                                                <p className="text-base lg:text-lg font-black text-rose-400">
                                                    −{loss.quantity.toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </section>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 lg:py-4 border-t border-[#00FFAA]/20 bg-[#0A1A1A] flex justify-end shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className={`px-5 lg:px-6 py-1.5 lg:py-2 rounded-lg font-black text-xs lg:text-sm uppercase tracking-wider cursor-pointer transition-all ${isError
                            ? 'bg-rose-500/20 border border-rose-500/50 text-rose-400 hover:bg-rose-500/30'
                            : 'bg-[#00FFAA] text-[#0A1A1A] hover:bg-[#00FFAA]/80 shadow-[0_0_10px_rgba(0,255,170,0.2)]'
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
