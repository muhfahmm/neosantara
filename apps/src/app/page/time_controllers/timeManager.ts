// detail path: c:\EM\apps\src\app\page\time_controllers\timeManager.ts
import { setSimulationDate } from "../../../../../json/4_database_hubungan_antar_negara/relationsRegistry";
import { formatSimulationDate, shiftSimulationDate } from "./simulationClock";

export class SimulationTimeManager {
    private currentDate: Date;
    private isPaused: boolean = true;
    private speed: number = 1;
    private lastTickTime: number = 0;
    private loopTimeoutId: number | null = null;
    private onDateChangeCallback: (formattedDate: string) => void;
    private onProgressChangeCallback?: (progress: number) => void;
    private lastProgressCallbackTime: number = 0;
    private lastRustDateCalculationMs: number = 0;
    private readonly progressUpdateInterval = 100;
    // Mapping speed multipliers to millisecond intervals per day tick
    private speedIntervals: Record<number, number> = {
        1: 2500, // 1x speed: 1 day every 2.5 seconds
        2: 1000, // 2x speed: 1 day every 1 second
        3: 700,  // 3x speed: 1 day every 0.7 seconds
    };

    constructor(onDateChange: (formattedDate: string) => void, onProgress?: (progress: number) => void) {
        this.currentDate = new Date(); // Start with real life date
        this.onDateChangeCallback = onDateChange;
        this.onProgressChangeCallback = onProgress;

        // Trigger initial callback to show today's date instantly
        this.triggerCallback();
    }

    // Format Date helper (DD Month, YYYY)
    public getFormattedDate(): string {
        return formatSimulationDate(
            this.currentDate.getFullYear(),
            this.currentDate.getMonth(),
            this.currentDate.getDate()
        );
    }

    private getDateAfterDays(days: number): Date {
        const calculationStartedAt = performance.now();
        const shiftedDate = shiftSimulationDate(
            this.currentDate.getFullYear(),
            this.currentDate.getMonth(),
            this.currentDate.getDate(),
            days
        );
        this.lastRustDateCalculationMs = performance.now() - calculationStartedAt;
        const dateParts = shiftedDate.split(',').map(Number);
        if (dateParts.length !== 3 || dateParts.some(part => !Number.isInteger(part))) {
            throw new Error('Rust simulation clock returned an invalid date');
        }

        const [year, month, day] = dateParts;
        const newDate = new Date(this.currentDate);
        newDate.setFullYear(year, month, day);
        return newDate;
    }

    private triggerCallback(): void {
        const formatted = this.getFormattedDate();
        this.onDateChangeCallback(formatted);
    }

    // Reset date to real-life date
    public resetDate(): void {
        this.currentDate = new Date();
        this.triggerCallback();
    }

    // Get current simulation date (return NEW instance to prevent external mutation)
    public getCurrentDate(): Date {
        return new Date(this.currentDate);
    }

    // Set custom simulation date (used for loading saves)
    public setCurrentDate(date: Date): void {
        this.currentDate = new Date(date);
        this.triggerCallback();
    }

    // Advance or rewind simulation date by N days
    public advanceDays(days: number): void {
        this.currentDate = this.getDateAfterDays(days);
        setSimulationDate(this.currentDate);
        this.triggerCallback();
    }

    // Set play/pause state
    public setPaused(paused: boolean): void {
        this.isPaused = paused;
        if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("neosantara:simulation-clock-state", {
                detail: { isPaused: paused },
            }));
        }
        if (!this.isPaused) {
            this.lastTickTime = performance.now();
            this.lastProgressCallbackTime = 0;
            this.startLoop();
        } else {
            this.stopLoop();
            if (this.onProgressChangeCallback) {
                this.onProgressChangeCallback(0);
            }
        }
    }

    // Set speed multiplier
    public setSpeed(speed: number): void {
        if (speed in this.speedIntervals) {
            this.speed = speed;
        }
    }

    // Get current speed multiplier
    public getSpeed(): number {
        return this.speed;
    }

    public getMillisecondsPerDay(): number {
        return this.speedIntervals[this.speed] || this.speedIntervals[1];
    }

    public getLastRustDateCalculationMs(): number {
        return this.lastRustDateCalculationMs;
    }

    public getDayProgress(): number {
        if (this.isPaused) return 0;
        const elapsed = Math.max(0, performance.now() - this.lastTickTime);
        return Math.min(elapsed / this.getMillisecondsPerDay(), 1);
    }

    // Check if simulation is paused
    public getIsPaused(): boolean {
        return this.isPaused;
    }

    // Run the clock and refresh its progress display synchronized with 60FPS browser animation.
    private startLoop(): void {
        if (this.loopTimeoutId !== null) return;

        const loop = (now: number) => {
            if (this.isPaused) {
                this.loopTimeoutId = null;
                if (this.onProgressChangeCallback) {
                    this.onProgressChangeCallback(0);
                }
                return;
            }

            const interval = this.getMillisecondsPerDay();
            const delta = now - this.lastTickTime;

            if (delta >= interval) {
                this.currentDate = this.getDateAfterDays(1);

                setSimulationDate(this.currentDate);

                this.lastTickTime = now;
                this.triggerCallback();
            }

            // The bar needs smooth feedback, not 60 DOM writes per second.
            const currentDelta = Math.max(0, now - this.lastTickTime);
            const progress = Math.min((currentDelta / interval) * 100, 100);
            if (this.onProgressChangeCallback && now - this.lastProgressCallbackTime >= this.progressUpdateInterval) {
                this.lastProgressCallbackTime = now;
                this.onProgressChangeCallback(progress);
            }

            this.loopTimeoutId = requestAnimationFrame(loop);
        };

        this.loopTimeoutId = requestAnimationFrame(loop);
    }

    private stopLoop(): void {
        if (this.loopTimeoutId !== null) {
            cancelAnimationFrame(this.loopTimeoutId);
            this.loopTimeoutId = null;
        }
    }

    // Clean up animation frame references on destroy
    public destroy(): void {
        this.stopLoop();
    }
}
