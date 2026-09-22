import { Request, Response } from "express";
import mongoose from "mongoose";

import Question from "../models/question.model";
import Course from "../models/course.model";
import Category from "../models/category.model";
import dbConnect from "../db";

interface QuestionOption {
  option: string;
  isCorrect: boolean;
}

/**
 * CREATE QUESTION
 *
 * POST /questions
 *
 * Body:
 * {
 *   "questionText": "What is a variable?",
 *   "options": [
 *     {
 *       "option": "A named storage location",
 *       "isCorrect": true
 *     },
 *     {
 *       "option": "A database",
 *       "isCorrect": false
 *     },
 *     {
 *       "option": "A function",
 *       "isCorrect": false
 *     },
 *     {
 *       "option": "A loop",
 *       "isCorrect": false
 *     }
 *   ],
 *   "difficultyLevel": "easy",
 *   "course": "COURSE_ID",
 *   "category": "CATEGORY_ID",
 *   "explanation": "A variable is a named storage location...",
 *   "points": 1
 * }
 */
export const createQuestion = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    await dbConnect();

    const {
      questionText,
      options,
      difficultyLevel,
      course,
      category,
      explanation,
      points,
    } = req.body;

    /**
     * Basic validation
     */
    if (!questionText?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question text is required.",
      });
    }

    if (!Array.isArray(options)) {
      return res.status(400).json({
        success: false,
        message: "Options must be provided as an array.",
      });
    }

    /**
     * Exactly four options
     */
    if (options.length !== 4) {
      return res.status(400).json({
        success: false,
        message: "A question must contain exactly four options.",
      });
    }

    /**
     * Validate option structure
     */
    const invalidOption = options.find(
      (option: QuestionOption) =>
        !option ||
        typeof option.option !== "string" ||
        !option.option.trim() ||
        typeof option.isCorrect !== "boolean"
    );

    if (invalidOption) {
      return res.status(400).json({
        success: false,
        message:
          "Each option must contain a non-empty option value and an isCorrect boolean.",
      });
    }

    /**
     * Exactly one correct answer
     */
    const correctOptions = options.filter(
      (option: QuestionOption) => option.isCorrect
    );

    if (correctOptions.length !== 1) {
      return res.status(400).json({
        success: false,
        message: "A question must contain exactly one correct answer.",
      });
    }

    /**
     * Validate Course ID
     */
    if (!course || !mongoose.isValidObjectId(course)) {
      return res.status(400).json({
        success: false,
        message: "A valid course ID is required.",
      });
    }

    /**
     * Validate Category ID
     */
    if (!category || !mongoose.isValidObjectId(category)) {
      return res.status(400).json({
        success: false,
        message: "A valid category ID is required.",
      });
    }

    /**
     * Validate difficulty
     */
    const allowedDifficultyLevels = ["easy", "medium", "hard"];

    if (
      difficultyLevel &&
      !allowedDifficultyLevels.includes(difficultyLevel)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid difficulty level.",
      });
    }

    /**
     * Validate points
     */
    if (
      points !== undefined &&
      (!Number.isFinite(Number(points)) || Number(points) < 1)
    ) {
      return res.status(400).json({
        success: false,
        message: "Points must be a number greater than or equal to 1.",
      });
    }

    /**
     * Verify course exists
     */
    const existingCourse = await Course.findById(course);

    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    /**
     * Verify category exists
     */
    const existingCategory = await Category.findById(category);

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    /**
     * Normalize options
     */
    const cleanedOptions = options.map((option: QuestionOption) => ({
      option: option.option.trim(),
      isCorrect: option.isCorrect,
    }));

    /**
     * Create question
     */
    const question = await Question.create({
      questionText: questionText.trim(),
      options: cleanedOptions,
      difficultyLevel: difficultyLevel || "medium",
      course,
      category,
      explanation: explanation?.trim() || "",
      points: points ?? 1,
    });

    await question.populate([
      {
        path: "course",
        select: "title slug category",
      },
      {
        path: "category",
        select: "title desc",
      },
    ]);

    return res.status(201).json({
      success: true,
      message: "Question created successfully.",
      data: question,
    });
  } catch (error) {
    console.error("Create Question Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create question.",
    });
  }
};