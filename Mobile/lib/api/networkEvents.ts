/**
 * A simple event bus for network connectivity events.
 * Allows the API client to signal the UI when the backend is unreachable,
 * even if the device's Wi-Fi is still connected.
 */

type Listener = () => void;

let offlineListeners: Listener[] = [];

export const networkEvents = {
  subscribeOffline(listener: Listener): () => void {
    offlineListeners.push(listener);
    return () => {
      offlineListeners = offlineListeners.filter((l) => l !== listener);
    };
  },

  emitOffline() {
    offlineListeners.forEach((listener) => listener());
  },
};
