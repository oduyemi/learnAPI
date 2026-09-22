import { Router } from "express";
import {
  submitAssignment,
  submitQuiz,
  getMySubmissions,
  getMySubmission,
  getSubmissions,
  getSubmissionById,
  gradeSubmission,
  updateSubmissionFeedback,
  deleteSubmission,
} from "../controllers/submission.controller";
import { authenticate, requireRole } from "../middlewares/auth.middleware";

const router = Router();

// STUDENT
router.post("/assignment/:assignmentId", authenticate, requireRole("student"), submitAssignment);
router.post("/quiz/:quizId",  authenticate, requireRole("student"), submitQuiz);
router.get("/my", authenticate, requireRole("student"), getMySubmissions);
router.get("/my/:id", authenticate, requireRole("student"), getMySubmission);


//  ADMIN / INSTRUCTOR / MENTOR
router.get(
  "/",
  authenticate,
  requireRole(
    "admin",
    "instructor",
    "mentor"
  ),
  getSubmissions
);

router.get(
  "/:id",
  authenticate,
  requireRole(
    "admin",
    "instructor",
    "mentor"
  ),
  getSubmissionById
);

router.patch(
  "/:id/grade",
  authenticate,
  requireRole(
    "admin",
    "instructor"
  ),
  gradeSubmission
);

router.patch(
  "/:id/feedback",
  authenticate,
  requireRole(
    "admin",
    "instructor"
  ),
  updateSubmissionFeedback
);

router.delete(
  "/:id",
  authenticate,
  requireRole("admin"),
  deleteSubmission
);

export default router;