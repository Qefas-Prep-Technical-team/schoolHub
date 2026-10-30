import dotenv from "dotenv";
dotenv.config();

// Support BigInt serialization in JSON responses globally
(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

import express from "express";
import cors from "cors";
import helmet from "helmet";
import route from "./routes/index";
import cookieParser from "cookie-parser";
import http from "http";
import { initSocket } from "./socket";

const app = express();

// Render uses dynamic ports; fallback to 5000 for local development in Lagos
const PORT = process.env.PORT || 5000;

app.use(helmet());


app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      const allowedPattern = /^(https?:\/\/)?(([a-zA-Z0-9-]+\.)*localhost(:\d+)?|([a-zA-Z0-9-]+\.)*lvh\.me(:\d+)?|192\.168\.\d+\.\d+(:\d+)?|10\.0\.2\.2(:\d+)?|127\.0\.0\.1(:\d+)?|([a-zA-Z0-9-]+\.)*qefashub\.com|([a-zA-Z0-9-]+\.)*qefas\.com|([a-zA-Z0-9-]+\.)*flexitistudio\.com)$/i;

      if (allowedPattern.test(origin)) {
        callback(null, true);
      } else {
        console.warn(`[CORS BLOCKED] Origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Basic entry point
app.get("/api", (req, res) => {
  res.send("Qefas Hub Backend Running 🚀");
});

// 2. HEALTH CHECK ROUTE
// Render uses this to see if your app is "Alive" before routing traffic
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.use("/api", route);

// 3. GLOBAL ERROR HANDLER
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("Internal Server Error:", err);

    const status = err.status || 500;
    let message = err.message || "Internal Server Error";

    // Sanitize technical errors to prevent leaking database paths/details
    if (
      message.includes("prisma") ||
      message.includes("\\") ||
      message.includes("/") ||
      message.includes("node_modules")
    ) {
      message =
        "A database or system error occurred. Please contact the administrator.";
    }

    res.status(status).json({
      success: false,
      message,
    });
  },
);

const server = http.createServer(app);

import { startCronJobs } from "./scripts/cron";
import prisma from "./config/database";

// Initialize Socket.io
initSocket(server);

// 4. PRODUCTION-READY LISTENER
// Explicitly connect Prisma before accepting traffic so the first request
// never hits a cold/dead connection pool. If initial connect fails, log the full
// error and exit with code 1 so the orchestrator can restart cleanly.
async function bootstrap() {
  try {
    console.log("[DB] Connecting to database on startup...");
    await prisma.$connect();
    console.log("[DB] ✅ Database connected successfully.");
  } catch (err: unknown) {
    console.error("[DB] ❌ FATAL: Failed to connect to database on startup:", {
      name: (err as Error)?.name,
      message: (err as Error)?.message,
      code: (err as Record<string, unknown>)?.code,
      meta: (err as Record<string, unknown>)?.meta,
      stack: (err as Error)?.stack,
    });
    process.exit(1);
  }

  // Start Background Cron Jobs (includes keep-alive ping)
  startCronJobs();

  // '0.0.0.0' is the secret sauce for Render/Cloud deployments
  server.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`🚀 Server is live!`);
    console.log(`📡 Internal Port: ${PORT}`);
    console.log(`🌐 Interface: 0.0.0.0 (Publicly Accessible)`);
  });
}

// Graceful shutdown handling for container terminations (Render SIGTERM/SIGINT)
let isShuttingDown = false;
async function gracefulShutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`[SHUTDOWN] Received ${signal}. Starting graceful shutdown...`);

  server.close(async () => {
    console.log("[SHUTDOWN] HTTP server closed. Disconnecting database...");
    try {
      await prisma.$disconnect();
      console.log("[SHUTDOWN] ✅ Database disconnected cleanly.");
      process.exit(0);
    } catch (err) {
      console.error("[SHUTDOWN] Error during Prisma disconnect:", err);
      process.exit(1);
    }
  });

  // Force exit if shutdown hangs beyond 10s
  setTimeout(() => {
    console.error("[SHUTDOWN] Forced shutdown after timeout.");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

bootstrap();

