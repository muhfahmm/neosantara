/**
 * Simulation Calendar Logic
 * 
 * This file handles all logic related to the simulation calendar UI component,
 * including calendar formatting, speed management, and calendar state.
 */

import { SimulationTimeManager } from './timeManager';

/**
 * Calendar display formatter
 * Formats date as: "DD Mon, YYYY" (e.g., "6 Agt, 2026")
 */
export class SimulationCalendar {
    private timeManager: SimulationTimeManager;

    constructor(timeManager: SimulationTimeManager) {
        this.timeManager = timeManager;
    }

    /**
     * Get the formatted date string for display
     * Format: "DD Mon, YYYY" (e.g., "6 Agt, 2026")
     */
    public getDisplayDate(): string {
        return this.timeManager.getFormattedDate();
    }

    /**
     * Get current simulation date as Date object
     */
    public getCurrentDate(): Date {
        return this.timeManager.getCurrentDate();
    }

    /**
     * Get the ISO string for save/load operations
     */
    public getDateISO(): string {
        return this.timeManager.getCurrentDate().toISOString();
    }

    /**
     * Get current speed multiplier
     */
    public getSpeed(): number {
        return this.timeManager.getSpeed();
    }

    /**
     * Set new speed multiplier (1, 2, or 3)
     */
    public setSpeed(speed: number): void {
        this.timeManager.setSpeed(speed);
    }

    /**
     * Get next speed in cycle (1 -> 2 -> 3 -> 1)
     */
    public getNextSpeed(currentSpeed: number): number {
        const speeds = [1, 2, 3];
        const currentIndex = speeds.indexOf(currentSpeed);
        const nextIndex = (currentIndex + 1) % speeds.length;
        return speeds[nextIndex];
    }

    /**
     * Cycle through speed multipliers
     * Returns the new speed after cycling
     */
    public cycleSpeed(): number {
        const nextSpeed = this.getNextSpeed(this.timeManager.getSpeed());
        this.setSpeed(nextSpeed);
        return nextSpeed;
    }

    /**
     * Get speed label (e.g., "×1", "×2", "×3")
     */
    public getSpeedLabel(speed: number): string {
        return `×${speed}`;
    }

    /**
     * Check if calendar is paused
     */
    public isPaused(): boolean {
        return this.timeManager.getIsPaused();
    }

    /**
     * Set pause state
     */
    public setPaused(paused: boolean): void {
        this.timeManager.setPaused(paused);
    }

    /**
     * Toggle pause/play state
     * Returns new pause state
     */
    public togglePause(): boolean {
        const newPausedState = !this.isPaused();
        this.setPaused(newPausedState);
        return newPausedState;
    }

    /**
     * Format date for save name (e.g., "Simulasi Indonesia - 6 Agt, 2026")
     */
    public formatSaveName(countryName: string): string {
        return `Simulasi ${countryName} - ${this.getDisplayDate()}`;
    }

    /**
     * Format date for calendar info display
     */
    public formatCalendarInfo(): string {
        return `Kalender: ${this.getDisplayDate()}`;
    }
}

/**
 * Calendar UI state manager
 * Handles reactive state for the calendar UI components
 */
export interface CalendarUIState {
    isPaused: boolean;
    speed: number;
    dateText: string;
    progress: number; // 0-100
}

/**
 * Calendar controls handler
 * Encapsulates all user interactions with calendar controls
 */
export class CalendarControlsHandler {
    private calendar: SimulationCalendar;

    constructor(calendar: SimulationCalendar) {
        this.calendar = calendar;
    }

    /**
     * Handle play/pause button click
     */
    public handlePlayPauseClick(currentPausedState: boolean): boolean {
        return this.calendar.togglePause();
    }

    /**
     * Handle speed button click
     * Cycles through speeds: 1x -> 2x -> 3x -> 1x
     */
    public handleSpeedClick(): number {
        return this.calendar.cycleSpeed();
    }

    /**
     * Handle holiday button click
     * Can be extended for actual holiday logic
     */
    public handleHolidayClick(): void {
        console.log('Holiday mode activated - Citizens enjoy rest time');
        // TODO: Implement holiday logic (e.g., halted production, no income changes)
    }

    /**
     * Handle military/security button click
     * Can be extended for military information display
     */
    public handleMilitaryClick(): void {
        console.log('Presidential & Military Relations information activated');
        // TODO: Implement military info display
    }

}

/**
 * Calendar display formatter for UI
 * Handles all text formatting for calendar display
 */
export class CalendarDisplayFormatter {
    private calendar: SimulationCalendar;

    constructor(calendar: SimulationCalendar) {
        this.calendar = calendar;
    }

    /**
     * Get display date for calendar label
     */
    public getDateLabel(): string {
        return this.calendar.getDisplayDate();
    }

    /**
     * Get speed button label
     */
    public getSpeedLabel(): string {
        return this.calendar.getSpeedLabel(this.calendar.getSpeed());
    }

    /**
     * Get pause/play button label
     */
    public getPauseButtonLabel(isPaused: boolean): string {
        return isPaused ? "▶" : "⏸";
    }

    /**
     * Get calendar header label
     */
    public getCalendarHeaderLabel(): string {
        return "SIMULATION CALENDAR";
    }

    /**
     * Format complete calendar info for status display
     */
    public formatCalendarInfo(): string {
        return this.calendar.formatCalendarInfo();
    }

    /**
     * Get progress bar percentage (0-100)
     */
    public getProgressPercentage(): number {
        // Progress is handled by timeManager callbacks
        // This is just a helper for the UI
        return 0;
    }
}

/**
 * Factory function to create a complete calendar system
 */
export function createSimulationCalendar(timeManager: SimulationTimeManager): {
    calendar: SimulationCalendar;
    controls: CalendarControlsHandler;
    display: CalendarDisplayFormatter;
} {
    const calendar = new SimulationCalendar(timeManager);
    const controls = new CalendarControlsHandler(calendar);
    const display = new CalendarDisplayFormatter(calendar);

    return { calendar, controls, display };
}
