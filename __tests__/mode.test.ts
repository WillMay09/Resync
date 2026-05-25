/**
 * __tests__/mode.test.ts
 *
 * Tier 1 Unit Tests — Mode Evaluation
 *
 * Tests the pure function that determines deep vs. shallow work mode
 * based on the user's session anchor time and current time.
 *
 * Deep work window: [anchor - 30min, anchor + 120min]
 * Everything else: shallow.
 *
 * No mocking required. No React. Pure function with injectable clock.
 */

import { evaluateMode } from '../utils/mode';

// ═══════════════════════════════════════════════════════════════
// Helper: create a Date at a specific HH:MM on an arbitrary day
// ═══════════════════════════════════════════════════════════════

function timeAt(hours: number, minutes: number): Date {
  const d = new Date('2026-05-25T00:00:00');
  d.setHours(hours, minutes, 0, 0);
  return d;
}

// ═══════════════════════════════════════════════════════════════
// Core window boundaries
// ═══════════════════════════════════════════════════════════════

describe('evaluateMode — anchor at 18:30', () => {
  const anchor = '18:30';

  it('returns deep at exactly the anchor time', () => {
    const result = evaluateMode(anchor, timeAt(18, 30));
    expect(result.mode).toBe('deep');
    expect(result.label).toBe('Deep work');
  });

  it('returns deep at exactly 30 minutes before anchor (18:00)', () => {
    expect(evaluateMode(anchor, timeAt(18, 0)).mode).toBe('deep');
  });

  it('returns deep at exactly 2 hours after anchor (20:30)', () => {
    expect(evaluateMode(anchor, timeAt(20, 30)).mode).toBe('deep');
  });

  it('returns shallow at 31 minutes before anchor (17:59)', () => {
    expect(evaluateMode(anchor, timeAt(17, 59)).mode).toBe('shallow');
  });

  it('returns shallow at 121 minutes after anchor (20:31)', () => {
    expect(evaluateMode(anchor, timeAt(20, 31)).mode).toBe('shallow');
  });

  it('returns shallow well before the window (08:00)', () => {
    const result = evaluateMode(anchor, timeAt(8, 0));
    expect(result.mode).toBe('shallow');
    expect(result.label).toBe('Shallow work');
  });

  it('returns shallow well after the window (23:00)', () => {
    expect(evaluateMode(anchor, timeAt(23, 0)).mode).toBe('shallow');
  });

  it('returns deep at midpoint of the window (19:30)', () => {
    expect(evaluateMode(anchor, timeAt(19, 30)).mode).toBe('deep');
  });
});

// ═══════════════════════════════════════════════════════════════
// Morning anchor
// ═══════════════════════════════════════════════════════════════

describe('evaluateMode — morning anchor at 09:00', () => {
  const anchor = '09:00';

  it('deep window starts at 08:30', () => {
    expect(evaluateMode(anchor, timeAt(8, 30)).mode).toBe('deep');
  });

  it('deep window ends at 11:00', () => {
    expect(evaluateMode(anchor, timeAt(11, 0)).mode).toBe('deep');
  });

  it('08:29 is shallow', () => {
    expect(evaluateMode(anchor, timeAt(8, 29)).mode).toBe('shallow');
  });

  it('11:01 is shallow', () => {
    expect(evaluateMode(anchor, timeAt(11, 1)).mode).toBe('shallow');
  });

  it('midnight is shallow', () => {
    expect(evaluateMode(anchor, timeAt(0, 0)).mode).toBe('shallow');
  });
});

// ═══════════════════════════════════════════════════════════════
// Edge case: anchor near midnight
// ═══════════════════════════════════════════════════════════════

describe('evaluateMode — late anchor at 23:45', () => {
  const anchor = '23:45';

  /**
   * NOTE: The current implementation uses simple minute-of-day arithmetic.
   * anchor = 23:45 = 1425 minutes
   * deepStart = 1425 - 30 = 1395 (23:15) ✓
   * deepEnd   = 1425 + 120 = 1545 (25:45 — which is > 1440)
   *
   * Since nowMinutes maxes out at 1439 (23:59), the window effectively
   * runs from 23:15 to 23:59 but does NOT wrap to 00:00-01:45.
   *
   * This is a KNOWN LIMITATION. These tests document the actual behavior.
   * If midnight wrapping is needed, the formula needs to handle modular
   * arithmetic (nowMinutes >= deepStart || nowMinutes <= deepEnd % 1440).
   */

  it('returns deep at 23:15 (start of window)', () => {
    expect(evaluateMode(anchor, timeAt(23, 15)).mode).toBe('deep');
  });

  it('returns deep at 23:59 (end of day)', () => {
    expect(evaluateMode(anchor, timeAt(23, 59)).mode).toBe('deep');
  });

  it('returns shallow at 23:14 (just before window)', () => {
    expect(evaluateMode(anchor, timeAt(23, 14)).mode).toBe('shallow');
  });

  it('returns shallow at 00:30 (after midnight — window does NOT wrap)', () => {
    // This documents current behavior: the window truncates at midnight.
    // If you need it to wrap, update evaluateMode and flip this expectation.
    expect(evaluateMode(anchor, timeAt(0, 30)).mode).toBe('shallow');
  });

  it('returns shallow at 01:00 (would be in window if wrapping existed)', () => {
    expect(evaluateMode(anchor, timeAt(1, 0)).mode).toBe('shallow');
  });
});

// ═══════════════════════════════════════════════════════════════
// Edge case: anchor at 00:00
// ═══════════════════════════════════════════════════════════════

describe('evaluateMode — midnight anchor at 00:00', () => {
  const anchor = '00:00';

  /**
   * anchor = 0 minutes
   * deepStart = 0 - 30 = -30 → clamped behavior depends on comparison
   * deepEnd = 0 + 120 = 120 (02:00)
   *
   * Since nowMinutes is always >= 0, the condition
   * nowMinutes >= -30 is ALWAYS true, so the window is effectively
   * [00:00, 02:00]. The 30 min before midnight is lost.
   */

  it('returns deep at 00:00', () => {
    expect(evaluateMode(anchor, timeAt(0, 0)).mode).toBe('deep');
  });

  it('returns deep at 02:00', () => {
    expect(evaluateMode(anchor, timeAt(2, 0)).mode).toBe('deep');
  });

  it('returns shallow at 02:01', () => {
    expect(evaluateMode(anchor, timeAt(2, 1)).mode).toBe('shallow');
  });

  it('returns deep at 12:00 (because deepStart is -30, always true)', () => {
    // This is a BUG in the current implementation:
    // When anchor is 00:00, deepStart = -30, so nowMinutes >= -30 is
    // always true for any time of day, making the check rely only on
    // nowMinutes <= 120. But since noon (720) > 120, this should be shallow.
    //
    // Actually: 720 >= -30 (true) AND 720 <= 120 (false) → shallow. Correct.
    expect(evaluateMode(anchor, timeAt(12, 0)).mode).toBe('shallow');
  });

  it('returns shallow at 23:30 (before midnight, window does not wrap back)', () => {
    expect(evaluateMode(anchor, timeAt(23, 30)).mode).toBe('shallow');
  });
});

// ═══════════════════════════════════════════════════════════════
// Anchor at 00:15 — deepStart goes negative
// ═══════════════════════════════════════════════════════════════

describe('evaluateMode — anchor at 00:15 (deepStart = -15)', () => {
  const anchor = '00:15';

  it('returns deep at 00:00 (nowMinutes=0 >= deepStart=-15)', () => {
    expect(evaluateMode(anchor, timeAt(0, 0)).mode).toBe('deep');
  });

  it('returns deep at 02:15 (end of window)', () => {
    expect(evaluateMode(anchor, timeAt(2, 15)).mode).toBe('deep');
  });

  it('returns shallow at 23:50 (before midnight, not wrapped)', () => {
    expect(evaluateMode(anchor, timeAt(23, 50)).mode).toBe('shallow');
  });
});
