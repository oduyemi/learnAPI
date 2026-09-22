"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.authenticate = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const auth_1 = require("../utils/auth");
const db_1 = __importDefault(require("../db"));
/**
 * UNIVERSAL AUTHENTICATION
 *
 * Authenticates every type of user:
 * - admin
 * - instructor
 * - mentor
 * - student
 *
 * The user's role is available through:
 *
 * req.user.role
 */
const authenticate = async (req, res, next) => {
    try {
        await (0, db_1.default)();
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
            return;
        }
        const token = authHeader.substring(7).trim();
        if (!token) {
            res.status(401).json({
                success: false,
                message: "Authentication token is missing.",
            });
            return;
        }
        const decoded = (0, auth_1.verifyToken)(token);
        if (!decoded?.id) {
            res.status(401).json({
                success: false,
                message: "Invalid authentication token.",
            });
            return;
        }
        const user = await user_model_1.default.findById(decoded.id).select("-password");
        if (!user) {
            res.status(401).json({
                success: false,
                message: "User account no longer exists.",
            });
            return;
        }
        if (user.status === "suspended") {
            res.status(403).json({
                success: false,
                message: "Your account has been suspended.",
            });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.error("Authentication Error:", error);
        res.status(401).json({
            success: false,
            message: "Invalid or expired token.",
        });
    }
};
exports.authenticate = authenticate;
/**
 * ROLE AUTHORIZATION
 *
 * Example:
 *
 * requireRole("admin")
 *
 * or:
 *
 * requireRole("admin", "instructor")
 *
 * Authentication must happen before this middleware.
 */
const requireRole = (...roles) => (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: "Authentication required.",
        });
        return;
    }
    if (!roles.includes(req.user.role)) {
        res.status(403).json({
            success: false,
            message: "You do not have permission to perform this action.",
        });
        return;
    }
    next();
};
exports.requireRole = requireRole;
