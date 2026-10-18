/**
 * dailyEventGenerator.ts
 * Handles daily event generation based on scheduled events
 * Events are spread throughout the month instead of all triggering on day 1
 */

export interface ScheduledEvent {
    scheduledDate: string;
    eventType: string;
    eventData?: any;
}

/**
 * Generate random scheduled events for the month
 */
export function generateMonthlyEventSchedule(monthDateStr: string): ScheduledEvent[] {
    const [yearStr, monthStr] = monthDateStr.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    
    const daysInMonth = new Date(year, month, 0).getDate();
    
    // Generate 8-12 random event days
    const eventCount = Math.floor(Math.random() * 5) + 8;
    const selectedDays = new Set<number>();
    
    while (selectedDays.size < Math.min(eventCount, daysInMonth - 1)) {
        selectedDays.add(Math.floor(Math.random() * (daysInMonth - 1)) + 2); // Start from day 2
    }
    
    const eventTypes = [
        'ekspor_impor',
        'kedutaan',
        'dagang_bilateral',
        'bencana_alam',
        'pandemi',
        'keamanan',
        'pertahanan',
        'icbm_test',
        'resolusi_pbb',
        'hubungan_panas',
        'defisit_listrik',
        'defisit_makanan',
    ];
    
    const sortedDays = Array.from(selectedDays).sort((a, b) => a - b);
    
    return sortedDays.map((day, index) => ({
        scheduledDate: `${yearStr}-${monthStr}-${String(day).padStart(2, '0')}`,
        eventType: eventTypes[index % eventTypes.length],
    }));
}

/**
 * Find scheduled event for today
 */
export function findTodayScheduledEvent(
    dateStr: string,
    pendingEvents: ScheduledEvent[]
): ScheduledEvent | undefined {
    return pendingEvents.find((evt) => evt.scheduledDate === dateStr);
}

/**
 * Remove today's event from pending list
 */
export function removeTodayEventFromSchedule(
    dateStr: string,
    pendingEvents: ScheduledEvent[]
): ScheduledEvent[] {
    return pendingEvents.filter((evt) => evt.scheduledDate !== dateStr);
}
