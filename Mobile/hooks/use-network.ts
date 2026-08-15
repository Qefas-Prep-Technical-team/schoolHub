import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

/**
 * Returns live network connectivity state.
 * `isConnected` is true when the device has an active internet connection.
 * Starts as `null` while the initial state is being determined, then resolves to true/false.
 */
export function useNetwork() {
  // Start as true so we don't flash "offline" before NetInfo has loaded
  const [isConnected, setIsConnected] = useState<boolean | null>(true);

  useEffect(() => {
    // Fetch the current state immediately on mount
    NetInfo.fetch().then((state: NetInfoState) => {
      // Use isConnected as primary detector, fallback to true if state is null/undefined
      const online = state.isConnected !== null ? state.isConnected : true;
      setIsConnected(online);
    });

    // Subscribe to changes
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const online = state.isConnected !== null ? state.isConnected : true;
      setIsConnected(online);
    });

    return unsubscribe;
  }, []);

  return { isConnected };
}
