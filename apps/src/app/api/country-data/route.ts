import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const removeComments = (input: string) =>
    input.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');

const findLiteral = (input: string, start: number) => {
    let depth = 0;
    let inString: string | null = null;
    let escaped = false;
    const openingChar = input[start];
    const closingChar = openingChar === '[' ? ']' : openingChar === '{' ? '}' : null;

    if (!closingChar) return null;

    for (let i = start; i < input.length; i++) {
        const char = input[i];
        if (escaped) {
            escaped = false;
            continue;
        }
        if (char === '\\') {
            escaped = true;
            continue;
        }
        if (inString) {
            if (char === inString) {
                inString = null;
            }
            continue;
        }
        if (char === '"' || char === "'" || char === '`') {
            inString = char;
            continue;
        }
        if (char === openingChar) {
            depth += 1;
            continue;
        }
        if (char === closingChar) {
            depth -= 1;
            if (depth === 0) {
                return input.slice(start, i + 1);
            }
        }
    }
    return null;
};

const parseObjectLiteral = (literal: string) => {
    try {
        return new Function(`"use strict"; return (${literal});`)();
    } catch (e) {
        try {
            let fixedLiteral = literal;
            fixedLiteral = fixedLiteral.replace(/:\s*([A-Za-z_$][\w$]*)\s*([,\}\]])/g, (match, identifier, after) => {
                if (['true', 'false', 'null', 'undefined', 'NaN', 'Infinity'].includes(identifier)) {
                    return match;
                }
                return `: null${after}`;
            });
            return new Function(`"use strict"; return (${fixedLiteral});`)();
        } catch (e2) {
            console.warn('Failed to parse object literal', e);
            return null;
        }
    }
};

const extractObjectsFromFile = (fileContent: string) => {
    const cleaned = removeComments(fileContent);

    const parsedValues: any[] = [];

    const constRegex = /(?:const|let|var)\s+[A-Za-z_$][\w$]*\s*=\s*[\[{]/g;
    let match: RegExpExecArray | null;
    while ((match = constRegex.exec(cleaned))) {
        const start = match.index + match[0].length - 1;
        const literal = findLiteral(cleaned, start);
        if (literal) {
            const parsed = parseObjectLiteral(literal);
            if (parsed !== null && parsed !== undefined) {
                parsedValues.push(parsed);
            }
        }
    }

    const exportDefaultRegex = /export\s+default\s*[\[{]/g;
    const exportMatch = exportDefaultRegex.exec(cleaned);
    if (exportMatch) {
        const start = exportMatch.index + exportMatch[0].length - 1;
        const literal = findLiteral(cleaned, start);
        if (literal) {
            const parsed = parseObjectLiteral(literal);
            if (parsed !== null && parsed !== undefined) {
                parsedValues.push(parsed);
            }
        }
    }

    if (parsedValues.length === 0) return null;
    if (parsedValues.length === 1) return parsedValues[0];
    const objects = parsedValues.filter((item) => item && typeof item === 'object' && !Array.isArray(item));
    if (objects.length === parsedValues.length) {
        return Object.assign({}, ...objects);
    }
    return parsedValues[parsedValues.length - 1] || parsedValues[0];
};

const getLevelSource = (source: any) => {
    const wrapperKey = Object.keys(source).find((key) => key.endsWith('_level_kabinet'));
    if (wrapperKey && typeof source[wrapperKey] === 'object' && source[wrapperKey] !== null) {
        return source[wrapperKey];
    }

    if (
        typeof source.kementerian === 'object' && source.kementerian !== null &&
        typeof source.keamanan === 'object' && source.keamanan !== null &&
        typeof source.layanan === 'object' && source.layanan !== null
    ) {
        return {
            kementerian: source.kementerian,
            keamanan: source.keamanan,
            layanan: source.layanan,
        };
    }

    return null;
};

const extractFileOrder = (fileName: string) => {
    const match = fileName.match(/^(\d+)/);
    return match ? Number(match[1]) : NaN;
};

const getCountryKey = (filePath: string) => {
    const fileName = path.basename(filePath).replace(/\.(ts|tsx|js|json)$/i, '');
    const withoutPrefix = fileName.replace(/^\d+_/, '');
    return withoutPrefix.toLowerCase().replace(/[^a-z0-9]+/g, '_');
};

const getContinentFromOrder = (order: number) => {
    if (Number.isNaN(order)) return 'Lainnya';
    if (order >= 1 && order <= 51) return 'Afrika';
    if (order >= 54 && order <= 102) return 'Asia';
    if (order >= 103 && order <= 151) return 'Eropa';
    if (order >= 152 && order <= 178) return 'Amerika Utara';
    if (order >= 179 && order <= 194) return 'Oseania';
    if (order >= 195 && order <= 207) return 'Amerika Selatan';
    return 'Lainnya';
};

let cachedAllCountriesData: any[] | null = null;
const cachedCountryMap = new Map<string, any>();

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const countryPath = searchParams.get('path');
    const requestAll = searchParams.get('all') === 'true';

    if (!countryPath && !requestAll) {
        return NextResponse.json({ error: 'Path is required unless all=true is provided' }, { status: 400 });
    }

    if (requestAll && cachedAllCountriesData) {
        return NextResponse.json(cachedAllCountriesData);
    }

    if (countryPath && cachedCountryMap.has(countryPath)) {
        return NextResponse.json(cachedCountryMap.get(countryPath));
    }

    try {
        const currentDir = process.cwd();
        const projectRoot = currentDir.endsWith('apps') ? path.join(currentDir, '..') : currentDir;
        const jsonRoot = path.join(projectRoot, 'json/semua_fitur_negara');
        const levelRoot = path.join(projectRoot, 'json/database_level_kabinet');
        const taxRoot = path.join(projectRoot, 'json/database_pajak_negara');

        const embassyRoot = path.join(projectRoot, 'json', 'database_kedutaan_besar');
        const allFiles: string[] = [];
        const findFiles = (dir: string, filename?: string) => {
            const files = fs.readdirSync(dir);
            for (const file of files) {
                const fullPath = path.join(dir, file);
                if (fs.statSync(fullPath).isDirectory()) {
                    findFiles(fullPath, filename);
                } else if (!filename || file === filename) {
                    allFiles.push(fullPath);
                }
            }
        };

        const loadFileData = (filePath: string) => {
            const fileContents = fs.readFileSync(filePath, 'utf8');
            const parsed = extractObjectsFromFile(fileContents);
            if (!parsed || typeof parsed !== 'object') return null;

            const isEmbassyFile = filePath.startsWith(embassyRoot + path.sep) || filePath === embassyRoot;
            if (isEmbassyFile && Array.isArray(parsed)) {
                return { embassies: parsed };
            }

            const isArmadaFile = filePath.includes('2_pertahanan' + path.sep + '3_armada_militer');
            if (isArmadaFile) {
                // Wrap armada data dalam struktur yang tepat
                return { armada: parsed };
            }

            const isLevelFile = path.relative(levelRoot, filePath).startsWith('..') === false;
            if (isLevelFile) {
                const levelData = getLevelSource(parsed);
                if (levelData) {
                    const levelFields: Record<string, number> = {};
                    ['kementerian', 'keamanan', 'layanan'].forEach((group) => {
                        const groupData = levelData[group];
                        if (groupData && typeof groupData === 'object') {
                            Object.entries(groupData).forEach(([dept, level]) => {
                                const parsedLevel = Number(level);
                                if (!Number.isNaN(parsedLevel) && parsedLevel > 0) {
                                    levelFields[`level_${dept}`] = parsedLevel;
                                }
                            });
                        }
                    });
                    const result: any = { ...levelFields };
                    if (parsed.nama_negara) {
                        result.nama_negara = parsed.nama_negara;
                    }
                    return result;
                }
            }

            return parsed;
        };

        if (requestAll) {
            const countryPathsFilePath = path.join(projectRoot, 'apps/src/app/page/map_system/country-paths.json');
            let countryPathsList: string[] = [];
            try {
                const fileContent = fs.readFileSync(countryPathsFilePath, 'utf8');
                const countryPathsData = JSON.parse(fileContent.replace(/^\uFEFF/, ''));
                countryPathsList = Object.values(countryPathsData);
            } catch (err) {
                console.error('Failed to read country-paths.json:', err);
                return NextResponse.json({ error: 'Failed to read country-paths.json' }, { status: 500 });
            }

            // Index extraction files recursively once to avoid nested search
            const extractionFilesByFilename: Record<string, string[]> = {};
            const ekstraksiRoot = path.join(projectRoot, 'json/semua_fitur_negara/1_pembangunan/1_produksi/2_sektor_mineral_kritis');
            if (fs.existsSync(ekstraksiRoot)) {
                const indexEkstraksi = (dir: string) => {
                    const files = fs.readdirSync(dir);
                    for (const file of files) {
                        const fullPath = path.join(dir, file);
                        if (fs.statSync(fullPath).isDirectory()) {
                            indexEkstraksi(fullPath);
                        } else {
                            if (!extractionFilesByFilename[file]) {
                                extractionFilesByFilename[file] = [];
                            }
                            extractionFilesByFilename[file].push(fullPath);
                        }
                    }
                };
                indexEkstraksi(ekstraksiRoot);
            }

            // Index profile files recursively once
            const profileFilesByFilename: Record<string, string[]> = {};
            if (fs.existsSync(jsonRoot)) {
                const indexProfiles = (dir: string) => {
                    const files = fs.readdirSync(dir);
                    for (const file of files) {
                        const fullPath = path.join(dir, file);
                        if (fs.statSync(fullPath).isDirectory()) {
                            indexProfiles(fullPath);
                        } else {
                            if (!profileFilesByFilename[file]) {
                                profileFilesByFilename[file] = [];
                            }
                            profileFilesByFilename[file].push(fullPath);
                        }
                    }
                };
                indexProfiles(jsonRoot);
            }

            const mergedByCountryKey: Record<string, any> = {};

            for (const countryPath of countryPathsList) {
                const targetFilename = path.basename(countryPath);
                const countryKey = getCountryKey(countryPath);
                const order = extractFileOrder(targetFilename);

                let countryMerged: any = {
                    __fileName: targetFilename,
                    __fileOrder: order,
                    __continent: getContinentFromOrder(order),
                };

                const countryFiles: string[] = [];

                // 1. Profile files
                if (profileFilesByFilename[targetFilename]) {
                    countryFiles.push(...profileFilesByFilename[targetFilename]);
                }

                // 2. Level cabinet file
                const levelCabinetPath = path.join(levelRoot, countryPath);
                if (fs.existsSync(levelCabinetPath)) {
                    countryFiles.push(levelCabinetPath);
                }

                // 3. Tax file
                const taxPath = path.join(taxRoot, countryPath);
                if (fs.existsSync(taxPath)) {
                    countryFiles.push(taxPath);
                }

                const embassyPath = path.join(embassyRoot, countryPath);
                if (fs.existsSync(embassyPath)) {
                    countryFiles.push(embassyPath);
                }

                // 4. Armada files
                const armadaRoot = path.join(projectRoot, 'json/semua_fitur_negara/2_pertahanan/3_armada_militer');
                if (fs.existsSync(armadaRoot)) {
                    const indexArmada = (dir: string) => {
                        const files = fs.readdirSync(dir);
                        for (const file of files) {
                            const fullPath = path.join(dir, file);
                            if (fs.statSync(fullPath).isDirectory()) {
                                indexArmada(fullPath);
                            } else if (file === targetFilename) {
                                countryFiles.push(fullPath);
                            }
                        }
                    };
                    indexArmada(armadaRoot);
                }

                // 5. Extraction files
                if (extractionFilesByFilename[targetFilename]) {
                    countryFiles.push(...extractionFilesByFilename[targetFilename]);
                }

                // Merge all files for this country
                for (const filePath of countryFiles) {
                    const parsed = loadFileData(filePath);
                    if (parsed) {
                        countryMerged = { ...countryMerged, ...parsed };
                    }
                }

                mergedByCountryKey[countryKey] = countryMerged;
            }

            cachedAllCountriesData = Object.values(mergedByCountryKey);
            return NextResponse.json(cachedAllCountriesData);
        }

        const targetFilename = path.basename(countryPath!);
        const findTargetFiles = (dir: string) => {
            const files = fs.readdirSync(dir);
            for (const file of files) {
                const fullPath = path.join(dir, file);
                if (fs.statSync(fullPath).isDirectory()) {
                    findTargetFiles(fullPath);
                } else if (file === targetFilename) {
                    allFiles.push(fullPath);
                }
            }
        };

        findTargetFiles(jsonRoot);
        findTargetFiles(taxRoot);
        findTargetFiles(embassyRoot);
        
        // 🔥 Explicitly search for armada files in 2_pertahanan/3_armada_militer
        const armadaRoot = path.join(projectRoot, 'json/semua_fitur_negara/2_pertahanan/3_armada_militer');
        if (fs.existsSync(armadaRoot)) {
            const findArmadaFiles = (dir: string) => {
                if (!fs.existsSync(dir)) return;
                const files = fs.readdirSync(dir);
                for (const file of files) {
                    const fullPath = path.join(dir, file);
                    if (fs.statSync(fullPath).isDirectory()) {
                        findArmadaFiles(fullPath);
                    } else if (file === targetFilename) {
                        allFiles.push(fullPath);
                    }
                }
            };
            findArmadaFiles(armadaRoot);
        }
        
        // Explicitly search for extraction files in 2_sektor_mineral_kritis
        const ekstraksiRoot = path.join(projectRoot, 'json/semua_fitur_negara/1_pembangunan/1_produksi/2_sektor_mineral_kritis');
        if (fs.existsSync(ekstraksiRoot)) {
            const findEkstraksiFiles = (dir: string) => {
                if (!fs.existsSync(dir)) return;
                const files = fs.readdirSync(dir);
                for (const file of files) {
                    const fullPath = path.join(dir, file);
                    if (fs.statSync(fullPath).isDirectory()) {
                        findEkstraksiFiles(fullPath);
                    } else if (file === targetFilename) {
                        allFiles.push(fullPath);
                    }
                }
            };
            findEkstraksiFiles(ekstraksiRoot);
        }
        
        const levelCabinetPath = path.join(levelRoot, countryPath!);
        if (fs.existsSync(levelCabinetPath)) {
            allFiles.push(levelCabinetPath);
        }

        const explicitTaxPath = path.join(taxRoot, countryPath!);
        if (fs.existsSync(explicitTaxPath)) {
            allFiles.push(explicitTaxPath);
        }

        if (allFiles.length === 0) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        let mergedData: any = {};
        for (const filePath of allFiles) {
            const parsed = loadFileData(filePath);
            if (!parsed) continue;
            mergedData = { ...mergedData, ...parsed };
        }

        cachedCountryMap.set(countryPath!, mergedData);
        return NextResponse.json(mergedData);
    } catch (e) {
        console.error('Failed to load country data file:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
