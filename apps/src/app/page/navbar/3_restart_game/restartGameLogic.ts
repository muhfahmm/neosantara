import { clearActiveNpcCountrySimulationState } from '@/app/logic/npc_country_simulation/npcCountrySimulation';
import { handleGameRestart } from '@/app/page/time_controllers';
import type { SimulationTimeManager } from '@/app/page/time_controllers/timeManager';

export interface RestartGameOptions {
    selectedCountry: { country: string; capital: string } | null;
    timeManager: SimulationTimeManager | null;
    clearMissionProgress: () => void;
    loadCountryStats: (country: string, capital: string) => Promise<void>;
    setActivePlayerAttack: () => void;
    setIsPaused: (paused: boolean) => void;
    setSpeed: (speed: number) => void;
    setCountryDetail: NonNullable<Parameters<typeof handleGameRestart>[0]['setCountryDetail']>;
    setPlayerDiamonds: (diamonds: number) => void;
    setPlayerNetBalanceAdjustment: (adjustment: number) => void;
    setPresidentRating: (rating: number) => void;
    setKesejahteraan: (value: number) => void;
    setNotifications: () => void;
    setNewsList: () => void;
    lastObservedNewsResetDateRef: { current: string | null };
    setHasShownEarlyWarning: (flags: { kepuasan: boolean; peringkat: boolean; kesejahteraan: boolean }) => void;
    setHasShownRatingWarning: (shown: boolean) => void;
    setProductionDeepLink: () => void;
    setTempatUmumDeepLink: () => void;
    setKesejahteraanDeepLink: (enabled: boolean) => void;
    setAiConstructionNavigation: () => void;
    setCountryColorOverrides: (overrides: Record<string, string>) => void;
    setCountryDetailModalOpen: (open: boolean) => void;
    setPlayerDetailModalOpen: (open: boolean) => void;
    setInboxModalOpen: (open: boolean) => void;
    setGiftModalOpen: (open: boolean) => void;
    setNewsModalOpen: (open: boolean) => void;
    setPenelitianModalOpen: (open: boolean) => void;
    setMissionModalOpen: (open: boolean) => void;
    setActiveMenu: (menu: string) => void;
    resetTutorial: () => void;
    setTutorialStartup: (startup: 'new-game') => void;
    setIsTutorialWelcomeOpen: (open: boolean) => void;
    setResetTrigger: (update: (previous: boolean) => boolean) => void;
}

export function restartGame(options: RestartGameOptions): void {
    const { selectedCountry } = options;
    options.setActivePlayerAttack();
    if (!selectedCountry) return;

    if (typeof window !== 'undefined') {
        const gameWindow = window as Window & {
            neosantara_country_color_overrides?: Record<string, string>;
            neosantara_annexed_countries?: Record<string, unknown>;
        };
        window.localStorage.removeItem('hutangModalLoanSources');
        window.localStorage.removeItem('hutangModalLoanSourcesLastRefresh');
        options.clearMissionProgress();
        window.localStorage.setItem('player_diamonds', '150');
        options.setPlayerDiamonds(150);
        clearActiveNpcCountrySimulationState();
        gameWindow.neosantara_country_color_overrides = {};
        gameWindow.neosantara_annexed_countries = {};
    }

    handleGameRestart({
        timeManager: options.timeManager,
        setIsPaused: options.setIsPaused,
        setSpeed: options.setSpeed,
        setCountryDetail: options.setCountryDetail,
        reloadStats: () => options.loadCountryStats(selectedCountry.country, selectedCountry.capital),
        skipConfirm: true,
    });

    options.setPlayerNetBalanceAdjustment(0);
    options.setPresidentRating(50);
    options.setKesejahteraan(50);
    options.setNotifications();
    options.setNewsList();
    options.lastObservedNewsResetDateRef.current = null;
    options.setHasShownEarlyWarning({ kepuasan: false, peringkat: false, kesejahteraan: false });
    options.setHasShownRatingWarning(false);
    options.setProductionDeepLink();
    options.setTempatUmumDeepLink();
    options.setKesejahteraanDeepLink(false);
    options.setAiConstructionNavigation();
    options.setCountryColorOverrides({});
    options.setCountryDetailModalOpen(false);
    options.setPlayerDetailModalOpen(false);
    options.setInboxModalOpen(false);
    options.setGiftModalOpen(false);
    options.setNewsModalOpen(false);
    options.setPenelitianModalOpen(false);
    options.setMissionModalOpen(false);
    options.setActiveMenu('Peta Taktis');
    options.resetTutorial();
    options.setTutorialStartup('new-game');
    options.setIsTutorialWelcomeOpen(true);
    options.setResetTrigger(previous => !previous);
}
