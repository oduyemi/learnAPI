import mongoose, { Schema, Document } from "mongoose";

export interface ISubmission extends Document {
  _id: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  assignment?: mongoose.Types.ObjectId;
  quiz?: mongoose.Types.ObjectId;
  attemptNumber?: number;
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
  createdAt: Date;
  updatedAt: Date;
}

const submissionSchema = new Schema<ISubmission>(
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
    attemptNumber: {
      type: Number,
      min: 1,
    },

    answers: [
      {
        question: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
        },

        selectedOption: {
          type: Number,
          min: 0,
        },
      },
    ],

    submission: {
      type: [String],
      default: [],
    },

    files: {
      type: [String],
      default: [],
    },

    score: {
      type: Number,
      min: 0,
    },

    feedback: {
      type: String,
      default: "",
      trim: true,
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
      required: true,
    },

    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    gradedAt: {
      type: Date,
    },
  },
  {
    timestamps: {
      createdAt: "submittedAt",
      updatedAt: true,
    },
  }
);

submissionSchema.index(
  {
    student: 1,
    assignment: 1,
  },
  {
    unique: true,
    sparse: true,
  }
);
submissionSchema.index(
  {
    student: 1,
    quiz: 1,
    attemptNumber: 1,
  },
  {
    unique: true,
    sparse: true,
  }
);

const Submission = mongoose.model<ISubmission>(
  "Submission",
  submissionSchema
);

export default Submission;