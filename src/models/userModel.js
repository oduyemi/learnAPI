"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    username: {
        type: String,
        unique: true,
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
    phone: {
        type: String,
        required: true,
        validate: {
            validator: (phone) => {
                // regular expression
                // Example: +1234567890 or 123-456-7890
                return /^\+?\d{1,3}[- ]?\d{3}[- ]?\d{3}[- ]?\d{4}$/.test(phone);
            },
            message: "Invalid phone number format",
        },
    },
    password: {
        type: String,
        required: true,
        validate: {
            validator: (password) => {
                // Password length should be at least 8
                // It should contain at least 1 capital letter
                // It should contain at least 1 small letter
                // It should contain at least 1 special character
                return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[^\s]).{8,}$/.test(password);
            },
            message: "Password must be at least 8 characters long and contain at least one capital letter, one small letter, one digit, and one special character.",
        },
    },
    dateOfBirth: {
        type: Date,
    },
    img: {
        type: String,
        required: true,
        validate: {
            validator: (img) => {
                // Validate image file extension
                return /\.(png|jpg|jpeg|webp)$/.test(img);
            },
            message: "Image must be in .png, .jpg, .jpeg, or .webp format.",
        },
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
const User = mongoose_1.default.model("User", userSchema);
exports.default = User;
