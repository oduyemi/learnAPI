import { Router } from "express";

import {
  createUser,
  getUsers,
  getUsersByRole,
  getStudentsByCohort,
  getUser,
  getInstructorsByCourse,
  updateProfilePicture,
  RoleParams,
} from "../controllers/user.controller";
import {authenticate, requireRole} from "../middlewares/auth.middleware";
import { uploadProfileImage } from "../utils/cloudinaryStorage";

const router = Router();

router.post("/", authenticate, requireRole("admin"), createUser);
router.get("/", authenticate, requireRole("admin"), getUsers);
router.get<RoleParams>("/role/:role", getUsersByRole);
router.get("/cohort/:cohortId/students", authenticate, requireRole("admin", "instructor", "mentor"), getStudentsByCohort);
router.get("/:id", authenticate, requireRole("admin", "instructor", "mentor"), getUser);
router.get("/course/:courseId/instructors", authenticate, requireRole("admin", "instructor", "mentor", "student"), getInstructorsByCourse);
router.patch("/profile-picture", authenticate, uploadProfileImage.single("image"), updateProfilePicture);

export default router;