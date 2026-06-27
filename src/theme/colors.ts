import type { PracticeCategory } from '../types/practice';

/**
 * The single source of colour truth. Components must consume these tokens —
 * no hardcoded hex values anywhere else in the app.
 */
export const colors = {
  background: '#F5F6F8',
  surface: '#FFFFFF',
  border: '#E3E6EB',

  text: '#1A1D21',
  textMuted: '#6B7280',
  textInverse: '#FFFFFF',

  primary: '#4F46E5',
  primaryMuted: '#EEF2FF',

  success: '#16A34A',
  successMuted: '#ECFDF3',
  danger: '#DC2626',
  dangerMuted: '#FEF2F2',

  star: '#F59E0B',
  starEmpty: '#D1D5DB',

  overlay: 'rgba(17, 24, 39, 0.45)',
} as const;

/** Accent colour per practice category, used for the card's category chip. */
export const categoryColors: Record<PracticeCategory, string> = {
  movement: '#2563EB',
  breath: '#0891B2',
  reflection: '#7C3AED',
  rest: '#475569',
};

export type Colors = typeof colors;
