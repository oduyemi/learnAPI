"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUsersByRole = exports.validatePassword = exports.validateRequestBody = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
// Validate request body
const validateRequestBody = (requiredFields) => {
    return (req, res, next) => {
        const missingFields = requiredFields.filter(field => !req.body[field]);
        if (missingFields.length > 0) {
            res.status(400).json({ error: `Missing required fields: ${missingFields.join(", ")}` });
            return;
        }
        next();
    };
};
exports.validateRequestBody = validateRequestBody;
// Password validation regex
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const validatePassword = (req, res, next) => {
    const { password } = req.body;
    if (!password || !passwordRegex.test(password)) {
        res.status(400).json({
            message: "Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character."
        });
        return;
    }
    next();
};
exports.validatePassword = validatePassword;
const validateUsersByRole = async (ids, role) => {
    const uniqueIds = [...new Set(ids)];
    const users = await user_model_1.default.find({
        _id: { $in: uniqueIds },
        role,
    });
    return users.length === uniqueIds.length ? users : null;
};
exports.validateUsersByRole = validateUsersByRole;
