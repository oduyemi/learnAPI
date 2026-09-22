import { Request, Response } from "express";
import mongoose from "mongoose";

import Assignment from "../models/assignment.model";
import Module from "../models/module.model";
import dbConnect from "../db";

/**
 * CREATE ASSIGNMENT
 *
 * POST /assignments
 *
 * Body:
 * {
 *   "module": "MODULE_ID",
 *   "title": "Build a REST API",
 *   "desc": "Create a REST API using Express and MongoDB.",
 *   "startDate": "2026-09-25T09:00:00.000Z",
 *   "endDate": "2026-10-02T23:59:59.000Z",
 *   "maxScore": 100,
 *   "attachments": [
 *     "https://example.com/instructions.pdf"
 *   ]
 * }
 */
export const createAssignment = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    await dbConnect();

    const {
      module,
      title,
      desc,
      startDate,
      endDate,
      maxScore,
      attachments,
    } = req.body;

    /**
     * Required fields
     */
    if (!module) {
      return res.status(400).json({
        success: false,
        message: "Module is required.",
      });
    }

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Assignment title is required.",
      });
    }

    if (!desc?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Assignment description is required.",
      });
    }

    /**
     * Validate module ID
     */
    if (!mongoose.isValidObjectId(module)) {
      return res.status(400).json({
        success: false,
        message: "Invalid module ID.",
      });
    }

    /**
     * Validate max score
     */
    const numericMaxScore = Number(maxScore);

    if (
      maxScore === undefined ||
      !Number.isFinite(numericMaxScore) ||
      numericMaxScore < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Max score must be a number greater than or equal to 1.",
      });
    }

    /**
     * Validate dates
     */
    let parsedStartDate: Date | undefined;
    let parsedEndDate: Date | undefined;

    if (startDate) {
      parsedStartDate = new Date(startDate);

      if (Number.isNaN(parsedStartDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid start date.",
        });
      }
    }

    if (endDate) {
      parsedEndDate = new Date(endDate);

      if (Number.isNaN(parsedEndDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid end date.",
        });
      }
    }

    /**
     * End date cannot be before start date
     */
    if (
      parsedStartDate &&
      parsedEndDate &&
      parsedEndDate < parsedStartDate
    ) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be before start date.",
      });
    }

    /**
     * Validate attachments
     */
    let cleanedAttachments: string[] = [];

    if (attachments !== undefined) {
      if (!Array.isArray(attachments)) {
        return res.status(400).json({
          success: false,
          message: "Attachments must be an array.",
        });
      }

      cleanedAttachments = attachments
        .filter(
          (attachment): attachment is string =>
            typeof attachment === "string"
        )
        .map((attachment) => attachment.trim())
        .filter(Boolean);
    }

    /**
     * Verify module exists
     */
    const existingModule = await Module.findById(module);

    if (!existingModule) {
      return res.status(404).json({
        success: false,
        message: "Module not found.",
      });
    }

    /**
     * Prevent multiple assignments from being accidentally
     * attached to the same module if that is not intended.
     *
     * Remove this check if you eventually want multiple
     * assignments per module.
     */
    const existingAssignment = await Assignment.findOne({
      module,
    });

    if (existingAssignment) {
      return res.status(409).json({
        success: false,
        message: "An assignment already exists for this module.",
      });
    }

    /**
     * Create assignment
     */
    const assignment = await Assignment.create({
      module,
      title: title.trim().replace(/\s+/g, " "),
      desc: desc.trim(),
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      maxScore: numericMaxScore,
      attachments: cleanedAttachments,
    });

    /**
     * Populate module information
     */
    await assignment.populate({
      path: "module",
      select: "title weekNumber session cohort order",
      populate: {
        path: "cohort",
        select: "title code status startDate endDate",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Assignment created successfully.",
      data: assignment,
    });
  } catch (error) {
    console.error("Create Assignment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create assignment.",
    });
  }
};

/**
 * GET ALL ASSIGNMENTS
 *
 * GET /assignments
 */
export const getAssignments = async (
  _req: Request,
  res: Response
): Promise<Response> => {
  try {
    await dbConnect();

    const assignments = await Assignment.find()
      .populate({
        path: "module",
        select: "title weekNumber session cohort order",
        populate: {
          path: "cohort",
          select: "title code status startDate endDate",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments,
    });
  } catch (error) {
    console.error("Get Assignments Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch assignments.",
    });
  }
};

/**
 * GET SINGLE ASSIGNMENT
 *
 * GET /assignments/:id
 */
export const getAssignment = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    await dbConnect();

    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment ID.",
      });
    }

    const assignment = await Assignment.findById(id).populate({
      path: "module",
      select: "title weekNumber session cohort order",
      populate: {
        path: "cohort",
        select: "title code status startDate endDate",
      },
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    console.error("Get Assignment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch assignment.",
    });
  }
};

/**
 * GET ASSIGNMENTS BY MODULE
 *
 * GET /assignments/module/:moduleId
 */
export const getAssignmentsByModule = async (
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

    const assignments = await Assignment.find({
      module: moduleId,
    })
      .populate({
        path: "module",
        select: "title weekNumber session cohort order",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments,
    });
  } catch (error) {
    console.error("Get Assignments By Module Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch module assignments.",
    });
  }
};

/**
 * UPDATE ASSIGNMENT
 *
 * PATCH /assignments/:id
 */
export const updateAssignment = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    await dbConnect();

    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment ID.",
      });
    }

    const assignment = await Assignment.findById(id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found.",
      });
    }

    const {
      module,
      title,
      desc,
      startDate,
      endDate,
      maxScore,
      attachments,
    } = req.body;

    /**
     * Validate module if being changed
     */
    if (module !== undefined) {
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

      /**
       * Check whether another assignment already belongs
       * to this module.
       */
      const duplicateAssignment = await Assignment.findOne({
        module,
        _id: { $ne: id },
      });

      if (duplicateAssignment) {
        return res.status(409).json({
          success: false,
          message: "An assignment already exists for this module.",
        });
      }

      assignment.module = module;
    }

    /**
     * Update title
     */
    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Assignment title cannot be empty.",
        });
      }

      assignment.title = title.trim().replace(/\s+/g, " ");
    }

    /**
     * Update description
     */
    if (desc !== undefined) {
      if (!desc.trim()) {
        return res.status(400).json({
          success: false,
          message: "Assignment description cannot be empty.",
        });
      }

      assignment.desc = desc.trim();
    }

    /**
     * Update start date
     */
    if (startDate !== undefined) {
      if (!startDate) {
        assignment.startDate = undefined;
      } else {
        const parsedStartDate = new Date(startDate);

        if (Number.isNaN(parsedStartDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid start date.",
          });
        }

        assignment.startDate = parsedStartDate;
      }
    }

    /**
     * Update end date
     */
    if (endDate !== undefined) {
      if (!endDate) {
        assignment.endDate = undefined;
      } else {
        const parsedEndDate = new Date(endDate);

        if (Number.isNaN(parsedEndDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid end date.",
          });
        }

        assignment.endDate = parsedEndDate;
      }
    }

    /**
     * Validate date relationship
     */
    if (
      assignment.startDate &&
      assignment.endDate &&
      assignment.endDate < assignment.startDate
    ) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be before start date.",
      });
    }

    /**
     * Update max score
     */
    if (maxScore !== undefined) {
      const numericMaxScore = Number(maxScore);

      if (
        !Number.isFinite(numericMaxScore) ||
        numericMaxScore < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "Max score must be a number greater than or equal to 1.",
        });
      }

      assignment.maxScore = numericMaxScore;
    }

    /**
     * Update attachments
     */
    if (attachments !== undefined) {
      if (!Array.isArray(attachments)) {
        return res.status(400).json({
          success: false,
          message: "Attachments must be an array.",
        });
      }

      assignment.attachments = attachments
        .filter(
          (attachment): attachment is string =>
            typeof attachment === "string"
        )
        .map((attachment) => attachment.trim())
        .filter(Boolean);
    }

    await assignment.save();

    await assignment.populate({
      path: "module",
      select: "title weekNumber session cohort order",
      populate: {
        path: "cohort",
        select: "title code status startDate endDate",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Assignment updated successfully.",
      data: assignment,
    });
  } catch (error) {
    console.error("Update Assignment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update assignment.",
    });
  }
};

/**
 * DELETE ASSIGNMENT
 *
 * DELETE /assignments/:id
 */
export const deleteAssignment = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    await dbConnect();

    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment ID.",
      });
    }

    const assignment = await Assignment.findById(id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found.",
      });
    }

    await Assignment.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Assignment deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Assignment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete assignment.",
    });
  }
};