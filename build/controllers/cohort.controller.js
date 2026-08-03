"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCohort = exports.updateCohortStatus = exports.updateCohort = exports.getCourseCohorts = exports.getCohort = exports.getActiveCohorts = exports.getCohorts = exports.createCohort = void 0;
const db_1 = __importDefault(require("../db"));
const cohort_model_1 = __importDefault(require("../models/cohort.model"));
const course_model_1 = __importDefault(require("../models/course.model"));
const module_model_1 = __importDefault(require("../models/module.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const createCohort = async (req, res) => {
    try {
        await (0, db_1.default)();
        const { courses, title, code, startDate, endDate, status } = req.body;
        if (!Array.isArray(courses) || courses.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one course is required.",
            });
        }
        if (!title || !code) {
            return res.status(400).json({
                success: false,
                message: "Cohort title and code are required.",
            });
        }
        const uniqueCourses = [...new Set(courses)];
        const existingCourses = await course_model_1.default.find({
            _id: { $in: uniqueCourses },
        });
        if (existingCourses.length !== uniqueCourses.length) {
            return res.status(404).json({
                success: false,
                message: "One or more selected courses do not exist.",
            });
        }
        const existingCode = await cohort_model_1.default.findOne({
            code: code.trim().toUpperCase(),
        });
        if (existingCode) {
            return res.status(409).json({
                success: false,
                message: "A cohort with this code already exists.",
            });
        }
        const cohort = await cohort_model_1.default.create({
            courses: uniqueCourses,
            title: title.trim().replace(/\s+/g, " "),
            code: code.trim().replace(/\s+/g, "").toUpperCase(),
            startDate,
            endDate,
            status: status ?? "not_started",
        });
        await cohort.populate("courses");
        return res.status(201).json({
            success: true,
            message: "Cohort created successfully.",
            data: cohort,
        });
    }
    catch (error) {
        console.error("Create Cohort Error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to create cohort.",
        });
    }
};
exports.createCohort = createCohort;
const getCohorts = async (req, res) => {
    try {
        await (0, db_1.default)();
        const { status, course } = req.query;
        const filter = {};
        if (status) {
            filter.status = status;
        }
        if (course) {
            filter.courses = course;
        }
        const cohorts = await cohort_model_1.default.find(filter)
            .populate("courses")
            .sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            count: cohorts.length,
            data: cohorts,
        });
    }
    catch (error) {
        console.error("Get Cohorts Error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to retrieve cohorts.",
        });
    }
};
exports.getCohorts = getCohorts;
const getActiveCohorts = async (req, res) => {
    try {
        await (0, db_1.default)();
        const cohorts = await cohort_model_1.default.find({
            status: "in_progress",
        })
            .populate("courses")
            .sort({
            startDate: 1,
        });
        return res.status(200).json({
            success: true,
            count: cohorts.length,
            data: cohorts,
        });
    }
    catch (error) {
        console.error("Get Active Cohorts Error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to retrieve active cohorts.",
        });
    }
};
exports.getActiveCohorts = getActiveCohorts;
const getCohort = async (req, res) => {
    try {
        await (0, db_1.default)();
        const { id } = req.params;
        const cohort = await cohort_model_1.default.findById(id)
            .populate("courses");
        if (!cohort) {
            return res.status(404).json({
                success: false,
                message: "Cohort not found.",
            });
        }
        return res.status(200).json({
            success: true,
            data: cohort,
        });
    }
    catch (error) {
        console.error("Get Cohort Error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to retrieve cohort.",
        });
    }
};
exports.getCohort = getCohort;
const getCourseCohorts = async (req, res) => {
    try {
        await (0, db_1.default)();
        const { courseId } = req.params;
        const cohorts = await cohort_model_1.default.find({
            courses: courseId,
        })
            .populate("courses")
            .sort({
            startDate: -1,
        });
        return res.status(200).json({
            success: true,
            count: cohorts.length,
            data: cohorts,
        });
    }
    catch (error) {
        console.error("Get Course Cohorts Error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to retrieve cohorts.",
        });
    }
};
exports.getCourseCohorts = getCourseCohorts;
const updateCohort = async (req, res) => {
    try {
        await (0, db_1.default)();
        const { id } = req.params;
        const { courses, title, code, startDate, endDate, status } = req.body;
        const cohort = await cohort_model_1.default.findById(id);
        if (!cohort) {
            return res.status(404).json({
                success: false,
                message: "Cohort not found.",
            });
        }
        if (courses) {
            return res.status(400).json({
                success: false,
                message: "Courses cannot be changed after a cohort has been created.",
            });
        }
        if (code && code !== cohort.code) {
            const existing = await cohort_model_1.default.findOne({
                code: code.trim().replace(/\s+/g, "").toUpperCase(),
                _id: { $ne: cohort._id },
            });
            if (existing) {
                return res.status(409).json({
                    success: false,
                    message: "A cohort with this code already exists.",
                });
            }
            cohort.code = code
                .trim()
                .replace(/\s+/g, "")
                .toUpperCase();
        }
        if (title !== undefined) {
            cohort.title = title.trim().replace(/\s+/g, " ");
        }
        if (startDate !== undefined) {
            cohort.startDate = startDate;
        }
        if (endDate !== undefined) {
            cohort.endDate = endDate;
        }
        if (status !== undefined) {
            cohort.status = status;
        }
        await cohort.save();
        await cohort.populate("courses");
        return res.status(200).json({
            success: true,
            message: "Cohort updated successfully.",
            data: cohort,
        });
    }
    catch (error) {
        console.error("Update Cohort Error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to update cohort.",
        });
    }
};
exports.updateCohort = updateCohort;
const updateCohortStatus = async (req, res) => {
    try {
        await (0, db_1.default)();
        const { id } = req.params;
        const { status } = req.body;
        const allowedStatuses = ["not_started", "in_progress", "ended", "suspended"];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid cohort status.",
            });
        }
        const cohort = await cohort_model_1.default.findById(id);
        if (!cohort) {
            return res.status(404).json({
                success: false,
                message: "Cohort not found.",
            });
        }
        cohort.status = status;
        await cohort.save();
        return res.status(200).json({
            success: true,
            message: "Cohort status updated successfully.",
            data: cohort,
        });
    }
    catch (error) {
        console.error("Update Cohort Status Error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to update cohort status.",
        });
    }
};
exports.updateCohortStatus = updateCohortStatus;
const deleteCohort = async (req, res) => {
    try {
        await (0, db_1.default)();
        const { id } = req.params;
        const cohort = await cohort_model_1.default.findById(id);
        if (!cohort) {
            return res.status(404).json({
                success: false,
                message: "Cohort not found.",
            });
        }
        const studentCount = await user_model_1.default.countDocuments({
            cohort: id,
            role: "student",
        });
        if (studentCount > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete a cohort that still has students.",
            });
        }
        const moduleCount = await module_model_1.default.countDocuments({
            cohort: id,
        });
        if (moduleCount > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete a cohort that still has modules.",
            });
        }
        await cohort_model_1.default.findByIdAndDelete(id);
        return res.status(200).json({
            success: true,
            message: "Cohort deleted successfully.",
        });
    }
    catch (error) {
        console.error("Delete Cohort Error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to delete cohort.",
        });
    }
};
exports.deleteCohort = deleteCohort;
