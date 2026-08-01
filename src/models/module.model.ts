import mongoose, { Schema, Document } from "mongoose";


export interface IModule extends Document {
  _id: mongoose.Types.ObjectId;
  cohort: mongoose.Types.ObjectId;
  title: string;
  desc: string;
  weekNumber: number;
  session: "a" | "b" | "c";
  video?: string;
  text?: string;
  resources: {
    title: string;
    url: string;
  }[];
  quizzes: mongoose.Types.ObjectId[];
  assignment?: mongoose.Types.ObjectId;
  order: number;
  releaseDate: Date;
  isPublished: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}


const moduleSchema = new Schema<IModule>(
  {
    cohort: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cohort",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    desc: {
      type: String,
      required: true,
      trim: true,
    },

    weekNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    session: {
      type: String,
      enum: ["a", "b", "c"],
      required: true,
    },

    video: {
      type: String,
    },

    text: {
      type: String,
    },

    resources: [
      {
        title: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],

    quizzes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz",
      },
    ],

    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
    },

    order: {
      type: Number,
      required: true,
    },

    releaseDate: {
      type: Date,
      required: true,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

moduleSchema.index(
  {
    cohort: 1,
    weekNumber: 1,
    session: 1,
  },
  {
    unique: true,
  }
);

const Module = mongoose.model<IModule>("Module", moduleSchema);

export default Module;