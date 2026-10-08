"use client";

interface EmbassyRelationRequirementModalProps {
  isOpen: boolean;
  countryName?: string | null;
  currentRelation: number;
  minimumRelation: number;
  onClose: () => void;
}

export default function EmbassyRelationRequirementModal({
  isOpen,
  countryName,
  currentRelation,
  minimumRelation,
  onClose,
}: EmbassyRelationRequirementModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[420px] bg-white rounded-2xl p-6 shadow-lg border border-[#E5DCCF]">
        <h3 className="text-lg font-black text-[#3d2911] mb-3">Kedutaan Belum Dapat Dibangun</h3>
        <p className="text-sm text-[#5c3c10] mb-5">
          Hubungan dengan <strong>{countryName}</strong> harus mencapai minimal{" "}
          <strong>{minimumRelation}</strong> untuk membangun kedutaan. Hubungan saat ini{" "}
          <strong>{currentRelation}</strong>.
        </p>
        <button
          onClick={onClose}
          className="w-full bg-emerald-600 hover:bg-emerald-700 border border-emerald-700 rounded py-2.5 text-white font-black text-xs tracking-widest uppercase transition-colors"
        >
          Mengerti
        </button>
      </div>
    </div>
  );
}
