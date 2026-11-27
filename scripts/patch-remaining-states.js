const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../apps/src/app/page/map_system/map-system.tsx');
let file = fs.readFileSync(filePath, 'utf8');

// 1. TAMBAHKAN IMPORT loadStationedPeacekeepers, saveStationedPeacekeepers
const importPeacekeeperOld = `import {
    addStationedPeacekeeper,
    getStationedPeacekeeperPower,
    getStationedPeacekeeper,
    removeStationedPeacekeeper,
    restoreStationedPeacekeeperUnits,
} from '../path_logic/peacekeeper/peacekeeperLogic';`;

const importPeacekeeperNew = `import {
    addStationedPeacekeeper,
    getStationedPeacekeeperPower,
    getStationedPeacekeeper,
    removeStationedPeacekeeper,
    restoreStationedPeacekeeperUnits,
    loadStationedPeacekeepers,
    saveStationedPeacekeepers,
} from '../path_logic/peacekeeper/peacekeeperLogic';`;

// 2. PERBAIKI INITIALIZE CLOCK DENGAN MEMBACA METADATA DARI SESSIONSTORAGE DENGAN BENAR
const initClockOld = `                if (loadSaveStr) {
                    try {
                        const savedState = JSON.parse(loadSaveStr);
                        if (savedState.game_date) {
                            timeManager.setCurrentDate(new Date(savedState.game_date));
                        }
                    } catch (err) {
                        console.error("Failed to restore date from save:", err);
                    }
                }`;

const initClockNew = `                if (loadSaveStr) {
                    try {
                        const savedMetadata = JSON.parse(loadSaveStr);
                        const targetDate = savedMetadata.game_date || savedMetadata.gameDate;
                        if (targetDate) {
                            timeManager.setCurrentDate(new Date(targetDate));
                        }
                    } catch (err) {
                        console.error("Failed to restore date from save:", err);
                    }
                }`;

// 3. TAMBAHKAN PEACEKEEPER, COVERT PERSONNEL, PBB, & REQUESTED INVASIONS KE SESSIONSTATE SAAT SAVE
const sessionStateOld = `            const sessionState = {
                npcSimulation: getNpcCountrySimulationSnapshot(),
                countryColorOverrides: (window as any).neosantara_country_color_overrides || countryColorOverrides,
                annexedCountries: (window as any).neosantara_annexed_countries || {},
                cityOwner: (window as any).neosantara_city_owner || {},
                provinceReligionOverrides: (window as any).neosantara_province_religion_overrides || {},
                provinceIdeologyOverrides: (window as any).neosantara_province_ideology_overrides || {},
                playerAttack: (window as any).neosantara_player_attack || null,
            };`;

const sessionStateNew = `            const sessionState = {
                npcSimulation: getNpcCountrySimulationSnapshot(),
                countryColorOverrides: (window as any).neosantara_country_color_overrides || countryColorOverrides,
                annexedCountries: (window as any).neosantara_annexed_countries || {},
                cityOwner: (window as any).neosantara_city_owner || {},
                provinceReligionOverrides: (window as any).neosantara_province_religion_overrides || {},
                provinceIdeologyOverrides: (window as any).neosantara_province_ideology_overrides || {},
                playerAttack: (window as any).neosantara_player_attack || null,
                stationedPeacekeepers: loadStationedPeacekeepers(),
                covertPersonnel: typeof window !== 'undefined' ? gameStateStorage.getItem('neosantara_covert_personnel') : null,
                requestedInvasions: typeof window !== 'undefined' ? gameStateStorage.getItem('requested_attack_requests_v1') : null,
                pbbSecurityCouncilState: typeof window !== 'undefined' ? gameStateStorage.getItem('pbb_security_council_election_state_v1') : null,
                pbbWarSanctions: typeof window !== 'undefined' ? gameStateStorage.getItem('pbb_war_sanction_history_v1') : null,
                pendingOrgApplications: typeof window !== 'undefined' ? gameStateStorage.getItem('org_membership_pending_applications_v1') : null,
            };`;

// 4. PULIHKAN SEMUA DATA INI SAAT LOAD
const restoreLoadOld = `                        // Pulihkan status Program Nuklir & Stok Rudal ICBM User
                        if (restoredDetail.programNuklirActive !== undefined) {
                            if (restoredDetail.programNuklirActive) {
                                gameStateStorage.setItem('programNuklirActive', '1');
                            } else {
                                gameStateStorage.removeItem('programNuklirActive');
                            }
                        }
                        if (restoredDetail.icbmBuildTask !== undefined) {
                            if (restoredDetail.icbmBuildTask) {
                                gameStateStorage.setItem('icbmBuildTask', JSON.stringify(restoredDetail.icbmBuildTask));
                            } else {
                                gameStateStorage.removeItem('icbmBuildTask');
                            }
                        }`;

const restoreLoadNew = `                        // Pulihkan status Program Nuklir & Stok Rudal ICBM User
                        if (restoredDetail.programNuklirActive !== undefined) {
                            if (restoredDetail.programNuklirActive) {
                                gameStateStorage.setItem('programNuklirActive', '1');
                            } else {
                                gameStateStorage.removeItem('programNuklirActive');
                            }
                        }
                        if (restoredDetail.icbmBuildTask !== undefined) {
                            if (restoredDetail.icbmBuildTask) {
                                gameStateStorage.setItem('icbmBuildTask', JSON.stringify(restoredDetail.icbmBuildTask));
                            } else {
                                gameStateStorage.removeItem('icbmBuildTask');
                            }
                        }

                        // Pulihkan Pasukan Perdamaian PBB (Stationed Peacekeepers)
                        if (Array.isArray(sessionState.stationedPeacekeepers)) {
                            saveStationedPeacekeepers(sessionState.stationedPeacekeepers);
                        }

                        // Pulihkan Personel Intelijen (Covert Personnel)
                        if (sessionState.covertPersonnel) {
                            gameStateStorage.setItem('neosantara_covert_personnel', sessionState.covertPersonnel);
                            try {
                                const parsedCovert = JSON.parse(sessionState.covertPersonnel);
                                window.dispatchEvent(new CustomEvent('neosantara_covert_personnel_updated', { detail: parsedCovert }));
                            } catch {}
                        }

                        // Pulihkan Permintaan Invasi Sekutu
                        if (sessionState.requestedInvasions) {
                            gameStateStorage.setItem('requested_attack_requests_v1', sessionState.requestedInvasions);
                        }

                        // Pulihkan Status Dewan Keamanan PBB & Sanksi Perang
                        if (sessionState.pbbSecurityCouncilState) {
                            gameStateStorage.setItem('pbb_security_council_election_state_v1', sessionState.pbbSecurityCouncilState);
                        }
                        if (sessionState.pbbWarSanctions) {
                            gameStateStorage.setItem('pbb_war_sanction_history_v1', sessionState.pbbWarSanctions);
                        }
                        if (sessionState.pendingOrgApplications) {
                            gameStateStorage.setItem('org_membership_pending_applications_v1', sessionState.pendingOrgApplications);
                        }`;

const normalizedFile = file.replace(/\r\n/g, '\n');
const normImportOld = importPeacekeeperOld.replace(/\r\n/g, '\n');
const normImportNew = importPeacekeeperNew.replace(/\r\n/g, '\n');
const normInitClockOld = initClockOld.replace(/\r\n/g, '\n');
const normInitClockNew = initClockNew.replace(/\r\n/g, '\n');
const normSessionOld = sessionStateOld.replace(/\r\n/g, '\n');
const normSessionNew = sessionStateNew.replace(/\r\n/g, '\n');
const normRestoreOld = restoreLoadOld.replace(/\r\n/g, '\n');
const normRestoreNew = restoreLoadNew.replace(/\r\n/g, '\n');

if (!normalizedFile.includes(normImportOld)) {
    console.error('Import peacekeeper not found!');
    process.exit(1);
}
if (!normalizedFile.includes(normInitClockOld)) {
    console.error('Init clock not found!');
    process.exit(1);
}
if (!normalizedFile.includes(normSessionOld)) {
    console.error('Session state not found!');
    process.exit(1);
}
if (!normalizedFile.includes(normRestoreOld)) {
    console.error('Restore load not found!');
    process.exit(1);
}

let replaced = normalizedFile.replace(normImportOld, normImportNew);
replaced = replaced.replace(normInitClockOld, normInitClockNew);
replaced = replaced.replace(normSessionOld, normSessionNew);
replaced = replaced.replace(normRestoreOld, normRestoreNew);

fs.writeFileSync(filePath, replaced, 'utf8');
console.log('Successfully patched all remaining critical states in map-system.tsx');
