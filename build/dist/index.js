"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const app_route_1 = __importDefault(require("./routes/app.route"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const admin_route_1 = __importDefault(require("./routes/admin.route"));
const db_1 = __importDefault(require("./db"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const allowedOrigins = [
    "https://learn.progrowing.org",
    "https://www.learn.progrowing.org",
    "http://localhost:3000",
];
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: false,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
// ---------------- Routes ----------------
app.use("/", app_route_1.default);
app.use("/auth", auth_route_1.default);
app.use("/admin", admin_route_1.default);
// app.use("/send", sendRouter);
// app.use("/update", updateRouter);
// app.use("/erase", eraseRouter);
db_1.default.on("error", console.error.bind(console, "MongoDB Connection Error:"));
app.use(express_1.default.static("../src"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
exports.default = app;
