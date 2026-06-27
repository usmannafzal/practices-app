import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '../components/Card';
import { StateView } from '../components/StateView';
import { usePractices } from '../hooks/usePractices';
import { useResponsiveColumns } from '../hooks/useResponsiveColumns';
import type { PracticesStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme';
import type { Practice } from '../types/practice';

type Props = NativeStackScreenProps<PracticesStackParamList, 'PracticesList'>;

const keyExtractor = (item: Practice) => item.id;

// FlashList has no `columnWrapperStyle`. A half-gutter inside every cell plus a
// matching reduction in the list's horizontal padding produces equal columns
// with a `spacing.md` gap between them and `spacing.lg` at the screen edges.
const HALF_GUTTER = spacing.md / 2;

export function PracticesListScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const numColumns = useResponsiveColumns();
  const { data, isLoading, isError, error, refetch, isRefetching } =
    usePractices();

  const goToDetail = useCallback(
    (id: string) => navigation.navigate('PracticeDetail', { id }),
    [navigation],
  );

  const renderItem = useCallback<ListRenderItem<Practice>>(
    ({ item }) => (
      <View style={styles.cell}>
        <Card practice={item} onPress={goToDetail} />
      </View>
    ),
    [goToDetail],
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

  if (isError) {
    return (
      <StateView
        kind="error"
        message={error instanceof Error ? error.message : undefined}
        onRetry={refetch}
      />
    );
  }

  if (!data || data.length === 0) {
    return (
      <StateView
        kind="empty"
        message="No daily practices are available right now."
      />
    );
  }

  return (
    <View style={styles.container}>
      <FlashList
        // Remount on column change so the grid re-lays out cleanly.
        key={`cols-${numColumns}`}
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={numColumns}
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={false}
        refreshing={isRefetching}
        onRefresh={refetch}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  cell: { paddingHorizontal: HALF_GUTTER, paddingBottom: spacing.md },
});
