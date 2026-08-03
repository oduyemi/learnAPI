"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.getCategory = exports.getCategories = exports.createCategory = void 0;
const category_model_1 = __importDefault(require("../models/category.model"));
const course_model_1 = __importDefault(require("../models/course.model"));
const db_1 = __importDefault(require("../db"));
const createCategory = async (req, res) => {
    try {
        await (0, db_1.default)();
        const { title, desc } = req.body;
        const cleanedTitle = title?.trim().replace(/\s+/g, " ");
        const cleanedDesc = desc?.trim().replace(/\s+/g, " ");
        if (!cleanedTitle || !cleanedDesc) {
            return res.status(400).json({
                success: false,
                message: "Title and description are required.",
            });
        }
        const existing = await category_model_1.default.findOne({
            title: {
                $regex: new RegExp(`^${cleanedTitle}$`, "i"),
            },
        });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: "Category already exists.",
            });
        }
        const category = await category_model_1.default.create({
            title: cleanedTitle,
            desc: cleanedDesc,
        });
        return res.status(201).json({
            success: true,
            message: "Category created successfully.",
            data: category,
        });
    }
    catch (error) {
        console.error("Create Category:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to create category.",
        });
    }
};
exports.createCategory = createCategory;
const getCategories = async (req, res) => {
    try {
        await (0, db_1.default)();
        const categories = await category_model_1.default.find().sort({
            title: 1,
        });
        return res.status(200).json({
            success: true,
            count: categories.length,
            data: categories,
        });
    }
    catch (error) {
        console.error("Get Categories:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to fetch categories.",
        });
    }
};
exports.getCategories = getCategories;
const getCategory = async (req, res) => {
    try {
        await (0, db_1.default)();
        const category = await category_model_1.default.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found.",
            });
        }
        const courses = await course_model_1.default.find({
            category: category._id,
        })
            .select("title slug thumbnail duration")
            .sort({ title: 1 });
        return res.status(200).json({
            success: true,
            data: {
                ...category.toObject(),
                courses,
            },
        });
    }
    catch (error) {
        console.error("Get Category:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to fetch category.",
        });
    }
};
exports.getCategory = getCategory;
const updateCategory = async (req, res) => {
    try {
        await (0, db_1.default)();
        const category = await category_model_1.default.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found.",
            });
        }
        const { title, desc } = req.body;
        if (title !== undefined) {
            const cleanedTitle = title.trim().replace(/\s+/g, " ");
            const existing = await category_model_1.default.findOne({
                _id: { $ne: category._id },
                title: {
                    $regex: new RegExp(`^${cleanedTitle}$`, "i"),
                },
            });
            if (existing) {
                return res.status(409).json({
                    success: false,
                    message: "Another category already uses this title.",
                });
            }
            category.title = cleanedTitle;
        }
        if (desc !== undefined) {
            category.desc = desc.trim().replace(/\s+/g, " ");
        }
        await category.save();
        return res.status(200).json({
            success: true,
            message: "Category updated successfully.",
            data: category,
        });
    }
    catch (error) {
        console.error("Update Category:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to update category.",
        });
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res) => {
    try {
        await (0, db_1.default)();
        const category = await category_model_1.default.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found.",
            });
        }
        const courses = await course_model_1.default.countDocuments({
            category: category._id,
        });
        if (courses > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete a category that contains courses.",
            });
        }
        await category.deleteOne();
        return res.status(200).json({
            success: true,
            message: "Category deleted successfully.",
        });
    }
    catch (error) {
        console.error("Delete Category:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to delete category.",
        });
    }
};
exports.deleteCategory = deleteCategory;
