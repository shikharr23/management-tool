import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRouter from "./routes/auth.js";
import projectRoute from "./routes/projects.js";
import taskRoute from "./routes/tasks.js";

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.send("in chaewon we trust ☝🏽");
});

app.use("/api/auth", authRouter);
app.use("/api/project", projectRoute);
app.use("/api/task", taskRoute);

async function main() {
  const PORT = process.env.PORT || 3000;
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

main();
