/**
 * countdown.ts — Pure countdown calculation extracted from hooks/useCountdown.ts.
 *
 * The useCountdown hook should import calculateCountdown() from here
 * instead of inlining the logic, so this function is testable
 * without rendering a React component or depending on setInterval.
 */

export interface CountdownResult {
  hours: number;
  minutes: number;
  isPast: boolean;
}

/**
 * Calculate time remaining until a target HH:MM on the same day.
 *
 * @param targetTime  "HH:MM" format
 * @param now         Current Date (injectable for testing)
 */
export function calculateCountdown(targetTime: string, now: Date): CountdownResult {
  const [h, m] = targetTime.split(':').map(Number);
  const target = new Date(now);
  target.setHours(h, m, 0, 0);

  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) {
    return { hours: 0, minutes: 0, isPast: true };
  }

  const totalMinutes = Math.floor(diffMs / 60000);
  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
    isPast: false,
  };
}
