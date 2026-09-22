import { Router } from "express";
import { createQuestion } from "../controllers/question.controller";
import { authenticate, requireRole } from "../middlewares/auth.middleware";


const router = Router();

router.post("/", authenticate, requireRole("admin", "instructor"), createQuestion);

export default router;