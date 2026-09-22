"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteQuiz = exports.toggleQuizPublication = exports.updateQuiz = exports.removeQuestionFromQuiz = exports.addQuestionsToQuiz = exports.getQuizzesByModule = exports.getQuiz = exports.getQuizzes = exports.createQuiz = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const quiz_model_1 = __importDefault(require("../models/quiz.model"));
const question_model_1 = __importDefault(require("../models/question.model"));
const module_model_1 = __importDefault(require("../models/module.model"));
const db_1 = __importDefault(require("../db"));
const createQuiz = async (req, res) => {
    try {
        await (0, db_1.default)();
        const { module, title, passingScore, timeLimit, attempts, questions } = req.body;
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
        if (passingScore === undefined ||
            passingScore === null) {
            return res.status(400).json({
                success: false,
                message: "Passing score is required.",
            });
        }
        if (attempts === undefined ||
            attempts === null) {
            return res.status(400).json({
                success: false,
                message: "Number of attempts is required.",
            });
        }
        if (!mongoose_1.default.isValidObjectId(module)) {
            return res.status(400).json({
                success: false,
                message: "Invalid module ID.",
            });
        }
        const existingModule = await module_model_1.default.findById(module);
        if (!existingModule) {
            return res.status(404).json({
                success: false,
                message: "Module not found.",
            });
        }
        const numericPassingScore = Number(passingScore);
        if (!Number.isFinite(numericPassingScore) ||
            numericPassingScore < 0 ||
            numericPassingScore > 100) {
            return res.status(400).json({
                success: false,
                message: "Passing score must be between 0 and 100.",
            });
        }
        const numericTimeLimit = timeLimit === undefined || timeLimit === null
            ? 30
            : Number(timeLimit);
        if (!Number.isFinite(numericTimeLimit) ||
            numericTimeLimit < 1) {
            return res.status(400).json({
                success: false,
                message: "Time limit must be at least 1 minute.",
            });
        }
        const numericAttempts = Number(attempts);
        if (!Number.isInteger(numericAttempts) ||
            numericAttempts < 1) {
            return res.status(400).json({
                success: false,
                message: "Attempts must be a whole number greater than 0.",
            });
        }
        let questionIds = [];
        if (questions !== undefined) {
            if (!Array.isArray(questions)) {
                return res.status(400).json({
                    success: false,
                    message: "Questions must be an array.",
                });
            }
            const uniqueQuestionIds = [...new Set(questions)];
            const invalidQuestionId = uniqueQuestionIds.find((questionId) => !mongoose_1.default.isValidObjectId(questionId));
            if (invalidQuestionId) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid question ID: ${invalidQuestionId}`,
                });
            }
            const existingQuestions = await question_model_1.default.find({
                _id: {
                    $in: uniqueQuestionIds,
                },
            });
            if (existingQuestions.length !==
                uniqueQuestionIds.length) {
                return res.status(404).json({
                    success: false,
                    message: "One or more questions were not found.",
                });
            }
            if (existingQuestions.length > 0) {
                const moduleCourse = await module_model_1.default.findById(module)
                    .populate("cohort");
                /**
                 * We cannot directly determine the course from the
                 * module because the current Module model belongs
                 * to a Cohort rather than a Course.
                 *
                 * Therefore we only validate question existence here.
                 */
            }
            questionIds = uniqueQuestionIds.map((questionId) => new mongoose_1.default.Types.ObjectId(questionId));
        }
        const existingQuiz = await quiz_model_1.default.findOne({
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
        const quiz = await quiz_model_1.default.create({
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
                select: "title desc weekNumber session cohort order releaseDate isPublished",
            },
            {
                path: "questions",
                select: "questionText options difficultyLevel category explanation points",
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
    }
    catch (error) {
        console.error("Create Quiz Error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to create quiz.",
        });
    }
};
exports.createQuiz = createQuiz;
const getQuizzes = async (req, res) => {
    try {
        await (0, db_1.default)();
        const filter = {};
        if (req.user?.role === "student") {
            filter.isPublished = true;
        }
        const quizzes = await quiz_model_1.default.find(filter)
            .populate({
            path: "module",
            select: "title desc weekNumber session cohort order releaseDate isPublished",
            populate: {
                path: "cohort",
                select: "title code startDate endDate status",
            },
        })
            .populate({
            path: "questions",
            select: "questionText options difficultyLevel category explanation points",
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
    }
    catch (error) {
        console.error("Get Quizzes Error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to fetch quizzes.",
        });
    }
};
exports.getQuizzes = getQuizzes;
const getQuiz = async (req, res) => {
    try {
        await (0, db_1.default)();
        const { id } = req.params;
        if (!mongoose_1.default.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid quiz ID.",
            });
        }
        const quiz = await quiz_model_1.default.findById(id)
            .populate({
            path: "module",
            select: "title desc weekNumber session cohort order releaseDate isPublished",
            populate: {
                path: "cohort",
                select: "title code startDate endDate status",
            },
        })
            .populate({
            path: "questions",
            select: "questionText options difficultyLevel category explanation points",
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
        if (req.user?.role === "student" &&
            !quiz.isPublished) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found.",
            });
        }
        return res.status(200).json({
            success: true,
            data: quiz,
        });
    }
    catch (error) {
        console.error("Get Quiz Error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to fetch quiz.",
        });
    }
};
exports.getQuiz = getQuiz;
const getQuizzesByModule = async (req, res) => {
    try {
        await (0, db_1.default)();
        const { moduleId } = req.params;
        if (!mongoose_1.default.isValidObjectId(moduleId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid module ID.",
            });
        }
        const existingModule = await module_model_1.default.findById(moduleId);
        if (!existingModule) {
            return res.status(404).json({
                success: false,
                message: "Module not found.",
            });
        }
        const filter = {
            module: moduleId,
        };
        if (req.user?.role === "student") {
            filter.isPublished = true;
        }
        const quizzes = await quiz_model_1.default.find(filter)
            .populate({
            path: "questions",
            select: "questionText options difficultyLevel category explanation points",
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
    }
    catch (error) {
        console.error("Get Quizzes By Module Error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to fetch module quizzes.",
        });
    }
};
exports.getQuizzesByModule = getQuizzesByModule;
const addQuestionsToQuiz = async (req, res) => {
    try {
        await (0, db_1.default)();
        const { id } = req.params;
        const { questions } = req.body;
        if (!mongoose_1.default.isValidObjectId(id)) {
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
        const quiz = await quiz_model_1.default.findById(id);
        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found.",
            });
        }
        const uniqueQuestionIds = [...new Set(questions)];
        const invalidQuestionId = uniqueQuestionIds.find((questionId) => !mongoose_1.default.isValidObjectId(questionId));
        if (invalidQuestionId) {
            return res.status(400).json({
                success: false,
                message: `Invalid question ID: ${invalidQuestionId}`,
            });
        }
        const existingQuestions = await question_model_1.default.find({
            _id: {
                $in: uniqueQuestionIds,
            },
        });
        if (existingQuestions.length !==
            uniqueQuestionIds.length) {
            return res.status(404).json({
                success: false,
                message: "One or more questions were not found.",
            });
        }
        const newQuestionIds = existingQuestions
            .filter((question) => !quiz.questions.some((existingQuestionId) => existingQuestionId.toString() ===
            question._id.toString()))
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
            select: "questionText options difficultyLevel category explanation points",
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
    }
    catch (error) {
        console.error("Add Questions To Quiz Error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to add questions to quiz.",
        });
    }
};
exports.addQuestionsToQuiz = addQuestionsToQuiz;
const removeQuestionFromQuiz = async (req, res) => {
    try {
        await (0, db_1.default)();
        const { id, questionId } = req.params;
        if (!mongoose_1.default.isValidObjectId(id) ||
            !mongoose_1.default.isValidObjectId(questionId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid quiz or question ID.",
            });
        }
        const quiz = await quiz_model_1.default.findById(id);
        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found.",
            });
        }
        const questionIndex = quiz.questions.findIndex((question) => question.toString() === questionId);
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
            select: "questionText options difficultyLevel category explanation points",
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
    }
    catch (error) {
        console.error("Remove Question From Quiz Error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to remove question from quiz.",
        });
    }
};
exports.removeQuestionFromQuiz = removeQuestionFromQuiz;
const updateQuiz = async (req, res) => {
    try {
        await (0, db_1.default)();
        const { id } = req.params;
        if (!mongoose_1.default.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid quiz ID.",
            });
        }
        const quiz = await quiz_model_1.default.findById(id);
        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found.",
            });
        }
        const { module, title, passingScore, timeLimit, attempts, } = req.body;
        if (module !== undefined) {
            if (!mongoose_1.default.isValidObjectId(module)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid module ID.",
                });
            }
            const existingModule = await module_model_1.default.findById(module);
            if (!existingModule) {
                return res.status(404).json({
                    success: false,
                    message: "Module not found.",
                });
            }
            const duplicateQuiz = await quiz_model_1.default.findOne({
                module,
                _id: { $ne: id },
            });
            if (duplicateQuiz) {
                return res.status(409).json({
                    success: false,
                    message: "Another quiz already exists for this module.",
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
            const numericPassingScore = Number(passingScore);
            if (!Number.isFinite(numericPassingScore) ||
                numericPassingScore < 0 ||
                numericPassingScore > 100) {
                return res.status(400).json({
                    success: false,
                    message: "Passing score must be between 0 and 100.",
                });
            }
            quiz.passingScore = numericPassingScore;
        }
        if (timeLimit !== undefined) {
            const numericTimeLimit = Number(timeLimit);
            if (!Number.isFinite(numericTimeLimit) ||
                numericTimeLimit < 1) {
                return res.status(400).json({
                    success: false,
                    message: "Time limit must be at least 1 minute.",
                });
            }
            quiz.timeLimit = numericTimeLimit;
        }
        if (attempts !== undefined) {
            const numericAttempts = Number(attempts);
            if (!Number.isInteger(numericAttempts) ||
                numericAttempts < 1) {
                return res.status(400).json({
                    success: false,
                    message: "Attempts must be a whole number greater than 0.",
                });
            }
            quiz.attempts = numericAttempts;
        }
        await quiz.save();
        await quiz.populate([
            {
                path: "module",
                select: "title desc weekNumber session cohort order releaseDate isPublished",
            },
            {
                path: "questions",
                select: "questionText options difficultyLevel category explanation points",
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
    }
    catch (error) {
        console.error("Update Quiz Error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to update quiz.",
        });
    }
};
exports.updateQuiz = updateQuiz;
const toggleQuizPublication = async (req, res) => {
    try {
        await (0, db_1.default)();
        const { id } = req.params;
        const { isPublished } = req.body;
        if (!mongoose_1.default.isValidObjectId(id)) {
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
        const quiz = await quiz_model_1.default.findById(id);
        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found.",
            });
        }
        if (isPublished &&
            quiz.questions.length === 0) {
            return res.status(400).json({
                success: false,
                message: "A quiz must contain at least one question before it can be published.",
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
    }
    catch (error) {
        console.error("Toggle Quiz Publication Error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to update quiz publication status.",
        });
    }
};
exports.toggleQuizPublication = toggleQuizPublication;
const deleteQuiz = async (req, res) => {
    try {
        await (0, db_1.default)();
        const { id } = req.params;
        if (!mongoose_1.default.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid quiz ID.",
            });
        }
        const quiz = await quiz_model_1.default.findById(id);
        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found.",
            });
        }
        if (quiz.submissions.length > 0) {
            return res.status(409).json({
                success: false,
                message: "This quiz has submissions and cannot be deleted.",
            });
        }
        await quiz_model_1.default.findByIdAndDelete(id);
        return res.status(200).json({
            success: true,
            message: "Quiz deleted successfully.",
        });
    }
    catch (error) {
        console.error("Delete Quiz Error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to delete quiz.",
        });
    }
};
exports.deleteQuiz = deleteQuiz;
