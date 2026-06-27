import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, spacing, typography } from '../theme';
import { Button } from './Button';

type Props = {
  kind: 'loading' | 'error' | 'empty';
  title?: string;
  message?: string;
  onRetry?: () => void;
  style?: StyleProp<ViewStyle>;
};

const DEFAULTS: Record<Props['kind'], { title: string; message: string }> = {
  loading: { title: 'Loading…', message: 'Fetching your practices.' },
  error: {
    title: 'Something went wrong',
    message: 'We couldn’t load your practices.',
  },
  empty: {
    title: 'Nothing here yet',
    message: 'There are no practices to show.',
  },
};

/** Full-screen, visibly distinct loading / error / empty state. */
export function StateView({ kind, title, message, onRetry, style }: Props) {
  const fallback = DEFAULTS[kind];

  return (
    <View style={[styles.container, style]}>
      {kind === 'loading' ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <Text style={[styles.glyph, kind === 'error' && styles.glyphError]}>
          {kind === 'error' ? '!' : '∅'}
        </Text>
      )}
      <Text style={styles.title}>{title ?? fallback.title}</Text>
      <Text style={styles.message}>{message ?? fallback.message}</Text>
      {kind === 'error' && onRetry ? (
        <Button title="Try again" onPress={onRetry} style={styles.retry} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  glyph: {
    fontSize: spacing.xxl,
    fontWeight: '800',
    color: colors.textMuted,
  },
  glyphError: { color: colors.danger },
  title: { ...typography.heading, color: colors.text, textAlign: 'center' },
  message: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
  retry: { marginTop: spacing.md, alignSelf: 'stretch' },
});
