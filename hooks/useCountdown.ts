import { useEffect, useState } from 'react';
import { calculateCountdown, type CountdownResult } from '../utils/countdown';

// ── Inline implementation (replaced by utils/countdown.ts) ─────
//
// interface CountdownResult {
//   hours: number;
//   minutes: number;
//   isPast: boolean;
// }
//
// function calculate() {
//   const [h, m] = targetTime!.split(':').map(Number);
//   const now = new Date();
//   const target = new Date(now);
//   target.setHours(h, m, 0, 0);
//
//   const diffMs = target.getTime() - now.getTime();
//   if (diffMs <= 0) {
//     setResult({ hours: 0, minutes: 0, isPast: true });
//     return;
//   }
//
//   const totalMinutes = Math.floor(diffMs / 60000);
//   setResult({
//     hours: Math.floor(totalMinutes / 60),
//     minutes: totalMinutes % 60,
//     isPast: false,
//   });
// }
// ────────────────────────────────────────────────────────────────

export function useCountdown(targetTime: string | null): CountdownResult {
  const [result, setResult] = useState<CountdownResult>({ hours: 0, minutes: 0, isPast: true });

  useEffect(() => {
    if (!targetTime) return;

    function tick() {
      setResult(calculateCountdown(targetTime!, new Date()));
    }

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetTime]);

  return result;
}
