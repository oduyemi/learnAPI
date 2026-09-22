import { Request, Response } from "express";
import mongoose from "mongoose";
import Module from "../models/module.model";
import Cohort from "../models/cohort.model";
import { AuthRequest } from "../middlewares/auth.middleware";
import dbConnect from "../db";

const getParamId = (
    value: string | string[] | undefined
  ): string | undefined => {
    return Array.isArray(value) ? value[0] : value;
  };

export const createModule = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    await dbConnect();

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const {
      cohort,
      title,
      desc,
      weekNumber,
      session,
      video,
      text,
      resources,
      quizzes,
      assignment,
      order,
      releaseDate,
      isPublished,
    } = req.body;

    const cleanedTitle = title?.trim().replace(/\s+/g, " ");
    const cleanedDesc = desc?.trim().replace(/\s+/g, " ");

    if (
      !cohort ||
      !cleanedTitle ||
      !cleanedDesc ||
      weekNumber === undefined ||
      !session ||
      order === undefined ||
      !releaseDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Cohort, title, description, week number, session, order and release date are required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(cohort)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cohort ID.",
      });
    }

    const existingCohort = await Cohort.findById(cohort);

    if (!existingCohort) {
      return res.status(404).json({
        success: false,
        message: "Cohort not found.",
      });
    }

    const parsedWeekNumber = Number(weekNumber);
    const parsedOrder = Number(order);

    if (
      !Number.isInteger(parsedWeekNumber) ||
      parsedWeekNumber < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Week number must be a positive integer.",
      });
    }

    if (!["a", "b", "c"].includes(session)) {
      return res.status(400).json({
        success: false,
        message: "Session must be a, b or c.",
      });
    }

    if (!Number.isInteger(parsedOrder) || parsedOrder < 1) {
      return res.status(400).json({
        success: false,
        message: "Order must be a positive integer.",
      });
    }

    if (
      !video &&
      !text &&
      (!Array.isArray(resources) || resources.length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A module must contain video, text or at least one resource.",
      });
    }

    const existingModule = await Module.findOne({
      cohort,
      weekNumber: parsedWeekNumber,
      session,
    });

    if (existingModule) {
      return res.status(409).json({
        success: false,
        message:
          `Session ${session.toUpperCase()} for week ${parsedWeekNumber} already exists for this cohort.`,
      });
    }

    const module = await Module.create({
      cohort,
      title: cleanedTitle,
      desc: cleanedDesc,
      weekNumber: parsedWeekNumber,
      session,
      video: video?.trim() || undefined,
      text: text?.trim() || undefined,
      resources: Array.isArray(resources) ? resources : [],
      quizzes: Array.isArray(quizzes) ? quizzes : [],
      assignment: assignment || undefined,
      order: parsedOrder,
      releaseDate: new Date(releaseDate),
      isPublished: isPublished ?? false,
      createdBy: req.user._id,
    });

    await module.populate([
      {
        path: "cohort",
        select: "title code status courses",
        populate: {
          path: "courses",
          select: "title slug",
        },
      },
      {
        path: "quizzes",
      },
      {
        path: "assignment",
      },
      {
        path: "createdBy",
        select: "fname lname email role",
      },
    ]);

    return res.status(201).json({
      success: true,
      message: "Module created successfully.",
      data: module,
    });
  } catch (error: any) {
    console.error("Create Module Error:", error);

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "A module already exists for this cohort, week and session.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create module.",
    });
  }
};

export const getModulesByCohort = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    await dbConnect();

    const cohortId = getParamId(req.params.cohortId);

    if (!cohortId || !mongoose.Types.ObjectId.isValid(cohortId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cohort ID.",
      });
    }

    const cohort = await Cohort.findById(cohortId).select(
      "title code status courses"
    );

    if (!cohort) {
      return res.status(404).json({
        success: false,
        message: "Cohort not found.",
      });
    }

    /**
     * Students should only see modules that:
     * 1. Are published
     * 2. Have reached their release date
     *
     * Admins, instructors and mentors can see all modules.
     */
    const filter: Record<string, any> = {
      cohort: cohortId,
    };

    if (req.user?.role === "student") {
      filter.isPublished = true;
      filter.releaseDate = {
        $lte: new Date(),
      };
    }

    const modules = await Module.find(filter)
      .populate({
        path: "quizzes",
        match:
          req.user?.role === "student"
            ? { isPublished: true }
            : undefined,
      })
      .populate({
        path: "assignment",
      })
      .populate({
        path: "createdBy",
        select: "fname lname email role",
      })
      .sort({
        weekNumber: 1,
        order: 1,
        session: 1,
      });

    return res.status(200).json({
      success: true,
      count: modules.length,
      cohort,
      data: modules,
    });
  } catch (error) {
    console.error(
      "Get Modules By Cohort Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch cohort modules.",
    });
  }
};


// ADMIN
export const getModules = async (
    _req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      await dbConnect();
  
      const modules = await Module.find()
        .populate({
          path: "cohort",
          select: "title code status courses",
          populate: {
            path: "courses",
            select: "title slug",
          },
        })
        .populate({
          path: "quizzes",
        })
        .populate({
          path: "assignment",
        })
        .populate({
          path: "createdBy",
          select: "fname lname email role",
        })
        .sort({
          weekNumber: 1,
          order: 1,
          session: 1,
        });
  
      return res.status(200).json({
        success: true,
        count: modules.length,
        data: modules,
      });
    } catch (error) {
      console.error("Get Modules Error:", error);
  
      return res.status(500).json({
        success: false,
        message: "Unable to fetch modules.",
      });
    }
  };

  export const getModule = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
        await dbConnect();
        const id = getParamId(req.params.id);
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid module ID.",
        });
      }
  
      const module = await Module.findById(id)
        .populate({
          path: "cohort",
          select: "title code status courses",
          populate: {
            path: "courses",
            select: "title slug thumbnail",
          },
        })
        .populate({
          path: "quizzes",
        })
        .populate({
          path: "assignment",
        })
        .populate({
          path: "createdBy",
          select: "fname lname email role",
        });
  
      if (!module) {
        return res.status(404).json({
          success: false,
          message: "Module not found.",
        });
      }
  
      return res.status(200).json({
        success: true,
        data: module,
      });
    } catch (error) {
      console.error("Get Module Error:", error);
  
      return res.status(500).json({
        success: false,
        message: "Unable to fetch module.",
      });
    }
  };

  export const updateModule = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
        await dbConnect();
    
        if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized.",
        });
        }
  
        const id = getParamId(req.params.id);
    
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
              success: false,
              message: "Invalid module ID.",
            });
          }
      
        const module = await Module.findById(id);
  
        if (!module) {
        return res.status(404).json({
            success: false,
            message: "Module not found.",
        });
        }
    
        const {
        title,
        desc,
        weekNumber,
        session,
        video,
        text,
        resources,
        quizzes,
        assignment,
        order,
        releaseDate,
        isPublished,
        } = req.body;
    
        if (title !== undefined) {
        const cleanedTitle = title.trim().replace(/\s+/g, " ");
    
        if (!cleanedTitle) {
            return res.status(400).json({
            success: false,
            message: "Title cannot be empty.",
            });
        }
    
        module.title = cleanedTitle;
        }
    
        if (desc !== undefined) {
        const cleanedDesc = desc.trim().replace(/\s+/g, " ");
    
        if (!cleanedDesc) {
            return res.status(400).json({
            success: false,
            message: "Description cannot be empty.",
            });
        }
    
        module.desc = cleanedDesc;
        }
    
        if (weekNumber !== undefined) {
        const parsedWeekNumber = Number(weekNumber);
    
        if (
            !Number.isInteger(parsedWeekNumber) ||
            parsedWeekNumber < 1
        ) {
            return res.status(400).json({
            success: false,
            message: "Week number must be a positive integer.",
            });
        }
    
        module.weekNumber = parsedWeekNumber;
        }
    
        if (session !== undefined) {
        if (!["a", "b", "c"].includes(session)) {
            return res.status(400).json({
            success: false,
            message: "Session must be a, b or c.",
            });
        }
    
        module.session = session;
        }
    
        if (video !== undefined) {
        module.video = video?.trim() || undefined;
        }
    
        if (text !== undefined) {
        module.text = text?.trim() || undefined;
        }
    
        if (resources !== undefined) {
        if (!Array.isArray(resources)) {
            return res.status(400).json({
            success: false,
            message: "Resources must be an array.",
            });
        }
    
        module.resources = resources;
        }
    
        if (quizzes !== undefined) {
        if (!Array.isArray(quizzes)) {
            return res.status(400).json({
            success: false,
            message: "Quizzes must be an array.",
            });
        }
    
        module.quizzes = quizzes;
        }
    
        if (assignment !== undefined) {
        module.assignment = assignment || undefined;
        }
    
        if (order !== undefined) {
        const parsedOrder = Number(order);
    
        if (!Number.isInteger(parsedOrder) || parsedOrder < 1) {
            return res.status(400).json({
            success: false,
            message: "Order must be a positive integer.",
            });
        }
    
        module.order = parsedOrder;
        }
    
        if (releaseDate !== undefined) {
        const parsedDate = new Date(releaseDate);
    
        if (Number.isNaN(parsedDate.getTime())) {
            return res.status(400).json({
            success: false,
            message: "Invalid release date.",
            });
        }
    
        module.releaseDate = parsedDate;
        }
    
        if (isPublished !== undefined) {
        module.isPublished = Boolean(isPublished);
        }
    
        const duplicate = await Module.findOne({
        _id: { $ne: module._id },
        cohort: module.cohort,
        weekNumber: module.weekNumber,
        session: module.session,
        });
    
        if (duplicate) {
        return res.status(409).json({
            success: false,
            message:
            "Another module already exists for this cohort, week and session.",
        });
        }
    
        await module.save();
    
        await module.populate([
        {
            path: "cohort",
            select: "title code status courses",
            populate: {
            path: "courses",
            select: "title slug",
            },
        },
        {
            path: "quizzes",
        },
        {
            path: "assignment",
        },
        {
            path: "createdBy",
            select: "fname lname email role",
        },
        ]);
    
        return res.status(200).json({
        success: true,
        message: "Module updated successfully.",
        data: module,
        });
    } catch (error) {
        console.error("Update Module Error:", error);
    
        return res.status(500).json({
        success: false,
        message: "Unable to update module.",
        });
    }
  };

  export const toggleModulePublish = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      await dbConnect();
  
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized.",
        });
      }
  
        const id = getParamId(req.params.id);
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid module ID.",
        });
      }
  
      const module = await Module.findById(id);
  
      if (!module) {
        return res.status(404).json({
          success: false,
          message: "Module not found.",
        });
      }
  
      module.isPublished = !module.isPublished;
  
      await module.save();
  
      return res.status(200).json({
        success: true,
        message: module.isPublished
          ? "Module published successfully."
          : "Module unpublished successfully.",
        data: module,
      });
    } catch (error) {
      console.error("Toggle Module Publish Error:", error);
  
      return res.status(500).json({
        success: false,
        message: "Unable to update module publication status.",
      });
    }
  };

  export const deleteModule = async (
    req: AuthRequest,
    res: Response
  ): Promise<Response> => {
    try {
      await dbConnect();
  
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized.",
        });
      }
  
      const id = getParamId(req.params.id);
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid module ID.",
        });
      }
        
        const module = await Module.findById(id);
        
        if (!module) {
          return res.status(404).json({
            success: false,
            message: "Module not found.",
          });  
        }
        
        await module.deleteOne();
        return res.status(200).json({
        success: true,
        message: "Module deleted successfully.",
      });
    } catch (error) {
      console.error("Delete Module Error:", error);
  
      return res.status(500).json({
        success: false,
        message: "Unable to delete module.",
      });
    }
  };