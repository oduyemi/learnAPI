"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const cohortSchema = new mongoose_1.default.Schema({
    courses: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Course",
            required: true,
        },
    ],
    title: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true,
        unique: true
    },
    startDate: {
        type: Date,
    },
    endDate: {
        type: Date,
    },
    status: {
        type: String,
        enum: ["not_started", "in_progress", "ended", "suspended"],
        default: "not_started",
        required: true,
    },
}, {
    timestamps: true,
});
const Cohort = mongoose_1.default.model("Cohort", cohortSchema);
exports.default = Cohort;
