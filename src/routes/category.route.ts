import { Router } from "express";
import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller";
import { authenticate, requireRole } from "../middlewares/auth.middleware";

const router = Router();


router.post("/", authenticate, requireRole("admin"), createCategory);
router.get("/", authenticate, getCategories);
router.get("/:id", authenticate, getCategory);
router.patch("/:id", authenticate, requireRole("admin"), updateCategory);
router.delete("/:id", authenticate, requireRole("admin"), deleteCategory);

export default router;