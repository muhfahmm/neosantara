import { Eye, ShieldCheck, UserRoundSearch } from 'lucide-react';
import { formatCorruptionCurrency, getCorruptionMetrics, type CorruptionCountryDetail } from '../logic/corruptionLogic';

interface LembagaAntikorupsiPanelProps {
  countryDetail: CorruptionCountryDetail;
  busy: boolean;
  currentDate?: Date;
  onUpgradeAgency: () => void;
  onImproveProtection: () => void;
  onAudit: () => void;
}

export default function LembagaAntikorupsiPanel({
  countryDetail,
  busy,
  currentDate,
  onUpgradeAgency,
  onImproveProtection,
  onAudit,
}: LembagaAntikorupsiPanelProps) {
  const metrics = getCorruptionMetrics(countryDetail);
  const budget = Math.max(0, Number(countryDetail.anggaran) || 0);
  const agencyCost = Math.round(25_000 * (metrics.agencyLevel + 1) ** 1.65);
  const protectionCost = Math.round(15_000 * (metrics.whistleblowerProtection + 1) ** 1.55);
  const auditCost = Math.max(1_000, Math.round(budget * 0.002));
  const currentMonth = (currentDate ?? new Date()).toISOString().slice(0, 7);

  const actions = [
    {
      title: 'Perkuat lembaga antikorupsi',
      description: 'Tambah kapasitas penyidikan dan turunkan indeks korupsi.',
      level: metrics.agencyLevel,
      max: 10,
      cost: agencyCost,
      icon: ShieldCheck,
      action: onUpgradeAgency,
    },
    {
      title: 'Lindungi pelapor',
      description: 'Dorong pelaporan aman dan tingkatkan peluang pengungkapan.',
      level: metrics.whistleblowerProtection,
      max: 10,
      cost: protectionCost,
      icon: UserRoundSearch,
      action: onImproveProtection,
    },
  ];

  return (
    <section className="space-y-3 rounded-2xl border border-[#00FFAA]/20 bg-[#0A1A1A] p-5">
      <div className="mb-1 flex items-center gap-3">
        <ShieldCheck className="h-5 w-5 text-[#00FFAA]" />
        <div>
          <h3 className="font-black text-[#E0E0E0]">Lembaga Antikorupsi & Audit</h3>
        </div>
      </div>
      {actions.map(({ title, description, level, max, cost, icon: Icon, action }) => (
        <div key={title} className="flex flex-col gap-3 rounded-xl border border-[#00FFAA]/10 bg-[#0F2424] p-4 sm:flex-row sm:items-center">
          <Icon className="h-5 w-5 shrink-0 text-[#00FFAA]" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-bold text-white">{title}</h4>
              <span className="rounded-md bg-[#00FFAA]/10 px-2 py-0.5 text-[10px] font-bold text-[#00FFAA]">Level {level}/{max}</span>
            </div>
            <p className="mt-1 text-xs text-[#8BA3A3]">{description}</p>
          </div>
          <button
            type="button"
            disabled={busy || level >= max || budget < cost}
            onClick={action}
            className="shrink-0 rounded-lg border border-[#00FFAA]/30 bg-[#00FFAA]/10 px-3 py-2 text-xs font-bold text-[#00FFAA] transition hover:bg-[#00FFAA]/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {level >= max ? 'Maksimal' : `Tingkatkan · ${formatCorruptionCurrency(cost)}`}
          </button>
        </div>
      ))}

      <div className="flex flex-col gap-3 rounded-xl border border-sky-400/20 bg-sky-950/20 p-4 sm:flex-row sm:items-center">
        <Eye className="h-5 w-5 shrink-0 text-sky-300" />
        <div className="flex-1">
          <h4 className="text-sm font-bold text-white">Audit anggaran nasional</h4>
          <p className="mt-1 text-xs text-[#8BA3A3]">Cakupan audit naik hingga 15%, menurunkan indeks, dan dapat menindaklanjuti skandal aktif.</p>
        </div>
        <button
          type="button"
          disabled={busy || metrics.auditCoverage >= 100 || countryDetail.corruption_last_audit_month === currentMonth || budget < auditCost}
          onClick={onAudit}
          className="shrink-0 rounded-lg border border-sky-400/30 bg-sky-400/10 px-3 py-2 text-xs font-bold text-sky-200 transition hover:bg-sky-400/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {metrics.auditCoverage >= 100 ? 'Cakupan penuh' : countryDetail.corruption_last_audit_month === currentMonth ? 'Sudah audit bulan ini' : `Audit · ${formatCorruptionCurrency(auditCost)}`}
        </button>
      </div>
    </section>
  );
}
