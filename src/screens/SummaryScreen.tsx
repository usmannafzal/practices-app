import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { useCallback, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '../components/Card';
import { StateView } from '../components/StateView';
import { useResponsiveColumns } from '../hooks/useResponsiveColumns';
import { useSummary, type PracticeSummary } from '../hooks/useSummary';
import { colors, radius, spacing, typography } from '../theme';
import type { Practice } from '../types/practice';

const keyExtractor = (item: Practice) => item.id;

// See PracticesListScreen: FlashList has no columnWrapperStyle, so column gaps
// come from a half-gutter inside each cell + reduced list horizontal padding.
const HALF_GUTTER = spacing.md / 2;

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SummaryHeader({ summary }: { summary: PracticeSummary }) {
  const avg =
    summary.averageRating != null ? summary.averageRating.toFixed(1) : '—';

  return (
    <View style={styles.header}>
      <Text style={styles.heading}>Today’s Summary</Text>
      <View style={styles.statsRow}>
        <StatCard label="Completed today" value={String(summary.completedCount)} />
        <StatCard label="Average rating" value={avg} />
      </View>
      {summary.completedCount > 0 ? (
        <Text style={styles.subheading}>
          Completed practices
          {summary.ratedCount < summary.completedCount
            ? ` · ${summary.ratedCount} rated`
            : ''}
        </Text>
      ) : null}
    </View>
  );
}

export function SummaryScreen() {
  const insets = useSafeAreaInsets();
  const numColumns = useResponsiveColumns();
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useSummary();

  const renderItem = useCallback<ListRenderItem<Practice>>(
    ({ item }) => (
      <View style={styles.cell}>
        <Card practice={item} />
      </View>
    ),
    [],
  );

  const contentContainerStyle = useMemo(
    () => ({
      paddingTop: spacing.lg,
      paddingHorizontal: spacing.lg - HALF_GUTTER,
      paddingBottom: insets.bottom + spacing.lg,
    }),
    [insets.bottom],
  );

  if (isLoading) {
    return <StateView kind="loading" />;
  }

  if (isError || !data) {
    return (
      <StateView
        kind="error"
        message={error instanceof Error ? error.message : undefined}
        onRetry={refetch}
      />
    );
  }

  return (
    <View style={styles.screen}>
      <FlashList
        key={`cols-${numColumns}`}
        data={data.completed}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={numColumns}
        ListHeaderComponent={<SummaryHeader summary={data} />}
        // Pull the header back out to the full `spacing.lg` edge that the cell
        // half-gutter removed from the content container.
        ListHeaderComponentStyle={styles.headerWrap}
        ListEmptyComponent={
          <StateView
            kind="empty"
            style={styles.empty}
            title="Nothing completed yet"
            message="Mark a practice complete to see it here."
          />
        }
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={false}
        refreshing={isRefetching}
        onRefresh={refetch}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  cell: { paddingHorizontal: HALF_GUTTER, paddingBottom: spacing.md },
  headerWrap: { paddingHorizontal: HALF_GUTTER },
  header: { gap: spacing.md, marginBottom: spacing.md },
  heading: { ...typography.title, color: colors.text },
  statsRow: { flexDirection: 'row', gap: spacing.md },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  statValue: { ...typography.title, color: colors.primary },
  statLabel: { ...typography.caption, color: colors.textMuted },
  subheading: { ...typography.heading, color: colors.text },
  empty: { paddingVertical: spacing.xxl },
});
