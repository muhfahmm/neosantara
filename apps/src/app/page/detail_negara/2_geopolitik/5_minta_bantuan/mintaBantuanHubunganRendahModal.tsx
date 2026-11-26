'use client';

import { CircleAlert } from 'lucide-react';
import RootConfirmModal from '@/app/page/root_modals_design_menu/RootConfirmModal';
import { useLanguage } from '@/app/page/paused_menu/terjemahan_paused_menu/languageLogic';
import { getLocalizedCountryName } from '@/app/logic/countryNameLogic';

interface MintaBantuanHubunganRendahModalProps {
  isOpen: boolean;
  countryName: string;
  relationValue: number;
  onClose: () => void;
}

export default function MintaBantuanHubunganRendahModal({
  isOpen,
  countryName,
  relationValue,
  onClose,
}: MintaBantuanHubunganRendahModalProps) {
  const { t, language } = useLanguage();

  return (
    <RootConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('detail_negara_ai.geopolitics.aidRelationTooLowTitle')}
      icon={<CircleAlert className="h-4 w-4 text-root-accent" />}
      variant="info"
      footerBorderClassName="border-root-accent/20"
      zIndexClass="z-[100000001]"
    >
      <p className="text-sm sm:text-base text-root-text leading-relaxed">
        {t('detail_negara_ai.geopolitics.aidRelationTooLowMessage', {
          country: getLocalizedCountryName(countryName, language),
          relation: relationValue,
        })}
      </p>
    </RootConfirmModal>
  );
}
