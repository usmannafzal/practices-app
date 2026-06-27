import { memo } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  CARD_HEIGHT,
  categoryColors,
  colors,
  radius,
  spacing,
  typography,
} from '../theme';
import type { Practice } from '../types/practice';
import { Stars } from './Stars';

type Props = {
  practice: Practice;
  /** When provided the whole card is pressable (List navigates to Detail). */
  onPress?: (id: string) => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * Fixed-height practice card, shared by the List and Summary screens.
 *
 * The height is locked to `CARD_HEIGHT` and the description is clamped to 2
 * lines, so every cell is the same size — which keeps the FlashList grid even
 * and lets recycling reuse cells without re-measuring.
 *
 * Wrapped in `React.memo`: combined with a stable `onPress`, a recycled card
 * only re-renders when the `practice` it is bound to actually changes.
 */
function CardComponent({ practice, onPress, style }: Props) {
  const accent = categoryColors[practice.category];
  const pressable = typeof onPress === 'function';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && pressable && styles.pressed,
        style,
      ]}
      disabled={!pressable}
      onPress={pressable ? () => onPress?.(practice.id) : undefined}
      accessibilityRole={pressable ? 'button' : undefined}
      accessibilityLabel={`${practice.title}, ${
        practice.completed_today ? 'completed' : 'pending'
      }`}>
      <View style={styles.header}>
        <View style={[styles.chip, { backgroundColor: accent }]}>
          <Text style={styles.chipText}>{practice.category}</Text>
        </View>
        <Text style={styles.duration}>{practice.duration_minutes} min</Text>
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {practice.title}
      </Text>
      <Text style={styles.description} numberOfLines={2}>
        {practice.description}
      </Text>

      <View style={styles.footer}>
        <View
          style={[
            styles.status,
            practice.completed_today ? styles.statusDone : styles.statusPending,
          ]}>
          <Text
            style={[
              styles.statusText,
              {
                color: practice.completed_today
                  ? colors.success
                  : colors.textMuted,
              },
            ]}>
            {practice.completed_today ? 'Completed' : 'Pending'}
          </Text>
        </View>
        {practice.rating != null ? (
          <Stars rating={practice.rating} size={14} />
        ) : null}
      </View>
    </Pressable>
  );
}

export const Card = memo(CardComponent);

const styles = StyleSheet.create({
  card: {
    height: CARD_HEIGHT,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  pressed: { opacity: 0.9 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  chipText: {
    ...typography.caption,
    color: colors.textInverse,
    textTransform: 'capitalize',
  },
  duration: { ...typography.caption, color: colors.textMuted },
  title: { ...typography.heading, color: colors.text },
  description: { ...typography.body, color: colors.textMuted },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  status: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  statusDone: { backgroundColor: colors.successMuted },
  statusPending: { backgroundColor: colors.background },
  statusText: { ...typography.caption },
});
