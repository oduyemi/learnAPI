import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { hash, compare } from "bcrypt";
import mongoose from "mongoose";
import Admin, { IAdmin } from "../models/adminModel";
import User, { IUser } from "../models/userModel";
import Review from "../models/reviewModel";
import Course from "../models/courseModel";
import Enrollment from "../models/enrollmentModel";
import Question from "../models/questionModel";
import Category from "../models/categoryModel";
import Module from "../models/moduleModel";
import Quiz from "../models/quizModel";
import Submission from "../models/submissionModel";



const router = express.Router();


require("dotenv").config();

interface UserSession {
    userID: mongoose.Types.ObjectId; 
    username: string;
    email: string;
    phone: string;
    dateOfBirth?: Date;
    img: string;
}

interface AdminSession {
    adminID: mongoose.Types.ObjectId; 
    fname: string;
    lname: string;
    email: string;
    phone: string;
}
  

declare module "express-session" {
    interface SessionData {
        user?: UserSession; 
        admin?: AdminSession; 
    }
}


router.post("/register", async (req: Request, res: Response) => {
    try {
        const { username, email, phone, password, cpwd, dateOfBirth, img } = req.body;
        if (![username, email, phone, password, cpwd, dateOfBirth, img].every(field => field)) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password !== cpwd) {
            return res.status(400).json({ message: "Both passwords must match" });
        }

        const existingUserByEmail = await User.findOne({ email });
        if (existingUserByEmail) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const existingUserByUsername = await User.findOne({ username });
        if (existingUserByUsername) {
            return res.status(400).json({ message: "Username not available" });
        }

        const hashedPassword = await hash(password, 10);

        const newUser: IUser = new User({ username, email, phone, password: hashedPassword, dateOfBirth, img });

        await newUser.save();

        const token = jwt.sign(
            {
                userID: newUser._id,
                email: newUser.email,
                username: newUser.username
            },
            process.env.JWT_SECRET!
        );

        const userSession: UserSession = {
            userID: newUser._id,
            username,
            email,
            phone,
            img
        };
        req.session.user = userSession;

        return res.status(201).json({
            message: "User registered successfully",
            token,
            nextStep: "/next-login-page"
        });
    } catch (error) {
        console.error("Error during user registration:", error);
        return res.status(500).json({ message: "Error registering user" });
    }
});


   
router.post("/login", async (req, res) => {
    try {
        const { email, username, password } = req.body;
        if ((!email && !username) || !password) {
            return res.status(400).json({ message: "Email/Username and password are required" });
        }

        let user: IUser | null = null;
        if (email) {
            user = await User.findOne({ email });
        }

        if (!user && username) {
            user = await User.findOne({ username });
        }

        if (!user) {
            return res.status(401).json({ message: "Invalid email/username or password" });
        }

        const isPasswordMatch = await compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(401).json({ message: "Invalid email/username or password" });
        }

        const token = jwt.sign(
            {
                userID: user._id,
                email: user.email
            },
            process.env.JWT_SECRET || "default_secret",
        );

        const userSession = {
            userID: user._id,
            username: user.username,
            email: user.email,
            phone: user.phone,
            img: user.img
        };

        req.session.user = userSession;

        return res.status(200).json({
            message: "User login successful!.",
            nextStep: "/next-dashboard",
            token,
        });
    } catch (error) {
        console.error("Error during user login:", error);
        return res.status(500).json({ message: "Error logging in user" });
    }
});


router.post("/admin/register", async (req: Request, res: Response) => {
    try {
        const { fname, lname, email, phone, password, cpwd } = req.body;
        if (![fname, lname, email, phone, password, cpwd].every((field) => field)) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password !== cpwd) {
            return res.status(400).json({ message: "Both passwords must match!" });
        }

        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const hashedPassword = await hash(password, 10);
        const newAdmin: IAdmin = new Admin({ fname, lname, email, phone, password: hashedPassword }) as IAdmin;
        await newAdmin.save();

        // Access token
        const token = jwt.sign(
            {
                adminID: newAdmin._id, 
                email: newAdmin.email
            },
            process.env.JWT_SECRET!,
        );

        const adminSession: AdminSession = {
            adminID: newAdmin._id,
            fname,
            lname,
            email,
            phone
        };
        req.session.admin = adminSession;

        return res.status(201).json({
            message: "Admin registered successfully.",
            token,
            nextStep: "/next-admin-login-page",
        });
    } catch (error) {
        console.error("Error during admin registration:", error);
        return res.status(500).json({ message: "Error registering admin" });
    }
});


   
router.post("/admin/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        try {
            const admin: IAdmin | null = await Admin.findOne({ email });
            if (!admin) {
                return res.status(401).json({ message: "Email not registered. Please register first." });
            }

            const isPasswordMatch = await compare(password, admin.password);

            if (!isPasswordMatch) {
                return res.status(401).json({ message: "Incorrect email or password" });
            }

            const token = jwt.sign(
                {
                    adminID: admin._id,
                    email: admin.email
                },
                process.env.JWT_SECRET || "default_secret",
            );

            const adminSession = {
                adminID: admin._id,
                fname: admin.fname,
                lname: admin.lname,
                email: admin.email,
                phone: admin.phone,
            };

            req.session.admin = adminSession;

            return res.status(200).json({
                message: "Admin login successful!.",
                nextStep: "/next-admin-dashboard",
                token,
            });
        } catch (error) {
            console.error("Error during admin login:", error);
            return res.status(500).json({ message: "Error logging in admin" });
        }
    } catch (error) {
        console.error("Error during admin login:", error);
        return res.status(500).json({ message: "Error logging in admin" });
    }
});

router.post("/course", async (req: Request, res: Response) => {
    try {
        const { title, desc, instructor, duration, level, category, img } = req.body;
        if (![title, desc, instructor, duration, level, category, img].every(field => field)) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newCourse = new Course({ title, desc, instructor, duration, level, category, img });
        await newCourse.save();

        return res.status(201).json({ message: "Course created successfully" });
    } catch (error) {
        console.error("Error during course creation:", error);
        return res.status(500).json({ message: "Error creating course" });
    }
});


router.post("/category", async (req: Request, res: Response) => {
    try {
        const { title, desc } = req.body;
        if (![title, desc].every(field => field)) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newCategory = new Category({ title, desc });

        await newCategory.save();

        return res.status(201).json({ message: "Category created successfully" });
    } catch (error) {
        console.error("Error during category creation:", error);
        return res.status(500).json({ message: "Error creating category" });
    }
});



router.post("/review", async (req: Request, res: Response) => {
    try {
        const { userID, courseID, reviewComment, rating } = req.body;
        if (![userID, courseID, reviewComment, rating].every(field => field)) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newReview = new Review({ userID, courseID, reviewComment, rating });

        await newReview.save();

        return res.status(201).json({ message: "Review submitted successfully" });
    } catch (error) {
        console.error("Error during review submission:", error);
        return res.status(500).json({ message: "Error submitting review" });
    }
});


router.post("/quiz", async (req: Request, res: Response) => {
    try {
        const { questions } = req.body;
        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ message: "At least one question is required" });
        }

        const newQuiz = new Quiz({ questions });

        await newQuiz.save();

        return res.status(201).json({ message: "Quiz created successfully" });
    } catch (error) {
        console.error("Error during quiz creation:", error);
        return res.status(500).json({ message: "Error creating quiz" });
    }
});


router.post("/question", async (req: Request, res: Response) => {
    try {
        const { questionText, options, correctAnswer, difficultyLevel, courseID, category } = req.body;
        if (![questionText, options, correctAnswer, difficultyLevel, courseID, category].every(field => field)) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (!Array.isArray(options) || options.length !== 4) {
            return res.status(400).json({ message: "Exactly four options (A, B, C, D) are required" });
        }

        for (const option of options) {
            if (typeof option !== 'string') {
                return res.status(400).json({ message: "Options must be strings" });
            }
        }

        const newQuestion = new Question({ questionText, options, correctAnswer, difficultyLevel, courseID, category });
        await newQuestion.save();

        return res.status(201).json({ message: "Question added successfully" });
    } catch (error) {
        console.error("Error adding question:", error);
        return res.status(500).json({ message: "Error adding question" });
    }
});



router.post("/module", async (req: Request, res: Response) => {
    try {
        const { title, desc, text, video, quiz, order } = req.body;
        if (![title, desc, text, video, quiz, order].every(field => field)) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newModule = new Module({ title, desc, text, video, quiz, order });

        await newModule.save();

        return res.status(201).json({ message: "Module created successfully" });
    } catch (error) {
        console.error("Error during module creation:", error);
        return res.status(500).json({ message: "Error creating module" });
    }
});


router.post("/enrollment", async (req: Request, res: Response) => {
    try {
        const { userID, courseID, status } = req.body;
        if (![userID, courseID, status].every(field => field)) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newEnrollment = new Enrollment({ userID, courseID, status });
        await newEnrollment.save();

        return res.status(201).json({ message: "Enrollment created successfully" });
    } catch (error) {
        console.error("Error during enrollment creation:", error);
        return res.status(500).json({ message: "Error creating enrollment" });
    }
});



router.post("/submission", async (req: Request, res: Response) => {
    try {
        const { userId, quizId, answers, score } = req.body;
        if (![userId, quizId, answers].every(field => field)) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newSubmission = new Submission({ userId, quizId, answers, score });
        await newSubmission.save();

        return res.status(201).json({ message: "Submission created successfully" });
    } catch (error) {
        console.error("Error during submission creation:", error);
        return res.status(500).json({ message: "Error creating submission" });
    }
});






export default router;