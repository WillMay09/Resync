/**
 * ema.ts — Pure EMA functions extracted for testability.
 *
 * These are the SAME formulas used in:
 *   - constants/flame.ts  (client constants)
 *   - functions/src/ema.ts (server constants)
 *   - hooks/useFlameScore.ts (inline copies — should import from here)
 *
 * Import this file from useFlameScore instead of inlining the logic.
 * The server Cloud Functions maintain their own copy (functions/src/ema.ts)
 * because they run in a separate Node environment.
 */

import { DECAY, GAIN, STAGE_THRESHOLDS } from '../constants/flame';
import type { FlameStage } from '../types';

/**
 * Apply lazy decay for all elapsed days since the last score update.
 * Uses a single Math.pow() call — not iterated day-by-day.
 */
export function applyLazyDecay(score: number, lastScoreDate: string): number {
  const today = new Date().toISOString().split('T')[0];
  const msPerDay = 1000 * 60 * 60 * 24;
  const elapsed = Math.max(
    0,
    Math.floor(
      (new Date(today).getTime() - new Date(lastScoreDate).getTime()) / msPerDay
    )
  );
  return score * Math.pow(DECAY, elapsed);
}

/**
 * Testable version that accepts "today" as a parameter,
 * so tests don't depend on the system clock.
 */
export function applyLazyDecayAt(
  score: number,
  lastScoreDate: string,
  today: string
): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const elapsed = Math.max(
    0,
    Math.floor(
      (new Date(today).getTime() - new Date(lastScoreDate).getTime()) / msPerDay
    )
  );
  return score * Math.pow(DECAY, elapsed);
}

/**
 * Compute the new score after a session (or a day with no session).
 * Applies decay for all elapsed days, then optionally adds GAIN.
 */
export function computeNewScore(
  storedScore: number,
  lastScoreDate: string,
  sessionCompleted: boolean,
  today: string
): number {
  const decayed = applyLazyDecayAt(storedScore, lastScoreDate, today);
  return sessionCompleted ? decayed + GAIN : decayed;
}

/**
 * Map a numeric score to a flame stage.
 */
export function getStage(score: number): FlameStage {
  if (score >= STAGE_THRESHOLDS.inferno) return 'inferno';
  if (score >= STAGE_THRESHOLDS.fire) return 'fire';
  if (score >= STAGE_THRESHOLDS.flame) return 'flame';
  if (score >= STAGE_THRESHOLDS.small_flame) return 'small_flame';
  return 'spark';
}
