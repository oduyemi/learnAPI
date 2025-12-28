import mongoose, { Schema, Document } from "mongoose";

export interface ICourse extends Document {
  _id: mongoose.Types.ObjectId; 
  title: string;
  desc: string;
  instructor: string;
  duration: string; 
  level: "beginner" | "intermediate";
  category: mongoose.Types.ObjectId;
  img: string;
  createdAt: Date;
}

const courseSchema: Schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
  instructor: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    enum: ["beginner", "intermediate"],
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  img: {
    type: String,
    required: true,
    validate: {
      validator: (img: string) => {
        // Validate image file extension
        return /\.(png|jpg|jpeg|webp)$/.test(img);
      },
      message: "Image must be in .png, .jpg, .jpeg, or .webp format.",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Course = mongoose.model<ICourse>("Course", courseSchema);
export default Course;
