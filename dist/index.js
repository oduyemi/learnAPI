"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const http_proxy_middleware_1 = require("http-proxy-middleware");
const fetch_1 = __importDefault(require("./routes/fetch"));
const send_1 = __importDefault(require("./routes/send"));
const update_1 = __importDefault(require("./routes/update"));
const erase_1 = __importDefault(require("./routes/erase"));
const db_1 = __importDefault(require("./db"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const session = require("express-session");
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
}));
const allowedOrigins = [
    "http://localhost:3000",
    "https://learn.progrowing.org",
    "https://www.learn.progrowing.org",
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error(`CORS not allowed: ${origin}`));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
// Routes
app.use("/", fetch_1.default);
app.use("/send", send_1.default);
app.use("/update", update_1.default);
app.use("/erase", erase_1.default);
// MongoDB error handling
db_1.default.on("error", console.error.bind(console, "MongoDB Connection Error:"));
app.use("/api", (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: "http://192.168.43.113:3000/",
    changeOrigin: true,
}));
app.use(express_1.default.static("../src"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
exports.default = app;
