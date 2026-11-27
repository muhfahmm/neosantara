import { gameStateStorage } from '@/app/logic/gameStateStorage';
import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
import { useState, useEffect } from "react";
import { X, Heart, Coins, Sparkles, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import DanaTidakCukupModal from "../../1_kepuasan/2_naikkan_kepuasan/DanaTidakCukupModal";
import { markMissionAsClaimable } from "@/app/page/menus/mission/missionModals";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

interface NaikkanKesejahteraanTabProps {
  countryDetail: any;
  setCountryDetail: (detail: any) => void;
  selectedCountry: any;
  currentDate?: string | Date;
}

const MISSION_ID_BY_INITIATIVE: Record<string, string> = {
  cash_transfer: 'kes_bantuan_tunai',
  food_subsidy: 'kes_subsidi_pangan',
  student_aid: 'kes_bantuan_pendidikan',
  health_coverage: 'kes_jaminan_kesehatan',
  housing_upgrade: 'kes_perbaikan_rumah',
  national_market: 'kes_pasar_murah',
};

export default function NaikkanKesejahteraanTab({
  countryDetail,
  setCountryDetail,
  selectedCountry,
  currentDate,
}: NaikkanKesejahteraanTabProps) {
  const { t, language } = useLanguage();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isDanaTidakCukupOpen, setIsDanaTidakCukupOpen] = useState(false);
  const [pendingCost, setPendingCost] = useState(0);
  const [pendingTitle, setPendingTitle] = useState("");
  const [activeMissionId, setActiveMissionId] = useState<string | null>(null);
  const [highlightedInitId, setHighlightedInitId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentActive = gameStateStorage.getItem("presiden_simulator_active_mission");
      setActiveMissionId(currentActive);

      // Cari init.id yang cocok dengan active mission saat tab dimuat
      if (currentActive) {
        const found = Object.entries(MISSION_ID_BY_INITIATIVE).find(([, missionId]) => missionId === currentActive);
        if (found) {
          setHighlightedInitId(found[0]);
          const timer = setTimeout(() => {
            setHighlightedInitId(null);
          }, 6000);
          return () => clearTimeout(timer);
        }
      }

      const handleActiveUpdate = (e: any) => {
        const newActive = e.detail?.cardId ?? gameStateStorage.getItem("presiden_simulator_active_mission");
        setActiveMissionId(newActive);
        if (newActive) {
          const found = Object.entries(MISSION_ID_BY_INITIATIVE).find(([, missionId]) => missionId === newActive);
          if (found) {
            setHighlightedInitId(found[0]);
            setTimeout(() => {
              setHighlightedInitId(null);
            }, 6000);
          }
        }
      };

      window.addEventListener("mission_active_updated", handleActiveUpdate);
      return () => window.removeEventListener("mission_active_updated", handleActiveUpdate);
    }
  }, []);

  const countryName = selectedCountry?.country || "Indonesia";
  const anggaran = countryDetail?.anggaran || 0;

  // Helper untuk menambah hari
  const addDays = (dateString: string, days: number): string => {
    const [y, m, d] = dateString.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + days);
    const yy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
  };

  // Mendapatkan tanggal saat ini dalam format YYYY-MM-DD
  const getSafeDateString = (): string => {
    if (currentDate) {
      const d = currentDate instanceof Date ? currentDate : new Date(currentDate);
      if (!isNaN(d.getTime())) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      }
    }
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // ==========================================
  // DATA INISIATIF KESEJAHTERAAN (Universal)
  // ==========================================
  const initiatives = [
    {
      id: "cash_transfer",
      title: t("navigation_population_welfare_initiatives.initiatives.cashTransfer"),
      cost: 40000,
      boost: 4,
      duration: 7,
      icon: Coins,
    },
    {
      id: "food_subsidy",
      title: t("navigation_population_welfare_initiatives.initiatives.foodSubsidy"),
      cost: 75000,
      boost: 8,
      duration: 30,
      icon: Sparkles,
    },
    {
      id: "student_aid",
      title: t("navigation_population_welfare_initiatives.initiatives.studentAid"),
      cost: 120000,
      boost: 12,
      duration: 7,
      icon: Sparkles,
    },
    {
      id: "health_coverage",
      title: t("navigation_population_welfare_initiatives.initiatives.healthCoverage"),
      cost: 250000,
      boost: 18,
      duration: 30,
      icon: Heart,
    },
    {
      id: "housing_upgrade",
      title: t("navigation_population_welfare_initiatives.initiatives.housingUpgrade"),
      cost: 600000,
      boost: 25,
      duration: 14,
      icon: Sparkles,
    },
    {
      id: "national_market",
      title: t("navigation_population_welfare_initiatives.initiatives.nationalMarket"),
      cost: 1000000,
      boost: 35,
      duration: 20,
      icon: Sparkles,
    },
  ];

  const formatBadgeDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const [y, m, d] = dateString.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      if (isNaN(date.getTime())) return dateString;
      const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
      const parts = new Intl.DateTimeFormat(language, options).formatToParts(date);
      const day = parts.find((p) => p.type === 'day')?.value || '';
      const month = parts.find((p) => p.type === 'month')?.value || '';
      const year = parts.find((p) => p.type === 'year')?.value || '';
      return `${day} ${month}, ${year}`;
    } catch {
      return dateString;
    }
  };

  const handleLaunchInitiative = (init: typeof initiatives[0]) => {
    if (anggaran < init.cost) {
      setPendingCost(init.cost);
      setPendingTitle(init.title);
      setIsDanaTidakCukupOpen(true);
      return;
    }

    const safeDateString = getSafeDateString();
    const endStr = addDays(safeDateString, init.duration);

    // Struktur konstruksi inisiatif baru
    const newConstruction = {
      id: `${init.id}_${Date.now()}`,
      type: "event",
      name: init.title,
      cost: init.cost,
      boost: init.boost,
      startDate: safeDateString,
      endDate: endStr,
      progress: 0,
      targetDays: init.duration,
      buildingKey: init.id,
      category: "Kesejahteraan",
    };

    const newConstructions = [...(countryDetail.ongoingConstructions || []), newConstruction];
    const newAnggaran = Math.max(0, anggaran - init.cost);

    setCountryDetail({
      ...countryDetail,
      anggaran: newAnggaran,
      ongoingConstructions: newConstructions,
    });

    const matchingMissionId = MISSION_ID_BY_INITIATIVE[init.id];
    if (matchingMissionId) {
      markMissionAsClaimable(matchingMissionId);
    }

    setFeedback({
      type: "success",
      message: t("navigation_population_welfare_initiatives.success", {
        title: init.title,
        date: formatBadgeDate(endStr),
      }),
    });
  };

  // Run event completion check on date changes
  useEffect(() => {
    if (!countryDetail || !currentDate) return;

    const safeDateString = getSafeDateString();
    let now: Date;
    try {
      now = new Date(safeDateString + 'T00:00:00');
      if (isNaN(now.getTime())) throw new Error('Invalid date');
    } catch {
      now = new Date();
    }

    const ongoing = countryDetail.ongoingConstructions || [];
    let updated = false;
    let newConstructions = [...ongoing];
    let newDetail = { ...countryDetail };

    const completedEvents = newConstructions.filter((c) => {
      if (c.type !== "event" || c.category !== "Kesejahteraan") return false;
      let endDate: Date;
      try {
        endDate = new Date(c.endDate + 'T00:00:00');
        if (isNaN(endDate.getTime())) throw new Error('Invalid endDate');
      } catch {
        return false;
      }
      return endDate <= now;
    });

    if (completedEvents.length > 0) {
      completedEvents.forEach((c) => {
        const boost = Number(c.boost) || 0;
        newDetail.kesejahteraan_index = Math.min(100, (newDetail.kesejahteraan_index ?? 50) + boost);
        newDetail.kesejahteraan_bonus = (newDetail.kesejahteraan_bonus ?? 0) + boost;
        newDetail.kesejahteraan = Math.min(100, (newDetail.kesejahteraan ?? 50) + boost);
      });

      const completedIds = completedEvents.map((c) => c.id);
      newConstructions = newConstructions.filter((c) => !completedIds.includes(c.id));
      newDetail.ongoingConstructions = newConstructions;
      updated = true;
    }

    if (updated) {
      setCountryDetail(newDetail);
    }
  }, [currentDate, countryDetail]);

  const ongoingEvents = (countryDetail.ongoingConstructions || []).filter(
    (c: any) => c.type === "event" && c.category === "Kesejahteraan"
  );

  return (
    <div className={"root-modal-util-3e7ce58d64"}>

      {feedback && (
        <div className={`root-modal-util-eb6e8b881a root-modal-util-5f22e64f22 root-modal-util-b9d93c341b ${
          feedback.type === "success" ? "root-modal-util-f0540b9655" : "root-modal-util-659ef898cf"
        }`}>
          {feedback.type === "success" ? <CheckCircle2 className={"root-modal-util-bc643f29b2"} /> : <AlertCircle className={"root-modal-util-bc643f29b2"} />}
          <div className={"root-modal-util-d7f9f80dec"}>{feedback.message}</div>
          <SharedModalCloseButton onClick={() => setFeedback(null)} className={"root-modal-util-5a1139abf9"} appearance="custom">
            <X className={"root-modal-util-ce72f65c94"} />
          </SharedModalCloseButton>
        </div>
      )}

      {/* Daftar Program Bantuan */}
      <div className={"root-modal-util-d3a5be7eaf"}>
        {initiatives.map((init) => {
          const isLaunched = ongoingEvents.some((c: any) => c.buildingKey === init.id);
          const Icon = init.icon;
          const isHighlighted = highlightedInitId === init.id;

          return (
            <div
              key={init.id}
              id={`initiative-card-${init.id}`}
              className={`root-modal-util-5f22e64f22 root-modal-util-ebef822ec6 ${
                isHighlighted
                  ? "root-modal-util-9a76816029"
                  : isLaunched
                  ? "root-modal-util-cfc6f10857"
                  : "root-modal-util-004a18b3e0"
              }`}
            >
              {isLaunched && (
                <div className={"root-modal-util-65ecbf5d72"}>
                  <Clock className={"root-modal-util-a9546f0c0b"} />
                  {t("navigation_population_welfare_initiatives.running")}
                </div>
              )}

              <div className={"root-modal-util-9249627d1f"}>
                <div className={"root-modal-util-b547447a18"}>
                  <Icon className={"root-modal-util-b3763eee6f"} />
                </div>
                <div>
                  <h4 className={"root-modal-util-40903f9bc1"}>{init.title}</h4>
                  <p className={"root-modal-util-aaa3ba0056"}>{t("navigation_population_welfare_initiatives.welfareBoost", { value: init.boost })}</p>
                </div>
              </div>

              <div className={"root-modal-util-218307b888"}>
                <div className={"root-modal-util-38d6c4f454"}>
                  <p>{t("navigation_population_welfare_initiatives.cost")} <span className={"root-modal-util-ca525b9094"}>{init.cost.toLocaleString(language, { maximumFractionDigits: 2 })} NEO</span></p>
                  <p>{t("navigation_population_welfare_initiatives.duration")} <span className={"root-modal-util-da18d116be"}>{t("navigation_population_welfare_initiatives.days", { value: init.duration })}</span></p>
                </div>

                <button
                  onClick={() => handleLaunchInitiative(init)}
                  disabled={isLaunched}
                  className={`root-modal-util-972d6c7553 ${
                    isLaunched
                      ? "root-modal-util-559336f723"
                      : "root-modal-util-ec7258ed63"
                  }`}
                >
                  {isLaunched
                    ? t("navigation_population_welfare_initiatives.active")
                    : t("navigation_population_welfare_initiatives.launch")}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dana tidak cukup modal overlay */}
      <DanaTidakCukupModal
        isOpen={isDanaTidakCukupOpen}
        onClose={() => setIsDanaTidakCukupOpen(false)}
        requiredCost={pendingCost}
        currentBudget={anggaran}
        actionName={t("navigation_satisfaction_increase.insufficientFunds.sponsor", {
          title: pendingTitle,
        })}
      />
    </div>
  );
}