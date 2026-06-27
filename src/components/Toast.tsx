import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '../theme';

export type ToastVariant = 'success' | 'error' | 'info';

type ToastInput = { message: string; variant?: ToastVariant };
type ToastState = { key: number; message: string; variant: ToastVariant };

const ToastContext = createContext<(toast: ToastInput) => void>(() => {});

/** Show a transient toast from any screen. Lives above navigation so a toast
 *  triggered before navigating (e.g. deleted-practice) is visible on the next
 *  screen too. */
export function useToast() {
  return useContext(ToastContext);
}

const VISIBLE_MS = 2600;

export function ToastProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastState | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-16)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((input: ToastInput) => {
    setToast({
      key: Date.now(),
      message: input.message,
      variant: input.variant ?? 'info',
    });
  }, []);

  useEffect(() => {
    if (!toast) {
      return;
    }
    opacity.setValue(0);
    translateY.setValue(-16);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();

    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
    }
    hideTimer.current = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start(() => setToast(null));
    }, VISIBLE_MS);

    return () => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }
    };
  }, [toast, opacity, translateY]);

  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast ? (
        <Animated.View
          key={toast.key}
          pointerEvents="none"
          accessibilityLiveRegion="polite"
          style={[
            styles.toast,
            VARIANT_STYLE[toast.variant],
            { top: insets.top + spacing.sm, opacity, transform: [{ translateY }] },
          ]}>
          <Text style={styles.text}>{toast.message}</Text>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

const VARIANT_STYLE: Record<ToastVariant, { backgroundColor: string }> = {
  success: { backgroundColor: colors.success },
  error: { backgroundColor: colors.danger },
  info: { backgroundColor: colors.text },
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    zIndex: 1000,
    elevation: 6,
  },
  text: { ...typography.label, color: colors.textInverse, textAlign: 'center' },
});
