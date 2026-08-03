"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfilePicture = exports.getInstructorsByCourse = exports.getUser = exports.getStudentsByCohort = exports.getUsersByRole = exports.getUsers = exports.createUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_model_1 = __importDefault(require("../models/user.model"));
const cohort_model_1 = __importDefault(require("../models/cohort.model"));
const password_1 = require("../utils/password");
const sendEmail_1 = require("../utils/sendEmail");
const serializeUser_1 = require("../utils/serializeUser");
const course_model_1 = __importDefault(require("../models/course.model"));
const db_1 = __importDefault(require("../db"));
const cloudinaryUpload_1 = require("../utils/cloudinaryUpload");
const createUser = async (req, res) => {
    try {
        await (0, db_1.default)();
        const { fname, lname, email, phone, role, cohort, img } = req.body;
        if (!fname || !lname || !email || !phone || !role) {
            res.status(400).json({
                success: false,
                message: "Missing required fields."
            });
            return;
        }
        const exists = await user_model_1.default.findOne({
            $or: [{ email }, { phone }]
        });
        if (exists) {
            res.status(409).json({
                success: false,
                message: "Email or phone already exists."
            });
            return;
        }
        if (role === "student" && !cohort) {
            res.status(400).json({
                success: false,
                message: "Students must belong to a cohort."
            });
            return;
        }
        if (cohort) {
            const cohortExists = await cohort_model_1.default.findById(cohort);
            if (!cohortExists) {
                res.status(404).json({
                    success: false,
                    message: "Cohort not found."
                });
                return;
            }
        }
        const temporaryPassword = (0, password_1.generateTemporaryPassword)();
        const hashedPassword = await bcryptjs_1.default.hash(temporaryPassword, 10);
        const user = await user_model_1.default.create({
            fname,
            lname,
            email: email.toLowerCase(),
            phone,
            role,
            cohort: cohort || null,
            img,
            password: hashedPassword
        });
        switch (role) {
            case "admin":
                await (0, sendEmail_1.sendAdminOnboardingMail)(user.email, temporaryPassword);
                break;
            case "mentor":
                await (0, sendEmail_1.sendMentorOnboardingMail)(user.email, temporaryPassword);
                break;
            case "instructor":
                await (0, sendEmail_1.sendInstructorOnboardingMail)(user.email, temporaryPassword);
                break;
            default:
                await (0, sendEmail_1.sendOnboardingMail)(user.email, temporaryPassword);
        }
        res.status(201).json({
            success: true,
            message: "User created successfully.",
            user: (0, serializeUser_1.serializeUser)(user)
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error."
        });
        return;
    }
};
exports.createUser = createUser;
const getUsers = async (req, res) => {
    try {
        await (0, db_1.default)();
        const { role, status, cohort, search, page = "1", limit = "20" } = req.query;
        const filter = {};
        if (role) {
            filter.role = role;
        }
        if (status) {
            filter.status = status;
        }
        if (cohort) {
            filter.cohort = cohort;
        }
        if (search) {
            filter.$or = [
                {
                    fname: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    lname: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    email: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    phone: {
                        $regex: search,
                        $options: "i",
                    },
                },
            ];
        }
        const currentPage = Number(page);
        const pageSize = Number(limit);
        const total = await user_model_1.default.countDocuments(filter);
        const users = await user_model_1.default.find(filter)
            .populate("cohort", "title code")
            .sort({
            createdAt: -1,
        })
            .skip((currentPage - 1) * pageSize)
            .limit(pageSize);
        res.status(200).json({
            success: true,
            total,
            page: currentPage,
            pages: Math.ceil(total / pageSize),
            count: users.length,
            users: users.map(serializeUser_1.serializeUser),
        });
        return;
    }
    catch (error) {
        console.error("Get Users Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch users.",
        });
        return;
    }
};
exports.getUsers = getUsers;
const getUsersByRole = async (req, res) => {
    try {
        await (0, db_1.default)();
        const { role } = req.params;
        const validRoles = ["student", "mentor", "instructor", "admin"];
        if (!validRoles.includes(role)) {
            res.status(400).json({
                success: false,
                message: "Invalid role.",
            });
            return;
        }
        const users = await user_model_1.default.find({ role })
            .populate("cohort", "title code")
            .sort({ fname: 1 });
        res.status(200).json({
            success: true,
            count: users.length,
            users: users.map(serializeUser_1.serializeUser),
        });
    }
    catch (error) {
        console.error("Get Users By Role Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch users.",
        });
        return;
    }
};
exports.getUsersByRole = getUsersByRole;
const getStudentsByCohort = async (req, res) => {
    try {
        await (0, db_1.default)();
        const { cohortId } = req.params;
        const students = await user_model_1.default.find({
            role: "student",
            cohort: cohortId,
            status: "active",
        })
            .populate("cohort", "title code")
            .sort({
            fname: 1,
        });
        return res.status(200).json({
            success: true,
            count: students.length,
            students: students.map(serializeUser_1.serializeUser),
        });
    }
    catch (error) {
        console.error("Get Students By Cohort Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch students.",
        });
    }
};
exports.getStudentsByCohort = getStudentsByCohort;
const getUser = async (req, res) => {
    try {
        await (0, db_1.default)();
        const { id } = req.params;
        const user = await user_model_1.default.findById(id).populate("cohort", "title code course");
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found.",
            });
            return;
        }
        res.status(200).json({
            success: true,
            user: (0, serializeUser_1.serializeUser)(user),
        });
    }
    catch (error) {
        console.error("Get User Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch user.",
        });
        return;
    }
};
exports.getUser = getUser;
const getInstructorsByCourse = async (req, res) => {
    try {
        await (0, db_1.default)();
        const { courseId } = req.params;
        const course = await course_model_1.default.findById(courseId).populate({
            path: "instructors",
            select: "-password",
        });
        if (!course) {
            res.status(404).json({
                success: false,
                message: "Course not found.",
            });
            return;
        }
        const instructors = course.instructors;
        res.status(200).json({
            success: true,
            count: instructors.length,
            instructors: instructors.map(serializeUser_1.serializeUser),
        });
    }
    catch (error) {
        console.error("Get Course Instructors Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch instructors.",
        });
    }
};
exports.getInstructorsByCourse = getInstructorsByCourse;
const updateProfilePicture = async (req, res) => {
    try {
        await (0, db_1.default)();
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized.",
            });
        }
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload an image.",
            });
        }
        const user = await user_model_1.default.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }
        const uploaded = await (0, cloudinaryUpload_1.uploadBuffer)(req.file.buffer, {
            folder: "progrowing/users",
        });
        user.img = uploaded.secure_url;
        await user.save();
        return res.status(200).json({
            success: true,
            message: "Profile picture updated successfully.",
            data: user,
        });
    }
    catch (error) {
        console.error("Update Profile Picture Error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to update profile picture.",
        });
    }
};
exports.updateProfilePicture = updateProfilePicture;
