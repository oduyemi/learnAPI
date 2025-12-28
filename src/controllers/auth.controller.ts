import { Request, Response } from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { hash, compare } from "bcrypt";
import Admin, { IAdmin } from "../models/adminModel";
import User, { IUser } from "../models/userModel";
import { AuthRequest } from "../middlewares/auth.middleware";

require("dotenv").config();



export interface AdminSession {
  adminID: mongoose.Types.ObjectId;
  fname: string;
  lname: string;
  email: string;
  phone: string;
}

declare module "express-session" {
  interface SessionData {
    admin?: AdminSession;
  }
}


export const RegisterUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fname, lname, username, email, phone, password, confirmPassword } = req.body;

    if (![fname, lname, username, email, phone, password, confirmPassword].every(Boolean)) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({ message: "Passwords do not match" });
      return;
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { phone }, { username }],
    });

    if (existingUser) {
      res.status(400).json({ message: "Phone, email, or username already exists" });
      return;
    }

    const hashedPassword = await hash(password, 10);

    const user = await User.create({
      fname,
      lname,
      username,
      email,
      phone,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { sub: user._id, type: "user" },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        fname,
        lname,
        username,
        email,
        phone,
      },
    });
  } catch (error) {
    console.error("RegisterUser Error:", error);
    res.status(500).json({ message: "Error registering user" });
  }
};


export const LoginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const token = jwt.sign(
      { sub: user._id, type: "user" },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      nextStep: "/dashboard",
    });
  } catch (error) {
    console.error("LoginUser Error:", error);
    res.status(500).json({ message: "Error logging in user" });
  }
};





export const RegisterAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fname, lname, email, phone, password, confirmPassword } = req.body;

    if (![fname, lname, email, phone, password, confirmPassword].every(Boolean)) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({ message: "Passwords do not match" });
      return;
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      res.status(400).json({ message: "Email already registered" });
      return;
    }

    const hashedPassword = await hash(password, 10);
    const newAdmin: IAdmin = new Admin({ fname, lname, email, phone, password: hashedPassword });
    await newAdmin.save();

    const token = jwt.sign(
      { id: newAdmin._id },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );
    
    const adminSession: AdminSession = {
      adminID: newAdmin._id,
      fname,
      lname,
      email,
      phone,
    };

    req.session.admin = adminSession;

    res.status(201).json({ message: "Admin registered successfully", token, nextStep: "/admin-login" });
  } catch (error) {
    console.error("RegisterAdmin Error:", error);
    res.status(500).json({ message: "Error registering admin" });
  }
};

export const LoginAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      res.status(401).json({ message: "Email not registered" });
      return;
    }

    const isPasswordMatch = await compare(password, admin.password);
    if (!isPasswordMatch) {
      res.status(401).json({ message: "Incorrect email or password" });
      return;
    }

    const token = jwt.sign(
      { adminID: admin._id, email: admin.email },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    const adminSession: AdminSession = {
      adminID: admin._id,
      fname: admin.fname,
      lname: admin.lname,
      email: admin.email,
      phone: admin.phone,
    };

    req.session.admin = adminSession;

    res.status(200).json({ message: "Admin login successful", token, nextStep: "/admin-dashboard" });
  } catch (error) {
    console.error("LoginAdmin Error:", error);
    res.status(500).json({ message: "Error logging in admin" });
  }
};

export const UpdateUserProfile = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.userId; // ✅ identity from JWT

    const { username, email, phone, img } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (username !== undefined) user.username = username;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (img !== undefined) user.img = img;

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("UpdateUserProfile Error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};




export const UpdateAdminProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminId = req.params.adminId;
    const updatedAdminData: Partial<IAdmin> = req.body;

    const requiredFields = ["fname", "lname", "email", "phone"];
    const missingFields = requiredFields.filter(field => !(field in updatedAdminData));

    if (missingFields.length > 0) {
      res.status(400).json({ message: `Missing required fields: ${missingFields.join(", ")}` });
      return;
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(adminId, updatedAdminData, { new: true });
    if (!updatedAdmin) {
      res.status(404).json({ message: "Admin not found" });
      return;
    }

    res.status(200).json({ message: "Admin updated successfully", data: updatedAdmin });
  } catch (error) {
    console.error("Error updating admin profile", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



export const ResetUserPassword = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.userId; // ✅ from JWT

    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: "Passwords must match" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) {
      return res.status(400).json({ message: "Incorrect old password" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("ResetUserPassword Error:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
};
