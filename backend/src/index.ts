import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "@routes/userRoutes";
import testRoutes from "@routes/testRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend Template Running 🚀");
});
app.use("/users", userRoutes);
// Routes
app.use("/test", testRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
