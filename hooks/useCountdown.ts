import { useEffect, useState } from 'react';

interface CountdownResult {
  hours: number;
  minutes: number;
  isPast: boolean;
}

export function useCountdown(targetTime: string | null): CountdownResult {
  const [result, setResult] = useState<CountdownResult>({ hours: 0, minutes: 0, isPast: true });

  useEffect(() => {
    if (!targetTime) return;

    function calculate() {
      const [h, m] = targetTime!.split(':').map(Number);
      const now = new Date();
      const target = new Date(now);
      target.setHours(h, m, 0, 0);

      const diffMs = target.getTime() - now.getTime();
      if (diffMs <= 0) {
        setResult({ hours: 0, minutes: 0, isPast: true });
        return;
      }

      const totalMinutes = Math.floor(diffMs / 60000);
      setResult({
        hours: Math.floor(totalMinutes / 60),
        minutes: totalMinutes % 60,
        isPast: false,
      });
    }

    calculate();
    const id = setInterval(calculate, 1000);
    return () => clearInterval(id);
  }, [targetTime]);

  return result;
}
