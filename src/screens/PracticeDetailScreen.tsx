import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ApiError, completePractice } from '../api/client';
import { Button } from '../components/Button';
import { ConfirmModal } from '../components/ConfirmModal';
import { Stars } from '../components/Stars';
import { StateView } from '../components/StateView';
import { useToast } from '../components/Toast';
import { useMarkComplete } from '../hooks/useMarkComplete';
import { usePractice } from '../hooks/usePractice';
import { useRatePractice } from '../hooks/useRatePractice';
import { removePractice } from '../hooks/practiceCache';
import { db } from '../mocks/db';
import type { PracticesStackParamList } from '../navigation/types';
import {
  categoryColors,
  colors,
  radius,
  spacing,
  typography,
} from '../theme';
import type { Rating } from '../types/practice';

type Props = NativeStackScreenProps<PracticesStackParamList, 'PracticeDetail'>;

const DELETED_MESSAGE = 'This practice was deleted and is no longer available.';

export function PracticeDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const insets = useSafeAreaInsets();
  const showToast = useToast();
  const qc = useQueryClient();

  const { data: practice, isLoading } = usePractice(id);
  const [pendingRating, setPendingRating] = useState<Rating | null>(null);

  const handleDeleted = useCallback(() => {
    showToast({ message: DELETED_MESSAGE, variant: 'error' });
    navigation.goBack();
  }, [navigation, showToast]);

  const markComplete = useMarkComplete(id, { onDeleted: handleDeleted });
  const rate = useRatePractice(id, { onDeleted: handleDeleted });

  // Surface non-404 failures (e.g. forced 500) without duplicating the deleted
  // path, which is already handled in the hooks via onDeleted.
  const showMutationError = useCallback(
    (error: Error) => {
      if (!(error instanceof ApiError && error.isNotFound)) {
        showToast({
          message: 'Something went wrong. Please try again.',
          variant: 'error',
        });
      }
    },
    [showToast],
  );

  const onMarkComplete = useCallback(() => {
    markComplete.mutate(undefined, { onError: showMutationError });
  }, [markComplete, showMutationError]);

  const applyRating = useCallback(
    (value: Rating, isUpdate: boolean) => {
      rate.mutate(value, {
        onSuccess: () =>
          showToast({
            message: isUpdate ? 'Rating updated.' : 'Rating added.',
            variant: 'success',
          }),
        onError: showMutationError,
      });
    },
    [rate, showToast, showMutationError],
  );

  const onStarPress = useCallback(
    (value: Rating) => {
      const current = practice?.rating ?? null;
      if (current == null) {
        // First-time rating: apply immediately, no confirmation.
        applyRating(value, false);
        return;
      }
      if (value === current) {
        return;
      }
      // Updating an existing rating requires confirmation.
      setPendingRating(value);
    },
    [practice?.rating, applyRating],
  );

  const confirmRatingChange = useCallback(() => {
    if (pendingRating != null) {
      applyRating(pendingRating, true);
    }
    setPendingRating(null);
  }, [pendingRating, applyRating]);

  const cancelRatingChange = useCallback(() => setPendingRating(null), []);

  // Dev-only: delete this practice server-side, then hit it with a mutation so
  // the 404 "deleted practice" path can be exercised by hand. Uses a
  // non-optimistic call on purpose, so no completed/rating UI flashes before we
  // navigate away (the real Mark complete button keeps its optimistic flash).
  const simulateServerDeletion = useCallback(async () => {
    db.deletePractice(id);
    try {
      await completePractice(id);
    } catch (error) {
      if (error instanceof ApiError && error.isNotFound) {
        removePractice(qc, id);
        handleDeleted();
      } else if (error instanceof Error) {
        showMutationError(error);
      }
    }
  }, [id, qc, handleDeleted, showMutationError]);

  if (isLoading) {
    return <StateView kind="loading" />;
  }

  if (!practice) {
    return (
      <StateView
        kind="empty"
        title="Practice unavailable"
        message={DELETED_MESSAGE}
      />
    );
  }

  const accent = categoryColors[practice.category];
  const isMutating = markComplete.isPending || rate.isPending;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + spacing.xl },
      ]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <View style={[styles.chip, { backgroundColor: accent }]}>
          <Text style={styles.chipText}>{practice.category}</Text>
        </View>
        <Text style={styles.duration}>{practice.duration_minutes} min</Text>
      </View>

      <Text style={styles.title}>{practice.title}</Text>
      <Text style={styles.description}>{practice.description}</Text>

      <View
        style={[
          styles.statusBadge,
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
          {practice.completed_today ? 'Completed today' : 'Pending'}
        </Text>
      </View>

      {!practice.completed_today ? (
        <Button
          title="Mark complete"
          onPress={onMarkComplete}
          loading={markComplete.isPending}
          style={styles.cta}
        />
      ) : (
        <View style={styles.ratingBlock}>
          <Text style={styles.ratingPrompt}>
            {practice.rating == null
              ? 'How was it? Tap a star to rate.'
              : 'Your rating'}
          </Text>
          <Stars
            rating={practice.rating ?? 0}
            size={36}
            onChange={isMutating ? undefined : onStarPress}
          />
          {practice.rating != null ? (
            <Text style={styles.ratingHint}>
              Tap a different star to change it.
            </Text>
          ) : null}
        </View>
      )}

      {__DEV__ ? (
        <Button
          title="Simulate server deletion (dev)"
          variant="danger"
          onPress={simulateServerDeletion}
          disabled={isMutating}
          style={styles.devButton}
        />
      ) : null}

      <ConfirmModal
        visible={pendingRating != null}
        title="Change your rating?"
        message={`Update this practice from ${practice.rating} ${
          practice.rating === 1 ? 'star' : 'stars'
        } to ${pendingRating} ${pendingRating === 1 ? 'star' : 'stars'}?`}
        confirmLabel="Change"
        cancelLabel="Keep"
        onConfirm={confirmRatingChange}
        onCancel={cancelRatingChange}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  chipText: {
    ...typography.caption,
    color: colors.textInverse,
    textTransform: 'capitalize',
  },
  duration: { ...typography.label, color: colors.textMuted },
  title: { ...typography.title, color: colors.text },
  description: { ...typography.body, color: colors.textMuted },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  statusDone: { backgroundColor: colors.successMuted },
  statusPending: { backgroundColor: colors.surface },
  statusText: { ...typography.label },
  cta: { marginTop: spacing.sm },
  ratingBlock: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  ratingPrompt: { ...typography.heading, color: colors.text },
  ratingHint: { ...typography.caption, color: colors.textMuted },
  devButton: { marginTop: spacing.lg },
});
