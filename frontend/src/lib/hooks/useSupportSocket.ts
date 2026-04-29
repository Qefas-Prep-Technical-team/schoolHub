import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

// Singleton socket so we don't recreate it on every render/ticketId change
let sharedSocket: Socket | null = null;

const getSocket = (): Socket => {
  if (!sharedSocket || !sharedSocket.connected) {
    sharedSocket = io(SOCKET_URL, {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });
  }
  return sharedSocket;
};

export const useSupportSocket = (ticketId?: string) => {
  const queryClient = useQueryClient();
  const prevTicketIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const socket = getSocket();

    const joinTicket = (id: string) => {
      socket.emit("join:ticket", id);
    };

    const leaveTicket = (id: string) => {
      socket.emit("leave:ticket", id);
    };

    // Leave previous room if ticket changed
    if (prevTicketIdRef.current && prevTicketIdRef.current !== ticketId) {
      leaveTicket(prevTicketIdRef.current);
    }
    prevTicketIdRef.current = ticketId;

    if (!ticketId) return;

    // Join immediately if already connected, otherwise wait for connect event
    if (socket.connected) {
      joinTicket(ticketId);
    }

    const handleConnect = () => {
      if (ticketId) joinTicket(ticketId);
    };

    const handleNewMessage = () => {
      queryClient.invalidateQueries({ queryKey: ["ticket-messages", ticketId] });
      queryClient.invalidateQueries({ queryKey: ["my-support-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["platform-tickets"] });
    };

    const handleTicketUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ["ticket-messages", ticketId] });
      queryClient.invalidateQueries({ queryKey: ["my-support-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["platform-tickets"] });
    };

    socket.on("connect", handleConnect);
    socket.on("new_message", handleNewMessage);
    socket.on("ticket_updated", handleTicketUpdated);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("new_message", handleNewMessage);
      socket.off("ticket_updated", handleTicketUpdated);
      // Leave the room but keep the socket alive for reuse
      leaveTicket(ticketId);
    };
  }, [ticketId, queryClient]);
};
