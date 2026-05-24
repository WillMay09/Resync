import { FlameStage } from './types';

export const DECAY = 0.97;
export const GAIN  = 1.0;

export const STAGE_THRESHOLDS: Record<FlameStage, number> = {
  inferno:     25,
  fire:        16,
  flame:       8,
  small_flame: 3,
  spark:       0,
};

export function daysBetween(dateA: string, dateB: string): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const a = new Date(dateA).getTime();
  const b = new Date(dateB).getTime();
  return Math.max(0, Math.floor((b - a) / msPerDay));
}

export function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

// Applies DECAY for every elapsed day since lastScoreDate, then adds GAIN if
// a session was completed today. No nightly cron needed — decay is always
// current on demand.
export function computeNewScore(
  storedScore: number,
  lastScoreDate: string,
  sessionCompletedToday: boolean
): number {
  const today   = todayString();
  const elapsed = daysBetween(lastScoreDate, today);
  const decayed = storedScore * Math.pow(DECAY, elapsed);
  return decayed + (sessionCompletedToday ? GAIN : 0);
}

export function getFlameStage(score: number): FlameStage {
  if (score >= STAGE_THRESHOLDS.inferno)     return 'inferno';
  if (score >= STAGE_THRESHOLDS.fire)        return 'fire';
  if (score >= STAGE_THRESHOLDS.flame)       return 'flame';
  if (score >= STAGE_THRESHOLDS.small_flame) return 'small_flame';
  return 'spark';
}
