import type { TextStyle } from 'react-native';
import { normalize } from './scale';

/**
 * Typography tokens. Each entry is a ready-to-spread TextStyle so screens never
 * hardcode font sizes or weights.
 */
export const typography = {
  title: {
    fontSize: normalize(22),
    fontWeight: '700',
    lineHeight: normalize(28),
  },
  heading: {
    fontSize: normalize(17),
    fontWeight: '600',
    lineHeight: normalize(22),
  },
  body: {
    fontSize: normalize(15),
    fontWeight: '400',
    lineHeight: normalize(20),
  },
  label: {
    fontSize: normalize(13),
    fontWeight: '600',
    lineHeight: normalize(16),
  },
  caption: {
    fontSize: normalize(12),
    fontWeight: '500',
    lineHeight: normalize(16),
  },
} as const satisfies Record<string, TextStyle>;

export type Typography = typeof typography;
