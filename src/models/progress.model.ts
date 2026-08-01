import mongoose, { Schema, Document } from "mongoose";

export interface IProgress extends Document {
  _id: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  cohort: mongoose.Types.ObjectId;
  module: mongoose.Types.ObjectId;
  isCompleted: boolean;
  completedAt?: Date;
  quizScore?: number;
  assignmentScore?: number;
  lastAccessedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const progressSchema = new Schema<IProgress>(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    cohort: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cohort",
      required: true,
    },

    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true,
    },

    isCompleted: {
      type: Boolean,
      default: false,
    },

    completedAt: {
      type: Date,
    },

    quizScore: {
      type: Number,
      min: 0,
    },

    assignmentScore: {
      type: Number,
      min: 0,
    },

    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

progressSchema.index(
  {
    student: 1,
    module: 1,
  },
  {
    unique: true,
  }
);

const Progress = mongoose.model<IProgress>("Progress", progressSchema);

export default Progress;