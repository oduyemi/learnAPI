import { Request, Response } from "express";
import slugify from "slugify";
import mongoose from "mongoose";
import Course from "../models/course.model";
import Category from "../models/category.model";
import { AuthRequest } from "../middlewares/auth.middleware";
import dbConnect from "../db";
import { validateUsersByRole } from "../middlewares/validation.middleware";
import Cohort from "../models/cohort.model";
import Enrollment from "../models/enrollment.model";
import { uploadBuffer } from "../utils/cloudinaryUpload";


export const createCourse = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    await dbConnect();
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const {
      title,
      desc,
      category,
      instructors,
      duration,
      hasCertificate,
      certificateTemplate,
      isGeneral,
    } = req.body;

    const cleanedTitle = title?.trim().replace(/\s+/g, " ");
    const cleanedDesc = desc?.trim().replace(/\s+/g, " ");
    const cleanedDuration = duration?.trim();

    if (
      !cleanedTitle ||
      !cleanedDesc ||
      !category ||
      !cleanedDuration
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description, category and duration are required.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Course thumbnail is required.",
      });
    }

    if (hasCertificate && !certificateTemplate?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Certificate template is required.",
      });
    }

    const existingCategory = await Category.findById(category);

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    const existingTitle = await Course.findOne({
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

    const slug = slugify(cleanedTitle, {
      lower: true,
      strict: true,
      trim: true,
    });

    const existingSlug = await Course.findOne({ slug });

    if (existingSlug) {
      return res.status(409).json({
        success: false,
        message: "A course with this slug already exists.",
      });
    }

    let instructorIds: mongoose.Types.ObjectId[] = [];

    if (Array.isArray(instructors) && instructors.length > 0) {
      const instructorUsers = await validateUsersByRole(
        instructors,
        "instructor"
      );

      if (!instructorUsers) {
        return res.status(400).json({
          success: false,
          message: "One or more instructors are invalid.",
        });
      }

      instructorIds = instructorUsers.map((user) => user._id);
    }

    // Upload thumbnail to Cloudinary
    const uploadedThumbnail = await uploadBuffer(req.file.buffer, {
      folder: "progrowing/courses",
      publicId: slug,
      overwrite: true,
    });

    const course = await Course.create({
      title: cleanedTitle,
      slug,
      desc: cleanedDesc,
      category,
      thumbnail: uploadedThumbnail.secure_url,
      instructors: instructorIds,
      duration: cleanedDuration,
      hasCertificate: hasCertificate ?? false,
      certificateTemplate:
        hasCertificate && certificateTemplate
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
  } catch (error) {
    console.error("Create Course Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create course.",
    });
  }
};


export const getCourses = async (req: Request, res: Response): Promise<Response> => {
  try {
    await dbConnect();
    const {page = "1", limit = "10", search, category, instructor, isGeneral} = req.query;
    const filter: Record<string, any> = {};
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
      Course.find(filter)
        .populate("category", "title slug")
        .populate("instructors", "fname lname email img")
        .populate("createdBy", "fname lname")
        .sort({ createdAt: -1 })
        .skip((currentPage - 1) * perPage)
        .limit(perPage),

      Course.countDocuments(filter),
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
  } catch (error) {
    console.error("Get Courses Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch courses.",
    });
  }
};


export const getGeneralCourses = async (req: Request, res: Response): Promise<Response> => {
    try {
        await dbConnect();
        const courses = await Course.find({isGeneral: true})
        .populate("category", "title slug")
        .populate("instructors", "fname lname email img")
        .sort({ title: 1 });
        return res.status(200).json({
        success: true,
        data: courses,
        });
    } catch (error) {
        console.error(error);
    
        return res.status(500).json({
        success: false,
        message: "Unable to fetch courses.",
        });
    }
};


export const getCoursesByCategory = async (req: Request, res: Response): Promise<Response> => {
    try {
        await dbConnect();
        const { categoryId } = req.params;
        const courses = await Course.find({
        category: categoryId,
        })
        .populate("category", "title slug")
        .populate("instructors", "fname lname email img")
        .sort({ title: 1 });
    
        return res.status(200).json({
        success: true,
        data: courses,
        });
    } catch (error) {
        console.error(error);
    
        return res.status(500).json({
        success: false,
        message: "Unable to fetch category courses.",
        });
    }
};


export const getCoursesByInstructor = async (req: Request, res: Response): Promise<Response> => {
    try {
        await dbConnect();
        const { userId } = req.params;
        const courses = await Course.find({
        instructors: userId,
        })
        .populate("category", "title slug")
        .populate("instructors", "fname lname email img")
        .sort({ title: 1 });
    
        return res.status(200).json({
        success: true,
        data: courses,
        });
    } catch (error) {
        console.error(error);
    
        return res.status(500).json({
        success: false,
        message: "Unable to fetch instructor courses.",
        });
    }
};


export const getCourse = async (req: Request, res: Response): Promise<Response> => {
    try {
        await dbConnect();
        const course = await Course.findById(req.params.id)
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
    } catch (error) {
        console.error(error);
    
        return res.status(500).json({
        success: false,
        message: "Unable to fetch course.",
        });
    }
};


export const updateCourse = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        await dbConnect();
        if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized.",
        });
        }
    
        const { id } = req.params;
        const course = await Course.findById(id);
        if (!course) {
        return res.status(404).json({
            success: false,
            message: "Course not found.",
        });
        }
    
        const {title, desc, category, thumbnail, instructors, duration, hasCertificate, certificateTemplate, isGeneral} = req.body;
        if (title !== undefined) {
        const cleanedTitle = title.trim().replace(/\s+/g, " ");   
        const existingTitle = await Course.findOne({
            _id: { $ne: course._id },
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
    
        const slug = slugify(cleanedTitle, {
            lower: true,
            strict: true,
            trim: true,
        });
        const existingSlug = await Course.findOne({
            _id: { $ne: course._id },
            slug,
        });
        if (existingSlug) {
            return res.status(409).json({
            success: false,
            message: "A course with this slug already exists.",
            });
        }
    
        course.title = cleanedTitle;
        course.slug = slug;
        }
        if (desc !== undefined) {
            course.desc = desc.trim().replace(/\s+/g, " ");
        }
    
        if (thumbnail !== undefined) {
            course.thumbnail = thumbnail.trim();
        }
    
        if (duration !== undefined) {
            course.duration = duration.trim();
        }
    
        if (category !== undefined) {
            const existingCategory = await Category.findById(category);
    
        if (!existingCategory) {
            return res.status(404).json({
            success: false,
            message: "Category not found.",
            });
        }
    
            course.category = category;
        }
    
        if (instructors !== undefined) {
        if (!Array.isArray(instructors)) {
            return res.status(400).json({
            success: false,
            message: "Instructors must be an array.",
            });
        }
    
            const instructorUsers = await validateUsersByRole(
                instructors,
                "instructor"
        );
    
        if (!instructorUsers) {
            return res.status(400).json({
            success: false,
            message: "One or more instructors are invalid.",
            });
        }
    
            course.instructors = instructorUsers.map(
            (user) => user._id
        );
        }
    
        if (hasCertificate !== undefined) {
            course.hasCertificate = hasCertificate;
    
        if (hasCertificate) {
            if (!certificateTemplate) {
            return res.status(400).json({
                success: false,
                message: "Certificate template is required.",
            });
            }
    
            course.certificateTemplate =
            certificateTemplate.trim();
        } else {
            course.certificateTemplate = undefined;
        }
        }
    
        if (isGeneral !== undefined) {
            course.isGeneral = isGeneral;
        }
    
        await course.save();
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
    
        return res.status(200).json({
        success: true,
        message: "Course updated successfully.",
        data: course,
        });
    } catch (error) {
        console.error("Update Course Error:", error);
    
        return res.status(500).json({
            success: false,
            message: "Unable to update course.",
        });
    }
};


export const deleteCourse = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        await dbConnect();
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized.",
            });
        }
    
        const { id } = req.params;
        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found.",
            });
        }
        
        const cohortCount = await Cohort.countDocuments({
            courses: id,
        });
        
        if (cohortCount > 0) {
            return res.status(400).json({
                success: false,
                message: "Course belongs to one or more cohorts.",
            });
        }
        
        const enrollmentCount = await Enrollment.countDocuments({
            course: id,
        });
        
        if (enrollmentCount > 0) {
            return res.status(400).json({
                success: false,
                message: "Course has enrolled students.",
            });
        }
    
        await course.deleteOne();
        return res.status(200).json({
            success: true,
            message: "Course deleted successfully.",
        });
    } catch (error) {
        console.error("Delete Course Error:", error);
    
        return res.status(500).json({
            success: false,
            message: "Unable to delete course.",
        });
    }
};


export const updateCourseThumbnail = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    await dbConnect();
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a thumbnail.",
      });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    const uploaded = await uploadBuffer(req.file.buffer, {
      folder: "progrowing/courses",
      publicId: course.slug,
      overwrite: true,
    });

    course.thumbnail = uploaded.secure_url;
    await course.save();

    return res.status(200).json({
      success: true,
      message: "Thumbnail updated successfully.",
      data: {
        _id: course._id,
        thumbnail: course.thumbnail,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Unable to upload thumbnail.",
    });
  }
};