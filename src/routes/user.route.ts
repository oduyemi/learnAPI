import { Router } from "express";
import { createUser, getInstructorsByCourse, getStudentsByCohort, getUser, getUsers, getUsersByRole } from "../controllers/user.controller";
import { authenticate, requireRole } from "../middlewares/auth.middleware";
import { validateRequestBody, validatePassword } from "../middlewares/validation.middleware";

const router = Router();

router.get("/", authenticate, requireRole("admin"), getUsers);
router.get<{ role: string }>("/role/:role", authenticate, requireRole("admin"), getUsersByRole);
router.get("/cohort/:cohortId", authenticate, requireRole("admin"), getStudentsByCohort);
router.get("/:id", authenticate, requireRole("admin"), getUser);
router.get("/course/:courseId/instructors", authenticate, requireRole("admin"), getInstructorsByCourse);
router.post("/new", 
    validateRequestBody(["fname", "lname", "email", "phone", "role"]), 
    validatePassword,
    createUser
  );

export default router;
