import mongoose, { Schema, Document } from "mongoose";

export interface IAssignment extends Document {
  _id: mongoose.Types.ObjectId;
  module: mongoose.Types.ObjectId;
  title: string;
  desc: string;
  startDate?: Date;
  endDate?: Date;
  maxScore: number;
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
}

const assignmentSchema = new Schema<IAssignment>(
  {
    module: {
      type: Schema.Types.ObjectId,
      ref: "Module",
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

    startDate: {
      type: Date,
    },

    endDate: {
      type: Date,
    },

    maxScore: {
      type: Number,
      required: true,
      min: 1,
    },

    attachments: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Assignment = mongoose.model<IAssignment>(
  "Assignment",
  assignmentSchema
);

export default Assignment;