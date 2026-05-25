/**
 * __tests__/ema.test.ts
 *
 * Tier 1 Unit Tests — EMA Flame System
 *
 * Tests the pure math behind the flame scoring system:
 *   - Lazy decay calculation
 *   - Score computation (decay + gain)
 *   - Stage threshold mapping
 *   - Convergence behavior
 *   - Client-server consistency
 *
 * No mocking required. No Firebase. No React. Pure functions.
 */

import { applyLazyDecayAt, computeNewScore, getStage } from '../utils/ema';

// ═══════════════════════════════════════════════════════════════
// Constants (duplicated here so tests catch drift between copies)
// ═══════════════════════════════════════════════════════════════

const DECAY = 0.97;
const GAIN = 1.0;

// ═══════════════════════════════════════════════════════════════
// applyLazyDecayAt
// ═══════════════════════════════════════════════════════════════

describe('applyLazyDecayAt', () => {
  it('returns the original score when zero days have elapsed', () => {
    const score = applyLazyDecayAt(10, '2026-05-25', '2026-05-25');
    expect(score).toBe(10);
  });

  it('applies one day of decay correctly', () => {
    const score = applyLazyDecayAt(10, '2026-05-24', '2026-05-25');
    expect(score).toBeCloseTo(10 * DECAY, 10);
  });

  it('applies 5 days of decay correctly', () => {
    const score = applyLazyDecayAt(20, '2026-05-20', '2026-05-25');
    expect(score).toBeCloseTo(20 * Math.pow(DECAY, 5), 10);
  });

  it('applies 30 days of decay correctly', () => {
    const score = applyLazyDecayAt(30, '2026-04-25', '2026-05-25');
    expect(score).toBeCloseTo(30 * Math.pow(DECAY, 30), 10);
  });

  it('applies 365 days of decay correctly', () => {
    const score = applyLazyDecayAt(33, '2025-05-25', '2026-05-25');
    const expected = 33 * Math.pow(DECAY, 365);
    expect(score).toBeCloseTo(expected, 10);
    // After a full year of inactivity, the score should be nearly zero
    expect(score).toBeLessThan(0.01);
  });

  it('returns 0 when score is 0 regardless of elapsed days', () => {
    expect(applyLazyDecayAt(0, '2026-01-01', '2026-05-25')).toBe(0);
  });

  it('clamps negative elapsed days to 0 (future lastScoreDate)', () => {
    // If lastScoreDate is somehow in the future, elapsed = max(0, negative) = 0
    const score = applyLazyDecayAt(10, '2026-05-30', '2026-05-25');
    expect(score).toBe(10);
  });

  it('handles same-day correctly across date string formats', () => {
    // Both are the same calendar date
    const score = applyLazyDecayAt(15, '2026-05-25', '2026-05-25');
    expect(score).toBe(15);
  });

  it('decays a very large score without overflow', () => {
    const score = applyLazyDecayAt(1000, '2026-05-20', '2026-05-25');
    expect(score).toBeCloseTo(1000 * Math.pow(DECAY, 5), 8);
    expect(Number.isFinite(score)).toBe(true);
  });

  it('decays a very small score without reaching negative', () => {
    const score = applyLazyDecayAt(0.001, '2026-01-01', '2026-05-25');
    expect(score).toBeGreaterThanOrEqual(0);
  });
});

// ═══════════════════════════════════════════════════════════════
// computeNewScore
// ═══════════════════════════════════════════════════════════════

describe('computeNewScore', () => {
  it('applies decay then adds gain when session completed', () => {
    const result = computeNewScore(10, '2026-05-24', true, '2026-05-25');
    const expected = 10 * DECAY + GAIN;
    expect(result).toBeCloseTo(expected, 10);
  });

  it('applies decay only when session not completed', () => {
    const result = computeNewScore(10, '2026-05-24', false, '2026-05-25');
    const expected = 10 * DECAY;
    expect(result).toBeCloseTo(expected, 10);
  });

  it('returns GAIN for a brand new user completing their first session', () => {
    const result = computeNewScore(0, '2026-05-25', true, '2026-05-25');
    expect(result).toBe(GAIN);
  });

  it('returns 0 for a brand new user with no session', () => {
    const result = computeNewScore(0, '2026-05-25', false, '2026-05-25');
    expect(result).toBe(0);
  });

  it('applies multi-day decay then adds gain', () => {
    // 5 days inactive, then a session
    const result = computeNewScore(20, '2026-05-20', true, '2026-05-25');
    const expected = 20 * Math.pow(DECAY, 5) + GAIN;
    expect(result).toBeCloseTo(expected, 10);
  });

  it('gain offsets exactly one day of decay at equilibrium', () => {
    // At equilibrium (~33.33), gain should roughly equal decay
    // equilibrium = GAIN / (1 - DECAY) = 1 / 0.03 ≈ 33.33
    const equilibrium = GAIN / (1 - DECAY);
    const result = computeNewScore(equilibrium, '2026-05-24', true, '2026-05-25');
    // Should be very close to the equilibrium value
    expect(result).toBeCloseTo(equilibrium, 1);
  });
});

// ═══════════════════════════════════════════════════════════════
// getStage
// ═══════════════════════════════════════════════════════════════

describe('getStage', () => {
  // Exact boundary tests
  it('returns spark for score 0', () => {
    expect(getStage(0)).toBe('spark');
  });

  it('returns spark for score just below 3', () => {
    expect(getStage(2.99)).toBe('spark');
  });

  it('returns small_flame at exactly 3', () => {
    expect(getStage(3)).toBe('small_flame');
  });

  it('returns small_flame for score just below 8', () => {
    expect(getStage(7.99)).toBe('small_flame');
  });

  it('returns flame at exactly 8', () => {
    expect(getStage(8)).toBe('flame');
  });

  it('returns flame for score just below 16', () => {
    expect(getStage(15.99)).toBe('flame');
  });

  it('returns fire at exactly 16', () => {
    expect(getStage(16)).toBe('fire');
  });

  it('returns fire for score just below 25', () => {
    expect(getStage(24.99)).toBe('fire');
  });

  it('returns inferno at exactly 25', () => {
    expect(getStage(25)).toBe('inferno');
  });

  it('returns inferno for very high scores', () => {
    expect(getStage(100)).toBe('inferno');
  });

  it('returns spark for negative scores (defensive)', () => {
    expect(getStage(-1)).toBe('spark');
  });
});

// ═══════════════════════════════════════════════════════════════
// Convergence behavior
// ═══════════════════════════════════════════════════════════════

describe('convergence', () => {
  it('converges to ~33.3 after 200 consecutive daily sessions', () => {
    let score = 0;
    let date = new Date('2026-01-01');

    for (let i = 0; i < 200; i++) {
      const lastDate = date.toISOString().split('T')[0];
      date.setDate(date.getDate() + 1);
      const today = date.toISOString().split('T')[0];
      score = computeNewScore(score, lastDate, true, today);
    }

    const theoretical = GAIN / (1 - DECAY); // ≈ 33.33
    expect(score).toBeCloseTo(theoretical, 0);
  });

  it('a user who sessions 5/7 days has a lower but stable score', () => {
    let score = 0;
    let date = new Date('2026-01-01');

    // Simulate 20 weeks (140 days), sessioning Mon-Fri, skipping Sat-Sun
    for (let week = 0; week < 20; week++) {
      for (let day = 0; day < 7; day++) {
        const lastDate = date.toISOString().split('T')[0];
        date.setDate(date.getDate() + 1);
        const today = date.toISOString().split('T')[0];
        const isWeekday = day < 5;
        score = computeNewScore(score, lastDate, isWeekday, today);
      }
    }

    // 5/7 consistency should converge lower than the 33.3 max
    // Theoretical: each week the pattern is 5 gains + 7 decays
    // Score should stabilize somewhere around 23-24
    expect(score).toBeGreaterThan(15);
    expect(score).toBeLessThan(30);
  });

  it('score never reaches zero after missed days (ember survives)', () => {
    let score = 20; // Built up a decent streak

    // Miss 30 days straight
    const decayed = applyLazyDecayAt(score, '2026-04-25', '2026-05-25');
    expect(decayed).toBeGreaterThan(0);

    // Miss 365 days
    const yearDecay = applyLazyDecayAt(score, '2025-05-25', '2026-05-25');
    expect(yearDecay).toBeGreaterThan(0);
  });

  it('30-day streak then disappear scores lower than consistent 5/7', () => {
    // User A: 30-day streak then 30 days off
    let scoreA = 0;
    let dateA = new Date('2026-01-01');
    for (let i = 0; i < 30; i++) {
      const lastDate = dateA.toISOString().split('T')[0];
      dateA.setDate(dateA.getDate() + 1);
      const today = dateA.toISOString().split('T')[0];
      scoreA = computeNewScore(scoreA, lastDate, true, today);
    }
    // Now 30 days of decay
    const lastA = dateA.toISOString().split('T')[0];
    dateA.setDate(dateA.getDate() + 30);
    const endA = dateA.toISOString().split('T')[0];
    scoreA = computeNewScore(scoreA, lastA, false, endA);

    // User B: steady 5/7 for 60 days
    let scoreB = 0;
    let dateB = new Date('2026-01-01');
    for (let week = 0; week < 8; week++) {
      for (let day = 0; day < 7; day++) {
        const lastDate = dateB.toISOString().split('T')[0];
        dateB.setDate(dateB.getDate() + 1);
        const today = dateB.toISOString().split('T')[0];
        scoreB = computeNewScore(scoreB, lastDate, day < 5, today);
      }
    }

    // The consistent user should have a higher score
    expect(scoreB).toBeGreaterThan(scoreA);
  });
});

// ═══════════════════════════════════════════════════════════════
// Client-server consistency
// ═══════════════════════════════════════════════════════════════

describe('client-server consistency', () => {
  /**
   * This test verifies that the client-side applyLazyDecayAt + GAIN
   * produces the same result as the server-side computeNewScore.
   *
   * In production, these are in separate files:
   *   - Client: constants/flame.ts + hooks/useFlameScore.ts
   *   - Server: functions/src/ema.ts
   *
   * If you change DECAY/GAIN/THRESHOLDS, run this test against BOTH
   * copies to verify they still agree.
   */
  it('client lazy decay + gain matches server computeNewScore', () => {
    const storedScore = 15;
    const lastDate = '2026-05-20';
    const today = '2026-05-25';

    // Client path: apply decay on read, then what the server would add
    const clientDecayed = applyLazyDecayAt(storedScore, lastDate, today);
    const clientFinal = clientDecayed + GAIN;

    // Server path: computeNewScore does decay + gain in one call
    const serverFinal = computeNewScore(storedScore, lastDate, true, today);

    expect(clientFinal).toBeCloseTo(serverFinal, 10);
  });

  it('stage derived from client decay matches stage from server score', () => {
    const storedScore = 14;
    const lastDate = '2026-05-23';
    const today = '2026-05-25';

    const clientDecayed = applyLazyDecayAt(storedScore, lastDate, today);
    const serverScore = computeNewScore(storedScore, lastDate, false, today);

    // Without a session, both should give same decayed value and stage
    expect(getStage(clientDecayed)).toBe(getStage(serverScore));
  });
});
