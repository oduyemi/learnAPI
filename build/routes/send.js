"use strict";
// import express, { Request, Response } from "express";
// import Review from "../models/reviewModel";
// import Course from "../models/courseModel";
// import Enrollment from "../models/enrollmentModel";
// import Question from "../models/questionModel";
// import Category from "../models/categoryModel";
// import Module from "../models/moduleModel";
// import Quiz from "../models/quizModel";
// import Submission from "../models/submissionModel";
// const router = express.Router();
// // 
// require("dotenv").config();
// router.post("/course", async (req: Request, res: Response) => {
//     try {
//         const { title, desc, instructor, duration, level, category, img } = req.body;
//         if (![title, desc, instructor, duration, level, category, img].every(field => field)) {
//             return res.status(400).json({ message: "All fields are required" });
//         }
//         const newCourse = new Course({ title, desc, instructor, duration, level, category, img });
//         await newCourse.save();
//         return res.status(201).json({ message: "Course created successfully" });
//     } catch (error) {
//         console.error("Error during course creation:", error);
//         return res.status(500).json({ message: "Error creating course" });
//     }
// });
// router.post("/category", async (req: Request, res: Response) => {
//     try {
//         const { title, desc } = req.body;
//         if (![title, desc].every(field => field)) {
//             return res.status(400).json({ message: "All fields are required" });
//         }
//         const newCategory = new Category({ title, desc });
//         await newCategory.save();
//         return res.status(201).json({ message: "Category created successfully" });
//     } catch (error) {
//         console.error("Error during category creation:", error);
//         return res.status(500).json({ message: "Error creating category" });
//     }
// });
// router.post("/review", async (req: Request, res: Response) => {
//     try {
//         const { userID, courseID, reviewComment, rating } = req.body;
//         if (![userID, courseID, reviewComment, rating].every(field => field)) {
//             return res.status(400).json({ message: "All fields are required" });
//         }
//         const newReview = new Review({ userID, courseID, reviewComment, rating });
//         await newReview.save();
//         return res.status(201).json({ message: "Review submitted successfully" });
//     } catch (error) {
//         console.error("Error during review submission:", error);
//         return res.status(500).json({ message: "Error submitting review" });
//     }
// });
// router.post("/quiz", async (req: Request, res: Response) => {
//     try {
//         const { questions } = req.body;
//         if (!questions || !Array.isArray(questions) || questions.length === 0) {
//             return res.status(400).json({ message: "At least one question is required" });
//         }
//         const newQuiz = new Quiz({ questions });
//         await newQuiz.save();
//         return res.status(201).json({ message: "Quiz created successfully" });
//     } catch (error) {
//         console.error("Error during quiz creation:", error);
//         return res.status(500).json({ message: "Error creating quiz" });
//     }
// });
// router.post("/question", async (req: Request, res: Response) => {
//     try {
//         const { questionText, options, correctAnswer, difficultyLevel, courseID, category } = req.body;
//         if (![questionText, options, correctAnswer, difficultyLevel, courseID, category].every(field => field)) {
//             return res.status(400).json({ message: "All fields are required" });
//         }
//         if (!Array.isArray(options) || options.length !== 4) {
//             return res.status(400).json({ message: "Exactly four options (A, B, C, D) are required" });
//         }
//         for (const option of options) {
//             if (typeof option !== 'string') {
//                 return res.status(400).json({ message: "Options must be strings" });
//             }
//         }
//         if (!options.includes(correctAnswer)) {
//             return res.status(400).json({ message: "Correct answer must match one of the provided options" });
//         }
//         const newQuestion = new Question({ questionText, options, correctAnswer, difficultyLevel, courseID, category });
//         await newQuestion.save();
//         return res.status(201).json({ message: "Question added successfully" });
//     } catch (error) {
//         console.error("Error adding question:", error);
//         return res.status(500).json({ message: "Error adding question" });
//     }
// });
// router.post("/module", async (req: Request, res: Response) => {
//     try {
//         const { title, desc, text, video, quiz, order } = req.body;
//         if (![title, desc, text, video, quiz, order].every(field => field)) {
//             return res.status(400).json({ message: "All fields are required" });
//         }
//         const newModule = new Module({ title, desc, text, video, quiz, order });
//         await newModule.save();
//         return res.status(201).json({ message: "Module created successfully" });
//     } catch (error) {
//         console.error("Error during module creation:", error);
//         return res.status(500).json({ message: "Error creating module" });
//     }
// });
// router.post("/enrollment", async (req: Request, res: Response) => {
//     try {
//         const { userID, courseID, status } = req.body;
//         if (![userID, courseID, status].every(field => field)) {
//             return res.status(400).json({ message: "All fields are required" });
//         }
//         const newEnrollment = new Enrollment({ userID, courseID, status });
//         await newEnrollment.save();
//         return res.status(201).json({ message: "Enrollment created successfully" });
//     } catch (error) {
//         console.error("Error during enrollment creation:", error);
//         return res.status(500).json({ message: "Error creating enrollment" });
//     }
// });
// router.post("/submission", async (req: Request, res: Response) => {
//     try {
//         const { userId, quizId, answers, score } = req.body;
//         if (![userId, quizId, answers].every(field => field)) {
//             return res.status(400).json({ message: "All fields are required" });
//         }
//         const newSubmission = new Submission({ userId, quizId, answers, score });
//         await newSubmission.save();
//         return res.status(201).json({ message: "Submission created successfully" });
//     } catch (error) {
//         console.error("Error during submission creation:", error);
//         return res.status(500).json({ message: "Error creating submission" });
//     }
// });
// export default router;
