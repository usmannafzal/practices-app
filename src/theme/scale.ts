import { Dimensions, PixelRatio } from 'react-native';

/**
 * Responsive scaling helper.
 *
 * Layout is normalized against a 375pt baseline (iPhone X width) so spacing and
 * type sizes look proportional across phones and tablets. We read the *shorter*
 * screen edge so the scale factor does not jump when the device rotates to
 * landscape — orientation changes the column layout, not the base unit size.
 */
const BASELINE_WIDTH = 375;

function shortEdge(): number {
  const { width, height } = Dimensions.get('window');
  return Math.min(width, height);
}

/** Scale a size proportionally to the device width, rounded to the pixel grid. */
export function normalize(size: number): number {
  const factor = shortEdge() / BASELINE_WIDTH;
  // Damp the factor so large tablets don't get comically large text.
  const damped = 1 + (factor - 1) * 0.5;
  return Math.round(PixelRatio.roundToNearestPixel(size * damped));
}
