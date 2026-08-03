"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const assignmentSchema = new mongoose_1.default.Schema({
    module: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Module',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        required: true,
    },
    startDate: {
        type: Date,
    },
    endDate: {
        type: Date,
    },
    maxScore: {
        type: Number,
        required: true,
    },
    attachments: {
        type: [String],
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
const Assignment = mongoose_1.default.model("Cohort", assignmentSchema);
exports.default = Assignment;
