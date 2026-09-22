import { Request, Response } from "express";
import mongoose from "mongoose";
import Progress from "../models/progress.model";
import User from "../models/user.model";
import Cohort from "../models/cohort.model";
import Module from "../models/module.model";
import dbConnect from "../db";



export const trackModuleProgress = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    await dbConnect();

    const { student, cohort, module } = req.body;

    if (!student || !cohort || !module) {
      return res.status(400).json({
        success: false,
        message: "Student, cohort and module are required.",
      });
    }

    if (
      !mongoose.isValidObjectId(student) ||
      !mongoose.isValidObjectId(cohort) ||
      !mongoose.isValidObjectId(module)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid student, cohort or module ID.",
      });
    }

    const existingStudent = await User.findOne({
      _id: student,
      role: "student",
    }).select("_id fname lname email cohort status");

    if (!existingStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    const existingCohort = await Cohort.findById(cohort);

    if (!existingCohort) {
      return res.status(404).json({
        success: false,
        message: "Cohort not found.",
      });
    }

    const existingModule = await Module.findById(module);

    if (!existingModule) {
      return res.status(404).json({
        success: false,
        message: "Module not found.",
      });
    }

    if (existingModule.cohort.toString() !== cohort.toString()) {
      return res.status(400).json({
        success: false,
        message: "Module does not belong to the specified cohort.",
      });
    }

    if (
      existingStudent.cohort &&
      existingStudent.cohort.toString() !== cohort.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "Student does not belong to this cohort.",
      });
    }

    const progress = await Progress.findOneAndUpdate(
      {
        student,
        module,
      },
      {
        $set: {
          cohort,
          lastAccessedAt: new Date(),
        },
        $setOnInsert: {
          isCompleted: false,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    await progress.populate([
      {
        path: "student",
        select: "fname lname email img status",
      },
      {
        path: "cohort",
        select: "title code status startDate endDate",
      },
      {
        path: "module",
        select:
          "title desc weekNumber session video text resources quizzes assignment order releaseDate isPublished",
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "Progress tracked successfully.",
      data: progress,
    });
  } catch (error: any) {
    console.error("Track Module Progress Error:", error);

    /**
     * Handle duplicate key race condition.
     */
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Progress record already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to track module progress.",
    });
  }
};


export const getStudentProgress = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    await dbConnect();

    const { studentId } = req.params;
    const { cohort } = req.query;

    if (!mongoose.isValidObjectId(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID.",
      });
    }

    if (cohort && !mongoose.isValidObjectId(cohort.toString())) {
      return res.status(400).json({
        success: false,
        message: "Invalid cohort ID.",
      });
    }

    const filter: Record<string, any> = {
      student: studentId,
    };

    if (cohort) {
      filter.cohort = cohort;
    }

    const progress = await Progress.find(filter)
      .populate({
        path: "cohort",
        select: "title code status startDate endDate",
      })
      .populate({
        path: "module",
        select:
          "title desc weekNumber session video text resources quizzes assignment order releaseDate isPublished",
      })
      .sort({
        "module.weekNumber": 1,
        "module.order": 1,
      });

    const totalModules = progress.length;

    const completedModules = progress.filter(
      (item) => item.isCompleted
    ).length;

    const completionPercentage =
      totalModules > 0
        ? Math.round((completedModules / totalModules) * 100)
        : 0;

    return res.status(200).json({
      success: true,
      summary: {
        totalModules,
        completedModules,
        remainingModules: totalModules - completedModules,
        completionPercentage,
      },
      data: progress,
    });
  } catch (error) {
    console.error("Get Student Progress Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch student progress.",
    });
  }
};


export const getProgress = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    await dbConnect();

    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid progress ID.",
      });
    }

    const progress = await Progress.findById(id).populate([
      {
        path: "student",
        select: "fname lname email img status cohort",
      },
      {
        path: "cohort",
        select: "title code status startDate endDate",
      },
      {
        path: "module",
        select:
          "title desc weekNumber session video text resources quizzes assignment order releaseDate isPublished",
      },
    ]);

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress record not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error("Get Progress Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch progress.",
    });
  }
};


export const getModuleProgress = async (
  req: Request,
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

    const module = await Module.findById(moduleId);

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found.",
      });
    }

    const progress = await Progress.find({
      module: moduleId,
    })
      .populate({
        path: "student",
        select: "fname lname email img status",
      })
      .populate({
        path: "cohort",
        select: "title code status",
      })
      .sort({
        isCompleted: 1,
        lastAccessedAt: -1,
      });

    const totalStudents = progress.length;

    const completedStudents = progress.filter(
      (item) => item.isCompleted
    ).length;

    const completionPercentage =
      totalStudents > 0
        ? Math.round((completedStudents / totalStudents) * 100)
        : 0;

    return res.status(200).json({
      success: true,
      summary: {
        totalStudents,
        completedStudents,
        incompleteStudents: totalStudents - completedStudents,
        completionPercentage,
      },
      data: progress,
    });
  } catch (error) {
    console.error("Get Module Progress Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch module progress.",
    });
  }
};


export const completeModule = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    await dbConnect();

    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid progress ID.",
      });
    }

    const progress = await Progress.findById(id);

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress record not found.",
      });
    }

    if (progress.isCompleted) {
      return res.status(200).json({
        success: true,
        message: "Module is already marked as completed.",
        data: progress,
      });
    }

    progress.isCompleted = true;
    progress.completedAt = new Date();
    progress.lastAccessedAt = new Date();

    await progress.save();

    await progress.populate([
      {
        path: "student",
        select: "fname lname email img status",
      },
      {
        path: "cohort",
        select: "title code status",
      },
      {
        path: "module",
        select:
          "title desc weekNumber session video text resources quizzes assignment order releaseDate isPublished",
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "Module marked as completed.",
      data: progress,
    });
  } catch (error) {
    console.error("Complete Module Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to complete module.",
    });
  }
};


export const updateQuizScore = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    await dbConnect();

    const { id } = req.params;
    const { score } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid progress ID.",
      });
    }

    const numericScore = Number(score);

    if (!Number.isFinite(numericScore) || numericScore < 0) {
      return res.status(400).json({
        success: false,
        message: "Quiz score must be a valid number greater than or equal to 0.",
      });
    }

    const progress = await Progress.findById(id);

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress record not found.",
      });
    }

    progress.quizScore = numericScore;
    progress.lastAccessedAt = new Date();

    await progress.save();

    return res.status(200).json({
      success: true,
      message: "Quiz score updated successfully.",
      data: progress,
    });
  } catch (error) {
    console.error("Update Quiz Score Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update quiz score.",
    });
  }
};


export const updateAssignmentScore = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    await dbConnect();

    const { id } = req.params;
    const { score } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid progress ID.",
      });
    }

    const numericScore = Number(score);

    if (!Number.isFinite(numericScore) || numericScore < 0) {
      return res.status(400).json({
        success: false,
        message:
          "Assignment score must be a valid number greater than or equal to 0.",
      });
    }

    const progress = await Progress.findById(id);

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress record not found.",
      });
    }

    progress.assignmentScore = numericScore;
    progress.lastAccessedAt = new Date();

    await progress.save();

    return res.status(200).json({
      success: true,
      message: "Assignment score updated successfully.",
      data: progress,
    });
  } catch (error) {
    console.error("Update Assignment Score Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update assignment score.",
    });
  }
};


export const getCohortProgress = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    await dbConnect();

    const { cohortId } = req.params;

    if (!mongoose.isValidObjectId(cohortId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cohort ID.",
      });
    }

    const cohort = await Cohort.findById(cohortId);

    if (!cohort) {
      return res.status(404).json({
        success: false,
        message: "Cohort not found.",
      });
    }

    const progress = await Progress.find({
      cohort: cohortId,
    })
      .populate({
        path: "student",
        select: "fname lname email img status",
      })
      .populate({
        path: "module",
        select:
          "title weekNumber session order releaseDate isPublished",
      })
      .sort({
        student: 1,
        "module.weekNumber": 1,
        "module.order": 1,
      });

    //  Overall statistics
    const totalProgressRecords = progress.length;

    const completedRecords = progress.filter(
      (item) => item.isCompleted
    ).length;

    const completionPercentage =
      totalProgressRecords > 0
        ? Math.round(
            (completedRecords / totalProgressRecords) * 100
          )
        : 0;

    //  Student-level summary
    const studentMap = new Map<
      string,
      {
        student: any;
        totalModules: number;
        completedModules: number;
      }
    >();

    for (const item of progress) {
      const studentId = item.student._id.toString();

      if (!studentMap.has(studentId)) {
        studentMap.set(studentId, {
          student: item.student,
          totalModules: 0,
          completedModules: 0,
        });
      }

      const summary = studentMap.get(studentId)!;

      summary.totalModules += 1;

      if (item.isCompleted) {
        summary.completedModules += 1;
      }
    }

    const students = Array.from(studentMap.values()).map((item) => ({
      student: item.student,
      totalModules: item.totalModules,
      completedModules: item.completedModules,
      remainingModules:
        item.totalModules - item.completedModules,
      completionPercentage:
        item.totalModules > 0
          ? Math.round(
              (item.completedModules / item.totalModules) * 100
            )
          : 0,
    }));

    return res.status(200).json({
      success: true,
      summary: {
        totalProgressRecords,
        completedRecords,
        incompleteRecords:
          totalProgressRecords - completedRecords,
        completionPercentage,
      },
      students,
      data: progress,
    });
  } catch (error) {
    console.error("Get Cohort Progress Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch cohort progress.",
    });
  }
};


export const resetProgress = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    await dbConnect();

    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid progress ID.",
      });
    }

    const progress = await Progress.findById(id);

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress record not found.",
      });
    }

    await Progress.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Progress reset successfully.",
    });
  } catch (error) {
    console.error("Reset Progress Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reset progress.",
    });
  }
};