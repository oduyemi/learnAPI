import mongoose, { Schema, Document } from 'mongoose';



export interface IAssignment extends Document {
  _id: mongoose.Types.ObjectId;
  module: mongoose.Types.ObjectId;
  title: string;
  desc: string;
  startDate: Date;
  endDate: Date;
  maxScore: number;
  attachments: string[] 
  createdAt: Date;
}



const assignmentSchema: Schema = new mongoose.Schema({
    module: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module', 
        required: true
    },
      title: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        required: true,
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
    },
    attachments: {
        type: [String],
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Assignment = mongoose.model<IAssignment>("Cohort", assignmentSchema);

export default Assignment;
