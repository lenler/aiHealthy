import 'dotenv/config';
import express from "express";
import fs from 'fs';
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import { fileURLToPath } from "url";
import jwtAuth from "./middleware/jwtAuth.js";
import rateLimiter from "./middleware/rateLimiter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logsDir = path.join(__dirname, 'logs');
fs.mkdirSync(logsDir, { recursive: true });
const accessLogStream = fs.createWriteStream(path.join(logsDir, 'access.log'), { flags: 'a' });

const app = express();
app.use(cors({
  origin: ['http://localhost:55174', 'http://localhost:5173'],
  credentials: true,
}));
app.use(rateLimiter);
app.use(logger("dev"));
app.use(logger('combined', { stream: accessLogStream }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
import loginRouter from "./routes/login.js";
import chatRouter from "./routes/chat.js";
import dashboardRouter from "./routes/dashboard.js";
import analysisRouter from "./routes/analysis.js";
import personRouter from "./routes/person.js";
import signUpRouter from "./routes/signup.js";
app.use("/api/login", loginRouter);
app.use("/api/sign_up", signUpRouter);
app.use("/api/chat", jwtAuth, chatRouter);
app.use("/api/dashboard", jwtAuth, dashboardRouter);
app.use("/api/analysis", jwtAuth, analysisRouter);
app.use("/api/person", jwtAuth, personRouter);
export default app;
