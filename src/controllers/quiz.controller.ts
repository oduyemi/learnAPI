import { Request, Response } from "express";
import mongoose from "mongoose";
import Quiz from "../models/quiz.model";
import Question from "../models/question.model";
import Module from "../models/module.model";
import dbConnect from "../db";
import { AuthRequest } from "../middlewares/auth.middleware";


export const createQuiz = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    await dbConnect();
    const {module, title, passingScore, timeLimit, attempts, questions} = req.body;
    if (!module) {
      return res.status(400).json({
        success: false,
        message: "Module is required.",
      });
    }

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Quiz title is required.",
      });
    }

    if (
      passingScore === undefined ||
      passingScore === null
    ) {
      return res.status(400).json({
        success: false,
        message: "Passing score is required.",
      });
    }

    if (
      attempts === undefined ||
      attempts === null
    ) {
      return res.status(400).json({
        success: false,
        message: "Number of attempts is required.",
      });
    }

    if (!mongoose.isValidObjectId(module)) {
      return res.status(400).json({
        success: false,
        message: "Invalid module ID.",
      });
    }

    const existingModule = await Module.findById(module);
    if (!existingModule) {
      return res.status(404).json({
        success: false,
        message: "Module not found.",
      });
    }

    const numericPassingScore = Number(passingScore);
    if (
      !Number.isFinite(numericPassingScore) ||
      numericPassingScore < 0 ||
      numericPassingScore > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Passing score must be between 0 and 100.",
      });
    }

    const numericTimeLimit =
      timeLimit === undefined || timeLimit === null
        ? 30
        : Number(timeLimit);

    if (
      !Number.isFinite(numericTimeLimit) ||
      numericTimeLimit < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Time limit must be at least 1 minute.",
      });
    }

    const numericAttempts = Number(attempts);

    if (
      !Number.isInteger(numericAttempts) ||
      numericAttempts < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Attempts must be a whole number greater than 0.",
      });
    }

    let questionIds: mongoose.Types.ObjectId[] = [];

    if (questions !== undefined) {
      if (!Array.isArray(questions)) {
        return res.status(400).json({
          success: false,
          message: "Questions must be an array.",
        });
      }

      const uniqueQuestionIds = [...new Set(questions)];
      const invalidQuestionId = uniqueQuestionIds.find(
        (questionId) =>
          !mongoose.isValidObjectId(questionId)
      );

      if (invalidQuestionId) {
        return res.status(400).json({
          success: false,
          message: `Invalid question ID: ${invalidQuestionId}`,
        });
      }

      const existingQuestions = await Question.find({
        _id: {
          $in: uniqueQuestionIds,
        },
      });

      if (
        existingQuestions.length !==
        uniqueQuestionIds.length
      ) {
        return res.status(404).json({
          success: false,
          message: "One or more questions were not found.",
        });
      }

      if (existingQuestions.length > 0) {
        const moduleCourse = await Module.findById(module)
          .populate("cohort");

        /**
         * We cannot directly determine the course from the
         * module because the current Module model belongs
         * to a Cohort rather than a Course.
         *
         * Therefore we only validate question existence here.
         */
      }

      questionIds = uniqueQuestionIds.map(
        (questionId) =>
          new mongoose.Types.ObjectId(questionId)
      );
    }

    const existingQuiz = await Quiz.findOne({
      module,
    });

    if (existingQuiz) {
      return res.status(409).json({
        success: false,
        message: "A quiz already exists for this module.",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const quiz = await Quiz.create({
      module,
      title: title.trim().replace(/\s+/g, " "),
      passingScore: numericPassingScore,
      timeLimit: numericTimeLimit,
      attempts: numericAttempts,
      questions: questionIds,
      submissions: [],
      isPublished: false,
      createdBy: req.user._id,
    });

    await quiz.populate([
      {
        path: "module",
        select:
          "title desc weekNumber session cohort order releaseDate isPublished",
      },
      {
        path: "questions",
        select:
          "questionText options difficultyLevel category explanation points",
        populate: {
          path: "category",
          select: "title desc",
        },
      },
      {
        path: "createdBy",
        select: "fname lname email role",
      },
    ]);

    return res.status(201).json({
      success: true,
      message: "Quiz created successfully.",
      data: quiz,
    });
  } catch (error) {
    console.error("Create Quiz Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create quiz.",
    });
  }
};


export const getQuizzes = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    await dbConnect();
    const filter: Record<string, any> = {};
    if (req.user?.role === "student") {
      filter.isPublished = true;
    }

    const quizzes = await Quiz.find(filter)
      .populate({
        path: "module",
        select:
          "title desc weekNumber session cohort order releaseDate isPublished",
        populate: {
          path: "cohort",
          select:
            "title code startDate endDate status",
        },
      })
      .populate({
        path: "questions",
        select:
          "questionText options difficultyLevel category explanation points",
        populate: {
          path: "category",
          select: "title desc",
        },
      })
      .populate({
        path: "createdBy",
        select: "fname lname email role",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes,
    });
  } catch (error) {
    console.error("Get Quizzes Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch quizzes.",
    });
  }
};

export const getQuiz = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    await dbConnect();
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID.",
      });
    }

    const quiz = await Quiz.findById(id)
      .populate({
        path: "module",
        select:
          "title desc weekNumber session cohort order releaseDate isPublished",
        populate: {
          path: "cohort",
          select:
            "title code startDate endDate status",
        },
      })
      .populate({
        path: "questions",
        select:
          "questionText options difficultyLevel category explanation points",
        populate: {
          path: "category",
          select: "title desc",
        },
      })
      .populate({
        path: "createdBy",
        select: "fname lname email role",
      });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found.",
      });
    }

    if (
      req.user?.role === "student" &&
      !quiz.isPublished
    ) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    console.error("Get Quiz Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch quiz.",
    });
  }
};


export const getQuizzesByModule = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    await dbConnect();
    const { moduleId } = req.params;
    if (!mongoose.isValidObjectId(moduleId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid module ID.",
      });
    }

    const existingModule = await Module.findById(
      moduleId
    );
    if (!existingModule) {
      return res.status(404).json({
        success: false,
        message: "Module not found.",
      });
    }

    const filter: Record<string, any> = {
      module: moduleId,
    };
    if (req.user?.role === "student") {
      filter.isPublished = true;
    }

    const quizzes = await Quiz.find(filter)
      .populate({
        path: "questions",
        select:
          "questionText options difficultyLevel category explanation points",
        populate: {
          path: "category",
          select: "title desc",
        },
      })
      .populate({
        path: "createdBy",
        select: "fname lname email role",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes,
    });
  } catch (error) {
    console.error("Get Quizzes By Module Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch module quizzes.",
    });
  }
};

export const addQuestionsToQuiz = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    await dbConnect();
    const { id } = req.params;
    const { questions } = req.body;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID.",
      });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one question is required.",
      });
    }

    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found.",
      });
    }

    const uniqueQuestionIds = [...new Set(questions)];

    const invalidQuestionId =
      uniqueQuestionIds.find(
        (questionId) =>
          !mongoose.isValidObjectId(questionId)
      );

    if (invalidQuestionId) {
      return res.status(400).json({
        success: false,
        message: `Invalid question ID: ${invalidQuestionId}`,
      });
    }

    const existingQuestions = await Question.find({
      _id: {
        $in: uniqueQuestionIds,
      },
    });

    if (
      existingQuestions.length !==
      uniqueQuestionIds.length
    ) {
      return res.status(404).json({
        success: false,
        message: "One or more questions were not found.",
      });
    }

    const newQuestionIds = existingQuestions
      .filter(
        (question) =>
          !quiz.questions.some(
            (existingQuestionId) =>
              existingQuestionId.toString() ===
              question._id.toString()
          )
      )
      .map((question) => question._id);

    if (newQuestionIds.length === 0) {
      return res.status(409).json({
        success: false,
        message: "All selected questions are already in this quiz.",
      });
    }

    quiz.questions.push(...newQuestionIds);
    await quiz.save();
    await quiz.populate({
      path: "questions",
      select:
        "questionText options difficultyLevel category explanation points",
      populate: {
        path: "category",
        select: "title desc",
      },
    });
    return res.status(200).json({
      success: true,
      message: "Questions added to quiz successfully.",
      data: quiz,
    });
  } catch (error) {
    console.error("Add Questions To Quiz Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to add questions to quiz.",
    });
  }
};


export const removeQuestionFromQuiz = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    await dbConnect();
    const { id, questionId } = req.params;
    if (
      !mongoose.isValidObjectId(id) ||
      !mongoose.isValidObjectId(questionId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz or question ID.",
      });
    }

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found.",
      });
    }

    const questionIndex = quiz.questions.findIndex(
      (question) =>
        question.toString() === questionId
    );

    if (questionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Question is not part of this quiz.",
      });
    }

    quiz.questions.splice(questionIndex, 1);
    await quiz.save();
    await quiz.populate({
      path: "questions",
      select:
        "questionText options difficultyLevel category explanation points",
      populate: {
        path: "category",
        select: "title desc",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Question removed from quiz successfully.",
      data: quiz,
    });
  } catch (error) {
    console.error("Remove Question From Quiz Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to remove question from quiz.",
    });
  }
};


export const updateQuiz = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    await dbConnect();

    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID.",
      });
    }

    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found.",
      });
    }

    const {
      module,
      title,
      passingScore,
      timeLimit,
      attempts,
    } = req.body;

    if (module !== undefined) {
      if (!mongoose.isValidObjectId(module)) {
        return res.status(400).json({
          success: false,
          message: "Invalid module ID.",
        });
      }

      const existingModule = await Module.findById(
        module
      );

      if (!existingModule) {
        return res.status(404).json({
          success: false,
          message: "Module not found.",
        });
      }

      const duplicateQuiz = await Quiz.findOne({
        module,
        _id: { $ne: id },
      });

      if (duplicateQuiz) {
        return res.status(409).json({
          success: false,
          message:
            "Another quiz already exists for this module.",
        });
      }

      quiz.module = module;
    }

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Quiz title cannot be empty.",
        });
      }

      quiz.title = title
        .trim()
        .replace(/\s+/g, " ");
    }

    if (passingScore !== undefined) {
      const numericPassingScore =
        Number(passingScore);

      if (
        !Number.isFinite(numericPassingScore) ||
        numericPassingScore < 0 ||
        numericPassingScore > 100
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Passing score must be between 0 and 100.",
        });
      }

      quiz.passingScore = numericPassingScore;
    }

    if (timeLimit !== undefined) {
      const numericTimeLimit = Number(timeLimit);

      if (
        !Number.isFinite(numericTimeLimit) ||
        numericTimeLimit < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Time limit must be at least 1 minute.",
        });
      }

      quiz.timeLimit = numericTimeLimit;
    }

    if (attempts !== undefined) {
      const numericAttempts = Number(attempts);

      if (
        !Number.isInteger(numericAttempts) ||
        numericAttempts < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Attempts must be a whole number greater than 0.",
        });
      }

      quiz.attempts = numericAttempts;
    }

    await quiz.save();

    await quiz.populate([
      {
        path: "module",
        select:
          "title desc weekNumber session cohort order releaseDate isPublished",
      },
      {
        path: "questions",
        select:
          "questionText options difficultyLevel category explanation points",
        populate: {
          path: "category",
          select: "title desc",
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "Quiz updated successfully.",
      data: quiz,
    });
  } catch (error) {
    console.error("Update Quiz Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update quiz.",
    });
  }
};

export const toggleQuizPublication = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    await dbConnect();

    const { id } = req.params;
    const { isPublished } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID.",
      });
    }

    if (typeof isPublished !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isPublished must be true or false.",
      });
    }

    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found.",
      });
    }

    if (
      isPublished &&
      quiz.questions.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A quiz must contain at least one question before it can be published.",
      });
    }

    quiz.isPublished = isPublished;

    await quiz.save();

    return res.status(200).json({
      success: true,
      message: isPublished
        ? "Quiz published successfully."
        : "Quiz unpublished successfully.",
      data: quiz,
    });
  } catch (error) {
    console.error("Toggle Quiz Publication Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update quiz publication status.",
    });
  }
};

export const deleteQuiz = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    await dbConnect();

    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID.",
      });
    }

    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found.",
      });
    }

    if (quiz.submissions.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "This quiz has submissions and cannot be deleted.",
      });
    }

    await Quiz.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Quiz deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Quiz Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete quiz.",
    });
  }
};