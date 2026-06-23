export const getDeviceId = (): string => {
  if (typeof window === "undefined") return "server-side";
  
  const key = "flexiti_device_id";
  let deviceId = localStorage.getItem(key);
  
  if (!deviceId) {
    // Generate a random UUID
    deviceId = crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    localStorage.setItem(key, deviceId);
  }
  
  return deviceId;
};
