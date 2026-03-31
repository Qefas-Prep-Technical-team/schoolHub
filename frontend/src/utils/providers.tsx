"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ToastContainer } from "react-toastify";
import { SocketProvider } from "@/context/SocketContext";
import { useSocketSync } from "@/hooks/useSocketSync";

function SocketSyncWrapper({ children }: { children: React.ReactNode }) {
  useSocketSync();
  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 0, // Ensure invalidations are always respected for real-time feel
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        <SocketSyncWrapper>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            style={{
              fontSize: '14px',
              zIndex: 9999,
            }}
          />
          {children}
        </SocketSyncWrapper>
      </SocketProvider>
    </QueryClientProvider>
  );
}