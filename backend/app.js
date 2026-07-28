import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRouter from "./routes/auth.js";
import projectRoute from "./routes/projects.js";
import taskRoute from "./routes/tasks.js";
import errorHandler from "./middleware/errorHandler.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

app.use(cors({
  origin : "http://localhost:5173",
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("in chaewon we trust ☝🏽");
});

app.use("/api/auth", authRouter);
app.use("/api/project", projectRoute);
app.use("/api/task", taskRoute);

// Error handler MUST be the last middleware after all routes
app.use(errorHandler);

async function main() {
  const PORT = process.env.PORT || 3000;
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

main();
