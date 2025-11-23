import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import route from "./routes/index";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

app.use(cookieParser());
app.use(express.json()); // if you're using express.json() too

app.get("/api", (req, res) => {
  res.send("Backend Template Running 🚀");
});

app.use("/api", route);
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
