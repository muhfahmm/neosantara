interface Country {
  [key: string]: string | number | undefined | { uranium?: boolean; batu_bara?: boolean; gas_alam?: boolean };
  sda?: { uranium?: boolean; batu_bara?: boolean; gas_alam?: boolean };
}

interface Props { countries: Country[]; }

const number = (value: unknown) => Number(value) || 0;
const fuel = (label: string, count: unknown) => number(count) ? `${label}: ${number(count)} gardu` : "-";
const resource = (label: string, available?: boolean) => available ? label : "-";

export default function NegaraKhususKelistrikan({ countries }: Props) {
  const rows = countries
    .filter((country) =>
      number(country.pembangkit_listrik_tenaga_nuklir) ||
      number(country.pembangkit_listrik_tenaga_uap) ||
      number(country.pembangkit_listrik_tenaga_gas) ||
      country.sda?.uranium || country.sda?.batu_bara || country.sda?.gas_alam,
    )
    .map((country) => ({
      country: String(country.name_id || country.country || country.name_en || country.country_slug || "Tidak diketahui"),
      pltn: number(country.pembangkit_listrik_tenaga_nuklir),
      pltu: number(country.pembangkit_listrik_tenaga_uap),
      pltg: number(country.pembangkit_listrik_tenaga_gas),
      uranium: fuel("Uranium", country.gardu_pltn_uranium),
      batuBara: fuel("Batu bara", country.gardu_pltu_batu_bara),
      minyakBumi: fuel("Minyak bumi", country.gardu_pltu_minyak_bumi),
      gasAlam: fuel("Gas alam", country.gardu_pltg_gas_alam),
      sda: [
        resource("Uranium", country.sda?.uranium),
        resource("Batu bara", country.sda?.batu_bara),
        resource("Gas alam", country.sda?.gas_alam),
      ].filter((item) => item !== "-").join(", ") || "-",
    }))
    .sort((a, b) => a.country.localeCompare(b.country, "id"));
  return (
    <section className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-4 lg:p-6 rounded-2xl w-full">
      <h3 className="text-lg font-black text-[#00FFAA] uppercase tracking-wide">Negara Khusus</h3>
      <p className="mt-1 mb-4 text-xs text-[#6B8A8A]">Data database sektor listrik nasional.</p>
      <div className="overflow-x-auto border border-[#00FFAA]/20 rounded-xl">
        <table className="w-full min-w-[680px] text-xs">
          <thead className="bg-[#0F2424] text-[10px] uppercase tracking-wider">
            <tr className="border-b border-[#00FFAA]/20">
              <th className="px-4 py-3 text-left font-black text-[#00FFAA]">Negara</th>
              <th className="px-4 py-3 text-left font-black text-[#00FFAA]">PLTN / Uranium</th>
              <th className="px-4 py-3 text-left font-black text-[#00FFAA]">PLTU / Bahan Bakar</th>
              <th className="px-4 py-3 text-left font-black text-[#00FFAA]">PLTG / Gas Alam</th>
              <th className="px-4 py-3 text-left font-black text-[#00FFAA]">SDA Tersedia</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#00FFAA]/10 bg-[#0A1A1A]">
            {rows.map((row) => (
              <tr key={row.country} className="hover:bg-[#00FFAA]/10 transition-colors">
                <td className="px-4 py-3 font-black text-[#E0E0E0]">{row.country}</td>
                <td className="px-4 py-3 text-amber-300">{row.pltn} unit<br /><span className="text-[#6B8A8A]">{row.uranium}</span></td>
                <td className="px-4 py-3 text-orange-300">{row.pltu} unit<br /><span className="text-[#6B8A8A]">{row.batuBara}<br />{row.minyakBumi}</span></td>
                <td className="px-4 py-3 text-sky-300">{row.pltg} unit<br /><span className="text-[#6B8A8A]">{row.gasAlam}</span></td>
                <td className="px-4 py-3 text-emerald-300">{row.sda}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center font-bold text-[#6B8A8A]">Data pembangkit khusus belum tersedia.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
