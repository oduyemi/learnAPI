import { Router } from "express";
import {
  createAssignment,
  getAssignments,
  getAssignment,
  getAssignmentsByModule,
  updateAssignment,
  deleteAssignment,
} from "../controllers/assignment.controller";
import { authenticate, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authenticate, requireRole("admin", "instructor"), createAssignment);
router.get("/", authenticate, requireRole("admin", "instructor", "mentor"), getAssignments);
router.get("/module/:moduleId", authenticate, requireRole("admin", "instructor", "mentor"), getAssignmentsByModule);
router.get("/:id", authenticate, requireRole("admin", "instructor", "mentor"), getAssignment);
router.patch("/:id", authenticate, requireRole("admin", "instructor"), updateAssignment);
router.delete("/:id", authenticate, requireRole("admin", "instructor"), deleteAssignment);

export default router;