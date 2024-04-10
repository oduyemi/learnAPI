import mongoose, { Schema, Document } from "mongoose";

export interface IModule extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  desc: string;
  text: string;
  video: string;
  quizzes: mongoose.Types.ObjectId[];
  order: string;
  createdAt: Date;
}

const moduleSchema: Schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  video: {
    type: String,
    required: true,
  },
  quizzes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz', 
  }],
  order: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
});


const Module = mongoose.model<IModule>("Module", moduleSchema);

export default Module;
