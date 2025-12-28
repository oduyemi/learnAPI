import express, { Application } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import appRoutes from "./routes/app.route";
import authRoutes from "./routes/auth.route";
import adminRoutes from "./routes/admin.route";

import db from "./db";

dotenv.config();

const app: Application = express();

const allowedOrigins = [
  "https://learn.progrowing.org",
  "https://www.learn.progrowing.org",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: false, 
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ---------------- Routes ----------------
app.use("/", appRoutes);
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
// app.use("/send", sendRouter);
// app.use("/update", updateRouter);
// app.use("/erase", eraseRouter);

db.on("error", console.error.bind(console, "MongoDB Connection Error:"));

app.use(express.static("../src"));

const PORT: number | string = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
