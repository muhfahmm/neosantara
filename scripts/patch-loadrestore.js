const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../apps/src/app/page/map_system/map-system.tsx');
let file = fs.readFileSync(filePath, 'utf8');

const targetOld = `                        setCountryColorOverrides(restoredOverrides);
                        (window as any).neosantara_country_color_overrides = restoredOverrides;
                        (window as any).neosantara_annexed_countries = restoredAnnexed;
                        (window as any).neosantara_city_owner = restoredCityOwners;
                        if (isMobileDevice() && Object.keys(restoredCityOwners).length > 0) {
                            void loadCityBoundaryCells('/city_province_cells.json');
                        }
                        window.dispatchEvent(new CustomEvent('map_territory_color_updated'));`;

const targetNew = `                        setCountryColorOverrides(restoredOverrides);
                        (window as any).neosantara_country_color_overrides = restoredOverrides;
                        (window as any).neosantara_annexed_countries = restoredAnnexed;
                        (window as any).neosantara_city_owner = restoredCityOwners;
                        (window as any).neosantara_province_religion_overrides = sessionState.provinceReligionOverrides || {};
                        (window as any).neosantara_province_ideology_overrides = sessionState.provinceIdeologyOverrides || {};
                        if (sessionState.playerAttack) {
                            (window as any).neosantara_player_attack = sessionState.playerAttack;
                            setActivePlayerAttack(sessionState.playerAttack);
                        }
                        if (isMobileDevice() && Object.keys(restoredCityOwners).length > 0) {
                            void loadCityBoundaryCells('/city_province_cells.json');
                        }
                        window.dispatchEvent(new CustomEvent('map_territory_color_updated'));`;

const normalizedFile = file.replace(/\r\n/g, '\n');
const normalizedTargetOld = targetOld.replace(/\r\n/g, '\n');
const normalizedTargetNew = targetNew.replace(/\r\n/g, '\n');

if (!normalizedFile.includes(normalizedTargetOld)) {
    console.error('Target load restore not found in map-system.tsx!');
    process.exit(1);
}

const replaced = normalizedFile.replace(normalizedTargetOld, normalizedTargetNew);
fs.writeFileSync(filePath, replaced, 'utf8');
console.log('Successfully updated load restore in map-system.tsx');
