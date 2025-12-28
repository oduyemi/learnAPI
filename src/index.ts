import express, { Application } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";
import fetchRouter from "./routes/fetch";
import sendRouter from "./routes/send";
import updateRouter from "./routes/update";
import eraseRouter from "./routes/erase";
import db from "./db";

dotenv.config();

const app: Application = express();
const session = require("express-session");

app.use(
  session({
    secret: process.env.SECRET_KEY!,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

const allowedOrigins = [
  "http://localhost:3000",
  "https://learn.progrowing.org",
  "https://www.learn.progrowing.org",
];

app.use(
  cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS not allowed: ${origin}`));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/", fetchRouter);
app.use("/send", sendRouter);
app.use("/update", updateRouter);
app.use("/erase", eraseRouter);

// MongoDB error handling
db.on("error", console.error.bind(console, "MongoDB Connection Error:"));

app.use(
  "/api",
  createProxyMiddleware({
    target: "http://192.168.43.113:3000/",
    changeOrigin: true,
  })
);

app.use(express.static("../src"));
const PORT: number | string = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
