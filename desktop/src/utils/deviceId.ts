import { v4 as uuidv4 } from "uuid";

const DEVICE_ID_KEY = "qefas_device_id";

/**
 * Gets or creates a persistent device ID for this desktop installation.
 * This ID remains the same across app restarts and is used for device verification.
 */
export const getOrCreateDeviceId = (): string => {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);

  if (!deviceId) {
    deviceId = `desktop_${uuidv4()}`;
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }

  return deviceId;
};

/**
 * Gets the stored device ID without creating one if it doesn't exist
 */
export const getDeviceId = (): string | null => {
  return localStorage.getItem(DEVICE_ID_KEY);
};

/**
 * Clears the stored device ID (useful for testing or device reset)
 */
export const clearDeviceId = (): void => {
  localStorage.removeItem(DEVICE_ID_KEY);
};
