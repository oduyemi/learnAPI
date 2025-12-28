"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const courseSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true,
    },
    desc: {
        type: String,
        required: true,
    },
    instructor: {
        type: String,
        required: true,
    },
    duration: {
        type: String,
        required: true,
    },
    level: {
        type: String,
        enum: ["beginner", "intermediate"],
        required: true,
    },
    category: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Category",
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
const Course = mongoose_1.default.model("Course", courseSchema);
exports.default = Course;
