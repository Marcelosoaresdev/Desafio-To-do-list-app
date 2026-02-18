import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import tasksRoutes from "./routes/tasks.routes.js";
import { authenticate } from "./middlewares/auth.middleware.js";

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

app.use("/auth",  authRoutes);
app.use("/tasks", authenticate, tasksRoutes);


export default app;
