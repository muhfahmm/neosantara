with open('apps/src/app/page/detail_negara/detail_negara.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update CountryDetailModalProps
text = text.replace(
"""interface CountryDetailModalProps {
  isOpen: boolean;
  countryName: string | null;
  onClose: () => void;""",
"""interface CountryDetailModalProps {
  isOpen: boolean;
  countryName: string | null;
  selectedCity?: string | null;
  onClose: () => void;"""
)

# 2. Update Component destructuring
text = text.replace(
"""export function CountryDetailModal({
  isOpen,
  countryName,
  onClose,
  countryDetail,""",
"""export function CountryDetailModal({
  isOpen,
  countryName,
  selectedCity,
  onClose,
  countryDetail,"""
)

# 3. Update displayCapital and label logic
text = text.replace(
"""  const displayCapital = mapData?.capital || detailData?.capital || "Data tidak tersedia";""",
"""  const countryCapital = mapData?.capital || detailData?.capital || "Data tidak tersedia";
  const isTargetingCity = Boolean(selectedCity && selectedCity.trim() !== "");
  const displayCapital = (isTargetingCity ? selectedCity : countryCapital) || "Data tidak tersedia";
  const capitalCardLabel = isTargetingCity && selectedCity?.toLowerCase().trim() !== countryCapital.toLowerCase().trim()
    ? "Kota"
    : "Ibukota";"""
)

# 4. Update Header card label
text = text.replace(
"""            {/* Ibukota */}
            <div className="flex min-w-0 items-center gap-2 lg:gap-1.5">
              <div className="p-1.5 lg:p-1 xl:p-1.5 bg-[#00FFAA]/10 rounded-lg border border-[#00FFAA]/20 text-[#00FFAA]">
                <Landmark className="h-4 w-4 lg:h-3.5 lg:w-3.5 xl:h-4 xl:w-4 text-[#00FFAA]" />
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="text-[9px] lg:text-[8px] xl:text-[9px] font-black text-[#00FFAA]/60 uppercase tracking-wider">Ibukota</span>
                <span className="text-[11px] lg:text-[9px] xl:text-[11px] font-bold text-[#00FFAA] uppercase">
                  {displayCapital}
                </span>
              </div>
            </div>""",
"""            {/* Ibukota / Kota */}
            <div className="flex min-w-0 items-center gap-2 lg:gap-1.5">
              <div className="p-1.5 lg:p-1 xl:p-1.5 bg-[#00FFAA]/10 rounded-lg border border-[#00FFAA]/20 text-[#00FFAA]">
                <Landmark className="h-4 w-4 lg:h-3.5 lg:w-3.5 xl:h-4 xl:w-4 text-[#00FFAA]" />
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="text-[9px] lg:text-[8px] xl:text-[9px] font-black text-[#00FFAA]/60 uppercase tracking-wider">{capitalCardLabel}</span>
                <span className="text-[11px] lg:text-[9px] xl:text-[11px] font-bold text-[#00FFAA] uppercase">
                  {displayCapital}
                </span>
              </div>
            </div>"""
)

with open('apps/src/app/page/detail_negara/detail_negara.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated detail_negara.tsx successfully")

