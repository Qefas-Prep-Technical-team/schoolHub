import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";

const getRawSocketUrl = () => {
  const url = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") || "http://localhost:5000";
  // Avoid malformed "https" or "http" strings
  if (url === "https" || url === "http") return "http://localhost:5000";
  return url;
};

const SOCKET_URL = getRawSocketUrl();

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

export const useSupportSocket = (
  ticketId?: string,
  onNewMessage?: (message: any) => void,
  options?: { isPlatform?: boolean; userId?: string }
) => {
  const queryClient = useQueryClient();
  const prevTicketIdRef = useRef<string | undefined>(undefined);
  const onNewMessageRef = useRef(onNewMessage);

  useEffect(() => {
    onNewMessageRef.current = onNewMessage;
  }, [onNewMessage]);

  useEffect(() => {
    const socket = getSocket();

    const joinTicket = (id: string) => {
      socket.emit("join:ticket", id);
    };

    const leaveTicket = (id: string) => {
      socket.emit("leave:ticket", id);
    };

    // If platform staff, join platform:support room to receive all incoming alerts
    if (options?.isPlatform) {
      socket.emit("join:room", "platform:support");
    }

    // If userId provided, join user room to receive targeted support replies and alerts
    if (options?.userId) {
      socket.emit("join:user", options.userId);
    }

    // Leave previous room if ticket changed
    if (prevTicketIdRef.current && prevTicketIdRef.current !== ticketId) {
      leaveTicket(prevTicketIdRef.current);
    }
    prevTicketIdRef.current = ticketId;

    if (ticketId && socket.connected) {
      joinTicket(ticketId);
    }

    const handleConnect = () => {
      if (options?.isPlatform) {
        socket.emit("join:room", "platform:support");
      }
      if (options?.userId) {
        socket.emit("join:user", options.userId);
      }
      if (ticketId) {
        joinTicket(ticketId);
      }
    };

    // Message deduplication cache so multiple room emissions (ticket room + user room) do not fire duplicates
    const processedMessageIds = new Set<string>();

    const handleNewMessage = (rawMsg: any) => {
      const msg = rawMsg?.message || rawMsg;
      const msgId =
        msg?.id ||
        (msg?.ticketId && msg?.content
          ? `${msg.ticketId}-${msg.content.slice(0, 30)}-${msg.createdAt || ""}`
          : null);

      if (msgId) {
        if (processedMessageIds.has(msgId)) {
          return; // Ignore duplicate socket event
        }
        processedMessageIds.add(msgId);
        // Keep bounded size
        if (processedMessageIds.size > 200) {
          const first = processedMessageIds.values().next().value;
          if (first) processedMessageIds.delete(first);
        }
      }

      if (ticketId) {
        queryClient.invalidateQueries({ queryKey: ["ticket-messages", ticketId] });
      }
      if (rawMsg?.ticketId) {
        queryClient.invalidateQueries({ queryKey: ["ticket-messages", rawMsg.ticketId] });
      }
      queryClient.invalidateQueries({ queryKey: ["my-support-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["platform-tickets"] });
      if (onNewMessageRef.current) {
        onNewMessageRef.current(rawMsg);
      }
    };

    const handleTicketUpdated = (ticket?: any) => {
      if (ticketId) {
        queryClient.invalidateQueries({ queryKey: ["ticket-messages", ticketId] });
      }
      if (ticket?.id) {
        queryClient.invalidateQueries({ queryKey: ["ticket-messages", ticket.id] });
      }
      queryClient.invalidateQueries({ queryKey: ["my-support-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["platform-tickets"] });
    };

    const handleNewTicket = (ticket: any) => {
      queryClient.invalidateQueries({ queryKey: ["platform-tickets"] });
      if (onNewMessageRef.current) {
        onNewMessageRef.current({
          senderRole: "USER",
          content: `New inquiry submitted: ${ticket?.subject || "New Ticket"}`,
        });
      }
    };

    const handleSupportNotification = (notif: any) => {
      queryClient.invalidateQueries({ queryKey: ["my-support-tickets"] });
      if (notif?.ticketId) {
        queryClient.invalidateQueries({ queryKey: ["ticket-messages", notif.ticketId] });
      }
      // Note: Do NOT call onNewMessage here to prevent duplicate toasts for chat messages.
    };

    socket.on("connect", handleConnect);
    socket.on("new_message", handleNewMessage);
    socket.on("ticket_message_received", handleNewMessage);
    socket.on("ticket_updated", handleTicketUpdated);
    socket.on("new_ticket", handleNewTicket);
    socket.on("support_notification", handleSupportNotification);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("new_message", handleNewMessage);
      socket.off("ticket_message_received", handleNewMessage);
      socket.off("ticket_updated", handleTicketUpdated);
      socket.off("new_ticket", handleNewTicket);
      socket.off("support_notification", handleSupportNotification);
      if (ticketId) {
        leaveTicket(ticketId);
      }
      if (options?.isPlatform) {
        socket.emit("leave:room", "platform:support");
      }
    };
  }, [ticketId, options?.isPlatform, options?.userId, queryClient]);
};
