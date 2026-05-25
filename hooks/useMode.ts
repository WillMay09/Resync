import { useEffect, useState } from 'react';

type Mode = 'deep' | 'shallow';

interface ModeResult {
  mode: Mode;
  label: string;
}

export function useMode(sessionAnchorTime: string | null): ModeResult {
  const [result, setResult] = useState<ModeResult>({ mode: 'shallow', label: 'Shallow work' });

  useEffect(() => {
    if (!sessionAnchorTime) return;

    function evaluate() {
      const [h, m] = sessionAnchorTime!.split(':').map(Number);
      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const anchorMinutes = h * 60 + m;

      // Deep mode: from 30 min before anchor until 2 hours after
      const deepStart = anchorMinutes - 30;
      const deepEnd = anchorMinutes + 120;

      if (nowMinutes >= deepStart && nowMinutes <= deepEnd) {
        setResult({ mode: 'deep', label: 'Deep work' });
      } else {
        setResult({ mode: 'shallow', label: 'Shallow work' });
      }
    }

    evaluate();
    const id = setInterval(evaluate, 60000);
    return () => clearInterval(id);
  }, [sessionAnchorTime]);

  return result;
}
