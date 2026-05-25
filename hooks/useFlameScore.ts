import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { applyLazyDecay, getStage } from '../utils/ema';
import type { FlameStage } from '../types';

// ── Inline implementations (replaced by utils/ema.ts) ──────────
//
// import { DECAY, STAGE_THRESHOLDS } from '../constants/flame';
//
// function applyLazyDecay(score: number, lastScoreDate: string): number {
//   const today     = new Date().toISOString().split('T')[0];
//   const msPerDay  = 1000 * 60 * 60 * 24;
//   const elapsed   = Math.max(
//     0,
//     Math.floor((new Date(today).getTime() - new Date(lastScoreDate).getTime()) / msPerDay)
//   );
//   return score * Math.pow(DECAY, elapsed);
// }
//
// function getStage(score: number): FlameStage {
//   if (score >= STAGE_THRESHOLDS.inferno)     return 'inferno';
//   if (score >= STAGE_THRESHOLDS.fire)        return 'fire';
//   if (score >= STAGE_THRESHOLDS.flame)       return 'flame';
//   if (score >= STAGE_THRESHOLDS.small_flame) return 'small_flame';
//   return 'spark';
// }
// ────────────────────────────────────────────────────────────────

export function useFlameScore(uid: string | null) {
  const [score, setScore] = useState(0);
  const [stage, setStage] = useState<FlameStage>('spark');

  useEffect(() => {
    if (!uid) return;
    return onSnapshot(doc(db, 'users', uid), (snap) => {
      if (!snap.exists()) return;
      const data    = snap.data();
      const decayed = applyLazyDecay(data.consistencyScore ?? 0, data.lastScoreDate);
      setScore(decayed);
      setStage(getStage(decayed));
    });
  }, [uid]);

  return { score, stage };
}
