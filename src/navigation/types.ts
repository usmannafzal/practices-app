import type { NavigatorScreenParams } from '@react-navigation/native';

/**
 * Centralized navigation param lists. Screens import these so route params and
 * `navigate(...)` calls are type-checked end to end.
 */
export type PracticesStackParamList = {
  PracticesList: undefined;
  PracticeDetail: { id: string };
};

export type RootTabParamList = {
  PracticesTab: NavigatorScreenParams<PracticesStackParamList>;
  SummaryTab: undefined;
};
