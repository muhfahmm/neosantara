'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Landmark, Activity, Building2, Search, ScrollText, ShieldCheck } from 'lucide-react';
import NotebookModalWrapper from '../../NotebookModalWrapper';
import MenuInfoButton from '../../MenuInfoButton';
import RootInfoModalHeader from '@/app/page/root_modals_design_menu/RootInfoModalHeader';
import RootModalTabs from '@/app/page/root_modals_design_menu/RootModalTabs';
import IndeksKorupsiCard from './components/IndeksKorupsiCard';
import LembagaAntikorupsiPanel from './components/LembagaAntikorupsiPanel';
import SkandalAktifList from './components/SkandalAktifList';
import DampakSektorCard from './components/DampakSektorCard';
import {
  conductBudgetAudit,
  improveWhistleblowerProtection,
  upgradeAntiCorruptionAgency,
} from './logic/auditLogic';
import { getCorruptionMetrics, type CorruptionCountryDetail } from './logic/corruptionLogic';
import { investigateScandal, prosecuteScandal } from './logic/scandalLogic';

type CorruptionTab = 'ringkasan' | 'lembaga' | 'penyelidikan' | 'kasus' | 'dampak';

interface KorupsiMenuProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail: CorruptionCountryDetail | null;
  setCountryDetail: (
    detail: CorruptionCountryDetail | ((previous: CorruptionCountryDetail) => CorruptionCountryDetail)
  ) => void;
  currentDate?: Date;
  setPresidentRating?: (rating: number) => void;
}

const corruptionProfileFields = [
  'anti_corruption_agency_level',
  'whistleblower_protection',
] as const;

function hasCorruptionProfile(detail: CorruptionCountryDetail | null): boolean {
  return Boolean(detail) && corruptionProfileFields.every((field) => {
    const value = detail?.[field];
    return value !== null && value !== undefined && Number.isFinite(Number(value));
  });
}

export default function KorupsiMenu({
  isOpen,
  onClose,
  countryDetail,
  setCountryDetail,
  currentDate,
  setPresidentRating,
}: KorupsiMenuProps) {
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [profileLoadError, setProfileLoadError] = useState<{ identity: string; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<CorruptionTab>('ringkasan');
  const countryIdentity = String(
    countryDetail?.country_slug ??
    countryDetail?.iso ??
    countryDetail?.name_id ??
    countryDetail?.name_en ??
    '',
  ).trim();
  const needsProfileLoad = Boolean(isOpen && countryDetail && !hasCorruptionProfile(countryDetail) && countryIdentity);
  const currentProfileError = profileLoadError?.identity === countryIdentity ? profileLoadError.message : '';
  const profileLoading = needsProfileLoad && !currentProfileError;
  const actionsBlocked = busy || (isOpen && Boolean(countryDetail) && !hasCorruptionProfile(countryDetail));
  const profileIdentityError = isOpen && countryDetail && !hasCorruptionProfile(countryDetail) && !countryIdentity
    ? 'Identitas negara tidak tersedia untuk memuat data antikorupsi.'
    : '';

  useEffect(() => {
    if (!isOpen || !countryDetail || hasCorruptionProfile(countryDetail)) return;
    if (!countryIdentity) return;

    let cancelled = false;

    fetch(`/api/country-data?path=${encodeURIComponent(`${countryIdentity}.ts`)}`, { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Permintaan data negara gagal (${response.status}).`);
        }
        return response.json() as Promise<CorruptionCountryDetail>;
      })
      .then((databaseCountry) => {
        const hasDatabaseProfile = corruptionProfileFields.every((field) => {
          const value = databaseCountry[field];
          return value !== null && value !== undefined && Number.isFinite(Number(value));
        });
        if (!hasDatabaseProfile) {
          throw new Error('Data level antikorupsi negara ini belum tersedia.');
        }
        if (cancelled) return;

        setProfileLoadError(null);
        setCountryDetail((previous) => {
          const updated = { ...previous };
          for (const field of corruptionProfileFields) {
            const currentValue = updated[field];
            if (
              currentValue === null ||
              currentValue === undefined ||
              !Number.isFinite(Number(currentValue))
            ) {
              updated[field] = databaseCountry[field];
            }
          }
          return updated;
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat data antikorupsi.';
        console.error('KorupsiMenu: gagal memuat data antikorupsi negara', error);
        setProfileLoadError({ identity: countryIdentity, message });
      });

    return () => {
      cancelled = true;
    };
  }, [countryDetail, countryIdentity, isOpen, setCountryDetail]);

  if (!isOpen || !countryDetail) return null;

  const runAction = (action: (detail: CorruptionCountryDetail, date: Date) => {
    updatedDetail: CorruptionCountryDetail;
    message: string;
    cost: number;
  } | null) => {
    if (actionsBlocked) return;
    setBusy(true);
    try {
      const result = action(countryDetail, currentDate ?? new Date());
      if (!result) {
        setNotice('Aksi tidak tersedia: periksa anggaran, level, atau apakah audit bulan ini sudah dilakukan.');
        return;
      }
      setCountryDetail(result.updatedDetail);
      if (typeof result.updatedDetail.presidentRating === 'number') {
        setPresidentRating?.(result.updatedDetail.presidentRating);
      }
      setNotice(result.message);
    } finally {
      setBusy(false);
    }
  };

  const runInvestigation = (scandalId: string, action: typeof investigateScandal | typeof prosecuteScandal) => {
    if (actionsBlocked) return;
    setBusy(true);
    try {
      const result = action(countryDetail, scandalId, currentDate ?? new Date());
      if (!result) {
        setNotice('Kasus tidak dapat diproses. Pastikan bukti tersedia untuk penuntutan dan anggaran mencukupi untuk penyelidikan.');
        return;
      }
      setCountryDetail(result.updatedDetail);
      if (typeof result.updatedDetail.presidentRating === 'number') {
        setPresidentRating?.(result.updatedDetail.presidentRating);
      }
      setNotice(result.message);
    } finally {
      setBusy(false);
    }
  };

  const activeCases = getCorruptionMetrics(countryDetail).scandals.filter(scandal => !scandal.resolved).length;
  const tabs: { id: CorruptionTab; label: string; icon: typeof Activity }[] = [
    { id: 'ringkasan', label: 'Ringkasan', icon: Activity },
    { id: 'lembaga', label: 'Lembaga & Reformasi', icon: ShieldCheck },
    { id: 'penyelidikan', label: 'Audit & Penyelidikan', icon: Search },
    { id: 'kasus', label: `Daftar Kasus (${activeCases})`, icon: ScrollText },
    { id: 'dampak', label: 'Dampak Sektor', icon: Building2 },
  ];

  return (
    <NotebookModalWrapper onClose={onClose}>
      <div className="root-modal-util-b74379da23">
        <RootInfoModalHeader
          title="Pemberantasan Korupsi"
          icon={<Landmark aria-hidden="true" />}
          onClose={onClose}
          closeAriaLabel="Tutup menu pemberantasan korupsi"
          size="standard"
          actions={
            <MenuInfoButton
              title="Pemberantasan Korupsi"
              description="Pantau indeks korupsi, lembaga antikorupsi, penyelidikan, kasus aktif, dan dampak korupsi pada sektor negara. Gunakan audit serta perlindungan pelapor untuk memperkuat pengawasan dan penegakan hukum."
            />
          }
        />

        <nav aria-label="Bagian pemberantasan korupsi" className="satisfaction-modal-summary root-modal-util-6614545ce3">
          <RootModalTabs
            className="satisfaction-modal-tabs"
            compact
            items={tabs.map(({ id, label, icon: Icon }) => ({
              label,
              isActive: activeTab === id,
              onClick: () => setActiveTab(id),
              icon: <Icon className="h-4 w-4" />,
            }))}
          />
        </nav>

        <main className="satisfaction-modal-content root-modal-util-9c12d57a09">
          <div className="satisfaction-modal-content-body root-modal-enter root-modal-fade-in root-modal-util-90f9f3a7db">
            {(notice || currentProfileError || profileIdentityError) && (
              <div role="status" className="flex items-start gap-2 rounded-xl border border-root-accent/20 bg-root-accent/5 px-4 py-3 text-sm text-[#B7F5DD]">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-root-accent" />
                <span>{notice || currentProfileError || profileIdentityError}</span>
              </div>
            )}
            {profileLoading && (
              <div role="status" className="rounded-xl border border-root-accent/20 bg-root-accent/5 px-4 py-3 text-sm text-[#B7F5DD]">
                Memuat data level antikorupsi negara...
              </div>
            )}
            {(activeTab === 'ringkasan' || activeTab === 'penyelidikan') && (
              <IndeksKorupsiCard countryDetail={countryDetail} />
            )}
            {(activeTab === 'lembaga' || activeTab === 'penyelidikan') && (
              <LembagaAntikorupsiPanel
                countryDetail={countryDetail}
                currentDate={currentDate}
                busy={actionsBlocked}
                onUpgradeAgency={targetLevel => runAction(
                  (detail, date) => upgradeAntiCorruptionAgency(detail, date, targetLevel),
                )}
                onImproveProtection={targetLevel => runAction(
                  (detail, date) => improveWhistleblowerProtection(detail, date, targetLevel),
                )}
                onAudit={() => runAction(conductBudgetAudit)}
              />
            )}
            {(activeTab === 'kasus' || activeTab === 'penyelidikan') && (
              <SkandalAktifList
                countryDetail={countryDetail}
                busy={actionsBlocked}
                onInvestigate={scandalId => runInvestigation(scandalId, investigateScandal)}
                onProsecute={scandalId => runInvestigation(scandalId, prosecuteScandal)}
              />
            )}
            {(activeTab === 'dampak' || activeTab === 'ringkasan') && (
              <DampakSektorCard countryDetail={countryDetail} />
            )}
          </div>
        </main>
      </div>
    </NotebookModalWrapper>
  );
}