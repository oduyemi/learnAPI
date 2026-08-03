import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId; 
  fname: string;
  lname: string;
  email: string;
  password: string;
  phone: string;
  role: "student" | "mentor"| "instructor"| "admin";
  img: string;
  cohort: mongoose.Types.ObjectId;           
  status: "active" | "suspended" | "graduated";
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  lastLogin:Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema: Schema = new mongoose.Schema({
  fname: {
    type: String,
    required: true,
  },
  lname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator: (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: "Invalid email format",
    },
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (phone: string) => {
        // regular expression
        // Example: +1234567890 or 123-456-7890
        return /^\+?\d{1,3}[- ]?\d{3}[- ]?\d{3}[- ]?\d{4}$/.test(phone);
      },
      message: "Invalid phone number format",
    },
  },
  role: {
    type: String,
    enum: ["student", "instructor", "mentor", "admin"],
    required: true,
  },
  img: {
    type: String,
    validate: {
      validator: (img: string) => {
        // Validate image file extension
        return /\.(png|jpg|jpeg|webp)$/.test(img);
      },
      message: "Image must be in .png, .jpg, .jpeg, or .webp format.",
    },
  },
  cohort: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cohort",
  },
  status: {
    type: String,
    enum: ["active", "suspended", "graduated"],
    default: "active",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resetPasswordToken: {
    type: String,
    default: null,
    select: false,
  },
  resetPasswordExpires: {
    type: Date,
    default: null,
    select: false,
  },
});

const User = mongoose.model<IUser>("User", userSchema);

export default User;
