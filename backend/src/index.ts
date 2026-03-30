import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import route from "./routes/index";
import cookieParser from "cookie-parser";
import http from "http";
import { initSocket } from "./socket";

dotenv.config();

const app = express();

// Render uses dynamic ports; fallback to 5000 for local development in Lagos
const PORT = process.env.PORT || 5000;

// 1. DYNAMIC CORS SETUP
// Add your Vercel and custom domains here so the backend doesn't block them
const allowedOrigins = [
  "http://localhost:3000",
  "https://schoolhub-frontend.vercel.app", // Replace with your actual Vercel URL
  "https://flexitistudio.com",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman, or curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS policy blocked this origin"), false);
      }
    },
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());

// Basic entry point
app.get("/api", (req, res) => {
  res.send("SchoolHub Backend Running 🚀");
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

// Initialize Socket.io
initSocket(server);

// 4. PRODUCTION-READY LISTENER
// '0.0.0.0' is the secret sauce for Render/Cloud deployments
server.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`🚀 Server is live!`);
  console.log(`📡 Internal Port: ${PORT}`);
  console.log(`🌐 Interface: 0.0.0.0 (Publicly Accessible)`);
});
