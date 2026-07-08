import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import path from "path";
import { Server } from "socket.io";
import authRoutes from "./routes/auth.routes";
import quizRoutes from "./routes/quiz.routes";
import questionRoutes from "./routes/question.routes";
import sessionRoutes from "./routes/session.routes";
import { registerQuizSocket } from "./socket/quiz.socket";
import uploadRoutes from "./routes/upload.routes";

dotenv.config();

const publicDir = path.join(__dirname, "..", "public");

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5000"],
    credentials: true,
  })
);

app.use(express.json());

app.use(express.static(publicDir));

app.get("/socket-test.html", (req, res) => {
  res.sendFile(path.join(publicDir, "socket-test.html"));
});

app.get("/", (req, res) => {
  res.json({ message: "Quiz backend is running" });
});

app.use("/auth", authRoutes);
app.use("/quizzes", quizRoutes);
app.use("/uploads", uploadRoutes);
app.use("/", sessionRoutes);
app.use("/", questionRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
  });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5000"],
    methods: ["GET", "POST"],
  },
});

registerQuizSocket(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});