import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import dbConnect from "./db/index";
import appRoutes from "./routes/app.route";
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
import cohortRoutes from "./routes/cohort.route";


dotenv.config();

const app: Application = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://learn.progrowing.org",
      "https://www.learn.progrowing.org",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", appRoutes);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/cohort", cohortRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
);

const PORT = Number(process.env.PORT) || 3000;

const startServer = async () => {
  try {
    await dbConnect();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;