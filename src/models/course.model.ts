import mongoose, { Schema, Document } from "mongoose";

export interface ICourse extends Document {
  _id: mongoose.Types.ObjectId; 
  title: string;
  slug: string;
  desc: string;
  category: mongoose.Types.ObjectId;
  thumbnail: string;
  instructor: mongoose.Types.ObjectId[];
  duration: string; 
  hasCertificate: Boolean
  certificateTemplate?: String  
  isGeneral: boolean;
  img: string;
  createdAt: Date;
}




const courseSchema: Schema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    unique: true
  },
  desc: {
    type: String,
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  thumbnail: {
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
  instructors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  duration: {
    type: String,
    required: true
  },
  certificate: {
    type: String,
    required: true
  },
  isGeneral: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Course = mongoose.model<ICourse>("Course", courseSchema);
export default Course;
