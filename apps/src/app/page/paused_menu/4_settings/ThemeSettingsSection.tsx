'use client';

import React, { useEffect, useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';

type ThemeMode = 'dark' | 'light';

const THEME_STORAGE_KEY = 'neosantara_theme';
const THEME_CHANGE_EVENT = 'neosantara_theme_changed';
let themeStorageError = false;

function readSavedTheme(): ThemeMode {
    try {
        themeStorageError = false;
        return window.localStorage.getItem(THEME_STORAGE_KEY) === 'light' ? 'light' : 'dark';
    } catch (error) {
        themeStorageError = true;
        console.error('Error reading theme preference:', error);
        return 'dark';
    }
}

function applyTheme(theme: ThemeMode) {
    document.documentElement.dataset.theme = theme;
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

function updateStorageError(hasError: boolean) {
    themeStorageError = hasError;
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

function getCurrentTheme(): ThemeMode {
    return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

function getStorageError() {
    return themeStorageError;
}

function subscribeToTheme(listener: () => void) {
    window.addEventListener(THEME_CHANGE_EVENT, listener);
    return () => window.removeEventListener(THEME_CHANGE_EVENT, listener);
}

export function ThemeInitializer() {
    useEffect(() => {
        applyTheme(readSavedTheme());
    }, []);

    return null;
}

export function ThemeSettingsSection() {
    const theme = useSyncExternalStore(subscribeToTheme, getCurrentTheme, () => 'dark');
    const storageError = useSyncExternalStore(subscribeToTheme, getStorageError, () => false);

    const handleThemeChange = (nextTheme: ThemeMode) => {
        applyTheme(nextTheme);
        updateStorageError(false);

        try {
            window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
        } catch (error) {
            console.error('Error saving theme preference:', error);
            updateStorageError(true);
        }
    };

    return (
        <div className="space-y-2 border-t border-root-accent/15 pt-4 text-left">
            <label className="text-[11px] font-black text-root-text uppercase tracking-wider flex items-center gap-1.5">
                {theme === 'dark'
                    ? <Moon className="w-3.5 h-3.5 text-root-accent" />
                    : <Sun className="w-3.5 h-3.5 text-root-accent" />}
                <span>Tema Tampilan</span>
            </label>

            <div className="grid grid-cols-2 gap-2" role="group" aria-label="Tema tampilan">
                <button
                    type="button"
                    aria-pressed={theme === 'light'}
                    onClick={() => handleThemeChange('light')}
                    className={`flex items-center justify-center gap-2 rounded border px-3 py-2 text-[11px] font-bold transition-colors ${
                        theme === 'light'
                            ? 'border-root-accent bg-root-accent/15 text-root-accent'
                            : 'border-root-accent/20 bg-root-canvas text-root-muted hover:border-root-accent/50'
                    }`}
                >
                    <Sun className="h-3.5 w-3.5" />
                    Terang
                </button>
                <button
                    type="button"
                    aria-pressed={theme === 'dark'}
                    onClick={() => handleThemeChange('dark')}
                    className={`flex items-center justify-center gap-2 rounded border px-3 py-2 text-[11px] font-bold transition-colors ${
                        theme === 'dark'
                            ? 'border-root-accent bg-root-accent/15 text-root-accent'
                            : 'border-root-accent/20 bg-root-canvas text-root-muted hover:border-root-accent/50'
                    }`}
                >
                    <Moon className="h-3.5 w-3.5" />
                    Gelap
                </button>
            </div>
            {storageError && (
                <p role="status" className="text-[10px] text-root-danger">
                    Preferensi tema tidak dapat dibaca atau disimpan di perangkat ini.
                </p>
            )}
        </div>
    );
}
