"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCourse = exports.getCoursesByInstructor = exports.getCoursesByCategory = exports.getGeneralCourses = exports.getCourses = exports.createCourse = void 0;
const slugify_1 = __importDefault(require("slugify"));
const course_model_1 = __importDefault(require("../models/course.model"));
const category_model_1 = __importDefault(require("../models/category.model"));
const db_1 = __importDefault(require("../db"));
const validation_middleware_1 = require("../middlewares/validation.middleware");
const createCourse = async (req, res) => {
    try {
        await (0, db_1.default)();
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized.",
            });
        }
        const { title, desc, category, thumbnail, instructors, duration, hasCertificate, certificateTemplate, isGeneral } = req.body;
        const cleanedTitle = title?.trim().replace(/\s+/g, " ");
        const cleanedDesc = desc?.trim().replace(/\s+/g, " ");
        const cleanedDuration = duration?.trim();
        const cleanedThumbnail = thumbnail?.trim();
        if (!cleanedTitle || !cleanedDesc || !category || !cleanedThumbnail || !cleanedDuration) {
            return res.status(400).json({
                success: false,
                message: "Title, description, category, thumbnail and duration are required.",
            });
        }
        if (hasCertificate && !certificateTemplate) {
            return res.status(400).json({
                success: false,
                message: "Certificate template is required.",
            });
        }
        const existingCategory = await category_model_1.default.findById(category);
        if (!existingCategory) {
            return res.status(404).json({
                success: false,
                message: "Category not found.",
            });
        }
        let instructorIds = [];
        if (Array.isArray(instructors) && instructors.length > 0) {
            const instructorUsers = await (0, validation_middleware_1.validateUsersByRole)(instructors, "instructor");
            if (!instructorUsers) {
                return res.status(400).json({
                    success: false,
                    message: "One or more instructors are invalid.",
                });
            }
            instructorIds = instructorUsers.map(user => user._id);
        }
        const slug = (0, slugify_1.default)(cleanedTitle, {
            lower: true,
            strict: true,
            trim: true,
        });
        const existingTitle = await course_model_1.default.findOne({
            title: {
                $regex: new RegExp(`^${cleanedTitle}$`, "i"),
            },
        });
        if (existingTitle) {
            return res.status(409).json({
                success: false,
                message: "A course with this title already exists.",
            });
        }
        const existingSlug = await course_model_1.default.findOne({ slug });
        if (existingSlug) {
            return res.status(409).json({
                success: false,
                message: "A course with this slug already exists.",
            });
        }
        const course = await course_model_1.default.create({
            title: cleanedTitle,
            slug,
            desc: cleanedDesc,
            category,
            thumbnail: cleanedThumbnail,
            instructors: instructorIds,
            duration: cleanedDuration,
            hasCertificate: hasCertificate ?? false,
            certificateTemplate: hasCertificate && certificateTemplate
                ? certificateTemplate.trim()
                : undefined,
            isGeneral: isGeneral ?? false,
            createdBy: req.user._id,
        });
        await course.populate([
            {
                path: "category",
                select: "title slug",
            },
            {
                path: "instructors",
                select: "fname lname email img role",
            },
            {
                path: "createdBy",
                select: "fname lname email",
            },
        ]);
        return res.status(201).json({
            success: true,
            message: "Course created successfully.",
            data: course,
        });
    }
    catch (error) {
        console.error("Create Course Error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to create course.",
        });
    }
};
exports.createCourse = createCourse;
const getCourses = async (req, res) => {
    try {
        await (0, db_1.default)();
        const { page = "1", limit = "10", search, category, instructor, isGeneral } = req.query;
        const filter = {};
        if (search) {
            filter.$or = [
                {
                    title: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    desc: {
                        $regex: search,
                        $options: "i",
                    },
                },
            ];
        }
        if (category) {
            filter.category = category;
        }
        if (instructor) {
            filter.instructors = instructor;
        }
        if (isGeneral !== undefined) {
            filter.isGeneral = isGeneral === "true";
        }
        const currentPage = Number(page);
        const perPage = Number(limit);
        const [courses, total] = await Promise.all([
            course_model_1.default.find(filter)
                .populate("category", "title slug")
                .populate("instructors", "fname lname email img")
                .populate("createdBy", "fname lname")
                .sort({ createdAt: -1 })
                .skip((currentPage - 1) * perPage)
                .limit(perPage),
            course_model_1.default.countDocuments(filter),
        ]);
        return res.status(200).json({
            success: true,
            data: courses,
            pagination: {
                total,
                page: currentPage,
                limit: perPage,
                pages: Math.ceil(total / perPage),
            },
        });
    }
    catch (error) {
        console.error("Get Courses Error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to fetch courses.",
        });
    }
};
exports.getCourses = getCourses;
const getGeneralCourses = async (req, res) => {
    try {
        await (0, db_1.default)();
        const courses = await course_model_1.default.find({ isGeneral: true })
            .populate("category", "title slug")
            .populate("instructors", "fname lname email img")
            .sort({ title: 1 });
        return res.status(200).json({
            success: true,
            data: courses,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Unable to fetch courses.",
        });
    }
};
exports.getGeneralCourses = getGeneralCourses;
const getCoursesByCategory = async (req, res) => {
    try {
        await (0, db_1.default)();
        const { categoryId } = req.params;
        const courses = await course_model_1.default.find({
            category: categoryId,
        })
            .populate("category", "title slug")
            .populate("instructors", "fname lname email img")
            .sort({ title: 1 });
        return res.status(200).json({
            success: true,
            data: courses,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Unable to fetch category courses.",
        });
    }
};
exports.getCoursesByCategory = getCoursesByCategory;
const getCoursesByInstructor = async (req, res) => {
    try {
        await (0, db_1.default)();
        const { userId } = req.params;
        const courses = await course_model_1.default.find({
            instructors: userId,
        })
            .populate("category", "title slug")
            .populate("instructors", "fname lname email img")
            .sort({ title: 1 });
        return res.status(200).json({
            success: true,
            data: courses,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Unable to fetch instructor courses.",
        });
    }
};
exports.getCoursesByInstructor = getCoursesByInstructor;
const getCourse = async (req, res) => {
    try {
        await (0, db_1.default)();
        const course = await course_model_1.default.findById(req.params.id)
            .populate("category", "title slug")
            .populate("instructors", "fname lname email phone img role")
            .populate("createdBy", "fname lname email");
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found.",
            });
        }
        return res.status(200).json({
            success: true,
            data: course,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Unable to fetch course.",
        });
    }
};
exports.getCourse = getCourse;
