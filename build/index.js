"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const index_1 = __importDefault(require("./db/index"));
const app_route_1 = __importDefault(require("./routes/app.route"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const cohort_route_1 = __importDefault(require("./routes/cohort.route"));
const course_route_1 = __importDefault(require("./routes/course.route"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:3000",
        "https://learn.progrowing.org",
        "https://www.learn.progrowing.org",
    ],
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/", app_route_1.default);
app.use("/auth", auth_route_1.default);
app.use("/users", user_route_1.default);
app.use("/cohort", cohort_route_1.default);
app.use("/course", course_route_1.default);
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found.",
    });
});
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({
        success: false,
        message: "Internal server error.",
    });
});
const PORT = Number(process.env.PORT) || 3000;
const startServer = async () => {
    try {
        await (0, index_1.default)();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error("Unable to start server:", error);
        process.exit(1);
    }
};
startServer();
exports.default = app;
