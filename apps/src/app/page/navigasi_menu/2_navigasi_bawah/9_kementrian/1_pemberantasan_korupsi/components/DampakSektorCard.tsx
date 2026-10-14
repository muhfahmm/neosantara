import { Building2, Globe2, HeartPulse, Shield, Wallet } from 'lucide-react';
import { getActiveSectorImpacts, type CorruptionCountryDetail } from '../logic/corruptionLogic';

export default function DampakSektorCard({ countryDetail }: { countryDetail: CorruptionCountryDetail }) {
  const impacts = getActiveSectorImpacts(countryDetail);
  const sectors = [
    { title: 'Penerimaan pajak', value: `-${impacts.taxRevenueLossPercent}%`, detail: 'Kebocoran akibat suap dan penyelewengan pajak', icon: Wallet, color: 'text-amber-300' },
    { title: 'Efektivitas militer', value: `-${impacts.militaryEffectivenessLossPercent}%`, detail: 'Pengadaan dan logistik pertahanan bermasalah', icon: Shield, color: 'text-orange-300' },
    { title: 'Layanan publik', value: `-${impacts.publicServiceLossPercent}%`, detail: 'Dampak pada bantuan, kesehatan, dan pendidikan', icon: HeartPulse, color: 'text-rose-300' },
    { title: 'Reputasi internasional', value: `${impacts.internationalReputationScore}/100`, detail: `Potensi dampak kasus aktif: -${impacts.internationalReputationLoss} poin`, icon: Globe2, color: 'text-sky-300' },
  ];

  return (
    <section className="rounded-2xl border border-[#00FFAA]/20 bg-[#0A1A1A] p-5">
      <div className="mb-4 flex items-center gap-3">
        <Building2 className="h-5 w-5 text-[#00FFAA]" />
        <div>
          <h3 className="font-black text-[#E0E0E0]">Dampak Skandal per Sektor</h3>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {sectors.map(({ title, value, detail, icon: Icon, color }) => (
          <div key={title} className="flex items-start gap-3 rounded-xl border border-[#00FFAA]/10 bg-[#0F2424] p-4">
            <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${color}`} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-white">{title}</h4>
                <strong className={`text-sm ${color}`}>{value}</strong>
              </div>
              <p className="mt-1 text-xs text-[#8BA3A3]">{detail}</p>
            </div>
          </div>
        ))}
      </div>
      {impacts.activeScandals === 0 && (
        <p className="mt-3 text-center text-xs text-emerald-300">Tidak ada penalti sektor dari skandal aktif.</p>
      )}
    </section>
  );
}
