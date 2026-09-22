import { Request, Response } from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User, { IUser } from "../models/user.model";
import Cohort from "../models/cohort.model";
import {generateTemporaryPassword} from "../utils/password";
import { sendAdminOnboardingMail, sendInstructorOnboardingMail, sendMentorOnboardingMail, sendOnboardingMail} from "../utils/sendEmail";
import { serializeUser } from "../utils/serializeUser";
import { AuthRequest } from "../middlewares/auth.middleware";
import Course from "../models/course.model";
import { HydratedDocument } from "mongoose";
import dbConnect from "../db";
import { uploadBuffer } from "../utils/cloudinaryUpload";


export interface RoleParams {
  role: string;
}


export const createUser = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    await dbConnect();
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only administrators can create users.",
      });
    }

    const {fname, lname, email, phone, role, cohort, img} = req.body;
    if (
      !fname?.trim() ||
      !lname?.trim() ||
      !email?.trim() ||
      !phone?.trim() ||
      !role
    ) {
      return res.status(400).json({
        success: false,
        message:
          "First name, last name, email, phone and role are required.",
      });
    }

    const validRoles = [
      "student",
      "mentor",
      "instructor",
      "admin",
    ] as const;

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid role. Role must be student, mentor, instructor or admin.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPhone = phone.trim();
    const exists = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { phone: normalizedPhone },
      ],
    });

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Email or phone number already exists.",
      });
    }

    if (role === "student" && !cohort) {
      return res.status(400).json({
        success: false,
        message: "Students must belong to a cohort.",
      });
    }

    if (cohort) {
      if (!mongoose.isValidObjectId(cohort)) {
        return res.status(400).json({
          success: false,
          message: "Invalid cohort ID.",
        });
      }

      const cohortExists = await Cohort.findById(cohort);
      if (!cohortExists) {
        return res.status(404).json({
          success: false,
          message: "Cohort not found.",
        });
      }
    }

    const temporaryPassword = generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
    const user = await User.create({
      fname: fname.trim(),
      lname: lname.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      role,
      cohort: cohort || null,
      img: img || undefined,
      password: hashedPassword,
      status: "active",
    });

    switch (role) {
      case "admin":
        await sendAdminOnboardingMail(
          user.email,
          temporaryPassword
        );
        break;

      case "instructor":
        await sendInstructorOnboardingMail(
          user.email,
          temporaryPassword
        );
        break;

      case "mentor":
        await sendMentorOnboardingMail(
          user.email,
          temporaryPassword
        );
        break;

      case "student":
        await sendOnboardingMail(
          user.email,
          temporaryPassword
        );
        break;
    }

    return res.status(201).json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully.`,
      user: serializeUser(user),
    });
  } catch (error) {
    console.error("Create User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create user.",
    });
  }
};


export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      await dbConnect();
      const {role, status, cohort, search, page = "1", limit = "20"} = req.query;
      const filter: any = {};
      if (role) {
        filter.role = role;
      }
  
      if (status) {
        filter.status = status;
      }
  
      if (cohort) {
        filter.cohort = cohort;
      }
  
      if (search) {
        filter.$or = [
          {
            fname: {
              $regex: search,
              $options: "i",
            },
          },
          {
            lname: {
              $regex: search,
              $options: "i",
            },
          },
          {
            email: {
              $regex: search,
              $options: "i",
            },
          },
          {
            phone: {
              $regex: search,
              $options: "i",
            },
          },
        ];
      }
      const currentPage = Number(page);
      const pageSize = Number(limit);
      const total = await User.countDocuments(filter);
      const users = await User.find(filter)
        .populate("cohort", "title code")
        .sort({
          createdAt: -1,
        })
        .skip((currentPage - 1) * pageSize)
        .limit(pageSize);
  
      res.status(200).json({
        success: true,
        total,
        page: currentPage,
        pages: Math.ceil(total / pageSize),
        count: users.length,
        users: users.map(serializeUser),
      });
      return;
    } catch (error) {
      console.error("Get Users Error:", error);
  
      res.status(500).json({
        success: false,
        message: "Failed to fetch users.",
      });
      return;
    }
  };


export const getUsersByRole = async (req: Request<RoleParams>, res: Response): Promise<void> => {
  try {
    await dbConnect();
    const { role } = req.params;
    const validRoles = ["student", "mentor", "instructor", "admin"];
    if (!validRoles.includes(role)) {
      res.status(400).json({
        success: false,
        message: "Invalid role.",
      });
      return;
    }

    const users = await User.find({ role })
      .populate("cohort", "title code")
      .sort({ fname: 1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users: users.map(serializeUser),
    });
  } catch (error) {
    console.error("Get Users By Role Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users.",
    });
    return;
  }
};

export const getStudentsByCohort = async (req: Request, res: Response): Promise<Response> => {
    try {
      await dbConnect();
      const { cohortId } = req.params;
      const students = await User.find({
        role: "student",
        cohort: cohortId,
        status: "active",
      })
        .populate("cohort", "title code")
        .sort({
          fname: 1,
        });
  
      return res.status(200).json({
        success: true,
        count: students.length,
        students: students.map(serializeUser),
      });
    } catch (error) {
      console.error("Get Students By Cohort Error:", error);
  
      return res.status(500).json({
        success: false,
        message: "Failed to fetch students.",
      });
    }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    await dbConnect();
    const { id } = req.params;
    const user = await User.findById(id).populate("cohort", "title code course");
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      user: serializeUser(user),
    });
  } catch (error) {
    console.error("Get User Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch user.",
    });
    return;
  }
};

export const getInstructorsByCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    await dbConnect();
    const { courseId } = req.params;
    const course = await Course.findById(courseId).populate({
      path: "instructors",
      select: "-password",
    });

    if (!course) {
      res.status(404).json({
        success: false,
        message: "Course not found.",
      });
      return;
    }

    const instructors = course.instructors as unknown as HydratedDocument<IUser>[];
    res.status(200).json({
      success: true,
      count: instructors.length,
      instructors: instructors.map(serializeUser),
    });
  } catch (error) {
    console.error("Get Course Instructors Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch instructors.",
    });
  }
};



export const updateProfilePicture = async (req: AuthRequest, res: Response): Promise<Response> => {
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
        message: "Please upload an image.",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const uploaded = await uploadBuffer(req.file.buffer, {
      folder: "progrowing/users",
    });
    user.img = uploaded.secure_url;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Profile picture updated successfully.",
      data: user,
    });
  } catch (error) {
    console.error("Update Profile Picture Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update profile picture.",
    });
  }
};