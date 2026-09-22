"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetProgress = exports.getCohortProgress = exports.updateAssignmentScore = exports.updateQuizScore = exports.completeModule = exports.getModuleProgress = exports.getProgress = exports.getStudentProgress = exports.trackModuleProgress = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const progress_model_1 = __importDefault(require("../models/progress.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const cohort_model_1 = __importDefault(require("../models/cohort.model"));
const module_model_1 = __importDefault(require("../models/module.model"));
const db_1 = __importDefault(require("../db"));
const trackModuleProgress = async (req, res) => {
    try {
        await (0, db_1.default)();
        const { student, cohort, module } = req.body;
        if (!student || !cohort || !module) {
            return res.status(400).json({
                success: false,
                message: "Student, cohort and module are required.",
            });
        }
        if (!mongoose_1.default.isValidObjectId(student) ||
            !mongoose_1.default.isValidObjectId(cohort) ||
            !mongoose_1.default.isValidObjectId(module)) {
            return res.status(400).json({
                success: false,
                message: "Invalid student, cohort or module ID.",
            });
        }
        const existingStudent = await user_model_1.default.findOne({
            _id: student,
            role: "student",
        }).select("_id fname lname email cohort status");
        if (!existingStudent) {
            return res.status(404).json({
                success: false,
                message: "Student not found.",
            });
        }
        const existingCohort = await cohort_model_1.default.findById(cohort);
        if (!existingCohort) {
            return res.status(404).json({
                success: false,
                message: "Cohort not found.",
            });
        }
        const existingModule = await module_model_1.default.findById(module);
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
        if (existingStudent.cohort &&
            existingStudent.cohort.toString() !== cohort.toString()) {
            return res.status(400).json({
                success: false,
                message: "Student does not belong to this cohort.",
            });
        }
        const progress = await progress_model_1.default.findOneAndUpdate({
            student,
            module,
        }, {
            $set: {
                cohort,
                lastAccessedAt: new Date(),
            },
            $setOnInsert: {
                isCompleted: false,
            },
        }, {
            new: true,
            upsert: true,
            runValidators: true,
        });
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
                select: "title desc weekNumber session video text resources quizzes assignment order releaseDate isPublished",
            },
        ]);
        return res.status(200).json({
            success: true,
            message: "Progress tracked successfully.",
            data: progress,
        });
    }
    catch (error) {
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
exports.trackModuleProgress = trackModuleProgress;
const getStudentProgress = async (req, res) => {
    try {
        await (0, db_1.default)();
        const { studentId } = req.params;
        const { cohort } = req.query;
        if (!mongoose_1.default.isValidObjectId(studentId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid student ID.",
            });
        }
        if (cohort && !mongoose_1.default.isValidObjectId(cohort.toString())) {
            return res.status(400).json({
                success: false,
                message: "Invalid cohort ID.",
            });
        }
        const filter = {
            student: studentId,
        };
        if (cohort) {
            filter.cohort = cohort;
        }
        const progress = await progress_model_1.default.find(filter)
            .populate({
            path: "cohort",
            select: "title code status startDate endDate",
        })
            .populate({
            path: "module",
            select: "title desc weekNumber session video text resources quizzes assignment order releaseDate isPublished",
        })
            .sort({
            "module.weekNumber": 1,
            "module.order": 1,
        });
        const totalModules = progress.length;
        const completedModules = progress.filter((item) => item.isCompleted).length;
        const completionPercentage = totalModules > 0
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
    }
    catch (error) {
        console.error("Get Student Progress Error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to fetch student progress.",
        });
    }
};
exports.getStudentProgress = getStudentProgress;
const getProgress = async (req, res) => {
    try {
        await (0, db_1.default)();
        const { id } = req.params;
        if (!mongoose_1.default.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid progress ID.",
            });
        }
        const progress = await progress_model_1.default.findById(id).populate([
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
                select: "title desc weekNumber session video text resources quizzes assignment order releaseDate isPublished",
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
    }
    catch (error) {
        console.error("Get Progress Error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to fetch progress.",
        });
    }
};
exports.getProgress = getProgress;
const getModuleProgress = async (req, res) => {
    try {
        await (0, db_1.default)();
        const { moduleId } = req.params;
        if (!mongoose_1.default.isValidObjectId(moduleId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid module ID.",
            });
        }
        const module = await module_model_1.default.findById(moduleId);
        if (!module) {
            return res.status(404).json({
                success: false,
                message: "Module not found.",
            });
        }
        const progress = await progress_model_1.default.find({
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
        const completedStudents = progress.filter((item) => item.isCompleted).length;
        const completionPercentage = totalStudents > 0
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
    }
    catch (error) {
        console.error("Get Module Progress Error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to fetch module progress.",
        });
    }
};
exports.getModuleProgress = getModuleProgress;
const completeModule = async (req, res) => {
    try {
        await (0, db_1.default)();
        const { id } = req.params;
        if (!mongoose_1.default.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid progress ID.",
            });
        }
        const progress = await progress_model_1.default.findById(id);
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
                select: "title desc weekNumber session video text resources quizzes assignment order releaseDate isPublished",
            },
        ]);
        return res.status(200).json({
            success: true,
            message: "Module marked as completed.",
            data: progress,
        });
    }
    catch (error) {
        console.error("Complete Module Error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to complete module.",
        });
    }
};
exports.completeModule = completeModule;
const updateQuizScore = async (req, res) => {
    try {
        await (0, db_1.default)();
        const { id } = req.params;
        const { score } = req.body;
        if (!mongoose_1.default.isValidObjectId(id)) {
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
        const progress = await progress_model_1.default.findById(id);
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
    }
    catch (error) {
        console.error("Update Quiz Score Error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to update quiz score.",
        });
    }
};
exports.updateQuizScore = updateQuizScore;
const updateAssignmentScore = async (req, res) => {
    try {
        await (0, db_1.default)();
        const { id } = req.params;
        const { score } = req.body;
        if (!mongoose_1.default.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid progress ID.",
            });
        }
        const numericScore = Number(score);
        if (!Number.isFinite(numericScore) || numericScore < 0) {
            return res.status(400).json({
                success: false,
                message: "Assignment score must be a valid number greater than or equal to 0.",
            });
        }
        const progress = await progress_model_1.default.findById(id);
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
    }
    catch (error) {
        console.error("Update Assignment Score Error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to update assignment score.",
        });
    }
};
exports.updateAssignmentScore = updateAssignmentScore;
const getCohortProgress = async (req, res) => {
    try {
        await (0, db_1.default)();
        const { cohortId } = req.params;
        if (!mongoose_1.default.isValidObjectId(cohortId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid cohort ID.",
            });
        }
        const cohort = await cohort_model_1.default.findById(cohortId);
        if (!cohort) {
            return res.status(404).json({
                success: false,
                message: "Cohort not found.",
            });
        }
        const progress = await progress_model_1.default.find({
            cohort: cohortId,
        })
            .populate({
            path: "student",
            select: "fname lname email img status",
        })
            .populate({
            path: "module",
            select: "title weekNumber session order releaseDate isPublished",
        })
            .sort({
            student: 1,
            "module.weekNumber": 1,
            "module.order": 1,
        });
        //  Overall statistics
        const totalProgressRecords = progress.length;
        const completedRecords = progress.filter((item) => item.isCompleted).length;
        const completionPercentage = totalProgressRecords > 0
            ? Math.round((completedRecords / totalProgressRecords) * 100)
            : 0;
        //  Student-level summary
        const studentMap = new Map();
        for (const item of progress) {
            const studentId = item.student._id.toString();
            if (!studentMap.has(studentId)) {
                studentMap.set(studentId, {
                    student: item.student,
                    totalModules: 0,
                    completedModules: 0,
                });
            }
            const summary = studentMap.get(studentId);
            summary.totalModules += 1;
            if (item.isCompleted) {
                summary.completedModules += 1;
            }
        }
        const students = Array.from(studentMap.values()).map((item) => ({
            student: item.student,
            totalModules: item.totalModules,
            completedModules: item.completedModules,
            remainingModules: item.totalModules - item.completedModules,
            completionPercentage: item.totalModules > 0
                ? Math.round((item.completedModules / item.totalModules) * 100)
                : 0,
        }));
        return res.status(200).json({
            success: true,
            summary: {
                totalProgressRecords,
                completedRecords,
                incompleteRecords: totalProgressRecords - completedRecords,
                completionPercentage,
            },
            students,
            data: progress,
        });
    }
    catch (error) {
        console.error("Get Cohort Progress Error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to fetch cohort progress.",
        });
    }
};
exports.getCohortProgress = getCohortProgress;
const resetProgress = async (req, res) => {
    try {
        await (0, db_1.default)();
        const { id } = req.params;
        if (!mongoose_1.default.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid progress ID.",
            });
        }
        const progress = await progress_model_1.default.findById(id);
        if (!progress) {
            return res.status(404).json({
                success: false,
                message: "Progress record not found.",
            });
        }
        await progress_model_1.default.findByIdAndDelete(id);
        return res.status(200).json({
            success: true,
            message: "Progress reset successfully.",
        });
    }
    catch (error) {
        console.error("Reset Progress Error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to reset progress.",
        });
    }
};
exports.resetProgress = resetProgress;
