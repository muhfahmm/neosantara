"use client"
import React, { useState } from "react";
import { X, Globe } from "lucide-react";
// PERBAIKAN: Import data negara untuk mendapatkan ISO bendera
import { COUNTRIES_DATA } from "../../../map_system/map-data";
import getTradeAgreementsForCountry from '../../../../../../../json/database_mitra_perdagangan/tradeAgreementRegistry';

type TradeAgreement = {
  mitra: string;
  type?: string;
  status?: string;
};

type EmbassyRecord = {
  mitra?: string;
  status?: string;
  type?: string;
  source?: string;
  [key: string]: any;
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail: any;
  setCountryDetail: (detail: any) => void;
  onOpenCountryDetail?: (countryName: string) => void;
}

export default function KedutaanBesarModal({ isOpen, onClose, countryDetail, setCountryDetail, onOpenCountryDetail }: ModalProps) {
  if (!isOpen) return null;
  const anggaran = countryDetail?.anggaran || 0;
  const directEmbassies = Array.isArray(countryDetail?.embassies) ? countryDetail.embassies : [];
  const removedEmbassies = Array.isArray(countryDetail?.removedEmbassies) ? countryDetail.removedEmbassies : [];
  const removedTradePartners = Array.isArray(countryDetail?.removedTradePartners) ? countryDetail.removedTradePartners : [];
  const tradeAgreements = getTradeAgreementsForCountry(countryDetail?.country || countryDetail?.nama || countryDetail?.country_name);

  const allPartnersFromTrade: EmbassyRecord[] = Array.isArray(tradeAgreements)
    ? tradeAgreements
        .filter((agreement: TradeAgreement) => {
          const normMitra = String(agreement.mitra || '').toLowerCase().trim();
          const isRemovedTrade = removedTradePartners.some((r: string) => String(r || '').toLowerCase().trim() === normMitra);
          const isRemovedEmbassy = removedEmbassies.some((r: string) => String(r || '').toLowerCase().trim() === normMitra);
          return !isRemovedTrade && !isRemovedEmbassy;
        })
        .map((agreement: TradeAgreement) => ({
          mitra: agreement.mitra,
          status: agreement.status || 'Aktif',
          type: agreement.type || 'Perdagangan',
        }))
    : [];

  const mergedEmbassies: EmbassyRecord[] = [
    ...directEmbassies.map((item: EmbassyRecord) => ({
      ...item,
      source: 'kedutaan',
    })),
    ...allPartnersFromTrade.map((item: EmbassyRecord) => ({
      ...item,
      source: 'trade',
    })),
  ];

  const embassies = mergedEmbassies.filter((item, index, array) => {
    const normalized = String(item.mitra || item.nama_negara || '').toLowerCase().trim();
    if (!normalized) return false;
    const isRemoved = removedEmbassies.some((r: string) => String(r || '').toLowerCase().trim() === normalized);
    if (isRemoved) return false;
    return array.findIndex((other) => String(other.mitra || other.nama_negara || '').toLowerCase().trim() === normalized) === index;
  });

  const playerName = countryDetail?.country || countryDetail?.nama || countryDetail?.country_name || 'Negara Anda';

  // State untuk Modal Konfirmasi & Modal Sukses
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; partnerName: string | null }>({ isOpen: false, partnerName: null });
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; message: string | null }>({ isOpen: false, message: null });

  // Fungsi helper untuk mendapatkan ISO dari nama negara
  const getIsoFromName = (name: string) => {
    const found = COUNTRIES_DATA?.find((c: { country?: string; iso?: string }) =>
      c.country?.toLowerCase().trim() === name?.toLowerCase().trim()
    );
    return found?.iso?.toLowerCase() || "";
  };

  // Fungsi helper untuk merender bendera (Anti broken image)
  const renderFlag = (iso: string, altName: string) => {
    if (!iso || iso.length !== 2) return null;
    return (
      <div className="w-6 h-4 rounded-sm overflow-hidden border border-[#5c3c10]/20 flex-shrink-0 shadow-sm bg-[#e4dac3] relative">
        <img
          src={`https://flagcdn.com/w80/${iso.toLowerCase()}.png`}
          alt={altName}
          className="w-full h-full object-cover absolute inset-0"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      </div>
    );
  };

  const handleOpenCountryDetail = (partnerName: string) => {
    onClose();
    if (onOpenCountryDetail) {
      onOpenCountryDetail(partnerName);
    }
  };

  // Logika membuka modal konfirmasi
  const handleDestroyEmbassy = (partnerName: string) => {
    setConfirmModal({ isOpen: true, partnerName });
  };

  // Eksekusi penghancuran setelah dikonfirmasi
  const handleConfirmDestroy = () => {
    if (!confirmModal.partnerName) return;
    const partnerName = confirmModal.partnerName;

    const updatedDirectEmbassies = directEmbassies.filter((item: { mitra?: string }) => item.mitra !== partnerName);
    const existingRemovedEmbassies = Array.isArray(countryDetail?.removedEmbassies) ? countryDetail.removedEmbassies : [];
    const existingRemovedTrade = Array.isArray(countryDetail?.removedTradePartners) ? countryDetail.removedTradePartners : [];

    setCountryDetail({
      ...countryDetail,
      embassies: updatedDirectEmbassies,
      removedEmbassies: Array.from(new Set([...existingRemovedEmbassies, partnerName])),
      removedTradePartners: Array.from(new Set([...existingRemovedTrade, partnerName])),
    });

    setConfirmModal({ isOpen: false, partnerName: null });
    setSuccessModal({
      isOpen: true,
      message: `Kedutaan Besar di ${partnerName} telah dihancurkan.`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#FAF6EE] border-2 sm:border-3 border-[#C4B49C] rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.03)_0%,transparent_100%)] pointer-events-none" />
        <div className="px-8 py-6 border-b-2 border-[#C4B49C]/30 flex items-center justify-between bg-[#FAF6EE] relative z-10">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#5c3c10]/10 rounded-xl border border-[#5c3c10]/20">
                <Globe className="h-6 w-6 text-[#5c3c10]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#5c3c10] tracking-tight leading-none uppercase">Kantor Kedutaan Besar Asing</h2>
                <p className="text-xs text-[#8b7e66] uppercase tracking-wider">Kedutaan milik {playerName}</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 sm:p-2.5 rounded-xl border-2 border-[#C4B49C] bg-transparent text-[#8b7e66] hover:text-[#5c3c10] hover:bg-black/5 active:bg-black/10 transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-8 bg-[#FAF6EE]/40 relative z-10 no-scrollbar">
          <p className="text-xs text-[#8b7e66] font-semibold leading-relaxed mb-6">
            Kelola daftar kedutaan asing yang dimiliki negara Anda. Setiap kedutaan yang dibangun akan muncul di sini dan dapat dihancurkan jika diperlukan.
          </p>

          {embassies.length === 0 ? (
            <div className="rounded-2xl border border-[#C4B49C]/30 bg-white/80 p-8 text-center">
              <p className="text-sm text-[#5c3c10] font-semibold mb-3">Belum ada kedutaan asing yang terdaftar.</p>
              <p className="text-xs text-[#8b7e66]">Bangun kedutaan melalui halaman detail negara untuk mulai menambahkan hubungan diplomatik.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 w-full">
              {embassies.map((item: any, idx: number) => {
                const iso = getIsoFromName(item.mitra);
                return (
                  <div key={idx} className="bg-[#e4dac3]/20 border border-[#C4B49C]/30 p-4 rounded-xl flex flex-row items-center justify-between w-full gap-4">
                    
                    {/* Bagian Informasi Kedutaan */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {renderFlag(iso, item.mitra)}
                        <h4 className="text-xs font-black text-[#5c3c10] uppercase leading-snug">{item.mitra}</h4>
                      </div>
                      <div className="flex flex-wrap gap-2 text-[10px] leading-none">
                        <span className="bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">{item.status || 'Aktif'}</span>
                        {item.type && <span className="bg-[#5c3c10]/10 text-[#5c3c10] border border-[#5c3c10]/15 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">{item.type}</span>}
                      </div>
                      {item.continent && (
                        <p className="text-[10px] text-[#5c3c10]/80 mt-3">Benua: {item.continent}</p>
                      )}
                      {item.builtAt && (
                        <p className="text-[10px] text-[#5c3c10]/80 mt-1">Dibangun: {new Date(item.builtAt).toLocaleDateString('id-ID')}</p>
                      )}
                    </div>

                    {/* Bagian Tombol Aksi (Flex Layout: Hijau & Merah) */}
                    <div className="flex flex-row items-center gap-2 flex-shrink-0">
                      {/* Tombol Lihat Detail Negara (Border Hijau) */}
                      <button
                        onClick={() => handleOpenCountryDetail(item.mitra)}
                        className="border-2 border-emerald-500 bg-transparent text-emerald-700 hover:bg-emerald-50 hover:border-emerald-600 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        Lihat Detail Negara
                      </button>

                      {/* Tombol Hancurkan Kedutaan Besar (Border Merah) */}
                      <button
                        onClick={() => handleDestroyEmbassy(item.mitra)}
                        className="border-2 border-rose-500 bg-transparent text-rose-700 hover:bg-rose-50 hover:border-rose-600 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Hancurkan Kedutaan Besar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Konfirmasi Hancurkan Kedutaan */}
        {confirmModal.isOpen && (
          <div className="absolute inset-0 bg-black/60 z-30 flex items-center justify-center p-8 pointer-events-auto backdrop-blur-sm rounded-2xl">
            <div className="bg-[#FAF6EE] border-4 border-[#C4B49C] rounded-2xl max-w-md w-full p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative">
              <button
                onClick={() => setConfirmModal({ isOpen: false, partnerName: null })}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-black/5 text-[#8b7e66] hover:text-[#5c3c10] transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
              <h3 className="text-lg font-black text-[#5c3c10] uppercase tracking-tight mb-3">Konfirmasi Hancurkan Kedutaan</h3>
              <p className="text-sm text-[#8b7e66] font-medium leading-relaxed mb-6">
                Apakah Anda yakin ingin menghancurkan Kedutaan Besar di <strong className="text-[#5c3c10]">{confirmModal.partnerName}</strong>? Tindakan ini tidak dapat dibatalkan dan akan memutuskan hubungan diplomatik.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmModal({ isOpen: false, partnerName: null })}
                  className="flex-1 py-3 rounded-xl border-2 border-[#C4B49C] bg-transparent text-[#8b7e66] hover:text-[#5c3c10] transition-all font-black text-xs uppercase cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmDestroy}
                  className="flex-1 py-3 rounded-xl border-2 border-rose-500 bg-transparent text-rose-700 hover:bg-rose-50 transition-all font-black text-xs uppercase cursor-pointer"
                >
                  Hancurkan Kedutaan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Notifikasi Sukses */}
        {successModal.isOpen && (
          <div className="absolute inset-0 bg-black/60 z-30 flex items-center justify-center p-8 pointer-events-auto backdrop-blur-sm rounded-2xl">
            <div className="bg-[#FAF6EE] border-4 border-emerald-500 rounded-2xl max-w-md w-full p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative">
              <h3 className="text-lg font-black text-[#5c3c10] uppercase tracking-tight mb-3">Berhasil</h3>
              <p className="text-sm text-[#8b7e66] font-medium leading-relaxed mb-6">
                {successModal.message}
              </p>
              <button
                onClick={() => setSuccessModal({ isOpen: false, message: null })}
                className="w-full py-3 rounded-xl bg-[#5c3c10] text-[#FAF6EE] hover:bg-[#3d2911] transition-all font-black text-xs uppercase cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}