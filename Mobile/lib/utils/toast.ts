import Toast from 'react-native-toast-message';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  title: string;
  message?: string;
  /** Override default display duration in ms (default: 4000) */
  duration?: number;
}

// ─── Generic Show ─────────────────────────────────────────────────────────

export const showToast = (type: ToastType, options: ToastOptions) => {
  Toast.show({
    type,
    text1: options.title,
    text2: options.message,
    visibilityTime: options.duration ?? 4000,
    position: 'top',
  });
};

// ─── Typed Helpers ────────────────────────────────────────────────────────

export const showSuccessToast = (options: ToastOptions) => showToast('success', options);

export const showErrorToast = (options: ToastOptions) => showToast('error', options);

export const showWarningToast = (options: ToastOptions) => showToast('warning', options);

export const showInfoToast = (options: ToastOptions) => showToast('info', options);
