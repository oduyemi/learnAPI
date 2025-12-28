"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const questionSchema = new mongoose_1.default.Schema({
    questionText: {
        type: String,
        required: true,
    },
    options: {
        type: [{
                option: String,
                isCorrect: Boolean
            }],
        required: true,
        validate: {
            validator: function (options) {
                return options.length === 4;
            },
            message: "Exactly four options are required"
        }
    },
    difficultyLevel: {
        type: String,
        enum: ["easy", "medium", "hard"],
        required: true,
    },
    category: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Categories',
        required: true,
    },
});
const Question = mongoose_1.default.model("Question", questionSchema);
exports.default = Question;
