"use client"
import { useEffect, useRef, useState, useCallback } from "react"
import { io, Socket } from "socket.io-client"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "react-toastify"

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000"

export interface NewTicketNotification {
  id: string
  subject: string
  userName: string
  userEmail: string
  schoolName?: string
  priority: string
  userType: string
  createdAt: string
}

/**
 * Hook for platform staff to receive real-time new-ticket notifications.
 * Joins the `platform:support` socket room and emits a toast + badge.
 */
export const usePlatformSupportNotifications = () => {
  const socketRef = useRef<Socket | null>(null)
  const queryClient = useQueryClient()
  const [unreadCount, setUnreadCount] = useState(0)
  const [lastTicket, setLastTicket] = useState<NewTicketNotification | null>(null)

  const clearUnread = useCallback(() => setUnreadCount(0), [])

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, { withCredentials: true })

    socketRef.current.on("connect", () => {
      // Join dedicated platform support room
      socketRef.current?.emit("join:room", "platform:support")
    })

    socketRef.current.on("new_ticket", (ticket: NewTicketNotification) => {
      setUnreadCount((c) => c + 1)
      setLastTicket(ticket)

      // Invalidate the tickets list so the inbox auto-updates
      queryClient.invalidateQueries({ queryKey: ["platform-tickets"] })

      const fromLabel = ticket.schoolName
        ? `${ticket.userName} (${ticket.schoolName})`
        : ticket.userName

      toast.info(`🎫 New ${ticket.priority} ticket from ${fromLabel}: "${ticket.subject}"`, {
        autoClose: 8000,
        position: "top-right",
      })
    })

    return () => {
      socketRef.current?.emit("leave:room", "platform:support")
      socketRef.current?.disconnect()
    }
  }, [queryClient])

  return { unreadCount, lastTicket, clearUnread }
}
