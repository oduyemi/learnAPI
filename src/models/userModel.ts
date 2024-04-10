import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId; 
  username: string;
  email: string;
  password: string;
  phone: string;
  dateOfBirth?: Date;
  img: string;
  createdAt: Date;
}

const userSchema: Schema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
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
  phone: {
    type: String,
    required: true,
    validate: {
      validator: (phone: string) => {
        // regular expression
        // Example: +1234567890 or 123-456-7890
        return /^\+?\d{1,3}[- ]?\d{3}[- ]?\d{3}[- ]?\d{4}$/.test(phone);
      },
      message: "Invalid phone number format",
    },
  },
  password: {
    type: String,
    required: true,
    validate: {
      validator: (password: string) => {
        // Password length should be at least 8
        // It should contain at least 1 capital letter
        // It should contain at least 1 small letter
        // It should contain at least 1 special character
        return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[^\s]).{8,}$/.test(password);
      },
      message: "Password must be at least 8 characters long and contain at least one capital letter, one small letter, one digit, and one special character.",
    },
  },
  dateOfBirth: {
    type: Date,
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

const User = mongoose.model<IUser>("User", userSchema);

export default User;
