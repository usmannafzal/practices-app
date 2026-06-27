import {
  createBottomTabNavigator,
  type BottomTabNavigationOptions,
} from '@react-navigation/bottom-tabs';
import {
  createNativeStackNavigator,
  type NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
import { StyleSheet, Text } from 'react-native';
import { PracticeDetailScreen } from '../screens/PracticeDetailScreen';
import { PracticesListScreen } from '../screens/PracticesListScreen';
import { SummaryScreen } from '../screens/SummaryScreen';
import { colors, typography } from '../theme';
import type { PracticesStackParamList, RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<PracticesStackParamList>();

const PRACTICES_GLYPH = '\u25C9'; // ◉
const SUMMARY_GLYPH = '\u25D0'; // ◐

const styles = StyleSheet.create({
  header: { backgroundColor: colors.surface },
  headerTitle: { ...typography.heading, color: colors.text },
  stackContent: { backgroundColor: colors.background },
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
  },
  tabLabel: { ...typography.caption },
  tabIcon: { fontSize: 18 },
});

function TabIcon({ glyph, color }: { glyph: string; color: string }) {
  return <Text style={[styles.tabIcon, { color }]}>{glyph}</Text>;
}

const stackScreenOptions: NativeStackNavigationOptions = {
  headerStyle: styles.header,
  headerTitleStyle: styles.headerTitle,
  headerShadowVisible: false,
  headerTintColor: colors.primary,
  contentStyle: styles.stackContent,
};

const tabScreenOptions: BottomTabNavigationOptions = {
  headerStyle: styles.header,
  headerTitleStyle: styles.headerTitle,
  headerShadowVisible: false,
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: colors.textMuted,
  tabBarStyle: styles.tabBar,
  tabBarLabelStyle: styles.tabLabel,
};

/** Practices tab: List -> Detail native stack. */
function PracticesStackNavigator() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen
        name="PracticesList"
        component={PracticesListScreen}
        options={{ title: 'Practices' }}
      />
      <Stack.Screen
        name="PracticeDetail"
        component={PracticeDetailScreen}
        options={{ title: 'Detail' }}
      />
    </Stack.Navigator>
  );
}

export function RootNavigator() {
  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen
        name="PracticesTab"
        component={PracticesStackNavigator}
        options={{
          title: 'Practices',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <TabIcon glyph={PRACTICES_GLYPH} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="SummaryTab"
        component={SummaryScreen}
        options={{
          title: 'Summary',
          tabBarIcon: ({ color }) => (
            <TabIcon glyph={SUMMARY_GLYPH} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
