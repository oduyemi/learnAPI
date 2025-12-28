"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetUserPassword = exports.UpdateAdminProfile = exports.UpdateUserProfile = exports.LoginAdmin = exports.RegisterAdmin = exports.LoginUser = exports.RegisterUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const bcrypt_2 = require("bcrypt");
const adminModel_1 = __importDefault(require("../models/adminModel"));
const userModel_1 = __importDefault(require("../models/userModel"));
require("dotenv").config();
const RegisterUser = async (req, res) => {
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
        const existingUser = await userModel_1.default.findOne({
            $or: [{ email }, { phone }, { username }],
        });
        if (existingUser) {
            res.status(400).json({ message: "Phone, email, or username already exists" });
            return;
        }
        const hashedPassword = await (0, bcrypt_2.hash)(password, 10);
        const user = await userModel_1.default.create({
            fname,
            lname,
            username,
            email,
            phone,
            password: hashedPassword,
        });
        const token = jsonwebtoken_1.default.sign({ sub: user._id, type: "user" }, process.env.JWT_SECRET, { expiresIn: "1h" });
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
    }
    catch (error) {
        console.error("RegisterUser Error:", error);
        res.status(500).json({ message: "Error registering user" });
    }
};
exports.RegisterUser = RegisterUser;
const LoginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: "Email and password are required" });
            return;
        }
        const user = await userModel_1.default.findOne({ email });
        if (!user) {
            res.status(401).json({ message: "Invalid email or password" });
            return;
        }
        const isMatch = await (0, bcrypt_2.compare)(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: "Invalid email or password" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ sub: user._id, type: "user" }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.status(200).json({
            message: "Login successful",
            token,
            nextStep: "/dashboard",
        });
    }
    catch (error) {
        console.error("LoginUser Error:", error);
        res.status(500).json({ message: "Error logging in user" });
    }
};
exports.LoginUser = LoginUser;
const RegisterAdmin = async (req, res) => {
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
        const existingAdmin = await adminModel_1.default.findOne({ email });
        if (existingAdmin) {
            res.status(400).json({ message: "Email already registered" });
            return;
        }
        const hashedPassword = await (0, bcrypt_2.hash)(password, 10);
        const newAdmin = new adminModel_1.default({ fname, lname, email, phone, password: hashedPassword });
        await newAdmin.save();
        const token = jsonwebtoken_1.default.sign({ id: newAdmin._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        const adminSession = {
            adminID: newAdmin._id,
            fname,
            lname,
            email,
            phone,
        };
        req.session.admin = adminSession;
        res.status(201).json({ message: "Admin registered successfully", token, nextStep: "/admin-login" });
    }
    catch (error) {
        console.error("RegisterAdmin Error:", error);
        res.status(500).json({ message: "Error registering admin" });
    }
};
exports.RegisterAdmin = RegisterAdmin;
const LoginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: "Email and password are required" });
            return;
        }
        const admin = await adminModel_1.default.findOne({ email });
        if (!admin) {
            res.status(401).json({ message: "Email not registered" });
            return;
        }
        const isPasswordMatch = await (0, bcrypt_2.compare)(password, admin.password);
        if (!isPasswordMatch) {
            res.status(401).json({ message: "Incorrect email or password" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ adminID: admin._id, email: admin.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
        const adminSession = {
            adminID: admin._id,
            fname: admin.fname,
            lname: admin.lname,
            email: admin.email,
            phone: admin.phone,
        };
        req.session.admin = adminSession;
        res.status(200).json({ message: "Admin login successful", token, nextStep: "/admin-dashboard" });
    }
    catch (error) {
        console.error("LoginAdmin Error:", error);
        res.status(500).json({ message: "Error logging in admin" });
    }
};
exports.LoginAdmin = LoginAdmin;
const UpdateUserProfile = async (req, res) => {
    try {
        const userId = req.userId; // ✅ identity from JWT
        const { username, email, phone, img } = req.body;
        const user = await userModel_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (username !== undefined)
            user.username = username;
        if (email !== undefined)
            user.email = email;
        if (phone !== undefined)
            user.phone = phone;
        if (img !== undefined)
            user.img = img;
        await user.save();
        res.status(200).json({
            message: "Profile updated successfully",
            user,
        });
    }
    catch (error) {
        console.error("UpdateUserProfile Error:", error);
        res.status(500).json({ message: "Failed to update profile" });
    }
};
exports.UpdateUserProfile = UpdateUserProfile;
const UpdateAdminProfile = async (req, res) => {
    try {
        const adminId = req.params.adminId;
        const updatedAdminData = req.body;
        const requiredFields = ["fname", "lname", "email", "phone"];
        const missingFields = requiredFields.filter(field => !(field in updatedAdminData));
        if (missingFields.length > 0) {
            res.status(400).json({ message: `Missing required fields: ${missingFields.join(", ")}` });
            return;
        }
        const updatedAdmin = await adminModel_1.default.findByIdAndUpdate(adminId, updatedAdminData, { new: true });
        if (!updatedAdmin) {
            res.status(404).json({ message: "Admin not found" });
            return;
        }
        res.status(200).json({ message: "Admin updated successfully", data: updatedAdmin });
    }
    catch (error) {
        console.error("Error updating admin profile", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.UpdateAdminProfile = UpdateAdminProfile;
const ResetUserPassword = async (req, res) => {
    try {
        const userId = req.userId; // ✅ from JWT
        const { oldPassword, newPassword, confirmNewPassword } = req.body;
        if (!oldPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ message: "Passwords must match" });
        }
        const user = await userModel_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const match = await bcrypt_1.default.compare(oldPassword, user.password);
        if (!match) {
            return res.status(400).json({ message: "Incorrect old password" });
        }
        user.password = await bcrypt_1.default.hash(newPassword, 10);
        await user.save();
        res.status(200).json({ message: "Password reset successful" });
    }
    catch (error) {
        console.error("ResetUserPassword Error:", error);
        res.status(500).json({ message: "Failed to reset password" });
    }
};
exports.ResetUserPassword = ResetUserPassword;
