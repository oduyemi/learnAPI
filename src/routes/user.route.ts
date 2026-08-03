import { Router } from "express";
import { createUser, getInstructorsByCourse, getStudentsByCohort, getUser, getUsers, getUsersByRole, updateProfilePicture } from "../controllers/user.controller";
import { authenticate, requireRole } from "../middlewares/auth.middleware";
import {uploadProfileImage } from "../utils/cloudinaryStorage";


const router = Router();

router.post("/new", createUser);
router.get("/", authenticate, requireRole("admin"), getUsers);
router.get<{ role: string }>("/role/:role", authenticate, requireRole("admin"), getUsersByRole);
router.get("/student/cohort/:cohortId", authenticate, requireRole("admin"), getStudentsByCohort);
router.get("/user/:id", authenticate, requireRole("admin"), getUser);
router.get("/instructor/course/:courseId/instructors", authenticate, requireRole("admin"), getInstructorsByCourse);
router.patch("/profile-picture", authenticate, uploadProfileImage.single("image"), updateProfilePicture);


export default router;
