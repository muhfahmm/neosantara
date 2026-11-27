const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../apps/src/app/page/map_system/map-system.tsx');
let file = fs.readFileSync(filePath, 'utf8');

const targetOld = `            await flushNpcCountrySimulation();
            const sessionState = {
                npcSimulation: getNpcCountrySimulationSnapshot(),
                countryColorOverrides: (window as any).neosantara_country_color_overrides || countryColorOverrides,
                annexedCountries: (window as any).neosantara_annexed_countries || {},
                cityOwner: (window as any).neosantara_city_owner || {},
            };
            await saveGameToDatabase({
                saveId: targetSaveId,
                saveName,
                countryName: selectedCountry.country,
                countryIso: selectedCountry.iso,
                gameDate,
                capital: countryDetail?.capital || selectedCountry.capital,
                jumlahPenduduk: countryDetail?.jumlah_penduduk || 0,
                anggaran: countryDetail?.anggaran || 0,
                ideology: countryDetail?.ideology || '-',
                religion: countryDetail?.religion || '-',
                unVote: countryDetail?.un_vote || 0,
                kepuasan: countryDetail?.kepuasan ?? 50,
                countryDetail: {
                    ...countryDetail,
                    presidentRating,
                    playerDiamonds,
                    playerXp: typeof window !== 'undefined' ? Number(gameStateStorage.getItem('neosantara_player_xp') || 0) : 0,
                    notifications,
                    newsList,
                    organizationMemberships: getUserJoinedOrgSnapshot(selectedCountry.country),
                    missionCompletions: typeof window !== 'undefined' ? gameStateStorage.getItem('presiden_simulator_mission_completions') : null,
                    activeMissionId: typeof window !== 'undefined' ? gameStateStorage.getItem('presiden_simulator_active_mission') : null,
                    claimableMissions: typeof window !== 'undefined' ? gameStateStorage.getItem('presiden_simulator_claimable_missions') : null,
                    achievementsState: typeof window !== 'undefined' ? gameStateStorage.getItem('neosantara_achievements_state') : null,
                    __neosantara_game_session: {
                        ...sessionState,
                        gameState: captureGameSaveStorage(),
                    },
                },
            });
            setIsSaveModalOpen(false);
            setIsCreatingNewSaveSlot(false);`;

const targetNew = `            await flushNpcCountrySimulation();
            const sessionState = {
                npcSimulation: getNpcCountrySimulationSnapshot(),
                countryColorOverrides: (window as any).neosantara_country_color_overrides || countryColorOverrides,
                annexedCountries: (window as any).neosantara_annexed_countries || {},
                cityOwner: (window as any).neosantara_city_owner || {},
                provinceReligionOverrides: (window as any).neosantara_province_religion_overrides || {},
                provinceIdeologyOverrides: (window as any).neosantara_province_ideology_overrides || {},
                playerAttack: (window as any).neosantara_player_attack || null,
            };
            const existingSave = targetSaveId ? existingSaveFiles.find(s => s.id === targetSaveId) : null;
            const currentSaveVersion = existingSave?.version ?? (countryDetail?.__neosantara_game_session?.saveVersion ?? 1);
            const idempotencyKey = typeof crypto !== 'undefined' && crypto.randomUUID
                ? crypto.randomUUID()
                : String(Date.now()) + '-' + Math.random().toString(36).slice(2, 10);

            await saveGameToDatabase({
                saveId: targetSaveId,
                saveName,
                countryName: selectedCountry.country,
                countryIso: selectedCountry.iso,
                gameDate,
                capital: countryDetail?.capital || selectedCountry.capital,
                jumlahPenduduk: countryDetail?.jumlah_penduduk || 0,
                anggaran: countryDetail?.anggaran || 0,
                ideology: countryDetail?.ideology || '-',
                religion: countryDetail?.religion || '-',
                unVote: countryDetail?.un_vote || 0,
                kepuasan: countryDetail?.kepuasan ?? 50,
                schemaVersion: 'v2',
                expectedVersion: targetSaveId ? currentSaveVersion : undefined,
                idempotencyKey,
                countryDetail: {
                    ...countryDetail,
                    presidentRating,
                    playerDiamonds,
                    playerXp: typeof window !== 'undefined' ? Number(gameStateStorage.getItem('neosantara_player_xp') || 0) : 0,
                    notifications,
                    newsList,
                    organizationMemberships: getUserJoinedOrgSnapshot(selectedCountry.country),
                    missionCompletions: typeof window !== 'undefined' ? gameStateStorage.getItem('presiden_simulator_mission_completions') : null,
                    activeMissionId: typeof window !== 'undefined' ? gameStateStorage.getItem('presiden_simulator_active_mission') : null,
                    claimableMissions: typeof window !== 'undefined' ? gameStateStorage.getItem('presiden_simulator_claimable_missions') : null,
                    achievementsState: typeof window !== 'undefined' ? gameStateStorage.getItem('neosantara_achievements_state') : null,
                    __neosantara_game_session: {
                        ...sessionState,
                        saveVersion: (currentSaveVersion || 1) + 1,
                        gameState: captureGameSaveStorage(),
                    },
                },
            });
            purgeMigratedLocalStorage();
            setIsSaveModalOpen(false);
            setIsCreatingNewSaveSlot(false);`;

const normalizedFile = file.replace(/\r\n/g, '\n');
const normalizedTargetOld = targetOld.replace(/\r\n/g, '\n');
const normalizedTargetNew = targetNew.replace(/\r\n/g, '\n');

if (!normalizedFile.includes(normalizedTargetOld)) {
    console.error('Target not found in map-system.tsx!');
    process.exit(1);
}

const replaced = normalizedFile.replace(normalizedTargetOld, normalizedTargetNew);
fs.writeFileSync(filePath, replaced, 'utf8');
console.log('Successfully updated map-system.tsx');
