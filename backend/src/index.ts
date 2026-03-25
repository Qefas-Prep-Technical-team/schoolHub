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

const server = http.createServer(app);

initSocket(server);

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});