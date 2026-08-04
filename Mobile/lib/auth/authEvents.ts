/**
 * A simple event bus that allows the API client (which has no React context)
 * to signal the app that a forced logout is required.
 *
 * Usage:
 *   - Emitter: authEvents.emit() from anywhere (e.g. axios interceptor)
 *   - Listener: authEvents.subscribe(callback) from the root layout
 */

type LogoutListener = () => void;

let listeners: LogoutListener[] = [];

export const authEvents = {
  /**
   * Subscribe to forced-logout events. Returns an unsubscribe function.
   */
  subscribe(listener: LogoutListener): () => void {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },

  /**
   * Emit a forced-logout event to all subscribers.
   */
  emit() {
    listeners.forEach((listener) => listener());
  },
};
