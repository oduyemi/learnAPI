"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const questionSchema = new mongoose_1.Schema({
    questionText: {
        type: String,
        required: true,
        trim: true,
    },
    options: {
        type: [
            {
                option: {
                    type: String,
                    required: true,
                    trim: true,
                },
                isCorrect: {
                    type: Boolean,
                    required: true,
                },
            },
        ],
        required: true,
        validate: {
            validator(options) {
                return (options.length === 4 &&
                    options.filter((option) => option.isCorrect).length === 1);
            },
            message: "A question must contain exactly four options and one correct answer.",
        },
    },
    difficultyLevel: {
        type: String,
        enum: ["easy", "medium", "hard"],
        default: "medium",
    },
    course: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
    },
    category: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    explanation: {
        type: String,
        trim: true,
    },
    points: {
        type: Number,
        default: 1,
        min: 1,
    },
}, {
    timestamps: true,
});
const Question = mongoose_1.default.model("Question", questionSchema);
exports.default = Question;
