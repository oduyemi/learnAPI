"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const adminModel_1 = __importDefault(require("../models/adminModel"));
const userModel_1 = __importDefault(require("../models/userModel"));
const router = express_1.default.Router();
router.put("/users/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.userId;
        if (!req.session.user || req.session.user.userID.toString() !== userId) {
            return res.status(401).json({ message: "Unauthorized: User not logged in or unauthorized to perform this action" });
        }
        const { username, email, phone, img } = req.body;
        const user = yield userModel_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (username)
            user.username = username;
        if (email)
            user.email = email;
        if (phone)
            user.phone = phone;
        if (img)
            user.img = img;
        yield user.save();
        res.status(200).json({ message: "User details updated successfully" });
    }
    catch (error) {
        console.error("Error updating user details:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}));
router.put("/admin/:adminId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const adminId = req.params.adminId;
        const updatedAdminData = req.body;
        const requiredFields = ["fname", "lname", "email", "phone", "password"];
        const missingFields = requiredFields.filter(field => !(field in updatedAdminData));
        if (missingFields.length > 0) {
            return res.status(400).json({ message: `Missing required fields: ${missingFields.join(", ")}` });
        }
        const updatedAdmin = yield adminModel_1.default.findByIdAndUpdate(adminId, updatedAdminData, { new: true });
        if (!updatedAdmin) {
            return res.status(404).json({ Message: "Admin not found" });
        }
        res.json({ data: updatedAdmin });
    }
    catch (error) {
        console.error("Error updating admin profile", error);
        res.status(500).json({ Message: "Internal Server Error" });
    }
}));
router.put("/users/:userId/resetpassword", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.userId;
        if (!req.session.user || req.session.user.userID.toString() !== userId) {
            return res.status(401).json({ message: "Unauthorized: User not logged in or unauthorized to perform this action" });
        }
        const { oldPassword, newPassword, confirmNewPassword } = req.body;
        const user = yield userModel_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (!newPassword !== confirmNewPassword) {
            return res.status(404).json({ message: "Both passwords must match!" });
        }
        const isPasswordMatch = yield bcrypt_1.default.compare(oldPassword, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ message: "Incorrect old password" });
        }
        user.password = yield bcrypt_1.default.hash(newPassword, 10);
        yield user.save();
        res.status(200).json({ message: "Password reset successfully" });
    }
    catch (error) {
        console.error("Error resetting user password:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}));
exports.default = router;
