import { Request, Response } from "express";
import dbConnect from "../db";
import Cohort from "../models/cohort.model";
import Course from "../models/course.model";
import Module from "../models/module.model";
import User from "../models/user.model";


export const createCohort = async (req: Request, res: Response): Promise<Response> => {
  try {
    await dbConnect();
    const {courses, title, code, startDate, endDate, status} = req.body;
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
    const existingCourses = await Course.find({
        _id: { $in: uniqueCourses },
      });
      
      if (existingCourses.length !== uniqueCourses.length) {
        return res.status(404).json({
          success: false,
          message: "One or more selected courses do not exist.",
        });
    }

    const existingCode = await Cohort.findOne({
      code: code.trim().toUpperCase(),
    });
    if (existingCode) {
      return res.status(409).json({
        success: false,
        message: "A cohort with this code already exists.",
      });
    }

    const cohort = await Cohort.create({
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
  } catch (error) {
    console.error("Create Cohort Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create cohort.",
    });
  }
};


export const getCohorts = async (req: Request, res: Response): Promise<Response> => {
  try {
    await dbConnect();
    const { status, course } = req.query;
    const filter: any = {};
    if (status) {
      filter.status = status;
    }

    if (course) {
      filter.courses = course;
    }

    const cohorts = await Cohort.find(filter)
      .populate("courses")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: cohorts.length,
      data: cohorts,
    });
  } catch (error) {
    console.error("Get Cohorts Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve cohorts.",
    });
  }
};


export const getActiveCohorts = async (req: Request, res: Response): Promise<Response> => {
  try {
    await dbConnect();
    const cohorts = await Cohort.find({
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
  } catch (error) {
    console.error("Get Active Cohorts Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve active cohorts.",
    });
  }
};


export const getCohort = async (req: Request, res: Response): Promise<Response> => {
  try {
    await dbConnect();
    const { id } = req.params;
    const cohort = await Cohort.findById(id)
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
  } catch (error) {
    console.error("Get Cohort Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve cohort.",
    });
  }
};


export const getCourseCohorts = async (req: Request, res: Response): Promise<Response> => {
  try {
    await dbConnect();
    const { courseId } = req.params;
    const cohorts = await Cohort.find({
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
  } catch (error) {
    console.error("Get Course Cohorts Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve cohorts.",
    });
  }
};


export const updateCohort = async (req: Request, res: Response): Promise<Response> => {
  try {
    await dbConnect();
    const { id } = req.params;
    const {courses, title, code, startDate, endDate, status} = req.body;
    const cohort = await Cohort.findById(id);
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
      const existing = await Cohort.findOne({
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
  } catch (error) {
    console.error("Update Cohort Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update cohort.",
    });
  }
};


export const updateCohortStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    await dbConnect();
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatuses = ["not_started", "in_progress", "ended", "suspended"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cohort status.",
      });
    }

    const cohort = await Cohort.findById(id);
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
  } catch (error) {
    console.error("Update Cohort Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update cohort status.",
    });
  }
};


export const deleteCohort = async (req: Request, res: Response): Promise<Response> => {
  try {
    await dbConnect();
    const { id } = req.params;
    const cohort = await Cohort.findById(id);
    if (!cohort) {
      return res.status(404).json({
        success: false,
        message: "Cohort not found.",
      });
    }

    const studentCount = await User.countDocuments({
      cohort: id,
      role: "student",
    });
    if (studentCount > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete a cohort that still has students.",
      });
    }

    const moduleCount = await Module.countDocuments({
      cohort: id,
    });

    if (moduleCount > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete a cohort that still has modules.",
      });
    }
    await Cohort.findByIdAndDelete(id);
    return res.status(200).json({
      success: true,
      message: "Cohort deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Cohort Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete cohort.",
    });
  }
};