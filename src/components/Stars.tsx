import { memo } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, spacing } from '../theme';
import type { Rating } from '../types/practice';

type Props = {
  /** Number of filled stars (0 = none). */
  rating: number;
  /** Star glyph size in px. */
  size?: number;
  /** When provided the stars become an interactive input. */
  onChange?: (value: Rating) => void;
  style?: StyleProp<ViewStyle>;
};

const STARS: Rating[] = [1, 2, 3, 4, 5];

/**
 * Star rating, display or input. Without `onChange` it's a read-only indicator
 * (used by the Card); with `onChange` each star is pressable (used on Detail).
 */
function StarsComponent({ rating, size = 18, onChange, style }: Props) {
  const interactive = typeof onChange === 'function';

  return (
    <View
      style={[styles.row, style]}
      accessibilityRole={interactive ? 'adjustable' : 'image'}
      accessibilityLabel={`Rating: ${rating} out of 5 stars`}>
      {STARS.map(value => {
        const filled = value <= rating;
        const glyph = (
          <Text
            style={[
              styles.star,
              { fontSize: size, color: filled ? colors.star : colors.starEmpty },
            ]}>
            {filled ? '\u2605' : '\u2606'}
          </Text>
        );

        if (!interactive) {
          return <View key={value}>{glyph}</View>;
        }

        return (
          <Pressable
            key={value}
            hitSlop={spacing.xs}
            accessibilityRole="button"
            accessibilityLabel={`Rate ${value} ${value === 1 ? 'star' : 'stars'}`}
            onPress={() => onChange?.(value)}>
            {glyph}
          </Pressable>
        );
      })}
    </View>
  );
}

export const Stars = memo(StarsComponent);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.xs },
  star: { lineHeight: undefined },
});
