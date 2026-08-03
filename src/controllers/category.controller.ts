import { Request, Response } from "express";
import Category from "../models/category.model";
import Course from "../models/course.model";
import dbConnect from "../db";

export const createCategory = async (req: Request, res: Response): Promise<Response> => {
  try {
    await dbConnect();
    const { title, desc } = req.body;
    const cleanedTitle = title?.trim().replace(/\s+/g, " ");
    const cleanedDesc = desc?.trim().replace(/\s+/g, " ");
    if (!cleanedTitle || !cleanedDesc) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required.",
      });
    }

    const existing = await Category.findOne({
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

    const category = await Category.create({
      title: cleanedTitle,
      desc: cleanedDesc,
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully.",
      data: category,
    });
  } catch (error) {
    console.error("Create Category:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create category.",
    });
  }
};


export const getCategories = async (req: Request, res: Response): Promise<Response> => {
    try {
      await dbConnect();
      const categories = await Category.find().sort({
        title: 1,
      });
  
      return res.status(200).json({
        success: true,
        count: categories.length,
        data: categories,
      });
    } catch (error) {
      console.error("Get Categories:", error);
  
      return res.status(500).json({
        success: false,
        message: "Unable to fetch categories.",
      });
    }
};

export const getCategory = async (req: Request, res: Response): Promise<Response> => {
    try {
      await dbConnect();
      const category = await Category.findById(req.params.id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found.",
        });
      }
  
      const courses = await Course.find({
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
    } catch (error) {
      console.error("Get Category:", error);
  
      return res.status(500).json({
        success: false,
        message: "Unable to fetch category.",
      });
    }
};


export const updateCategory = async (req: Request, res: Response): Promise<Response> => {
    try {
      await dbConnect();
      const category = await Category.findById(req.params.id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found.",
        });
      }
  
      const { title, desc } = req.body;
      if (title !== undefined) {
        const cleanedTitle = title.trim().replace(/\s+/g, " ");
  
        const existing = await Category.findOne({
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
    } catch (error) {
      console.error("Update Category:", error);
  
      return res.status(500).json({
        success: false,
        message: "Unable to update category.",
      });
    }
};


export const deleteCategory = async (req: Request, res: Response): Promise<Response> => {
    try {
      await dbConnect();
      const category = await Category.findById(req.params.id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found.",
        });
      }
  
      const courses = await Course.countDocuments({
        category: category._id,
      });
  
      if (courses > 0) {
        return res.status(400).json({
          success: false,
          message:
            "Cannot delete a category that contains courses.",
        });
      }
  
      await category.deleteOne();
      return res.status(200).json({
        success: true,
        message: "Category deleted successfully.",
      });
    } catch (error) {
      console.error("Delete Category:", error);
  
      return res.status(500).json({
        success: false,
        message: "Unable to delete category.",
      });
    }
};