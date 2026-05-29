import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

// routes
import authRoutes from "./modules/auth/auth.routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// API ROUTES
app.use("/api/auth", authRoutes);

app.get("/health", (_, res) => {
  res.json({
    status: "OK",
    message: "Server is up and running",
  });
});

app.use(errorHandler);

export default app;
