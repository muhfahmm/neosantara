import { AlertTriangle, CheckCircle2, Clock3, Gavel, Search } from 'lucide-react';
import { getCorruptionMetrics, type CorruptionCountryDetail } from '../logic/corruptionLogic';

interface SkandalAktifListProps {
  countryDetail: CorruptionCountryDetail;
  busy: boolean;
  onInvestigate: (scandalId: string) => void;
  onProsecute: (scandalId: string) => void;
}

export default function SkandalAktifList({
  countryDetail,
  busy,
  onInvestigate,
  onProsecute,
}: SkandalAktifListProps) {
  const scandals = [...getCorruptionMetrics(countryDetail).scandals]
    .sort((a, b) => b.exposedDate.localeCompare(a.exposedDate));

  return (
    <section className="rounded-2xl border border-[#00FFAA]/20 bg-[#0A1A1A] p-5">
      <div className="mb-4 flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-300" />
        <div>
          <h3 className="font-black text-[#E0E0E0]">Skandal & Pengungkapan</h3>
          <p className="text-xs text-[#6B8A8A]">Skandal terungkap mengikuti risiko korupsi, audit, dan perlindungan pelapor.</p>
        </div>
      </div>
      {scandals.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#00FFAA]/15 px-4 py-8 text-center text-sm text-[#6B8A8A]">
          Belum ada skandal yang terungkap. Risiko diperiksa setiap bulan simulasi.
        </div>
      ) : (
        <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
          {scandals.map(scandal => (
            <article key={scandal.id} className="rounded-xl border border-[#00FFAA]/10 bg-[#0F2424] p-3">
              <div className="flex flex-wrap items-center gap-2">
                {scandal.resolved
                  ? <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  : <AlertTriangle className="h-4 w-4 text-amber-300" />}
                <h4 className="text-sm font-bold text-white">{scandal.name}</h4>
                <span className={`ml-auto rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${scandal.severity === 'berat' ? 'bg-rose-500/15 text-rose-300' : scandal.severity === 'sedang' ? 'bg-amber-500/15 text-amber-200' : 'bg-sky-500/15 text-sky-200'}`}>
                  {scandal.severity}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#8BA3A3]">
                <span>{scandal.category}</span>
                <span className="inline-flex items-center gap-1"><Clock3 className="h-3 w-3" /> {scandal.exposedDate}</span>
                <span>Kas bocor: {Math.round(scandal.budgetLoss).toLocaleString('id-ID')} NEO</span>
                <span>Kepuasan: -{scandal.satisfactionLoss}</span>
                {!scandal.resolved && (
                  <strong className={scandal.investigationStatus === 'bukti_ditemukan' ? 'text-emerald-300' : 'text-amber-200'}>
                    {scandal.investigationStatus === 'bukti_ditemukan'
                      ? 'Bukti ditemukan'
                      : scandal.investigationStatus === 'diselidiki'
                        ? 'Dalam penyelidikan'
                        : 'Belum diselidiki'}
                  </strong>
                )}
                {scandal.resolved && <strong className="text-emerald-300">Ditindaklanjuti · {scandal.resolvedDate}</strong>}
              </div>
              {!scandal.resolved && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busy || scandal.investigationStatus === 'bukti_ditemukan'}
                    onClick={() => onInvestigate(scandal.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-sky-400/25 bg-sky-400/10 px-3 py-1.5 text-xs font-bold text-sky-200 transition hover:bg-sky-400/20 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Search className="h-3.5 w-3.5" />
                    {scandal.investigationStatus === 'bukti_ditemukan' ? 'Siap dituntut' : 'Selidiki kasus'}
                  </button>
                  {scandal.investigationStatus === 'bukti_ditemukan' && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onProsecute(scandal.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/25 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-200 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Gavel className="h-3.5 w-3.5" />
                      Tuntut & pulihkan dana
                    </button>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
