export const colors = {
  // Base
  bg:           '#0e0e10',
  bgCard:       'rgba(255,255,255,0.04)',
  border:       'rgba(255,255,255,0.08)',
  borderHov:    'rgba(255,255,255,0.14)',
  text:         '#f0ece4',
  textMuted:    'rgba(240,236,228,0.38)',
  textSub:      'rgba(240,236,228,0.6)',

  // Deep work accent (amber)
  accent:       '#D4823A',
  accentDim:    'rgba(212,130,58,0.18)',
  accentMid:    'rgba(212,130,58,0.45)',

  // Shallow work mode (cool blue — intentionally distinct from amber)
  shallow:      '#9ec4f0',
  shallowDim:   'rgba(160,200,240,0.08)',
  shallowBorder:'rgba(160,200,240,0.18)',
} as const;

export type ColorKey = keyof typeof colors;
