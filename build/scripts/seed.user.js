"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAdmin = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const index_1 = require("../db/index");
const user_model_1 = __importDefault(require("../models/user.model"));
const password_1 = require("../utils/password");
const sendEmail_1 = require("../utils/sendEmail");
const seedAdmin = async () => {
    try {
        await (0, index_1.dbConnect)();
        const email = "yemi@progrowing.org";
        const existingAdmin = await user_model_1.default.findOne({ email });
        if (existingAdmin) {
            console.log("Admin already exists.");
            await mongoose_1.default.disconnect();
            process.exit(0);
        }
        const temporaryPassword = (0, password_1.generateTemporaryPassword)();
        const hashedPassword = await bcryptjs_1.default.hash(temporaryPassword, 10);
        const admin = await user_model_1.default.create({
            fname: "Yemi",
            lname: "Oduyemi",
            email,
            phone: "+2348166336187",
            role: "admin",
            cohort: null,
            password: hashedPassword,
            status: "active",
        });
        await (0, sendEmail_1.sendAdminOnboardingMail)(email, temporaryPassword);
        console.log("Admin seeded successfully.");
        console.log(`Email: ${admin.email}`);
        console.log("Temporary password:", temporaryPassword);
        console.log("Onboarding email sent.");
        await mongoose_1.default.disconnect();
        process.exit(0);
    }
    catch (error) {
        console.error("Failed to seed admin:", error);
        await mongoose_1.default.disconnect();
        process.exit(1);
    }
};
exports.seedAdmin = seedAdmin;
(0, exports.seedAdmin)();
