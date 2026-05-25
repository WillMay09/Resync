import { useEffect, useState } from 'react';
import { evaluateMode, type ModeResult } from '../utils/mode';

// ── Inline implementation (replaced by utils/mode.ts) ──────────
//
// type Mode = 'deep' | 'shallow';
//
// interface ModeResult {
//   mode: Mode;
//   label: string;
// }
//
// function evaluate() {
//   const [h, m] = sessionAnchorTime!.split(':').map(Number);
//   const now = new Date();
//   const nowMinutes = now.getHours() * 60 + now.getMinutes();
//   const anchorMinutes = h * 60 + m;
//
//   const deepStart = anchorMinutes - 30;
//   const deepEnd = anchorMinutes + 120;
//
//   if (nowMinutes >= deepStart && nowMinutes <= deepEnd) {
//     setResult({ mode: 'deep', label: 'Deep work' });
//   } else {
//     setResult({ mode: 'shallow', label: 'Shallow work' });
//   }
// }
// ────────────────────────────────────────────────────────────────

export function useMode(sessionAnchorTime: string | null): ModeResult {
  const [result, setResult] = useState<ModeResult>({ mode: 'shallow', label: 'Shallow work' });

  useEffect(() => {
    if (!sessionAnchorTime) return;

    function tick() {
      setResult(evaluateMode(sessionAnchorTime!, new Date()));
    }

    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [sessionAnchorTime]);

  return result;
}
