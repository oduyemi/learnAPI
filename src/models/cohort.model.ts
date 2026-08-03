import mongoose, { Schema, Document } from 'mongoose';

export interface ICohort extends Document {
  _id: mongoose.Types.ObjectId;
  courses: mongoose.Types.ObjectId[];
  title: string;
  code: string;
  startDate: Date;
  endDate: Date;
  status: "not_started" | "in_progress"| "ended" | "suspended"
  createdAt: Date;
}

const cohortSchema: Schema = new mongoose.Schema({
    courses: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
          required: true,
        },
      ],
      title: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true,
        unique: true
    },
    startDate: {
        type: Date,
    },
    endDate: {
        type: Date,
      },
    status: {
        type: String,
        enum: ["not_started", "in_progress", "ended", "suspended"],
        default:"not_started",
        required: true,
    },
    },
    {
        timestamps: true,
    }
);

const Cohort = mongoose.model<ICohort>("Cohort", cohortSchema);

export default Cohort;
