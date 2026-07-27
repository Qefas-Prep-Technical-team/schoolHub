import { useState, useEffect } from "react";
import { NetworkMonitor } from "../services/NetworkMonitor";

export const useNetworkStatus = (): boolean => {
  const [isOnline, setIsOnline] = useState<boolean>(NetworkMonitor.getInstance().isOnline);

  useEffect(() => {
    const unlisten = NetworkMonitor.getInstance().addListener((status) => {
      setIsOnline(status);
    });
    return unlisten;
  }, []);

  return isOnline;
};
