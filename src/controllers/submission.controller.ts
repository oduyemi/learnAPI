import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import mongoose from "mongoose";
import Submission from "../models/submission.model";
import Assignment from "../models/assignment.model";
import Quiz from "../models/quiz.model";
import { dbConnect } from "../db";



const getParamId = (
  value: string | string[] | undefined
): string | undefined => {
  return Array.isArray(value) ? value[0] : value;
};

const isValidObjectId = (id: string): boolean =>
  mongoose.Types.ObjectId.isValid(id);


const normalizeStringArray = (
  value: unknown
): string[] => {
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is string =>
        typeof item === "string" && item.trim().length > 0
    );
  }

  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }

  return [];
};


export const submitAssignment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    await dbConnect();
    const assignmentId = getParamId(
      req.params.assignmentId
    );

    const studentId = req.user?._id;
    if (!studentId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    if (
      !assignmentId ||
      !isValidObjectId(assignmentId)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid assignment ID.",
      });
      return;
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      res.status(404).json({
        success: false,
        message: "Assignment not found.",
      });
      return;
    }

    const existingSubmission =
      await Submission.findOne({
        student: studentId,
        assignment: assignment._id,
      });

    if (existingSubmission) {
      res.status(409).json({
        success: false,
        message:
          "You have already submitted this assignment.",
        submission: existingSubmission,
      });
      return;
    }

    const now = new Date();
    if (
      assignment.startDate &&
      now < assignment.startDate
    ) {
      res.status(403).json({
        success: false,
        message:
          "This assignment is not yet available for submission.",
        startDate: assignment.startDate,
      });
      return;
    }

    let status: "submitted" | "late" = "submitted";
    if (
      assignment.endDate &&
      now > assignment.endDate
    ) {
      status = "late";
    }

    const submission = normalizeStringArray(req.body.submission);
    const files = normalizeStringArray(req.body.files);
    if (
      submission.length === 0 &&
      files.length === 0
    ) {
      res.status(400).json({
        success: false,
        message:
          "Please provide a submission or at least one file.",
      });
      return;
    }

    const createdSubmission =
      await Submission.create({
        student: studentId,
        assignment: assignment._id,
        submission,
        files,
        status,
      });

    const populatedSubmission =
      await Submission.findById(
        createdSubmission._id
      )
        .populate(
          "student",
          "fname lname email"
        )
        .populate(
          "assignment",
          "title desc maxScore startDate endDate"
        )
        .populate(
          "gradedBy",
          "fname lname email"
        );

    res.status(201).json({
      success: true,
      message:
        status === "late"
          ? "Assignment submitted late."
          : "Assignment submitted successfully.",
      submission: populatedSubmission,
    });
  } catch (error: any) {
    console.error(
      "Submit assignment error:",
      error
    );

    if (error?.code === 11000) {
      res.status(409).json({
        success: false,
        message:
          "You have already submitted this assignment.",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message:
        "Failed to submit assignment.",
    });
  }
};


export const submitQuiz = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    await dbConnect();
    const quizId = getParamId(req.params.quizId);
    const studentId = req.user?._id;
    if (!studentId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    if (
      !quizId ||
      !isValidObjectId(quizId)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid quiz ID.",
      });
      return;
    }

    const quiz =
      await Quiz.findById(quizId).populate(
        "questions"
      );

    if (!quiz) {
      res.status(404).json({
        success: false,
        message: "Quiz not found.",
      });
      return;
    }

    if (!quiz.isPublished) {
      res.status(403).json({
        success: false,
        message:
          "This quiz is not currently published.",
      });
      return;
    }

    if (
      !Number.isInteger(quiz.attempts) ||
      quiz.attempts < 1
    ) {
      res.status(400).json({
        success: false,
        message:
          "This quiz has an invalid attempts configuration.",
      });
      return;
    }

    if (
      !quiz.questions ||
      quiz.questions.length === 0
    ) {
      res.status(400).json({
        success: false,
        message:
          "This quiz does not contain any questions.",
      });
      return;
    }

    const answers = req.body.answers;

    if (
      !Array.isArray(answers) ||
      answers.length === 0
    ) {
      res.status(400).json({
        success: false,
        message:
          "At least one quiz answer is required.",
      });
      return;
    }

    const previousAttempts =
      await Submission.countDocuments({
        student: studentId,
        quiz: quiz._id,
      });

    if (
      previousAttempts >= quiz.attempts
    ) {
      res.status(409).json({
        success: false,
        message:
          `You have reached the maximum number of attempts for this quiz (${quiz.attempts}).`,
      });
      return;
    }

    const attemptNumber = previousAttempts + 1;
    const questionMap = new Map<string, any>();
    quiz.questions.forEach(
      (question: any) => {
        questionMap.set(
          question._id.toString(),
          question
        );
      }
    );

    const submittedQuestionIds = new Set<string>();
    let correctAnswers = 0;
    const gradedAnswers: {
      question: mongoose.Types.ObjectId;
      selectedOption: number;
    }[] = [];

    for (const answer of answers) {
      if (
        !answer ||
        !answer.question ||
        typeof answer.selectedOption !==
          "number"
      ) {
        res.status(400).json({
          success: false,
          message:
            "Each answer must contain a question ID and selectedOption.",
        });
        return;
      }

      if (
        !isValidObjectId(answer.question)
      ) {
        res.status(400).json({
          success: false,
          message:
            `Invalid question ID: ${answer.question}`,
        });
        return;
      }

      const questionId = answer.question.toString();
      if (
        submittedQuestionIds.has(
          questionId
        )
      ) {
        res.status(400).json({
          success: false,
          message:
            `Question ${questionId} was submitted more than once.`,
        });
        return;
      }

      submittedQuestionIds.add(
        questionId
      );

      const question =
        questionMap.get(questionId);

      if (!question) {
        res.status(400).json({
          success: false,
          message:
            `Question ${questionId} does not belong to this quiz.`,
        });
        return;
      }

      const selectedOption =
        answer.selectedOption;

      if (
        !Number.isInteger(
          selectedOption
        ) ||
        selectedOption < 0 ||
        selectedOption >=
          question.options.length
      ) {
        res.status(400).json({
          success: false,
          message:
            `Invalid selected option for question ${questionId}.`,
        });
        return;
      }

      const isCorrect =
        question.options[
          selectedOption
        ]?.isCorrect === true;

      if (isCorrect) {
        correctAnswers++;
      }

      gradedAnswers.push({
        question: question._id,
        selectedOption,
      });
    }

    const totalQuestions =
      quiz.questions.length;

    const totalAnswered =
      gradedAnswers.length;

    const score =
      totalQuestions > 0
        ? Math.round(
            (correctAnswers /
              totalQuestions) *
              100
          )
        : 0;

    const passed = score >= quiz.passingScore;
    const createdSubmission =
      await Submission.create({
        student: studentId,
        quiz: quiz._id,
        attemptNumber,
        answers: gradedAnswers,
        files: [],
        score,
        status: "graded",
        gradedAt: new Date(),
      });

    await Quiz.findByIdAndUpdate(
      quiz._id,
      {
        $push: {
          submissions:
            createdSubmission._id,
        },
      }
    );

    const populatedSubmission =
      await Submission.findById(
        createdSubmission._id
      )
        .populate(
          "student",
          "fname lname email"
        )
        .populate(
          "quiz",
          "title passingScore timeLimit attempts"
        )
        .populate(
          "answers.question",
          "questionText"
        );

    res.status(201).json({
      success: true,

      message: passed
        ? "Quiz submitted successfully. You passed."
        : "Quiz submitted successfully.",

      result: {
        score,
        passingScore:
          quiz.passingScore,
        passed,
        correctAnswers,
        totalQuestions,
        totalAnswered,
        attemptNumber,
        attemptsAllowed:
          quiz.attempts,
        attemptsRemaining:
          Math.max(
            quiz.attempts -
              attemptNumber,
            0
          ),
      },

      submission:
        populatedSubmission,
    });
  } catch (error: any) {
    console.error(
      "Submit quiz error:",
      error
    );

    if (error?.code === 11000) {
      res.status(409).json({
        success: false,
        message:
          "This quiz attempt could not be created because another attempt was submitted at the same time. Please try again.",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message:
        "Failed to submit quiz.",
    });
  }
};

export const getMySubmissions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    await dbConnect();

    const studentId = req.user?._id;

    if (!studentId) {
      res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
      return;
    }

    const submissions =
      await Submission.find({
        student: studentId,
      })
        .populate(
          "assignment",
          "title desc maxScore startDate endDate"
        )
        .populate(
          "quiz",
          "title passingScore attempts"
        )
        .populate(
          "answers.question",
          "questionText"
        )
        .populate(
          "gradedBy",
          "fname lname email"
        )
        .sort({
          submittedAt: -1,
        });

    res.status(200).json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    console.error(
      "Get my submissions error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to retrieve your submissions.",
    });
  }
};


export const getMySubmission = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    await dbConnect();
    const id = getParamId(req.params.id);
    const studentId = req.user?._id;
    if (!studentId) {
      res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
      return;
    }

    if (
      !id ||
      !isValidObjectId(id)
    ) {
      res.status(400).json({
        success: false,
        message:
          "Invalid submission ID.",
      });
      return;
    }

    const submission =
      await Submission.findOne({
        _id: id,
        student: studentId,
      })
        .populate(
          "student",
          "fname lname email"
        )
        .populate(
          "assignment",
          "title desc maxScore startDate endDate"
        )
        .populate(
          "quiz",
          "title passingScore attempts"
        )
        .populate(
          "answers.question",
          "questionText"
        )
        .populate(
          "gradedBy",
          "fname lname email"
        );

    if (!submission) {
      res.status(404).json({
        success: false,
        message:
          "Submission not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      submission,
    });
  } catch (error) {
    console.error(
      "Get my submission error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to retrieve submission.",
    });
  }
};


export const getSubmissions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    await dbConnect();
    const {assignment, quiz, student, status} = req.query;
    const filter: Record<string, unknown> = {};
    if (assignment) {
      if (
        typeof assignment !==
          "string" ||
        !isValidObjectId(
          assignment
        )
      ) {
        res.status(400).json({
          success: false,
          message:
            "Invalid assignment ID.",
        });
        return;
      }

      filter.assignment = assignment;
    }

    if (quiz) {
      if (
        typeof quiz !==
          "string" ||
        !isValidObjectId(quiz)
      ) {
        res.status(400).json({
          success: false,
          message:
            "Invalid quiz ID.",
        });
        return;
      }

      filter.quiz = quiz;
    }

    if (student) {
      if (
        typeof student !==
          "string" ||
        !isValidObjectId(student)
      ) {
        res.status(400).json({
          success: false,
          message:
            "Invalid student ID.",
        });
        return;
      }

      filter.student = student;
    }

    if (status) {
      const allowedStatuses = [
        "draft",
        "submitted",
        "graded",
        "late",
      ];

      if (
        typeof status !==
          "string" ||
        !allowedStatuses.includes(
          status
        )
      ) {
        res.status(400).json({
          success: false,
          message:
            "Invalid submission status.",
        });
        return;
      }

      filter.status = status;
    }

    const submissions =
      await Submission.find(filter)
        .populate(
          "student",
          "fname lname email phone"
        )
        .populate(
          "assignment",
          "title desc maxScore startDate endDate"
        )
        .populate(
          "quiz",
          "title passingScore timeLimit attempts"
        )
        .populate(
          "answers.question",
          "questionText options"
        )
        .populate(
          "gradedBy",
          "fname lname email"
        )
        .sort({
          submittedAt: -1,
        });

    res.status(200).json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    console.error(
      "Get submissions error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to retrieve submissions.",
    });
  }
};

/**
 * ---------------------------------------------------------
 * GET SUBMISSION BY ID
 * ---------------------------------------------------------
 *
 * GET /submissions/:id
 *
 * Admin / Instructor / Mentor
 */
export const getSubmissionById =
  async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      await dbConnect();
      const id = getParamId(req.params.id);
      if (
        !id ||
        !isValidObjectId(id)
      ) {
        res.status(400).json({
          success: false,
          message:
            "Invalid submission ID.",
        });
        return;
      }

      const submission =await Submission.findById(id)
        .populate(
        "student",
        "fname lname email phone"
        )
        .populate(
        "assignment",
        "title desc maxScore startDate endDate"
        )
        .populate(
        "quiz",
        "title passingScore timeLimit attempts"
        )
        .populate(
        "answers.question",
        "questionText options"
        )
        .populate(
        "gradedBy",
        "fname lname email"
        );

          if (!submission) {
            res.status(404).json({
              success: false,
              message:
                "Submission not found.",
            });
            return;
          }
    
          res.status(200).json({
            success: true,
            submission,
          });
        } catch (error) {
          console.error(
            "Get submission error:",
            error
          );
    
          res.status(500).json({
            success: false,
            message:
              "Failed to retrieve submission.",
        });
    }
  };

/**
 * ---------------------------------------------------------
 * GRADE ASSIGNMENT SUBMISSION
 * ---------------------------------------------------------
 *
 * PATCH /submissions/:id/grade
 *
 * Body:
 *
 * {
 *   "score": 85,
 *   "feedback": "Good work."
 * }
 */
export const gradeSubmission = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    await dbConnect();

    const id = getParamId(req.params.id);
    const graderId = req.user?._id;
    if (!graderId) {
      res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
      return;
    }

    if (
      !id ||
      !isValidObjectId(id)
    ) {
      res.status(400).json({
        success: false,
        message:
          "Invalid submission ID.",
      });
      return;
    }

    const submission = await Submission.findById(id).populate("assignment");
    if (!submission) {
      res.status(404).json({
        success: false,
        message:
          "Submission not found.",
      });
      return;
    }

    if (!submission.assignment) {
      res.status(400).json({
        success: false,
        message:
          "Only assignment submissions can be manually graded.",
      });
      return;
    }

    const assignment = submission.assignment as any;
    const { score, feedback } = req.body;

    if (
      typeof score !== "number" ||
      Number.isNaN(score)
    ) {
      res.status(400).json({
        success: false,
        message:
          "A valid numeric score is required.",
      });
      return;
    }

    if (
      score < 0 ||
      score > assignment.maxScore
    ) {
      res.status(400).json({
        success: false,
        message:
          `Score must be between 0 and ${assignment.maxScore}.`,
      });
      return;
    }

    submission.score = score;

    submission.feedback =
      typeof feedback === "string"
        ? feedback.trim()
        : "";

    submission.status = "graded";

    submission.gradedBy =
      new mongoose.Types.ObjectId(
        graderId.toString()
      );

    submission.gradedAt =
      new Date();

    await submission.save();

    const populatedSubmission =
      await Submission.findById(
        submission._id
      )
        .populate(
          "student",
          "fname lname email"
        )
        .populate(
          "assignment",
          "title desc maxScore startDate endDate"
        )
        .populate(
          "gradedBy",
          "fname lname email"
        );

    res.status(200).json({
      success: true,
      message:
        "Submission graded successfully.",
      submission:
        populatedSubmission,
    });
  } catch (error) {
    console.error(
      "Grade submission error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to grade submission.",
    });
  }
};


export const updateSubmissionFeedback =
  async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      await dbConnect();
      const id = getParamId(req.params.id);
      const {feedback} = req.body;
      const graderId = req.user?._id;
      if (!graderId) {
        res.status(401).json({
          success: false,
          message:
            "Authentication required.",
        });
        return;
      }

      if (
        !id ||
        !isValidObjectId(id)
      ) {
        res.status(400).json({
          success: false,
          message:
            "Invalid submission ID.",
        });
        return;
      }

      if (
        typeof feedback !==
        "string"
      ) {
        res.status(400).json({
          success: false,
          message:
            "Feedback must be a string.",
        });
        return;
      }

      const submission =
        await Submission.findByIdAndUpdate(
          id,
          {
            feedback:
              feedback.trim(),

            gradedBy:
              graderId,

            gradedAt:
              new Date(),
          },
          {
            new: true,
            runValidators: true,
          }
        )
          .populate(
            "student",
            "fname lname email"
          )
          .populate(
            "assignment",
            "title desc maxScore"
          )
          .populate(
            "quiz",
            "title passingScore"
          )
          .populate(
            "gradedBy",
            "fname lname email"
          );

      if (!submission) {
        res.status(404).json({
          success: false,
          message:
            "Submission not found.",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message:
          "Submission feedback updated successfully.",
        submission,
      });
    } catch (error) {
      console.error(
        "Update feedback error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to update submission feedback.",
      });
    }
  };

/**
 * ---------------------------------------------------------
 * DELETE SUBMISSION
 * ---------------------------------------------------------
 *
 * DELETE /submissions/:id
 *
 * Admin only.
 */
export const deleteSubmission =
  async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      await dbConnect();
      const id = getParamId(req.params.id);
      if (
        !id ||
        !isValidObjectId(id)
      ) {
        res.status(400).json({
          success: false,
          message:
            "Invalid submission ID.",
        });
        return;
      }

      const submission =
        await Submission.findById(id);

      if (!submission) {
        res.status(404).json({
          success: false,
          message:
            "Submission not found.",
        });
        return;
      }

      if (submission.quiz) {
        await Quiz.findByIdAndUpdate(
          submission.quiz,
          {
            $pull: {
              submissions:
                submission._id,
            },
          }
        );
      }

      await Submission.findByIdAndDelete(id);
      res.status(200).json({
        success: true,
        message:
          "Submission deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete submission error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to delete submission.",
      });
    }
  };