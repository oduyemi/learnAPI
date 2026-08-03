"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const quizSchema = new mongoose_1.default.Schema({
    module: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Module",
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    passingScore: {
        type: Number,
        required: true,
    },
    timeLimit: {
        type: Number,
        required: true,
        default: 30
    },
    attempts: {
        type: Number,
        required: true,
    },
    questions: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Question',
        }],
    submissions: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Submission',
        }],
    isPublished: {
        type: Boolean,
        default: false,
    },
    createdBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, {
    timestamps: true
});
const Quiz = mongoose_1.default.model('Quiz', quizSchema);
exports.default = Quiz;
