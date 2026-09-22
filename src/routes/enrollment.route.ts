import { Router } from "express";
import {
  createEnrollment,
  getEnrollments,
  getEnrollment,
  getEnrollmentByCohort,
  getEnrollmentByStudent,
  addStudentsToEnrollment,
  removeStudentFromEnrollment,
  deleteEnrollment,
} from "../controllers/enrollment.controller";
import { authenticate, requireRole } from "../middlewares/auth.middleware";


const router = Router();

router.post("/", authenticate, requireRole("admin"), createEnrollment);
router.get("/", authenticate, requireRole("admin"), getEnrollments);
router.get("/cohort/:cohortId", authenticate, requireRole("admin", "instructor", "mentor"), getEnrollmentByCohort);
router.get("/student/:studentId", authenticate, requireRole("admin", "instructor", "mentor"), getEnrollmentByStudent);
router.get("/:id", authenticate, requireRole("admin"), getEnrollment);
router.patch("/:id/students", authenticate, requireRole("admin"), addStudentsToEnrollment);
router.delete("/:id/students/:studentId", authenticate, requireRole("admin"), removeStudentFromEnrollment);
router.delete("/:id", authenticate, requireRole("admin"), deleteEnrollment);

export default router;