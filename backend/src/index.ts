import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import route from "./routes/index";
import cookieParser from "cookie-parser";
import http from "http";
import { initSocket } from "./socket";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

app.get("/api", (req, res) => {
  res.send("Backend Template Running 🚀");
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.use("/api", route);
 
// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Internal Server Error:", err);
  
  const status = err.status || 500;
  let message = err.message || "Internal Server Error";
  
  // Sanitize technical errors in development/production
  if (message.includes('prisma') || message.includes('\\') || message.includes('/') || message.includes('node_modules')) {
    message = "A database or system error occurred. Please contact the administrator.";
  }
  
  res.status(status).json({
    success: false,
    message,
    // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined // Optional: hide stack even in dev if it's too much
  });
});

const server = http.createServer(app);

initSocket(server);

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});