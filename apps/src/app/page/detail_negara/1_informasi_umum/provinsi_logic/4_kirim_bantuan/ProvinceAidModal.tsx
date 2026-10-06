'use client';

import { useState } from 'react';
import { HandHeart } from 'lucide-react';

interface ProvinceAidItem {
  key: string;
  label: string;
}

interface ProvinceAidSector {
  id: string;
  label: string;
  items: ProvinceAidItem[];
}

interface ProvinceAidModalProps {
  targetCountry: string;
  provinceData?: Record<string, unknown> | null;
  provinceTension: number;
  onClose: () => void;
  onConfirm: (category: string, itemLabel: string) => void;
}

const AID_SECTORS: ProvinceAidSector[] = [
  {
    id: 'manufaktur',
    label: 'Manufaktur',
    items: [
      { key: 'pabrik_semikonduktor', label: 'Pabrik Semikonduktor' },
      { key: 'pabrik_mesin_mobil', label: 'Pabrik Mesin Mobil' },
      { key: 'pabrik_mesin_motor', label: 'Pabrik Mesin Motor' },
      { key: 'semen_beton', label: 'Pabrik Beton & Semen' },
      { key: 'kayu', label: 'Penggergajian Kayu' }
    ]
  },
  {
    id: 'peternakan',
    label: 'Peternakan',
    items: [
      { key: 'ayam_unggas', label: 'Peternakan Unggas' },
      { key: 'sapi_perah', label: 'Peternakan Sapi Perah' },
      { key: 'sapi_potong', label: 'Peternakan Sapi Potong' },
      { key: 'domba_kambing', label: 'Peternakan Domba & Kambing' }
    ]
  },
  {
    id: 'agrikultur',
    label: 'Agrikultur',
    items: [
      { key: 'padi', label: 'Padi' }, { key: 'gandum', label: 'Gandum' },
      { key: 'jagung', label: 'Jagung' }, { key: 'sayur', label: 'Sayur' },
      { key: 'umbi', label: 'Umbi' }, { key: 'kedelai', label: 'Kedelai' },
      { key: 'kelapa_sawit', label: 'Kelapa Sawit' }, { key: 'kopi', label: 'Kopi' },
      { key: 'teh', label: 'Teh' }, { key: 'kakao', label: 'Kakao' },
      { key: 'tebu', label: 'Tebu' }, { key: 'karet', label: 'Karet' }
    ]
  },
  {
    id: 'perikanan',
    label: 'Perikanan',
    items: [
      { key: 'udang', label: 'Udang' }, { key: 'ikan', label: 'Ikan' },
      { key: 'mutiara', label: 'Mutiara' }
    ]
  },
  {
    id: 'olahan_pangan',
    label: 'Olahan Pangan',
    items: [
      { key: 'air_mineral', label: 'Air Mineral' }, { key: 'gula', label: 'Gula' },
      { key: 'roti', label: 'Roti' }, { key: 'pengolahan_daging', label: 'Pengolahan Daging' },
      { key: 'mie_instan', label: 'Mie Instan' }, { key: 'minyak_goreng', label: 'Minyak Goreng' },
      { key: 'susu', label: 'Susu' }, { key: 'beras', label: 'Beras' }
    ]
  }
];

export default function ProvinceAidModal({
  targetCountry,
  provinceData,
  provinceTension,
  onClose,
  onConfirm
}: ProvinceAidModalProps) {
  const availableSectors = AID_SECTORS.map(sector => ({
    ...sector,
    availableItems: sector.items
  }));
  const [selectedSectorId, setSelectedSectorId] = useState(AID_SECTORS[0].id);
  const [selectedItemKey, setSelectedItemKey] = useState('');
  const selectedSector = availableSectors.find(sector => sector.id === selectedSectorId);
  const selectedItem = selectedSector?.availableItems.find(item => item.key === selectedItemKey);

  const selectSector = (sector: typeof availableSectors[number]) => {
    setSelectedSectorId(sector.id);
    setSelectedItemKey('');
  };

  return (
    <div className="fixed inset-0 z-[200001] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="province-aid-title"
        className="bg-[#0F2424] border-2 sm:border-3 border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl"
      >
        <div className="shrink-0 border-b border-[#00FFAA]/20 bg-[#0A1A1A] px-6 py-4 sm:px-8 sm:py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-[#00FFAA]/30 bg-[#00FFAA]/10 p-2 text-[#00FFAA]">
              <HandHeart className="h-6 w-6" />
            </div>
            <div>
              <h3 id="province-aid-title" className="text-lg font-black text-[#00FFAA]">Pilih Bantuan</h3>
              <p className="text-sm text-[#B7D5CD]">Pilih hasil produksi yang akan dikirim ke {targetCountry}.</p>
              <p className="mt-1 text-xs font-bold text-orange-300">
                Ketegangan saat ini: {provinceTension} · bantuan tetap dapat dikirim saat ketegangan 0
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {availableSectors.map(sector => (
            <button
              key={sector.id}
              type="button"
              disabled={sector.availableItems.length === 0}
              onClick={() => selectSector(sector)}
              className={`rounded-lg border px-3 py-2 text-xs font-black uppercase transition-colors ${
                selectedSectorId === sector.id
                  ? 'border-[#00FFAA] bg-[#00FFAA]/20 text-[#00FFAA]'
                  : 'border-[#00FFAA]/20 bg-[#0A1A1A] text-[#B7D5CD] hover:border-[#00FFAA]/50'
              }`}
            >
              {sector.label}
            </button>
          ))}
        </div>

        {selectedSector && selectedSector.availableItems.length > 0 ? (
          <div className="mb-5 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[#B7D5CD]">
              Pilih barang bantuan · {selectedSector.label}
            </p>
            {selectedSector.availableItems.map(item => (
              <button
                key={item.key}
                type="button"
                onClick={() => setSelectedItemKey(item.key)}
                className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left ${
                  selectedItemKey === item.key
                    ? 'border-[#00FFAA] bg-[#00FFAA]/15 text-[#00FFAA]'
                    : 'border-[#00FFAA]/20 bg-[#0A1A1A] text-white hover:border-[#00FFAA]/50'
                }`}
              >
                <span className="text-sm font-bold">{item.label}</span>
                <span className="text-xs text-[#B7D5CD]">
                  Produksi: {Number(provinceData?.[item.key] ?? 0).toLocaleString()}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="mb-5 rounded-lg border border-white/10 bg-black/20 p-4 text-sm text-[#B7D5CD]">
            Pilih sektor bantuan yang tersedia untuk provinsi ini.
          </p>
        )}

        </div>
        <div className="shrink-0 border-t border-[#00FFAA]/20 bg-[#0A1A1A] p-4 sm:px-8">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-[#00FFAA]/30 px-4 py-3 text-xs font-black uppercase text-[#00FFAA] hover:bg-[#00FFAA]/10"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={!selectedSector || !selectedItem}
            onClick={() => selectedSector && selectedItem && onConfirm(selectedSector.label, selectedItem.label)}
            className="flex-1 rounded-lg bg-[#00FFAA] px-4 py-3 text-xs font-black uppercase text-[#0A1A1A] hover:bg-[#00D991] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Kirim Bantuan
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
