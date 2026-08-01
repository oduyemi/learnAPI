import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User, { IUser } from "../models/user.model";
import Cohort from "../models/cohort.model";
import {generateTemporaryPassword} from "../utils/password";
import { sendAdminOnboardingMail, sendInstructorOnboardingMail, sendMentorOnboardingMail, sendOnboardingMail} from "../utils/sendEmail";
import { serializeUser } from "../utils/serializeUser";
import { AuthRequest } from "../middlewares/auth.middleware";
import Course from "../models/course.model";
import { HydratedDocument } from "mongoose";

interface RoleParams {
  role: string;
}


export const createUser = async (req: AuthRequest, res: Response) => {
    try{
        const {fname, lname, email, phone, role, cohort, img} = req.body;
        if(!fname|| !lname|| !email|| !phone|| !role){
            res.status(400).json({
                success:false,
                message:"Missing required fields."
            });
            return;
        }
        
        const exists=await User.findOne({$or:[{email}, {phone}]});
        if(exists){
            res.status(409).json({
                success:false,
                message:"Email or phone already exists."
            });
        }
        
        if(role==="student" && !cohort){
            res.status(400).json({
            success:false,
            message:"Students must belong to a cohort."
            });
            return;
        }
        
        if(cohort){
            const cohortExists=await Cohort.findById(cohort);
        
            if(!cohortExists){
                res.status(404).json({
                    success:false,
                    message:"Cohort not found."
                });
                return;
            }
        }
        
        const temporaryPassword = generateTemporaryPassword();
        const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
        const user= await User.create({
            fname,
            lname,
            email:email.toLowerCase(),
            phone,
            role,
            cohort:cohort||null,
            img,
            password:hashedPassword
        });
        switch(role){
            case "admin":
                await sendAdminOnboardingMail(
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
        
            case "instructor":
                await sendInstructorOnboardingMail(
                    user.email,
                    temporaryPassword
                );
            break;
            default:
                await sendOnboardingMail(
                user.email,
                temporaryPassword
                );
            }
        
        res.status(201).json({
            success:true,
            message:"User created successfully.",
            user:serializeUser(user)
        });
        
        }catch(error){
            console.error(error);
            res.status(500).json({
                success:false,
                message:"Internal server error."
        });
        return;
    }

};


export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        role,
        status,
        cohort,
        search,
        page = "1",
        limit = "20",
      } = req.query;
  
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


interface RoleParams {
  role: string;
}

export const getUsersByRole = async (req: Request<RoleParams>, res: Response): Promise<void> => {
  try {
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
