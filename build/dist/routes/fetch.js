"use strict";
// import express, { Request, Response } from "express";
// import Admin, { IAdmin } from "../models/adminModel";
// import User, { IUser } from "../models/userModel";
// import Review from "../models/reviewModel";
// import Course from "../models/courseModel";
// import Enrollment from "../models/enrollmentModel";
// import Question from "../models/questionModel";
// import Category from "../models/categoryModel";
// import Module from "../models/moduleModel";
// import Quiz from "../models/quizModel";
// import Submission from "../models/submissionModel";
// const router = express.Router();
// router.get("/", (req: Request, res: Response) => {
//     res.json({ message: "Welcome to LearnAPI" });
//     });
// router.get("/users", async (req: Request, res: Response) => {
//     try {
//         const users: IUser[] = await User.find();
//         if (users.length === 0) {
//             res.status(404).json({ Message: "Users not available" });
//         } else {
//             res.json({ data: users });
//         }
//         } catch (error) {
//         console.error("Error fetching data from the database", error);
//         res.status(500).json({ Message: "Internal Server Error" });
//     }
// });
// router.get("/users/:userId", async (req: Request, res: Response) => {
//     try {
//         const userId = req.params.adminId;
//         const user: IUser | null = await User.findById(userId);
//         if (!user) {
//         res.status(404).json({ Message: "User not found" });
//         } else {
//         res.json({ data: user });
//         }
//     } catch (error) {
//         console.error("Error fetching data from the database", error);
//         res.status(500).json({ Message: "Internal Server Error" });
//     }
// });
// router.get("/admin", async (req: Request, res: Response) => {
//     try {
//         const admins: IAdmin[] = await Admin.find();
//         if (admins.length === 0) {
//             res.status(404).json({ Message: "Admins not available" });
//         } else {
//             res.json({ data: admins });
//         }
//         } catch (error) {
//         console.error("Error fetching data from the database", error);
//         res.status(500).json({ Message: "Internal Server Error" });
//     }
// });
// router.get("/admin/:adminId", async (req: Request, res: Response) => {
//     try {
//         const adminId = req.params.adminId;
//         const admin: IAdmin | null = await Admin.findById(adminId);
//         if (!admin) {
//         res.status(404).json({ Message: "Admin not found" });
//         } else {
//         res.json({ data: admin });
//         }
//     } catch (error) {
//         console.error("Error fetching data from the database", error);
//         res.status(500).json({ Message: "Internal Server Error" });
//     }
// });
// router.get("/courses", async (req: Request, res: Response) => {
//     try {
//         const courses = await Course.find();
//         return res.status(200).json(courses);
//     } catch (error) {
//         console.error("Error retrieving courses:", error);
//         return res.status(500).json({ message: "Error retrieving courses" });
//     }
// });
// router.get("/course/:courseId", async (req: Request, res: Response) => {
//     try {
//         const courseId = req.params.courseId;
//         const course = await Course.findById(courseId);
//         if (!course) {
//             return res.status(404).json({ message: "Course not found" });
//         }
//         return res.status(200).json(course);
//     } catch (error) {
//         console.error("Error retrieving course:", error);
//         return res.status(500).json({ message: "Error retrieving course" });
//     }
// });
// router.get("/categories", async (req: Request, res: Response) => {
//     try {
//         const categories = await Category.find();
//         return res.status(200).json(categories);
//     } catch (error) {
//         console.error("Error retrieving categories:", error);
//         return res.status(500).json({ message: "Error retrieving categories" });
//     }
// });
// router.get("/categories/:categoryId", async (req: Request, res: Response) => {
//     try {
//         const categoryId = req.params.categoryId;
//         const category = await Category.findById(categoryId);
//         if (!category) {
//             return res.status(404).json({ message: "Category not found" });
//         }
//         return res.status(200).json(category);
//     } catch (error) {
//         console.error("Error retrieving category:", error);
//         return res.status(500).json({ message: "Error retrieving category" });
//     }
// });
// router.get("/questions", async (req: Request, res: Response) => {
//     try {
//         const questions = await Question.find();
//         return res.status(200).json(questions);
//     } catch (error) {
//         console.error("Error retrieving questions:", error);
//         return res.status(500).json({ message: "Error retrieving questions" });
//     }
// });
// router.get("/questions/:questionId", async (req: Request, res: Response) => {
//     try {
//         const questionId = req.params.questionId;
//         const question = await Question.findById(questionId);
//         if (!question) {
//             return res.status(404).json({ message: "Question not found" });
//         }
//         return res.status(200).json(question);
//     } catch (error) {
//         console.error("Error retrieving question:", error);
//         return res.status(500).json({ message: "Error retrieving question" });
//     }
// });
// router.get("/quizzes", async (req: Request, res: Response) => {
//     try {
//         const quizzes = await Quiz.find();
//         return res.status(200).json(quizzes);
//     } catch (error) {
//         console.error("Error retrieving quizzes:", error);
//         return res.status(500).json({ message: "Error retrieving quizzes" });
//     }
// });
// router.get("/quizzes/:quizId", async (req: Request, res: Response) => {
//     try {
//         const quizId = req.params.quizId;
//         const quiz = await Quiz.findById(quizId);
//         if (!quiz) {
//             return res.status(404).json({ message: "Quiz not found" });
//         }
//         return res.status(200).json(quiz);
//     } catch (error) {
//         console.error("Error retrieving quiz:", error);
//         return res.status(500).json({ message: "Error retrieving quiz" });
//     }
// });
// router.get("/modules", async (req: Request, res: Response) => {
//     try {
//         const modules = await Module.find();
//         return res.status(200).json(modules);
//     } catch (error) {
//         console.error("Error retrieving modules:", error);
//         return res.status(500).json({ message: "Error retrieving modules" });
//     }
// });
// router.get("/modules/:moduleId", async (req: Request, res: Response) => {
//     try {
//         const moduleId = req.params.moduleId;
//         const module = await Module.findById(moduleId);
//         if (!module) {
//             return res.status(404).json({ message: "Module not found" });
//         }
//         return res.status(200).json(module);
//     } catch (error) {
//         console.error("Error retrieving module:", error);
//         return res.status(500).json({ message: "Error retrieving module" });
//     }
// });
// router.get("/enrollments", async (req: Request, res: Response) => {
//     try {
//         const enrollments = await Enrollment.find();
//         return res.status(200).json(enrollments);
//     } catch (error) {
//         console.error("Error retrieving enrollments:", error);
//         return res.status(500).json({ message: "Error retrieving enrollments" });
//     }
// });
// router.get("/enrollments/:enrollmentId", async (req: Request, res: Response) => {
//     try {
//         const enrollmentId = req.params.enrollmentId;
//         const enrollment = await Enrollment.findById(enrollmentId);
//         if (!enrollment) {
//             return res.status(404).json({ message: "Enrollment not found" });
//         }
//         return res.status(200).json(enrollment);
//     } catch (error) {
//         console.error("Error retrieving enrollment:", error);
//         return res.status(500).json({ message: "Error retrieving enrollment" });
//     }
// });
// router.get("/reviews", async (req: Request, res: Response) => {
//     try {
//         const reviews = await Review.find();
//         return res.status(200).json(reviews);
//     } catch (error) {
//         console.error("Error retrieving reviews:", error);
//         return res.status(500).json({ message: "Error retrieving reviews" });
//     }
// });
// router.get("/reviews/:reviewId", async (req: Request, res: Response) => {
//     try {
//         const reviewId = req.params.reviewId;
//         const review = await Review.findById(reviewId);
//         if (!review) {
//             return res.status(404).json({ message: "Review not found" });
//         }
//         return res.status(200).json(review);
//     } catch (error) {
//         console.error("Error retrieving review:", error);
//         return res.status(500).json({ message: "Error retrieving review" });
//     }
// });
// router.get("/submissions", async (req: Request, res: Response) => {
//     try {
//         const submissions = await Submission.find();
//         return res.status(200).json(submissions);
//     } catch (error) {
//         console.error("Error retrieving submissions:", error);
//         return res.status(500).json({ message: "Error retrieving submissions" });
//     }
// });
// router.get("/submissions/:submissionId", async (req: Request, res: Response) => {
//     try {
//         const submissionId = req.params.submissionId;
//         const submission = await Submission.findById(submissionId);
//         if (!submission) {
//             return res.status(404).json({ message: "Submission not found" });
//         }
//         return res.status(200).json(submission);
//     } catch (error) {
//         console.error("Error retrieving submission:", error);
//         return res.status(500).json({ message: "Error retrieving submission" });
//     }
// });
// export default router;
