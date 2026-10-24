'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, MessageSquare, ShieldAlert, CheckCircle2, XCircle, 
  Clock, Send, Flame, User, ChevronRight, Zap, Target
} from 'lucide-react';

interface DialogTerbukaMenuProps {
  returnHref: string;
}

// --- MOCK DATA (Untuk Prototipe) ---
const MOCK_DEMANDS = [
  { id: 1, text: 'Subsidi Beras dikembalikan 100%', status: 'pending' },
  { id: 2, text: 'Penurunan Tarif PPN menjadi 5%', status: 'rejected' },
  { id: 3, text: 'Bantuan Langsung Tunai 5 Juta/KK', status: 'completed' },
];

const INITIAL_MESSAGES = [
  { id: 'sys-1', sender: 'system', text: 'Sesi negosiasi dimulai. Massa demonstran menuntut keadilan ekonomi.' },
  { id: 'npc-1', sender: 'npc', text: 'Pak Presiden, kami sudah tidak sanggup lagi! Harga beras melonjak, sementara pajak mencekik kami. Cabut pajak PPN sekarang juga atau demo ini tidak akan berhenti!' },
  { id: 'player-1', sender: 'player', text: 'Saya mengerti penderitaan rakyat. Saya bersedia memberikan bantuan langsung tunai untuk meredakan situasi.' },
  { id: 'npc-2', sender: 'npc', text: 'Bantuan tunai tidak cukup! Kami butuh kebijakan struktural yang menurunkan harga pokok, bukan sekadar uang receh!' },
];

export default function DialogTerbukaMenu({ returnHref }: DialogTerbukaMenuProps) {
  // State untuk prototipe
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [angerLevel, setAngerLevel] = useState(75); // 0 - 100
  const [trustLevel, setTrustLevel] = useState(30); // 0 - 100
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll ke bawah saat pesan baru masuk
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;
    
    // Tambah pesan user
    const newMsg = { id: `player-${Date.now()}`, sender: 'player', text };
    setMessages(prev => [...prev, newMsg]);
    setInputText('');

    // Simulasi balasan AI (Dummy)
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: `npc-${Date.now()}`, 
        sender: 'npc', 
        text: 'Baiklah, kami akan mempertimbangkan tawaran Anda. Tapi ingat, jika tidak ada realisasi dalam minggu ini, kami akan turun ke jalan lagi!' 
      }]);
      setAngerLevel(prev => Math.max(0, prev - 15));
      setTrustLevel(prev => Math.min(100, prev + 10));
    }, 1500);
  };

  return (
    <main className="fixed inset-0 z-[9999999999] flex h-dvh w-screen flex-col overflow-hidden bg-[#081014] text-white font-sans">
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
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-[#6B8A8A] border-r border-[#00FFAA]/20 pr-4">
              <span>12 Okt 2026</span>
              <span className="text-[#00FFAA]">| Sesi 1</span>
            </div>
            <Link
              href={returnHref}
              className="flex shrink-0 items-center gap-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-300 transition-colors hover:border-[#00FFAA] hover:text-[#00FFAA]"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Kembali ke Permainan</span>
            </Link>
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
                  <span className="text-white">{angerLevel}%</span>
                </div>
                <div className="h-2 w-full bg-[#0F2424] rounded-full overflow-hidden border border-rose-500/30">
                  <div 
                    className="h-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-500" 
                    style={{ width: `${angerLevel}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-emerald-400 uppercase flex items-center gap-1"><ShieldAlert className="w-3 h-3"/> Kepercayaan</span>
                  <span className="text-white">{trustLevel}%</span>
                </div>
                <div className="h-2 w-full bg-[#0F2424] rounded-full overflow-hidden border border-[#00FFAA]/30">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-600 to-[#00FFAA] transition-all duration-500" 
                    style={{ width: `${trustLevel}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Daftar Tuntutan */}
            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
              <h5 className="text-xs font-black text-[#6B8A8A] uppercase tracking-wider mb-4">Daftar Tuntutan Massa</h5>
              <div className="space-y-3">
                {MOCK_DEMANDS.map((demand) => (
                  <div key={demand.id} className="flex items-start gap-2 bg-[#0F2424] p-3 rounded-lg border border-[#00FFAA]/10">
                    {demand.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                    {demand.status === 'rejected' && <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />}
                    {demand.status === 'pending' && <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
                    <span className={`text-xs font-medium leading-tight ${demand.status === 'rejected' ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                      {demand.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* --- AREA CHAT (KANAN) --- */}
          <section className="flex-1 flex flex-col min-w-0 bg-[#070b14] relative">
            
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
              
              {/* Quick Replies */}
              <div className="flex flex-wrap gap-2 mb-3">
                <button onClick={() => setInputText("Saya akan mengkaji ulang kebijakan pajak PPN.")} className="px-3 py-1.5 rounded-lg bg-[#0F2424] border border-[#00FFAA]/30 text-xs font-semibold text-slate-300 hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-blue-400" /> Tawarkan Kompromi
                </button>
                <button onClick={() => setInputText("Saya mengerti penderitaan rakyat. Mari kita duduk bersama.")} className="px-3 py-1.5 rounded-lg bg-[#0F2424] border border-[#00FFAA]/30 text-xs font-semibold text-slate-300 hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" /> Pendekatan Empati
                </button>
                <button onClick={() => setInputText("Jangan memaksa, saya bisa kerahkan aparat sekarang!")} className="px-3 py-1.5 rounded-lg bg-[#0F2424] border border-rose-500/30 text-xs font-semibold text-slate-300 hover:text-rose-400 hover:border-rose-500 transition-all flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-rose-500" /> Intimidasi
                </button>
              </div>

              {/* Input Box */}
              <div className="relative flex items-end gap-2 bg-[#0F2424] border border-[#00FFAA]/40 rounded-xl p-2 focus-within:border-[#00FFAA] focus-within:shadow-[0_0_15px_rgba(0,255,170,0.2)] transition-all">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(inputText);
                    }
                  }}
                  placeholder="Ketik respons diplomasi Anda di sini..."
                  className="w-full bg-transparent text-sm text-white placeholder-slate-500 p-2 outline-none resize-none min-h-[44px] max-h-32 custom-scrollbar"
                  rows={1}
                />
                <button 
                  onClick={() => handleSendMessage(inputText)}
                  disabled={!inputText.trim()}
                  className="shrink-0 bg-[#00FFAA] text-[#0A1A1A] p-2.5 rounded-lg mb-0.5 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <Send className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>
              <div className="flex justify-between items-center mt-2 px-1">
                <span className="text-[10px] text-slate-500">Tekan <kbd className="bg-slate-800 px-1 rounded text-slate-300">Enter</kbd> untuk mengirim.</span>
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" /> Mode Prototipe Statis
                </span>
              </div>
            </div>
            
          </section>
        </div>
      </div>
    </main>
  );
}