import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { useMemo } from 'react';
import { StatusBar, StyleSheet, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastProvider } from './src/components/Toast';
import { createQueryClient } from './src/api/queryClient';
import { RootNavigator } from './src/navigation/RootNavigator';

/**
 * Provider stack (outer -> inner):
 *   GestureHandlerRootView  - required by native-stack / gestures
 *   SafeAreaProvider        - notch/safe-area insets
 *   QueryClientProvider     - the single React Query cache, source of truth
 *   NavigationContainer     - tab + stack navigators
 */
function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const queryClient = useMemo(() => createQueryClient(), []);

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </ToastProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});

export default App;
