"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { usePlatformStaffStore } from "@/store/usePlatformStaffStore";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const { staff, isAuthenticated: isPlatformAuthenticated } = usePlatformStaffStore();

  const anyAuthenticated = isAuthenticated || isPlatformAuthenticated;
  const currentUserId = user?.id || staff?.id;

  useEffect(() => {
    if (!anyAuthenticated || !currentUserId) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Initialize socket connection
    // Extract base URL from NEXT_PUBLIC_API_URL (e.g., http://localhost:5000/api -> http://localhost:5000)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const socketUrl = apiUrl.replace("/api", "");

    const newSocket = io(socketUrl, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true,
      transports: ["websocket", "polling"], // Try websocket first
    });

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
      setIsConnected(true);
      
      // Join user-specific room
      newSocket.emit("join:user", currentUserId);
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("⚠️ Socket connection error:", error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [anyAuthenticated, currentUserId, isPlatformAuthenticated]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
