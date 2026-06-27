import { useWindowDimensions } from 'react-native';

/** Render two columns once the available width crosses the tablet breakpoint. */
export const TWO_COLUMN_MIN_WIDTH = 600;

/**
 * Drives the List/Summary grid column count off the live window width.
 *
 * 2 columns when the current width is tablet-sized (>= 600dp), else 1. Using the
 * *current* width (not the device's shorter edge) means it reacts to orientation
 * changes — `useWindowDimensions` re-renders on rotate — and a tablet shows two
 * cards per row in both portrait and landscape, while phones stay single-column
 * in portrait.
 */
export function useResponsiveColumns(): number {
  const { width } = useWindowDimensions();
  return width >= TWO_COLUMN_MIN_WIDTH ? 2 : 1;
}
