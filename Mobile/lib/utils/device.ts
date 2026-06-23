import * as SecureStore from 'expo-secure-store';

const DEVICE_ID_KEY = 'FLEXITI_DEVICE_ID';

export const getDeviceId = async (): Promise<string> => {
  try {
    let deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
    
    if (!deviceId) {
      // Generate a random UUID-like string
      deviceId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
      
      await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
    }
    
    return deviceId;
  } catch (error) {
    console.error('Error getting or setting device ID:', error);
    // Fallback if SecureStore fails
    return `fallback-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }
};
