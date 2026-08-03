import mongoose, { Schema, Document } from 'mongoose';

export interface IEnrollment extends Document {
  _id: mongoose.Types.ObjectId;
  students: mongoose.Types.ObjectId[];
  cohort: string;
  createdAt: Date;
}

const enrollmentSchema: Schema = new mongoose.Schema({
    students: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      ],
      cohort: {
        type: String,
        ref: "Cohort",
        required: true
    },
    
    },
    {
        timestamps: true,
    }
);

const Enrollment = mongoose.model<IEnrollment>("Enrollment", enrollmentSchema);

export default Enrollment;
