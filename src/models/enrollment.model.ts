import mongoose, { Schema, Document } from "mongoose";

export interface IEnrollment extends Document {
  _id: mongoose.Types.ObjectId;
  students: mongoose.Types.ObjectId[];
  cohort: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const enrollmentSchema = new Schema<IEnrollment>(
  {
    students: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    cohort: {
      type: Schema.Types.ObjectId,
      ref: "Cohort",
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

enrollmentSchema.index({ cohort: 1 }, { unique: true });

const Enrollment = mongoose.model<IEnrollment>(
  "Enrollment",
  enrollmentSchema
);

export default Enrollment;