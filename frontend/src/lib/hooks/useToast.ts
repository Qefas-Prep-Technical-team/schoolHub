/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { toast, ToastOptions, Id } from 'react-toastify';
import { 
  defaultToastOptions, 
  authToastOptions, 
  errorToastOptions, 
  successToastOptions, 
  loadingToastOptions 
} from '@/lib/config/toast-config';

export const useToast = () => {
  // Default toast
  const showToast = (message: string, options?: ToastOptions) => {
    return toast(message, { ...defaultToastOptions, ...options });
  };

  // Auth-specific toasts
  const auth = {
    success: (message: string = 'Operation completed successfully!') => {
      return toast.success(message, authToastOptions);
    },
    error: (message: string = 'Authentication failed') => {
      return toast.error(message, { ...authToastOptions, ...errorToastOptions });
    },
    loading: (message: string = 'Processing...'): Id => {
      return toast.loading(message, { ...authToastOptions, ...loadingToastOptions });
    },
    dismiss: (toastId: Id) => {
      toast.dismiss(toastId);
    },
    // Registration specific
    registrationSuccess: (userType: string) => {
      return toast.success(`${userType} account created successfully!`, authToastOptions);
    },
    loginSuccess: (userName?: string) => {
      const message = userName ? `Welcome back, ${userName}!` : 'Welcome back!';
      return toast.success(message, authToastOptions);
    },
    logoutSuccess: () => {
      return toast.success('Logged out successfully', authToastOptions);
    },
  };

  // Error toasts
  const error = {
    show: (message: string = 'Something went wrong') => {
      return toast.error(message, errorToastOptions);
    },
    validation: (message: string = 'Please check your input') => {
      return toast.error(message, errorToastOptions);
    },
    network: (message: string = 'Network error. Please check your connection') => {
      return toast.error(message, errorToastOptions);
    },
    server: (message: string = 'Server error. Please try again later') => {
      return toast.error(message, errorToastOptions);
    },
    unauthorized: () => {
      return toast.error('Please log in to continue', errorToastOptions);
    },
    forbidden: () => {
      return toast.error('You do not have permission for this action', errorToastOptions);
    },
  };

  // Success toasts
  const success = {
    show: (message: string = 'Operation completed successfully!') => {
      return toast.success(message, successToastOptions);
    },
    created: (item: string = 'Item') => {
      return toast.success(`${item} created successfully!`, successToastOptions);
    },
    updated: (item: string = 'Item') => {
      return toast.success(`${item} updated successfully!`, successToastOptions);
    },
    deleted: (item: string = 'Item') => {
      return toast.success(`${item} deleted successfully!`, successToastOptions);
    },
    saved: () => {
      return toast.success('Changes saved successfully!', successToastOptions);
    },
  };

  // Loading toasts with update capability
  const loading = {
    show: (message: string = 'Loading...'): Id => {
      return toast.loading(message, loadingToastOptions);
    },
    update: (toastId: Id, message: string, type: 'success' | 'error' | 'info' = 'success') => {
      toast.update(toastId, {
        render: message,
        type,
        isLoading: false,
        autoClose: type === 'error' ? 6000 : 3000,
        closeOnClick: true,
        draggable: true,
      });
    },
    dismiss: (toastId: Id) => {
      toast.dismiss(toastId);
    },
  };

  // Info and warning toasts
  const info = (message: string, options?: ToastOptions) => {
    return toast.info(message, { ...defaultToastOptions, ...options });
  };

  const warning = (message: string, options?: ToastOptions) => {
    return toast.warning(message, { ...defaultToastOptions, ...options });
  };

  // Promise toasts for async operations
  const promise = {
    auth: (promise: Promise<any>, messages: { pending: string; success: string; error: string }) => {
      return toast.promise(promise, messages, authToastOptions);
    },
    default: (promise: Promise<any>, messages: { pending: string; success: string; error: string }) => {
      return toast.promise(promise, messages, defaultToastOptions);
    },
  };

  return {
    // General methods
    show: showToast,
    info,
    warning,
    // success: success.show,
    // error: error.show,
    // loading: loading.show,
    
    // Namespaced methods
    auth,
    error: error,
    success: success,
    loading: loading,
    promise,
    
    // Utility methods
    dismiss: toast.dismiss,
    dismissAll: toast.dismiss,
    isActive: toast.isActive,
  };
};

// Export individual hooks for specific use cases
export const useAuthToast = () => {
  const { auth } = useToast();
  return auth;
};

export const useErrorToast = () => {
  const { error } = useToast();
  return error;
};

export const useSuccessToast = () => {
  const { success } = useToast();
  return success;
};