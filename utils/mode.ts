/**
 * mode.ts — Pure mode evaluation extracted from hooks/useMode.ts.
 *
 * The useMode hook should import evaluateMode() from here
 * instead of inlining the logic, so this function is testable
 * without rendering a React component.
 */

export type Mode = 'deep' | 'shallow';

export interface ModeResult {
  mode: Mode;
  label: string;
}

/**
 * Determine whether the user is in deep or shallow work mode.
 *
 * Deep mode window: 30 minutes before anchor → 2 hours after anchor.
 * Everything outside that window is shallow mode.
 *
 * @param sessionAnchorTime  "HH:MM" format
 * @param now                Current Date (injectable for testing)
 */
export function evaluateMode(sessionAnchorTime: string, now: Date): ModeResult {
  const [h, m] = sessionAnchorTime.split(':').map(Number);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const anchorMinutes = h * 60 + m;

  const deepStart = anchorMinutes - 30;
  const deepEnd = anchorMinutes + 120;

  if (nowMinutes >= deepStart && nowMinutes <= deepEnd) {
    return { mode: 'deep', label: 'Deep work' };
  }
  return { mode: 'shallow', label: 'Shallow work' };
}
