import express, { Application, Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";
import { authRoutes, userRoutes } from "./routes";
import { createHttpError } from "./models";

const app: Application = express();

// Load environment variables
dotenv.config({ path: ".env" });

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);

// 404 Error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  const error = createHttpError(404, "Not Found");
  next(error);
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  const status = err.status || 500;
  const message = err.message || "Something went wrong";
  res.status(status).json({ message });
});

export default app;
