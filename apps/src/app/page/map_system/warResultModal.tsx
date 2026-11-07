'use client';

import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
import Image from 'next/image';
import { DEFENSE_UNIT_LABELS, getDefenseUnitCardImage } from '../navigasi_menu/2_navigasi_bawah/buildingCardImages';
import NotebookModalWrapper from '../navigasi_menu/2_navigasi_bawah/NotebookModalWrapper';
import ModalCloseButton from '../root_modals_design_menu/ModalCloseButton';

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
    compact?: boolean;
    onClose: () => void;
}

export default function ResultModal({
    isOpen,
    title,
    message,
    losses = [],
    type = 'success',
    compact = false,
    onClose,
}: ResultModalProps) {
    if (typeof document === 'undefined' || !isOpen) return null;

    const isLosses = losses.length > 0;
    const isError = type === 'error';

    if (compact) {
        return (
            <NotebookModalWrapper compact maxWidthClass="max-w-xl" zIndexClass="z-[500000]">
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="result-modal-title"
                    className="w-full min-w-0 flex flex-col p-4 sm:p-5 font-sans text-white"
                >
                    <div className="flex-1">
                        <div className="mb-6 border-b border-root-accent/20 pb-4">
                            <h2
                                id="result-modal-title"
                                className={`text-xl sm:text-2xl font-black tracking-wide uppercase ${isError ? 'text-rose-400' : 'text-root-accent'}`}
                            >
                                {title}
                            </h2>
                        </div>
                        <p className="text-sm sm:text-base text-[#A0B0B0] leading-relaxed font-medium whitespace-pre-wrap">
                            {message}
                        </p>

                        {isLosses && (
                            <section aria-label="Rincian kerugian alutsista" className="mt-5 border-t border-root-accent/15 pt-4">
                                <h3 className="mb-3 text-xs sm:text-sm font-black uppercase tracking-wider text-root-accent">
                                    Rincian Kerugian Alutsista
                                </h3>
                                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                    {losses.map((loss) => {
                                        const imageKey = loss.unitKey === 'pasukan_infanteri' ? 'barak' : loss.unitKey;
                                        const image = getDefenseUnitCardImage(imageKey);
                                        const label = DEFENSE_UNIT_LABELS[loss.unitKey] || loss.unitKey.replace(/_/g, ' ');
                                        return (
                                            <article key={loss.unitKey} className="flex items-center gap-2.5 rounded-lg border border-root-accent/20 bg-root-canvas p-2.5">
                                                {image && (
                                                    <Image src={image} alt={label} width={40} height={40} className="h-9 w-9 shrink-0 object-contain" />
                                                )}
                                                <div className="min-w-0">
                                                    <p className="truncate text-xs font-bold uppercase leading-tight text-[#A0B0B0]">{label}</p>
                                                    <p className="text-base font-black text-rose-400">−{loss.quantity.toLocaleString('id-ID')}</p>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            </section>
                        )}
                    </div>
                    <div className="mt-6 flex flex-col justify-end gap-3 border-t border-root-accent/20 pt-4 sm:flex-row">
                        <ModalCloseButton
                            onClick={onClose}
                            appearance="custom"
                            className={`w-full rounded-xl border px-6 py-2 text-center text-[11px] font-black uppercase tracking-widest transition-all sm:w-auto sm:text-xs ${isError ? 'border-rose-500/50 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30' : 'border-root-accent/30 bg-root-canvas text-root-text hover:bg-[#142A2A]'}`}
                        >Tutup</ModalCloseButton>
                    </div>
                </div>
            </NotebookModalWrapper>
        );
    }

    const modalContent = (
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="result-modal-title"
                className={`relative flex h-full flex-col overflow-hidden rounded-xl border ${isError ? 'border-rose-500/40' : 'border-root-accent/20'} bg-root-canvas font-sans shadow-[0_0_30px_rgba(0,255,170,0.15)]`}
            >
                {/* Header */}
                <div className="px-4 sm:px-5 lg:px-6 py-3 sm:py-3.5 lg:py-4 border-b border-root-accent/20 flex items-center justify-between bg-root-canvas shrink-0">
                    <div className="flex items-center gap-2 lg:gap-3">
                        <div className={`p-1.5 lg:p-2 rounded-lg border ${isError ? 'border-rose-500/30 bg-rose-950/40 text-rose-400' : 'border-root-accent/30 bg-root-surface text-root-accent'}`}>
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
                        <h2 className={`text-xs sm:text-sm lg:text-base font-black tracking-wider uppercase ${isError ? 'text-rose-400' : 'text-root-accent'}`}>
                            {isError ? 'Laporan Kekalahan Pertempuran' : '⚔️ Laporan Hasil Pertempuran & Perang'}
                        </h2>
                    </div>
                    <ModalCloseButton
                        onClick={onClose}
                        ariaLabel="Tutup modal"
                        appearance="custom"
                        className={`p-1.5 lg:p-2 rounded-lg border ${isError ? 'border-rose-500/30 bg-rose-950/30 text-rose-400 hover:bg-rose-500 hover:text-white' : 'border-root-accent/30 bg-root-surface text-root-accent hover:bg-root-accent hover:text-root-canvas'} transition-all cursor-pointer font-bold text-xs uppercase flex items-center justify-center w-7 h-7 lg:w-8 lg:h-8`}
                    >
                        <span aria-hidden="true" className="text-lg lg:text-xl leading-none">×</span>
                    </ModalCloseButton>
                </div>

                {/* Body Content */}
                <div className="relative z-10 flex-1 min-h-0 p-4 sm:p-5 lg:p-6 overflow-y-auto bg-root-canvas/80 [&::-webkit-scrollbar]:w-1.5 sm:[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-root-canvas [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:border-l [&::-webkit-scrollbar-track]:border-root-accent/20 [&::-webkit-scrollbar-thumb]:bg-gradient-to-b [&::-webkit-scrollbar-thumb]:from-root-accent [&::-webkit-scrollbar-thumb]:to-[#00B37A] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-root-canvas [&::-webkit-scrollbar-thumb]:shadow-[0_0_10px_rgba(0,255,170,0.6)] hover:[&::-webkit-scrollbar-thumb]:from-[#33FFBB] hover:[&::-webkit-scrollbar-thumb]:to-root-accent [&::-webkit-scrollbar-button]:hidden">
                    <h3
                        id="result-modal-title"
                        className={`text-base sm:text-lg lg:text-xl font-black uppercase tracking-wide mb-3 lg:mb-4 ${isError ? 'text-rose-400' : 'text-root-text'}`}
                    >
                        {title}
                    </h3>
                    <p className="text-xs sm:text-sm lg:text-base text-[#A0B0B0] leading-relaxed font-medium whitespace-pre-wrap">
                        {message}
                    </p>

                    {isLosses && (
                        <section aria-label="Rincian kerugian alutsista" className="mt-5 lg:mt-6 pt-4 lg:pt-5 border-t border-root-accent/15">
                            <h4 className="mb-3 lg:mb-4 text-xs sm:text-sm lg:text-base font-black uppercase tracking-wider text-root-accent">
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
                                            className="flex items-center gap-2.5 lg:gap-3 rounded-lg border border-root-accent/20 bg-root-canvas p-2.5 lg:p-3 shadow-sm"
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
                <div className="px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 lg:py-4 border-t border-root-accent/20 bg-root-canvas flex justify-end shrink-0">
                    <SharedModalCloseButton
                        type="button"
                        onClick={onClose}
                        className={`px-5 lg:px-6 py-1.5 lg:py-2 rounded-lg font-black text-xs lg:text-sm uppercase tracking-wider cursor-pointer transition-all ${isError
                            ? 'bg-rose-500/20 border border-rose-500/50 text-rose-400 hover:bg-rose-500/30'
                            : 'bg-root-accent text-root-canvas hover:bg-root-accent/80 shadow-[0_0_10px_rgba(0,255,170,0.2)]'
                        }`}
                     appearance="custom">
                        Tutup
                    </SharedModalCloseButton>
                </div>
            </div>
    );

    return <NotebookModalWrapper zIndexClass="z-[500000]">{modalContent}</NotebookModalWrapper>;
}