import { Router } from "express";
import {
  createQuiz,
  getQuizzes,
  getQuiz,
  getQuizzesByModule,
  addQuestionsToQuiz,
  removeQuestionFromQuiz,
  updateQuiz,
  toggleQuizPublication,
  deleteQuiz,
} from "../controllers/quiz.controller";
import { authenticate, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authenticate, requireRole("admin", "instructor"), createQuiz);
router.get("/", authenticate, requireRole("admin", "instructor", "mentor", "student"), getQuizzes);
router.get("/module/:moduleId", authenticate,  requireRole("admin", "instructor", "mentor", "student"), getQuizzesByModule);
router.patch("/:id/questions", authenticate, requireRole("admin", "instructor"), addQuestionsToQuiz);
router.delete("/:id/questions/:questionId", authenticate, requireRole("admin", "instructor"), removeQuestionFromQuiz);
router.patch("/:id/publish", authenticate, requireRole("admin", "instructor"), toggleQuizPublication);
router.patch("/:id", authenticate, requireRole("admin", "instructor"), updateQuiz);
router.get("/:id",
  authenticate,  requireRole("admin", "instructor", "mentor", "student"), getQuiz);
router.delete("/:id", authenticate, requireRole("admin", "instructor"), deleteQuiz);

export default router;