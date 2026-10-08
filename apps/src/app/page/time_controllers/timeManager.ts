// detail path: c:\EM\apps\src\app\page\time_controllers\timeManager.ts
import { setSimulationDate } from "@/../../json/database_hubungan_antar_negara/relationsRegistry";

export class SimulationTimeManager {
    private currentDate: Date;
    private isPaused: boolean = true;
    private speed: number = 1;
    private lastTickTime: number = 0;
    private loopTimeoutId: ReturnType<typeof setTimeout> | null = null;
    private onDateChangeCallback: (formattedDate: string) => void;
    private onProgressChangeCallback?: (progress: number) => void;
    private lastProgressCallbackTime: number = 0;
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
        const day = this.currentDate.getDate();
        const monthNames = [
            "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", 
            "Jul", "Agt", "Sep", "Okt", "Nov", "Des"
        ];
        const month = monthNames[this.currentDate.getMonth()];
        const year = this.currentDate.getFullYear();
        return `${day} ${month}, ${year}`;
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

    // Set play/pause state
    public setPaused(paused: boolean): void {
        this.isPaused = paused;
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

    // Check if simulation is paused
    public getIsPaused(): boolean {
        return this.isPaused;
    }

    // Run the clock and refresh its progress display at 30 FPS.
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

            const interval = this.speedIntervals[this.speed] || 2000;
            const delta = now - this.lastTickTime;

            if (delta >= interval) {
                // Determine how many days to advance (handles cases where tab was backgrounded)
                const daysToAdvance = Math.floor(delta / interval);
                // ✅ FIX: Create NEW Date instance instead of mutating in-place
                // This ensures React detects the reference change
                const newDate = new Date(this.currentDate);
                newDate.setDate(newDate.getDate() + daysToAdvance);
                this.currentDate = newDate;
                
                // Update simulation date in relationsRegistry
                setSimulationDate(this.currentDate);
                
                this.lastTickTime = now - (delta % interval);
                this.triggerCallback();
            }

            // Calculate exact sub-tick progress for the progress bar (0 to 100).
            const currentDelta = now - this.lastTickTime;
            const progress = Math.min((currentDelta / interval) * 100, 100);
            if (
                this.onProgressChangeCallback &&
                (now - this.lastProgressCallbackTime >= 33 || progress >= 100)
            ) {
                this.onProgressChangeCallback(progress);
                this.lastProgressCallbackTime = now;
            }

            this.loopTimeoutId = setTimeout(() => loop(performance.now()), 33);
        };

        this.loopTimeoutId = setTimeout(() => loop(performance.now()), 0);
    }

    private stopLoop(): void {
        if (this.loopTimeoutId !== null) {
            clearTimeout(this.loopTimeoutId);
            this.loopTimeoutId = null;
        }
    }

    // Clean up animation frame references on destroy
    public destroy(): void {
        this.stopLoop();
    }
}
