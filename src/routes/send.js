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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = require("bcrypt");
const adminModel_1 = __importDefault(require("../models/adminModel"));
const userModel_1 = __importDefault(require("../models/userModel"));
const reviewModel_1 = __importDefault(require("../models/reviewModel"));
const courseModel_1 = __importDefault(require("../models/courseModel"));
const enrollmentModel_1 = __importDefault(require("../models/enrollmentModel"));
const questionModel_1 = __importDefault(require("../models/questionModel"));
const categoryModel_1 = __importDefault(require("../models/categoryModel"));
const moduleModel_1 = __importDefault(require("../models/moduleModel"));
const quizModel_1 = __importDefault(require("../models/quizModel"));
const submissionModel_1 = __importDefault(require("../models/submissionModel"));
const router = express_1.default.Router();
require("dotenv").config();
router.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, phone, password, cpwd, dateOfBirth, img } = req.body;
        if (![username, email, phone, password, cpwd, dateOfBirth, img].every(field => field)) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (password !== cpwd) {
            return res.status(400).json({ message: "Both passwords must match" });
        }
        const existingUserByEmail = yield userModel_1.default.findOne({ email });
        if (existingUserByEmail) {
            return res.status(400).json({ message: "Email already registered" });
        }
        const existingUserByUsername = yield userModel_1.default.findOne({ username });
        if (existingUserByUsername) {
            return res.status(400).json({ message: "Username not available" });
        }
        const hashedPassword = yield (0, bcrypt_1.hash)(password, 10);
        const newUser = new userModel_1.default({ username, email, phone, password: hashedPassword, dateOfBirth, img });
        yield newUser.save();
        const token = jsonwebtoken_1.default.sign({
            userID: newUser._id,
            email: newUser.email,
            username: newUser.username
        }, process.env.JWT_SECRET);
        const userSession = {
            userID: newUser._id,
            username,
            email,
            phone,
            img
        };
        req.session.user = userSession;
        return res.status(201).json({
            message: "User registered successfully",
            token,
            nextStep: "/next-login-page"
        });
    }
    catch (error) {
        console.error("Error during user registration:", error);
        return res.status(500).json({ message: "Error registering user" });
    }
}));
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, username, password } = req.body;
        if ((!email && !username) || !password) {
            return res.status(400).json({ message: "Email/Username and password are required" });
        }
        let user = null;
        if (email) {
            user = yield userModel_1.default.findOne({ email });
        }
        if (!user && username) {
            user = yield userModel_1.default.findOne({ username });
        }
        if (!user) {
            return res.status(401).json({ message: "Invalid email/username or password" });
        }
        const isPasswordMatch = yield (0, bcrypt_1.compare)(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: "Invalid email/username or password" });
        }
        const token = jsonwebtoken_1.default.sign({
            userID: user._id,
            email: user.email
        }, process.env.JWT_SECRET || "default_secret");
        const userSession = {
            userID: user._id,
            username: user.username,
            email: user.email,
            phone: user.phone,
            img: user.img
        };
        req.session.user = userSession;
        return res.status(200).json({
            message: "User login successful!.",
            nextStep: "/next-dashboard",
            token,
        });
    }
    catch (error) {
        console.error("Error during user login:", error);
        return res.status(500).json({ message: "Error logging in user" });
    }
}));
router.post("/admin/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fname, lname, email, phone, password, cpwd } = req.body;
        if (![fname, lname, email, phone, password, cpwd].every((field) => field)) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (password !== cpwd) {
            return res.status(400).json({ message: "Both passwords must match!" });
        }
        const existingAdmin = yield adminModel_1.default.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: "Email already registered" });
        }
        const hashedPassword = yield (0, bcrypt_1.hash)(password, 10);
        const newAdmin = new adminModel_1.default({ fname, lname, email, phone, password: hashedPassword });
        yield newAdmin.save();
        // Access token
        const token = jsonwebtoken_1.default.sign({
            adminID: newAdmin._id,
            email: newAdmin.email
        }, process.env.JWT_SECRET);
        const adminSession = {
            adminID: newAdmin._id,
            fname,
            lname,
            email,
            phone
        };
        req.session.admin = adminSession;
        return res.status(201).json({
            message: "Admin registered successfully.",
            token,
            nextStep: "/next-admin-login-page",
        });
    }
    catch (error) {
        console.error("Error during admin registration:", error);
        return res.status(500).json({ message: "Error registering admin" });
    }
}));
router.post("/admin/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        try {
            const admin = yield adminModel_1.default.findOne({ email });
            if (!admin) {
                return res.status(401).json({ message: "Email not registered. Please register first." });
            }
            const isPasswordMatch = yield (0, bcrypt_1.compare)(password, admin.password);
            if (!isPasswordMatch) {
                return res.status(401).json({ message: "Incorrect email or password" });
            }
            const token = jsonwebtoken_1.default.sign({
                adminID: admin._id,
                email: admin.email
            }, process.env.JWT_SECRET || "default_secret");
            const adminSession = {
                adminID: admin._id,
                fname: admin.fname,
                lname: admin.lname,
                email: admin.email,
                phone: admin.phone,
            };
            req.session.admin = adminSession;
            return res.status(200).json({
                message: "Admin login successful!.",
                nextStep: "/next-admin-dashboard",
                token,
            });
        }
        catch (error) {
            console.error("Error during admin login:", error);
            return res.status(500).json({ message: "Error logging in admin" });
        }
    }
    catch (error) {
        console.error("Error during admin login:", error);
        return res.status(500).json({ message: "Error logging in admin" });
    }
}));
router.post("/course", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, desc, instructor, duration, level, category, img } = req.body;
        if (![title, desc, instructor, duration, level, category, img].every(field => field)) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const newCourse = new courseModel_1.default({ title, desc, instructor, duration, level, category, img });
        yield newCourse.save();
        return res.status(201).json({ message: "Course created successfully" });
    }
    catch (error) {
        console.error("Error during course creation:", error);
        return res.status(500).json({ message: "Error creating course" });
    }
}));
router.post("/category", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, desc } = req.body;
        if (![title, desc].every(field => field)) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const newCategory = new categoryModel_1.default({ title, desc });
        yield newCategory.save();
        return res.status(201).json({ message: "Category created successfully" });
    }
    catch (error) {
        console.error("Error during category creation:", error);
        return res.status(500).json({ message: "Error creating category" });
    }
}));
router.post("/review", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userID, courseID, reviewComment, rating } = req.body;
        if (![userID, courseID, reviewComment, rating].every(field => field)) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const newReview = new reviewModel_1.default({ userID, courseID, reviewComment, rating });
        yield newReview.save();
        return res.status(201).json({ message: "Review submitted successfully" });
    }
    catch (error) {
        console.error("Error during review submission:", error);
        return res.status(500).json({ message: "Error submitting review" });
    }
}));
router.post("/quiz", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { questions } = req.body;
        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ message: "At least one question is required" });
        }
        const newQuiz = new quizModel_1.default({ questions });
        yield newQuiz.save();
        return res.status(201).json({ message: "Quiz created successfully" });
    }
    catch (error) {
        console.error("Error during quiz creation:", error);
        return res.status(500).json({ message: "Error creating quiz" });
    }
}));
router.post("/question", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { questionText, options, correctAnswer, difficultyLevel, courseID, category } = req.body;
        if (![questionText, options, correctAnswer, difficultyLevel, courseID, category].every(field => field)) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (!Array.isArray(options) || options.length !== 4) {
            return res.status(400).json({ message: "Exactly four options (A, B, C, D) are required" });
        }
        for (const option of options) {
            if (typeof option !== 'string') {
                return res.status(400).json({ message: "Options must be strings" });
            }
        }
        const newQuestion = new questionModel_1.default({ questionText, options, correctAnswer, difficultyLevel, courseID, category });
        yield newQuestion.save();
        return res.status(201).json({ message: "Question added successfully" });
    }
    catch (error) {
        console.error("Error adding question:", error);
        return res.status(500).json({ message: "Error adding question" });
    }
}));
router.post("/module", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, desc, text, video, quiz, order } = req.body;
        if (![title, desc, text, video, quiz, order].every(field => field)) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const newModule = new moduleModel_1.default({ title, desc, text, video, quiz, order });
        yield newModule.save();
        return res.status(201).json({ message: "Module created successfully" });
    }
    catch (error) {
        console.error("Error during module creation:", error);
        return res.status(500).json({ message: "Error creating module" });
    }
}));
router.post("/enrollment", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userID, courseID, status } = req.body;
        if (![userID, courseID, status].every(field => field)) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const newEnrollment = new enrollmentModel_1.default({ userID, courseID, status });
        yield newEnrollment.save();
        return res.status(201).json({ message: "Enrollment created successfully" });
    }
    catch (error) {
        console.error("Error during enrollment creation:", error);
        return res.status(500).json({ message: "Error creating enrollment" });
    }
}));
router.post("/submission", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, quizId, answers, score } = req.body;
        if (![userId, quizId, answers].every(field => field)) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const newSubmission = new submissionModel_1.default({ userId, quizId, answers, score });
        yield newSubmission.save();
        return res.status(201).json({ message: "Submission created successfully" });
    }
    catch (error) {
        console.error("Error during submission creation:", error);
        return res.status(500).json({ message: "Error creating submission" });
    }
}));
exports.default = router;
