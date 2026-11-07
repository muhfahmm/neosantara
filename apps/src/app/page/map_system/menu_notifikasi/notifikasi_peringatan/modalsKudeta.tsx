'use client';

import React, { useEffect, useState } from 'react';
import { Skull, RotateCcw, Globe, Crown, Flame, Swords } from 'lucide-react';
import { useRouter } from 'next/navigation';

export type KudetaType = "peringkat" | "kepuasan" | "kesejahteraan";

interface ModalsKudetaProps {
    isOpen: boolean;
    kudetaType: KudetaType;
    currentValue: number;
    countryName?: string;
    onRestart: () => void; // Restart negara yang sama, data default
}

const kudetaContent: Record<KudetaType, {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    desc: string;
    valueLabel: string;
    accentColor: string;
    bgColor: string;
}> = {
    peringkat: {
        icon: <Crown className="w-10 h-10" />,
        title: "ANDA TELAH DIKUDETA",
        subtitle: "Peringkat Kepresidenan Jatuh",
        desc: "Kepercayaan rakyat dan parlemen terhadap Anda telah mencapai titik nol. Parlemen bersidang darurat dan dengan suara bulat memakzulkan Anda dari jabatan Presiden. Rakyat turun ke jalan merayakan kejatuhan pemerintahan Anda. Masa kepresidenan Anda resmi berakhir.",
        valueLabel: "Peringkat Akhir:",
        accentColor: "text-red-600",
        bgColor: "from-red-950 to-slate-950",
    },
    kepuasan: {
        icon: <Flame className="w-10 h-10" />,
        title: "REVOLUSI RAKYAT",
        subtitle: "Kepuasan Rakyat Mencapai Titik Nol",
        desc: "Rakyat tak lagi percaya pada pemerintahan Anda. Demo besar-besaran berubah menjadi revolusi nasional. Militer memilih berpihak kepada rakyat dan Anda terpaksa mengundurkan diri. Pemerintahan transisi akan dibentuk untuk memulihkan kepercayaan bangsa.",
        valueLabel: "Kepuasan Terakhir:",
        accentColor: "text-orange-500",
        bgColor: "from-orange-950 to-slate-950",
    },
    kesejahteraan: {
        icon: <Swords className="w-10 h-10" />,
        title: "KRISIS KEMANUSIAAN TOTAL",
        subtitle: "Indeks Kesejahteraan Rakyat Nol",
        desc: "Kualitas hidup rakyat telah jatuh ke tingkat yang tidak dapat ditoleransi. PBB menjatuhkan sanksi internasional. Rakyat yang kelaparan dan tanpa tempat tinggal memaksa Anda mundur. Negara Anda dinyatakan dalam kondisi darurat kemanusiaan oleh lembaga internasional.",
        valueLabel: "Kesejahteraan Terakhir:",
        accentColor: "text-rose-500",
        bgColor: "from-rose-950 to-slate-950",
    },
};

export default function ModalsKudeta({ isOpen, kudetaType, currentValue, countryName, onRestart }: ModalsKudetaProps) {
    const router = useRouter();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Sedikit delay agar animasi terasa lebih dramatis
            const t = setTimeout(() => setVisible(true), 100);
            return () => clearTimeout(t);
        } else {
            setVisible(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const content = kudetaContent[kudetaType];

    const handlePilihNegara = () => {
        router.push('/page/map_system/pilih-negara');
    };

    const handleRestart = () => {
        onRestart();
    };

    return (
        <div
            className={`fixed inset-0 z-[200] flex items-center justify-center p-4 font-sans select-none transition-all duration-700 ${
                visible ? 'opacity-100' : 'opacity-0'
            }`}
        >
            {/* Dramatic background pattern */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-b ${content.bgColor} opacity-30`} />
                {/* Diagonal crack lines effect */}
                <div className="modal-responsive-shell absolute top-0 left-1/3 bg-red-800/20 rotate-12" />
                <div className="absolute top-0 right-1/4 w-[1px] h-full bg-red-800/15 -rotate-6" />
            </div>

            {/* Main Modal */}
            <div
                className={`relative w-full max-w-[500px] transition-all duration-700 delay-200 ${
                    visible ? 'translate-y-0 scale-100' : 'translate-y-8 scale-95'
                }`}
            >
                {/* Outer dark frame */}
                <div className="bg-[#0e0808] border-4 border-red-900/80 rounded-2xl shadow-2xl shadow-red-900/40 overflow-hidden">

                    {/* Dramatic header band */}
                    <div className={`bg-gradient-to-r ${content.bgColor} p-6 flex flex-col items-center gap-3 border-b-2 border-red-900/50`}>
                        {/* Skull icon overlay */}
                        <div className="relative">
                            <div className="absolute inset-0 rounded-full bg-red-600/20  animate-pulse" />
                            <div className="relative w-20 h-20 rounded-full bg-red-950/80 border-4 border-red-700 flex items-center justify-center text-red-400 shadow-lg shadow-red-900/50">
                                <Skull className="w-10 h-10" />
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="text-[9px] font-black tracking-[0.3em] text-red-500/70 uppercase mb-1">
                                — GAME OVER —
                            </div>
                            <h2 className="text-xl font-black text-red-400 uppercase tracking-widest leading-tight">
                                {content.title}
                            </h2>
                            <p className="text-[11px] text-red-300/60 font-bold uppercase tracking-wider mt-1">
                                {content.subtitle}
                            </p>
                        </div>
                    </div>

                    {/* Content parchment */}
                    <div className="bg-[#FAF4F0] p-6 flex flex-col gap-5">

                        {/* Country & Value badge */}
                        <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                            <div>
                                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Negara</p>
                                <p className="text-sm font-black text-slate-800">{countryName || "—"}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">{content.valueLabel}</p>
                                <p className={`text-2xl font-black ${content.accentColor}`}>{currentValue}<span className="text-sm text-slate-400">/100</span></p>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-white/60 border border-slate-200/60 rounded-xl p-4">
                            <p className="text-[12px] font-medium text-slate-700 leading-relaxed text-center">
                                {content.desc}
                            </p>
                        </div>

                        {/* Divider */}
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-red-300/50" />
                            <span className="text-[9px] font-black text-red-400/60 uppercase tracking-widest">Pilih Tindakan</span>
                            <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-red-300/50" />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2.5">
                            {/* Restart same country */}
                            <button
                                onClick={handleRestart}
                                className="w-full flex items-center justify-center gap-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-600 rounded-xl py-3.5 text-[#FAF6EE] font-black text-[11px] tracking-widest uppercase transition-all duration-150 cursor-pointer shadow-lg hover:shadow-xl active:scale-[0.98] group"
                            >
                                <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                                Restart — Negara yang Sama
                            </button>

                            {/* Choose different country */}
                            <button
                                onClick={handlePilihNegara}
                                className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 active:from-red-800 border border-red-500 rounded-xl py-3.5 text-[#FAF6EE] font-black text-[11px] tracking-widest uppercase transition-all duration-150 cursor-pointer shadow-lg hover:shadow-xl active:scale-[0.98] group"
                            >
                                <Globe className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                                Mulai dengan Negara Berbeda
                            </button>
                        </div>

                        {/* Fine print */}
                        <p className="text-center text-[9px] text-slate-400 font-medium">
                            Restart akan menghapus semua progres negara ini dan memulai ulang dari data default.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
