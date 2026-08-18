import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet, PanResponder } from 'react-native';
import { useNetwork } from '@/hooks/use-network';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiClient } from '@/lib/api/client';
import { networkEvents } from '@/lib/api/networkEvents';

/**
 * A persistent offline banner that mimics YouTube's behavior.
 * Shows red when offline. When connection returns, pings the backend health route.
 * If successful, turns green and says "Back online" for 3 seconds before hiding.
 */
export function OfflineBanner() {
  const { isConnected } = useNetwork();
  const insets = useSafeAreaInsets();
  const bannerHeight = 28 + insets.top;

  const slideAnim = useRef(new Animated.Value(-500)).current;

  const [status, setStatus] = useState<'online' | 'offline' | 'checking' | 'initial'>('initial');
  const [showBanner, setShowBanner] = useState(false);

  const statusRef = useRef(status);
  statusRef.current = status;

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let pollInterval: ReturnType<typeof setInterval> | undefined = undefined;
    let isMounted = true;

    const checkHealth = () => {
      apiClient.get('/health', { timeout: 5000 })
        .then(() => {
          if (!isMounted) return;
          if (statusRef.current === 'offline' || statusRef.current === 'checking') {
            setStatus('online');
            setShowBanner(true);
            if (pollInterval) clearInterval(pollInterval);

            // Hide after 3 seconds
            timeout = setTimeout(() => {
              if (isMounted) {
                setShowBanner(false);
                setStatus('initial'); // Reset so we don't keep showing it
              }
            }, 3000);
          }
        })
        .catch(() => {
          if (!isMounted) return;
          // If backend is unreachable, we're effectively offline
          setStatus('offline');
          setShowBanner(true);
        });
    };

    const unsubscribe = networkEvents.subscribeOffline(() => {
      if (!isMounted) return;
      if (statusRef.current !== 'offline' && statusRef.current !== 'checking') {
        setStatus('offline');
        setShowBanner(true);
        if (pollInterval) clearInterval(pollInterval);
        pollInterval = setInterval(checkHealth, 5000);
      }
    });

    if (isConnected === false) {
      setStatus('offline');
      setShowBanner(true);
      if (pollInterval) clearInterval(pollInterval);
    } else if (isConnected === true) {
      // Only verify connectivity and show green banner if we were actually offline
      if (statusRef.current === 'offline' || statusRef.current === 'checking') {
        setStatus('checking');
        checkHealth();
        if (pollInterval) clearInterval(pollInterval);
        pollInterval = setInterval(checkHealth, 5000);
      }
    }

    return () => {
      isMounted = false;
      unsubscribe();
      if (timeout) clearTimeout(timeout);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [isConnected]); // Run ONLY when connection status changes to avoid clearing the timeout!

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: showBanner ? 0 : -200, // Move completely off-screen
      useNativeDriver: true,
      bounciness: 4,
    }).start();
  }, [showBanner, slideAnim]);

  const isGreen = status === 'online';

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy < 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -20 || gestureState.vy < -0.5) {
          // Dismiss
          setShowBanner(false);
        } else {
          // Spring back
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        }
      }
    })
  ).current;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      pointerEvents={showBanner ? 'auto' : 'none'}
      style={[
        styles.banner,
        {
          height: bannerHeight,
          paddingTop: insets.top,
          transform: [{ translateY: slideAnim }],
          backgroundColor: isGreen ? '#bbf7d0' : '#fecaca',
          borderBottomColor: isGreen ? '#86efac' : '#fca5a5',
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: isGreen ? '#16a34a' : '#dc2626' }]} />
      <Text style={[styles.text, { color: isGreen ? '#166534' : '#991b1b' }]}>
        {isGreen ? 'Back online' : 'Offline Mode'}
      </Text>
      {!isGreen && <Text style={styles.sub}>— No internet connection</Text>}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontFamily: 'LexendBold',
    fontSize: 11,
  },
  sub: {
    color: '#b91c1c',
    fontFamily: 'Lexend',
    fontSize: 11,
  },
});
