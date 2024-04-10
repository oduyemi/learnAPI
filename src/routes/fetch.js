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
router.get("/", (req, res) => {
    res.json({ message: "Welcome to LearnAPI" });
});
router.get("/users", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield userModel_1.default.find();
        if (users.length === 0) {
            res.status(404).json({ Message: "Users not available" });
        }
        else {
            res.json({ data: users });
        }
    }
    catch (error) {
        console.error("Error fetching data from the database", error);
        res.status(500).json({ Message: "Internal Server Error" });
    }
}));
router.get("/users/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.adminId;
        const user = yield userModel_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ Message: "User not found" });
        }
        else {
            res.json({ data: user });
        }
    }
    catch (error) {
        console.error("Error fetching data from the database", error);
        res.status(500).json({ Message: "Internal Server Error" });
    }
}));
router.get("/admin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admins = yield adminModel_1.default.find();
        if (admins.length === 0) {
            res.status(404).json({ Message: "Admins not available" });
        }
        else {
            res.json({ data: admins });
        }
    }
    catch (error) {
        console.error("Error fetching data from the database", error);
        res.status(500).json({ Message: "Internal Server Error" });
    }
}));
router.get("/admin/:adminId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const adminId = req.params.adminId;
        const admin = yield adminModel_1.default.findById(adminId);
        if (!admin) {
            res.status(404).json({ Message: "Admin not found" });
        }
        else {
            res.json({ data: admin });
        }
    }
    catch (error) {
        console.error("Error fetching data from the database", error);
        res.status(500).json({ Message: "Internal Server Error" });
    }
}));
router.get("/courses", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const courses = yield courseModel_1.default.find();
        return res.status(200).json(courses);
    }
    catch (error) {
        console.error("Error retrieving courses:", error);
        return res.status(500).json({ message: "Error retrieving courses" });
    }
}));
router.get("/course/:courseId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const courseId = req.params.courseId;
        const course = yield courseModel_1.default.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        return res.status(200).json(course);
    }
    catch (error) {
        console.error("Error retrieving course:", error);
        return res.status(500).json({ message: "Error retrieving course" });
    }
}));
router.get("/categories", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield categoryModel_1.default.find();
        return res.status(200).json(categories);
    }
    catch (error) {
        console.error("Error retrieving categories:", error);
        return res.status(500).json({ message: "Error retrieving categories" });
    }
}));
router.get("/categories/:categoryId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categoryId = req.params.categoryId;
        const category = yield categoryModel_1.default.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        return res.status(200).json(category);
    }
    catch (error) {
        console.error("Error retrieving category:", error);
        return res.status(500).json({ message: "Error retrieving category" });
    }
}));
router.get("/questions", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const questions = yield questionModel_1.default.find();
        return res.status(200).json(questions);
    }
    catch (error) {
        console.error("Error retrieving questions:", error);
        return res.status(500).json({ message: "Error retrieving questions" });
    }
}));
router.get("/questions/:questionId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const questionId = req.params.questionId;
        const question = yield questionModel_1.default.findById(questionId);
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }
        return res.status(200).json(question);
    }
    catch (error) {
        console.error("Error retrieving question:", error);
        return res.status(500).json({ message: "Error retrieving question" });
    }
}));
router.get("/quizzes", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const quizzes = yield quizModel_1.default.find();
        return res.status(200).json(quizzes);
    }
    catch (error) {
        console.error("Error retrieving quizzes:", error);
        return res.status(500).json({ message: "Error retrieving quizzes" });
    }
}));
router.get("/quizzes/:quizId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const quizId = req.params.quizId;
        const quiz = yield quizModel_1.default.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }
        return res.status(200).json(quiz);
    }
    catch (error) {
        console.error("Error retrieving quiz:", error);
        return res.status(500).json({ message: "Error retrieving quiz" });
    }
}));
router.get("/modules", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const modules = yield moduleModel_1.default.find();
        return res.status(200).json(modules);
    }
    catch (error) {
        console.error("Error retrieving modules:", error);
        return res.status(500).json({ message: "Error retrieving modules" });
    }
}));
router.get("/modules/:moduleId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const moduleId = req.params.moduleId;
        const module = yield moduleModel_1.default.findById(moduleId);
        if (!module) {
            return res.status(404).json({ message: "Module not found" });
        }
        return res.status(200).json(module);
    }
    catch (error) {
        console.error("Error retrieving module:", error);
        return res.status(500).json({ message: "Error retrieving module" });
    }
}));
router.get("/enrollments", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const enrollments = yield enrollmentModel_1.default.find();
        return res.status(200).json(enrollments);
    }
    catch (error) {
        console.error("Error retrieving enrollments:", error);
        return res.status(500).json({ message: "Error retrieving enrollments" });
    }
}));
router.get("/enrollments/:enrollmentId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const enrollmentId = req.params.enrollmentId;
        const enrollment = yield enrollmentModel_1.default.findById(enrollmentId);
        if (!enrollment) {
            return res.status(404).json({ message: "Enrollment not found" });
        }
        return res.status(200).json(enrollment);
    }
    catch (error) {
        console.error("Error retrieving enrollment:", error);
        return res.status(500).json({ message: "Error retrieving enrollment" });
    }
}));
router.get("/reviews", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reviews = yield reviewModel_1.default.find();
        return res.status(200).json(reviews);
    }
    catch (error) {
        console.error("Error retrieving reviews:", error);
        return res.status(500).json({ message: "Error retrieving reviews" });
    }
}));
router.get("/reviews/:reviewId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reviewId = req.params.reviewId;
        const review = yield reviewModel_1.default.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }
        return res.status(200).json(review);
    }
    catch (error) {
        console.error("Error retrieving review:", error);
        return res.status(500).json({ message: "Error retrieving review" });
    }
}));
router.get("/submissions", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const submissions = yield submissionModel_1.default.find();
        return res.status(200).json(submissions);
    }
    catch (error) {
        console.error("Error retrieving submissions:", error);
        return res.status(500).json({ message: "Error retrieving submissions" });
    }
}));
router.get("/submissions/:submissionId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const submissionId = req.params.submissionId;
        const submission = yield submissionModel_1.default.findById(submissionId);
        if (!submission) {
            return res.status(404).json({ message: "Submission not found" });
        }
        return res.status(200).json(submission);
    }
    catch (error) {
        console.error("Error retrieving submission:", error);
        return res.status(500).json({ message: "Error retrieving submission" });
    }
}));
exports.default = router;
