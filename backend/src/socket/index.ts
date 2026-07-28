import { Server } from "socket.io";
import http from "http";

let io: Server;

export const initSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://qefashub.flexitistudio.com",
        "https://www.qefashub.flexitistudio.com",
        "https://schoolhub.flexitistudio.com",
        "https://www.schoolhub.flexitistudio.com",
        "https://qefashub.com",
        "https://www.qefashub.com",
        "https://tracker.qefashub.com"
      ],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join:user", (userId: string) => {
      socket.join(`user:${userId}`);
      console.log(`Socket ${socket.id} joined room user:${userId}`);
    });

    socket.on("join:ticket", (ticketId: string) => {
      socket.join(`ticket:${ticketId}`);
      console.log(`Socket ${socket.id} joined room ticket:${ticketId}`);
    });

    socket.on("leave:ticket", (ticketId: string) => {
      socket.leave(`ticket:${ticketId}`);
      console.log(`Socket ${socket.id} left room ticket:${ticketId}`);
    });

    // Generic room join/leave for platform rooms (e.g. platform:support)
    socket.on("join:room", (room: string) => {
      socket.join(room);
      console.log(`Socket ${socket.id} joined room ${room}`);
    });

    socket.on("leave:room", (room: string) => {
      socket.leave(room);
      console.log(`Socket ${socket.id} left room ${room}`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};