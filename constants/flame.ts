export const DECAY = 0.97;
export const GAIN  = 1.0;

// Stage thresholds — single source of truth (mirrored in functions/src/ema.ts)
export const STAGE_THRESHOLDS = {
  inferno:     25,
  fire:        16,
  flame:       8,
  small_flame: 3,
  spark:       0,
} as const;
