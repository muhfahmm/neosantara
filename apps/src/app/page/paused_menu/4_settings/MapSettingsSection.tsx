'use client';

import React, { useState, useEffect } from 'react';
import { Globe, Building2, MapPin, Layers } from 'lucide-react';
import {
    MapDisplaySettings,
    getMapDisplaySettings,
    saveMapDisplaySettings,
    DEFAULT_MAP_DISPLAY_SETTINGS
} from './mapSettingsLogic';
import { FpsMonitoringSettings } from './fpsMonitoring';

export function MapSettingsSection() {
    const [settings, setSettings] = useState<MapDisplaySettings>(DEFAULT_MAP_DISPLAY_SETTINGS);

    useEffect(() => {
        setSettings(getMapDisplaySettings());
    }, []);

    const handleToggle = (key: keyof MapDisplaySettings) => {
        const next = { ...settings, [key]: !settings[key] };
        setSettings(next);
        saveMapDisplaySettings(next);
    };

    const handlePreset = (mode: 'borders_only' | 'all') => {
        let next: MapDisplaySettings;
        if (mode === 'borders_only') {
            next = {
                showProvinceBorders: false,
                showMajorCities: false,
                showCapitals: true,
            };
        } else {
            next = {
                showProvinceBorders: true,
                showMajorCities: true,
                showCapitals: true,
            };
        }
        setSettings(next);
        saveMapDisplaySettings(next);
    };

    const isBordersOnly = !settings.showProvinceBorders && !settings.showMajorCities;
    const isAll = settings.showProvinceBorders && settings.showMajorCities;

    return (
        <div className="space-y-3 pt-4 border-t border-root-accent/15 text-left">
            <div className="flex items-center justify-between">
                <label className="text-[11px] font-black text-root-text uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-root-accent" />
                    <span>Tampilan Garis & Kota Peta</span>
                </label>
                <span className="text-[9px] font-mono text-root-accent/70 uppercase">MAP DISPLAY</span>
            </div>

            {/* Mode Cepat (Preset) */}
            <div className="grid grid-cols-2 gap-2">
                <button
                    type="button"
                    onClick={() => handlePreset('borders_only')}
                    className={`px-2.5 py-2 rounded border text-[11px] font-bold tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isBordersOnly
                            ? 'bg-root-accent/20 border-root-accent text-root-accent shadow-[0_0_10px_rgba(0,255,170,0.25)]'
                            : 'bg-root-canvas border-root-accent/20 text-gray-400 hover:text-white hover:border-root-accent/40'
                    }`}
                >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Hanya Batas Negara</span>
                </button>

                <button
                    type="button"
                    onClick={() => handlePreset('all')}
                    className={`px-2.5 py-2 rounded border text-[11px] font-bold tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isAll
                            ? 'bg-root-accent/20 border-root-accent text-root-accent shadow-[0_0_10px_rgba(0,255,170,0.25)]'
                            : 'bg-root-canvas border-root-accent/20 text-gray-400 hover:text-white hover:border-root-accent/40'
                    }`}
                >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Lengkap dengan Kota</span>
                </button>
            </div>

            {/* Kustomisasi Switch Individu */}
            <div className="space-y-1.5 pt-1">
                {/* Switch Batas Provinsi / Kota */}
                <div
                    onClick={() => handleToggle('showProvinceBorders')}
                    className="flex items-center justify-between p-2 rounded bg-root-canvas/80 border border-root-accent/20 hover:border-root-accent/40 cursor-pointer transition-all"
                >
                    <div className="flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-root-accent" />
                        <span className="text-[11px] font-semibold text-gray-200">Garis Batas Provinsi / Kota</span>
                    </div>
                    <div className={`w-8 h-4.5 flex items-center rounded-full p-0.5 transition-colors ${
                        settings.showProvinceBorders ? 'bg-root-accent' : 'bg-root-subtle/50'
                    }`}>
                        <div className={`bg-root-accent-ink w-3.5 h-3.5 rounded-full shadow-sm transform transition-transform ${
                            settings.showProvinceBorders ? 'translate-x-3.5' : 'translate-x-0'
                        }`} />
                    </div>
                </div>

                {/* Switch Pin Kota-Kota Besar */}
                <div
                    onClick={() => handleToggle('showMajorCities')}
                    className="flex items-center justify-between p-2 rounded bg-root-canvas/80 border border-root-accent/20 hover:border-root-accent/40 cursor-pointer transition-all"
                >
                    <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-[11px] font-semibold text-gray-200">Pin Kota-Kota Besar</span>
                    </div>
                    <div className={`w-8 h-4.5 flex items-center rounded-full p-0.5 transition-colors ${
                        settings.showMajorCities ? 'bg-root-accent' : 'bg-root-subtle/50'
                    }`}>
                        <div className={`bg-root-accent-ink w-3.5 h-3.5 rounded-full shadow-sm transform transition-transform ${
                            settings.showMajorCities ? 'translate-x-3.5' : 'translate-x-0'
                        }`} />
                    </div>
                </div>

                {/* Switch Ibukota Negara */}
                <div
                    onClick={() => handleToggle('showCapitals')}
                    className="flex items-center justify-between p-2 rounded bg-root-canvas/80 border border-root-accent/20 hover:border-root-accent/40 cursor-pointer transition-all"
                >
                    <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[11px] font-semibold text-gray-200">Pin Ibukota Negara</span>
                    </div>
                    <div className={`w-8 h-4.5 flex items-center rounded-full p-0.5 transition-colors ${
                        settings.showCapitals ? 'bg-root-accent' : 'bg-root-subtle/50'
                    }`}>
                        <div className={`bg-root-accent-ink w-3.5 h-3.5 rounded-full shadow-sm transform transition-transform ${
                            settings.showCapitals ? 'translate-x-3.5' : 'translate-x-0'
                        }`} />
                    </div>
                </div>

                <FpsMonitoringSettings />
            </div>
        </div>
    );
}