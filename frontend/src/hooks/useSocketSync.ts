"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/context/SocketContext";
import { toast } from "react-toastify";

export const useSocketSync = () => {
  const { socket, isConnected } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Handle new notifications (generic)
    socket.on("notification:new", (notification) => {
      console.log("🔔 New notification received via socket:", notification);
      
      // Auto-invalidate links if the notification is a link request or acceptance
      if (
        notification.type === "LINK_REQUEST" ||
        notification.type === "LINK_ACCEPTED" ||
        notification.type === "LINK_REJECTED"
      ) {
        console.log("♻️ Invalidating links query...");
        queryClient.invalidateQueries({ queryKey: ["links"] });
      }

      // Show toast for the notification
      toast.info(notification.message || notification.title, {
        position: "top-right",
        autoClose: 5000,
      });
    });

    // Handle specific link update event (focused synchronization)
    socket.on("link:updated", (data) => {
      console.log("🔗 Link update event received:", data);
      queryClient.invalidateQueries({ queryKey: ["links"] });
      
      if (data.message) {
        toast.info(data.message, { position: "top-right", autoClose: 3000 });
      }
    });

    return () => {
      socket.off("notification:new");
      socket.off("link:updated");
    };
  }, [socket, isConnected, queryClient]);

  return { isConnected };
};
