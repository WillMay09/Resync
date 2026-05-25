/**
 * __tests__/countdown.test.ts
 *
 * Tier 1 Unit Tests — Countdown Logic
 *
 * Tests the pure function that calculates time remaining until
 * a target HH:MM time on the current day.
 *
 * No mocking required. No React. No setInterval. Pure function
 * with injectable clock.
 */

import { calculateCountdown } from '../utils/countdown';

// ═══════════════════════════════════════════════════════════════
// Helper
// ═══════════════════════════════════════════════════════════════

function timeAt(hours: number, minutes: number, seconds = 0): Date {
  const d = new Date('2026-05-25T00:00:00');
  d.setHours(hours, minutes, seconds, 0);
  return d;
}

// ═══════════════════════════════════════════════════════════════
// Target in the future
// ═══════════════════════════════════════════════════════════════

describe('calculateCountdown — target in future', () => {
  it('returns correct hours and minutes for a simple case', () => {
    // Now: 14:00, Target: 18:30 → 4h 30m remaining
    const result = calculateCountdown('18:30', timeAt(14, 0));
    expect(result.hours).toBe(4);
    expect(result.minutes).toBe(30);
    expect(result.isPast).toBe(false);
  });

  it('returns correct values when less than an hour remains', () => {
    // Now: 18:00, Target: 18:30 → 0h 30m
    const result = calculateCountdown('18:30', timeAt(18, 0));
    expect(result.hours).toBe(0);
    expect(result.minutes).toBe(30);
    expect(result.isPast).toBe(false);
  });

  it('returns correct values when exactly 1 minute remains', () => {
    // Now: 18:29, Target: 18:30 → 0h 1m (floor of ~60 seconds)
    const result = calculateCountdown('18:30', timeAt(18, 29, 0));
    expect(result.hours).toBe(0);
    expect(result.minutes).toBe(1);
    expect(result.isPast).toBe(false);
  });

  it('handles many hours remaining', () => {
    // Now: 06:00, Target: 22:00 → 16h 0m
    const result = calculateCountdown('22:00', timeAt(6, 0));
    expect(result.hours).toBe(16);
    expect(result.minutes).toBe(0);
    expect(result.isPast).toBe(false);
  });

  it('handles target at midnight from early in the day', () => {
    // Now: 00:00:01 (just after midnight), Target: 00:00
    // Target is midnight same day, which is already past
    const result = calculateCountdown('00:00', timeAt(0, 0, 1));
    expect(result.isPast).toBe(true);
  });

  it('handles seconds correctly (floors to minutes)', () => {
    // Now: 17:30:45, Target: 18:30 → 59m 15s → floor = 59m → 0h 59m
    const result = calculateCountdown('18:30', timeAt(17, 30, 45));
    expect(result.hours).toBe(0);
    expect(result.minutes).toBe(59);
    expect(result.isPast).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════
// Target has passed
// ═══════════════════════════════════════════════════════════════

describe('calculateCountdown — target has passed', () => {
  it('returns isPast when target is before current time', () => {
    // Now: 20:00, Target: 18:30
    const result = calculateCountdown('18:30', timeAt(20, 0));
    expect(result.isPast).toBe(true);
    expect(result.hours).toBe(0);
    expect(result.minutes).toBe(0);
  });

  it('returns isPast when target is exactly now', () => {
    // Now: 18:30:00, Target: 18:30
    // diffMs = 0, which is <= 0, so isPast
    const result = calculateCountdown('18:30', timeAt(18, 30, 0));
    expect(result.isPast).toBe(true);
  });

  it('returns isPast when target was minutes ago', () => {
    const result = calculateCountdown('09:00', timeAt(9, 5));
    expect(result.isPast).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// Edge cases around midnight
// ═══════════════════════════════════════════════════════════════

describe('calculateCountdown — midnight edge cases', () => {
  it('returns correct countdown from midnight to a morning target', () => {
    // Now: 00:00, Target: 09:00 → 9h 0m
    const result = calculateCountdown('09:00', timeAt(0, 0));
    expect(result.hours).toBe(9);
    expect(result.minutes).toBe(0);
    expect(result.isPast).toBe(false);
  });

  it('late night current time with early target is already past', () => {
    // Now: 23:00, Target: 06:00
    // Since the function only looks at the same calendar day,
    // 06:00 is in the past relative to 23:00
    const result = calculateCountdown('06:00', timeAt(23, 0));
    expect(result.isPast).toBe(true);
  });

  it('handles target at 23:59 from 23:00', () => {
    // Now: 23:00, Target: 23:59 → 0h 59m
    const result = calculateCountdown('23:59', timeAt(23, 0));
    expect(result.hours).toBe(0);
    expect(result.minutes).toBe(59);
    expect(result.isPast).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════
// Return value structure
// ═══════════════════════════════════════════════════════════════

describe('calculateCountdown — return structure', () => {
  it('always returns non-negative hours and minutes', () => {
    const past = calculateCountdown('08:00', timeAt(20, 0));
    expect(past.hours).toBeGreaterThanOrEqual(0);
    expect(past.minutes).toBeGreaterThanOrEqual(0);

    const future = calculateCountdown('20:00', timeAt(8, 0));
    expect(future.hours).toBeGreaterThanOrEqual(0);
    expect(future.minutes).toBeGreaterThanOrEqual(0);
  });

  it('minutes is always less than 60', () => {
    const result = calculateCountdown('23:59', timeAt(0, 0));
    expect(result.minutes).toBeLessThan(60);
  });
});
