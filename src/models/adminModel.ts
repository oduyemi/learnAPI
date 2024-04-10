import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";

export interface IAdmin extends Document {
  _id: mongoose.Types.ObjectId; 
  fname: string;
  lname: string;
  email: string;
  phone: string;
  password: string;
  createdAt: Date;
}

const adminSchema: Schema = new mongoose.Schema({
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
  phone: {
    type: String,
    required: true,
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

adminSchema.pre<IAdmin>("save", async function(next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(this.password, salt);
    this.password = hash;
    next();
  } catch (err: any) { 
    return next(err);
  }
});


const Admin = mongoose.model<IAdmin>("Admin", adminSchema);
export default Admin;
