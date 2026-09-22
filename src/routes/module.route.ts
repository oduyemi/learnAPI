import { Router } from "express";
import {
  createModule,
  getModules,
  getModule,
  getModulesByCohort,
  updateModule,
  toggleModulePublish,
  deleteModule,
} from "../controllers/module.controller";
import { authenticate, requireRole } from "../middlewares/auth.middleware";


const router = Router();


router.post("/", authenticate, requireRole("admin", "instructor"), createModule);
router.get("/", authenticate, requireRole("admin"), getModules);
router.get("/cohort/:cohortId", authenticate, getModulesByCohort);
router.get("/:id", authenticate, requireRole("admin", "instructor", "mentor"), getModule);
router.patch("/:id", authenticate, requireRole("admin", "instructor"), updateModule);
router.patch("/:id/publish", authenticate, requireRole("admin", "instructor"), toggleModulePublish);
router.delete("/:id", authenticate, requireRole("admin", "instructor"), deleteModule);

export default router;