import { Activity, Eye, HandCoins, ShieldAlert, Siren } from 'lucide-react';
import { getCorruptionMetrics, getExposureChance, type CorruptionCountryDetail } from '../logic/corruptionLogic';

export default function IndeksKorupsiCard({ countryDetail }: { countryDetail: CorruptionCountryDetail }) {
  const metrics = getCorruptionMetrics(countryDetail);
  const exposureChance = getExposureChance(countryDetail);
  const indexColor = metrics.index >= 70 ? 'text-rose-400' : metrics.index >= 40 ? 'text-amber-300' : 'text-[#00FFAA]';
  const barColor = metrics.index >= 70 ? 'bg-rose-400' : metrics.index >= 40 ? 'bg-amber-300' : 'bg-[#00FFAA]';

  return (
    <section className="rounded-2xl border border-[#00FFAA]/20 bg-[#0A1A1A] p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-xl border border-[#00FFAA]/25 bg-[#00FFAA]/10 p-2 text-[#00FFAA]">
          <Activity className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-black text-[#E0E0E0]">Indeks Korupsi Nasional</h3>
          <p className="text-xs text-[#6B8A8A]">Skor tinggi berarti korupsi lebih meluas; audit membantu mengungkap skandal.</p>
        </div>
      </div>
      <div className="mb-2 flex items-end justify-between">
        <span className={`text-4xl font-black ${indexColor}`}>{Math.round(metrics.index)}<span className="text-lg">/100</span></span>
        <span className="text-xs font-bold text-[#6B8A8A]">Paparan skandal: {exposureChance}% / bulan</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#102727]">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${metrics.index}%` }} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-5">
        <div className="flex items-center gap-2 rounded-lg bg-[#0F2424] p-3 text-xs">
          <Eye className="h-4 w-4 text-sky-300" />
          <span className="text-[#9DB5B5]">Cakupan audit</span>
          <strong className="ml-auto text-white">{Math.round(metrics.auditCoverage)}%</strong>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-[#0F2424] p-3 text-xs">
          <ShieldAlert className="h-4 w-4 text-amber-300" />
          <span className="text-[#9DB5B5]">Kasus aktif</span>
          <strong className="ml-auto text-white">{metrics.scandals.filter(scandal => !scandal.resolved).length}</strong>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-[#0F2424] p-3 text-xs">
          <HandCoins className="h-4 w-4 text-amber-300" />
          <span className="text-[#9DB5B5]">Risiko suap</span>
          <strong className="ml-auto text-white">{metrics.bribeRisk}%</strong>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-[#0F2424] p-3 text-xs">
          <HandCoins className="h-4 w-4 text-orange-300" />
          <span className="text-[#9DB5B5]">Kickback kontrak</span>
          <strong className="ml-auto text-white">{metrics.kickbackRate}%</strong>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-[#0F2424] p-3 text-xs">
          <Siren className="h-4 w-4 text-rose-300" />
          <span className="text-[#9DB5B5]">Peluang OTT</span>
          <strong className="ml-auto text-white">{metrics.ottChance}%</strong>
        </div>
      </div>
    </section>
  );
}
