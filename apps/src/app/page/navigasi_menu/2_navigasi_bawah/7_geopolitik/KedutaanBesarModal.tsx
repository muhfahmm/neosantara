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
      <div className="w-6 h-4 rounded-sm overflow-hidden border border-[#00FFAA]/20 flex-shrink-0 shadow-sm bg-[#051111] relative">
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
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-[#00FFAA]/30 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#0F2424] rounded-xl border border-[#00FFAA]/30">
                <Globe className="h-6 w-6 text-[#00FFAA] animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#00FFAA] tracking-wider uppercase">Kantor Kedutaan Besar Asing</h2>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 bg-[#0F2424] relative z-10 no-scrollbar">
          <p className="text-xs text-[#6B8A8A] font-semibold leading-relaxed mb-4">
            Kelola daftar kedutaan asing yang dimiliki negara Anda. Setiap kedutaan yang dibangun akan muncul di sini dan dapat dihancurkan jika diperlukan.
          </p>

          {embassies.length === 0 ? (
            <div className="rounded-xl border border-[#00FFAA]/20 bg-[#0A1A1A] p-8 text-center">
              <p className="text-sm text-[#00FFAA] font-black mb-2">Belum ada kedutaan asing yang terdaftar.</p>
              <p className="text-xs text-[#6B8A8A]">Bangun kedutaan melalui halaman detail negara untuk mulai menambahkan hubungan diplomatik.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 w-full">
              {embassies.map((item: any, idx: number) => {
                const iso = getIsoFromName(item.mitra);
                return (
                  <div key={idx} className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-4 rounded-xl flex flex-row items-center justify-between w-full gap-4">
                    
                    {/* Bagian Informasi Kedutaan */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {renderFlag(iso, item.mitra)}
                        <h4 className="text-sm font-black text-[#E0E0E0] uppercase tracking-wider">{item.mitra}</h4>
                      </div>
                      <div className="flex flex-wrap gap-2 text-[10px] leading-none mt-2">
                        <span className="bg-[#00FFAA]/10 text-[#00FFAA] border border-[#00FFAA]/30 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">{item.status || 'Aktif'}</span>
                        {item.type && <span className="bg-[#0F2424] text-[#6B8A8A] border border-[#00FFAA]/20 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">{item.type}</span>}
                      </div>
                      {item.continent && (
                        <p className="text-[10px] text-[#6B8A8A] mt-2">Benua: {item.continent}</p>
                      )}
                    </div>

                    {/* Bagian Tombol Aksi */}
                    <div className="flex flex-row items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleOpenCountryDetail(item.mitra)}
                        className="border border-[#00FFAA]/40 bg-[#0F2424] text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        Lihat Detail
                      </button>

                      <button
                        onClick={() => handleDestroyEmbassy(item.mitra)}
                        className="border border-rose-500/40 bg-[#0F2424] text-rose-400 hover:bg-rose-500 hover:text-white px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Hancurkan Kedutaan
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
            <div className="bg-[#0F2424] border border-rose-500/40 rounded-2xl max-w-md w-full p-8 shadow-2xl relative">
              <button
                onClick={() => setConfirmModal({ isOpen: false, partnerName: null })}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-[#6B8A8A] hover:text-[#00FFAA] transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
              <h3 className="text-lg font-bold text-rose-400 uppercase tracking-wide mb-3">Konfirmasi Hancurkan Kedutaan</h3>
              <p className="text-sm text-[#6B8A8A] font-medium leading-relaxed mb-6">
                Apakah Anda yakin ingin menghancurkan Kedutaan Besar di <strong className="text-[#E0E0E0]">{confirmModal.partnerName}</strong>? Tindakan ini tidak dapat dibatalkan dan akan memutuskan hubungan diplomatik.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmModal({ isOpen: false, partnerName: null })}
                  className="flex-1 py-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#0A1A1A] text-[#6B8A8A] hover:text-[#E0E0E0] text-xs font-bold uppercase transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmDestroy}
                  className="flex-1 py-2.5 rounded-xl border border-rose-500/50 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-all font-bold text-xs uppercase cursor-pointer"
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
            <div className="bg-[#0F2424] border border-[#00FFAA]/40 rounded-2xl max-w-md w-full p-8 shadow-2xl relative">
              <h3 className="text-lg font-bold text-[#00FFAA] uppercase tracking-wide mb-3">Berhasil</h3>
              <p className="text-sm text-[#6B8A8A] font-medium leading-relaxed mb-6">
                {successModal.message}
              </p>
              <button
                onClick={() => setSuccessModal({ isOpen: false, message: null })}
                className="w-full py-2.5 rounded-xl bg-[#00FFAA] text-[#0A1A1A] hover:bg-[#00FFAA]/80 transition-all font-black text-xs uppercase cursor-pointer"
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