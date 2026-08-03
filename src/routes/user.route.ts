import { Router } from "express";
import { createUser, getInstructorsByCourse, getStudentsByCohort, getUser, getUsers, getUsersByRole } from "../controllers/user.controller";
import { authenticate, requireRole } from "../middlewares/auth.middleware";
import { validateRequestBody, validatePassword } from "../middlewares/validation.middleware";

const router = Router();

router.get("/", authenticate, requireRole("admin"), getUsers);
router.get<{ role: string }>("/role/:role", authenticate, requireRole("admin"), getUsersByRole);
router.get("/student/cohort/:cohortId", authenticate, requireRole("admin"), getStudentsByCohort);
router.get("/user/:id", authenticate, requireRole("admin"), getUser);
router.get("/instructor/course/:courseId/instructors", authenticate, requireRole("admin"), getInstructorsByCourse);
router.post("/new", createUser);



export default router;
