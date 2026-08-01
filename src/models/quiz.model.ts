import mongoose, { Schema, Document } from 'mongoose';

export interface IQuiz extends Document {
  _id: mongoose.Types.ObjectId; 
  module: mongoose.Types.ObjectId;
  title: string;
  passingScore: number;
  timeLimit: number;
  attempts: number;
  questions: mongoose.Types.ObjectId[];
  submissions: mongoose.Types.ObjectId[];
  isPublished: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}



const quizSchema: Schema = new mongoose.Schema({
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Module",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  passingScore: {
    type: Number,
    required: true,
  },
  timeLimit: {
    type: Number,
    required: true,
    default: 30
  },
  attempts: {
    type: Number,
    required: true,
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question', 
  }],
  submissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission', 
  }],
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
    timestamps: true
  }
);

const Quiz = mongoose.model<IQuiz>('Quiz', quizSchema);

export default Quiz;
