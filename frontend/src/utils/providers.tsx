"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SocketProvider } from "@/context/SocketContext";
import { useSocketSync } from "@/hooks/useSocketSync";

function SocketSyncWrapper({ children }: { children: React.ReactNode }) {
  useSocketSync();
  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  // Use explicit React.useState to ensure hook dispatcher matches
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
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
