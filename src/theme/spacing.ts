import { normalize } from './scale';

/**
 * Spacing scale (4pt grid), responsively normalized. Consume these instead of
 * hardcoding margins/paddings so layout stays proportional across screen sizes.
 */
export const spacing = {
  xs: normalize(4),
  sm: normalize(8),
  md: normalize(12),
  lg: normalize(16),
  xl: normalize(24),
  xxl: normalize(32),
} as const;

export const radius = {
  sm: normalize(8),
  md: normalize(12),
  lg: normalize(16),
  pill: normalize(999),
} as const;

export type Spacing = typeof spacing;
