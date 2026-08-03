"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const enrollmentSchema = new mongoose_1.default.Schema({
    students: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    ],
    cohort: {
        type: String,
        ref: "Cohort",
        required: true
    },
}, {
    timestamps: true,
});
const Enrollment = mongoose_1.default.model("Cohort", enrollmentSchema);
exports.default = Enrollment;
