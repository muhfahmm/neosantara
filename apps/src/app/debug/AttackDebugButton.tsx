'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { COUNTRIES_DATA, type CountryData } from '../page/map_system/map-data';
import {
  buildReport,
  configureAttackDebugContext,
  getAttackDebugRunInfo,
  getRouteGeometry,
  markAttackDebugRouteShown,
  observeAttackOutcome,
  triggerAiVsAiDebugScenario,
  triggerAttackOnPlayer,
  type AttackDebugReport,
  type AttackDebugResult,
  type AttackDebugStatus,
  type DebugNotification,
} from './attackDebugLogic';
import { AttackDebugOverlay } from './AttackDebugOverlay';

type AttackDebugButtonProps = {
  selectedCountry: CountryData | null;
  countryDetail: unknown;
};

type LogEntry = { time: string; message: string };
const isDevelopment = process.env.NODE_ENV !== 'production';
const normalizeCountryName = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const subscribeClientState = () => () => {};
const getClientState = () => true;
const getServerClientState = () => false;

export function AttackDebugButton({ selectedCountry, countryDetail }: AttackDebugButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [attacker, setAttacker] = useState('random');
  const [withMandate, setWithMandate] = useState(false);
  const [showRoute, setShowRoute] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [runStatus, setRunStatus] = useState('Belum dijalankan');
  const [report, setReport] = useState<AttackDebugReport | null>(null);
  const [result, setResult] = useState<AttackDebugResult | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [copyStatus, setCopyStatus] = useState('');
  const [overlayRoute, setOverlayRoute] = useState<ReturnType<typeof getRouteGeometry>>(null);
  const [durationMs, setDurationMs] = useState(3500);
  const portalReady = useSyncExternalStore(
    subscribeClientState,
    getClientState,
    getServerClientState
  );
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const generation = useRef(0);
  const countryName = useMemo(() => {
    if (!countryDetail || typeof countryDetail !== 'object') return selectedCountry?.country ?? '';
    const detail = countryDetail as Record<string, unknown>;
    const name = detail.country ?? detail.nama_negara ?? detail.name_id ?? detail.name_en;
    return typeof name === 'string' ? name : selectedCountry?.country ?? '';
  }, [countryDetail, selectedCountry]);

  useEffect(() => {
    configureAttackDebugContext(selectedCountry, countryDetail);
  }, [countryDetail, selectedCountry]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!activeRunId) return;
    const handleWarStatus = (event: Event) => {
      const status = (event as CustomEvent<AttackDebugStatus>).detail;
      if (status?.runId === activeRunId && status.status === 'cancelled') {
        setOverlayRoute(null);
      }
    };
    window.addEventListener('neosantara_debug_war_status', handleWarStatus);
    return () => window.removeEventListener('neosantara_debug_war_status', handleWarStatus);
  }, [activeRunId]);

  const addLog = useCallback((message: string) => {
    setLogs(previous => [...previous, {
      time: new Date().toLocaleTimeString('id-ID', { hour12: false }),
      message,
    }]);
  }, []);
  const clearOverlay = useCallback(() => setOverlayRoute(null), []);

  const runAttack = useCallback(async () => {
    if (isRunning) {
      addLog('Serangan lain masih dalam observasi; permintaan baru diabaikan.');
      return;
    }
    if (!countryName) {
      setRunStatus('Negara pemain belum dipilih.');
      addLog('Gagal: negara pemain belum tersedia.');
      return;
    }

    const currentGeneration = ++generation.current;
    setIsRunning(true);
    setReport(null);
    setResult(null);
    setRunStatus('Menyiapkan serangan...');
    try {
      const runId = triggerAttackOnPlayer({
        attacker,
        withMandate,
        showRoute,
      });
      if (!runId) throw new Error('Debug serangan tidak tersedia.');
      setActiveRunId(runId);
      const runInfo = getAttackDebugRunInfo(runId);
      const selectedAttacker = runInfo?.attacker ?? attacker;
      const route = showRoute && runInfo &&
        typeof document !== 'undefined' &&
        document.getElementById('map-canvas') instanceof HTMLCanvasElement
        ? getRouteGeometry(runInfo.attacker, runInfo.target)
        : null;
      if (route) markAttackDebugRouteShown(runId);
      setOverlayRoute(route);
      setRunStatus(`Berjalan: ${selectedAttacker} → ${runInfo?.target ?? countryName}`);
      addLog(`Serangan dimulai oleh ${selectedAttacker} menuju ${runInfo?.target ?? countryName}${withMandate ? ' (menggunakan mandat PBB yang aktif bila tersedia)' : ' (tanpa mandat; pembatalan acak dilewati)'}.`);
      if (showRoute && !route) addLog('Rute tidak tersedia: koordinat salah satu negara tidak ditemukan.');
      const outcome = await observeAttackOutcome(runId);
      if (currentGeneration !== generation.current) return;
      if (outcome.cancellationReason) setOverlayRoute(null);
      setResult(outcome);
      const finalReport = buildReport(outcome);
      setReport(finalReport);
      setRunStatus(outcome.cancellationReason
        ? `Dibatalkan: ${outcome.cancellationReason}`
        : outcome.activeWarAnimation
          ? 'Serangan diproses; animasi perang teramati.'
          : outcome.queued
            ? 'Serangan masuk antrean.'
            : 'Jendela observasi selesai.');
      addLog(outcome.cancellationReason
        ? `Serangan dibatalkan: ${outcome.cancellationReason}`
        : `Observasi selesai: ${finalReport.summary}`);
      if (outcome.notifications.length > 0) {
        addLog(`${outcome.notifications.length} notifikasi baru teramati di Inbox.`);
      }
    } catch (error) {
      if (currentGeneration !== generation.current) return;
      const message = error instanceof Error ? error.message : 'Kesalahan debug tidak diketahui.';
      setRunStatus(`Gagal: ${message}`);
      addLog(`Gagal: ${message}`);
    } finally {
      if (currentGeneration === generation.current) setIsRunning(false);
    }
  }, [addLog, attacker, countryName, isRunning, showRoute, withMandate]);

  const runAiVsAi = useCallback(async () => {
    if (isRunning) {
      addLog('Serangan lain masih dalam observasi; permintaan AI vs AI diabaikan.');
      return;
    }

    const currentGeneration = ++generation.current;
    setIsRunning(true);
    setReport(null);
    setResult(null);
    setRunStatus('Menyiapkan skenario AI vs AI...');
    try {
      const runId = triggerAiVsAiDebugScenario();
      if (!runId) throw new Error('Debug serangan tidak tersedia.');
      setActiveRunId(runId);
      const runInfo = getAttackDebugRunInfo(runId);
      addLog(`Uji AI vs AI dimulai: ${runInfo?.attacker ?? 'AI'} menyerang ${runInfo?.target ?? 'AI'}.`);
      const outcome = await observeAttackOutcome(runId);
      if (currentGeneration !== generation.current) return;
      setResult(outcome);
      const finalReport = buildReport(outcome);
      setReport(finalReport);
      setRunStatus(outcome.warEnded
        ? 'Uji AI vs AI selesai.'
        : outcome.cancellationReason
          ? `Dibatalkan: ${outcome.cancellationReason}`
          : 'Jendela observasi selesai.');
      addLog(`Uji AI vs AI selesai: ${finalReport.summary}`);
    } catch (error) {
      if (currentGeneration !== generation.current) return;
      const message = error instanceof Error ? error.message : 'Kesalahan debug tidak diketahui.';
      setRunStatus(`Gagal: ${message}`);
      addLog(`Gagal: ${message}`);
    } finally {
      if (currentGeneration === generation.current) setIsRunning(false);
    }
  }, [addLog, isRunning]);

  const resetLog = () => {
    generation.current += 1;
    setActiveRunId(null);
    setIsRunning(false);
    setRunStatus('Log direset');
    setReport(null);
    setResult(null);
    setLogs([]);
    setOverlayRoute(null);
    setCopyStatus('');
  };

  const copyReport = async () => {
    const text = report
      ? [
          report.summary,
          ...report.checks.map(check => `${check.passed ? '[LULUS]' : '[GAGAL]'} ${check.label}: ${check.detail}`),
          ...(result?.notifications.map(notification => `Notifikasi: ${notification.title ?? notification.id} — ${notification.sender ?? ''}`) ?? []),
        ].join('\n')
      : logs.map(entry => `[${entry.time}] ${entry.message}`).join('\n');
    try {
      await navigator.clipboard.writeText(text || 'Belum ada hasil debug.');
      setCopyStatus('Laporan disalin.');
    } catch (error) {
      console.error('[AttackDebug] Gagal menyalin laporan.', error);
      setCopyStatus('Gagal menyalin laporan. Periksa izin clipboard browser.');
    }
  };

  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isLandscapePhone = window.matchMedia('(orientation: landscape) and (max-height: 500px)').matches;
      const isPortraitPhone = window.matchMedia('(orientation: portrait) and (max-width: 640px)').matches;
      setIsMobileDevice(isLandscapePhone || isPortraitPhone);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  if (!isDevelopment || isMobileDevice) return null;

  const panel = isOpen && portalReady ? createPortal(
    <div
      role="dialog"
      aria-label="Panel debug serangan"
      className="fixed right-3 top-16 z-[230] max-h-[calc(100vh-5rem)] w-[min(94vw,440px)] overflow-y-auto rounded-xl border border-[#00FFAA]/50 bg-[#0F2424] p-4 text-[#E0E0E0] shadow-2xl"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-black tracking-wide text-[#00FFAA]">DEBUG SERANGAN AI</h2>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label="Tutup panel debug"
          className="rounded px-2 py-1 text-xs text-[#00FFAA] hover:bg-[#00FFAA]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FFAA]"
        >
          Tutup
        </button>
      </div>

      <div className="space-y-3 text-xs">
        <label className="block space-y-1">
          <span className="font-bold text-[#9AB6B3]">Negara penyerang</span>
          <select
            aria-label="Pilih negara penyerang"
            value={attacker}
            onChange={event => setAttacker(event.target.value)}
            className="w-full rounded-md border border-[#00FFAA]/30 bg-[#0A1A1A] px-2 py-2 text-[#E0E0E0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FFAA]"
          >
            <option value="random">Acak</option>
            {COUNTRIES_DATA.filter(country =>
              country.iso !== selectedCountry?.iso &&
              normalizeCountryName(country.country) !== normalizeCountryName(countryName)
            ).map(country => (
              <option key={`${country.iso}-${normalizeCountryName(country.country)}`} value={country.country}>{country.country}</option>
            ))}
          </select>
        </label>

        <label className="flex items-center justify-between gap-3 rounded-md border border-[#00FFAA]/15 bg-[#0A1A1A] px-3 py-2">
          <span>Dengan mandat PBB</span>
          <input
            aria-label="Dengan mandat PBB"
            type="checkbox"
            checked={withMandate}
            onChange={event => setWithMandate(event.target.checked)}
            className="accent-[#00FFAA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FFAA]"
          />
        </label>
        <label className="flex items-center justify-between gap-3 rounded-md border border-[#00FFAA]/15 bg-[#0A1A1A] px-3 py-2">
          <span>Tampilkan tank &amp; rute</span>
          <input
            aria-label="Tampilkan tank dan rute"
            type="checkbox"
            checked={showRoute}
            onChange={event => setShowRoute(event.target.checked)}
            className="accent-[#00FFAA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FFAA]"
          />
        </label>
        <label className="block space-y-1">
          <span className="flex justify-between font-bold text-[#9AB6B3]">
            Durasi tank <span>{(durationMs / 1000).toFixed(1)} dtk</span>
          </span>
          <input
            aria-label="Durasi animasi tank"
            type="range"
            min="1500"
            max="8000"
            step="250"
            value={durationMs}
            onChange={event => setDurationMs(Number(event.target.value))}
            className="w-full accent-[#FF2D55] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FFAA]"
          />
        </label>

        <p className="rounded-md bg-[#0A1A1A] p-2 text-[#9AB6B3]">
          Pemain: <strong className="text-white">{countryName || 'belum dipilih'}</strong>
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void runAttack()}
            disabled={isRunning || !countryName}
            aria-label="Serang negara pemain"
            className="flex-1 rounded-md bg-[#FF2D55] px-3 py-2 font-black text-white hover:bg-[#ff496c] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            {isRunning ? 'SERANGAN BERJALAN...' : 'SERANG SAYA'}
          </button>
          <button
            type="button"
            onClick={() => void copyReport()}
            aria-label="Salin laporan debug"
            className="rounded-md border border-[#00FFAA]/40 px-3 py-2 font-bold text-[#00FFAA] hover:bg-[#00FFAA]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FFAA]"
          >
            Salin Laporan
          </button>
        </div>
        <button
          type="button"
          onClick={() => void runAiVsAi()}
          disabled={isRunning}
          aria-label="Uji perang AI melawan AI tanpa modal"
          className="w-full rounded-md border border-[#00FFAA]/40 px-3 py-2 font-bold text-[#00FFAA] hover:bg-[#00FFAA]/10 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FFAA]"
        >
          UJI AI VS AI: TANPA MODAL
        </button>
        <button
          type="button"
          onClick={resetLog}
          aria-label="Reset log debug"
          className="w-full rounded-md border border-white/15 px-3 py-1.5 text-[#B8C6C4] hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FFAA]"
        >
          Reset log
        </button>
        {copyStatus && <p role="status" className="text-[#00FFAA]">{copyStatus}</p>}

        <section aria-live="polite" className="space-y-2 border-t border-[#00FFAA]/20 pt-3">
          <p className="font-bold text-white">{runStatus}</p>
          {report && (
            <div className="space-y-1.5">
              <p className="font-black text-[#00FFAA]">{report.summary}</p>
              {report.checks.map(check => (
                <div key={check.label} className={`rounded-md border p-2 ${check.passed ? 'border-emerald-500/30 bg-emerald-950/30' : 'border-rose-500/30 bg-rose-950/30'}`}>
                  <p className={`font-bold ${check.passed ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {check.passed ? '✓' : '✗'} {check.label}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#C2CECC]">{check.detail}</p>
                </div>
              ))}
            </div>
          )}
          {result && result.notifications.length > 0 && (
            <div className="rounded-md border border-[#00FFAA]/20 bg-[#0A1A1A] p-2">
              <p className="mb-1 font-bold text-[#00FFAA]">Notifikasi baru</p>
              {result.notifications.map(notification => (
                <NotificationRow key={notification.id} notification={notification} />
              ))}
            </div>
          )}
          <div className="max-h-32 space-y-1 overflow-y-auto rounded-md bg-[#071313] p-2 font-mono text-[10px] text-[#A7B9B7]">
            {logs.length === 0 ? <p>Log kronologis kosong.</p> : logs.map((entry, index) => (
              <p key={`${entry.time}-${index}`}>[{entry.time}] {entry.message}</p>
            ))}
          </div>
        </section>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(value => !value)}
        aria-label="Buka debug serangan"
        aria-expanded={isOpen}
        className="rounded-lg border border-[#FF2D55]/60 bg-[#0F2424] px-1.5 py-1.5 text-[8px] font-black tracking-wide text-[#FF647F] transition-colors hover:bg-[#FF2D55]/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00FFAA] min-[1920px]:px-2.5 min-[1920px]:py-2 min-[1920px]:text-[9px]"
      >
        DEBUG SERANG
      </button>
      {panel}
      {overlayRoute && (
        <AttackDebugOverlay
          route={overlayRoute}
          durationMs={durationMs}
          onComplete={clearOverlay}
        />
      )}
    </>
  );
}

function NotificationRow({ notification }: { notification: DebugNotification }) {
  return (
    <p className="border-t border-white/5 py-1 text-[11px]">
      <span className="font-bold text-white">{notification.title ?? notification.tradeType ?? notification.id}</span>
      {notification.sender && <span className="text-[#9AB6B3]"> — {notification.sender}</span>}
    </p>
  );
}
