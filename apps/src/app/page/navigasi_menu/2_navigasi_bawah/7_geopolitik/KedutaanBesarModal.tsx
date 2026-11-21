"use client"
import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
import RootModalCloseButton from '@/app/page/root_modals_design_menu/RootModalCloseButton';
import React, { useState } from "react";
import { X, Globe } from "lucide-react";
import NotebookModalWrapper from "../NotebookModalWrapper";
// PERBAIKAN: Import data negara untuk mendapatkan ISO bendera
import { COUNTRIES_DATA } from "../../../map_system/map-data";
import getTradeAgreementsForCountry from '../../../../../../../json/9_database_mitra_perdagangan/tradeAgreementRegistry';
import { getEmbassiesForCountry } from '../../../../../../../json/6_database_kedutaan_besar/embassyRegistry';
import MenuInfoButton from "../MenuInfoButton";
import RootConfirmModal from "@/app/page/root_modals_design_menu/RootConfirmModal";
import { useGeopoliticsMenuTranslation } from '@/app/page/paused_menu/terjemahan_paused_menu/useGeopoliticsMenuTranslation';
import { getLocalizedCountryName } from "@/app/logic/countryNameLogic";

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
  const { language, embassy } = useGeopoliticsMenuTranslation();
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; partnerName: string | null }>({ isOpen: false, partnerName: null });
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; message: string | null }>({ isOpen: false, message: null });

  if (!isOpen) return null;
  const anggaran = countryDetail?.anggaran || 0;
  const directEmbassies = Array.isArray(countryDetail?.embassies) ? countryDetail.embassies : [];
  const removedEmbassies = Array.isArray(countryDetail?.removedEmbassies) ? countryDetail.removedEmbassies : [];
  const removedTradePartners = Array.isArray(countryDetail?.removedTradePartners) ? countryDetail.removedTradePartners : [];

  const currentCountryName = countryDetail?.country || countryDetail?.nama || countryDetail?.country_name || countryDetail?.nama_negara || "Senegal";
  const dbEmbassies = getEmbassiesForCountry(currentCountryName).map(mitra => ({
    mitra,
    status: 'Aktif',
    type: 'Kedutaan Besar',
  }));

  const tradeAgreements = getTradeAgreementsForCountry(currentCountryName);

  // Perdagangan dari state lokal/custom player jika ada
  const customTradeAgreements = Array.isArray(countryDetail?.tradeAgreements) ? countryDetail.tradeAgreements : [];

  const allPartnersFromTrade: EmbassyRecord[] = Array.isArray(customTradeAgreements)
    ? customTradeAgreements
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
    ...dbEmbassies.map((item: EmbassyRecord) => ({
      ...item,
      source: 'database_sql',
    })),
    ...directEmbassies.map((item: EmbassyRecord) => ({
      ...item,
      source: 'kedutaan',
    })),
    ...allPartnersFromTrade.map((item: EmbassyRecord) => ({
      ...item,
      source: 'trade',
    })),
  ];

  const annexedStore = (typeof window !== 'undefined' ? (window as any).neosantara_annexed_countries : {}) || {};

  const embassies = mergedEmbassies.filter((item, index, array) => {
    const rawMitra = String(item.mitra || item.nama_negara || '');
    const normalized = rawMitra.toLowerCase().trim();
    if (!normalized) return false;

    // Otomatis hilangkan kedubes jika negara mitra telah dianeksasi oleh negara lain
    const isAnnexed = Boolean(
      annexedStore[rawMitra] ||
      annexedStore[normalized]
    );
    if (isAnnexed) return false;

    const isRemoved = removedEmbassies.some((r: string) => String(r || '').toLowerCase().trim() === normalized);
    if (isRemoved) return false;
    return array.findIndex((other) => String(other.mitra || other.nama_negara || '').toLowerCase().trim() === normalized) === index;
  });

  const playerName = countryDetail?.country || countryDetail?.nama || countryDetail?.country_name || 'Negara Anda';

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
      <div className="w-6 h-4 rounded-sm overflow-hidden border border-root-accent/20 flex-shrink-0 shadow-sm bg-root-canvas relative">
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
      message: embassy('success.message', { country: partnerName }),
    });
  };

  const translateStatus = (status: string) => status === 'Aktif' ? embassy('status.active') : status;
  const translateType = (type: string) => {
    if (type === 'Kedutaan Besar') return embassy('types.embassy');
    if (type === 'Perdagangan') return embassy('types.trade');
    return type;
  };

  return (
    <>
      <NotebookModalWrapper onClose={onClose}>
        <div className="root-modal-util-52b6b298fe">

          <div className="satisfaction-modal-header root-modal-util-4450f1d9ee">
            <div className="satisfaction-modal-header-main root-modal-util-935108d13c no-scrollbar">
              <div className="root-modal-util-c7c918256f">
                <div className="root-modal-util-acd42b9a36">
                  <Globe aria-hidden="true" className="root-modal-util-ea2c28151c animate-pulse" />
                </div>
                <div>
                  <h2 className="root-modal-util-6b4648c53a root-modal-util-c2385a463d">
                    {embassy('header.title')}
                  </h2>
                </div>
              </div>
            </div>
            <div className="root-modal-util-6cfc7e6ab3">
              <MenuInfoButton
                title={embassy('info.title')}
                description={embassy('info.description')}
              />
              <RootModalCloseButton onClick={onClose} />
            </div>
          </div>

          {/* BODY */}
          <div className="satisfaction-modal-content root-modal-util-9c12d57a09">
            <div className="satisfaction-modal-content-body root-modal-enter root-modal-fade-in root-modal-util-90f9f3a7db">
              {embassies.length === 0 ? (
                <div className="rounded-xl border border-root-accent/20 bg-root-canvas p-8 text-center">
                  <p className="text-sm text-root-accent font-black mb-2">{embassy('empty.title')}</p>
                  <p className="text-xs text-root-subtle">{embassy('empty.description')}</p>
                </div>
              ) : (
                <div className="flex w-full flex-col gap-3">
                  {embassies.map((item: any, idx: number) => {
                    const iso = getIsoFromName(item.mitra);
                    const displayName = getLocalizedCountryName(iso || item.mitra, language);
                    return (
                      <div key={idx} className="flex w-full flex-col items-stretch gap-3 rounded-xl border border-root-accent/20 bg-root-canvas p-3 transition-colors hover:border-root-accent/50 hover:bg-root-accent/5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4">
                        {/* Bagian Informasi Kedutaan */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {renderFlag(iso, displayName)}
                            <h4 className="break-words text-sm font-black text-root-text uppercase tracking-wider">{displayName}</h4>
                          </div>
                          <div className="flex flex-wrap gap-2 text-[10px] leading-none mt-2">
                            <span className="bg-root-accent/10 text-root-accent border border-root-accent/30 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">{translateStatus(item.status || 'Aktif')}</span>
                            {item.type && <span className="bg-root-surface text-root-subtle border border-root-accent/20 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">{translateType(item.type)}</span>}
                          </div>
                          {item.continent && (
                            <p className="text-[10px] text-root-subtle mt-2">{embassy('labels.continent')}: {item.continent}</p>
                          )}
                        </div>

                        {/* Bagian Tombol Aksi */}
                        <div className="grid w-full grid-cols-1 gap-2 sm:w-auto sm:flex sm:shrink-0 sm:flex-row sm:items-center">
                          <button
                            onClick={() => handleOpenCountryDetail(item.mitra)}
                            className="flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-root-accent/40 bg-root-surface px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-root-accent transition-all hover:bg-root-accent hover:text-root-accent-ink cursor-pointer"
                          >
                            <Globe className="w-3.5 h-3.5" />
                            {embassy('actions.viewDetails')}
                          </button>

                          <button
                            onClick={() => handleDestroyEmbassy(item.mitra)}
                            className="whitespace-nowrap rounded-lg border border-rose-500/40 bg-root-surface px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-rose-400 transition-all hover:bg-rose-500 hover:text-white cursor-pointer"
                          >
                            {embassy('actions.destroyEmbassy')}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </NotebookModalWrapper>

      {/* Modal Konfirmasi Hancurkan Kedutaan */}
      <RootConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, partnerName: null })}
        onConfirm={handleConfirmDestroy}
        title={embassy('confirm.title')}
        confirmLabel={embassy('actions.destroyEmbassy')}
        isDestructive
        footerBorderClassName="border-rose-500/20"
        zIndexClass="z-[100]"
      >
        <p className="text-sm text-root-subtle font-medium leading-relaxed my-2 [overflow-wrap:anywhere]">
          {embassy('confirm.message', { country: confirmModal.partnerName ?? '' })}
        </p>
      </RootConfirmModal>

      {/* Modal Notifikasi Sukses */}
      {successModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 pointer-events-auto rounded-2xl">
          <div className="modal-responsive-shell bg-root-surface border border-root-accent/40 rounded-2xl p-8 shadow-2xl relative">
            <h3 className="text-lg font-bold text-root-accent uppercase tracking-wide mb-3">{embassy('success.title')}</h3>
            <p className="text-sm text-root-subtle font-medium leading-relaxed mb-6">
              {successModal.message}
            </p>
            <SharedModalCloseButton
              onClick={() => setSuccessModal({ isOpen: false, message: null })}
              className="w-full py-2.5 rounded-xl bg-root-accent text-root-canvas hover:bg-root-accent/80 transition-all font-black text-xs uppercase cursor-pointer"
             appearance="custom">
              {embassy('actions.close')}
            </SharedModalCloseButton>
          </div>
        </div>
      )}
    </>
  );
}