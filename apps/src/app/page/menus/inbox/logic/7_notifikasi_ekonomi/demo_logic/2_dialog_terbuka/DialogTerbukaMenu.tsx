'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Choice, ChoiceOption, NPCState, PlayerState, negotiateChoice } from './dialogTerbukaApi';
import { 
  ArrowLeft, MessageSquare, ShieldAlert, CheckCircle2, XCircle, 
  Clock, Flame, User, Target, RefreshCw
} from 'lucide-react';

import MenuBubarkanMassaModal from '../1_bubarkan_dengan_aparat/MenuBubarkanMassaModal';
import { DetailOpsiBubarkan } from '../1_bubarkan_dengan_aparat/opsiBubarkanMassaConfig';

interface DialogTerbukaMenuProps {
  returnHref?: string;
  onClose?: () => void;
  onOpenBubarkanMassa?: () => void;
  onExecuteBubarkanOption?: (option: DetailOpsiBubarkan) => void;
  currentBudget?: number;
}

type Demand = { id: string; text: string; status: 'pending' | 'rejected' | 'completed' };
type DialogContext = { demands: Demand[]; opening: string; title: string };

const DEFAULT_CONTEXT: DialogContext = {
  title: 'Tuntutan Ekonomi',
  opening: 'Pak Presiden, kami menunggu langkah nyata pemerintah.',
  demands: [{ id: 'general', text: 'Kebijakan ekonomi yang meringankan beban rakyat', status: 'pending' }],
};

const INITIAL_MESSAGES = [
  { id: 'sys-1', sender: 'system', text: 'Sesi negosiasi dimulai.' },
  { id: 'npc-1', sender: 'npc', text: DEFAULT_CONTEXT.opening },
];

const INITIAL_CHOICE_TEXT: Record<Choice, string[]> = {
  HARD_POWER: ['Tegaskan batas anggaran dan tolak tuntutan penuh.', 'Berikan peringatan agar aksi tidak mengganggu layanan publik.', 'Minta massa menghentikan blokade sebelum dialog dilanjutkan.'],
  SOFT_POWER: ['Ajak perwakilan massa menyusun jadwal perundingan.', 'Buka mediasi dan audit kebijakan secara bersama.', 'Minta waktu singkat sambil menjamin transparansi data.'],
  CONCESSION: ['Pulihkan bantuan bagi warga yang terdampak.', 'Setujui bantuan darurat untuk meredakan keadaan.', 'Kurangi beban kebijakan yang memicu demonstrasi.'],
};

function randomChoices(): ChoiceOption[] {
  return (Object.keys(INITIAL_CHOICE_TEXT) as Choice[]).map(choice => ({
    choice,
    text: INITIAL_CHOICE_TEXT[choice][Math.floor(Math.random() * INITIAL_CHOICE_TEXT[choice].length)],
  }));
}

function initialMood(
  notification: { cause?: string; severity?: string; details?: Record<string, unknown> },
  totalDemonstrators?: number
) {
  const details = notification.details ?? {};
  
  // Jika ada total demonstran, skala anger disesuaikan:
  // > 500.000: 90% (Sangat marah)
  // < 50.000: 40% (Bisa diajak kompromi)
  let severityBase = notification.severity === 'ekstrem' ? 82 : notification.severity === 'tinggi' ? 70 : 58;
  if (totalDemonstrators !== undefined && totalDemonstrators > 0) {
    if (totalDemonstrators >= 500000) {
      severityBase = 90;
    } else if (totalDemonstrators <= 50000) {
      severityBase = 40;
    } else {
      // Interpolasi 40 s/d 90
      const ratio = (totalDemonstrators - 50000) / 450000;
      severityBase = Math.round(40 + ratio * 50);
    }
  }

  const impact = notification.cause === 'pajak'
    ? Math.min(10, Number(details.rateDifference ?? 0) * 1.5)
    : notification.cause === 'harga'
      ? Math.min(10, Number(details.levelJump ?? 0) * 3)
      : notification.cause === 'subsidi' ? 8 : 0;
  const anger = Math.max(10, Math.min(95, severityBase + impact));
  return { anger, trust: 100 - anger };
}

function contextFromNotification(
  notification: { cause?: string; details?: Record<string, unknown>; message?: string; demonstratorCount?: number },
  totalDemonstrators?: number
): DialogContext {
  const details = notification.details ?? {};
  const massa = totalDemonstrators ?? notification.demonstratorCount ?? 0;
  
  // Opening prefix berdasarkan massa:
  let massaOpeningPrefix = '';
  if (massa >= 100000) {
    massaOpeningPrefix = `Kami tidak akan bergerak! Ada ${massa.toLocaleString('id-ID')} rakyat yang tumpah ruah di sini! `;
  } else if (massa > 0 && massa <= 50000) {
    massaOpeningPrefix = `Kami mulai kelelahan... tapi kami tetap menuntut keadilan! `;
  }

  if (notification.cause === 'subsidi') {
    const subsidy = String(details.subsidyName ?? 'subsidi rakyat');
    return { title: `Pencabutan ${subsidy}`, opening: `${massaOpeningPrefix}Pencabutan ${subsidy} langsung membebani keluarga kami. Kembalikan perlindungan ini.`, demands: [
      { id: 'restore-subsidy', text: `Pulihkan program ${subsidy}`, status: 'pending' },
      { id: 'protect-poor', text: 'Jamin perlindungan bagi keluarga rentan', status: 'pending' },
    ] };
  }
  if (notification.cause === 'harga') {
    const item = String(details.itemName ?? 'kebutuhan pokok');
    return { title: `Lonjakan Harga ${item}`, opening: `${massaOpeningPrefix}Harga ${item} melonjak akibat kebijakan pemerintah. Stabilkan harga sebelum beban rakyat makin berat.`, demands: [
      { id: 'stabilize-price', text: `Stabilkan harga ${item}`, status: 'pending' },
      { id: 'open-distribution', text: 'Buka distribusi dan pengawasan harga', status: 'pending' },
    ] };
  }
  if (notification.cause === 'pajak') {
    const tax = String(details.taxName ?? 'pajak');
    const newRate = details.newRate ? ` menjadi ${details.newRate}%` : '';
    return { title: `Kenaikan ${tax}`, opening: `${massaOpeningPrefix}Kenaikan ${tax}${newRate} menekan penghasilan warga dan usaha kecil. Batalkan kebijakan ini.`, demands: [
      { id: 'cancel-tax-rise', text: `Batalkan kenaikan ${tax}`, status: 'pending' },
      { id: 'review-tax', text: `Evaluasi tarif ${tax} bersama perwakilan rakyat`, status: 'pending' },
    ] };
  }
  return { ...DEFAULT_CONTEXT, opening: `${massaOpeningPrefix}${notification.message ?? DEFAULT_CONTEXT.opening}` };
}

function aggregateContexts(
  notifications: Array<{ cause?: string; details?: Record<string, unknown>; message?: string; demonstratorCount?: number }>,
  totalDemonstrators?: number
): DialogContext {
  const contexts = notifications.map(n => contextFromNotification(n, totalDemonstrators));
  const demands = contexts.flatMap(context => context.demands).filter((demand, index, all) => all.findIndex(item => item.text === demand.text) === index);
  const activeDemands = (demands.length ? demands : DEFAULT_CONTEXT.demands).map((demand, index) => ({ ...demand, id: `${demand.id}-${index}` }));
  const summary = activeDemands.slice(0, 3).map(demand => demand.text).join('; ');
  const more = activeDemands.length > 3 ? `, serta ${activeDemands.length - 3} tuntutan lain` : '';
  
  const massa = totalDemonstrators ?? 0;
  let massaPrefix = '';
  if (massa >= 100000) {
    massaPrefix = `Kami tidak akan bergerak! Ada ${massa.toLocaleString('id-ID')} rakyat yang bersatu di jalanan! `;
  } else if (massa > 0 && massa <= 50000) {
    massaPrefix = `Massa kami mulai kelelahan... tapi tuntutan keadilan kami tidak akan padam! `;
  }

  return { 
    title: `Tuntutan Massa (${activeDemands.length})`, 
    opening: `${massaPrefix}Kami membawa ${activeDemands.length} tuntutan dari aksi yang berlangsung: ${summary}${more}. Pemerintah harus memberi jawaban nyata.`, 
    demands: activeDemands 
  };
}

export default function DialogTerbukaMenu({ 
  returnHref, 
  onClose,
  onOpenBubarkanMassa,
  onExecuteBubarkanOption,
  currentBudget = 100_000_000,
}: DialogTerbukaMenuProps) {
  const router = useRouter();

  const handleReturn = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    try {
      sessionStorage.setItem('presiden_simulator_returning_from_dialog', '1');
    } catch (err) {
      console.error(err);
    }
    if (onClose) {
      onClose();
      return;
    }
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else if (returnHref) {
      router.push(returnHref);
    }
  };

  // State untuk prototipe
  const [context, setContext] = useState<DialogContext>(DEFAULT_CONTEXT);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [angerLevel, setAngerLevel] = useState(75);
  const [trustLevel, setTrustLevel] = useState(30);
  const [totalMassa, setTotalMassa] = useState<number>(0);
  const [patience, setPatience] = useState(3);
  const [memory, setMemory] = useState<Record<string, number | string>>({});
  const [budget, setBudget] = useState(100_000);
  const [choices, setChoices] = useState<ChoiceOption[]>(randomChoices());
  const [refreshCount, setRefreshCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'ongoing' | 'success' | 'riot' | 'walkout'>('ongoing');
  const [events, setEvents] = useState<string[]>([]);
  const [selectedDemand, setSelectedDemand] = useState<Demand | null>(null);
  const [isBubarkanModalOpen, setIsBubarkanModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const npcState: NPCState = { anger_level: angerLevel, trust_level: trustLevel, patience, memory };
  const moodTotal = Math.max(1, angerLevel + trustLevel);
  const angerPercent = Math.round((angerLevel / moodTotal) * 100);
  const trustPercent = 100 - angerPercent;
  const playerState: PlayerState = { budget };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('dialog-terbuka-notification');
      if (!raw) return;
      const stored = JSON.parse(raw) as { 
        selected?: { cause?: string; severity?: string; details?: Record<string, unknown>; message?: string; demonstratorCount?: number }; 
        notifications?: Array<{ cause?: string; severity?: string; details?: Record<string, unknown>; message?: string; demonstratorCount?: number }> 
      };
      const notification = stored.selected ?? (stored as { cause?: string; severity?: string; details?: Record<string, unknown>; message?: string; demonstratorCount?: number });
      const allNotifications = stored.notifications?.length ? stored.notifications : [notification];
      
      // Hitung total massa dari seluruh notifikasi demo aktif
      const totalDem = allNotifications.reduce((acc, curr) => acc + (Number(curr.demonstratorCount) || 50000), 0);
      setTotalMassa(totalDem);

      const notificationContext = aggregateContexts(allNotifications, totalDem);
      const mood = initialMood(notification, totalDem);
      setContext(notificationContext);
      setAngerLevel(mood.anger);
      setTrustLevel(mood.trust);
      setMessages([{ id: 'npc-1', sender: 'npc', text: notificationContext.opening }]);
      sessionStorage.removeItem('dialog-terbuka-notification');
    } catch {
      setContext(DEFAULT_CONTEXT);
    }
  }, []);

  // Auto-scroll ke bawah saat pesan baru masuk
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const regenerateChoices = () => {
    if (refreshCount >= 3 || loading || status !== 'ongoing') return;
    setChoices(randomChoices());
    setRefreshCount(count => count + 1);
  };

  const handleChoice = async (option: ChoiceOption, force = false) => {
    if (loading || (status !== 'ongoing' && !force)) return;
    setLoading(true);
    setMessages(prev => [...prev, { id: `player-${Date.now()}`, sender: 'player', text: option.text }]);
    try {
      const result = await negotiateChoice(option.choice as Choice, npcState, playerState);
      setAngerLevel(result.npc_state.anger_level);
      setTrustLevel(result.npc_state.trust_level);
      setPatience(result.npc_state.patience);
      setMemory(result.npc_state.memory);
      setBudget(result.player_state.budget);
      setStatus(result.status);
      setEvents(result.events ?? []);
      setChoices(result.choices ?? []);
      setMessages(prev => [...prev, { id: `npc-${Date.now()}`, sender: 'npc', text: result.npc_response }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: `sys-${Date.now()}`, sender: 'system', text: error instanceof Error ? error.message : 'Koneksi negosiasi gagal.' }]);
    } finally {
      setLoading(false);
    }
  };

  return mounted ? createPortal(
    <main className="isolate fixed inset-0 z-[2147483647] flex h-dvh w-screen flex-col overflow-hidden bg-[#081014] text-white font-sans">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,255,170,0.08),transparent_40%)]" />
      
      <div className="relative flex min-h-0 flex-1 flex-col">
        {/* === HEADER === */}
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-[#00FFAA]/20 bg-[#0A1A1A] px-4 py-3 sm:px-6 sm:py-4 shadow-lg z-10">
          <div className="flex min-w-0 items-center gap-3">
            <div className="shrink-0 rounded-xl border border-[#00FFAA]/30 bg-[#00FFAA]/10 p-2 text-[#00FFAA]">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-black text-white uppercase tracking-wider">
                <span id="dialog-terbuka-title">Forum Dialog Terbuka</span>
              </h3>
              <p className="text-xs text-[#6B8A8A]">Negosiasi &amp; Mediasi Massa Demonstran</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleReturn}
              className="flex shrink-0 items-center gap-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-300 transition-colors hover:border-[#00FFAA] hover:text-[#00FFAA]"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Kembali ke Permainan</span>
            </button>
          </div>
        </header>

        {/* === MAIN CONTENT AREA === */}
        <div className="flex min-h-0 flex-1 overflow-hidden">
          
          {/* --- SIDEBAR KIRI (STATUS NPC & TUNTUTAN) --- */}
          <aside className="w-full max-w-[320px] shrink-0 border-r border-[#00FFAA]/20 bg-[#0A1A1A] flex flex-col hidden md:flex">
            
            {/* Profil NPC */}
            <div className="p-6 border-b border-[#00FFAA]/10 flex flex-col items-center text-center">
              <div className="relative w-20 h-20 rounded-full border-2 border-[#00FFAA]/50 bg-[#0F2424] flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(0,255,170,0.2)]">
                <User className="w-10 h-10 text-[#00FFAA]" />
                <div className="absolute -bottom-2 -right-2 bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-[#0A1A1A] flex items-center gap-1">
                  <Flame className="w-3 h-3" /> MARAH
                </div>
              </div>
              <h4 className="font-bold text-lg text-white">Ketua Aliansi Buruh</h4>
              <p className="text-xs text-[#6B8A8A]">Perwakilan Massa Demonstran</p>
            </div>

            {/* Bar Emosi & Kepercayaan */}
            <div className="p-6 border-b border-[#00FFAA]/10 space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-rose-400 uppercase flex items-center gap-1"><Flame className="w-3 h-3"/> Kemarahan</span>
                  <span className="text-white">{angerPercent}%</span>
                </div>
                <div className="h-2 w-full bg-[#0F2424] rounded-full overflow-hidden border border-rose-500/30">
                  <div 
                    className="h-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-500" 
                    style={{ width: `${angerPercent}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-emerald-400 uppercase flex items-center gap-1"><ShieldAlert className="w-3 h-3"/> Kepercayaan</span>
                  <span className="text-white">{trustPercent}%</span>
                </div>
                <div className="h-2 w-full bg-[#0F2424] rounded-full overflow-hidden border border-[#00FFAA]/30">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-600 to-[#00FFAA] transition-all duration-500" 
                    style={{ width: `${trustPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Daftar Tuntutan */}
            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
              <h5 className="text-xs font-black text-[#6B8A8A] uppercase tracking-wider mb-4">{context.title}</h5>
              <div className="space-y-3">
                {context.demands.map((demand) => (
                  <button type="button" onClick={() => setSelectedDemand(demand)} key={demand.id} className="w-full text-left flex items-start gap-2 bg-[#0F2424] p-3 rounded-lg border border-[#00FFAA]/10 transition hover:border-[#00FFAA]/60 hover:bg-[#123333]">
                    {demand.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                    {demand.status === 'rejected' && <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />}
                    {demand.status === 'pending' && <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
                    <span className={`text-xs font-medium leading-tight ${demand.status === 'rejected' ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                      {demand.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* --- AREA CHAT (KANAN) --- */}
          <section className="flex-1 flex flex-col min-w-0 bg-[#070b14] relative">
            
            {/* Banner Peringatan Jumlah Massa Terakumulasi */}
            {totalMassa > 0 && (
              <div className="shrink-0 bg-rose-950/80 border-b border-rose-500/40 px-4 py-2 flex items-center justify-between text-xs font-bold text-rose-200">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
                  <span>
                    ⚠️ <strong className="text-white font-mono">{totalMassa.toLocaleString('id-ID')}</strong> Massa saat ini memadati jalanan.
                  </span>
                </div>
                <span className="text-[10px] uppercase tracking-wider font-mono text-rose-300">
                  {totalMassa >= 500000 ? 'Level: KRITIS / SANGAT MARAH' : totalMassa <= 50000 ? 'Level: TERKENDALI' : 'Level: GEJOLAK TINGGI'}
                </span>
              </div>
            )}

            {/* Area Pesan */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
              {messages.map((msg) => {
                if (msg.sender === 'system') {
                  return (
                    <div key={msg.id} className="flex justify-center">
                      <span className="text-[10px] font-bold text-[#6B8A8A] bg-[#0F2424] px-4 py-1.5 rounded-full uppercase tracking-widest border border-slate-700/50">
                        {msg.text}
                      </span>
                    </div>
                  );
                }

                const isPlayer = msg.sender === 'player';
                return (
                  <div key={msg.id} className={`flex ${isPlayer ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-4 sm:p-5 shadow-lg ${
                      isPlayer 
                        ? 'bg-[#00FFAA] text-[#0A1A1A] rounded-tr-sm' 
                        : 'bg-[#0F2424] border border-[#00FFAA]/30 text-[#E0E0E0] rounded-tl-sm'
                    }`}>
                      {!isPlayer && (
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-[#00FFAA]" />
                          <span className="text-xs font-black uppercase text-[#00FFAA]">Ketua Aliansi</span>
                        </div>
                      )}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* --- PANEL INPUT BAWAH --- */}
            <div className="p-4 sm:p-6 bg-[#0A1A1A] border-t border-[#00FFAA]/20 shrink-0">
              
              <div className="flex flex-wrap gap-2">
                {choices.map(option => (
                  <button key={option.choice} onClick={() => handleChoice(option)} disabled={loading || status !== 'ongoing'} className="px-3 py-2 rounded-lg bg-[#0F2424] border border-[#00FFAA]/30 text-xs font-semibold text-slate-300 hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all disabled:opacity-50">
                    {option.choice === 'HARD_POWER' && <Flame className="inline w-3.5 h-3.5 mr-1 text-rose-400" />}
                    {option.choice === 'SOFT_POWER' && <ShieldAlert className="inline w-3.5 h-3.5 mr-1 text-emerald-400" />}
                    {option.choice === 'CONCESSION' && <Target className="inline w-3.5 h-3.5 mr-1 text-blue-400" />}
                    {option.text}
                  </button>
                ))}
              </div>
              <button onClick={regenerateChoices} disabled={refreshCount >= 3 || loading || status !== 'ongoing'} className="mt-3 inline-flex items-center gap-1 rounded-lg border border-[#00FFAA]/30 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-[#00FFAA] hover:text-[#00FFAA] disabled:cursor-not-allowed disabled:opacity-40">
                <RefreshCw className="h-3.5 w-3.5" /> Ganti jawaban ({3 - refreshCount} tersisa)
              </button>
              <button 
                type="button"
                onClick={() => {
                  if (onOpenBubarkanMassa) {
                    onOpenBubarkanMassa();
                  } else {
                    setIsBubarkanModalOpen(true);
                  }
                }} 
                disabled={loading} 
                className="mt-3 ml-2 inline-flex items-center gap-1 rounded-lg border border-rose-500/40 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:border-rose-400 hover:text-rose-200 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Flame className="h-3.5 w-3.5 text-rose-400" /> Bubarkan massa
              </button>
              {events.map(event => <p key={event} className="mt-3 text-xs font-semibold text-rose-300">Peringatan: {event}</p>)}
            </div>
            
          </section>
        </div>
      </div>
      {selectedDemand && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedDemand(null)}>
          <div className="w-full max-w-md rounded-2xl border border-[#00FFAA]/30 bg-[#0A1A1A] p-6 shadow-2xl animate-in slide-in-from-bottom-3 duration-200" onClick={event => event.stopPropagation()}>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#00FFAA]">Perubahan kebijakan</p>
            <h3 className="mt-2 text-lg font-bold text-white">{selectedDemand.text}</h3>
            <p className="mt-3 text-sm text-slate-400">Terapkan tuntutan ini sekarang untuk meredakan aksi yang sedang berlangsung.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setSelectedDemand(null)} className="rounded-lg px-3 py-2 text-xs text-slate-400 hover:text-white">Batal</button>
              <button type="button" onClick={() => { const id = selectedDemand.id; setContext(previous => ({ ...previous, demands: previous.demands.map(demand => demand.id === id ? { ...demand, status: 'completed' } : demand) })); setAngerLevel(level => Math.max(0, level - 8)); setTrustLevel(level => Math.min(100, level + 8)); setMessages(previous => [...previous, { id: `system-${Date.now()}`, sender: 'system', text: `Perubahan diterapkan: ${selectedDemand.text}` }]); setSelectedDemand(null); }} className="rounded-lg bg-[#00FFAA] px-3 py-2 text-xs font-bold text-[#071414] hover:bg-[#72ffd0]">Terapkan sekarang</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pilihan Metode Bubarkan Massa (5 Opsi) */}
      <MenuBubarkanMassaModal
        isOpen={isBubarkanModalOpen}
        currentBudget={currentBudget}
        onClose={() => setIsBubarkanModalOpen(false)}
        onSelectOption={(option) => {
          setIsBubarkanModalOpen(false);
          if (onExecuteBubarkanOption) {
            onExecuteBubarkanOption(option);
          } else {
            handleChoice({ choice: 'HARD_POWER', text: `Kerahkan operasi: ${option.title}` }, true);
          }
        }}
      />
    </main>,
    document.body
  ) : null;
}