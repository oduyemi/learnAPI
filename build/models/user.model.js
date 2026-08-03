"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    fname: {
        type: String,
        required: true,
    },
    lname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        validate: {
            validator: (email) => {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            },
            message: "Invalid email format",
        },
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: (phone) => {
                // regular expression
                // Example: +1234567890 or 123-456-7890
                return /^\+?\d{1,3}[- ]?\d{3}[- ]?\d{3}[- ]?\d{4}$/.test(phone);
            },
            message: "Invalid phone number format",
        },
    },
    role: {
        type: String,
        enum: ["student", "instructor", "mentor", "admin"],
        required: true,
    },
    img: {
        type: String,
        validate: {
            validator: (img) => {
                // Validate image file extension
                return /\.(png|jpg|jpeg|webp)$/.test(img);
            },
            message: "Image must be in .png, .jpg, .jpeg, or .webp format.",
        },
    },
    cohort: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Cohort",
    },
    status: {
        type: String,
        enum: ["active", "suspended", "graduated"],
        default: "active",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    resetPasswordToken: {
        type: String,
        default: null,
        select: false,
    },
    resetPasswordExpires: {
        type: Date,
        default: null,
        select: false,
    },
});
const User = mongoose_1.default.model("User", userSchema);
exports.default = User;
