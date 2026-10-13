'use client';

import { useState } from 'react';
import { AlertCircle, Landmark, X, Activity, Building2, Search, ScrollText, ShieldCheck } from 'lucide-react';
import IndeksKorupsiCard from './components/IndeksKorupsiCard';
import LembagaAntikorupsiPanel from './components/LembagaAntikorupsiPanel';
import SkandalAktifList from './components/SkandalAktifList';
import DampakSektorCard from './components/DampakSektorCard';
import {
  conductBudgetAudit,
  improveWhistleblowerProtection,
  upgradeAntiCorruptionAgency,
} from './logic/auditLogic';
import { getCorruptionMetrics, type CorruptionCountryDetail } from './logic/corruptionLogic';
import { investigateScandal, prosecuteScandal } from './logic/scandalLogic';

type CorruptionTab = 'ringkasan' | 'lembaga' | 'penyelidikan' | 'kasus' | 'dampak';

interface KorupsiMenuProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail: CorruptionCountryDetail | null;
  setCountryDetail: (detail: CorruptionCountryDetail) => void;
  currentDate?: Date;
  setPresidentRating?: (rating: number) => void;
}

export default function KorupsiMenu({
  isOpen,
  onClose,
  countryDetail,
  setCountryDetail,
  currentDate,
  setPresidentRating,
}: KorupsiMenuProps) {
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [activeTab, setActiveTab] = useState<CorruptionTab>('ringkasan');
  if (!isOpen || !countryDetail) return null;

  const runAction = (action: (detail: CorruptionCountryDetail, date: Date) => {
    updatedDetail: CorruptionCountryDetail;
    message: string;
    cost: number;
  } | null) => {
    if (busy) return;
    setBusy(true);
    try {
      const result = action(countryDetail, currentDate ?? new Date());
      if (!result) {
        setNotice('Aksi tidak tersedia: periksa anggaran, level, atau apakah audit bulan ini sudah dilakukan.');
        return;
      }
      setCountryDetail(result.updatedDetail);
      if (typeof result.updatedDetail.presidentRating === 'number') {
        setPresidentRating?.(result.updatedDetail.presidentRating);
      }
      setNotice(result.message);
    } finally {
      setBusy(false);
    }
  };

  const runInvestigation = (scandalId: string, action: typeof investigateScandal | typeof prosecuteScandal) => {
    if (busy) return;
    setBusy(true);
    try {
      const result = action(countryDetail, scandalId, currentDate ?? new Date());
      if (!result) {
        setNotice('Kasus tidak dapat diproses. Pastikan bukti tersedia untuk penuntutan dan anggaran mencukupi untuk penyelidikan.');
        return;
      }
      setCountryDetail(result.updatedDetail);
      if (typeof result.updatedDetail.presidentRating === 'number') {
        setPresidentRating?.(result.updatedDetail.presidentRating);
      }
      setNotice(result.message);
    } finally {
      setBusy(false);
    }
  };

  const activeCases = getCorruptionMetrics(countryDetail).scandals.filter(scandal => !scandal.resolved).length;
  const tabs: { id: CorruptionTab; label: string; icon: typeof Activity }[] = [
    { id: 'ringkasan', label: 'Ringkasan', icon: Activity },
    { id: 'lembaga', label: 'Lembaga & Reformasi', icon: ShieldCheck },
    { id: 'penyelidikan', label: 'Audit & Penyelidikan', icon: Search },
    { id: 'kasus', label: `Daftar Kasus (${activeCases})`, icon: ScrollText },
    { id: 'dampak', label: 'Dampak Sektor', icon: Building2 },
  ];

  return (
    <div className="pointer-events-none fixed inset-0 z-[200] flex items-center justify-center px-4 pb-4 pt-[100px] sm:px-8 sm:pb-5 sm:pt-[110px]">
      <div className="pointer-events-auto relative flex h-full max-h-[calc(100vh-125px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#00FFAA]/30 bg-[#0F2424] font-sans shadow-2xl sm:max-h-[calc(100vh-138px)] lg:max-w-[920px] lg:max-h-[calc(100vh-145px)] xl:max-w-[1020px]">
        <header className="relative z-10 flex shrink-0 items-center justify-between border-b border-[#00FFAA]/30 bg-[#0A1A1A] px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-[#00FFAA]/30 bg-[#00FFAA]/10 p-2 text-[#00FFAA]">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wide text-[#E0E0E0] sm:text-base">Pemberantasan Korupsi</h2>
              <p className="text-xs text-[#6B8A8A]">{String(countryDetail.nama_negara ?? countryDetail.country ?? 'Pemerintahan nasional')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup menu pemberantasan korupsi"
            className="rounded-lg p-2 text-[#8BA3A3] transition hover:bg-[#00FFAA]/10 hover:text-[#00FFAA]"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <nav aria-label="Bagian pemberantasan korupsi" className="flex shrink-0 gap-1 overflow-x-auto border-b border-[#00FFAA]/15 bg-[#0A1A1A] px-3 py-2 sm:px-5">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              aria-current={activeTab === id ? 'page' : undefined}
              onClick={() => setActiveTab(id)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition ${activeTab === id ? 'bg-[#00FFAA] text-[#0A1A1A]' : 'text-[#8BA3A3] hover:bg-[#00FFAA]/10 hover:text-[#00FFAA]'}`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>

        <main className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
          {notice && (
            <div role="status" className="flex items-start gap-2 rounded-xl border border-[#00FFAA]/20 bg-[#00FFAA]/5 px-4 py-3 text-sm text-[#B7F5DD]">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#00FFAA]" />
              <span>{notice}</span>
            </div>
          )}
          {(activeTab === 'ringkasan' || activeTab === 'penyelidikan') && (
            <IndeksKorupsiCard countryDetail={countryDetail} />
          )}
          {activeTab === 'ringkasan' && (
            <div className="rounded-2xl border border-[#00FFAA]/15 bg-[#0A1A1A] p-5">
              <div className="mb-2 flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#00FFAA]" />
                <h3 className="text-sm font-black text-white">Situasi pemerintahan</h3>
              </div>
              <p className="text-sm leading-relaxed text-[#9DB5B5]">
                Ada <strong className="text-white">{activeCases}</strong> skandal aktif. Audit dan perlindungan pelapor meningkatkan peluang menemukan bukti; kasus yang belum dituntaskan terus menimbulkan dampak sektoral.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => setActiveTab('lembaga')} className="rounded-lg border border-[#00FFAA]/20 px-3 py-2 text-xs font-bold text-[#00FFAA] hover:bg-[#00FFAA]/10">Kelola lembaga</button>
                <button type="button" onClick={() => setActiveTab('kasus')} className="rounded-lg border border-[#00FFAA]/20 px-3 py-2 text-xs font-bold text-[#00FFAA] hover:bg-[#00FFAA]/10">Buka daftar kasus</button>
              </div>
            </div>
          )}
          {(activeTab === 'lembaga' || activeTab === 'penyelidikan') && (
            <LembagaAntikorupsiPanel
              countryDetail={countryDetail}
              currentDate={currentDate}
              busy={busy}
              onUpgradeAgency={() => runAction(upgradeAntiCorruptionAgency)}
              onImproveProtection={() => runAction(improveWhistleblowerProtection)}
              onAudit={() => runAction(conductBudgetAudit)}
            />
          )}
          {(activeTab === 'kasus' || activeTab === 'penyelidikan') && (
            <SkandalAktifList
              countryDetail={countryDetail}
              busy={busy}
              onInvestigate={scandalId => runInvestigation(scandalId, investigateScandal)}
              onProsecute={scandalId => runInvestigation(scandalId, prosecuteScandal)}
            />
          )}
          {(activeTab === 'dampak' || activeTab === 'ringkasan') && (
            <DampakSektorCard countryDetail={countryDetail} />
          )}
        </main>
      </div>
    </div>
  );
}
