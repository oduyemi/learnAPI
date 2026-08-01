import mongoose, { Schema, Document } from "mongoose";

export interface IQuestion extends Document {
  _id: mongoose.Types.ObjectId;
  questionText: string;
  options: {
    option: string;
    isCorrect: boolean;
  }[];
  difficultyLevel: "easy" | "medium" | "hard";
  course: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  explanation: string;
  points: number;
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>(
  {
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
        validator(options: { option: string; isCorrect: boolean }[]) {
          return (
            options.length === 4 &&
            options.filter((option) => option.isCorrect).length === 1
          );
        },
        message:
          "A question must contain exactly four options and one correct answer.",
      },
    },
    difficultyLevel: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
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
  },
  {
    timestamps: true,
  }
);


const Question = mongoose.model<IQuestion>("Question", questionSchema);
export default Question;