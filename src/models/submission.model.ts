import mongoose, { Schema, Document } from "mongoose";

export interface ISubmission extends Document {
  _id: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  assignment?: mongoose.Types.ObjectId;
  quiz?: mongoose.Types.ObjectId;
  answers?: {
    question: mongoose.Types.ObjectId;
    selectedOption: number;
  }[];
  submission?: string[];
  files: string[];
  score?: number;
  feedback?: string;
  status:
    | "draft"
    | "submitted"
    | "graded"
    | "late";
  submittedAt: Date;
  gradedAt?: Date;
  gradedBy?: mongoose.Types.ObjectId;
}


const submissionSchema = new Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
    },

    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
    },

    answers: [
      {
        question: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
        },

        selectedOption: Number,
      },
    ],

    submission: [String],

    files: [String],

    score: Number,

    feedback: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "draft",
        "submitted",
        "graded",
        "late",
      ],
      default: "submitted",
    },

    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    gradedAt: Date,
  },
  {
    timestamps: {
      createdAt: "submittedAt",
      updatedAt: true,
    },
  }
);

submissionSchema.index(
  { student: 1, assignment: 1 },
  { unique: true, sparse: true }
);

submissionSchema.index(
  { student: 1, quiz: 1 },
  { unique: true, sparse: true }
);

const Submission = mongoose.model<ISubmission>("Submission", submissionSchema);

export default Submission;
