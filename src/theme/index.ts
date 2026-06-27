export { colors, categoryColors } from './colors';
export type { Colors } from './colors';
export { spacing, radius } from './spacing';
export type { Spacing } from './spacing';
export { typography } from './typography';
export type { Typography } from './typography';
export { normalize } from './scale';

/** Fixed card height (in normalized px). Keeping every card the same height
 *  keeps the FlashList grid even and recycling cheap. */
import { normalize } from './scale';
export const CARD_HEIGHT = normalize(150);
