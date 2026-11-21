"use client"
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import RootInfoModalHeader from "@/app/page/root_modals_design_menu/RootInfoModalHeader";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

interface IdeologiInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  bonusText?: string;
  description?: string;
}

export default function IdeologiInfoModal({
  isOpen,
  onClose,
  title,
  icon,
  bonusText,
}: IdeologiInfoModalProps) {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const ideoKey = title.toLowerCase().replace(/\s+/g, '_');
  const localizedTitle = t(`nav_sosial_budaya_ideologi.ideologies.${ideoKey}` as any) || title;
  const localizedBonus = t(`nav_sosial_budaya_ideologi.bonuses.${ideoKey}` as any) || bonusText;
  const detailKey = `nav_sosial_budaya_ideologi.infoModal.details.${ideoKey}`;
  const localizedDescription = t(`${detailKey}.description` as any);
  const localizedCharacteristics = ['first', 'second', 'third'].map((item) =>
    t(`${detailKey}.characteristics.${item}` as any)
  );

  return createPortal(
    <NotebookModalWrapper
      compact
      contentSized
      frameClassName="content-sized-info-frame"
      onClose={onClose}
      zIndexClass="z-[250]"
    >
      <div className="root-modal-util-b74379da23">
        <RootInfoModalHeader
          title={
            <>
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-root-accent">
                <Info aria-hidden="true" className="h-3 w-3" />
                {t('nav_sosial_budaya_ideologi.infoModal.title') || 'Informasi Ideologi'}
              </span>
              <span className="block truncate">{localizedTitle}</span>
            </>
          }
          onClose={onClose}
          icon={icon || <Info aria-hidden="true" />}
          size="standard"
        />

        <div className="root-info-modal-content relative z-10 flex flex-col justify-center gap-4 bg-root-surface p-4 sm:p-6">
          <div className="rounded-xl border border-root-accent/20 bg-root-canvas p-4 sm:p-5">
            <p className="mb-2 text-sm font-bold text-root-text">{localizedDescription}</p>
            <ul className="space-y-1.5 text-xs text-root-subtle">
              {localizedCharacteristics.map((characteristic) => (
                <li key={characteristic} className="flex items-start gap-2">
                  <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-root-accent" />
                  <span>{characteristic}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-root-accent/30 bg-root-accent/10 p-4 text-center sm:p-6">
            <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-root-accent">
              {t('nav_sosial_budaya_ideologi.infoModal.sectionBonuses') || 'Bonus & Efek Utama Negara'}
            </span>
            <p className="text-lg sm:text-xl font-extrabold text-root-text">
              {localizedBonus || 'Tidak ada bonus spesifik'}
            </p>
          </div>
        </div>
      </div>
    </NotebookModalWrapper>,
    document.body
  );
}