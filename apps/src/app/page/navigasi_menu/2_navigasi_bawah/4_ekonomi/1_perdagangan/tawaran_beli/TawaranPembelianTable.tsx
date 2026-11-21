"use client"
import RootTable from "@/app/page/root_modals_design_menu/RootTable";
import React from "react";
import { Handshake } from "lucide-react";
import RootInfoModalHeader from "@/app/page/root_modals_design_menu/RootInfoModalHeader";
import { PartnerOffer } from "../PerdaganganModal";
import { getArmsTradeProducts } from "../umum/armsTradeLogic";

import { COUNTRIES_DATA } from "../../../../../map_system/map-data";
import { getLocalizedCountryName } from "@/app/logic/countryNameLogic";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

interface TawaranPembelianTableProps {
  offers: PartnerOffer[];
  onAcceptOffer: (offer: PartnerOffer) => void;
  onClose: () => void;
  currentDate: Date; // <--- TAMBAHAN: Ambil tanggal simulasi saat ini
  marketType?: "arms";
}

// Helper formatting
const formatLabel = (key: string) => key.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase());

const getFlagEmoji = (countryName: string) => {
  const matched = COUNTRIES_DATA.find(c => c.country.toLowerCase().trim() === countryName.toLowerCase().trim());
  if (!matched || !matched.iso) return "";
  const codePoints = matched.iso.toUpperCase().split('').map(c => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

export default function TawaranPembelianTable({ offers, onAcceptOffer, onClose, currentDate, marketType }: TawaranPembelianTableProps) {
  const { language, t } = useLanguage();
  const isArmsMarket = marketType === "arms" || offers.some(offer => offer.marketType === "arms");
  return (
    <div className="mb-8 border border-root-accent/30 rounded-xl overflow-hidden animate-in fade-in zoom-in duration-300 bg-root-surface">
      <RootInfoModalHeader
        title={t(isArmsMarket
          ? "navigation_economy_trade.offers.armsTitle"
          : "navigation_economy_trade.offers.specialTitle")}
        onClose={onClose}
        size="standard"
        icon={<Handshake aria-hidden="true" />}
      />
      <RootTable className="w-full text-left">
        <thead>
          <tr className="bg-root-canvas border-b border-root-accent/20">
            <th className="px-4 py-2.5 text-[10px] font-black text-root-accent uppercase tracking-wider">{t("navigation_economy_trade.offers.partner")}</th>
            <th className="px-4 py-2.5 text-[10px] font-black text-root-accent uppercase tracking-wider">{t(isArmsMarket ? "navigation_economy_trade.offers.arms" : "navigation_economy_trade.offers.product")}</th>
            <th className="px-4 py-2.5 text-[10px] font-black text-root-accent uppercase tracking-wider">{t(isArmsMarket ? "navigation_economy_trade.offers.unit" : "navigation_economy_trade.offers.quantity")}</th>
            <th className="px-4 py-2.5 text-[10px] font-black text-root-accent uppercase tracking-wider">{t("navigation_economy_trade.offers.pricePerUnit")}</th>
            <th className="px-4 py-2.5 text-[10px] font-black text-root-accent uppercase tracking-wider">{t(isArmsMarket ? "navigation_economy_trade.offers.transactionValue" : "navigation_economy_trade.offers.totalCost")}</th>
            <th className="px-4 py-2.5 text-[10px] font-black text-root-accent uppercase tracking-wider text-center">{t("navigation_economy_trade.offers.action")}</th>
          </tr>
        </thead>
        <tbody className="bg-root-surface divide-y divide-root-accent/10">
          {offers.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-xs text-root-subtle font-semibold">
                {t("navigation_economy_trade.offers.empty")}
              </td>
            </tr>
          ) : (
            offers.map((offer) => {
              // Logika pengecekan apakah tawaran sudah melewati 30 hari
              const isExpired = offer.validUntil
                ? currentDate > new Date(offer.validUntil)
                : false;

              return (
                <tr key={offer.id} className="hover:bg-root-accent/5 transition-colors">
                  <td className="px-4 py-3 text-xs font-semibold text-root-text flex items-center gap-3">
                    {(() => {
                      const matched = COUNTRIES_DATA.find(c => c.country.toLowerCase().trim() === offer.partnerName.toLowerCase().trim());
                      const iso = matched?.iso;
                      if (!iso || iso.length !== 2) {
                        return (
                          <div className="w-8 h-5 rounded-sm bg-root-canvas border border-root-accent/20 flex-shrink-0" />
                        );
                      }
                      return (
                        <div className="w-8 h-5 rounded-sm overflow-hidden border border-root-accent/30 flex-shrink-0 bg-root-canvas relative">
                          <img
                            src={`https://flagcdn.com/w80/${iso.toLowerCase()}.png`}
                            alt={getLocalizedCountryName(offer.partnerName, language)}
                            className="w-full h-full object-cover absolute inset-0"
                          />
                        </div>
                      );
                    })()}
                    <span>{getLocalizedCountryName(offer.partnerName, language)}</span>
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-root-accent">
                    {(() => {
                      const isArmsOffer = offer.marketType === "arms";
                      const translated = t(`navigation_economy_trade.transaction.${isArmsOffer ? "armsProducts" : "products"}.${offer.productKey}`);
                      if (!translated.startsWith("navigation_economy_trade.")) return translated;
                      return isArmsOffer
                        ? getArmsTradeProducts().find(product => product.dataKey === offer.productKey)?.label || formatLabel(offer.productKey)
                        : formatLabel(offer.productKey);
                    })()}
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold text-root-text">{offer.quantity.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs text-root-subtle">{offer.pricePerUnit.toLocaleString(language, { maximumFractionDigits: 2 })} NEO</td>
                  <td className="px-4 py-3 text-xs font-bold text-root-accent">{offer.totalPrice.toLocaleString(language, { maximumFractionDigits: 2 })} NEO</td>
                  <td className="px-4 py-3 flex justify-center">
                    {!isExpired ? (
                      <button
                        onClick={() => onAcceptOffer(offer)}
                        className="px-3 py-1.5 rounded bg-root-accent hover:bg-root-accent/80 text-root-canvas text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                      >
                        {offer.marketType === "arms"
                          ? t(offer.armsDirection === "buy_from_partner"
                            ? "navigation_economy_trade.offers.buy"
                            : "navigation_economy_trade.offers.sell")
                          : t("navigation_economy_trade.offers.accept")}
                      </button>
                    ) : (
                      <span className="px-3 py-1.5 rounded bg-root-canvas text-root-subtle text-[10px] font-bold uppercase cursor-not-allowed border border-root-subtle/30">
                        {t("navigation_economy_trade.offers.expired")}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </RootTable>
    </div>
  );
}