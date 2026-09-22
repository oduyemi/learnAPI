import { Router } from "express";
import {
  trackModuleProgress,
  getStudentProgress,
  getProgress,
  getModuleProgress,
  completeModule,
  updateQuizScore,
  updateAssignmentScore,
  getCohortProgress,
  resetProgress,
} from "../controllers/progress.controller";
import { authenticate, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authenticate, requireRole("admin", "student"), trackModuleProgress);
router.get("/student/:studentId", authenticate, requireRole("admin", "student", "mentor", "instructor"), getStudentProgress);
router.get("/cohort/:cohortId", authenticate, requireRole("admin", "mentor", "instructor"), getCohortProgress);
router.get("/module/:moduleId", authenticate, requireRole("admin", "mentor", "instructor"), getModuleProgress);
router.get("/:id", authenticate, requireRole("admin", "student", "mentor", "instructor"), getProgress);
router.patch("/:id/complete", authenticate, requireRole("admin", "student"), completeModule);
router.patch("/:id/quiz-score", authenticate, requireRole("admin", "instructor"), updateQuizScore);
router.patch("/:id/assignment-score", authenticate, requireRole("admin", "instructor"), updateAssignmentScore);
router.delete("/:id", authenticate, requireRole("admin"), resetProgress);

export default router;