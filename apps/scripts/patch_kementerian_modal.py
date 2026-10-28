with open('apps/src/app/page/navigasi_menu/2_navigasi_bawah/9_kementrian/KementerianModal.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Import MapPin and GantiIbukotaModal
text = text.replace(
"""import PilihMenteriModal, { type MinisterCandidateDepartment } from "./PilihMenteriModal";""",
"""import PilihMenteriModal, { type MinisterCandidateDepartment } from "./PilihMenteriModal";
import GantiIbukotaModal from "./2_ganti_ibukota/GantiIbukotaModal";
import { MapPin } from "lucide-react";"""
)

# 2. Update ModalProps to accept currentDate
text = text.replace(
"""interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail: any;
  setCountryDetail: (detail: any) => void;
  resetTrigger?: boolean;
}""",
"""interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail: any;
  setCountryDetail: (detail: any) => void;
  resetTrigger?: boolean;
  currentDate?: Date | string;
}"""
)

# 3. Add state and props in Component function
text = text.replace(
"""export default function KementerianModal({ isOpen, onClose, countryDetail, setCountryDetail, resetTrigger }: ModalProps) {
  const [mounted, setMounted] = useState(false);""",
"""export default function KementerianModal({ isOpen, onClose, countryDetail, setCountryDetail, resetTrigger, currentDate }: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isGantiIbukotaOpen, setIsGantiIbukotaOpen] = useState(false);"""
)

# 4. In resetTrigger effect:
text = text.replace(
"""      setConfirmUpgrade(null);
      setConfirmDowngrade(null);
      setMinisterDepartment(null);
    }
  }, [resetTrigger]);""",
"""      setConfirmUpgrade(null);
      setConfirmDowngrade(null);
      setMinisterDepartment(null);
      setIsGantiIbukotaOpen(false);
    }
  }, [resetTrigger]);"""
)

# 5. Add Ibukota Badge and Ganti Ibukota Button in Header
old_header_kas = """              <div className="text-[11px] sm:text-xs font-bold text-[#00FFAA] bg-[#0F2424] px-3 py-1 rounded-lg border border-[#00FFAA]/20">
                Kas: {money.toLocaleString("id-ID", { maximumFractionDigits: 2 })} NEO
              </div>
            </div>"""

new_header_kas = """              <div className="text-[11px] sm:text-xs font-bold text-[#00FFAA] bg-[#0F2424] px-3 py-1 rounded-lg border border-[#00FFAA]/20">
                Kas: {money.toLocaleString("id-ID", { maximumFractionDigits: 2 })} NEO
              </div>

              {/* Badge Ibukota Saat Ini & Tombol Ubah Ibukota */}
              <div className="flex items-center gap-1.5 bg-[#0F2424] px-2.5 py-1 rounded-lg border border-[#FFE600]/30 shadow-sm">
                <span className="text-[10px] text-[#A2B7B2] font-semibold uppercase tracking-wider">Ibukota:</span>
                <span className="text-[11px] sm:text-xs font-black text-[#FFE600] uppercase tracking-wide">
                  {countryDetail?.capital || countryDetail?.ibukota || (typeof window !== "undefined" ? (window as any).neosantara_player_capital : null) || "Jakarta"}
                </span>
                <button
                  onClick={() => setIsGantiIbukotaOpen(true)}
                  className="ml-1 px-2 py-0.5 rounded-md bg-[#FFE600]/20 hover:bg-[#FFE600] text-[#FFE600] hover:text-[#0A1A1A] border border-[#FFE600]/40 transition-all font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  title="Pindah / Ganti Ibukota Negara"
                >
                  <MapPin className="h-3 w-3" />
                  <span>Ubah</span>
                </button>
              </div>
            </div>"""

text = text.replace(old_header_kas, new_header_kas)

# 6. Render GantiIbukotaModal before closing portal
text = text.replace(
"""      {/* ========== MODAL PILIH MENTERI ========== */}
      {ministerDepartment && (
        <PilihMenteriModal
          isOpen={Boolean(ministerDepartment)}
          department={ministerDepartment}
          onClose={() => setMinisterDepartment(null)}
          countryDetail={countryDetail}
          setCountryDetail={setCountryDetail}
        />
      )}""",
"""      {/* ========== MODAL PILIH MENTERI ========== */}
      {ministerDepartment && (
        <PilihMenteriModal
          isOpen={Boolean(ministerDepartment)}
          department={ministerDepartment}
          onClose={() => setMinisterDepartment(null)}
          countryDetail={countryDetail}
          setCountryDetail={setCountryDetail}
        />
      )}

      {/* ========== MODAL GANTI IBUKOTA ========== */}
      <GantiIbukotaModal
        isOpen={isGantiIbukotaOpen}
        onClose={() => setIsGantiIbukotaOpen(false)}
        countryDetail={countryDetail}
        setCountryDetail={setCountryDetail}
        currentDate={currentDate}
      />"""
)

with open('apps/src/app/page/navigasi_menu/2_navigasi_bawah/9_kementrian/KementerianModal.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated KementerianModal.tsx successfully")

