"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbConnect = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined.");
}
const cached = global.mongooseCache || {
    conn: null,
    promise: null,
};
global.mongooseCache = cached;
const dbConnect = async () => {
    if (cached.conn) {
        return cached.conn;
    }
    if (!cached.promise) {
        cached.promise = mongoose_1.default.connect(MONGODB_URI, {
            bufferCommands: false,
        });
    }
    try {
        cached.conn = await cached.promise;
        console.log("MongoDB connected");
        return cached.conn;
    }
    catch (error) {
        cached.promise = null;
        console.error("MongoDB connection failed:", error);
        throw error;
    }
};
exports.dbConnect = dbConnect;
exports.default = exports.dbConnect;
