const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../apps/src/app/page/map_system/map-system.tsx');
let file = fs.readFileSync(filePath, 'utf8');

// 1. UPDATE HANDLE SAVE GAME
const saveOld = `                    activeMissionId: typeof window !== 'undefined' ? gameStateStorage.getItem('presiden_simulator_active_mission') : null,
                    claimableMissions: typeof window !== 'undefined' ? gameStateStorage.getItem('presiden_simulator_claimable_missions') : null,
                    achievementsState: typeof window !== 'undefined' ? gameStateStorage.getItem('neosantara_achievements_state') : null,`;

const saveNew = `                    activeMissionId: typeof window !== 'undefined' ? gameStateStorage.getItem('presiden_simulator_active_mission') : null,
                    claimableMissions: typeof window !== 'undefined' ? gameStateStorage.getItem('presiden_simulator_claimable_missions') : null,
                    achievementsState: typeof window !== 'undefined' ? gameStateStorage.getItem('neosantara_achievements_state') : null,
                    programNuklirActive: countryDetail?.programNuklirActive ?? (typeof window !== 'undefined' && gameStateStorage.getItem('programNuklirActive') === '1'),
                    icbm_jumlah: Number(countryDetail?.icbm_jumlah ?? countryDetail?.icbm ?? 0),
                    icbm_status: Boolean(countryDetail?.icbm_status ?? (Number(countryDetail?.icbm_jumlah ?? countryDetail?.icbm ?? 0) > 0)),
                    icbm_consumed: Number(countryDetail?.icbm_consumed || 0),
                    icbmBuildTask: countryDetail?.icbmBuildTask || null,`;

// 2. UPDATE LOAD RESTORE GAME
const restoreOld = `                        if (restoredDetail.achievementsState !== undefined) {
                            if (restoredDetail.achievementsState) {
                                gameStateStorage.setItem('neosantara_achievements_state', restoredDetail.achievementsState);
                                try {
                                    const parsedState = JSON.parse(restoredDetail.achievementsState);
                                    window.dispatchEvent(new CustomEvent('achievements_state_updated', { detail: parsedState }));
                                } catch {}
                            } else {
                                clearAchievementProgressData();
                            }
                        }`;

const restoreNew = `                        if (restoredDetail.achievementsState !== undefined) {
                            if (restoredDetail.achievementsState) {
                                gameStateStorage.setItem('neosantara_achievements_state', restoredDetail.achievementsState);
                                try {
                                    const parsedState = JSON.parse(restoredDetail.achievementsState);
                                    window.dispatchEvent(new CustomEvent('achievements_state_updated', { detail: parsedState }));
                                } catch {}
                            } else {
                                clearAchievementProgressData();
                            }
                        }

                        // Pulihkan status Program Nuklir & Stok Rudal ICBM User
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

// 3. UPDATE LOAD COUNTRY STATS (Supaya saat new game atau switch country default nuklir bawaan terpasang)
const loadStatsOld = `                // Ongoing constructions array
                ongoingConstructions: mergedData.ongoingConstructions || [],
                kesejahteraan_bonus: mergedData.kesejahteraan_bonus ?? 0,
                kesejahteraan_decay: mergedData.kesejahteraan_decay ?? 0,
            };`;

const loadStatsNew = `                // Ongoing constructions array
                ongoingConstructions: mergedData.ongoingConstructions || [],
                kesejahteraan_bonus: mergedData.kesejahteraan_bonus ?? 0,
                kesejahteraan_decay: mergedData.kesejahteraan_decay ?? 0,
                programNuklirActive: mergedData.programNuklirActive ?? isNegaraNuklirBawaan(mergedData.country_slug || countryName.toLowerCase().replace(/\\s+/g, '_'), countryName),
                icbm_jumlah: Number(mergedData.icbm_jumlah ?? getNegaraNuklirBaseIcbm(mergedData.country_slug || countryName.toLowerCase().replace(/\\s+/g, '_'), countryName)),
                icbm_status: Boolean(mergedData.icbm_status ?? (Number(mergedData.icbm_jumlah ?? getNegaraNuklirBaseIcbm(mergedData.country_slug || countryName.toLowerCase().replace(/\\s+/g, '_'), countryName)) > 0)),
                icbmBuildTask: mergedData.icbmBuildTask || null,
                icbm_consumed: Number(mergedData.icbm_consumed || 0),
            };`;

const normalizedFile = file.replace(/\r\n/g, '\n');
const normalizedSaveOld = saveOld.replace(/\r\n/g, '\n');
const normalizedSaveNew = saveNew.replace(/\r\n/g, '\n');
const normalizedRestoreOld = restoreOld.replace(/\r\n/g, '\n');
const normalizedRestoreNew = restoreNew.replace(/\r\n/g, '\n');
const normalizedLoadStatsOld = loadStatsOld.replace(/\r\n/g, '\n');
const normalizedLoadStatsNew = loadStatsNew.replace(/\r\n/g, '\n');

if (!normalizedFile.includes(normalizedSaveOld)) {
    console.error('Save target not found in map-system.tsx!');
    process.exit(1);
}
if (!normalizedFile.includes(normalizedRestoreOld)) {
    console.error('Restore target not found in map-system.tsx!');
    process.exit(1);
}
if (!normalizedFile.includes(normalizedLoadStatsOld)) {
    console.error('Load stats target not found in map-system.tsx!');
    process.exit(1);
}

let replaced = normalizedFile.replace(normalizedSaveOld, normalizedSaveNew);
replaced = replaced.replace(normalizedRestoreOld, normalizedRestoreNew);
replaced = replaced.replace(normalizedLoadStatsOld, normalizedLoadStatsNew);

fs.writeFileSync(filePath, replaced, 'utf8');
console.log('Successfully updated ICBM & Program Nuklir save/load in map-system.tsx');
