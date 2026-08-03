"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.changePassword = exports.updateProfile = exports.me = exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const user_model_1 = __importDefault(require("../models/user.model"));
const auth_1 = require("../utils/auth");
const serializeUser_1 = require("../utils/serializeUser");
const sendEmail_1 = require("../utils/sendEmail");
const index_1 = require("../db/index");
const login = async (req, res) => {
    try {
        await (0, index_1.dbConnect)();
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required.",
            });
        }
        const user = await user_model_1.default.findOne({
            email: email.toLowerCase().trim(),
        }).select("+password");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }
        if (user.status === "suspended") {
            return res.status(403).json({
                success: false,
                message: "Your account has been suspended.",
            });
        }
        const passwordMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }
        user.lastLogin = new Date();
        await user.save();
        const token = (0, auth_1.generateToken)(user);
        return res.status(200).json({
            success: true,
            message: "Login successful.",
            token,
            user: (0, serializeUser_1.serializeUser)(user),
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message,
            error,
        });
    }
};
exports.login = login;
const me = async (req, res) => {
    try {
        await (0, index_1.dbConnect)();
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized.",
            });
        }
        return res.status(200).json({
            success: true,
            user: req.user,
        });
    }
    catch (error) {
        console.error("Me Error:", error);
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred.",
        });
    }
};
exports.me = me;
const updateProfile = async (req, res) => {
    try {
        await (0, index_1.dbConnect)();
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized.",
            });
        }
        const { fname, lname, email, phone, img } = req.body;
        const user = await user_model_1.default.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }
        if (email && email !== user.email) {
            const existing = await user_model_1.default.findOne({
                email: email.toLowerCase().trim(),
                _id: { $ne: user._id },
            });
            if (existing) {
                return res.status(409).json({
                    success: false,
                    message: "Email already exists.",
                });
            }
            user.email = email.toLowerCase().trim();
        }
        if (phone && phone !== user.phone) {
            const existing = await user_model_1.default.findOne({
                phone,
                _id: { $ne: user._id },
            });
            if (existing) {
                return res.status(409).json({
                    success: false,
                    message: "Phone number already exists.",
                });
            }
            user.phone = phone;
        }
        if (fname !== undefined)
            user.fname = fname;
        if (lname !== undefined)
            user.lname = lname;
        if (img !== undefined)
            user.img = img;
        await user.save();
        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            user: {
                _id: user._id,
                fname: user.fname,
                lname: user.lname,
                email: user.email,
                phone: user.phone,
                role: user.role,
                img: user.img,
                cohort: user.cohort,
                status: user.status,
                updatedAt: user.updatedAt,
            },
        });
    }
    catch (error) {
        console.error("Update Profile Error:", error);
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred.",
        });
    }
};
exports.updateProfile = updateProfile;
const changePassword = async (req, res) => {
    try {
        await (0, index_1.dbConnect)();
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized.",
            });
        }
        const { currentPassword, newPassword, confirmPassword } = req.body;
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "All password fields are required.",
            });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match.",
            });
        }
        const user = await user_model_1.default.findById(req.user._id).select("+password");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }
        const isMatch = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect.",
            });
        }
        const samePassword = await bcryptjs_1.default.compare(newPassword, user.password);
        if (samePassword) {
            return res.status(400).json({
                success: false,
                message: "New password must be different from the current password.",
            });
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        user.password = await bcryptjs_1.default.hash(newPassword, salt);
        await user.save();
        return res.status(200).json({
            success: true,
            message: "Password changed successfully.",
        });
    }
    catch (error) {
        console.error("Change Password Error:", error);
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred.",
        });
    }
};
exports.changePassword = changePassword;
const forgotPassword = async (req, res) => {
    try {
        await (0, index_1.dbConnect)();
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required.",
            });
        }
        const user = await user_model_1.default.findOne({
            email: email.toLowerCase().trim(),
        }).select("+resetPasswordToken +resetPasswordExpires");
        if (!user) {
            return res.status(200).json({
                success: true,
                message: "If an account exists with that email, a password reset link has been sent.",
            });
        }
        const rawToken = crypto_1.default.randomBytes(32).toString("hex");
        const hashedToken = crypto_1.default
            .createHash("sha256")
            .update(rawToken)
            .digest("hex");
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();
        const resetLink = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;
        await (0, sendEmail_1.sendPasswordResetMail)(user.email, resetLink);
        return res.status(200).json({
            success: true,
            message: "If an account exists with that email, a password reset link has been sent.",
        });
    }
    catch (error) {
        console.error("Forgot Password Error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to process request.",
        });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    try {
        await (0, index_1.dbConnect)();
        const { token } = req.params;
        const { password, confirmPassword } = req.body;
        if (!password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and confirmation are required.",
            });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match.",
            });
        }
        const hashedToken = crypto_1.default
            .createHash("sha256")
            .update(token)
            .digest("hex");
        const user = await user_model_1.default.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: {
                $gt: new Date(),
            },
        }).select("+password +resetPasswordToken +resetPasswordExpires");
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset link.",
            });
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        user.password = await bcryptjs_1.default.hash(password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        return res.status(200).json({
            success: true,
            message: "Password has been reset successfully. You can now log in.",
        });
    }
    catch (error) {
        console.error("Reset Password Error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to reset password.",
        });
    }
};
exports.resetPassword = resetPassword;
