import { ToastOptions, Bounce } from 'react-toastify';

export const defaultToastOptions: ToastOptions = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "light",
  transition: Bounce,
};

export const authToastOptions: ToastOptions = {
  ...defaultToastOptions,
  autoClose: 4000,
};

export const errorToastOptions: ToastOptions = {
  ...defaultToastOptions,
  autoClose: 6000,
  type: "error" as const,
};

export const successToastOptions: ToastOptions = {
  ...defaultToastOptions,
  autoClose: 3000,
  type: "success" as const,
};

export const loadingToastOptions: ToastOptions = {
  ...defaultToastOptions,
  autoClose: false,
  closeOnClick: false,
  draggable: false,
};